'use client';

import React from 'react';
import { Navigation } from './Navigation';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col lg:flex-row overflow-x-hidden">
      <Navigation />
      
      {/* Main content */}
      <div className="flex-1 lg:pl-64 min-w-0">
        <main className="py-4 lg:py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-w-0">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}