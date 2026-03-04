import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase/config';
import { Loader } from 'lucide-react';

// Import halaman (akan kita isi kodenya setelah ini)
import Home from './pages/Home';
import Article from './pages/Article';
import Admin from './pages/Admin';

export default function App() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Pantau status login editor
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setIsLoading(false);
    });
    return () => unsub();
  }, []);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <Loader className="animate-spin text-gray-300" />
      </div>
    );
  }

  return (
    <HelmetProvider>
      <Router>
        <Routes>
          {/* Rute Pembaca */}
          <Route path="/" element={<Home />} />
          <Route path="/artikel/:id" element={<Article />} />
          
          {/* Rute Redaksi (Aman) */}
          <Route 
            path="/redaksi" 
            element={<Admin user={user} />} 
          />
          
          {/* Tangani URL yang tidak ditemukan */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </HelmetProvider>
  );
}