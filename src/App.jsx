import React, { useState, useEffect } from 'react';
import { 
  Search, Menu, X, LogOut, Trash2, ArrowLeft, 
  PlusCircle, Edit3, Loader, Lock, LayoutDashboard,
  Instagram, Linkedin, Twitter 
} from 'lucide-react';

// --- FIREBASE IMPORTS (RTDB VERSION) ---
import { initializeApp } from "firebase/app";
import { 
  getDatabase, ref, push, set, onValue, remove, 
  serverTimestamp, query, orderByChild 
} from "firebase/database"; // Menggunakan modul database
import { 
  getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged 
} from "firebase/auth";

// --- KONFIGURASI FIREBASE ---
// ⚠️ TUGAS ANDA: GANTI BAGIAN INI DENGAN DATA DARI FIREBASE CONSOLE
const firebaseConfig = {
  apiKey: "AIzaSyBVeqlBZxnuXj_nY3Wj-I4qziIrsTs4kTI",
  authDomain: "ruang-siasat-2.firebaseapp.com",
  databaseURL: "https://ruang-siasat-2-default-rtdb.firebaseio.com/",
  projectId: "ruang-siasat-2",
  storageBucket: "ruang-siasat-2.firebasestorage.app",
  messagingSenderId: "927830982352",
  appId: "1:927830982352:web:b3cfe3b8072d348e56a8d5",
  measurementId: "G-DPP0166H5M"
};

// --- INISIALISASI ---
let app, auth, db;
const isConfigured = true;;

if (isConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getDatabase(app); // Gunakan getDatabase
  } catch (error) {
    console.error("Firebase Error:", error);
  }
}

const appId = "ruang-siasat-v3"; // Nama database

// --- DATA KATEGORI ---
const CATEGORIES = ["Semua", "Eksistensialisme", "Pendidikan", "Review Buku", "Politik", "Deepdive", "Opini"];
const NAV_CATEGORIES = ["INDONESIA", "BUSINESS", "WORLD", "OPINION", "CULTURE", "DEEPDIVE"];

// --- GLOBAL STYLES (Custom CSS Injection) ---
const GlobalStyles = () => (
  <style>{`
    .btn-custom-square {
      border-radius: 0; border-width: 1px; padding: 8px 25px; 
      font-size: 14px; text-transform: uppercase; letter-spacing: 1px;       
      transition: all 0.2s ease;
    }
    .btn-custom-square:hover {
      background-color: white; color: black !important; transform: translateY(-2px);
    }
    .nav-link-cat {
      font-size: 13px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase;
    }
    .nav-link-cat:hover { color: #dc3545; }
  `}</style>
);

// ==========================================
// BAGIAN 1: KOMPONEN ADMIN (DASHBOARD)
// ==========================================

const LoginView = ({ onCancel }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError("Login gagal. Pastikan Email & Password benar.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4 font-sans">
      <div className="bg-white p-8 border border-gray-200 shadow-xl max-w-md w-full relative">
        <button onClick={onCancel} className="absolute top-4 right-4 text-gray-400 hover:text-black"><X size={20}/></button>
        <div className="text-center mb-8">
          <h2 className="text-3xl font-serif font-bold mb-2">Ruang Siasat</h2>
          <p className="text-xs font-bold tracking-widest uppercase text-gray-500">Halaman Redaksi</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase mb-1">Email Admin</label>
            <input type="email" required className="w-full border border-gray-300 p-3 focus:outline-none focus:border-black transition-colors" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase mb-1">Password</label>
            <input type="password" required className="w-full border border-gray-300 p-3 focus:outline-none focus:border-black transition-colors" value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          {error && <p className="text-red-600 text-xs font-bold bg-red-50 p-2">{error}</p>}
          <button type="submit" disabled={loading} className="w-full bg-black text-white py-3 font-bold hover:bg-gray-800 transition disabled:opacity-50">
            {loading ? "MEMVERIFIKASI..." : "MASUK DASHBOARD"}
          </button>
        </form>
      </div>
    </div>
  );
};

const AdminDashboard = ({ articles, onDelete, onLogout, setView }) => {
  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-20">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-black text-white p-2 rounded"><Lock size={16}/></div>
          <div>
            <h1 className="font-serif font-bold text-lg leading-none">Redaksi</h1>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider">Content Management System</p>
          </div>
        </div>
        <div className="flex items-center gap-6 text-sm font-medium">
          <button onClick={() => setView('home')} className="text-gray-500 hover:text-black flex items-center gap-2">
             <ArrowLeft size={16}/> Lihat Website
          </button>
          <button onClick={onLogout} className="text-red-600 hover:text-red-800 flex items-center gap-2 bg-red-50 px-3 py-1.5 rounded-full hover:bg-red-100 transition">
            <LogOut size={16}/> Logout
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 mt-8">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-serif font-bold mb-2">Artikel Terbit</h2>
            <p className="text-gray-500">Total {articles.length} artikel aktif di database.</p>
          </div>
          <button onClick={() => setView('create')} className="bg-black text-white px-5 py-3 font-bold flex items-center gap-2 hover:bg-gray-800 shadow-lg transform hover:-translate-y-1 transition-all">
            <PlusCircle size={18}/> TULIS ARTIKEL BARU
          </button>
        </div>

        <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 text-xs font-bold uppercase text-gray-500 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4">Artikel</th>
                <th className="px-6 py-4">Kategori</th>
                <th className="px-6 py-4">Tanggal</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {articles.map((article) => (
                <tr key={article.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <img src={article.image} className="w-16 h-12 object-cover rounded bg-gray-200 border border-gray-100" alt="thumb"/>
                      <div>
                        <p className="font-serif font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">{article.title}</p>
                        <p className="text-xs text-gray-500 line-clamp-1">{article.excerpt}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-block bg-gray-100 px-2 py-1 rounded text-xs font-semibold text-gray-600">{article.category}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 font-mono">
                    {article.dateString}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => onDelete(article.id)} className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-full transition-all" title="Hapus Permanen">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {articles.length === 0 && (
            <div className="p-12 text-center">
              <div className="inline-block p-4 bg-gray-100 rounded-full mb-3"><LayoutDashboard size={24} className="text-gray-400"/></div>
              <p className="text-gray-500">Belum ada artikel. Mulai menulis sekarang!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ArticleEditor = ({ onPublish, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '', category: 'Eksistensialisme', excerpt: '', content: '', image: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    await onPublish(formData);
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 font-sans">
      <div className="max-w-4xl mx-auto bg-white border border-gray-200 shadow-sm">
        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-white sticky top-0 z-10">
          <h2 className="text-xl font-serif font-bold flex items-center gap-2">
            <Edit3 size={20}/> Editor Baru
          </h2>
          <div className="flex gap-3">
            <button onClick={onCancel} className="px-4 py-2 text-sm text-gray-600 hover:text-black font-medium">Batal</button>
            <button onClick={handleSubmit} disabled={isSubmitting} className="bg-black text-white px-6 py-2 text-sm font-bold hover:bg-gray-800 disabled:opacity-50">
              {isSubmitting ? "MENYIMPAN..." : "PUBLISH ARTIKEL"}
            </button>
          </div>
        </div>
        
        <div className="p-8 space-y-6">
          <div>
            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Judul Artikel</label>
            <input 
              type="text" 
              required
              className="w-full text-3xl font-serif font-bold border-b border-gray-300 py-2 focus:outline-none focus:border-black placeholder-gray-300" 
              placeholder="Ketik Judul Di Sini..." 
              value={formData.title} 
              onChange={e => setFormData({...formData, title: e.target.value})} 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Kategori</label>
              <select 
                className="w-full border border-gray-300 p-3 rounded-none bg-white focus:outline-none focus:border-black" 
                value={formData.category} 
                onChange={e => setFormData({...formData, category: e.target.value})}
              >
                {CATEGORIES.slice(1).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 mb-2">URL Gambar Utama</label>
              <input 
                type="text" 
                className="w-full border border-gray-300 p-3 focus:outline-none focus:border-black" 
                placeholder="https://..." 
                value={formData.image} 
                onChange={e => setFormData({...formData, image: e.target.value})} 
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Ringkasan (Excerpt)</label>
            <textarea 
              required
              rows="3" 
              className="w-full border border-gray-300 p-3 focus:outline-none focus:border-black" 
              placeholder="Teks singkat yang muncul di kartu artikel..." 
              value={formData.excerpt} 
              onChange={e => setFormData({...formData, excerpt: e.target.value})} 
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Isi Artikel</label>
            <div className="border border-gray-300 p-2">
              <div className="bg-gray-50 p-2 border-b border-gray-200 mb-2 text-xs text-gray-500 flex gap-2">
                <span>Mode: HTML Source</span>
                <span className="text-gray-400">|</span>
                <span>Gunakan &lt;p&gt;, &lt;b&gt;, &lt;h3&gt; untuk format</span>
              </div>
              <textarea 
                required
                rows="15" 
                className="w-full p-2 focus:outline-none font-mono text-sm leading-relaxed resize-y" 
                placeholder="<p>Mulai menulis paragraf pertama...</p>" 
                value={formData.content} 
                onChange={e => setFormData({...formData, content: e.target.value})} 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// BAGIAN 2: KOMPONEN PUBLIK (FRONTEND)
// ==========================================

const Navbar = ({ onNavigate, user }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm font-sans">
      <nav className="bg-black text-white py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <button className="lg:hidden text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            <ul className="hidden lg:flex space-x-6 text-sm font-semibold">
              <li><button onClick={() => onNavigate('home')} className="hover:text-yellow-400 transition-colors">Beranda</button></li>
              <li><button onClick={() => onNavigate('articles')} className="hover:text-yellow-400 transition-colors">Artikel</button></li>
            </ul>

            <div className="text-2xl font-serif font-bold tracking-wide lg:absolute lg:left-1/2 lg:-translate-x-1/2 cursor-pointer" onClick={() => onNavigate('home')}>
              Ruang Siasat
            </div>

            <ul className="flex items-center space-x-6 text-sm">
              <li className="hidden lg:block"><a href="#" className="hover:text-yellow-400">Tentang</a></li>
              {/* TOMBOL LOGIN */}
              <li>
                <button 
                  onClick={() => onNavigate(user ? 'admin' : 'login')}
                  className={`btn-custom-square border border-white text-white hover:bg-white hover:text-black`}
                >
                  {user ? "Dashboard" : "Login"}
                </button>
              </li>
            </ul>
          </div>
        </div>
        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden mt-3 bg-gray-900 p-4 space-y-3 border-t border-gray-800">
             <button onClick={() => onNavigate('home')} className="block w-full text-left hover:text-yellow-400">Beranda</button>
             <button onClick={() => onNavigate('articles')} className="block w-full text-left hover:text-yellow-400">Artikel</button>
          </div>
        )}
      </nav>
      {/* Category Nav */}
      <div className="bg-white border-b border-gray-200 py-3 overflow-x-auto">
        <div className="max-w-7xl mx-auto px-4 flex justify-center min-w-max">
          <ul className="flex space-x-6 md:space-x-8">
            {NAV_CATEGORIES.map(cat => (
              <li key={cat}><button className="nav-link-cat text-gray-700 hover:text-red-600 transition-colors">{cat}</button></li>
            ))}
          </ul>
        </div>
      </div>
    </header>
  );
};

const HeroSection = ({ article, onClick }) => {
  if (!article) return null;
  return (
    <section className="py-12 bg-white font-sans border-b border-gray-100">
      <div className="flex flex-col md:flex-row gap-8 items-center">
        <div className="md:w-7/12">
          <img 
            src={article.image} 
            className="w-full h-[400px] object-cover rounded-lg shadow-sm cursor-pointer hover:opacity-95 transition-opacity" 
            onClick={() => onClick(article)}
            alt={article.title}
          />
        </div>
        <div className="md:w-5/12">
          <span className="inline-block bg-gray-600 text-white text-xs font-bold px-2 py-1 mb-3 rounded-sm uppercase tracking-wider">Pilihan Kami</span>
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4 leading-tight text-gray-900 cursor-pointer hover:text-gray-700" onClick={() => onClick(article)}>
            {article.title}
          </h1>
          <p className="text-lg text-gray-500 mb-6 font-light leading-relaxed line-clamp-3">
            {article.excerpt}
          </p>
          <button onClick={() => onClick(article)} className="border border-black text-black px-6 py-2 hover:bg-black hover:text-white transition-all text-sm font-bold uppercase tracking-wide">
            Baca Selengkapnya →
          </button>
        </div>
      </div>
    </section>
  );
};

const ArticleCard = ({ article, onClick }) => (
  <div className="flex flex-col h-full bg-white border-0 shadow-sm rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-300 cursor-pointer group font-sans" onClick={() => onClick(article)}>
    <div className="overflow-hidden h-[200px]">
      <img src={article.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={article.title} />
    </div>
    <div className="p-5 flex flex-col flex-grow">
      <small className="text-blue-600 font-bold text-xs uppercase mb-2 tracking-wide block">{article.category}</small>
      <h5 className="font-serif text-xl font-bold text-gray-900 mb-2 leading-tight group-hover:text-gray-600">{article.title}</h5>
      <p className="text-gray-500 text-sm mb-4 flex-grow line-clamp-3">{article.excerpt}</p>
      <span className="text-black font-bold text-sm hover:underline mt-auto">Baca Selengkapnya →</span>
    </div>
  </div>
);

const ArticleView = ({ article, onBack }) => {
  useEffect(() => { window.scrollTo(0, 0); }, []);
  return (
    <div className="max-w-4xl mx-auto py-10 px-4 font-sans min-h-screen">
      <button onClick={onBack} className="flex items-center text-gray-500 hover:text-black mb-8 font-medium group">
        <ArrowLeft size={18} className="mr-2 group-hover:-translate-x-1 transition-transform" /> Kembali
      </button>
      <header className="text-center mb-10 max-w-2xl mx-auto">
        <span className="text-blue-600 font-bold uppercase tracking-widest text-xs mb-3 block">{article.category}</span>
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-6 leading-tight">{article.title}</h1>
        <div className="flex items-center justify-center text-gray-500 text-sm space-x-4 border-t border-b border-gray-100 py-4 mx-10">
           <span>Oleh <strong className="text-black">{article.author}</strong></span>
           <span>•</span>
           <span>{article.dateString}</span>
        </div>
      </header>
      <img src={article.image} className="w-full h-auto max-h-[600px] object-cover rounded-lg mb-10 shadow-sm" alt={article.title} />
      <article className="prose prose-lg prose-headings:font-serif prose-p:font-sans max-w-2xl mx-auto text-gray-800 leading-loose">
        {article.content.includes('<') ? <div dangerouslySetInnerHTML={{ __html: article.content }} /> : <p>{article.content}</p>}
      </article>
    </div>
  );
};

const Footer = () => (
  <footer className="bg-black text-white pt-16 pb-8 mt-auto font-sans">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="border-t border-gray-800 pt-10 pb-10 flex flex-col md:flex-row gap-10">
        <div className="md:w-1/2">
          <h3 className="text-2xl font-serif mb-4">Be notified of new publications</h3>
          <form className="flex gap-2 flex-wrap" onSubmit={e => e.preventDefault()}>
            <input type="email" placeholder="name@youremail.com" className="bg-[#1a1a1a] border-none text-white px-5 py-3 rounded-lg focus:ring-1 focus:ring-gray-500 outline-none flex-grow"/>
            <button className="bg-white text-black font-medium px-6 py-3 rounded-full hover:bg-gray-200">Subscribe</button>
          </form>
        </div>
      </div>
      <div className="mt-10">
        <h2 className="text-3xl font-serif mb-4">Get to know Ruang Siasat</h2>
        <div className="flex gap-4">
          <Instagram className="cursor-pointer hover:text-gray-400"/>
          <Linkedin className="cursor-pointer hover:text-gray-400"/>
          <Twitter className="cursor-pointer hover:text-gray-400"/>
        </div>
      </div>
      <div className="mt-16 border-t border-gray-900 pt-6 text-[#888] text-sm">© 2026 Ruang Siasat. All rights reserved.</div>
    </div>
  </footer>
);

// ==========================================
// BAGIAN 3: LOGIKA UTAMA (ROUTING)
// ==========================================

export default function App() {
  const [view, setView] = useState('home'); // home, articles, single, login, admin, create
  const [articles, setArticles] = useState([]);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // State Filter untuk Halaman Artikel
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("Semua");

  // Auth Listener
  useEffect(() => {
    if (!auth) { setIsLoading(false); return; }
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsLoading(false);
    });
    return () => unsub();
  }, []);

  // Data Listener (Realtime)
  useEffect(() => {
  if (!db) return;
  
  // Referensi ke path database RTDB
  const articlesRef = query(ref(db, 'articles'), orderByChild('createdAt'));
  
  const unsub = onValue(articlesRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      // Mengubah objek RTDB menjadi array agar sesuai dengan state 'articles'
      const articleList = Object.keys(data).map(key => ({
        id: key,
        ...data[key],
        // Format tanggal dari timestamp
        dateString: data[key].createdAt ? new Date(data[key].createdAt).toLocaleDateString('id-ID', { 
          day: 'numeric', month: 'long', year: 'numeric' 
        }) : 'Draft'
      })).reverse(); // Reverse agar yang terbaru di atas
      
      setArticles(articleList);
    } else {
      setArticles([]);
    }
  });
  
  return () => unsub();
}, []);
  // Handlers
  // Handler Publish Artikel
const handlePublish = async (data) => {
  if (!user) return alert("Sesi habis. Silakan login kembali.");
  try {
    const articlesRef = ref(db, 'articles');
    const newArticleRef = push(articlesRef); // Buat ID unik baru
    
    await set(newArticleRef, {
      ...data,
      author: user.email.split('@')[0],
      createdAt: serverTimestamp() // Gunakan serverTimestamp dari database
    });
    
    setView('admin');
  } catch (e) { 
    alert("Error: " + e.message); 
  }
};

// Handler Hapus Artikel
const handleDelete = async (id) => {
  if (confirm("Yakin ingin menghapus artikel ini secara permanen?")) {
    try {
      await remove(ref(db, `articles/${id}`));
    } catch (e) {
      alert("Gagal menghapus: " + e.message);
    }
  }
};

  const handleLogout = async () => {
    await signOut(auth);
    setView('home');
  };

  // Filter Logic
  const filteredArticles = articles.filter(a => {
    const matchCat = activeCategory === "Semua" || a.category === activeCategory;
    const matchSearch = a.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  // Warning jika belum config
  if (!isConfigured) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50 p-10 text-center font-sans">
        <div className="max-w-md bg-white p-8 shadow-lg rounded">
          <h1 className="text-3xl font-bold text-red-600 mb-4">⚠️ Konfigurasi Diperlukan</h1>
          <p className="text-gray-700 mb-4">Web Admin belum terhubung ke Database.</p>
          <div className="bg-gray-100 p-4 rounded text-left text-sm font-mono text-gray-600">
            <p>1. Buka file <span className="text-black font-bold">src/App.jsx</span></p>
            <p>2. Cari <span className="text-black font-bold">const firebaseConfig</span></p>
            <p>3. Ganti "GANTI_DENGAN_API_KEY..." dengan config asli Anda.</p>
          </div>
        </div>
      </div>
    );
  }

  // Loading Screen
  if (isLoading) return <div className="h-screen flex items-center justify-center"><Loader className="animate-spin text-gray-400"/></div>;

  // ROUTER LOGIC
  const renderContent = () => {
    switch(view) {
      case 'login': return <LoginView onCancel={() => setView('home')} />;
      case 'admin': return user ? <AdminDashboard articles={articles} onDelete={handleDelete} onLogout={handleLogout} setView={setView} /> : <LoginView onCancel={() => setView('home')} />;
      case 'create': return user ? <ArticleEditor onPublish={handlePublish} onCancel={() => setView('admin')} /> : <LoginView onCancel={() => setView('home')} />;
      case 'single': return selectedArticle ? <ArticleView article={selectedArticle} onBack={() => setView('home')} /> : setView('home');
      case 'articles': 
        return (
          <div className="max-w-7xl mx-auto px-4 mt-8 pb-20 animate-in fade-in">
             <header className="pt-10 pb-8 border-b border-gray-200 mb-8">
                <h1 className="text-5xl font-serif font-bold mb-2">Semua Artikel</h1>
                <p className="text-gray-500 text-lg">Menjelajahi pemikiran, kritik, dan refleksi mendalam.</p>
              </header>
              <div className="flex flex-col md:flex-row gap-12">
                <div className="md:w-1/4">
                  <div className="sticky top-24">
                    <h5 className="font-serif font-bold mb-3 text-lg">Cari Artikel</h5>
                    <div className="relative mb-8">
                      <input type="text" className="w-full border border-gray-300 p-2 pr-10 rounded-none focus:outline-none focus:border-black" placeholder="Ketik kata kunci..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                      <button className="absolute right-0 top-0 h-full px-3 text-gray-500"><Search size={16} /></button>
                    </div>
                    <h5 className="font-serif font-bold mb-3 text-lg">Kategori</h5>
                    <div className="flex flex-col space-y-2 border-l-2 border-gray-100 pl-4">
                      {CATEGORIES.map(cat => (
                        <button key={cat} onClick={() => setActiveCategory(cat)} className={`text-left text-sm py-1 transition-colors ${activeCategory === cat ? 'text-black font-bold' : 'text-gray-500 hover:text-black'}`}>{cat}</button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="md:w-3/4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {filteredArticles.map(art => <ArticleCard key={art.id} article={art} onClick={a => {setSelectedArticle(a); setView('single')}}/>)}
                  </div>
                  {filteredArticles.length === 0 && <p className="text-gray-500 py-10">Tidak ada artikel ditemukan.</p>}
                </div>
              </div>
          </div>
        );
      case 'home':
      default:
        return (
          <div className="max-w-7xl mx-auto px-4 mt-8 pb-20 animate-in fade-in">
            {articles.length > 0 && <HeroSection article={articles[0]} onClick={a => {setSelectedArticle(a); setView('single')}} />}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              {articles.slice(1).map(art => <ArticleCard key={art.id} article={art} onClick={a => {setSelectedArticle(a); setView('single')}}/>)}
            </div>
            {articles.length === 0 && <div className="text-center py-20 text-gray-500">Belum ada artikel. Klik tombol "Login" untuk menulis.</div>}
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-gray-900 font-sans flex flex-col">
      <GlobalStyles />
      {!['login', 'admin', 'create'].includes(view) && <Navbar onNavigate={setView} user={user} />}
      <main className="flex-grow">{renderContent()}</main>
      {!['login', 'admin', 'create'].includes(view) && <Footer />}
    </div>
  );
}