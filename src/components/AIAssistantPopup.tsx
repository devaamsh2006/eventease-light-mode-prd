"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, X, MessageCircle } from 'lucide-react';

export default function AIAssistantPopup() {
  const [isOpen, setIsOpen] = useState(false);

  const togglePopup = () => {
    setIsOpen(!isOpen);
  };

  const closePopup = () => {
    setIsOpen(false);
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        closePopup();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // Focus management - focus the close button when popup opens
      setTimeout(() => {
        const closeButton = document.querySelector('[data-ai-popup-close]') as HTMLButtonElement;
        closeButton?.focus();
      }, 100);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <>
      {/* Floating AI Assistant Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={togglePopup}
          size="lg"
          className="h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          aria-label="Open AI Assistant"
          aria-expanded={isOpen}
        >
          <Bot className="h-6 w-6" />
        </Button>
      </div>

      {/* Popup Overlay and Content */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/20 z-40 transition-opacity duration-300"
            onClick={closePopup}
            aria-hidden="true"
          />
          
          {/* Popup Card */}
          <div className="fixed bottom-24 right-6 z-50 w-80 max-w-[calc(100vw-3rem)] animate-in slide-in-from-bottom-4 fade-in duration-300">
            <Card className="shadow-xl border border-border bg-card">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg font-display">
                    <Bot className="h-5 w-5 text-primary" />
                    AI Assistant
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={closePopup}
                    className="h-8 w-8 p-0 hover:bg-muted"
                    aria-label="Close AI Assistant"
                    data-ai-popup-close
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Placeholder Content */}
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <MessageCircle className="h-12 w-12 text-muted-foreground mb-3" />
                  <h3 className="font-display font-semibold text-foreground mb-2">
                    AI Assistant
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Coming Soon!
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Our intelligent assistant will help you manage events, answer questions, and provide personalized recommendations for your EventEase experience.
                  </p>
                </div>

                {/* Future Chat Interface Placeholder */}
                <div className="border-t pt-4">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="h-2 w-2 bg-success rounded-full animate-pulse" />
                    AI assistant will be available soon
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </>
  );
}