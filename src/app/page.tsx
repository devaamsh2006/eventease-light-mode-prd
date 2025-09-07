"use client";

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { ArrowRight, Users, Shield, Zap, Globe, ChevronRight, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function Home() {
  const { user, isLoading } = useAuth();

  const features = [
    {
      icon: <Shield className="h-8 w-8 text-primary" />,
      title: "Secure Authentication",
      description: "Enterprise-grade security with role-based access control and session management."
    },
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      title: "User Management", 
      description: "Complete user lifecycle management with registration, profiles, and permissions."
    },
    {
      icon: <Zap className="h-8 w-8 text-primary" />,
      title: "Fast Performance",
      description: "Built with Next.js 15 and modern technologies for lightning-fast load times."
    },
    {
      icon: <Globe className="h-8 w-8 text-primary" />,
      title: "Modern UI/UX",
      description: "Beautiful, responsive design with dark mode support and accessibility features."
    }
  ];

  const stats = [
    { label: "Active Users", value: "10K+" },
    { label: "Uptime", value: "99.9%" },
    { label: "Response Time", value: "<100ms" },
    { label: "Countries", value: "50+" }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-background via-background to-accent/10">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <Badge variant="outline" className="text-sm font-medium">
                🚀 Welcome to EventHub
              </Badge>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground">
                Your Complete
                <span className="text-primary block">Event Management</span>
                Platform
              </h1>
              <p className="max-w-2xl mx-auto text-lg sm:text-xl text-muted-foreground leading-relaxed">
                Streamline your event planning with our powerful, secure, and user-friendly platform. 
                Built for organizers, loved by attendees.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {!isLoading && !user ? (
                <>
                  <Link href="/signup">
                    <Button size="lg" className="w-full sm:w-auto group">
                      Get Started Free
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button variant="outline" size="lg" className="w-full sm:w-auto">
                      Sign In
                    </Button>
                  </Link>
                </>
              ) : !isLoading && user ? (
                <div className="text-center space-y-4">
                  <div className="flex items-center justify-center space-x-2 text-muted-foreground">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span>Welcome back, {user.name}!</span>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Link href="/dashboard">
                      <Button size="lg" className="w-full sm:w-auto group">
                        Go to Dashboard
                        <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                    {user.role === 'organizer' && (
                      <Link href="/admin">
                        <Button variant="outline" size="lg" className="w-full sm:w-auto">
                          Admin Panel
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-2 text-muted-foreground">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <span>Loading...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-foreground">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
              Why Choose EventHub?
            </h2>
            <p className="max-w-2xl mx-auto text-lg text-muted-foreground">
              Built with modern technologies and best practices to deliver exceptional performance and user experience.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="relative group hover:shadow-lg transition-all duration-300 border-border/50">
                <CardHeader className="space-y-4">
                  <div className="p-2 w-fit rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
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

      {/* Testimonials Section */}
      <section className="py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
              What Our Users Say
            </h2>
            <p className="max-w-2xl mx-auto text-lg text-muted-foreground">
              Join thousands of satisfied event organizers and attendees.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Johnson",
                role: "Event Organizer",
                content: "EventHub has transformed how we manage our corporate events. The interface is intuitive and the features are exactly what we need.",
                rating: 5
              },
              {
                name: "Michael Chen",
                role: "Marketing Director",
                content: "The authentication system is rock-solid and the user management features have saved us countless hours. Highly recommended!",
                rating: 5
              },
              {
                name: "Emily Rodriguez",
                role: "Conference Coordinator",
                content: "From registration to event day management, EventHub covers everything. The AI assistant is incredibly helpful too!",
                rating: 5
              }
            ].map((testimonial, index) => (
              <Card key={index} className="hover:shadow-lg transition-all duration-300">
                <CardContent className="pt-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4 italic">"{testimonial.content}"</p>
                  <div className="border-t pt-4">
                    <div className="font-semibold text-foreground">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 space-y-8">
          <h2 className="text-3xl sm:text-4xl font-bold">
            Ready to Get Started?
          </h2>
          <p className="text-lg opacity-90 max-w-2xl mx-auto">
            Join thousands of event organizers who trust EventHub for their event management needs. 
            Start your free account today and experience the difference.
          </p>
          
          {!isLoading && !user && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto group">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
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