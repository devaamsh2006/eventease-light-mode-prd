"use client";

import { ExternalLink } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-background border-t border-border py-8">
      <div className="container max-w-6xl">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          {/* Left side - Branding */}
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-lg text-foreground">
              EventEase
            </span>
            <span className="text-muted-foreground text-sm">
              © {currentYear}
            </span>
          </div>

          {/* Center - Links */}
          <nav className="flex items-center gap-6">
            <a
              href="/privacy"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href="/terms"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Terms of Service
            </a>
          </nav>

          {/* Right side - Contact */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <a
              href="mailto:support@eventease.com"
              className="hover:text-foreground transition-colors flex items-center gap-1"
            >
              support@eventease.com
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}