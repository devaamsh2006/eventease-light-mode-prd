"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  CalendarDays, 
  Users, 
  MapPin, 
  Plus, 
  Edit, 
  Eye, 
  Trash2, 
  UserCheck, 
  Search, 
  Filter,
  MoreHorizontal,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface Event {
  id: number;
  title: string;
  description?: string;
  eventDate: string;
  location?: string;
  maxAttendees?: number;
  organizerId: number;
  status: 'draft' | 'published' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  registrationCount?: number;
  totalRegistrations?: number;
}

interface Registration {
  id: number;
  eventId: number;
  userId: number;
  registrationDate: string;
  status: 'registered' | 'cancelled';
  createdAt: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
}

interface AttendanceRecord {
  registrationId: number;
  registrationDate: string;
  registrationStatus: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
  attendance: {
    id?: number;
    isPresent: boolean;
    markedAt?: string;
    markedBy?: number;
    notes?: string;
  };
}

interface EventFormData {
  title: string;
  description: string;
  eventDate: string;
  location: string;
  maxAttendees: string;
  status: 'draft' | 'published' | 'cancelled';
}

export default function OrganizerDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentTab, setCurrentTab] = useState('overview');
  
  // Form states
  const [showEventDialog, setShowEventDialog] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [eventFormData, setEventFormData] = useState<EventFormData>({
    title: '',
    description: '',
    eventDate: '',
    location: '',
    maxAttendees: '',
    status: 'published'
  });

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('eventDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Statistics
  const [stats, setStats] = useState({
    totalEvents: 0,
    activeEvents: 0,
    totalRegistrations: 0,
    upcomingEvents: 0
  });

  // Authentication check
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login');
        return;
      }
      if (user.role !== 'organizer') {
        router.push('/dashboard');
        return;
      }
    }
  }, [user, authLoading, router]);

  // Fetch events
  const fetchEvents = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const params = new URLSearchParams({
        organizer_id: user.id.toString(),
        limit: '100',
        sort: sortBy,
        order: sortOrder
      });

      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter !== 'all') params.append('status', statusFilter);

      const response = await fetch(`/api/events?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch events');
      
      const eventsData = await response.json();
      setEvents(eventsData);

      // Calculate statistics
      const now = new Date().toISOString();
      const totalEvents = eventsData.length;
      const activeEvents = eventsData.filter((e: Event) => e.status === 'published').length;
      const upcomingEvents = eventsData.filter((e: Event) => 
        e.status === 'published' && e.eventDate > now
      ).length;

      // Get total registrations count by fetching registration counts for each event
      const registrationPromises = eventsData.map(async (event: Event) => {
        try {
          const regResponse = await fetch(`/api/events/${event.id}/registrations?eventId=${event.id}&limit=1000`);
          if (regResponse.ok) {
            const regData = await regResponse.json();
            return regData.registrations?.filter((r: Registration) => r.status === 'registered').length || 0;
          }
          return 0;
        } catch {
          return 0;
        }
      });

      const registrationCounts = await Promise.all(registrationPromises);
      const totalRegistrations = registrationCounts.reduce((sum, count) => sum + count, 0);

      setStats({
        totalEvents,
        activeEvents,
        totalRegistrations,
        upcomingEvents
      });

    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  }, [user, searchTerm, statusFilter, sortBy, sortOrder]);

  // Fetch registrations for selected event
  const fetchRegistrations = useCallback(async (eventId: number) => {
    try {
      const response = await fetch(`/api/events/${eventId}/registrations?eventId=${eventId}&limit=1000`);
      if (!response.ok) throw new Error('Failed to fetch registrations');
      
      const data = await response.json();
      setRegistrations(data.registrations || []);
    } catch (error) {
      console.error('Error fetching registrations:', error);
      toast.error('Failed to load registrations');
    }
  }, []);

  // Fetch attendance records
  const fetchAttendance = useCallback(async (eventId: number) => {
    try {
      const response = await fetch(`/api/events/${eventId}/attendance?eventId=${eventId}&limit=1000`);
      if (!response.ok) throw new Error('Failed to fetch attendance');
      
      const data = await response.json();
      setAttendanceRecords(data);
    } catch (error) {
      console.error('Error fetching attendance:', error);
      toast.error('Failed to load attendance records');
    }
  }, []);

  // Initial data load
  useEffect(() => {
    if (user && user.role === 'organizer') {
      fetchEvents();
    }
  }, [fetchEvents, user]);

  // Handle form submission
  const handleEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setSubmitting(true);

      const formData = {
        title: eventFormData.title.trim(),
        description: eventFormData.description.trim() || undefined,
        eventDate: new Date(eventFormData.eventDate).toISOString(),
        location: eventFormData.location.trim() || undefined,
        maxAttendees: eventFormData.maxAttendees ? parseInt(eventFormData.maxAttendees) : undefined,
        status: eventFormData.status
      };

      let response;
      if (editingEvent) {
        response = await fetch(`/api/events?id=${editingEvent.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      } else {
        response = await fetch('/api/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save event');
      }

      toast.success(editingEvent ? 'Event updated successfully' : 'Event created successfully');
      setShowEventDialog(false);
      resetForm();
      fetchEvents();

    } catch (error) {
      console.error('Error saving event:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save event');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle event deletion
  const handleDeleteEvent = async (eventId: number) => {
    if (!confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/events?id=${eventId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete event');
      }

      toast.success('Event deleted successfully');
      fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete event');
    }
  };

  // Handle attendance marking
  const handleMarkAttendance = async (registrationId: number, isPresent: boolean, notes?: string) => {
    try {
      const response = await fetch(`/api/events/${selectedEvent?.id}/attendance?registrationId=${registrationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPresent, notes })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to mark attendance');
      }

      toast.success(`Attendance marked as ${isPresent ? 'present' : 'absent'}`);
      if (selectedEvent) {
        fetchAttendance(selectedEvent.id);
      }
    } catch (error) {
      console.error('Error marking attendance:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to mark attendance');
    }
  };

  // Utility functions
  const resetForm = () => {
    setEventFormData({
      title: '',
      description: '',
      eventDate: '',
      location: '',
      maxAttendees: '',
      status: 'published'
    });
    setEditingEvent(null);
  };

  const openEditDialog = (event: Event) => {
    setEditingEvent(event);
    setEventFormData({
      title: event.title,
      description: event.description || '',
      eventDate: event.eventDate.split('T')[0],
      location: event.location || '',
      maxAttendees: event.maxAttendees?.toString() || '',
      status: event.status
    });
    setShowEventDialog(true);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      published: { color: 'bg-green-100 text-green-800', label: 'Published' },
      draft: { color: 'bg-yellow-100 text-yellow-800', label: 'Draft' },
      cancelled: { color: 'bg-red-100 text-red-800', label: 'Cancelled' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.published;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = !searchTerm || 
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || event.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (authLoading || (authLoading && loading)) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          <Skeleton className="h-8 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'organizer') {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Event Organizer Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {user.name}!</p>
          </div>
          <Button onClick={() => setShowEventDialog(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Create New Event
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Events</CardTitle>
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalEvents}</div>
              <p className="text-xs text-muted-foreground">All time events created</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Events</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeEvents}</div>
              <p className="text-xs text-muted-foreground">Currently published</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Registrations</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRegistrations}</div>
              <p className="text-xs text-muted-foreground">Across all events</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.upcomingEvents}</div>
              <p className="text-xs text-muted-foreground">Published and upcoming</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Events Overview</TabsTrigger>
            <TabsTrigger value="registrations">Registrations</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
          </TabsList>

          {/* Events Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Events</CardTitle>
                <CardDescription>Manage all your events from one place</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Search events..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="max-w-sm"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
                    const [field, order] = value.split('-');
                    setSortBy(field);
                    setSortOrder(order as 'asc' | 'desc');
                  }}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="eventDate-desc">Date (Newest)</SelectItem>
                      <SelectItem value="eventDate-asc">Date (Oldest)</SelectItem>
                      <SelectItem value="title-asc">Title (A-Z)</SelectItem>
                      <SelectItem value="title-desc">Title (Z-A)</SelectItem>
                      <SelectItem value="createdAt-desc">Created (Newest)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Events Table */}
                {loading ? (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-16" />
                    ))}
                  </div>
                ) : filteredEvents.length === 0 ? (
                  <div className="text-center py-12">
                    <CalendarDays className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold">No events found</h3>
                    <p className="text-muted-foreground">
                      {searchTerm || statusFilter !== 'all' 
                        ? 'Try adjusting your filters' 
                        : 'Create your first event to get started'}
                    </p>
                  </div>
                ) : (
                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Event</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Registrations</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredEvents.map((event) => (
                          <TableRow key={event.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{event.title}</div>
                                {event.description && (
                                  <div className="text-sm text-muted-foreground truncate max-w-xs">
                                    {event.description}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                {formatDate(event.eventDate)}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1 text-sm">
                                {event.location && (
                                  <>
                                    <MapPin className="h-3 w-3" />
                                    <span className="truncate max-w-xs">{event.location}</span>
                                  </>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(event.status)}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1 text-sm">
                                <Users className="h-3 w-3" />
                                <span>
                                  {registrations.filter(r => r.eventId === event.id && r.status === 'registered').length}
                                  {event.maxAttendees && `/${event.maxAttendees}`}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openEditDialog(event)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedEvent(event);
                                    fetchRegistrations(event.id);
                                    setCurrentTab('registrations');
                                  }}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedEvent(event);
                                    fetchAttendance(event.id);
                                    setCurrentTab('attendance');
                                  }}
                                >
                                  <UserCheck className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteEvent(event.id)}
                                  className="text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Registrations Tab */}
          <TabsContent value="registrations" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Event Registrations</CardTitle>
                    <CardDescription>
                      {selectedEvent ? `Viewing registrations for: ${selectedEvent.title}` : 'Select an event to view registrations'}
                    </CardDescription>
                  </div>
                  {selectedEvent && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedEvent(null);
                        setRegistrations([]);
                      }}
                    >
                      <ChevronLeft className="h-4 w-4 mr-2" />
                      Back to Events
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {!selectedEvent ? (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold">Select an Event</h3>
                    <p className="text-muted-foreground">Choose an event from the overview tab to view its registrations</p>
                  </div>
                ) : registrations.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold">No registrations yet</h3>
                    <p className="text-muted-foreground">When people register for this event, they'll appear here</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Total: {registrations.length}</span>
                      <span>Active: {registrations.filter(r => r.status === 'registered').length}</span>
                      <span>Cancelled: {registrations.filter(r => r.status === 'cancelled').length}</span>
                    </div>
                    
                    <div className="border rounded-lg">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Participant</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Registration Date</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {registrations.map((registration) => (
                            <TableRow key={registration.id}>
                              <TableCell>
                                <div className="font-medium">{registration.user.name}</div>
                              </TableCell>
                              <TableCell>{registration.user.email}</TableCell>
                              <TableCell>{formatDate(registration.registrationDate)}</TableCell>
                              <TableCell>
                                <Badge className={registration.status === 'registered' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                                }>
                                  {registration.status}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Attendance Tab */}
          <TabsContent value="attendance" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Attendance Tracking</CardTitle>
                    <CardDescription>
                      {selectedEvent ? `Mark attendance for: ${selectedEvent.title}` : 'Select an event to track attendance'}
                    </CardDescription>
                  </div>
                  {selectedEvent && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedEvent(null);
                        setAttendanceRecords([]);
                      }}
                    >
                      <ChevronLeft className="h-4 w-4 mr-2" />
                      Back to Events
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {!selectedEvent ? (
                  <div className="text-center py-12">
                    <UserCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold">Select an Event</h3>
                    <p className="text-muted-foreground">Choose an event from the overview tab to track attendance</p>
                  </div>
                ) : attendanceRecords.length === 0 ? (
                  <div className="text-center py-12">
                    <UserCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold">No registrations</h3>
                    <p className="text-muted-foreground">There are no registrations for this event yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Total: {attendanceRecords.length}</span>
                      <span>Present: {attendanceRecords.filter(r => r.attendance.isPresent).length}</span>
                      <span>Absent: {attendanceRecords.filter(r => !r.attendance.isPresent && r.attendance.markedAt).length}</span>
                      <span>Unmarked: {attendanceRecords.filter(r => !r.attendance.markedAt).length}</span>
                    </div>
                    
                    <div className="border rounded-lg">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Participant</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                            <TableHead>Notes</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {attendanceRecords.map((record) => (
                            <TableRow key={record.registrationId}>
                              <TableCell>
                                <div className="font-medium">{record.user.name}</div>
                              </TableCell>
                              <TableCell>{record.user.email}</TableCell>
                              <TableCell>
                                {record.attendance.markedAt ? (
                                  <Badge className={record.attendance.isPresent 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-red-100 text-red-800'
                                  }>
                                    {record.attendance.isPresent ? 'Present' : 'Absent'}
                                  </Badge>
                                ) : (
                                  <Badge variant="outline">Unmarked</Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleMarkAttendance(record.registrationId, true)}
                                    className="text-green-600 hover:text-green-700"
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                    Present
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleMarkAttendance(record.registrationId, false)}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <XCircle className="h-4 w-4" />
                                    Absent
                                  </Button>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm text-muted-foreground max-w-xs truncate">
                                  {record.attendance.notes || '-'}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Create/Edit Event Dialog */}
        <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>
                {editingEvent ? 'Edit Event' : 'Create New Event'}
              </DialogTitle>
              <DialogDescription>
                {editingEvent ? 'Update your event details' : 'Fill in the details for your new event'}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleEventSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="title">Event Title *</Label>
                  <Input
                    id="title"
                    value={eventFormData.title}
                    onChange={(e) => setEventFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter event title"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={eventFormData.description}
                    onChange={(e) => setEventFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe your event"
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="eventDate">Event Date *</Label>
                    <Input
                      id="eventDate"
                      type="datetime-local"
                      value={eventFormData.eventDate}
                      onChange={(e) => setEventFormData(prev => ({ ...prev, eventDate: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="maxAttendees">Max Attendees</Label>
                    <Input
                      id="maxAttendees"
                      type="number"
                      min="1"
                      value={eventFormData.maxAttendees}
                      onChange={(e) => setEventFormData(prev => ({ ...prev, maxAttendees: e.target.value }))}
                      placeholder="Unlimited"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={eventFormData.location}
                    onChange={(e) => setEventFormData(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="Event location"
                  />
                </div>
                
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select 
                    value={eventFormData.status} 
                    onValueChange={(value: 'draft' | 'published' | 'cancelled') => 
                      setEventFormData(prev => ({ ...prev, status: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex justify-end gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowEventDialog(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Saving...' : (editingEvent ? 'Update Event' : 'Create Event')}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}