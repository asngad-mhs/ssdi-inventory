import { 
  db, 
  auth, 
  handleFirestoreError, 
  OperationType 
} from '../lib/firebase';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  Timestamp, 
  writeBatch,
  increment,
  getDoc
} from 'firebase/firestore';

export interface Product {
  id?: string;
  sku: string;
  name: string;
  description?: string;
  categoryId: string;
  warehouseId: string;
  stock: number;
  lowStockThreshold: number;
  unit: string;
  price: number;
  lastUpdated: any;
}

export interface Transaction {
  id?: string;
  productId: string;
  type: 'IN' | 'OUT' | 'ADJUST';
  quantity: number;
  warehouseId: string;
  userId: string;
  timestamp: any;
  note?: string;
}

const PRODUCTS_COL = 'products';
const TRANSACTIONS_COL = 'transactions';
const WAREHOUSES_COL = 'warehouses';
const CATEGORIES_COL = 'categories';

export const InventoryService = {
  // Products
  getProducts: (callback: (products: Product[]) => void) => {
    const q = query(collection(db, PRODUCTS_COL), orderBy('name'));
    return onSnapshot(q, (snapshot) => {
      const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
      callback(products);
    }, (error) => handleFirestoreError(error, OperationType.LIST, PRODUCTS_COL));
  },

  addProduct: async (product: Omit<Product, 'id'>) => {
    try {
      return await addDoc(collection(db, PRODUCTS_COL), {
        ...product,
        lastUpdated: Timestamp.now()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, PRODUCTS_COL);
    }
  },

  // Stock Movement with Transaction Log
  recordMovement: async (
    productId: string, 
    type: 'IN' | 'OUT' | 'ADJUST', 
    quantity: number, 
    warehouseId: string, 
    note?: string
  ) => {
    const batch = writeBatch(db);
    const productRef = doc(db, PRODUCTS_COL, productId);
    const txRef = doc(collection(db, TRANSACTIONS_COL));

    const stockChange = type === 'OUT' ? -quantity : quantity;
    
    // Safety check needed here potentially, but for now simple increment
    batch.update(productRef, {
      stock: increment(stockChange),
      lastUpdated: Timestamp.now()
    });

    batch.set(txRef, {
      productId,
      type,
      quantity,
      warehouseId,
      userId: auth.currentUser?.uid,
      timestamp: Timestamp.now(),
      note: note || ''
    });

    try {
      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'batch-movement');
    }
  },

  // Reports
  getDailyTransactions: async (date: Date) => {
    const startOfDay = new Date(date.setHours(0,0,0,0));
    const endOfDay = new Date(date.setHours(23,59,59,999));
    
    const q = query(
      collection(db, TRANSACTIONS_COL),
      where('timestamp', '>=', Timestamp.fromDate(startOfDay)),
      where('timestamp', '<=', Timestamp.fromDate(endOfDay)),
      orderBy('timestamp', 'desc')
    );

    try {
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, TRANSACTIONS_COL);
    }
  }
};
