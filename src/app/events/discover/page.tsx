"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  Search, 
  Filter,
  Sparkles,
  Plus,
  CheckCircle2,
  Star,
  TrendingUp,
  Zap
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
  status: 'draft' | 'published' | 'cancelled';
  organizer?: {
    id: number;
    name: string;
  };
}

export default function EventsDiscoverPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      fetchEvents();
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    // Filter events based on search term and location
    let filtered = events.filter(event => 
      event.status === 'published' &&
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      event.location.toLowerCase().includes(locationFilter.toLowerCase())
    );
    
    // Sort by date (upcoming first)
    filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    setFilteredEvents(filtered);
  }, [events, searchTerm, locationFilter]);

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/events/discover', {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }

      const data = await response.json();
      setEvents(data.events || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load events');
    } finally {
      setIsLoading(false);
    }
  };

  const registerForEvent = async (eventId: number) => {
    if (!user) {
      toast.error('Please log in to register for events');
      router.push('/login');
      return;
    }

    if (user.role !== 'user') {
      toast.error('Only attendees can register for events');
      return;
    }

    try {
      setIsRegistering(eventId);
      const token = localStorage.getItem('bearer_token');
      
      const response = await fetch(`/api/events/${eventId}/register`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Registration failed');
      }

      toast.success('Successfully registered for the event!');
      fetchEvents(); // Refresh events to update attendance count
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error(error.message || 'Failed to register for event');
    } finally {
      setIsRegistering(null);
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

  const getStatusBadge = (event: Event) => {
    const status = getEventStatus(event);
    
    if (status === 'past') {
      return (
        <Badge className="glass bg-gray-500/20 text-gray-600 border-gray-500/30">
          <Clock className="w-3 h-3 mr-1" />
          Past Event
        </Badge>
      );
    } else if (status === 'today') {
      return (
        <Badge className="glass bg-orange-500/20 text-orange-600 border-orange-500/30 animate-glow">
          <Zap className="w-3 h-3 mr-1" />
          Today
        </Badge>
      );
    } else {
      return (
        <Badge className="glass bg-green-500/20 text-green-600 border-green-500/30">
          <Star className="w-3 h-3 mr-1" />
          Upcoming
        </Badge>
      );
    }
  };

  const isEventFull = (event: Event) => {
    return event.currentAttendees >= event.maxAttendees;
  };

  const canRegister = (event: Event) => {
    return (
      user && 
      user.role === 'user' && 
      getEventStatus(event) !== 'past' && 
      !isEventFull(event)
    );
  };

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
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-blue-500/5 to-purple-500/5" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-purple-500/5 rounded-full blur-3xl animate-spin-slow" />
      </div>

      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        {/* Header */}
        <div className="glass rounded-2xl p-8 border-white/20 shadow-2xl animate-fade-in-up">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-transparent rounded-2xl" />
          <div className="relative z-10 text-center space-y-4">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg animate-glow">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gradient">Discover Amazing Events</h1>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Find and register for exciting events happening near you. From workshops to conferences, discover your next great experience.
            </p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="glass rounded-2xl p-6 border-white/20 shadow-xl animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-2xl" />
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 glass border-white/20 focus-glass hover:bg-white/10 transition-all duration-300"
              />
            </div>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Filter by location..."
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="pl-10 glass border-white/20 focus-glass hover:bg-white/10 transition-all duration-300"
              />
            </div>
          </div>
        </div>

        {/* Events Grid */}
        <div className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="glass border-white/20">
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <Skeleton className="h-5 w-3/4 glass" />
                      <Skeleton className="h-4 w-1/2 glass" />
                      <Skeleton className="h-4 w-full glass" />
                      <Skeleton className="h-4 w-2/3 glass" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredEvents.length === 0 ? (
            <Card className="glass border-white/20 shadow-xl">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-xl" />
              <CardContent className="p-12 text-center relative z-10">
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-2xl flex items-center justify-center mx-auto">
                    <Calendar className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">No events found</h3>
                    <p className="text-muted-foreground">
                      {searchTerm || locationFilter ? 'Try adjusting your search filters' : 'No events are currently available'}
                    </p>
                  </div>
                  {(searchTerm || locationFilter) && (
                    <Button
                      onClick={() => {
                        setSearchTerm('');
                        setLocationFilter('');
                      }}
                      variant="outline"
                      className="glass border-white/20 hover:bg-white/10"
                    >
                      Clear Filters
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event, index) => (
                <Card key={event.id} className="glass border-white/20 shadow-xl hover-glass animate-slide-in" style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-xl" />
                  <CardHeader className="relative z-10">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <CardTitle className="text-lg font-semibold text-foreground line-clamp-2">
                          {event.title}
                        </CardTitle>
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(event)}
                          {isEventFull(event) && (
                            <Badge className="glass bg-red-500/20 text-red-600 border-red-500/30">
                              Full
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4 relative z-10">
                    <p className="text-muted-foreground text-sm line-clamp-3">
                      {event.description}
                    </p>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2 text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(event.date).toLocaleDateString()}</span>
                        <Clock className="w-4 h-4 ml-4" />
                        <span>{new Date(event.date).toLocaleTimeString()}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span className="truncate">{event.location}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-muted-foreground">
                        <Users className="w-4 h-4" />
                        <span>{event.currentAttendees}/{event.maxAttendees} attendees</span>
                      </div>
                      {event.organizer && (
                        <div className="flex items-center space-x-2 text-muted-foreground">
                          <div className="w-4 h-4 bg-gradient-to-r from-primary to-primary/70 rounded-full flex items-center justify-center">
                            <span className="text-[8px] text-white font-bold">
                              {event.organizer.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <span className="text-xs">by {event.organizer.name}</span>
                        </div>
                      )}
                    </div>

                    <div className="pt-4">
                      {canRegister(event) ? (
                        <Button
                          onClick={() => registerForEvent(event.id)}
                          disabled={isRegistering === event.id}
                          className="w-full bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white glass border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                        >
                          {isRegistering === event.id ? (
                            <div className="flex items-center space-x-2">
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              <span>Registering...</span>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-2">
                              <Plus className="w-4 h-4" />
                              <span>Register</span>
                            </div>
                          )}
                        </Button>
                      ) : (
                        <Button
                          disabled
                          className="w-full glass bg-gray-500/20 text-gray-500 border-gray-500/30 cursor-not-allowed"
                        >
                          {getEventStatus(event) === 'past' ? (
                            'Event Ended'
                          ) : isEventFull(event) ? (
                            'Event Full'
                          ) : user?.role !== 'user' ? (
                            'Organizers Cannot Register'
                          ) : (
                            'Cannot Register'
                          )}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Load More Button */}
        {filteredEvents.length > 0 && (
          <div className="text-center animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
            <Button
              onClick={fetchEvents}
              variant="outline"
              className="glass border-white/20 hover:bg-white/10 transition-all duration-300 transform hover:scale-105"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Load More Events
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}