"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  User, 
  Menu, 
  X, 
  ChevronDown, 
  LogOut, 
  Settings, 
  UserCircle,
  Shield,
  Loader2
} from "lucide-react";
import { toast } from "sonner";

interface NavBarProps {
  user?: {
    id: number;
    name: string;
    email: string;
    role: "user" | "organizer";
  } | null;
  isLoading?: boolean;
  onSignOut?: () => void;
}

export const NavBar: React.FC<NavBarProps> = ({ 
  user, 
  isLoading = false, 
  onSignOut 
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.mobile-menu') && !target.closest('.mobile-menu-button')) {
        setIsMobileMenuOpen(false);
      }
      if (!target.closest('.user-menu') && !target.closest('.user-menu-button')) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSignOut = async () => {
    if (isSigningOut) return;

    try {
      setIsSigningOut(true);
      
      if (onSignOut) {
        await onSignOut();
      } else {
        // Fallback sign out logic
        const response = await fetch('/api/auth/signout', {
          method: 'POST',
        });

        if (!response.ok) {
          throw new Error('Sign out failed');
        }

        toast.success("Signed out successfully");
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error("Failed to sign out. Please try again.");
    } finally {
      setIsSigningOut(false);
      setIsUserMenuOpen(false);
    }
  };

  const getRoleBadge = (role: "user" | "organizer") => {
    const baseClasses = "inline-flex items-center px-2 py-1 rounded-md text-xs font-medium";
    
    if (role === "organizer") {
      return (
        <span className={`${baseClasses} bg-primary/10 text-primary border border-primary/20`}>
          <Shield className="w-3 h-3 mr-1" />
          Organizer
        </span>
      );
    }
    
    return (
      <span className={`${baseClasses} bg-muted text-muted-foreground`}>
        <User className="w-3 h-3 mr-1" />
        User
      </span>
    );
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link 
                href="/" 
                className="flex items-center space-x-2 text-xl font-bold text-foreground hover:text-primary transition-colors duration-200"
              >
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-sm">E</span>
                </div>
                <span>EventHub</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              {!isLoading && user && (
                <div className="flex items-center space-x-4 text-sm">
                  <Link
                    href="/dashboard"
                    className="text-muted-foreground hover:text-foreground transition-colors duration-200"
                  >
                    Dashboard
                  </Link>
                  {user.role === "organizer" && (
                    <Link
                      href="/admin"
                      className="text-muted-foreground hover:text-foreground transition-colors duration-200"
                    >
                      Admin
                    </Link>
                  )}
                </div>
              )}

              {/* Auth Section */}
              <div className="flex items-center space-x-3">
                {isLoading ? (
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Loading...</span>
                  </div>
                ) : user ? (
                  <div className="relative user-menu">
                    <button
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className="user-menu-button flex items-center space-x-3 p-2 rounded-lg hover:bg-accent transition-colors duration-200"
                    >
                      <div className="flex items-center space-x-2">
                        <UserCircle className="w-5 h-5 text-muted-foreground" />
                        <div className="text-left">
                          <div className="text-sm font-medium text-foreground">{user.name}</div>
                          <div className="flex items-center space-x-2">
                            {getRoleBadge(user.role)}
                          </div>
                        </div>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* User Dropdown Menu */}
                    {isUserMenuOpen && (
                      <div className="absolute right-0 mt-2 w-64 bg-popover border border-border rounded-lg shadow-lg py-2">
                        <div className="px-4 py-2 border-b border-border">
                          <p className="text-sm font-medium text-foreground">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                        
                        <Link
                          href="/profile"
                          className="flex items-center px-4 py-2 text-sm text-foreground hover:bg-accent transition-colors duration-200"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <Settings className="w-4 h-4 mr-3" />
                          Profile Settings
                        </Link>
                        
                        <button
                          onClick={handleSignOut}
                          disabled={isSigningOut}
                          className="w-full flex items-center px-4 py-2 text-sm text-destructive hover:bg-accent transition-colors duration-200 disabled:opacity-50"
                        >
                          {isSigningOut ? (
                            <Loader2 className="w-4 h-4 mr-3 animate-spin" />
                          ) : (
                            <LogOut className="w-4 h-4 mr-3" />
                          )}
                          {isSigningOut ? 'Signing out...' : 'Sign Out'}
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center space-x-3">
                    <Link
                      href="/login"
                      className="px-4 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors duration-200"
                    >
                      Login
                    </Link>
                    <Link
                      href="/register"
                      className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors duration-200"
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="mobile-menu-button md:hidden p-2 rounded-lg hover:bg-accent transition-colors duration-200"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6 text-foreground" />
              ) : (
                <Menu className="w-6 h-6 text-foreground" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="mobile-menu md:hidden bg-popover border-t border-border">
            <div className="px-4 py-3 space-y-3">
              {!isLoading && user && (
                <>
                  <div className="flex items-center space-x-3 pb-3 border-b border-border">
                    <UserCircle className="w-8 h-8 text-muted-foreground" />
                    <div>
                      <div className="text-sm font-medium text-foreground">{user.name}</div>
                      <div className="text-xs text-muted-foreground">{user.email}</div>
                      <div className="mt-1">
                        {getRoleBadge(user.role)}
                      </div>
                    </div>
                  </div>

                  <Link
                    href="/dashboard"
                    className="block py-2 text-sm text-foreground hover:text-primary transition-colors duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>

                  {user.role === "organizer" && (
                    <Link
                      href="/admin"
                      className="block py-2 text-sm text-foreground hover:text-primary transition-colors duration-200"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Admin
                    </Link>
                  )}

                  <Link
                    href="/profile"
                    className="block py-2 text-sm text-foreground hover:text-primary transition-colors duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Profile Settings
                  </Link>

                  <button
                    onClick={handleSignOut}
                    disabled={isSigningOut}
                    className="flex items-center w-full py-2 text-sm text-destructive hover:text-destructive/80 transition-colors duration-200 disabled:opacity-50"
                  >
                    {isSigningOut ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <LogOut className="w-4 h-4 mr-2" />
                    )}
                    {isSigningOut ? 'Signing out...' : 'Sign Out'}
                  </button>
                </>
              )}

              {isLoading && (
                <div className="flex items-center justify-center py-4 text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  <span className="text-sm">Loading...</span>
                </div>
              )}

              {!isLoading && !user && (
                <div className="space-y-3">
                  <Link
                    href="/login"
                    className="block w-full py-3 text-center text-sm font-medium text-foreground hover:text-primary transition-colors duration-200 border border-border rounded-lg"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="block w-full py-3 text-center text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Spacer to prevent content from hiding behind fixed navbar */}
      <div className="h-16" />
    </>
  );
};