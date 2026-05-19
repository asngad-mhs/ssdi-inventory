import { motion } from "motion/react";
import { 
  Package, 
  BarChart3, 
  Clock, 
  Smartphone, 
  Bell, 
  CreditCard, 
  Download, 
  ShieldCheck,
  ArrowRight,
  Menu,
  X,
  Database,
  RefreshCw
} from "lucide-react";
import { useState, useEffect } from "react";
import { loginWithGoogle } from "../lib/firebase";

export const LandingPage = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogin = async () => {
     try {
       await loginWithGoogle();
     } catch (err) {
       console.error(err);
     }
  };

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-blue-100 selection:text-blue-600 antialiased">
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? "bg-white/80 backdrop-blur-md border-b border-gray-200 py-3" : "bg-transparent py-5"}`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Package className="text-white w-6 h-6" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-gray-900">SSDI<span className="text-blue-600">Inventory</span></span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">Fitur</a>
            <button 
              onClick={handleLogin}
              className="bg-blue-600 text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-blue-700 transition-all shadow-md hover:shadow-lg active:scale-95"
            >
              Login App
            </button>
          </div>

          <button className="md:hidden text-gray-600" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </nav>

      <main>
        <section className="relative pt-32 pb-20 overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <span className="inline-block px-4 py-1.5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider mb-6">
                PRODUKTIF & EFISIEN
              </span>
              <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 leading-[1.1] mb-8 max-w-4xl mx-auto">
                Kelola Stok Barang Lebih <span className="text-blue-600">Cerdas & Real-Time</span>
              </h1>
              <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
                SSDI menyediakan solusi inventaris terpadu dengan analisis tren, integrasi POS/ERP, dan sinkronisasi multi-perangkat.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4 mb-20">
                <button 
                  onClick={handleLogin}
                  className="bg-blue-600 text-white px-8 py-4 rounded-full text-lg font-bold hover:bg-blue-700 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 flex items-center justify-center gap-2"
                >
                  Mulai Sekarang <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="relative max-w-5xl mx-auto rounded-2xl shadow-2xl overflow-hidden border border-gray-200 bg-white"
            >
              <img 
                src="/src/assets/images/ssdi_dashboard_mockup_1779215504881.png" 
                alt="SSDI Dashboard" 
                className="w-full h-auto"
              />
            </motion.div>
          </div>
        </section>

        <section id="features" className="py-24 bg-gray-50/50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid md:grid-cols-3 gap-8">
               {[
                 { icon: <RefreshCw />, title: "Real-Time Sync", desc: "Sinkronisasi instan di semua perangkat." },
                 { icon: <BarChart3 />, title: "Trend Analysis", desc: "Laporan akurat untuk keputusan cerdas." },
                 { icon: <Bell />, title: "Low Stock Alerts", desc: "Notifikasi otomatis stok menipis." }
               ].map((f, i) => (
                 <div key={i} className="p-8 bg-white rounded-3xl border border-gray-100 shadow-sm">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4">{f.icon}</div>
                    <h3 className="text-xl font-bold mb-2">{f.title}</h3>
                    <p className="text-gray-500">{f.desc}</p>
                 </div>
               ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-900 py-12 text-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-gray-400">© 2024 SSDI Inventory. Solusi Inventaris Modern.</p>
        </div>
      </footer>
    </div>
  );
};
