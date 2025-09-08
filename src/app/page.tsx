"use client";

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { ArrowRight, Users, Shield, Zap, Globe, ChevronRight, Star, Sparkles, Calendar, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function Home() {
  const { user, isLoading } = useAuth();

  const features = [
    {
      icon: <Shield className="h-8 w-8 text-primary animate-glow" />,
      title: "Secure Authentication",
      description: "Enterprise-grade security with role-based access control and session management.",
      gradient: "glass-primary"
    },
    {
      icon: <Users className="h-8 w-8 text-accent animate-glow" />,
      title: "User Management", 
      description: "Complete user lifecycle management with registration, profiles, and permissions.",
      gradient: "glass-success"
    },
    {
      icon: <Zap className="h-8 w-8 text-yellow-500 animate-glow" />,
      title: "Fast Performance",
      description: "Built with Next.js 15 and modern technologies for lightning-fast load times.",
      gradient: "glass-warning"
    },
    {
      icon: <Globe className="h-8 w-8 text-pink-500 animate-glow" />,
      title: "Modern UI/UX",
      description: "Beautiful, responsive design with dark mode support and accessibility features.",
      gradient: "glass-accent"
    }
  ];

  const stats = [
    { label: "Active Users", value: "10K+", icon: <Users className="h-5 w-5" /> },
    { label: "Uptime", value: "99.9%", icon: <TrendingUp className="h-5 w-5" /> },
    { label: "Response Time", value: "<100ms", icon: <Zap className="h-5 w-5" /> },
    { label: "Events Created", value: "50K+", icon: <Calendar className="h-5 w-5" /> }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Event Organizer",
      content: "EventHub has transformed how we manage our corporate events. The interface is intuitive and the features are exactly what we need.",
      rating: 5,
      avatar: "SJ",
      company: "TechCorp Inc."
    },
    {
      name: "Michael Chen",
      role: "Marketing Director",
      content: "The authentication system is rock-solid and the user management features have saved us countless hours. Highly recommended!",
      rating: 5,
      avatar: "MC",
      company: "Creative Studios"
    },
    {
      name: "Emily Rodriguez",
      role: "Conference Coordinator",
      content: "From registration to event day management, EventHub covers everything. The QR code attendance system is incredibly efficient!",
      rating: 5,
      avatar: "ER",
      company: "Global Events"
    }
  ];

  return (
    <div className="min-h-screen bg-animated">
      {/* ✨ Enhanced Animated Background ✨ */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/30 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/30 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-vibrant-gradient rounded-full blur-3xl animate-spin-slow opacity-20" />
      </div>

      {/* 🚀 Hero Section 🚀 */}
      <section className="relative overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="text-center space-y-8">
            <div className="space-y-6 animate-fade-in-up">
              <Badge variant="outline" className="text-sm font-medium glass-strong hover-glass animate-glow px-6 py-2">
                <Sparkles className="w-4 h-4 mr-2 animate-rainbow" />
                🚀 Welcome to EventHub
              </Badge>
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight text-foreground leading-tight">
                Your Complete
                <span className="block text-rainbow animate-gradient text-glow">
                  Event Management
                </span>
                <span className="block text-3xl sm:text-4xl lg:text-5xl mt-2 text-shimmer">
                  Platform
                </span>
              </h1>
              <p className="max-w-2xl mx-auto text-lg sm:text-xl text-muted-foreground leading-relaxed animate-fade-in-up delay-300">
                Streamline your event planning with our powerful, secure, and user-friendly platform. 
                Built for organizers, loved by attendees.
              </p>
            </div>

            {/* 🎯 Enhanced CTA Buttons 🎯 */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up delay-500">
              {!isLoading && !user ? (
                <>
                  <Link href="/signup">
                    <Button size="lg" className="w-full sm:w-auto group btn-glow hover-lift px-8 py-4">
                      Get Started Free
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button variant="outline" size="lg" className="w-full sm:w-auto glass-strong hover-glass px-8 py-4">
                      Sign In
                    </Button>
                  </Link>
                </>
              ) : !isLoading && user ? (
                <div className="text-center space-y-4 animate-fade-in-up">
                  <div className="flex items-center justify-center space-x-2 text-muted-foreground">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse-color" />
                    <span className="text-glow text-lg">Welcome back, {user.name}!</span>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Link href="/dashboard">
                      <Button size="lg" className="w-full sm:w-auto group btn-glow hover-lift px-8 py-4">
                        Go to Dashboard
                        <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                    {user.role === 'organizer' && (
                      <Link href="/admin">
                        <Button variant="outline" size="lg" className="w-full sm:w-auto glass-strong hover-glass px-8 py-4">
                          Admin Panel
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-2 text-muted-foreground">
                  <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <span>Loading...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 📊 Enhanced Stats Section 📊 */}
      <section className="py-16 relative">
        <div className="absolute inset-0 glass-subtle rounded-3xl mx-4" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="glass-strong hover-lift animate-scale-in rounded-2xl p-6" style={{ animationDelay: `${index * 100}ms` }}>
                  <div className="flex items-center justify-center mb-3 text-primary animate-glow">
                    {stat.icon}
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-foreground mb-2 text-gradient animate-pulse-color">{stat.value}</div>
                  <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 🌟 Enhanced Features Section 🌟 */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16 animate-fade-in-up">
            <h2 className="text-3xl sm:text-4xl font-bold text-rainbow animate-gradient text-glow">
              Why Choose EventHub?
            </h2>
            <p className="max-w-2xl mx-auto text-lg text-muted-foreground">
              Built with modern technologies and best practices to deliver exceptional performance and user experience.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className={`${feature.gradient} hover-lift animate-scale-in rounded-2xl border-0`} style={{ animationDelay: `${index * 100}ms` }}>
                <CardHeader className="space-y-4 pb-4">
                  <div className="p-3 w-fit rounded-xl glass-strong hover-glow">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl text-gradient font-bold">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 💬 Enhanced Testimonials Section 💬 */}
      <section className="py-24 relative">
        <div className="absolute inset-0 glass-subtle rounded-3xl mx-4" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16 animate-fade-in-up">
            <h2 className="text-3xl sm:text-4xl font-bold text-rainbow animate-gradient text-glow">
              What Our Users Say
            </h2>
            <p className="max-w-2xl mx-auto text-lg text-muted-foreground">
              Join thousands of satisfied event organizers and attendees.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="glass-strong hover-lift animate-scale-in rounded-2xl border-0" style={{ animationDelay: `${index * 200}ms` }}>
                <CardContent className="pt-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400 animate-glow" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-6 italic leading-relaxed">"{testimonial.content}"</p>
                  <div className="border-t border-white/20 pt-4 flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full bg-vibrant-gradient flex items-center justify-center text-white font-bold text-sm animate-rainbow">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="font-semibold text-foreground text-gradient">{testimonial.name}</div>
                      <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                      <div className="text-xs text-muted-foreground opacity-75">{testimonial.company}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 🎉 Enhanced CTA Section 🎉 */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-vibrant-gradient animate-gradient opacity-90" />
        <div className="absolute inset-0 glass-subtle" />
        <div className="relative max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="space-y-6 animate-fade-in-up">
            <h2 className="text-3xl sm:text-4xl font-bold text-white text-glow animate-bounce-gentle">
              Ready to Get Started?
            </h2>
            <p className="text-lg text-white/90 max-w-2xl mx-auto leading-relaxed text-shimmer">
              Join thousands of event organizers who trust EventHub for their event management needs. 
              Start your free account today and experience the difference.
            </p>
          </div>
          
          {!isLoading && !user && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up delay-300">
              <Link href="/signup">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto group glass-strong hover-lift animate-glow px-8 py-4">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="w-full sm:w-auto glass-strong hover-glass px-8 py-4 border-white/40 text-white hover:text-foreground">
                  Sign In Now
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}