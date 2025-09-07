"use client"
import { useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface Session {
  user: User;
}

// Custom session hook for our auth system
export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [isPending, setIsPending] = useState(true);

  const fetchSession = async () => {
    try {
      const response = await fetch('/api/auth/session', {
        credentials: 'include',
      });
      if (response.ok) {
        const sessionData = await response.json();
        setSession(sessionData);
      } else {
        setSession(null);
      }
    } catch (error) {
      console.error('Error fetching session:', error);
      setSession(null);
    } finally {
      setIsPending(false);
    }
  };

  useEffect(() => {
    fetchSession();
  }, []);

  const refetch = () => {
    setIsPending(true);
    fetchSession();
  };

  return {
    data: session,
    isPending,
    refetch,
  };
}

// Auth client for our custom authentication system
export const authClient = {
  signIn: {
    async email(credentials: { email: string; password: string }) {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(credentials),
      });

      const data = await response.json();
      
      if (!response.ok) {
        return { error: { code: data.error || 'SIGNIN_FAILED' } };
      }

      return { data };
    }
  },
  signUp: {
    async email(credentials: { email: string; password: string; name: string; role?: string }) {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...credentials,
          role: credentials.role || 'user'
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        return { error: { code: data.error || 'SIGNUP_FAILED' } };
      }

      return { data };
    }
  },
  async signOut() {
    const response = await fetch('/api/auth/signout', {
      method: 'POST',
      credentials: 'include',
    });

    const data = await response.json();
    
    if (!response.ok) {
      return { error: { code: data.error || 'SIGNOUT_FAILED' } };
    }

    return { data };
  }
};