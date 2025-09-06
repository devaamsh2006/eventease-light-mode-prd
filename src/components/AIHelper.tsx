"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BrainCog, MessageCircleQuestionMark, PanelTopOpen, Speech, NotebookTabs } from "lucide-react";
import { toast } from "sonner";

interface ChatMessage {
  id: string;
  type: "user" | "assistant";
  content: string;
  sources?: EventReference[];
  timestamp: Date;
}

interface EventReference {
  id: string;
  title: string;
  type: string;
}

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  type: string;
}

export default function AIHelper() {
  const [activeTab, setActiveTab] = useState("assistant");
  
  // Assistant tab state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  
  // Generator tab state
  const [generatorKeyword, setGeneratorKeyword] = useState("");
  const [generatorLength, setGeneratorLength] = useState("medium");
  const [generatedContent, setGeneratedContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState("");

  // Scroll to bottom of chat
  const scrollToBottom = useCallback(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, scrollToBottom]);

  // Fetch events for save modal
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch("/api/events");
        if (response.ok) {
          const data = await response.json();
          setEvents(data);
        }
      } catch (error) {
        console.error("Failed to fetch events:", error);
      }
    };

    if (showSaveModal) {
      fetchEvents();
    }
  }, [showSaveModal]);

  // Handle chat submission
  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: "user",
      content: userInput.trim(),
      timestamp: new Date(),
    };

    setChatMessages(prev => [...prev, userMessage]);
    setUserInput("");
    setIsLoading(true);
    setIsStreaming(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userInput.trim() }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: data.answer,
        sources: data.sources || [],
        timestamp: new Date(),
      };

      setChatMessages(prev => [...prev, assistantMessage]);

      if (data.incomplete) {
        toast.warning("Answer may be incomplete", {
          description: "Some information might be missing from the response."
        });
      }

    } catch (error) {
      console.error("Chat error:", error);
      toast.error("Failed to get response", {
        description: "Please try again or check your connection."
      });
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: "Sorry, I'm having trouble responding right now. Please try again.",
        timestamp: new Date(),
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
    }
  };

  // Handle source click
  const handleSourceClick = (source: EventReference) => {
    // Navigate to event detail or open in new tab
    window.open(`/events/${source.id}`, '_blank');
  };

  // Handle content generation
  const handleGenerate = async () => {
    if (!generatorKeyword.trim() || isGenerating) return;

    setIsGenerating(true);
    
    try {
      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          keyword: generatorKeyword.trim(),
          length: generatorLength 
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          toast.error("Rate limit exceeded", {
            description: "Please wait a moment before generating again."
          });
          return;
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setGeneratedContent(data.content);
      
      if (data.tokenUsage) {
        toast.info(`Generated using ${data.tokenUsage} tokens`);
      }

    } catch (error) {
      console.error("Generation error:", error);
      toast.error("Failed to generate content", {
        description: "Please try again or check your connection."
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle save to event
  const handleSaveToEvent = async () => {
    if (!selectedEventId || !generatedContent.trim()) return;

    try {
      const response = await fetch(`/api/events/${selectedEventId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: generatedContent.trim() }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      toast.success("Description saved", {
        description: "The generated content has been saved to the event."
      });
      
      setShowSaveModal(false);
      setSelectedEventId("");
      
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Failed to save description", {
        description: "Please try again or check your connection."
      });
    }
  };

  return (
    <div className="bg-card rounded-lg p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <BrainCog className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">AI Assistant</h2>
            <p className="text-muted-foreground">Get answers about events or generate content</p>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="assistant" className="flex items-center gap-2">
            <MessageCircleQuestionMark className="w-4 h-4" />
            Assistant
          </TabsTrigger>
          <TabsTrigger value="generator" className="flex items-center gap-2">
            <NotebookTabs className="w-4 h-4" />
            Generator
          </TabsTrigger>
        </TabsList>

        <TabsContent value="assistant" className="mt-6">
          <div className="space-y-4">
            {/* Chat History */}
            <ScrollArea 
              ref={chatScrollRef}
              className="h-96 w-full border rounded-lg p-4"
            >
              {chatMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <Speech className="w-12 h-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Ask me anything about events</h3>
                  <p className="text-muted-foreground">
                    Try asking "When is the coding contest?" or "What workshops are available?"
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {chatMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          message.type === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        {message.sources && message.sources.length > 0 && (
                          <div className="mt-3 space-y-1">
                            <p className="text-xs opacity-70">Sources:</p>
                            <div className="flex flex-wrap gap-1">
                              {message.sources.map((source) => (
                                <button
                                  key={source.id}
                                  onClick={() => handleSourceClick(source)}
                                  className="text-xs bg-background/20 hover:bg-background/30 rounded px-2 py-1 transition-colors"
                                >
                                  {source.title}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                        <p className="text-xs opacity-50 mt-1">
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  {isStreaming && (
                    <div className="flex justify-start">
                      <div className="bg-muted rounded-lg p-3">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse" />
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse" style={{ animationDelay: "0.2s" }} />
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse" style={{ animationDelay: "0.4s" }} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>

            {/* Chat Input */}
            <form onSubmit={handleChatSubmit} className="flex gap-2">
              <Input
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Ask a question about events..."
                disabled={isLoading}
                className="flex-1"
                aria-label="Chat message input"
              />
              <Button type="submit" disabled={isLoading || !userInput.trim()}>
                {isLoading ? "Asking..." : "Ask"}
              </Button>
            </form>
          </div>
        </TabsContent>

        <TabsContent value="generator" className="mt-6">
          <div className="space-y-6">
            {/* Generator Form */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label htmlFor="keyword-input" className="block text-sm font-medium mb-2">
                    Keyword or Topic
                  </label>
                  <Input
                    id="keyword-input"
                    value={generatorKeyword}
                    onChange={(e) => setGeneratorKeyword(e.target.value)}
                    placeholder="e.g., Hackathon, Workshop, Conference..."
                    disabled={isGenerating}
                  />
                </div>
                <div>
                  <label htmlFor="length-select" className="block text-sm font-medium mb-2">
                    Length
                  </label>
                  <Select value={generatorLength} onValueChange={setGeneratorLength}>
                    <SelectTrigger id="length-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="short">Short</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="long">Long</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button 
                onClick={handleGenerate} 
                disabled={isGenerating || !generatorKeyword.trim()}
                className="w-full md:w-auto"
              >
                {isGenerating ? "Generating..." : "Generate Content"}
              </Button>
            </div>

            {/* Generated Content */}
            {generatedContent && (
              <div className="space-y-4">
                <div>
                  <label htmlFor="generated-content" className="block text-sm font-medium mb-2">
                    Generated Content (editable)
                  </label>
                  <Textarea
                    id="generated-content"
                    value={generatedContent}
                    onChange={(e) => setGeneratedContent(e.target.value)}
                    className="min-h-32"
                    placeholder="Generated content will appear here..."
                  />
                </div>

                <div className="flex justify-end">
                  <Dialog open={showSaveModal} onOpenChange={setShowSaveModal}>
                    <DialogTrigger asChild>
                      <Button variant="outline">
                        <PanelTopOpen className="w-4 h-4 mr-2" />
                        Save to Event
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Save to Event</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 pt-4">
                        <div>
                          <label htmlFor="event-select" className="block text-sm font-medium mb-2">
                            Select Event
                          </label>
                          <Select value={selectedEventId} onValueChange={setSelectedEventId}>
                            <SelectTrigger id="event-select">
                              <SelectValue placeholder="Choose an event..." />
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
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="outline" 
                            onClick={() => setShowSaveModal(false)}
                          >
                            Cancel
                          </Button>
                          <Button 
                            onClick={handleSaveToEvent}
                            disabled={!selectedEventId}
                          >
                            Save Description
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}