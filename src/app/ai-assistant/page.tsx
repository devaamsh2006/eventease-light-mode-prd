import type { Metadata } from 'next'
import AIHelper from '@/components/AIHelper'

export const metadata: Metadata = {
  title: 'AI Assistant - EventEase',
  description: 'Get intelligent help with event planning, management, and organization using our AI-powered assistant. Ask questions, get recommendations, and streamline your event workflow.',
  keywords: ['AI assistant', 'event planning', 'artificial intelligence', 'event management', 'smart recommendations', 'automated help'],
  openGraph: {
    title: 'AI Assistant - EventEase',
    description: 'Intelligent AI assistant for seamless event planning and management',
    type: 'website'
  }
}

export default function AIAssistantPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
            AI Assistant
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Get intelligent assistance with event planning, management, and organization. 
            Ask questions, receive personalized recommendations, and streamline your workflow 
            with our AI-powered helper.
          </p>
        </header>

        <div className="bg-card rounded-lg border border-border shadow-sm p-6">
          <AIHelper />
        </div>
      </div>
    </div>
  )
}