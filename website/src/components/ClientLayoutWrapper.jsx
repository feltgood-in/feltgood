'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Footer from './Footer';

export default function ClientLayoutWrapper({ children, initialCategories = [] }) {
  const pathname = usePathname();
  const isAdmin = pathname && pathname.startsWith('/admin');

  return (
    <div className="app-container">
      {!isAdmin && (
        <React.Suspense fallback={<div>Loading navigation...</div>}>
          <Navbar initialCategories={initialCategories} />
        </React.Suspense>
      )}
      {children}
      {!isAdmin && <Footer />}
    </div>
  );
}
