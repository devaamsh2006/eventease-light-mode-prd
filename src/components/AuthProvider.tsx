"use client";

import React, { createContext, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { authClient, useSession } from '@/lib/auth-client';
import { toast } from 'sonner';
import { NavBar } from '@/components/NavBar';
import { AIAssistant } from '@/components/AIAssistantPopup';

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

export default function AuthProvider({ children }: AuthProviderProps) {
  const { data: session, isPending, refetch } = useSession();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      const { error } = await authClient.signOut();
      if (error?.code) {
        toast.error('Sign out failed. Please try again.');
      } else {
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
    isLoading: isPending,
    signOut: handleSignOut,
    refetchSession: refetch,
  };

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
        <AIAssistant />
      </div>
    </AuthContext.Provider>
  );
}