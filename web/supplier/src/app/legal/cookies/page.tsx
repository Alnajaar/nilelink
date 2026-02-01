import React from 'react';
import Link from 'next/link';
import { Button } from '@shared/components/Button';
import { ArrowLeft } from 'lucide-react';

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-background antialiased">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="mb-12">
          <Link href="/">
            <Button variant="ghost" className="flex items-center gap-2">
              <ArrowLeft size={16} />
              Back to Home
            </Button>
          </Link>
        </div>
        
        <div className="prose prose-lg max-w-none">
          <h1 className="text-4xl font-black text-text-main mb-8">Cookie Policy</h1>
          
          <div className="space-y-6 text-text-muted">
            <section>
              <h2 className="text-2xl font-black text-text-main mt-8 mb-4">1. What Are Cookies</h2>
              <p>
                Cookies are small text files that are stored on your computer or mobile device when you 
                visit a website.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-black text-text-main mt-8 mb-4">2. How We Use Cookies</h2>
              <p>
                We use cookies to remember your preferences, understand how you interact with our services, 
                and improve your experience.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-black text-text-main mt-8 mb-4">3. Types of Cookies</h2>
              <p>
                We use both session cookies (which expire when you close your browser) and persistent 
                cookies (which stay on your device until deleted).
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-black text-text-main mt-8 mb-4">4. Managing Cookies</h2>
              <p>
                You can control and manage cookies in various ways, though disabling cookies may affect 
                the functionality of our services.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}