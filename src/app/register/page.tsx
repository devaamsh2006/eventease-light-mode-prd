import type { Metadata } from 'next'
import RegistrationSection from '@/components/RegistrationSection'

export const metadata: Metadata = {
  title: 'Register | EventEase',
  description: 'Register for upcoming events with EventEase. Simple, secure event registration process with instant confirmation and ticket management.',
  keywords: ['event registration', 'register for events', 'event tickets', 'event booking', 'EventEase registration'],
  openGraph: {
    title: 'Register for Events | EventEase',
    description: 'Register for upcoming events with EventEase. Simple, secure event registration process with instant confirmation and ticket management.',
    type: 'website',
    siteName: 'EventEase',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Register for Events | EventEase',
    description: 'Register for upcoming events with EventEase. Simple, secure event registration process with instant confirmation and ticket management.',
  },
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-display font-bold mb-4 text-foreground">
              Event Registration
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Join amazing events in your area. Our streamlined registration process makes it easy to secure your spot with instant confirmation and digital ticket delivery.
            </p>
          </div>
          
          <RegistrationSection />
        </div>
      </div>
    </div>
  )
}