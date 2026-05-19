import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authenticatedUser) => {
      setUser(authenticatedUser);
      
      if (authenticatedUser) {
        // Sync user profile
        const userRef = doc(db, 'users', authenticatedUser.uid);
        const userSnap = await getDoc(userRef);
        
        if (!userSnap.exists()) {
          const newUserData = {
            name: authenticatedUser.displayName || 'Staff Member',
            email: authenticatedUser.email,
            role: authenticatedUser.email === 'asngad@mhs.unugha.ac.id' ? 'admin' : 'staff',
            createdAt: Timestamp.now()
          };
          await setDoc(userRef, newUserData);
          setUserData(newUserData);
        } else {
          setUserData(userSnap.data());
        }
      } else {
        setUserData(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return { user, userData, loading };
}
