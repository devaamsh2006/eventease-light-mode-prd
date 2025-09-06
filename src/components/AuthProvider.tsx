"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authClient, useSession } from '@/lib/auth-client';
import { toast } from 'sonner';
import NavBar from '@/components/NavBar';

interface AuthContextType {
  user: any;
  isLoading: boolean;
  signOut: () => Promise<void>;
  refetchSession: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const { data: session, isPending, refetch } = useSession();
  const router = useRouter();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!isPending) {
      setIsInitialized(true);
    }
  }, [isPending]);

  const handleSignOut = async () => {
    try {
      const { error } = await authClient.signOut();
      if (error?.code) {
        toast.error('Sign out failed. Please try again.');
      } else {
        localStorage.removeItem("bearer_token");
        refetch(); // Update session state
        toast.success('Signed out successfully');
        router.push('/');
      }
    } catch (error) {
      toast.error('An error occurred during sign out');
    }
  };

  const contextValue: AuthContextType = {
    user: session?.user || null,
    isLoading: isPending || !isInitialized,
    signOut: handleSignOut,
    refetchSession: refetch,
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="text-muted-foreground">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={contextValue}>
      <div className="min-h-screen bg-background">
        <NavBar 
          user={session?.user || null}
          isLoading={isPending}
          onSignOut={handleSignOut}
        />
        <main className="pt-16">
          {children}
        </main>
      </div>
    </AuthContext.Provider>
  );
};