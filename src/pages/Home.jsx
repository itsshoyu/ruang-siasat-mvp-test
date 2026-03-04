import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Instagram, Linkedin, Twitter, Loader } from 'lucide-react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db, appId } from '../firebase/config';
import { Helmet } from 'react-helmet-async';

export default function Home() {
  const [articles, setArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'artifacts', appId, 'public', 'data', 'articles'), 
      orderBy('createdAt', 'desc')
    );
    const unsub = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id, 
        ...doc.data(),
        dateString: doc.data().createdAt?.toDate 
          ? doc.data().createdAt.toDate().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) 
          : 'Baru saja'
      }));
      setArticles(docs);
      setIsLoading(false);
    });
    return () => unsub();
  }, []);

  if (isLoading) {
    return <div className="h-screen flex items-center justify-center bg-white"><Loader className="animate-spin text-gray-300" /></div>;
  }

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>Ruang Siasat - Beranda</title>
        <meta name="description" content="Eksplorasi pemikiran kritis, literasi, dan refleksi mendalam atas fenomena hari ini." />
      </Helmet>

      <nav className="bg-black text-white py-4 sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <ul className="hidden md:flex gap-6 text-[10px] font-bold tracking-[0.2em]">
            <li><Link to="/" className="hover:text-yellow-400 transition-colors">BERANDA</Link></li>
            <li><button className="hover:text-yellow-400 transition-colors">ARSIP</button></li>
          </ul>
          <Link to="/" className="text-3xl font-serif font-bold tracking-tighter">Ruang Siasat</Link>
          <div className="flex items-center gap-6">
            <button className="hover:text-yellow-400 transition-colors"><Search size={18} /></button>
            <Link to="/redaksi" className="border border-white text-[10px] px-3 py-1 font-bold tracking-widest hover:bg-white hover:text-black transition-all">
              ADMIN
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {articles.length > 0 && (
          <section className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center mb-20">
            <div className="md:col-span-7">
              <Link to={`/artikel/${articles[0].id}`}>
                <img 
                  src={articles[0].image} 
                  className="w-full h-[500px] object-cover rounded-sm shadow-xl hover:opacity-90 transition" 
                  alt="Hero" 
                />
              </Link>
            </div>
            <div className="md:col-span-5">
              <span className="text-red-600 font-bold text-xs uppercase tracking-[0.3em] mb-4 block">Pilihan Redaksi</span>
              <Link to={`/artikel/${articles[0].id}`}>
                <h1 className="text-5xl font-serif font-bold mb-6 leading-tight text-gray-900 hover:text-gray-600 transition">
                  {articles[0].title}
                </h1>
              </Link>
              <p className="text-lg text-gray-500 font-light leading-relaxed mb-8">{articles[0].excerpt}</p>
              <Link to={`/artikel/${articles[0].id}`} className="border-b-2 border-black pb-1 font-bold text-sm tracking-widest hover:text-gray-500 hover:border-gray-500 transition">
                BACA SELENGKAPNYA →
              </Link>
            </div>
          </section>
        )}

        <section className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {articles.slice(1).map(art => (
            <Link to={`/artikel/${art.id}`} key={art.id} className="group">
              <div className="overflow-hidden mb-5">
                <img src={art.image} className="w-full h-64 object-cover group-hover:scale-105 transition duration-500" alt="Thumbnail" />
              </div>
              <span className="text-blue-600 font-bold text-[10px] uppercase tracking-widest mb-3 block">{art.category}</span>
              <h2 className="text-2xl font-serif font-bold mb-3 group-hover:text-gray-600 transition">{art.title}</h2>
              <p className="text-sm text-gray-500 font-light line-clamp-3 leading-relaxed">{art.excerpt}</p>
            </Link>
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
}