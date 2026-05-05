'use client';

import { ReactNode } from 'react';
import { Navbar } from './navbar';
import { Footer } from './footer';

export function ProtectedLayoutClient({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-warm-50 flex flex-col">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {children}
      </main>
      <Footer />
    </div>
  );
}