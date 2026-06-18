'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

export default function RootPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.push('/dashboard');
      } else {
        router.push('/login');
      }
    }
  }, [user, loading, router]);

  return (
    <main className="min-h-screen bg-page-bg flex items-center justify-center transition-colors duration-500">
      <div className="flex flex-col items-center">
        <div className="w-12 h-12 border-t-2 border-r-2 border-indigo-500 rounded-full animate-spin"></div>
        <span className="text-subtitle text-sm mt-4 tracking-wider font-sans">Verifying Session...</span>
      </div>
    </main>
  );
}
