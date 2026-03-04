import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Trash2, X, Image as ImageIcon } from 'lucide-react';
import { collection, addDoc, deleteDoc, doc, serverTimestamp, query, orderBy, onSnapshot } from 'firebase/firestore';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth, db, appId } from '../firebase/config'; // Perhatikan: Firebase Storage dihapus dari sini

const loadMammoth = () => {
  return new Promise((resolve) => {
    if (window.mammoth) return resolve(window.mammoth);
    const script = document.createElement('script');
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js";
    script.onload = () => resolve(window.mammoth);
    document.head.appendChild(script);
  });
};

export default function Admin({ user }) {
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [formData, setFormData] = useState({
    title: '', category: 'Eksistensialisme', excerpt: '', content: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'artifacts', appId, 'public', 'data', 'articles'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id, ...doc.data(),
        dateString: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Baru saja'
      }));
      setArticles(docs);
    });
    return () => unsub();
  }, [user]);

  const handleLogin = async (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;
    try { await signInWithEmailAndPassword(auth, email, password); } 
    catch (err) { alert("Login Gagal! Periksa email dan password admin Anda."); }
  };

  const handleDocxUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const mammoth = await loadMammoth();
    const reader = new FileReader();
    reader.onload = async (evt) => {
      const arrayBuffer = evt.target.result;
      const result = await mammoth.convertToHtml({ arrayBuffer });
      setFormData(prev => ({ 
        ...prev, content: result.value, title: prev.title || file.name.replace('.docx', '') 
      }));
    };
    reader.readAsArrayBuffer(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imageFile) return alert("Pilih gambar cover terlebih dahulu!");
    
    setIsSubmitting(true);
    try {
      // 1. Upload gambar ke ImgBB
      const imgData = new FormData();
      imgData.append('image', imageFile);

      // ⚠️ GANTI TEKS DI BAWAH INI DENGAN API KEY ANDA
      const imgbbApiKey = "a54a1a8f034b0b01385c5199bf036763"; 
      
      const imgbbRes = await fetch(`https://api.imgbb.com/1/upload?key=${imgbbApiKey}`, {
        method: 'POST',
        body: imgData
      });
      const imgbbResult = await imgbbRes.json();
      
      if (!imgbbResult.success) throw new Error("Gagal mengunggah gambar ke peladen.");
      const imageUrl = imgbbResult.data.url; // Tautan gambar dari ImgBB

      // 2. Simpan data ke Firestore beserta URL gambar
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'articles'), {
        ...formData,
        image: imageUrl,
        author: user.email.split('@')[0],
        createdAt: serverTimestamp()
      });
      
      setFormData({ title: '', category: 'Eksistensialisme', excerpt: '', content: '' });
      setImageFile(null);
      alert("Artikel berhasil diterbitkan!");
    } catch (err) {
      alert("Gagal: " + err.message);
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Hapus artikel ini?")) await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'articles', id));
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 font-sans p-6">
        <div className="bg-white p-10 border border-gray-200 shadow-2xl max-w-sm w-full relative">
          <button onClick={() => navigate('/')} className="absolute top-4 right-4 text-gray-400 hover:text-black transition-colors"><X size={20}/></button>
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
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-10">
      <nav className="bg-black text-white p-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-2"><Lock size={18} /><h1 className="font-serif font-bold text-lg">Dapur Redaksi</h1></div>
        <div className="flex gap-4 items-center">
          <button onClick={() => navigate('/')} className="text-sm text-gray-400 hover:text-white">Lihat Web</button>
          <button onClick={() => signOut(auth)} className="bg-red-600 px-3 py-1 rounded-full text-xs font-bold">LOGOUT</button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5">
          <div className="bg-white p-6 shadow-sm border border-gray-200">
            <h3 className="font-serif font-bold text-xl mb-4 text-black">Tulis Artikel</h3>
            
            <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded">
              <label className="block text-xs font-bold text-blue-800 mb-1 uppercase tracking-wider">Import dari Word (.docx)</label>
              <input type="file" accept=".docx" onChange={handleDocxUpload} className="text-xs w-full text-black" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="text" placeholder="Judul Artikel" required className="w-full border-b border-gray-300 p-2 focus:border-black outline-none font-serif text-lg text-black bg-white" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
              <select className="w-full border border-gray-300 p-2 text-sm text-black bg-white" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                {["Eksistensialisme", "Pendidikan", "Review Buku", "Politik", "Deepdive", "Opini"].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              
              <div className="border border-gray-300 p-2 bg-white flex items-center gap-2">
                <ImageIcon size={18} className="text-gray-400" />
                <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} className="text-sm w-full text-black" required />
              </div>

              <textarea placeholder="Ringkasan singkat..." required className="w-full border border-gray-300 p-2 text-sm h-20 text-black bg-white" value={formData.excerpt} onChange={e => setFormData({...formData, excerpt: e.target.value})} />
              <textarea placeholder="Isi artikel (HTML Support)..." required className="w-full border border-gray-300 p-2 text-sm font-mono h-60 text-black bg-white" value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} />
              <button type="submit" disabled={isSubmitting} className="w-full bg-black text-white py-3 font-bold hover:bg-gray-800 transition disabled:opacity-50">
                {isSubmitting ? "MENGUNGGAH GAMBAR & MENERBITKAN..." : "PUBLISH SEKARANG"}
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
                  <button onClick={() => handleDelete(art.id)} className="text-gray-300 hover:text-red-600 transition"><Trash2 size={18} /></button>
                </div>
              ))}
              {articles.length === 0 && <div className="p-10 text-center text-gray-400 text-sm">Belum ada artikel.</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}