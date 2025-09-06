"use client";

import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Users,
  FileSpreadsheet,
  Settings,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Download,
  Eye,
  Calendar,
  MapPin,
  Users as UsersIcon,
  Tag,
  ChevronLeft,
  ChevronRight,
  PanelLeft,
  PanelLeftClose,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  venue: string;
  capacity: number;
  registered: number;
  status: "draft" | "published" | "ended";
  tags: string[];
}

interface Registration {
  id: string;
  eventId: string;
  eventTitle: string;
  userName: string;
  userEmail: string;
  registrationDate: string;
  status: "confirmed" | "pending" | "cancelled";
  attended: boolean;
}

const sidebarItems = [
  { id: "events", label: "Manage Events", icon: Calendar },
  { id: "registrations", label: "Registrations", icon: Users },
  { id: "export", label: "Export Data", icon: FileSpreadsheet },
  { id: "settings", label: "Settings", icon: Settings },
];

const mockEvents: Event[] = [
  {
    id: "1",
    title: "Annual Tech Conference 2024",
    description: "Join us for the biggest tech conference of the year featuring industry leaders and innovative solutions.",
    date: "2024-06-15",
    time: "09:00",
    venue: "Tech Center Auditorium",
    capacity: 500,
    registered: 342,
    status: "published",
    tags: ["Technology", "Conference", "Networking"],
  },
  {
    id: "2",
    title: "Design Workshop Series",
    description: "A hands-on workshop series covering modern design principles and tools.",
    date: "2024-07-20",
    time: "14:00",
    venue: "Creative Studio",
    capacity: 50,
    registered: 23,
    status: "draft",
    tags: ["Design", "Workshop", "Creative"],
  },
];

const mockRegistrations: Registration[] = [
  {
    id: "1",
    eventId: "1",
    eventTitle: "Annual Tech Conference 2024",
    userName: "John Doe",
    userEmail: "john@example.com",
    registrationDate: "2024-05-10",
    status: "confirmed",
    attended: false,
  },
  {
    id: "2",
    eventId: "1",
    eventTitle: "Annual Tech Conference 2024",
    userName: "Jane Smith",
    userEmail: "jane@example.com",
    registrationDate: "2024-05-12",
    status: "confirmed",
    attended: true,
  },
];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("events");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [events, setEvents] = useState<Event[]>(mockEvents);
  const [registrations, setRegistrations] = useState<Registration[]>(mockRegistrations);
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isRegistrationDetailOpen, setIsRegistrationDetailOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load sidebar collapse state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("dashboard-sidebar-collapsed");
    if (saved) {
      setIsCollapsed(JSON.parse(saved));
    }
  }, []);

  // Save sidebar collapse state to localStorage
  const toggleSidebar = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem("dashboard-sidebar-collapsed", JSON.stringify(newState));
  };

  // Authentication check
  useEffect(() => {
    // Mock auth check - replace with actual auth logic
    const checkAuth = () => {
      const userRole = localStorage.getItem("userRole");
      setIsAuthenticated(userRole === "organizer");
    };
    checkAuth();
  }, []);

  const handleCreateEvent = async (eventData: Partial<Event>) => {
    setLoading(true);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newEvent: Event = {
        id: Date.now().toString(),
        title: eventData.title || "",
        description: eventData.description || "",
        date: eventData.date || "",
        time: eventData.time || "",
        venue: eventData.venue || "",
        capacity: eventData.capacity || 0,
        registered: 0,
        status: "draft",
        tags: eventData.tags || [],
      };
      
      setEvents(prev => [...prev, newEvent]);
      setIsCreateModalOpen(false);
      toast.success("Event created successfully!");
    } catch (error) {
      toast.error("Failed to create event. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateEvent = async (eventData: Partial<Event>) => {
    if (!selectedEvent) return;
    
    setLoading(true);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setEvents(prev => prev.map(event => 
        event.id === selectedEvent.id 
          ? { ...event, ...eventData }
          : event
      ));
      setIsEditModalOpen(false);
      setSelectedEvent(null);
      toast.success("Event updated successfully!");
    } catch (error) {
      toast.error("Failed to update event. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    setLoading(true);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setEvents(prev => prev.filter(event => event.id !== eventId));
      toast.success("Event deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete event. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleEventStatus = async (eventId: string) => {
    setLoading(true);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setEvents(prev => prev.map(event => 
        event.id === eventId 
          ? { 
              ...event, 
              status: event.status === "published" ? "draft" : "published" 
            }
          : event
      ));
      toast.success("Event status updated!");
    } catch (error) {
      toast.error("Failed to update event status.");
    } finally {
      setLoading(false);
    }
  };

  const handleExportRegistrations = async (eventId?: string) => {
    setLoading(true);
    try {
      toast.loading("Preparing export...");
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.dismiss();
      toast.success("Export ready! Download starting...");
      
      // Mock download
      const link = document.createElement("a");
      link.href = "data:text/csv;charset=utf-8,Name,Email,Event,Status\nJohn Doe,john@example.com,Tech Conference,Confirmed";
      link.download = `registrations-${eventId || 'all'}-${Date.now()}.csv`;
      link.click();
    } catch (error) {
      toast.dismiss();
      toast.error("Export failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || event.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredRegistrations = registrations.filter(registration => {
    const matchesSearch = registration.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         registration.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         registration.eventTitle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || registration.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You need to be logged in as an organizer to access this dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => window.location.href = "/"}>
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <div 
        className={`bg-sidebar border-r border-sidebar-border transition-all duration-300 ${
          isCollapsed ? "w-16" : "w-64"
        }`}
      >
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <h2 className="font-display font-semibold text-sidebar-foreground">
                Organizer Dashboard
              </h2>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSidebar}
              aria-pressed={isCollapsed}
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              className="hover:bg-sidebar-accent"
            >
              {isCollapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        
        <nav className="p-2">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <Button
                key={item.id}
                variant={isActive ? "secondary" : "ghost"}
                className={`w-full justify-start mb-1 ${
                  isCollapsed ? "px-2" : "px-3"
                } ${isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"}`}
                onClick={() => setActiveTab(item.id)}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon className={`h-4 w-4 ${isCollapsed ? "" : "mr-3"}`} />
                {!isCollapsed && <span>{item.label}</span>}
              </Button>
            );
          })}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <div className="p-6 h-full overflow-auto">
          {/* Manage Events Tab */}
          {activeTab === "events" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-display font-bold">Manage Events</h1>
                  <p className="text-muted-foreground">Create, edit, and manage your events</p>
                </div>
                <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Event
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Create New Event</DialogTitle>
                      <DialogDescription>
                        Fill in the details for your new event.
                      </DialogDescription>
                    </DialogHeader>
                    <EventForm
                      onSubmit={handleCreateEvent}
                      onCancel={() => setIsCreateModalOpen(false)}
                      loading={loading}
                    />
                  </DialogContent>
                </Dialog>
              </div>

              <div className="flex items-center space-x-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search events..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="ended">Ended</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-4">
                {filteredEvents.map((event) => (
                  <Card key={event.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-xl">{event.title}</CardTitle>
                          <CardDescription className="mt-1">
                            {event.description}
                          </CardDescription>
                        </div>
                        <Badge 
                          variant={
                            event.status === "published" ? "default" : 
                            event.status === "draft" ? "secondary" : "outline"
                          }
                        >
                          {event.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4 mr-2" />
                          {new Date(event.date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock className="h-4 w-4 mr-2" />
                          {event.time}
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4 mr-2" />
                          {event.venue}
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <UsersIcon className="h-4 w-4 mr-2" />
                          {event.registered}/{event.capacity}
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        {event.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            <Tag className="h-3 w-3 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedEvent(event);
                            setIsEditModalOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        
                        <Button
                          variant={event.status === "published" ? "secondary" : "default"}
                          size="sm"
                          onClick={() => handleToggleEventStatus(event.id)}
                          disabled={loading}
                        >
                          {event.status === "published" ? (
                            <>
                              <XCircle className="h-4 w-4 mr-2" />
                              Unpublish
                            </>
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Publish
                            </>
                          )}
                        </Button>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Event</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{event.title}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteEvent(event.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Edit Event Modal */}
              <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Edit Event</DialogTitle>
                    <DialogDescription>
                      Update the details for "{selectedEvent?.title}".
                    </DialogDescription>
                  </DialogHeader>
                  {selectedEvent && (
                    <EventForm
                      event={selectedEvent}
                      onSubmit={handleUpdateEvent}
                      onCancel={() => {
                        setIsEditModalOpen(false);
                        setSelectedEvent(null);
                      }}
                      loading={loading}
                    />
                  )}
                </DialogContent>
              </Dialog>
            </div>
          )}

          {/* Registrations Tab */}
          {activeTab === "registrations" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-display font-bold">Registrations</h1>
                  <p className="text-muted-foreground">View and manage event registrations</p>
                </div>
                <Button onClick={() => handleExportRegistrations()}>
                  <Download className="h-4 w-4 mr-2" />
                  Export All
                </Button>
              </div>

              <div className="flex items-center space-x-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search registrations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-4">
                {filteredRegistrations.map((registration) => (
                  <Card key={registration.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4">
                            <div>
                              <h3 className="font-semibold">{registration.userName}</h3>
                              <p className="text-sm text-muted-foreground">{registration.userEmail}</p>
                            </div>
                            <Badge
                              variant={
                                registration.status === "confirmed" ? "default" :
                                registration.status === "pending" ? "secondary" : "destructive"
                              }
                            >
                              {registration.status}
                            </Badge>
                            {registration.attended && (
                              <Badge variant="outline" className="bg-success-soft text-success">
                                Attended
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-2">
                            Event: {registration.eventTitle}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Registered: {new Date(registration.registrationDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Sheet open={isRegistrationDetailOpen} onOpenChange={setIsRegistrationDetailOpen}>
                            <SheetTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedRegistration(registration)}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </Button>
                            </SheetTrigger>
                            <SheetContent>
                              <SheetHeader>
                                <SheetTitle>Registration Details</SheetTitle>
                                <SheetDescription>
                                  Detailed information about this registration
                                </SheetDescription>
                              </SheetHeader>
                              {selectedRegistration && (
                                <div className="space-y-4 mt-6">
                                  <div>
                                    <Label className="text-sm font-medium">Attendee</Label>
                                    <p className="text-lg">{selectedRegistration.userName}</p>
                                    <p className="text-muted-foreground">{selectedRegistration.userEmail}</p>
                                  </div>
                                  <Separator />
                                  <div>
                                    <Label className="text-sm font-medium">Event</Label>
                                    <p className="text-lg">{selectedRegistration.eventTitle}</p>
                                  </div>
                                  <Separator />
                                  <div>
                                    <Label className="text-sm font-medium">Status</Label>
                                    <div className="flex items-center space-x-2 mt-1">
                                      <Badge
                                        variant={
                                          selectedRegistration.status === "confirmed" ? "default" :
                                          selectedRegistration.status === "pending" ? "secondary" : "destructive"
                                        }
                                      >
                                        {selectedRegistration.status}
                                      </Badge>
                                      {selectedRegistration.attended && (
                                        <Badge variant="outline" className="bg-success-soft text-success">
                                          Attended
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                  <Separator />
                                  <div>
                                    <Label className="text-sm font-medium">Registration Date</Label>
                                    <p>{new Date(selectedRegistration.registrationDate).toLocaleDateString()}</p>
                                  </div>
                                  <div className="pt-4">
                                    <Button
                                      className="w-full"
                                      onClick={() => {
                                        // Toggle attendance
                                        setRegistrations(prev => prev.map(reg =>
                                          reg.id === selectedRegistration.id
                                            ? { ...reg, attended: !reg.attended }
                                            : reg
                                        ));
                                        toast.success("Attendance updated!");
                                      }}
                                    >
                                      {selectedRegistration.attended ? "Mark as Not Attended" : "Mark as Attended"}
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </SheetContent>
                          </Sheet>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Export Data Tab */}
          {activeTab === "export" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-display font-bold">Export Data</h1>
                <p className="text-muted-foreground">Export registration data in various formats</p>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Export</CardTitle>
                    <CardDescription>
                      Export all registrations for a specific event
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="event-select">Select Event</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose event" />
                        </SelectTrigger>
                        <SelectContent>
                          {events.map((event) => (
                            <SelectItem key={event.id} value={event.id}>
                              {event.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="format-select">Export Format</Label>
                      <Select defaultValue="csv">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="csv">CSV</SelectItem>
                          <SelectItem value="xlsx">Excel (XLSX)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button 
                      className="w-full" 
                      onClick={() => handleExportRegistrations("selected")}
                      disabled={loading}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export Event Data
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Bulk Export</CardTitle>
                    <CardDescription>
                      Export registrations with custom date range and filters
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="start-date">Start Date</Label>
                        <Input type="date" id="start-date" />
                      </div>
                      <div>
                        <Label htmlFor="end-date">End Date</Label>
                        <Input type="date" id="end-date" />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="status-filter">Status Filter</Label>
                      <Select defaultValue="all">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Registrations</SelectItem>
                          <SelectItem value="confirmed">Confirmed Only</SelectItem>
                          <SelectItem value="attended">Attended Only</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="bulk-format">Export Format</Label>
                      <Select defaultValue="csv">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="csv">CSV</SelectItem>
                          <SelectItem value="xlsx">Excel (XLSX)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button 
                      className="w-full" 
                      onClick={() => handleExportRegistrations()}
                      disabled={loading}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export Bulk Data
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === "settings" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-display font-bold">Settings</h1>
                <p className="text-muted-foreground">Manage your organizer preferences</p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                  <CardDescription>
                    Update your organizer account information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="org-name">Organization Name</Label>
                      <Input id="org-name" placeholder="Your Organization" />
                    </div>
                    <div>
                      <Label htmlFor="contact-email">Contact Email</Label>
                      <Input id="contact-email" type="email" placeholder="contact@org.com" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="org-description">Organization Description</Label>
                    <Textarea id="org-description" placeholder="Tell us about your organization..." />
                  </div>
                  <Button>Save Changes</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>
                    Configure how you receive notifications
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">New Registrations</h4>
                      <p className="text-sm text-muted-foreground">Get notified when someone registers for your events</p>
                    </div>
                    <Button variant="outline" size="sm">Enable</Button>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Event Reminders</h4>
                      <p className="text-sm text-muted-foreground">Receive reminders about upcoming events</p>
                    </div>
                    <Button variant="outline" size="sm">Enable</Button>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Export Completion</h4>
                      <p className="text-sm text-muted-foreground">Get notified when data exports are ready</p>
                    </div>
                    <Button variant="outline" size="sm">Disable</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface EventFormProps {
  event?: Event;
  onSubmit: (data: Partial<Event>) => void;
  onCancel: () => void;
  loading: boolean;
}

function EventForm({ event, onSubmit, onCancel, loading }: EventFormProps) {
  const [formData, setFormData] = useState({
    title: event?.title || "",
    description: event?.description || "",
    date: event?.date || "",
    time: event?.time || "",
    venue: event?.venue || "",
    capacity: event?.capacity || 0,
    tags: event?.tags?.join(", ") || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      tags: formData.tags.split(",").map(tag => tag.trim()).filter(Boolean),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Event Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          placeholder="Enter event title"
          required
        />
      </div>
      
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Describe your event"
          rows={3}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="time">Time</Label>
          <Input
            id="time"
            type="time"
            value={formData.time}
            onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="venue">Venue</Label>
          <Input
            id="venue"
            value={formData.venue}
            onChange={(e) => setFormData(prev => ({ ...prev, venue: e.target.value }))}
            placeholder="Event location"
            required
          />
        </div>
        <div>
          <Label htmlFor="capacity">Capacity</Label>
          <Input
            id="capacity"
            type="number"
            value={formData.capacity}
            onChange={(e) => setFormData(prev => ({ ...prev, capacity: parseInt(e.target.value) || 0 }))}
            placeholder="Maximum attendees"
            min="1"
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="tags">Tags (comma-separated)</Label>
        <Input
          id="tags"
          value={formData.tags}
          onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
          placeholder="Technology, Conference, Networking"
        />
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : (event ? "Update Event" : "Create Event")}
        </Button>
      </DialogFooter>
    </form>
  );
}