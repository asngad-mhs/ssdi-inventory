import { useAuth } from './hooks/useAuth';
import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';
import { Loader2 } from 'lucide-react';

export default function App() {
  const { user, userData, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-white">
        <div className="w-16 h-16 relative">
           <div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
           <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
        </div>
        <p className="mt-6 text-gray-400 font-medium animate-pulse text-sm uppercase tracking-widest">Menyiapkan SSDI Inventory...</p>
      </div>
    );
  }

  return (
    <>
      {!user ? (
        <LandingPage />
      ) : (
        <Dashboard user={user} userData={userData} />
      )}
    </>
  );
}
