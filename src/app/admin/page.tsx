"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Search,
  Filter,
  Download,
  QrCode,
  Scan,
  X,
  Camera,
  Sparkles
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import QrScanner from 'qr-scanner';

interface QRScannerProps {
  onScanSuccess: (data: string) => void;
  onScanError: (error: string) => void;
  isActive: boolean;
}

const QRScannerComponent: React.FC<QRScannerProps> = ({ onScanSuccess, onScanError, isActive }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const qrScannerRef = useRef<QrScanner | null>(null);

  useEffect(() => {
    if (!videoRef.current) return;

    if (isActive) {
      qrScannerRef.current = new QrScanner(
        videoRef.current,
        (result) => {
          console.log('QR Code detected:', result.data);
          onScanSuccess(result.data);
        },
        {
          onDecodeError: (error) => {
            console.log('QR decode error:', error);
            // Don't show errors for every failed decode attempt
          },
          highlightScanRegion: true,
          highlightCodeOutline: true,
          preferredCamera: 'environment', // Use back camera on mobile
        }
      );

      qrScannerRef.current.start().catch((error) => {
        console.error('Failed to start QR scanner:', error);
        onScanError('Failed to access camera. Please ensure camera permissions are granted.');
      });
    }

    return () => {
      if (qrScannerRef.current) {
        qrScannerRef.current.stop();
        qrScannerRef.current.destroy();
        qrScannerRef.current = null;
      }
    };
  }, [isActive, onScanSuccess, onScanError]);

  return (
    <div className="relative w-full max-w-md mx-auto">
      <video
        ref={videoRef}
        className="w-full h-64 object-cover rounded-lg glass border-white/20"
        playsInline
      />
      <div className="absolute inset-0 pointer-events-none">
        <div className="flex items-center justify-center h-full">
          <div className="w-48 h-48 border-2 border-primary rounded-lg animate-pulse" />
        </div>
      </div>
    </div>
  );
};

interface Event {
  id: number;
  title: string;
  description: string;
  eventDate: string;
  location: string;
  maxCapacity: number;
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
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [loadingRegistrations, setLoadingRegistrations] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [scannerDialogOpen, setScannerDialogOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<Event | null>(null);
  const [scannerActive, setScannerActive] = useState(false);
  const [scanningEvent, setScanningEvent] = useState<Event | null>(null);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    maxAttendees: ''
  });

  useEffect(() => {
    if (!isLoading && !user) {
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
  }, [user, isLoading, router]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const fetchEvents = async () => {
    try {
      setLoadingEvents(true);
      const response = await fetch('/api/events', {
        credentials: 'include',
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
      setLoadingEvents(false);
    }
  };

  const fetchRegistrations = async (eventId: number) => {
    try {
      setLoadingRegistrations(true);
      const response = await fetch(`/api/events/${eventId}/registrations`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch registrations');
      }

      const data = await response.json();
      setRegistrations(data.registrations || []);
    } catch (error) {
      console.error('Error fetching registrations:', error);
      toast.error('Failed to load registrations');
    } finally {
      setLoadingRegistrations(false);
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          title: newEvent.title,
          description: newEvent.description,
          eventDate: new Date(newEvent.date).toISOString(),
          location: newEvent.location,
          maxCapacity: parseInt(newEvent.maxAttendees),
          status: 'published'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create event');
      }

      toast.success('Event created successfully!');
      setCreateDialogOpen(false);
      setNewEvent({ title: '', description: '', date: '', location: '', maxAttendees: '' });
      fetchEvents();
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error('Failed to create event');
    }
  };

  const handleQRScanSuccess = async (qrData: string) => {
    if (!scanningEvent) {
      toast.error('No event selected for scanning');
      return;
    }

    try {
      console.log('Scanning QR data:', qrData);
      
      const response = await fetch('/api/attendance/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          qrData: qrData,
          notes: `Scanned at ${new Date().toLocaleString()}`
        }),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(`Attendance marked for ${result.attendeeName}!`);
        // Refresh registrations to show updated attendance
        if (selectedEvent) {
          fetchRegistrations(selectedEvent.id);
        }
        // Close scanner after successful scan
        setScannerDialogOpen(false);
        setScannerActive(false);
      } else {
        toast.error(result.error || 'Failed to mark attendance');
      }
    } catch (error) {
      console.error('Error scanning QR code:', error);
      toast.error('Error processing QR code');
    }
  };

  const handleQRScanError = (error: string) => {
    toast.error(error);
  };

  const openQRScanner = (event: Event) => {
    setScanningEvent(event);
    setScannerDialogOpen(true);
    setScannerActive(true);
  };

  const closeQRScanner = () => {
    setScannerDialogOpen(false);
    setScannerActive(false);
    setScanningEvent(null);
  };

  const viewAttendance = (event: Event) => {
    setSelectedEvent(event);
    fetchRegistrations(event.id);
  };

  const editEvent = (event: Event) => {
    setEventToEdit(event);
    setNewEvent({
      title: event.title,
      description: event.description,
      date: new Date(event.eventDate).toISOString().slice(0, 16),
      location: event.location,
      maxAttendees: event.maxCapacity.toString()
    });
    setEditDialogOpen(true);
  };

  const handleEditEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventToEdit) return;
    
    try {
      const response = await fetch(`/api/events/${eventToEdit.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          title: newEvent.title,
          description: newEvent.description,
          eventDate: new Date(newEvent.date).toISOString(),
          location: newEvent.location,
          maxCapacity: parseInt(newEvent.maxAttendees),
          status: eventToEdit.status
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update event');
      }

      toast.success('Event updated successfully!');
      setEditDialogOpen(false);
      setEventToEdit(null);
      setNewEvent({ title: '', description: '', date: '', location: '', maxAttendees: '' });
      fetchEvents();
    } catch (error) {
      console.error('Error updating event:', error);
      toast.error('Failed to update event');
    }
  };

  const markAttendance = async (registrationId: number, isPresent: boolean) => {
    if (!selectedEvent) return;

    try {
      const response = await fetch(`/api/events/${selectedEvent.id}/attendance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          registrationId,
          isPresent
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to mark attendance');
      }

      toast.success(`Attendance marked as ${isPresent ? 'present' : 'absent'}`);
      fetchRegistrations(selectedEvent.id);
    } catch (error) {
      console.error('Error marking attendance:', error);
      toast.error('Failed to mark attendance');
    }
  };

  const totalEvents = events.length;
  const publishedEvents = events.filter(e => e.status === 'published').length;
  const totalRegistrations = events.reduce((sum, event) => sum + event.currentAttendees, 0);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass p-8 rounded-xl">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-muted-foreground">Loading admin panel...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'organizer') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="glass border-white/20 shadow-2xl max-w-md w-full mx-4">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">Access denied. Organizer role required.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5 p-4 sm:p-6 lg:p-8">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      </div>

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Welcome Header */}
        <div className="glass border-white/20 rounded-2xl p-6 animate-fade-in-up">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center space-x-2">
                <span>Event Management Dashboard</span>
                <Sparkles className="w-6 h-6 text-primary animate-glow" />
              </h1>
              <p className="text-muted-foreground">Welcome back, {user.name}! Manage your events and track attendance.</p>
            </div>
            <Button 
              onClick={() => setCreateDialogOpen(true)}
              className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 glass border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Event
            </Button>
          </div>
        </div>

        {/* Events Management */}
        <div className="animate-fade-in-up delay-300">
          <Tabs defaultValue="events" className="space-y-6">
            <TabsList className="glass border-white/20 bg-white/10">
              <TabsTrigger value="events" className="data-[state=active]:bg-white/20">Events</TabsTrigger>
              <TabsTrigger value="attendance" className="data-[state=active]:bg-white/20">Attendance</TabsTrigger>
            </TabsList>

            <TabsContent value="events" className="space-y-6">
              {/* Events List */}
              {loadingEvents ? (
                <Card className="glass border-white/20 shadow-lg">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      <span className="text-muted-foreground">Loading events...</span>
                    </div>
                  </CardContent>
                </Card>
              ) : events.length === 0 ? (
                <Card className="glass border-white/20 shadow-lg">
                  <CardContent className="pt-6 text-center">
                    <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <p className="text-muted-foreground">You haven't created any events yet.</p>
                    <Button 
                      onClick={() => setCreateDialogOpen(true)}
                      className="mt-4 bg-gradient-to-r from-primary to-primary/80 glass border-white/20"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Your First Event
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {events.map((event, index) => (
                    <Card 
                      key={event.id} 
                      className="glass border-white/20 shadow-lg hover-glass animate-scale-in"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-lg font-semibold text-foreground line-clamp-2">
                            {event.title}
                          </CardTitle>
                          <Badge 
                            variant={event.status === 'published' ? 'default' : 'secondary'}
                            className="glass bg-green-500/20 text-green-700 border-green-500/30"
                          >
                            {event.status}
                          </Badge>
                        </div>
                        <CardDescription className="text-sm text-muted-foreground line-clamp-2">
                          {event.description || 'No description available'}
                        </CardDescription>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center space-x-2 text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(event.eventDate)}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            <span>{formatTime(event.eventDate)}</span>
                          </div>
                          {event.location && (
                            <div className="flex items-center space-x-2 text-muted-foreground">
                              <MapPin className="w-4 h-4" />
                              <span className="line-clamp-1">{event.location}</span>
                            </div>
                          )}
                          <div className="flex items-center space-x-2 text-muted-foreground">
                            <Users className="w-4 h-4" />
                            <span>
                              {event.currentAttendees || 0} registered
                              {event.maxCapacity && ` / ${event.maxCapacity}`}
                            </span>
                          </div>
                        </div>

                        <Separator className="bg-white/20" />

                        <div className="flex flex-wrap gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => openQRScanner(event)}
                            className="glass border-white/20 hover:bg-white/10 text-primary flex-1"
                          >
                            <Scan className="w-4 h-4 mr-1" />
                            Scan QR
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => viewAttendance(event)}
                            className="glass border-white/20 hover:bg-white/10 text-primary flex-1"
                          >
                            <Users className="w-4 h-4 mr-1" />
                            Attendees
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => editEvent(event)}
                            className="glass border-white/20 hover:bg-white/10"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="attendance" className="space-y-6">
              {/* Attendance Management */}
              {selectedEvent ? (
                <Card className="glass border-white/20 shadow-xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-xl" />
                  <CardHeader className="relative z-10">
                    <CardTitle className="text-xl text-foreground">
                      Registrations for "{selectedEvent.title}"
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                      {formatDate(selectedEvent.eventDate)} at {formatTime(selectedEvent.eventDate)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    {loadingRegistrations ? (
                      <div className="text-center py-8">
                        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                        <span className="text-muted-foreground">Loading registrations...</span>
                      </div>
                    ) : registrations.length === 0 ? (
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
                                      <CheckCircle className="w-3 h-3 mr-1" />
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
                                    <CheckCircle className="w-4 h-4 mr-1" />
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

      {/* QR Scanner Dialog */}
      <Dialog open={scannerDialogOpen} onOpenChange={closeQRScanner}>
        <DialogContent className="glass border-white/20 shadow-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-foreground flex items-center space-x-2">
              <Scan className="w-5 h-5 text-primary" />
              <span>QR Code Scanner</span>
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {scanningEvent ? `Scanning for: ${scanningEvent.title}` : 'Point your camera at a QR code to mark attendance'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <QRScannerComponent
                onScanSuccess={handleQRScanSuccess}
                onScanError={handleQRScanError}
                isActive={scannerActive}
              />
              
              <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                <Camera className="w-4 h-4" />
                <span>Position QR code in the center of the frame</span>
              </div>
            </div>

            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                onClick={closeQRScanner}
                className="flex-1 glass border-white/20 hover:bg-white/10"
              >
                <X className="w-4 h-4 mr-2" />
                Close Scanner
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Event Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
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
                  onClick={() => setCreateDialogOpen(false)}
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

      {/* Edit Event Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="glass border-white/20 shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-xl" />
          <div className="relative z-10">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-foreground">Edit Event</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleEditEvent} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Event Title</Label>
                <Input
                  id="edit-title"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                  required
                  className="glass border-white/20 focus-glass"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={newEvent.description}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                  required
                  className="glass border-white/20 focus-glass"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-date">Date & Time</Label>
                  <Input
                    id="edit-date"
                    type="datetime-local"
                    value={newEvent.date}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, date: e.target.value }))}
                    required
                    className="glass border-white/20 focus-glass"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-maxAttendees">Max Attendees</Label>
                  <Input
                    id="edit-maxAttendees"
                    type="number"
                    value={newEvent.maxAttendees}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, maxAttendees: e.target.value }))}
                    required
                    className="glass border-white/20 focus-glass"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-location">Location</Label>
                <Input
                  id="edit-location"
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
                  onClick={() => setEditDialogOpen(false)}
                  className="glass border-white/20"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-primary to-primary/80 glass border-white/20 shadow-lg"
                >
                  Update Event
                </Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}