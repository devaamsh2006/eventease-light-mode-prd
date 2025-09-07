"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Plus, 
  Calendar, 
  MapPin, 
  Users, 
  Edit, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  Clock,
  Sparkles,
  TrendingUp,
  CalendarDays,
  Shield,
  UserCheck,
  Settings
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
}

interface Registration {
  id: number;
  eventId: number;
  userId: number;
  registrationDate: string;
  status: 'registered' | 'cancelled';
  user: {
    id: number;
    name: string;
    email: string;
  };
  attendance?: {
    id: number;
    isPresent: boolean;
    markedAt: string;
  };
}

export default function AdminPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    maxAttendees: ''
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user && user.role !== 'organizer') {
      router.push('/dashboard');
      return;
    }

    if (user) {
      fetchEvents();
    }
  }, [user, authLoading, router]);

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('bearer_token');
      
      const response = await fetch('/api/events', {
        headers: {
          'Authorization': `Bearer ${token}`,
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

  const fetchRegistrations = async (eventId: number) => {
    try {
      const token = localStorage.getItem('bearer_token');
      
      const response = await fetch(`/api/events/${eventId}/registrations`, {
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
      toast.error('Failed to load registrations');
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('bearer_token');
      
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newEvent,
          maxAttendees: parseInt(newEvent.maxAttendees),
          date: new Date(newEvent.date).toISOString()
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create event');
      }

      toast.success('Event created successfully!');
      setIsCreateDialogOpen(false);
      setNewEvent({ title: '', description: '', date: '', location: '', maxAttendees: '' });
      fetchEvents();
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error('Failed to create event');
    }
  };

  const markAttendance = async (registrationId: number, isPresent: boolean) => {
    try {
      const token = localStorage.getItem('bearer_token');
      
      const response = await fetch(`/api/events/${selectedEvent?.id}/attendance`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          registrationId,
          isPresent
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to mark attendance');
      }

      toast.success(`Attendance marked as ${isPresent ? 'present' : 'absent'}`);
      if (selectedEvent) {
        fetchRegistrations(selectedEvent.id);
      }
    } catch (error) {
      console.error('Error marking attendance:', error);
      toast.error('Failed to mark attendance');
    }
  };

  const totalEvents = events.length;
  const publishedEvents = events.filter(e => e.status === 'published').length;
  const totalRegistrations = events.reduce((sum, event) => sum + event.currentAttendees, 0);

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
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-primary/5 to-orange-500/5" />
        <div className="absolute top-0 right-1/3 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }} />
      </div>

      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        {/* Header */}
        <div className="glass rounded-2xl p-8 border-white/20 shadow-2xl animate-fade-in-up">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-transparent rounded-2xl" />
          <div className="relative z-10 flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-primary rounded-xl flex items-center justify-center shadow-lg">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gradient">Admin Dashboard</h1>
                  <p className="text-muted-foreground">Manage your events and attendees</p>
                </div>
              </div>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 glass border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Event
                </Button>
              </DialogTrigger>
              <DialogContent className="glass border-white/20 shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-xl" />
                <div className="relative z-10">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-foreground">Create New Event</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateEvent} className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Event Title</Label>
                      <Input
                        id="title"
                        value={newEvent.title}
                        onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                        required
                        className="glass border-white/20 focus-glass"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={newEvent.description}
                        onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                        required
                        className="glass border-white/20 focus-glass"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="date">Date & Time</Label>
                        <Input
                          id="date"
                          type="datetime-local"
                          value={newEvent.date}
                          onChange={(e) => setNewEvent(prev => ({ ...prev, date: e.target.value }))}
                          required
                          className="glass border-white/20 focus-glass"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="maxAttendees">Max Attendees</Label>
                        <Input
                          id="maxAttendees"
                          type="number"
                          value={newEvent.maxAttendees}
                          onChange={(e) => setNewEvent(prev => ({ ...prev, maxAttendees: e.target.value }))}
                          required
                          className="glass border-white/20 focus-glass"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={newEvent.location}
                        onChange={(e) => setNewEvent(prev => ({ ...prev, location: e.target.value }))}
                        required
                        className="glass border-white/20 focus-glass"
                      />
                    </div>
                    <div className="flex justify-end space-x-2 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsCreateDialogOpen(false)}
                        className="glass border-white/20"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        className="bg-gradient-to-r from-primary to-primary/80 glass border-white/20 shadow-lg"
                      >
                        Create Event
                      </Button>
                    </div>
                  </form>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <Card className="glass border-white/20 shadow-xl hover-glass">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent rounded-xl" />
            <CardContent className="p-6 relative z-10">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-r from-purple-500/20 to-purple-600/20 rounded-xl">
                  <CalendarDays className="w-6 h-6 text-purple-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{totalEvents}</p>
                  <p className="text-sm text-muted-foreground">Total Events</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass border-white/20 shadow-xl hover-glass">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent rounded-xl" />
            <CardContent className="p-6 relative z-10">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-r from-green-500/20 to-green-600/20 rounded-xl">
                  <UserCheck className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{totalRegistrations}</p>
                  <p className="text-sm text-muted-foreground">Total Registrations</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass border-white/20 shadow-xl hover-glass">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent rounded-xl" />
            <CardContent className="p-6 relative z-10">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-r from-blue-500/20 to-blue-600/20 rounded-xl">
                  <TrendingUp className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{publishedEvents}</p>
                  <p className="text-sm text-muted-foreground">Published Events</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="events" className="space-y-6 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <TabsList className="glass border-white/20 bg-white/10">
            <TabsTrigger value="events" className="glass hover:bg-white/20">Events</TabsTrigger>
            <TabsTrigger value="registrations" className="glass hover:bg-white/20">Registrations</TabsTrigger>
          </TabsList>

          <TabsContent value="events" className="space-y-4">
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
            ) : events.length === 0 ? (
              <Card className="glass border-white/20 shadow-xl">
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-xl" />
                <CardContent className="p-12 text-center relative z-10">
                  <div className="space-y-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-2xl flex items-center justify-center mx-auto">
                      <Calendar className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">No events yet</h3>
                      <p className="text-muted-foreground">Create your first event to get started!</p>
                    </div>
                    <Button
                      onClick={() => setIsCreateDialogOpen(true)}
                      className="bg-gradient-to-r from-primary to-primary/80 glass border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Event
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {events.map((event, index) => (
                  <Card key={event.id} className="glass border-white/20 shadow-xl hover-glass animate-slide-in" style={{ animationDelay: `${index * 0.1}s` }}>
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-xl" />
                    <CardContent className="p-6 relative z-10">
                      <div className="flex items-start justify-between">
                        <div className="space-y-3 flex-1">
                          <div className="flex items-center space-x-3">
                            <h3 className="text-lg font-semibold text-foreground">{event.title}</h3>
                            <Badge className={`glass ${
                              event.status === 'published' 
                                ? 'bg-green-500/20 text-green-600 border-green-500/30' 
                                : event.status === 'draft'
                                ? 'bg-yellow-500/20 text-yellow-600 border-yellow-500/30'
                                : 'bg-red-500/20 text-red-600 border-red-500/30'
                            }`}>
                              {event.status}
                            </Badge>
                          </div>
                          <p className="text-muted-foreground line-clamp-2">{event.description}</p>
                          <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
                              <span>{new Date(event.date).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="w-4 h-4" />
                              <span>{new Date(event.date).toLocaleTimeString()}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <MapPin className="w-4 h-4" />
                              <span>{event.location}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Users className="w-4 h-4" />
                              <span>{event.currentAttendees}/{event.maxAttendees}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedEvent(event);
                              fetchRegistrations(event.id);
                            }}
                            className="glass hover:bg-white/20"
                          >
                            <Settings className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="registrations" className="space-y-4">
            {selectedEvent ? (
              <Card className="glass border-white/20 shadow-xl">
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-xl" />
                <CardHeader className="relative z-10">
                  <CardTitle className="text-xl text-foreground">
                    Registrations for "{selectedEvent.title}"
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative z-10">
                  {registrations.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No registrations yet for this event.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {registrations.map((registration) => (
                        <div key={registration.id} className="flex items-center justify-between p-4 glass rounded-lg border-white/20">
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-gradient-to-r from-primary to-primary/70 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                              {registration.user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{registration.user.name}</p>
                              <p className="text-sm text-muted-foreground">{registration.user.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {registration.attendance ? (
                              <Badge className={`glass ${
                                registration.attendance.isPresent
                                  ? 'bg-green-500/20 text-green-600 border-green-500/30'
                                  : 'bg-red-500/20 text-red-600 border-red-500/30'
                              }`}>
                                {registration.attendance.isPresent ? (
                                  <>
                                    <CheckCircle2 className="w-3 h-3 mr-1" />
                                    Present
                                  </>
                                ) : (
                                  <>
                                    <XCircle className="w-3 h-3 mr-1" />
                                    Absent
                                  </>
                                )}
                              </Badge>
                            ) : (
                              <div className="flex space-x-2">
                                <Button
                                  size="sm"
                                  onClick={() => markAttendance(registration.id, true)}
                                  className="bg-green-500/20 hover:bg-green-500/30 text-green-600 glass border-green-500/30"
                                >
                                  <CheckCircle2 className="w-4 h-4 mr-1" />
                                  Present
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => markAttendance(registration.id, false)}
                                  className="bg-red-500/20 hover:bg-red-500/30 text-red-600 glass border-red-500/30"
                                >
                                  <XCircle className="w-4 h-4 mr-1" />
                                  Absent
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className="glass border-white/20 shadow-xl">
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-xl" />
                <CardContent className="p-12 text-center relative z-10">
                  <div className="space-y-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-2xl flex items-center justify-center mx-auto">
                      <Users className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">Select an event</h3>
                      <p className="text-muted-foreground">Choose an event from the Events tab to view registrations</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}