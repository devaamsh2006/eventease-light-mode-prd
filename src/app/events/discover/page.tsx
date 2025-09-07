"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { Calendar, MapPin, Users, Clock, Search, Filter, ChevronLeft, ChevronRight, X, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface Event {
  id: number;
  title: string;
  description?: string;
  eventDate: string;
  location?: string;
  maxAttendees?: number;
  registrationCount: number;
}

interface FilterState {
  search: string;
  location: string;
  dateFilter: string;
  dateFrom: string;
  dateTo: string;
  sort: string;
  order: string;
}

export default function EventDiscoveryPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState<number | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    location: "",
    dateFilter: "all",
    dateFrom: "",
    dateTo: "",
    sort: "eventDate",
    order: "asc"
  });

  const { user } = useAuth();
  const router = useRouter();
  const itemsPerPage = 12;

  const fetchEvents = useCallback(async (page = 1, resetData = false) => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams({
        limit: itemsPerPage.toString(),
        offset: ((page - 1) * itemsPerPage).toString(),
        sort: filters.sort,
        order: filters.order
      });

      if (filters.search.trim()) {
        params.append("search", filters.search.trim());
      }

      if (filters.location.trim()) {
        params.append("location", filters.location.trim());
      }

      // Date filtering
      if (filters.dateFilter === "upcoming") {
        params.append("date_from", new Date().toISOString().split('T')[0]);
      } else if (filters.dateFilter === "this_week") {
        const today = new Date();
        const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
        params.append("date_from", today.toISOString().split('T')[0]);
        params.append("date_to", nextWeek.toISOString().split('T')[0]);
      } else if (filters.dateFilter === "this_month") {
        const today = new Date();
        const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());
        params.append("date_from", today.toISOString().split('T')[0]);
        params.append("date_to", nextMonth.toISOString().split('T')[0]);
      } else if (filters.dateFilter === "custom" && filters.dateFrom && filters.dateTo) {
        params.append("date_from", filters.dateFrom);
        params.append("date_to", filters.dateTo);
      }

      const response = await fetch(`/api/events/discover?${params}`);
      if (!response.ok) {
        throw new Error("Failed to fetch events");
      }

      const newEvents = await response.json();
      
      if (resetData) {
        setEvents(newEvents);
      } else {
        setEvents(prev => [...prev, ...newEvents]);
      }

      setHasMore(newEvents.length === itemsPerPage);
    } catch (error) {
      console.error("Error fetching events:", error);
      toast.error("Failed to load events. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [filters, itemsPerPage]);

  const handleRegister = async (eventId: number) => {
    if (!user) {
      toast.error("Please sign in to register for events");
      router.push("/login");
      return;
    }

    if (user.role !== "user") {
      toast.error("Only users can register for events. Organizers can create events instead.");
      router.push("/admin");
      return;
    }

    setRegistering(eventId);
    
    try {
      const response = await fetch(`/api/events/${eventId}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ eventId }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.code === "ALREADY_REGISTERED") {
          toast.error("You are already registered for this event");
        } else if (data.code === "EVENT_FULL") {
          toast.error("This event is at full capacity");
        } else if (data.code === "EVENT_PAST") {
          toast.error("Cannot register for past events");
        } else {
          toast.error(data.error || "Registration failed");
        }
        return;
      }

      toast.success("Successfully registered for the event!");
      
      // Update the registration count in the local state
      setEvents(prev => prev.map(event => 
        event.id === eventId 
          ? { ...event, registrationCount: event.registrationCount + 1 }
          : event
      ));

      if (selectedEvent?.id === eventId) {
        setSelectedEvent(prev => prev ? {
          ...prev,
          registrationCount: prev.registrationCount + 1
        } : null);
      }

    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Registration failed. Please try again.");
    } finally {
      setRegistering(null);
    }
  };

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const applyFilters = () => {
    setCurrentPage(1);
    fetchEvents(1, true);
    setShowFilters(false);
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      location: "",
      dateFilter: "all",
      dateFrom: "",
      dateTo: "",
      sort: "eventDate",
      order: "asc"
    });
    setCurrentPage(1);
    fetchEvents(1, true);
  };

  const loadMore = () => {
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    fetchEvents(nextPage, false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const isEventFull = (event: Event) => {
    return event.maxAttendees ? event.registrationCount >= event.maxAttendees : false;
  };

  const isEventPast = (eventDate: string) => {
    return new Date(eventDate) <= new Date();
  };

  useEffect(() => {
    fetchEvents(1, true);
  }, []);

  const EventCard = ({ event }: { event: Event }) => (
    <Card className="h-full hover:shadow-lg transition-all duration-200 border-border/50 hover:border-border">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-2">
          <CardTitle className="text-lg leading-tight line-clamp-2">{event.title}</CardTitle>
          <div className="flex flex-col gap-1 shrink-0">
            {isEventPast(event.eventDate) && (
              <Badge variant="secondary" className="text-xs">Past</Badge>
            )}
            {isEventFull(event) && (
              <Badge variant="destructive" className="text-xs">Full</Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {event.description && (
          <p className="text-sm text-muted-foreground line-clamp-3">{event.description}</p>
        )}
        
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 text-primary/70" />
            <span>{formatDate(event.eventDate)}</span>
          </div>
          
          {event.location && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 text-primary/70" />
              <span className="line-clamp-1">{event.location}</span>
            </div>
          )}
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4 text-primary/70" />
            <span>
              {event.registrationCount} registered
              {event.maxAttendees && ` / ${event.maxAttendees} max`}
            </span>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="flex-1" onClick={() => setSelectedEvent(event)}>
                View Details
              </Button>
            </DialogTrigger>
          </Dialog>
          
          <Button 
            size="sm" 
            className="flex-1"
            disabled={isEventPast(event.eventDate) || isEventFull(event) || registering === event.id}
            onClick={() => handleRegister(event.id)}
          >
            {registering === event.id ? (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Registering...</span>
              </div>
            ) : (
              "Register"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const LoadingSkeleton = () => (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <Skeleton className="h-6 w-3/4" />
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="h-16 w-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <div className="flex gap-2 pt-2">
          <Skeleton className="h-8 flex-1" />
          <Skeleton className="h-8 flex-1" />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border/50 bg-card/50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto text-center space-y-4">
            <h1 className="text-4xl font-bold tracking-tight">Discover Events</h1>
            <p className="text-lg text-muted-foreground">
              Find and register for exciting events in your area
            </p>
            
            {!user && (
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                <p className="text-sm text-primary">
                  <strong>Sign in required:</strong> You need to be logged in to register for events.{" "}
                  <Button variant="link" className="p-0 h-auto text-primary" onClick={() => router.push("/login")}>
                    Sign in here
                  </Button>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Search and Filter Bar */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search events..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="pl-10"
                onKeyDown={(e) => e.key === "Enter" && applyFilters()}
              />
            </div>
            
            <Button 
              variant="outline" 
              onClick={() => setShowFilters(!showFilters)}
              className="shrink-0"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            
            <Button onClick={applyFilters} className="shrink-0">
              Search
            </Button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <Card className="p-4 animate-in slide-in-from-top-2 duration-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Location</label>
                  <Input
                    placeholder="Filter by location..."
                    value={filters.location}
                    onChange={(e) => handleFilterChange("location", e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Date Range</label>
                  <Select value={filters.dateFilter} onValueChange={(value) => handleFilterChange("dateFilter", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Events</SelectItem>
                      <SelectItem value="upcoming">Upcoming</SelectItem>
                      <SelectItem value="this_week">This Week</SelectItem>
                      <SelectItem value="this_month">This Month</SelectItem>
                      <SelectItem value="custom">Custom Range</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Sort By</label>
                  <Select value={filters.sort} onValueChange={(value) => handleFilterChange("sort", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="eventDate">Event Date</SelectItem>
                      <SelectItem value="title">Title</SelectItem>
                      <SelectItem value="createdAt">Recently Added</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Order</label>
                  <Select value={filters.order} onValueChange={(value) => handleFilterChange("order", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asc">Ascending</SelectItem>
                      <SelectItem value="desc">Descending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {filters.dateFilter === "custom" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">From Date</label>
                    <Input
                      type="date"
                      value={filters.dateFrom}
                      onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">To Date</label>
                    <Input
                      type="date"
                      value={filters.dateTo}
                      onChange={(e) => handleFilterChange("dateTo", e.target.value)}
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
                <Button onClick={applyFilters}>
                  Apply Filters
                </Button>
              </div>
            </Card>
          )}
        </div>

        {/* Events Grid */}
        {loading && currentPage === 1 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }, (_, i) => (
              <LoadingSkeleton key={i} />
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto space-y-4">
              <div className="h-20 w-20 bg-muted rounded-full flex items-center justify-center mx-auto">
                <Calendar className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold">No events found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search filters or check back later for new events.
              </p>
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {events.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>

            {/* Load More Button */}
            {hasMore && (
              <div className="text-center mt-8">
                <Button 
                  variant="outline" 
                  onClick={loadMore}
                  disabled={loading}
                  className="min-w-32"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                      <span>Loading...</span>
                    </div>
                  ) : (
                    "Load More Events"
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Event Details Modal */}
      {selectedEvent && (
        <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex justify-between items-start gap-4">
                <DialogTitle className="text-2xl leading-tight">{selectedEvent.title}</DialogTitle>
                <div className="flex flex-col gap-1 shrink-0">
                  {isEventPast(selectedEvent.eventDate) && (
                    <Badge variant="secondary">Past Event</Badge>
                  )}
                  {isEventFull(selectedEvent) && (
                    <Badge variant="destructive">Event Full</Badge>
                  )}
                </div>
              </div>
            </DialogHeader>
            
            <div className="space-y-6">
              {selectedEvent.description && (
                <div>
                  <h4 className="font-semibold mb-2">Description</h4>
                  <p className="text-muted-foreground whitespace-pre-wrap">{selectedEvent.description}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Date & Time</p>
                      <p className="text-sm text-muted-foreground">{formatDate(selectedEvent.eventDate)}</p>
                    </div>
                  </div>

                  {selectedEvent.location && (
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">Location</p>
                        <p className="text-sm text-muted-foreground">{selectedEvent.location}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Registration</p>
                      <p className="text-sm text-muted-foreground">
                        {selectedEvent.registrationCount} registered
                        {selectedEvent.maxAttendees && ` of ${selectedEvent.maxAttendees} max`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Status</p>
                      <p className="text-sm text-muted-foreground">
                        {isEventPast(selectedEvent.eventDate) 
                          ? "Event has ended" 
                          : isEventFull(selectedEvent)
                          ? "Registration closed (full)"
                          : "Registration open"
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedEvent(null)}
                  className="flex-1"
                >
                  Close
                </Button>
                <Button 
                  className="flex-1"
                  disabled={isEventPast(selectedEvent.eventDate) || isEventFull(selectedEvent) || registering === selectedEvent.id}
                  onClick={() => handleRegister(selectedEvent.id)}
                >
                  {registering === selectedEvent.id ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Registering...</span>
                    </div>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Register for Event
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}