"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Loader2, Check, TicketCheck, Receipt, MailCheck, Ticket } from 'lucide-react';
import { toast } from "sonner";

interface FormData {
  name: string;
  email: string;
  phone: string;
  organization: string;
  eventId: string;
  notes: string;
  guestCount: number;
  gdprConsent: boolean;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  organization?: string;
  eventId?: string;
  gdprConsent?: string;
}

interface RegistrationConfirmation {
  id: string;
  eventName: string;
  attendeeName: string;
  eventDate: string;
  eventTime: string;
  venue: string;
  qrCode?: string;
}

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  venue: string;
}

const mockEvents: Event[] = [
  { id: "1", title: "Tech Conference 2024", date: "2024-03-15", time: "09:00 AM", venue: "Convention Center" },
  { id: "2", title: "Design Workshop", date: "2024-03-20", time: "02:00 PM", venue: "Creative Studio" },
  { id: "3", title: "Networking Mixer", date: "2024-03-25", time: "06:00 PM", venue: "Downtown Hotel" },
];

export default function RegistrationSection() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    organization: '',
    eventId: '',
    notes: '',
    guestCount: 1,
    gdprConsent: false,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState<RegistrationConfirmation | null>(null);
  const [isResendingEmail, setIsResendingEmail] = useState(false);

  // Load registration from session on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem('registration-confirmation');
      if (stored) {
        try {
          setConfirmation(JSON.parse(stored));
        } catch (e) {
          sessionStorage.removeItem('registration-confirmation');
        }
      }

      // Check for pre-selected event from URL params
      const params = new URLSearchParams(window.location.search);
      const eventId = params.get('eventId');
      if (eventId && mockEvents.find(e => e.id === eventId)) {
        setFormData(prev => ({ ...prev, eventId }));
      }
    }
  }, []);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (!formData.organization.trim()) {
      newErrors.organization = 'College/Organization is required';
    }

    if (!formData.eventId) {
      newErrors.eventId = 'Please select an event';
    }

    if (!formData.gdprConsent) {
      newErrors.gdprConsent = 'You must accept the privacy policy to continue';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }

    // Live validation for email and phone
    if (field === 'email' && typeof value === 'string' && value.length > 0) {
      if (!validateEmail(value)) {
        setErrors(prev => ({ ...prev, email: 'Please enter a valid email address' }));
      }
    }

    if (field === 'phone' && typeof value === 'string' && value.length > 0) {
      if (!validatePhone(value)) {
        setErrors(prev => ({ ...prev, phone: 'Please enter a valid phone number' }));
      }
    }
  };

  const submitRegistration = async (data: FormData): Promise<RegistrationConfirmation> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulate random failure for demo
    if (Math.random() < 0.1) {
      throw new Error('Registration failed. Please try again.');
    }

    const selectedEvent = mockEvents.find(e => e.id === data.eventId);
    return {
      id: `REG-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      eventName: selectedEvent?.title || 'Unknown Event',
      attendeeName: data.name,
      eventDate: selectedEvent?.date || '',
      eventTime: selectedEvent?.time || '',
      venue: selectedEvent?.venue || '',
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Please fix the form errors before submitting");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await submitRegistration(formData);
      setConfirmation(result);
      
      // Store in session for persistence
      if (typeof window !== "undefined") {
        sessionStorage.setItem('registration-confirmation', JSON.stringify(result));
      }
      
      toast.success("Registration successful! Check your email for confirmation.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendEmail = async () => {
    if (!confirmation) return;
    
    setIsResendingEmail(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success("Confirmation email sent successfully!");
    } catch (error) {
      toast.error("Failed to send email. Please try again.");
    } finally {
      setIsResendingEmail(false);
    }
  };

  const handleDownloadPDF = () => {
    toast.info("PDF download will be available soon");
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      organization: '',
      eventId: '',
      notes: '',
      guestCount: 1,
      gdprConsent: false,
    });
    setErrors({});
    setConfirmation(null);
    if (typeof window !== "undefined") {
      sessionStorage.removeItem('registration-confirmation');
    }
  };

  if (confirmation) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6 space-y-8">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center mb-4">
            <div className="flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full">
              <TicketCheck className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground">Registration Confirmed!</h1>
          <p className="text-muted-foreground">Your registration has been successfully processed.</p>
        </div>

        <Card className="bg-card border border-border">
          <CardHeader className="text-center pb-4">
            <CardTitle className="flex items-center justify-center gap-2 text-xl">
              <Ticket className="w-5 h-5" />
              Event Ticket
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-foreground">{confirmation.eventName}</h2>
              <Badge variant="secondary" className="text-sm">
                Registration ID: {confirmation.id}
              </Badge>
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Attendee</Label>
                  <p className="text-base font-medium text-foreground">{confirmation.attendeeName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Event Date</Label>
                  <p className="text-base font-medium text-foreground">{confirmation.eventDate}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Time</Label>
                  <p className="text-base font-medium text-foreground">{confirmation.eventTime}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Venue</Label>
                  <p className="text-base font-medium text-foreground">{confirmation.venue}</p>
                </div>
              </div>
              
              <div className="flex items-center justify-center">
                <div className="w-32 h-32 bg-muted rounded-lg flex items-center justify-center border border-border">
                  <div className="text-center text-muted-foreground">
                    <Receipt className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-xs">QR Code</p>
                    <p className="text-xs">Will be sent via email</p>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={handleDownloadPDF} variant="outline" className="flex items-center gap-2">
                <Receipt className="w-4 h-4" />
                Download PDF
              </Button>
              <Button 
                onClick={handleResendEmail} 
                variant="outline" 
                disabled={isResendingEmail}
                className="flex items-center gap-2"
              >
                {isResendingEmail ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <MailCheck className="w-4 h-4" />
                )}
                {isResendingEmail ? 'Sending...' : 'Resend Email'}
              </Button>
            </div>

            <div className="text-center pt-4">
              <Button variant="ghost" onClick={resetForm} className="text-muted-foreground hover:text-foreground">
                Register for Another Event
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <div className="text-center space-y-2 mb-8">
        <h1 className="text-3xl font-bold text-foreground">Event Registration</h1>
        <p className="text-muted-foreground">Register for your selected event</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="bg-card border border-border">
          <CardHeader>
            <CardTitle>Registration Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={errors.name ? 'border-destructive' : ''}
                  placeholder="Enter your full name"
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={errors.email ? 'border-destructive' : ''}
                  placeholder="your.email@example.com"
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className={errors.phone ? 'border-destructive' : ''}
                  placeholder="+1 (555) 123-4567"
                />
                {errors.phone && (
                  <p className="text-sm text-destructive">{errors.phone}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="organization">College/Organization *</Label>
                <Input
                  id="organization"
                  type="text"
                  value={formData.organization}
                  onChange={(e) => handleInputChange('organization', e.target.value)}
                  className={errors.organization ? 'border-destructive' : ''}
                  placeholder="University or Company"
                />
                {errors.organization && (
                  <p className="text-sm text-destructive">{errors.organization}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="event">Select Event *</Label>
              <Select 
                value={formData.eventId} 
                onValueChange={(value) => handleInputChange('eventId', value)}
              >
                <SelectTrigger className={errors.eventId ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Choose an event to register for" />
                </SelectTrigger>
                <SelectContent>
                  {mockEvents.map((event) => (
                    <SelectItem key={event.id} value={event.id}>
                      <div className="flex flex-col items-start">
                        <span className="font-medium">{event.title}</span>
                        <span className="text-xs text-muted-foreground">
                          {event.date} at {event.time} • {event.venue}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.eventId && (
                <p className="text-sm text-destructive">{errors.eventId}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="guestCount">Number of Guests</Label>
                <Select 
                  value={formData.guestCount.toString()} 
                  onValueChange={(value) => handleInputChange('guestCount', parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num} {num === 1 ? 'person' : 'people'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Any special requirements or comments"
                className="min-h-[100px]"
              />
            </div>

            <div className="flex items-start space-x-2 pt-4">
              <Checkbox
                id="gdpr"
                checked={formData.gdprConsent}
                onCheckedChange={(checked) => handleInputChange('gdprConsent', checked === true)}
              />
              <div className="grid gap-1.5 leading-none">
                <Label 
                  htmlFor="gdpr" 
                  className="text-sm font-normal leading-relaxed cursor-pointer"
                >
                  I agree to the processing of my personal data in accordance with the{' '}
                  <a href="#" className="text-primary underline underline-offset-2 hover:text-primary/80">
                    Privacy Policy
                  </a>{' '}
                  and consent to receive event-related communications. *
                </Label>
                {errors.gdprConsent && (
                  <p className="text-sm text-destructive">{errors.gdprConsent}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Button 
          type="submit" 
          className="w-full" 
          size="lg" 
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing Registration...
            </>
          ) : (
            <>
              <Check className="w-4 h-4 mr-2" />
              Complete Registration
            </>
          )}
        </Button>
      </form>
    </div>
  );
}