import { Metadata } from 'next'
import EventsSection from '@/components/EventsSection'

export const metadata: Metadata = {
  title: 'Events | EventEase',
  description: 'Discover and browse upcoming events. Find the perfect event for you with EventEase.',
  keywords: ['events', 'browse events', 'upcoming events', 'event discovery', 'EventEase'],
  openGraph: {
    title: 'Events | EventEase',
    description: 'Discover and browse upcoming events. Find the perfect event for you with EventEase.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Events | EventEase',
    description: 'Discover and browse upcoming events. Find the perfect event for you with EventEase.',
  },
}

export default function EventsPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <EventsSection />
      </div>
    </main>
  )
}