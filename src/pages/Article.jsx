import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Loader } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db, appId } from '../firebase/config';
import { Helmet } from 'react-helmet-async';

export default function Article() {
  const { id } = useParams(); // Mengambil ID dari URL
  const [article, setArticle] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'articles', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          setArticle({
            id: docSnap.id,
            ...data,
            dateString: data.createdAt?.toDate 
              ? data.createdAt.toDate().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) 
              : 'Baru saja'
          });
        } else {
          setError("Artikel tidak ditemukan.");
        }
      } catch (err) {
        setError("Gagal memuat artikel.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticle();
  }, [id]);

  if (isLoading) return <div className="h-screen flex items-center justify-center bg-white"><Loader className="animate-spin text-gray-300" /></div>;
  if (error) return <div className="h-screen flex items-center justify-center text-red-600 font-bold">{error} <Link to="/" className="ml-4 underline text-blue-500">Kembali ke Beranda</Link></div>;

  return (
    <div className="min-h-screen bg-white font-sans">
      <Helmet>
        <title>{article.title} - Ruang Siasat</title>
        <meta name="description" content={article.excerpt} />
      </Helmet>

      <nav className="bg-white border-b border-gray-100 p-4 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2 text-gray-500 hover:text-black transition">
            <ArrowLeft size={18}/> <span className="text-[10px] font-bold tracking-widest uppercase">Kembali</span>
          </Link>
          <div className="font-serif font-bold text-xl text-black">Ruang Siasat</div>
          <div className="w-20"></div>
        </div>
      </nav>

      <article className="max-w-3xl mx-auto px-6 py-20">
        <header className="text-center mb-16">
          <span className="text-blue-600 font-bold text-xs uppercase tracking-[0.3em] mb-4 block">{article.category}</span>
          <h1 className="text-5xl md:text-6xl font-serif font-bold mb-8 leading-tight text-gray-900">{article.title}</h1>
          <div className="text-xs text-gray-400 font-bold tracking-[0.1em] uppercase pb-8 border-b border-gray-100">
            Oleh {article.author} • {article.dateString}
          </div>
        </header>

        <img src={article.image} className="w-full h-auto mb-16 rounded shadow-2xl" alt="Article Cover" />
        
        <div 
          className="prose prose-lg max-w-none font-serif leading-relaxed text-gray-800"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />
      </article>
    </div>
  );
}