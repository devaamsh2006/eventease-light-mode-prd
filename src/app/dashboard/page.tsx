"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Sparkles,
  TrendingUp,
  CalendarDays,
  UserCheck
} from 'lucide-react';

interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  location: string;
  maxAttendees: number;
  currentAttendees: number;
  organizerId: number;
  organizer?: {
    name: string;
  };
}

interface Registration {
  id: number;
  eventId: number;
  userId: number;
  registrationDate: string;
  status: 'registered' | 'cancelled';
  event: Event;
  attendance?: {
    isPresent: boolean;
  };
}

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user && user.role === 'organizer') {
      router.push('/admin');
      return;
    }

    if (user) {
      fetchRegistrations();
    }
  }, [user, authLoading, router]);

  const fetchRegistrations = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('bearer_token');
      
      const response = await fetch('/api/registrations', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch registrations');
      }

      const data = await response.json();
      setRegistrations(data.registrations || []);
    } catch (error) {
      console.error('Error fetching registrations:', error);
      toast.error('Failed to load your registrations');
    } finally {
      setIsLoading(false);
    }
  };

  const getEventStatus = (event: Event) => {
    const eventDate = new Date(event.date);
    const now = new Date();
    
    if (eventDate < now) {
      return 'past';
    } else if (eventDate.toDateString() === now.toDateString()) {
      return 'today';
    } else {
      return 'upcoming';
    }
  };

  const getStatusBadge = (registration: Registration) => {
    const status = getEventStatus(registration.event);
    const { attendance } = registration;
    
    if (status === 'past') {
      if (attendance) {
        return attendance.isPresent ? (
          <Badge className="glass bg-green-500/20 text-green-600 border-green-500/30">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Attended
          </Badge>
        ) : (
          <Badge className="glass bg-red-500/20 text-red-600 border-red-500/30">
            <XCircle className="w-3 h-3 mr-1" />
            Absent
          </Badge>
        );
      } else {
        return (
          <Badge className="glass bg-gray-500/20 text-gray-600 border-gray-500/30">
            <AlertCircle className="w-3 h-3 mr-1" />
            No Record
          </Badge>
        );
      }
    } else if (status === 'today') {
      return (
        <Badge className="glass bg-orange-500/20 text-orange-600 border-orange-500/30 animate-glow">
          <Clock className="w-3 h-3 mr-1" />
          Today
        </Badge>
      );
    } else {
      return (
        <Badge className="glass bg-blue-500/20 text-blue-600 border-blue-500/30">
          <Calendar className="w-3 h-3 mr-1" />
          Upcoming
        </Badge>
      );
    }
  };

  const upcomingEvents = registrations.filter(r => getEventStatus(r.event) === 'upcoming' || getEventStatus(r.event) === 'today');
  const pastEvents = registrations.filter(r => getEventStatus(r.event) === 'past');
  const attendedEvents = pastEvents.filter(r => r.attendance?.isPresent);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-teal-500/5" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      </div>

      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        {/* Header */}
        <div className="glass rounded-2xl p-8 border-white/20 shadow-2xl animate-fade-in-up">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-transparent rounded-2xl" />
          <div className="relative z-10 flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                  <UserCheck className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gradient">Welcome back, {user.name}!</h1>
                  <p className="text-muted-foreground">Your event dashboard</p>
                </div>
              </div>
            </div>
            <Link href="/events/discover">
              <Button className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 glass border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <Sparkles className="w-4 h-4 mr-2" />
                Discover Events
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <Card className="glass border-white/20 shadow-xl hover-glass">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent rounded-xl" />
            <CardContent className="p-6 relative z-10">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-r from-blue-500/20 to-blue-600/20 rounded-xl">
                  <CalendarDays className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{upcomingEvents.length}</p>
                  <p className="text-sm text-muted-foreground">Upcoming Events</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass border-white/20 shadow-xl hover-glass">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent rounded-xl" />
            <CardContent className="p-6 relative z-10">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-r from-green-500/20 to-green-600/20 rounded-xl">
                  <CheckCircle2 className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{attendedEvents.length}</p>
                  <p className="text-sm text-muted-foreground">Events Attended</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass border-white/20 shadow-xl hover-glass">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent rounded-xl" />
            <CardContent className="p-6 relative z-10">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-r from-purple-500/20 to-purple-600/20 rounded-xl">
                  <TrendingUp className="w-6 h-6 text-purple-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {pastEvents.length > 0 ? Math.round((attendedEvents.length / pastEvents.length) * 100) : 0}%
                  </p>
                  <p className="text-sm text-muted-foreground">Attendance Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Events */}
        <div className="space-y-6 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-foreground">Upcoming Events</h2>
          </div>

          {isLoading ? (
            <div className="grid gap-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="glass border-white/20">
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <Skeleton className="h-5 w-3/4 glass" />
                      <Skeleton className="h-4 w-1/2 glass" />
                      <Skeleton className="h-4 w-full glass" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : upcomingEvents.length === 0 ? (
            <Card className="glass border-white/20 shadow-xl">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-xl" />
              <CardContent className="p-12 text-center relative z-10">
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-2xl flex items-center justify-center mx-auto">
                    <Calendar className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">No upcoming events</h3>
                    <p className="text-muted-foreground">Discover and register for exciting events!</p>
                  </div>
                  <Link href="/events/discover">
                    <Button className="bg-gradient-to-r from-primary to-primary/80 glass border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                      <Sparkles className="w-4 h-4 mr-2" />
                      Browse Events
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {upcomingEvents.map((registration, index) => (
                <Card key={registration.id} className="glass border-white/20 shadow-xl hover-glass animate-slide-in" style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-xl" />
                  <CardContent className="p-6 relative z-10">
                    <div className="flex items-start justify-between">
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <h3 className="text-lg font-semibold text-foreground">{registration.event.title}</h3>
                          {getStatusBadge(registration)}
                        </div>
                        <p className="text-muted-foreground line-clamp-2">{registration.event.description}</p>
                        <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(registration.event.date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{new Date(registration.event.date).toLocaleTimeString()}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-4 h-4" />
                            <span>{registration.event.location}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Users className="w-4 h-4" />
                            <span>{registration.event.currentAttendees}/{registration.event.maxAttendees}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Past Events */}
        {pastEvents.length > 0 && (
          <div className="space-y-6 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-foreground">Past Events</h2>
            </div>

            <div className="grid gap-4">
              {pastEvents.slice(0, 5).map((registration, index) => (
                <Card key={registration.id} className="glass border-white/20 shadow-xl hover-glass animate-slide-in" style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-xl" />
                  <CardContent className="p-6 relative z-10">
                    <div className="flex items-start justify-between">
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <h3 className="text-lg font-semibold text-foreground">{registration.event.title}</h3>
                          {getStatusBadge(registration)}
                        </div>
                        <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(registration.event.date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-4 h-4" />
                            <span>{registration.event.location}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}