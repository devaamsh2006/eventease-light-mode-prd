import type { Metadata } from 'next'
import Dashboard from '@/components/Dashboard'

export const metadata: Metadata = {
  title: 'Organizer Dashboard | EventEase',
  description: 'Comprehensive event management dashboard for organizers. Monitor event analytics, manage registrations, track attendance, and access powerful tools to streamline your event operations.',
  keywords: [
    'event management dashboard',
    'event organizer tools',
    'event analytics',
    'registration management',
    'attendance tracking',
    'event insights',
    'organizer dashboard',
    'event administration',
    'event planning tools',
    'EventEase dashboard'
  ],
  openGraph: {
    title: 'Organizer Dashboard | EventEase',
    description: 'Comprehensive event management dashboard for organizers. Monitor event analytics, manage registrations, track attendance, and access powerful tools to streamline your event operations.',
    type: 'website',
    siteName: 'EventEase',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Organizer Dashboard | EventEase',
    description: 'Comprehensive event management dashboard for organizers. Monitor event analytics, manage registrations, track attendance, and access powerful tools to streamline your event operations.',
  },
  robots: {
    index: false, // Dashboard should not be indexed by search engines
    follow: false,
  },
  other: {
    'application-name': 'EventEase',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'apple-mobile-web-app-title': 'EventEase Dashboard',
  }
}

export default function DashboardPage() {
  return (
    <>
      <main 
        role="main" 
        className="min-h-screen bg-background"
        aria-label="Event organizer dashboard"
      >
        <div className="h-screen flex flex-col">
          <Dashboard />
        </div>
      </main>
    </>
  )
}