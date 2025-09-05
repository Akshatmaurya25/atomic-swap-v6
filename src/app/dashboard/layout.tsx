'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/providers/AppProvider';
import { Card, CardContent } from '@/components/ui/Card';
import { Loader2 } from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const { 
    isAuthenticated, 
    authLoading 
  } = useApp();

  // Redirect to landing page if not authenticated
  React.useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/');
    }
  }, [authLoading, isAuthenticated, router]);

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="text-center py-8">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-yellow-400" />
            <h3 className="text-lg font-semibold mb-2 text-white">Authenticating...</h3>
            <p className="text-gray-400">
              Please wait while we verify your authentication
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Don't render content if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-pulse text-yellow-400">Redirecting to login...</div>
      </div>
    );
  }

  return (
    <>
      {children}
    </>
  );
}