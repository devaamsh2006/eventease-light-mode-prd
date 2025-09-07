"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { 
  User, 
  Settings, 
  Activity, 
  Calendar, 
  BarChart3, 
  Users, 
  LogOut,
  Home,
  Shield,
  Clock,
  TrendingUp,
  Eye,
  MapPin,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  Filter,
  Calendar as CalendarIcon,
  Plus
} from 'lucide-react';

interface Registration {
  id: number;
  eventId: number;
  userId: number;
  registrationDate: string;
  status: 'registered' | 'cancelled';
  createdAt: string;
  event: {
    id: number;
    title: string;
    description?: string;
    eventDate: string;
    location?: string;
    maxAttendees?: number;
    status: 'draft' | 'published' | 'cancelled';
    createdAt: string;
    updatedAt: string;
  };
}

interface AttendanceRecord {
  id: number;
  isPresent: boolean;
  markedAt?: string;
  notes?: string;
  registration: {
    id: number;
    registrationDate: string;
    status: string;
  };
  event: {
    id: number;
    title: string;
    description?: string;
    eventDate: string;
    location?: string;
  };
}

interface DashboardStats {
  totalRegistrations: number;
  upcomingEvents: number;
  attendedEvents: number;
  attendanceRate: number;
}

export default function AttendeeDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [attendanceHistory, setAttendanceHistory] = useState<AttendanceRecord[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalRegistrations: 0,
    upcomingEvents: 0,
    attendedEvents: 0,
    attendanceRate: 0
  });

  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedEvent, setSelectedEvent] = useState<Registration | null>(null);
  const [showEventDetails, setShowEventDetails] = useState(false);

  // Authentication check
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login');
        return;
      }
      // Redirect organizers to their admin dashboard
      if (user.role === 'organizer') {
        router.push('/admin');
        return;
      }
    }
  }, [user, authLoading, router]);

  // Fetch user registrations
  const fetchRegistrations = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const response = await fetch('/api/registrations?limit=100&sort=eventDate&order=desc');
      if (!response.ok) throw new Error('Failed to fetch registrations');
      
      const data = await response.json();
      setRegistrations(data);

      // Calculate stats
      const now = new Date().toISOString();
      const totalRegistrations = data.filter((r: Registration) => r.status === 'registered').length;
      const upcomingEvents = data.filter((r: Registration) => 
        r.status === 'registered' && r.event.eventDate > now
      ).length;

      setStats(prev => ({
        ...prev,
        totalRegistrations,
        upcomingEvents
      }));

    } catch (error) {
      console.error('Error fetching registrations:', error);
      toast.error('Failed to load your events');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Fetch attendance history
  const fetchAttendanceHistory = useCallback(async () => {
    if (!user) return;

    try {
      const response = await fetch('/api/users/attendance?limit=100');
      if (!response.ok) throw new Error('Failed to fetch attendance history');
      
      const data = await response.json();
      setAttendanceHistory(data);

      // Calculate attendance stats
      const attendedEvents = data.filter((a: AttendanceRecord) => a.isPresent).length;
      const totalMarkedEvents = data.length;
      const attendanceRate = totalMarkedEvents > 0 ? Math.round((attendedEvents / totalMarkedEvents) * 100) : 0;

      setStats(prev => ({
        ...prev,
        attendedEvents,
        attendanceRate
      }));

    } catch (error) {
      console.error('Error fetching attendance history:', error);
      toast.error('Failed to load attendance history');
    }
  }, [user]);

  // Initial data load
  useEffect(() => {
    if (user && user.role === 'user') {
      fetchRegistrations();
      fetchAttendanceHistory();
    }
  }, [fetchRegistrations, fetchAttendanceHistory, user]);

  // Handle event details
  const handleViewEventDetails = (registration: Registration) => {
    setSelectedEvent(registration);
    setShowEventDetails(true);
  };

  // Handle event cancellation
  const handleCancelRegistration = async (eventId: number) => {
    if (!confirm('Are you sure you want to cancel your registration for this event?')) {
      return;
    }

    try {
      const response = await fetch(`/api/events/${eventId}/register?eventId=${eventId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to cancel registration');
      }

      toast.success('Registration cancelled successfully');
      fetchRegistrations();
      setShowEventDetails(false);
    } catch (error) {
      console.error('Error cancelling registration:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to cancel registration');
    }
  };

  // Utility functions
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEventStatusBadge = (event: Registration) => {
    const now = new Date();
    const eventDate = new Date(event.event.eventDate);
    
    if (event.status === 'cancelled') {
      return <Badge variant="destructive">Cancelled</Badge>;
    }
    
    if (eventDate < now) {
      return <Badge variant="secondary">Past Event</Badge>;
    }
    
    if (event.event.status === 'cancelled') {
      return <Badge variant="destructive">Event Cancelled</Badge>;
    }
    
    return <Badge variant="default">Registered</Badge>;
  };

  const getAttendanceStatusBadge = (record: AttendanceRecord) => {
    if (record.isPresent) {
      return <Badge className="bg-green-100 text-green-800">Present</Badge>;
    } else {
      return <Badge className="bg-red-100 text-red-800">Absent</Badge>;
    }
  };

  const filteredRegistrations = registrations.filter(registration => {
    const matchesSearch = !searchTerm || 
      registration.event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      registration.event.location?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'upcoming' && new Date(registration.event.eventDate) > new Date()) ||
      (statusFilter === 'past' && new Date(registration.event.eventDate) <= new Date()) ||
      (statusFilter === registration.status);
    
    return matchesSearch && matchesStatus;
  });

  if (authLoading || loading) {
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

  if (!user || user.role !== 'user') {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">My Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {user.name}!</p>
          </div>
          <Link href="/events/discover">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Discover Events
            </Button>
          </Link>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">My Events</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRegistrations}</div>
              <p className="text-xs text-muted-foreground">Total registered events</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.upcomingEvents}</div>
              <p className="text-xs text-muted-foreground">Events to attend</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Events Attended</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.attendedEvents}</div>
              <p className="text-xs text-muted-foreground">Successfully attended</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.attendanceRate}%</div>
              <p className="text-xs text-muted-foreground">Overall attendance</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="events">My Events</TabsTrigger>
            <TabsTrigger value="attendance">Attendance History</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Upcoming Events */}
              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Events</CardTitle>
                  <CardDescription>Your next registered events</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {registrations
                    .filter(r => r.status === 'registered' && new Date(r.event.eventDate) > new Date())
                    .slice(0, 3)
                    .map((registration) => (
                      <div key={registration.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium">{registration.event.title}</h4>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                            <CalendarIcon className="h-3 w-3" />
                            <span>{formatDate(registration.event.eventDate)}</span>
                            {registration.event.location && (
                              <>
                                <MapPin className="h-3 w-3 ml-2" />
                                <span>{registration.event.location}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewEventDetails(registration)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  
                  {registrations.filter(r => r.status === 'registered' && new Date(r.event.eventDate) > new Date()).length === 0 && (
                    <div className="text-center py-8">
                      <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">No upcoming events</p>
                      <Link href="/events/discover">
                        <Button variant="outline" size="sm" className="mt-2">
                          Discover Events
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Your latest event activities</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {registrations
                    .slice(0, 5)
                    .map((registration) => (
                      <div key={registration.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                        <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            {registration.status === 'registered' ? 'Registered for' : 'Cancelled registration for'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {registration.event.title} - {formatDate(registration.registrationDate)}
                          </p>
                        </div>
                        {getEventStatusBadge(registration)}
                      </div>
                    ))}
                  
                  {registrations.length === 0 && (
                    <div className="text-center py-8">
                      <Activity className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">No recent activity</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* My Events Tab */}
          <TabsContent value="events" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>My Registered Events</CardTitle>
                <CardDescription>All events you've registered for</CardDescription>
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
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border rounded-md text-sm"
                  >
                    <option value="all">All Events</option>
                    <option value="upcoming">Upcoming</option>
                    <option value="past">Past Events</option>
                    <option value="registered">Active</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                {/* Events List */}
                {filteredRegistrations.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold">No events found</h3>
                    <p className="text-muted-foreground">
                      {searchTerm || statusFilter !== 'all' 
                        ? 'Try adjusting your filters' 
                        : 'Start by discovering and registering for events'}
                    </p>
                    <Link href="/events/discover">
                      <Button className="mt-4">
                        <Plus className="h-4 w-4 mr-2" />
                        Discover Events
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredRegistrations.map((registration) => (
                      <div key={registration.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold">{registration.event.title}</h3>
                              {getEventStatusBadge(registration)}
                            </div>
                            
                            {registration.event.description && (
                              <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                                {registration.event.description}
                              </p>
                            )}
                            
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <CalendarIcon className="h-3 w-3" />
                                <span>{formatDate(registration.event.eventDate)}</span>
                              </div>
                              {registration.event.location && (
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  <span>{registration.event.location}</span>
                                </div>
                              )}
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>Registered {formatDate(registration.registrationDate)}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewEventDetails(registration)}
                            >
                              <Eye className="h-4 w-4" />
                              View Details
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Attendance History Tab */}
          <TabsContent value="attendance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Attendance History</CardTitle>
                <CardDescription>Your attendance record for past events</CardDescription>
              </CardHeader>
              <CardContent>
                {attendanceHistory.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold">No attendance records</h3>
                    <p className="text-muted-foreground">
                      Your attendance will be tracked after you attend events
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {attendanceHistory.map((record) => (
                      <div key={record.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold">{record.event.title}</h3>
                              {getAttendanceStatusBadge(record)}
                            </div>
                            
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <CalendarIcon className="h-3 w-3" />
                                <span>{formatDate(record.event.eventDate)}</span>
                              </div>
                              {record.event.location && (
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  <span>{record.event.location}</span>
                                </div>
                              )}
                              {record.markedAt && (
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  <span>Marked {formatDate(record.markedAt)}</span>
                                </div>
                              )}
                            </div>
                            
                            {record.notes && (
                              <div className="mt-2 p-2 bg-muted/50 rounded text-sm">
                                <strong>Note:</strong> {record.notes}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Event Details Dialog */}
        <Dialog open={showEventDetails} onOpenChange={setShowEventDetails}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{selectedEvent?.event.title}</DialogTitle>
              <DialogDescription>Event details and registration information</DialogDescription>
            </DialogHeader>
            
            {selectedEvent && (
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedEvent.event.description || 'No description provided'}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-1">Event Date</h4>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(selectedEvent.event.eventDate)}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-1">Location</h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedEvent.event.location || 'No location specified'}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-1">Registration Date</h4>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(selectedEvent.registrationDate)}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-1">Status</h4>
                    {getEventStatusBadge(selectedEvent)}
                  </div>
                </div>
                
                <div className="flex justify-end gap-4 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowEventDetails(false)}
                  >
                    Close
                  </Button>
                  {selectedEvent.status === 'registered' && 
                   new Date(selectedEvent.event.eventDate) > new Date() && (
                    <Button
                      variant="destructive"
                      onClick={() => handleCancelRegistration(selectedEvent.event.id)}
                    >
                      Cancel Registration
                    </Button>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}