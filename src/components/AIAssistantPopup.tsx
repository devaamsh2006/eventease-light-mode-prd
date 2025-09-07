"use client";

import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Sparkles, Bot, User } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export const AIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm your AI assistant. How can I help you with EventHub today?",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue.trim(),
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response delay
    setTimeout(() => {
      const responses = [
        "I'd be happy to help! You can create events in the Admin panel, register for events in the Discover section, or check your attendance in the Dashboard.",
        "For event management, organizers can add events, edit details, and track attendance. Attendees can discover and register for exciting events.",
        "Need help navigating EventHub? Check your Dashboard for upcoming events, browse the Discover page for new opportunities, or use the Admin panel if you're an organizer.",
        "I can assist with event registration, attendance tracking, or general questions about using EventHub. What would you like to know?",
        "EventHub makes event management simple! Organizers can create and manage events while attendees can easily discover and register for amazing experiences."
      ];
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: randomResponse,
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 h-16 w-16 rounded-2xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground glass border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-500 ease-out hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-transparent group animate-float"
        aria-label="Open AI Assistant"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent rounded-2xl" />
        <div className="relative z-10 flex items-center justify-center">
          <Sparkles className="h-6 w-6 group-hover:rotate-12 group-hover:scale-110 transition-all duration-300" />
        </div>
        
        {/* Notification Dot */}
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-pulse border-2 border-white/50 shadow-lg" />
      </button>

      {/* Backdrop and Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-end p-4 sm:p-6"
          onClick={handleBackdropClick}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/20 backdrop-blur-lg transition-all duration-500 animate-fade-in" />
          
          {/* Chat Popup */}
          <div className="relative w-full max-w-md h-[600px] glass border-white/20 shadow-2xl flex flex-col rounded-2xl animate-scale-in overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-transparent" />
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-full blur-3xl animate-float" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-br from-blue-500/20 to-teal-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
            
            {/* Header */}
            <div className="relative z-10 flex items-center justify-between p-6 border-b border-white/20">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-primary to-primary/70 flex items-center justify-center shadow-lg animate-glow">
                  <Bot className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-lg">AI Assistant</h3>
                  <p className="text-sm text-muted-foreground">Always here to help ✨</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-2 rounded-xl hover:bg-white/10 backdrop-blur-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/50 group transform hover:scale-105"
                aria-label="Close AI Assistant"
              >
                <X className="h-5 w-5 text-muted-foreground group-hover:text-foreground group-hover:rotate-90 transition-all duration-300" />
              </button>
            </div>

            {/* Messages Container */}
            <div className="relative z-10 flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
              {messages.map((message, index) => (
                <div
                  key={message.id}
                  className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} animate-slide-in`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className={`flex items-end space-x-2 max-w-[85%] ${message.isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    {/* Avatar */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg ${
                      message.isUser 
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500' 
                        : 'bg-gradient-to-r from-primary to-primary/70 animate-glow'
                    }`}>
                      {message.isUser ? (
                        <User className="h-4 w-4 text-white" />
                      ) : (
                        <Bot className="h-4 w-4 text-primary-foreground" />
                      )}
                    </div>
                    
                    {/* Message Bubble */}
                    <div
                      className={`rounded-2xl px-4 py-3 text-sm transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 ${
                        message.isUser
                          ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white glass border-white/20'
                          : 'glass bg-white/10 text-foreground border-white/20'
                      }`}
                    >
                      <p className="whitespace-pre-wrap leading-relaxed">{message.text}</p>
                      <p className={`text-xs mt-2 opacity-70 ${
                        message.isUser ? 'text-white/70' : 'text-muted-foreground/70'
                      }`}>
                        {message.timestamp.toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex justify-start animate-fade-in">
                  <div className="flex items-end space-x-2 max-w-[85%]">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-primary/70 flex items-center justify-center flex-shrink-0 shadow-lg animate-glow">
                      <Bot className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <div className="glass bg-white/10 text-foreground border-white/20 rounded-2xl px-4 py-3 text-sm shadow-lg">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="relative z-10 p-4 border-t border-white/20">
              <div className="flex space-x-3">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-3 text-sm glass bg-white/5 border-white/20 rounded-xl focus-glass hover:bg-white/10 transition-all duration-300 placeholder:text-muted-foreground disabled:opacity-50"
                  disabled={isTyping}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isTyping}
                  className="px-4 py-3 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-xl hover:from-primary/90 hover:to-primary/70 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-primary disabled:hover:to-primary/80 glass border-white/20 shadow-lg hover:shadow-xl transform hover:scale-105 group"
                  aria-label="Send message"
                >
                  <Send className="h-4 w-4 group-hover:translate-x-0.5 transition-transform duration-200" />
                </button>
              </div>
              <div className="flex items-center justify-center mt-3 text-xs text-muted-foreground space-x-2">
                <Sparkles className="w-3 h-3" />
                <span>Press Enter to send • Shift+Enter for new line</span>
                <Sparkles className="w-3 h-3" />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};