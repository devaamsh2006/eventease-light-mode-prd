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
  Loader2,
  Calendar,
  Users,
  Sparkles
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
    const baseClasses = "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium backdrop-blur-sm transition-all duration-300";
    
    if (role === "organizer") {
      return (
        <span className={`${baseClasses} bg-gradient-to-r from-primary/20 to-purple-500/20 text-primary border border-primary/30 shadow-sm hover:shadow-md`}>
          <Shield className="w-3 h-3 mr-1" />
          Organizer
        </span>
      );
    }
    
    return (
      <span className={`${baseClasses} bg-gradient-to-r from-blue-500/20 to-teal-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30 shadow-sm`}>
        <User className="w-3 h-3 mr-1" />
        User
      </span>
    );
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-white/10 dark:bg-black/10 border-b border-white/20 shadow-lg">
        <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-transparent to-white/5" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link 
                href="/" 
                className="flex items-center space-x-2 text-xl font-bold text-foreground hover:text-primary transition-all duration-300 group"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-primary to-primary/70 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-105">
                  <Sparkles className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                  EventHub
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              {!isLoading && user && (
                <div className="flex items-center space-x-1 text-sm">
                  <Link
                    href="/dashboard"
                    className="px-4 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/10 backdrop-blur-sm transition-all duration-300 transform hover:scale-105"
                  >
                    Dashboard
                  </Link>
                  {user.role === "user" && (
                    <Link
                      href="/events/discover"
                      className="px-4 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/10 backdrop-blur-sm transition-all duration-300 transform hover:scale-105 flex items-center space-x-1"
                    >
                      <Calendar className="w-4 h-4" />
                      <span>Discover Events</span>
                    </Link>
                  )}
                  {user.role === "organizer" && (
                    <>
                      <Link
                        href="/admin"
                        className="px-4 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/10 backdrop-blur-sm transition-all duration-300 transform hover:scale-105 flex items-center space-x-1"
                      >
                        <Users className="w-4 h-4" />
                        <span>Admin</span>
                      </Link>
                      <Link
                        href="/events/discover"
                        className="px-4 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/10 backdrop-blur-sm transition-all duration-300 transform hover:scale-105 flex items-center space-x-1"
                      >
                        <Calendar className="w-4 h-4" />
                        <span>Events</span>
                      </Link>
                    </>
                  )}
                </div>
              )}

              {/* Auth Section */}
              <div className="flex items-center space-x-3">
                {isLoading ? (
                  <div className="flex items-center space-x-2 text-muted-foreground backdrop-blur-sm bg-white/10 px-3 py-2 rounded-lg">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Loading...</span>
                  </div>
                ) : user ? (
                  <div className="relative user-menu">
                    <button
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className="user-menu-button flex items-center space-x-3 p-3 rounded-xl hover:bg-white/10 backdrop-blur-sm transition-all duration-300 transform hover:scale-105 border border-white/20 shadow-sm hover:shadow-lg"
                    >
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-primary/70 flex items-center justify-center text-white font-semibold text-sm shadow-lg">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="text-left">
                          <div className="text-sm font-medium text-foreground">{user.name}</div>
                          <div className="flex items-center space-x-2 mt-1">
                            {getRoleBadge(user.role)}
                          </div>
                        </div>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-muted-foreground transition-all duration-300 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* User Dropdown Menu */}
                    {isUserMenuOpen && (
                      <div className="absolute right-0 mt-2 w-72 backdrop-blur-xl bg-white/10 dark:bg-black/10 border border-white/20 rounded-2xl shadow-2xl py-2 animate-fade-in">
                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-2xl" />
                        <div className="relative px-4 py-3 border-b border-white/20">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-primary/70 flex items-center justify-center text-white font-semibold shadow-lg">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-foreground">{user.name}</p>
                              <p className="text-xs text-muted-foreground">{user.email}</p>
                              <div className="mt-1">
                                {getRoleBadge(user.role)}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <Link
                          href="/profile"
                          className="relative flex items-center px-4 py-3 text-sm text-foreground hover:bg-white/10 transition-all duration-300 group"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <Settings className="w-4 h-4 mr-3 group-hover:rotate-12 transition-transform duration-300" />
                          Profile Settings
                        </Link>
                        
                        <button
                          onClick={handleSignOut}
                          disabled={isSigningOut}
                          className="relative w-full flex items-center px-4 py-3 text-sm text-destructive hover:bg-red-500/10 transition-all duration-300 disabled:opacity-50 group"
                        >
                          {isSigningOut ? (
                            <Loader2 className="w-4 h-4 mr-3 animate-spin" />
                          ) : (
                            <LogOut className="w-4 h-4 mr-3 group-hover:-translate-x-1 transition-transform duration-300" />
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
                      className="px-4 py-2 text-sm font-medium text-foreground hover:text-primary backdrop-blur-sm hover:bg-white/10 rounded-lg transition-all duration-300 transform hover:scale-105"
                    >
                      Login
                    </Link>
                    <Link
                      href="/signup"
                      className="px-6 py-2 text-sm font-medium bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-lg hover:from-primary/90 hover:to-primary/70 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl backdrop-blur-sm border border-white/20"
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
              className="mobile-menu-button md:hidden p-2 rounded-lg hover:bg-white/10 backdrop-blur-sm transition-all duration-300 transform hover:scale-105 border border-white/20"
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
          <div className="mobile-menu md:hidden backdrop-blur-xl bg-white/10 dark:bg-black/10 border-t border-white/20 animate-fade-in">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
            <div className="relative px-4 py-4 space-y-3">
              {!isLoading && user && (
                <>
                  <div className="flex items-center space-x-3 pb-4 border-b border-white/20">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-primary/70 flex items-center justify-center text-white font-semibold shadow-lg">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
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
                    className="flex items-center space-x-2 py-3 px-4 text-sm text-foreground hover:text-primary backdrop-blur-sm hover:bg-white/10 rounded-lg transition-all duration-300"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <UserCircle className="w-4 h-4" />
                    <span>Dashboard</span>
                  </Link>

                  {user.role === "user" && (
                    <Link
                      href="/events/discover"
                      className="flex items-center space-x-2 py-3 px-4 text-sm text-foreground hover:text-primary backdrop-blur-sm hover:bg-white/10 rounded-lg transition-all duration-300"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Calendar className="w-4 h-4" />
                      <span>Discover Events</span>
                    </Link>
                  )}

                  {user.role === "organizer" && (
                    <>
                      <Link
                        href="/admin"
                        className="flex items-center space-x-2 py-3 px-4 text-sm text-foreground hover:text-primary backdrop-blur-sm hover:bg-white/10 rounded-lg transition-all duration-300"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Users className="w-4 h-4" />
                        <span>Admin</span>
                      </Link>
                      <Link
                        href="/events/discover"
                        className="flex items-center space-x-2 py-3 px-4 text-sm text-foreground hover:text-primary backdrop-blur-sm hover:bg-white/10 rounded-lg transition-all duration-300"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Calendar className="w-4 h-4" />
                        <span>Events</span>
                      </Link>
                    </>
                  )}

                  <Link
                    href="/profile"
                    className="flex items-center space-x-2 py-3 px-4 text-sm text-foreground hover:text-primary backdrop-blur-sm hover:bg-white/10 rounded-lg transition-all duration-300"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Settings className="w-4 h-4" />
                    <span>Profile Settings</span>
                  </Link>

                  <button
                    onClick={handleSignOut}
                    disabled={isSigningOut}
                    className="flex items-center space-x-2 w-full py-3 px-4 text-sm text-destructive backdrop-blur-sm hover:bg-red-500/10 rounded-lg transition-all duration-300 disabled:opacity-50"
                  >
                    {isSigningOut ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <LogOut className="w-4 h-4" />
                    )}
                    <span>{isSigningOut ? 'Signing out...' : 'Sign Out'}</span>
                  </button>
                </>
              )}

              {isLoading && (
                <div className="flex items-center justify-center py-4 text-muted-foreground backdrop-blur-sm bg-white/10 rounded-lg">
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  <span className="text-sm">Loading...</span>
                </div>
              )}

              {!isLoading && !user && (
                <div className="space-y-3">
                  <Link
                    href="/login"
                    className="block w-full py-3 text-center text-sm font-medium text-foreground hover:text-primary backdrop-blur-sm border border-white/20 rounded-lg hover:bg-white/10 transition-all duration-300"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    className="block w-full py-3 text-center text-sm font-medium bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-lg hover:from-primary/90 hover:to-primary/70 transition-all duration-300 shadow-lg backdrop-blur-sm border border-white/20"
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