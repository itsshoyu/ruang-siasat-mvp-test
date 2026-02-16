import React, { useState, useEffect } from 'react';
import { 
  Search, Menu, X, LogOut, Trash2, ArrowLeft, 
  PlusCircle, FileText, Loader, Lock, LayoutDashboard,
  Instagram, Linkedin, Twitter, User 
} from 'lucide-react';

// --- FIREBASE IMPORTS ---
import { initializeApp } from "firebase/app";
import { 
  getFirestore, collection, addDoc, onSnapshot, deleteDoc, 
  doc, serverTimestamp, query, orderBy 
} from "firebase/firestore";
import { 
  getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged 
} from "firebase/auth";

// --- KONFIGURASI FIREBASE ---
// ⚠️ Masukkan API Key asli Anda di sini dari Firebase Console
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

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = "ruang-siasat-v3";

// --- UTILITY: LOAD MAMMOTH.JS ---
// Digunakan untuk konversi Word ke HTML secara dinamis
const loadMammoth = () => {
  return new Promise((resolve) => {
    if (window.mammoth) return resolve(window.mammoth);
    const script = document.createElement('script');
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js";
    script.onload = () => resolve(window.mammoth);
    document.head.appendChild(script);
  });
};

// ==========================================
// KOMPONEN: ADMIN PANEL (Pengganti admin.html)
// ==========================================

const AdminPanel = ({ articles, user, onLogout, setView }) => {
  const [formData, setFormData] = useState({
    title: '', category: 'Eksistensialisme', excerpt: '', content: '', image: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fungsi Import Docx
  const handleDocxUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const mammoth = await loadMammoth();
    const reader = new FileReader();
    reader.onload = async (evt) => {
      const arrayBuffer = evt.target.result;
      const result = await mammoth.convertToHtml({ arrayBuffer });
      setFormData(prev => ({ 
        ...prev, 
        content: result.value,
        title: prev.title || file.name.replace('.docx', '') 
      }));
    };
    reader.readAsArrayBuffer(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'articles'), {
        ...formData,
        author: user.email.split('@')[0],
        createdAt: serverTimestamp()
      });
      setFormData({ title: '', category: 'Eksistensialisme', excerpt: '', content: '', image: '' });
      alert("Artikel berhasil diterbitkan!");
    } catch (err) {
      alert("Gagal: " + err.message);
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Hapus artikel ini?")) {
      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'articles', id));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-10">
      <nav className="bg-black text-white p-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <Lock size={18} />
          <h1 className="font-serif font-bold text-lg">Dapur Redaksi</h1>
        </div>
        <div className="flex gap-4 items-center">
          <button onClick={() => setView('home')} className="text-sm text-gray-400 hover:text-white">Lihat Web</button>
          <button onClick={onLogout} className="bg-red-600 px-3 py-1 rounded-full text-xs font-bold">LOGOUT</button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5">
          <div className="bg-white p-6 shadow-sm border border-gray-200">
            <h3 className="font-serif font-bold text-xl mb-4 text-black">Tulis Artikel</h3>
            
            <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded">
              <label className="block text-xs font-bold text-blue-800 mb-1 uppercase tracking-wider">Import dari Word (.docx)</label>
              <input type="file" accept=".docx" onChange={handleDocxUpload} className="text-xs w-full" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input 
                type="text" placeholder="Judul Artikel" required 
                className="w-full border-b border-gray-300 p-2 focus:border-black outline-none font-serif text-lg text-black bg-white"
                value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
              />
              <select 
                className="w-full border border-gray-300 p-2 text-sm text-black bg-white"
                value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}
              >
                {["Eksistensialisme", "Pendidikan", "Review Buku", "Politik", "Deepdive", "Opini"].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <input 
                type="text" placeholder="URL Gambar Header" required 
                className="w-full border border-gray-300 p-2 text-sm text-black bg-white"
                value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})}
              />
              <textarea 
                placeholder="Ringkasan singkat..." required
                className="w-full border border-gray-300 p-2 text-sm h-20 text-black bg-white"
                value={formData.excerpt} onChange={e => setFormData({...formData, excerpt: e.target.value})}
              />
              <textarea 
                placeholder="Isi artikel (HTML Support)..." required
                className="w-full border border-gray-300 p-2 text-sm font-mono h-60 text-black bg-white"
                value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})}
              />
              <button 
                type="submit" disabled={isSubmitting}
                className="w-full bg-black text-white py-3 font-bold hover:bg-gray-800 transition disabled:opacity-50"
              >
                {isSubmitting ? "MENERBITKAN..." : "PUBLISH SEKARANG"}
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-7">
          <div className="bg-white shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-100 bg-gray-50 font-bold text-sm text-black">Daftar Artikel Terbit</div>
            <div className="divide-y divide-gray-100">
              {articles.map(art => (
                <div key={art.id} className="p-4 flex justify-between items-center hover:bg-gray-50 transition">
                  <div>
                    <h5 className="font-serif font-bold text-gray-900">{art.title}</h5>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest">{art.category} • {art.dateString}</p>
                  </div>
                  <button onClick={() => handleDelete(art.id)} className="text-gray-300 hover:text-red-600 transition">
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
              {articles.length === 0 && <div className="p-10 text-center text-gray-400 text-sm">Belum ada artikel.</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// KOMPONEN: HOME VIEW (Pengganti index.html)
// ==========================================

const HomeView = ({ articles, setView, setSelectedArticle }) => (
  <div className="min-h-screen bg-white">
    <nav className="bg-black text-white py-4 sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <ul className="hidden md:flex gap-6 text-[10px] font-bold tracking-[0.2em]">
          <li><button onClick={() => setView('home')} className="hover:text-yellow-400 transition-colors">BERANDA</button></li>
          <li><button className="hover:text-yellow-400 transition-colors">ARSIP</button></li>
        </ul>
        <div className="text-3xl font-serif font-bold tracking-tighter cursor-pointer" onClick={() => setView('home')}>Ruang Siasat</div>
        <div className="flex items-center gap-6">
          <button className="hover:text-yellow-400 transition-colors"><Search size={18} /></button>
          <button 
            onClick={() => setView('admin')}
            className="border border-white text-[10px] px-3 py-1 font-bold tracking-widest hover:bg-white hover:text-black transition-all"
          >
            ADMIN
          </button>
        </div>
      </div>
    </nav>

    <main className="max-w-7xl mx-auto px-6 py-12">
      {articles.length > 0 && (
        <section className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center mb-20">
          <div className="md:col-span-7">
            <img 
              src={articles[0].image} 
              className="w-full h-[500px] object-cover rounded-sm shadow-xl cursor-pointer hover:opacity-90 transition" 
              alt="Hero Image" 
              onClick={() => { setSelectedArticle(articles[0]); setView('single'); }}
            />
          </div>
          <div className="md:col-span-5">
            <span className="text-red-600 font-bold text-xs uppercase tracking-[0.3em] mb-4 block">Pilihan Redaksi</span>
            <h1 className="text-5xl font-serif font-bold mb-6 leading-tight text-gray-900 cursor-pointer" onClick={() => { setSelectedArticle(articles[0]); setView('single'); }}>
              {articles[0].title}
            </h1>
            <p className="text-lg text-gray-500 font-light leading-relaxed mb-8">{articles[0].excerpt}</p>
            <button 
              onClick={() => { setSelectedArticle(articles[0]); setView('single'); }}
              className="border-b-2 border-black pb-1 font-bold text-sm tracking-widest hover:text-gray-500 hover:border-gray-500 transition"
            >
              BACA SELENGKAPNYA →
            </button>
          </div>
        </section>
      )}

      <section className="grid grid-cols-1 md:grid-cols-3 gap-12">
        {articles.slice(1).map(art => (
          <div key={art.id} className="group cursor-pointer" onClick={() => { setSelectedArticle(art); setView('single'); }}>
            <div className="overflow-hidden mb-5">
              <img src={art.image} className="w-full h-64 object-cover group-hover:scale-105 transition duration-500" alt="Article Thumbnail" />
            </div>
            <span className="text-blue-600 font-bold text-[10px] uppercase tracking-widest mb-3 block">{art.category}</span>
            <h2 className="text-2xl font-serif font-bold mb-3 group-hover:text-gray-600 transition">{art.title}</h2>
            <p className="text-sm text-gray-500 font-light line-clamp-3 leading-relaxed">{art.excerpt}</p>
          </div>
        ))}
      </section>
    </main>

    <footer className="bg-black text-white py-20 mt-20">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <div className="text-4xl font-serif font-bold mb-8">Ruang Siasat</div>
        <p className="text-gray-500 text-sm max-w-md mx-auto mb-10 font-light">Eksplorasi pemikiran kritis, literasi, dan refleksi mendalam atas fenomena hari ini.</p>
        <div className="flex justify-center gap-8 text-gray-400">
          <Instagram size={20} className="hover:text-white cursor-pointer transition-colors" />
          <Twitter size={20} className="hover:text-white cursor-pointer transition-colors" />
          <Linkedin size={20} className="hover:text-white cursor-pointer transition-colors" />
        </div>
        <div className="mt-20 pt-8 border-t border-gray-900 text-[10px] text-gray-600 tracking-widest">
          © 2026 RUANG SIASAT. ALL RIGHTS RESERVED.
        </div>
      </div>
    </footer>
  </div>
);

// --- APP UTAMA ---
export default function App() {
  const [view, setView] = useState('home'); 
  const [articles, setArticles] = useState([]);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Auth Listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setIsLoading(false);
    });
    return () => unsub();
  }, []);

  // Fetch Data (Realtime)
  useEffect(() => {
    const q = query(collection(db, 'artifacts', appId, 'public', 'data', 'articles'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id, ...doc.data(),
        dateString: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Baru saja'
      }));
      setArticles(docs);
    });
    return () => unsub();
  }, []);

  // Login Handler
  const handleLogin = async (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setView('admin');
    } catch (err) { alert("Login Gagal! Periksa email dan password admin Anda."); }
  };

  if (isLoading) return <div className="h-screen flex items-center justify-center bg-white"><Loader className="animate-spin text-gray-300" /></div>;

  if (view === 'login') return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 font-sans p-6">
      <div className="bg-white p-10 border border-gray-200 shadow-2xl max-w-sm w-full relative">
        <button onClick={() => setView('home')} className="absolute top-4 right-4 text-gray-400 hover:text-black transition-colors"><X size={20}/></button>
        <div className="text-center mb-10">
          <h2 className="text-3xl font-serif font-bold mb-2 text-black">Ruang Siasat</h2>
          <p className="text-[10px] font-bold tracking-[0.3em] text-gray-400 uppercase">Akses Redaksi</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <input name="email" type="email" placeholder="Email" required className="w-full border border-gray-300 p-3 text-sm focus:border-black outline-none bg-white text-black" />
          <input name="password" type="password" placeholder="Password" required className="w-full border border-gray-300 p-3 text-sm focus:border-black outline-none bg-white text-black" />
          <button type="submit" className="w-full bg-black text-white py-3 font-bold text-xs tracking-widest hover:bg-gray-800 transition">MASUK</button>
        </form>
      </div>
    </div>
  );

  if (view === 'admin') {
    return user ? <AdminPanel articles={articles} user={user} onLogout={() => signOut(auth)} setView={setView} /> : setView('login');
  }

  if (view === 'single' && selectedArticle) {
    return (
      <div className="min-h-screen bg-white font-sans">
        <nav className="bg-white border-b border-gray-100 p-4 sticky top-0 z-50">
          <div className="max-w-4xl mx-auto flex justify-between items-center">
            <button onClick={() => setView('home')} className="flex items-center gap-2 text-gray-500 hover:text-black transition">
              <ArrowLeft size={18}/> <span className="text-[10px] font-bold tracking-widest uppercase">Kembali</span>
            </button>
            <div className="font-serif font-bold text-xl text-black">Ruang Siasat</div>
            <div className="w-20"></div>
          </div>
        </nav>
        <article className="max-w-3xl mx-auto px-6 py-20">
          <header className="text-center mb-16">
            <span className="text-blue-600 font-bold text-xs uppercase tracking-[0.3em] mb-4 block">{selectedArticle.category}</span>
            <h1 className="text-5xl md:text-6xl font-serif font-bold mb-8 leading-tight text-gray-900">{selectedArticle.title}</h1>
            <div className="text-xs text-gray-400 font-bold tracking-[0.1em] uppercase pb-8 border-b border-gray-100">
              Oleh {selectedArticle.author} • {selectedArticle.dateString}
            </div>
          </header>
          <img src={selectedArticle.image} className="w-full h-auto mb-16 rounded shadow-2xl" alt="Article Cover" />
          <div 
            className="prose prose-lg max-w-none font-serif leading-relaxed text-gray-800"
            dangerouslySetInnerHTML={{ __html: selectedArticle.content }}
          />
        </article>
      </div>
    );
  }

  return <HomeView articles={articles} setView={setView} setSelectedArticle={setSelectedArticle} />;
}