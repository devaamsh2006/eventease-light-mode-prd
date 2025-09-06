"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, CalendarSearch, ListFilter, CalendarCheck2, Tickets, SearchCheck } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  description: string;
  shortDescription: string;
  location: string;
  category: string;
  tags: string[];
  capacity: number;
  registered: number;
  price: number;
  organizer: string;
  contact: string;
  rules?: string;
  schedule?: string;
}

interface RegistrationData {
  name: string;
  email: string;
  phone: string;
  organization: string;
  dietaryRequirements: string;
}

const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Tech Conference 2024',
    date: '2024-03-15',
    time: '09:00 AM',
    description: 'Join industry leaders for a comprehensive technology conference featuring the latest innovations in AI, blockchain, and cloud computing. Network with professionals and gain insights into emerging technologies that will shape the future.',
    shortDescription: 'Annual tech conference with industry leaders and emerging technology showcases.',
    location: 'San Francisco Convention Center',
    category: 'Technology',
    tags: ['AI', 'Blockchain', 'Networking'],
    capacity: 500,
    registered: 347,
    price: 299,
    organizer: 'Tech Innovators Inc.',
    contact: 'events@techinnovators.com',
    rules: 'All attendees must register in advance. Photography is allowed during sessions. Professional attire recommended.',
    schedule: '9:00 AM - Registration\n10:00 AM - Keynote\n12:00 PM - Lunch\n2:00 PM - Breakout Sessions\n5:00 PM - Networking Reception'
  },
  {
    id: '2',
    title: 'Startup Pitch Competition',
    date: '2024-03-22',
    time: '02:00 PM',
    description: 'Watch innovative startups present their groundbreaking ideas to a panel of experienced investors and venture capitalists. This is a unique opportunity to witness the next generation of disruptive technologies and business models.',
    shortDescription: 'Startups pitch innovative ideas to investors and VCs.',
    location: 'Innovation Hub Downtown',
    category: 'Business',
    tags: ['Startups', 'Investment', 'Innovation'],
    capacity: 200,
    registered: 156,
    price: 75,
    organizer: 'Startup Accelerator',
    contact: 'pitch@startupaccel.com',
    rules: 'No recording allowed. Questions may be submitted during Q&A sessions only.',
    schedule: '2:00 PM - Welcome\n2:30 PM - Pitch Presentations\n4:00 PM - Investor Panel\n5:00 PM - Awards Ceremony'
  },
  {
    id: '3',
    title: 'Digital Marketing Workshop',
    date: '2024-03-28',
    time: '10:00 AM',
    description: 'Learn advanced digital marketing strategies from industry experts. This hands-on workshop covers SEO, social media marketing, content strategy, and analytics to help you grow your business online.',
    shortDescription: 'Hands-on workshop covering SEO, social media, and content strategy.',
    location: 'Creative Learning Center',
    category: 'Marketing',
    tags: ['SEO', 'Social Media', 'Analytics'],
    capacity: 150,
    registered: 89,
    price: 150,
    organizer: 'Digital Growth Agency',
    contact: 'workshops@digitalgrowth.com',
    rules: 'Bring your laptop. Materials will be provided. Certificate of completion available.',
    schedule: '10:00 AM - Introduction\n11:00 AM - SEO Fundamentals\n1:00 PM - Lunch Break\n2:00 PM - Social Media Strategy\n4:00 PM - Analytics Deep Dive'
  }
];

const categories = ['All', 'Technology', 'Business', 'Marketing', 'Education', 'Healthcare'];

export default function EventsSection() {
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [dateRange, setDateRange] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [registrationData, setRegistrationData] = useState<RegistrationData>({
    name: '',
    email: '',
    phone: '',
    organization: '',
    dietaryRequirements: ''
  });

  const eventsPerPage = 6;

  // Simulate data loading
  useEffect(() => {
    const loadEvents = async () => {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setEvents(mockEvents);
      setFilteredEvents(mockEvents);
      setLoading(false);
    };
    
    loadEvents();
  }, []);

  // Debounced search and filter
  const applyFilters = useCallback(() => {
    let filtered = [...events];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(query) ||
        event.description.toLowerCase().includes(query) ||
        event.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    if (selectedCategory !== 'All') {
      filtered = filtered.filter(event => event.category === selectedCategory);
    }

    if (selectedLocation) {
      filtered = filtered.filter(event => 
        event.location.toLowerCase().includes(selectedLocation.toLowerCase())
      );
    }

    if (dateRange) {
      // Simple date filtering - in real app would use proper date range logic
      filtered = filtered.filter(event => {
        const eventDate = new Date(event.date);
        const today = new Date();
        
        switch (dateRange) {
          case 'today':
            return eventDate.toDateString() === today.toDateString();
          case 'week':
            const weekFromNow = new Date();
            weekFromNow.setDate(today.getDate() + 7);
            return eventDate >= today && eventDate <= weekFromNow;
          case 'month':
            const monthFromNow = new Date();
            monthFromNow.setMonth(today.getMonth() + 1);
            return eventDate >= today && eventDate <= monthFromNow;
          default:
            return true;
        }
      });
    }

    setFilteredEvents(filtered);
    setCurrentPage(1);
  }, [events, searchQuery, selectedCategory, selectedLocation, dateRange]);

  useEffect(() => {
    const timeoutId = setTimeout(applyFilters, 300);
    return () => clearTimeout(timeoutId);
  }, [applyFilters]);

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setIsDetailModalOpen(true);
  };

  const handleRegisterClick = () => {
    setIsRegistrationOpen(true);
  };

  const handleRegistrationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!registrationData.name || !registrationData.email) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Simulate registration
    toast.success('Registration saved locally — continue to confirm email');
    
    // Reset form and close modals
    setRegistrationData({
      name: '',
      email: '',
      phone: '',
      organization: '',
      dietaryRequirements: ''
    });
    setIsRegistrationOpen(false);
    setIsDetailModalOpen(false);
  };

  const handleInputChange = (field: keyof RegistrationData, value: string) => {
    setRegistrationData(prev => ({ ...prev, [field]: value }));
  };

  // Pagination
  const totalPages = Math.ceil(filteredEvents.length / eventsPerPage);
  const startIndex = (currentPage - 1) * eventsPerPage;
  const paginatedEvents = filteredEvents.slice(startIndex, startIndex + eventsPerPage);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <section className="py-12 bg-background">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 text-muted-foreground">
              <CalendarSearch className="h-5 w-5 animate-pulse" />
              <span>Loading events...</span>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 bg-background">
      <div className="container max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 text-primary mb-4">
            <Calendar className="h-6 w-6" />
            <span className="font-display font-semibold">Discover Events</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
            Find Your Next Experience
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Explore upcoming events, connect with like-minded professionals, and advance your career through meaningful experiences.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <Card className="bg-card border-border">
            <CardContent className="p-6">
              {/* Search Bar */}
              <div className="relative mb-6">
                <CalendarSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search events, topics, or keywords..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 text-base"
                />
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="category" className="text-sm font-medium mb-2 block">
                    Category
                  </Label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="All categories" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="date-range" className="text-sm font-medium mb-2 block">
                    Date Range
                  </Label>
                  <Select value={dateRange} onValueChange={setDateRange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any time</SelectItem>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="week">This week</SelectItem>
                      <SelectItem value="month">This month</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="location" className="text-sm font-medium mb-2 block">
                    Location
                  </Label>
                  <Input
                    placeholder="City or venue..."
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                  />
                </div>

                <div className="flex items-end">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('All');
                      setDateRange('');
                      setSelectedLocation('');
                    }}
                    className="w-full"
                  >
                    <ListFilter className="h-4 w-4 mr-2" />
                    Clear Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            {filteredEvents.length === 0 ? 'No events found' : 
             filteredEvents.length === 1 ? '1 event found' : 
             `${filteredEvents.length} events found`}
          </p>
        </div>

        {/* Events Grid */}
        {filteredEvents.length === 0 ? (
          <div className="text-center py-12">
            <CalendarSearch className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No events found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search criteria or filters to find more events.
            </p>
            <Button 
              variant="outline"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setDateRange('');
                setSelectedLocation('');
              }}
            >
              Clear all filters
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {paginatedEvents.map((event) => (
                <Card 
                  key={event.id} 
                  className="cursor-pointer hover:shadow-lg transition-shadow duration-200 bg-card border-border"
                  onClick={() => handleEventClick(event)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <Badge variant="secondary" className="text-xs">
                        {event.category}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        ${event.price}
                      </span>
                    </div>
                    <CardTitle className="text-xl font-display font-bold leading-tight">
                      {event.title}
                    </CardTitle>
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(event.date)} at {event.time}</span>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <CardDescription className="text-sm text-muted-foreground mb-4 line-clamp-3">
                      {event.shortDescription}
                    </CardDescription>
                    
                    <div className="flex flex-wrap gap-1 mb-4">
                      {event.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="text-xs text-muted-foreground">
                      {event.registered}/{event.capacity} registered
                    </div>
                  </CardContent>

                  <CardFooter>
                    <Button className="w-full" size="sm">
                      <Tickets className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    onClick={() => setCurrentPage(page)}
                    className="min-w-10"
                  >
                    {page}
                  </Button>
                ))}
                
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}

        {/* Event Detail Modal */}
        <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            {selectedEvent && (
              <>
                <DialogHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary">{selectedEvent.category}</Badge>
                    <span className="text-sm text-muted-foreground">
                      ${selectedEvent.price}
                    </span>
                  </div>
                  <DialogTitle className="text-2xl font-display font-bold">
                    {selectedEvent.title}
                  </DialogTitle>
                  <DialogDescription className="text-base">
                    {formatDate(selectedEvent.date)} at {selectedEvent.time}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 mt-6">
                  <div>
                    <h4 className="font-semibold mb-2">Description</h4>
                    <p className="text-muted-foreground">
                      {selectedEvent.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-2">Event Details</h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium">Location:</span>{' '}
                          <span className="text-muted-foreground">{selectedEvent.location}</span>
                        </div>
                        <div>
                          <span className="font-medium">Organizer:</span>{' '}
                          <span className="text-muted-foreground">{selectedEvent.organizer}</span>
                        </div>
                        <div>
                          <span className="font-medium">Contact:</span>{' '}
                          <span className="text-muted-foreground">{selectedEvent.contact}</span>
                        </div>
                        <div>
                          <span className="font-medium">Capacity:</span>{' '}
                          <span className="text-muted-foreground">
                            {selectedEvent.registered}/{selectedEvent.capacity} registered
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Tags</h4>
                      <div className="flex flex-wrap gap-1">
                        {selectedEvent.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  {selectedEvent.schedule && (
                    <div>
                      <h4 className="font-semibold mb-2">Schedule</h4>
                      <div className="bg-muted p-4 rounded-lg">
                        <pre className="text-sm text-muted-foreground whitespace-pre-wrap font-sans">
                          {selectedEvent.schedule}
                        </pre>
                      </div>
                    </div>
                  )}

                  {selectedEvent.rules && (
                    <div>
                      <h4 className="font-semibold mb-2">Rules & Guidelines</h4>
                      <p className="text-sm text-muted-foreground">
                        {selectedEvent.rules}
                      </p>
                    </div>
                  )}

                  <div className="flex gap-3 pt-4">
                    <Button 
                      className="flex-1" 
                      onClick={handleRegisterClick}
                      disabled={selectedEvent.registered >= selectedEvent.capacity}
                    >
                      <CalendarCheck2 className="h-4 w-4 mr-2" />
                      {selectedEvent.registered >= selectedEvent.capacity ? 'Event Full' : 'Register Now'}
                    </Button>
                    <Button variant="outline" onClick={() => setIsDetailModalOpen(false)}>
                      Close
                    </Button>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Registration Modal */}
        <Dialog open={isRegistrationOpen} onOpenChange={setIsRegistrationOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <SearchCheck className="h-5 w-5" />
                Register for Event
              </DialogTitle>
              <DialogDescription>
                {selectedEvent?.title}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleRegistrationSubmit} className="space-y-4 mt-6">
              <div>
                <Label htmlFor="reg-name">Full Name *</Label>
                <Input
                  id="reg-name"
                  value={registrationData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="reg-email">Email Address *</Label>
                <Input
                  id="reg-email"
                  type="email"
                  value={registrationData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="reg-phone">Phone Number</Label>
                <Input
                  id="reg-phone"
                  type="tel"
                  value={registrationData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="reg-org">Organization</Label>
                <Input
                  id="reg-org"
                  value={registrationData.organization}
                  onChange={(e) => handleInputChange('organization', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="reg-dietary">Dietary Requirements</Label>
                <Textarea
                  id="reg-dietary"
                  value={registrationData.dietaryRequirements}
                  onChange={(e) => handleInputChange('dietaryRequirements', e.target.value)}
                  placeholder="Any dietary restrictions or requirements..."
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1">
                  Complete Registration
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsRegistrationOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
}