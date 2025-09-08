"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarInitials } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  QrCode,
  Download,
  X,
  Sparkles
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface Event {
  id: number;
  title: string;
  description: string | null;
  eventDate: string;
  location: string | null;
  maxCapacity: number | null;
  organizerId: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface Registration {
  id: number;
  userId: number;
  eventId: number;
  registrationDate: string;
  status: string;
  event: Event;
}

interface AttendanceRecord {
  id: number;
  registrationId: number;
  isPresent: boolean;
  markedAt: string | null;
  markedBy: number | null;
  notes: string | null;
  event: Event;
  registration: Registration;
}

interface QRCodeData {
  qrCode: string;
  registrationId: number;
  eventId: number;
  eventTitle: string;
  registrationDate: string;
  expiresAt: string;
}

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [attendanceHistory, setAttendanceHistory] = useState<AttendanceRecord[]>([]);
  const [loadingRegistrations, setLoadingRegistrations] = useState(true);
  const [loadingAttendance, setLoadingAttendance] = useState(true);
  const [qrCode, setQrCode] = useState<QRCodeData | null>(null);
  const [loadingQR, setLoadingQR] = useState(false);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchRegistrations();
      fetchAttendanceHistory();
    }
  }, [user]);

  const fetchRegistrations = async () => {
    try {
      const response = await fetch('/api/registrations', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setRegistrations(data.registrations || []);
      } else {
        console.error('Failed to fetch registrations');
      }
    } catch (error) {
      console.error('Error fetching registrations:', error);
    } finally {
      setLoadingRegistrations(false);
    }
  };

  const fetchAttendanceHistory = async () => {
    try {
      const response = await fetch('/api/users/attendance', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setAttendanceHistory(data.attendanceRecords || []);
      } else {
        console.error('Failed to fetch attendance history');
      }
    } catch (error) {
      console.error('Error fetching attendance history:', error);
    } finally {
      setLoadingAttendance(false);
    }
  };

  const generateQRCode = async (registrationId: number) => {
    setLoadingQR(true);
    try {
      const response = await fetch(`/api/registrations/${registrationId}/qr`, {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setQrCode(data);
        setQrDialogOpen(true);
        toast.success('QR code generated successfully!');
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to generate QR code');
      }
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast.error('Error generating QR code');
    } finally {
      setLoadingQR(false);
    }
  };

  const downloadQRCode = () => {
    if (!qrCode) return;
    
    const link = document.createElement('a');
    link.href = `data:image/png;base64,${qrCode.qrCode}`;
    link.download = `qr-code-${qrCode.eventTitle.replace(/\s+/g, '-').toLowerCase()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('QR code downloaded!');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'registered':
        return <Badge variant="default" className="glass bg-green-500/20 text-green-700 border-green-500/30">Registered</Badge>;
      case 'cancelled':
        return <Badge variant="destructive" className="glass bg-red-500/20 text-red-700 border-red-500/30">Cancelled</Badge>;
      default:
        return <Badge variant="secondary" className="glass bg-gray-500/20 text-gray-700 border-gray-500/30">{status}</Badge>;
    }
  };

  const getAttendanceStatus = (registration: Registration) => {
    const attendance = attendanceHistory.find(a => a.registrationId === registration.id);
    if (!attendance) {
      return { status: 'not_marked', icon: AlertCircle, color: 'text-yellow-600', bg: 'bg-yellow-500/20', border: 'border-yellow-500/30' };
    }
    if (attendance.isPresent) {
      return { status: 'present', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-500/20', border: 'border-green-500/30' };
    }
    return { status: 'absent', icon: XCircle, color: 'text-red-600', bg: 'bg-red-500/20', border: 'border-red-500/30' };
  };

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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass p-8 rounded-xl">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-muted-foreground">Loading dashboard...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="glass border-white/20 shadow-2xl max-w-md w-full mx-4">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">Please log in to view your dashboard.</p>
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
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16 glass border-white/20">
              <AvatarFallback className="bg-gradient-to-r from-primary to-primary/70 text-primary-foreground text-lg font-bold">
                <AvatarInitials name={user.name} />
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center space-x-2">
                <span>Welcome back, {user.name}!</span>
                <Sparkles className="w-6 h-6 text-primary animate-glow" />
              </h1>
              <p className="text-muted-foreground">Manage your event registrations and attendance</p>
            </div>
          </div>
        </div>

        {/* Registered Events */}
        <div className="animate-fade-in-up delay-300">
          <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center space-x-2">
            <Calendar className="w-6 h-6 text-primary" />
            <span>My Registered Events</span>
          </h2>

          {loadingRegistrations ? (
            <Card className="glass border-white/20 shadow-lg">
              <CardContent className="pt-6">
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <span className="text-muted-foreground">Loading events...</span>
                </div>
              </CardContent>
            </Card>
          ) : registrations.length === 0 ? (
            <Card className="glass border-white/20 shadow-lg">
              <CardContent className="pt-6 text-center">
                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">You haven't registered for any events yet.</p>
                <p className="text-sm text-muted-foreground mt-1">
                  <a href="/events/discover" className="text-primary hover:underline">
                    Discover events
                  </a>
                  {' '}to get started!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {registrations.map((registration, index) => {
                const attendanceStatus = getAttendanceStatus(registration);
                const AttendanceIcon = attendanceStatus.icon;
                const eventDate = new Date(registration.event.eventDate);
                const isUpcoming = eventDate > new Date();

                return (
                  <Card 
                    key={registration.id} 
                    className="glass border-white/20 shadow-lg hover-glass animate-scale-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg font-semibold text-foreground line-clamp-2">
                          {registration.event.title}
                        </CardTitle>
                        {getStatusBadge(registration.status)}
                      </div>
                      <CardDescription className="text-sm text-muted-foreground line-clamp-2">
                        {registration.event.description || 'No description available'}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center space-x-2 text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(registration.event.eventDate)}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>{formatTime(registration.event.eventDate)}</span>
                        </div>
                        {registration.event.location && (
                          <div className="flex items-center space-x-2 text-muted-foreground">
                            <MapPin className="w-4 h-4" />
                            <span className="line-clamp-1">{registration.event.location}</span>
                          </div>
                        )}
                      </div>

                      <Separator className="bg-white/20" />

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <AttendanceIcon className={`w-4 h-4 ${attendanceStatus.color}`} />
                          <span className="text-sm font-medium capitalize">
                            {attendanceStatus.status.replace('_', ' ')}
                          </span>
                        </div>

                        {registration.status === 'registered' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => generateQRCode(registration.id)}
                            disabled={loadingQR}
                            className="glass border-white/20 hover:bg-white/10 text-primary"
                          >
                            {loadingQR ? (
                              <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                            ) : (
                              <>
                                <QrCode className="w-4 h-4 mr-1" />
                                QR Code
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Attendance History */}
        <div className="animate-fade-in-up delay-500">
          <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center space-x-2">
            <Users className="w-6 h-6 text-primary" />
            <span>Attendance History</span>
          </h2>

          {loadingAttendance ? (
            <Card className="glass border-white/20 shadow-lg">
              <CardContent className="pt-6">
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <span className="text-muted-foreground">Loading attendance history...</span>
                </div>
              </CardContent>
            </Card>
          ) : attendanceHistory.length === 0 ? (
            <Card className="glass border-white/20 shadow-lg">
              <CardContent className="pt-6 text-center">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">No attendance records yet.</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Your attendance will appear here after events.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {attendanceHistory.map((record, index) => (
                <Card 
                  key={record.id} 
                  className="glass border-white/20 shadow-lg hover-glass animate-scale-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg font-semibold text-foreground line-clamp-2">
                        {record.event.title}
                      </CardTitle>
                      <Badge 
                        variant={record.isPresent ? "default" : "destructive"}
                        className={`glass ${record.isPresent 
                          ? 'bg-green-500/20 text-green-700 border-green-500/30' 
                          : 'bg-red-500/20 text-red-700 border-red-500/30'
                        }`}
                      >
                        {record.isPresent ? 'Present' : 'Absent'}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2 text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(record.event.eventDate)}</span>
                      </div>
                      {record.markedAt && (
                        <div className="flex items-center space-x-2 text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>Marked at {formatTime(record.markedAt)}</span>
                        </div>
                      )}
                      {record.event.location && (
                        <div className="flex items-center space-x-2 text-muted-foreground">
                          <MapPin className="w-4 h-4" />
                          <span className="line-clamp-1">{record.event.location}</span>
                        </div>
                      )}
                    </div>

                    {record.notes && (
                      <>
                        <Separator className="bg-white/20" />
                        <div className="text-sm">
                          <span className="font-medium text-foreground">Notes:</span>
                          <p className="text-muted-foreground mt-1">{record.notes}</p>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* QR Code Dialog */}
      <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
        <DialogContent className="glass border-white/20 shadow-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-foreground flex items-center space-x-2">
              <QrCode className="w-5 h-5 text-primary" />
              <span>Event QR Code</span>
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Show this QR code to the event organizer for attendance marking
            </DialogDescription>
          </DialogHeader>
          
          {qrCode && (
            <div className="space-y-6">
              <div className="text-center space-y-4">
                <div className="glass border-white/20 rounded-lg p-4 bg-white inline-block">
                  <img 
                    src={`data:image/png;base64,${qrCode.qrCode}`}
                    alt="QR Code"
                    className="w-48 h-48 mx-auto"
                  />
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-semibold text-foreground">{qrCode.eventTitle}</h3>
                  <p className="text-sm text-muted-foreground">
                    Registered: {formatDate(qrCode.registrationDate)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Expires: {formatDate(qrCode.expiresAt)} at {formatTime(qrCode.expiresAt)}
                  </p>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button 
                  onClick={downloadQRCode}
                  className="flex-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 glass border-white/20"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download QR Code
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setQrDialogOpen(false)}
                  className="glass border-white/20 hover:bg-white/10"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}