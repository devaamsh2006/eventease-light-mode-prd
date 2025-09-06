"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Metadata } from 'next'
import Dashboard from '@/components/Dashboard'
import { useAuth } from '@/components/AuthProvider';

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="text-muted-foreground">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return null; // Will redirect via useEffect
  }

  // Show access denied if user is not an organizer
  if (user.role !== 'organizer') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-foreground">Access Denied</h1>
          <p className="text-muted-foreground">
            You need organizer permissions to access this dashboard.
          </p>
          <button 
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <main 
        role="main" 
        className="min-h-screen bg-background"
        aria-label="Event organizer dashboard"
      >
        <div className="h-screen flex flex-col">
          <Dashboard />
        </div>
      </main>
    </>
  )
}