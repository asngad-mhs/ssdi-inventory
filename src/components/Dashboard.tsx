import { useState, useEffect, useRef } from 'react';
import { 
  Package, 
  TrendingUp, 
  AlertTriangle, 
  ArrowUpRight, 
  ArrowDownLeft,
  Search,
  Plus,
  Filter,
  MoreVertical,
  LogOut,
  LayoutDashboard,
  Boxes,
  History,
  Settings,
  Bell,
  X,
  Scan,
  Download,
  Check,
  AlertCircle
} from 'lucide-react';
import { InventoryService, Product } from '../services/inventoryService';
import { logout } from '../lib/firebase';
import { motion, AnimatePresence } from 'motion/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import QrScanner from 'react-qr-scanner';
import Papa from 'papaparse';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

// Recharts data...
const chartData = [
  { name: 'Sen', in: 400, out: 240 },
  { name: 'Sel', in: 300, out: 139 },
  { name: 'Rab', in: 200, out: 980 },
  { name: 'Kam', in: 278, out: 390 },
  { name: 'Jum', in: 189, out: 480 },
  { name: 'Sab', in: 239, out: 380 },
  { name: 'Min', in: 349, out: 430 },
];

export const Dashboard = ({ user, userData }: { user: any, userData: any }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const unsub = InventoryService.getProducts(setProducts);
    return () => unsub();
  }, []);

  const lowStock = products.filter(p => p.stock <= p.lowStockThreshold);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-full z-20">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Package className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-bold text-gray-900">SSDI<span className="text-blue-600">Inv</span></span>
          </div>

          <nav className="space-y-1">
            {[
              { id: 'overview', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
              { id: 'inventory', icon: <Boxes size={20} />, label: 'Inventaris' },
              { id: 'history', icon: <History size={20} />, label: 'Riwayat' },
              { id: 'settings', icon: <Settings size={20} />, label: 'Pengaturan' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  activeTab === item.id 
                    ? 'bg-blue-50 text-blue-600' 
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
              {userData?.name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 truncate">{userData?.name}</p>
              <p className="text-xs text-gray-500 capitalize">{userData?.role}</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all font-bold"
          >
            <LogOut size={20} />
            Keluar
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-gray-50 relative">
        <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-200 z-10 px-8 py-4 flex justify-between items-center">
            <h1 className="text-xl font-bold text-gray-900 capitalize">{activeTab === 'overview' ? 'Ringkasan Bisnis' : activeTab}</h1>
            <div className="flex items-center gap-4">
               <div className="relative group">
                  <Bell className="text-gray-400 group-hover:text-blue-600 cursor-pointer transition-colors" />
                  {lowStock.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                      {lowStock.length}
                    </span>
                  )}
               </div>
               <div className="h-8 w-[1px] bg-gray-200"></div>
               <span className="text-sm font-medium text-gray-500">{new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
            </div>
        </header>

        <div className="p-8">
           {activeTab === 'overview' && (
             <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                 {[
                   { label: 'Total Produk', value: products.length, icon: <Package />, color: 'blue' },
                   { label: 'Total Stok', value: products.reduce((acc, p) => acc + p.stock, 0), icon: <Boxes />, color: 'indigo' },
                   { label: 'Stok Menipis', value: lowStock.length, icon: <AlertTriangle />, color: 'amber', warning: lowStock.length > 0 },
                   { label: 'Transaksi Hari Ini', value: 24, icon: <TrendingUp />, color: 'emerald' },
                 ].map((stat, i) => (
                   <div key={i} className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
                      <div className={`w-12 h-12 rounded-2xl mb-4 flex items-center justify-center ${
                        stat.warning ? 'bg-red-50 text-red-600' : 'bg-gray-50 text-gray-600'
                      }`}>
                         {stat.icon}
                      </div>
                      <p className="text-sm font-medium text-gray-500 mb-1">{stat.label}</p>
                      <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
                   </div>
                 ))}
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 bg-white p-8 rounded-[2rem] border border-gray-200 shadow-sm">
                     <div className="flex justify-between items-center mb-8">
                        <h3 className="font-bold text-gray-900">Tren Stok Barang</h3>
                     </div>
                     <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                           <AreaChart data={chartData}>
                              <defs>
                                <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                              <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                              <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                              <Area type="monotone" dataKey="in" stroke="#2563eb" fillOpacity={1} fill="url(#colorIn)" strokeWidth={3} />
                              <Area type="monotone" dataKey="out" stroke="#4f46e5" fillOpacity={0} strokeWidth={3} strokeDasharray="5 5" />
                           </AreaChart>
                        </ResponsiveContainer>
                     </div>
                  </div>

                  <div className="bg-white p-8 rounded-[2rem] border border-gray-200 shadow-sm">
                     <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <AlertTriangle className="text-amber-500" size={20} />
                        Stok Segera Habis
                     </h3>
                     <div className="space-y-4">
                        {lowStock.length > 0 ? lowStock.slice(0, 5).map(p => (
                          <div key={p.id} className="flex items-center justify-between p-4 bg-amber-50 rounded-2xl border border-amber-100">
                             <div>
                                <p className="text-sm font-bold text-gray-900">{p.name}</p>
                                <p className="text-xs text-amber-600 font-medium">{p.stock} {p.unit} tersisa</p>
                             </div>
                             <button className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-amber-600 hover:bg-amber-100 transition-colors">
                                <Plus size={16} />
                             </button>
                          </div>
                        )) : (
                          <div className="text-center py-12">
                             <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Check />
                             </div>
                             <p className="text-sm font-medium text-gray-500">Stok aman terkendali</p>
                          </div>
                        )}
                     </div>
                  </div>
               </div>
             </motion.div>
           )}

           {activeTab === 'inventory' && (
              <InventoryManager products={products} />
           )}

           {activeTab === 'history' && (
              <TransactionHistory />
           )}
        </div>
      </main>
    </div>
  );
};

const TransactionHistory = () => {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            const data = await InventoryService.getDailyTransactions(new Date());
            setTransactions(data || []);
            setLoading(false);
        };
        fetch();
    }, []);

    return (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Aktivitas Stok Hari Ini</h2>
            <div className="bg-white rounded-[2rem] border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Tipe</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Produk ID</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Jumlah</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Waktu</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Catatan</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {transactions.length > 0 ? transactions.map((t) => (
                                <tr key={t.id}>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-[10px] font-bold ${
                                            t.type === 'IN' ? 'bg-green-100 text-green-600' : 
                                            t.type === 'OUT' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                                        }`}>{t.type}</span>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium text-gray-600">{t.productId}</td>
                                    <td className="px-6 py-4 text-center text-sm font-bold">{t.quantity}</td>
                                    <td className="px-6 py-4 text-xs text-gray-400">{t.timestamp.toDate().toLocaleTimeString()}</td>
                                    <td className="px-6 py-4 text-xs text-gray-500 italic">{t.note || '-'}</td>
                                </tr>
                            )) : (
                                <tr>
                                   <td colSpan={5} className="text-center py-20 text-gray-400 font-medium">Belum ada aktivitas hari ini.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </motion.div>
    );
};

const InventoryManager = ({ products }: { products: Product[] }) => {
    const [search, setSearch] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [moveType, setMoveType] = useState<'IN' | 'OUT'>('IN');
    const [moveQuantity, setMoveQuantity] = useState(0);
    const [moveNote, setMoveNote] = useState('');
    
    const [isScannerOpen, setIsScannerOpen] = useState(false);
    const [scannedResult, setScannedResult] = useState('');
    
    const [newProduct, setNewProduct] = useState<Omit<Product, 'id' | 'lastUpdated'>>({
      sku: '',
      name: '',
      description: '',
      categoryId: '',
      warehouseId: 'default',
      stock: 0,
      lowStockThreshold: 5,
      unit: 'Pcs',
      price: 0
    });

    const handleAddProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await InventoryService.addProduct(newProduct as any);
            setIsAddModalOpen(false);
            setNewProduct({
              sku: '', name: '', description: '', categoryId: '', warehouseId: 'default',
              stock: 0, lowStockThreshold: 5, unit: 'Pcs', price: 0
            });
        } catch (err) {
            alert("Gagal menambah produk. Pastikan admin telah mengatur akses.");
        }
    };

    const handleRecordMovement = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProduct?.id) return;
        try {
            await InventoryService.recordMovement(
                selectedProduct.id, 
                moveType, 
                moveQuantity, 
                selectedProduct.warehouseId, 
                moveNote
            );
            setIsMoveModalOpen(false);
            setMoveQuantity(0);
            setMoveNote('');
        } catch (err) {
            alert("Gagal mencatat transaksi.");
        }
    };

    const handleScan = (data: any) => {
      if (data) {
        setScannedResult(data.text);
        setNewProduct(prev => ({ ...prev, sku: data.text }));
        setIsScannerOpen(false);
      }
    };

    const handleError = (err: any) => {
      console.error(err);
    };

    const exportToCSV = () => {
        const csv = Papa.unparse(products);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.setAttribute("download", `SSDI_Inventory_${new Date().toISOString()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const exportToPDF = () => {
        const doc = new (jsPDF as any)();
        doc.text("Laporan Stok Inventaris SSDI", 14, 15);
        (doc as any).autoTable({
            head: [['Nama', 'SKU', 'Stok', 'Unit']],
            body: products.map(p => [p.name, p.sku, p.stock, p.unit]),
            startY: 20
        });
        doc.save(`SSDI_Inventory_${new Date().toISOString()}.pdf`);
    };

    const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase()));

    return (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                <div className="relative w-full md:w-96 group">
                   <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                   <input 
                      type="text" 
                      placeholder="Cari nama barang atau SKU..." 
                      className="w-full bg-white border border-gray-200 rounded-2xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                   />
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                   <div className="relative group/export">
                      <button className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all">
                        <Download size={18} /> Ekspor
                      </button>
                      <div className="absolute top-full right-0 mt-2 w-40 bg-white border border-gray-200 rounded-xl shadow-xl opacity-0 invisible group-hover/export:opacity-100 group-hover/export:visible transition-all z-20 overflow-hidden">
                         <button onClick={exportToCSV} className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 font-medium">Format CSV</button>
                         <button onClick={exportToPDF} className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 font-medium">Format PDF</button>
                      </div>
                   </div>
                   <button 
                      onClick={() => setIsAddModalOpen(true)}
                      className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl text-sm font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all"
                   >
                      <Plus size={18} /> Tambah Barang
                   </button>
                </div>
            </div>

            <div className="bg-white rounded-[2rem] border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100 uppercase">
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 tracking-widest">Info Produk</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 tracking-widest">SKU</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 tracking-widest text-center">Stok</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 tracking-widest">Update Terakhir</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 tracking-widest text-right">Opsi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filtered.length > 0 ? filtered.map((p) => (
                                <tr key={p.id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-6 py-5">
                                        <div>
                                            <p className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{p.name}</p>
                                            <p className="text-xs text-gray-500">{p.categoryId || 'Tanpa Kategori'}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-[10px] font-bold font-mono">{p.sku}</span>
                                    </td>
                                    <td className="px-6 py-5 text-center">
                                        <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${
                                            p.stock <= p.lowStockThreshold ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                                        }`}>
                                            {p.stock} {p.unit}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <p className="text-xs text-gray-400 font-medium italic">
                                            {p.lastUpdated?.toDate().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <div className="flex justify-end gap-2">
                                           <button 
                                              onClick={() => { setSelectedProduct(p); setMoveType('IN'); setIsMoveModalOpen(true); }}
                                              className="p-2 text-green-600 hover:bg-green-50 rounded-xl transition-colors" title="Catat Stok Masuk"
                                           >
                                              <ArrowDownLeft size={18} />
                                           </button>
                                           <button 
                                              onClick={() => { setSelectedProduct(p); setMoveType('OUT'); setIsMoveModalOpen(true); }}
                                              className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors" title="Catat Stok Keluar"
                                           >
                                              <ArrowUpRight size={18} />
                                           </button>
                                        </div>
                                    </td>
                                 </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center">
                                       <Package className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                                       <p className="text-gray-400 font-medium">Barang tidak ditemukan.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Movement Modal */}
            <AnimatePresence>
              {isMoveModalOpen && selectedProduct && (
                 <div className="fixed inset-0 z-[65] flex items-center justify-center p-4">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsMoveModalOpen(false)} className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" />
                    <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden">
                       <div className="p-8 pb-4 flex justify-between items-center border-b border-gray-100">
                          <h2 className="text-xl font-bold text-gray-900">Catat Stok {moveType === 'IN' ? 'Masuk' : 'Keluar'}</h2>
                          <button onClick={() => setIsMoveModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={20} /></button>
                       </div>
                       <form onSubmit={handleRecordMovement} className="p-8 space-y-4">
                          <div className="bg-gray-50 p-4 rounded-2xl mb-4">
                             <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Produk</p>
                             <p className="text-sm font-bold text-gray-900">{selectedProduct.name}</p>
                             <p className="text-xs text-gray-500">Stok Saat Ini: {selectedProduct.stock} {selectedProduct.unit}</p>
                          </div>
                          <div className="space-y-1">
                             <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Jumlah {moveType === 'IN' ? 'Ditambah' : 'Dikurangi'}</label>
                             <input 
                                required type="number" min="1"
                                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none"
                                value={moveQuantity} onChange={e => setMoveQuantity(parseInt(e.target.value))}
                             />
                          </div>
                          <div className="space-y-1">
                             <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Catatan (Opsional)</label>
                             <textarea 
                                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none h-20 resize-none"
                                value={moveNote} onChange={e => setMoveNote(e.target.value)}
                                placeholder="Alasan perubahan stok..."
                             />
                          </div>
                          <button className={`w-full py-4 rounded-2xl font-bold mt-4 shadow-xl active:scale-[0.98] transition-all ${
                             moveType === 'IN' ? 'bg-green-600 text-white shadow-green-600/20 hover:bg-green-700' : 'bg-red-600 text-white shadow-red-600/20 hover:bg-red-700'
                          }`}>
                             Konfirmasi {moveType === 'IN' ? 'Tambah' : 'Kurangi'} Stok
                          </button>
                       </form>
                    </motion.div>
                 </div>
              )}
            </AnimatePresence>

            {/* Add Product Modal */}
            <AnimatePresence>
              {isAddModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                   <motion.div 
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      onClick={() => setIsAddModalOpen(false)}
                      className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" 
                   />
                   <motion.div 
                      initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                      className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden"
                   >
                      <div className="p-8 pb-4 flex justify-between items-center border-b border-gray-100">
                         <h2 className="text-xl font-bold text-gray-900">Tambah Barang Baru</h2>
                         <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={20} /></button>
                      </div>
                      <form onSubmit={handleAddProduct} className="p-8 space-y-4">
                         <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1 col-span-2">
                               <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Nama Barang</label>
                               <input 
                                  required type="text" placeholder="Contoh: Pensil 2B"
                                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 focus:outline-none transition-all"
                                  value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                               />
                            </div>
                            <div className="space-y-1">
                               <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex justify-between">
                                  SKU / Barcode
                                  <button type="button" onClick={() => setIsScannerOpen(true)} className="text-blue-600 hover:underline">Scan</button>
                               </label>
                               <input 
                                  required type="text" placeholder="P001"
                                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 focus:outline-none transition-all"
                                  value={newProduct.sku} onChange={e => setNewProduct({...newProduct, sku: e.target.value})}
                               />
                            </div>
                            <div className="space-y-1">
                               <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Unit</label>
                               <select 
                                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none"
                                  value={newProduct.unit} onChange={e => setNewProduct({...newProduct, unit: e.target.value})}
                               >
                                  <option>Pcs</option>
                                  <option>Box</option>
                                  <option>Pack</option>
                                  <option>Rim</option>
                               </select>
                            </div>
                            <div className="space-y-1">
                               <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Stok Awal</label>
                               <input 
                                  required type="number"
                                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none"
                                  value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: parseInt(e.target.value)})}
                                />
                            </div>
                            <div className="space-y-1">
                               <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Alert Stok Habis</label>
                               <input 
                                  required type="number"
                                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none"
                                  value={newProduct.lowStockThreshold} onChange={e => setNewProduct({...newProduct, lowStockThreshold: parseInt(e.target.value)})}
                                />
                            </div>
                         </div>
                         <button className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold mt-4 shadow-xl shadow-blue-600/20 hover:bg-blue-700 active:scale-[0.98] transition-all">Simpan Barang</button>
                      </form>
                   </motion.div>
                </div>
              )}
            </AnimatePresence>

            {/* Scanner Modal */}
            <AnimatePresence>
              {isScannerOpen && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
                   <div onClick={() => setIsScannerOpen(false)} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
                   <div className="relative w-full max-w-sm aspect-square bg-white rounded-3xl overflow-hidden shadow-2xl border-4 border-blue-600">
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                         <div className="w-48 h-48 border-2 border-dashed border-blue-500 animate-pulse rounded-2xl"></div>
                      </div>
                      <QrScanner
                        delay={300}
                        onError={handleError}
                        onScan={handleScan}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <div className="absolute bottom-0 left-0 right-0 p-4 text-center bg-white">
                         <p className="text-xs font-bold text-gray-400 mb-2 uppercase">Arahkan Kamera ke Barcode</p>
                         <button onClick={() => setIsScannerOpen(false)} className="text-red-500 font-bold text-sm">Batal</button>
                      </div>
                   </div>
                </div>
              )}
            </AnimatePresence>
        </motion.div>
    );
};

