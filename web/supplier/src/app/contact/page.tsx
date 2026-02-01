import React from 'react';
import Link from 'next/link';
import { Button } from '@shared/components/Button';
import { Input } from '@shared/components/Input';
import { ArrowLeft, Mail, Phone, MapPin } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background antialiased">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="mb-12">
          <Link href="/">
            <Button variant="ghost" className="flex items-center gap-2">
              <ArrowLeft size={16} />
              Back to Home
            </Button>
          </Link>
        </div>
        
        <div className="grid md:grid-cols-2 gap-16">
          <div>
            <h1 className="text-4xl font-black text-text-main mb-6">Get in Touch</h1>
            <p className="text-xl text-text-muted mb-8">
              Have questions about our supply chain platform? Reach out to our team and we'll get back to you as soon as possible.
            </p>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-black text-text-main mb-1">Email Us</h3>
                  <p className="text-text-muted">support@nilelink.io</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-black text-text-main mb-1">Call Us</h3>
                  <p className="text-text-muted">+20 100 123 4567</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-black text-text-main mb-1">Visit Us</h3>
                  <p className="text-text-muted">Cairo, Egypt</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white/50 backdrop-blur-sm p-8 rounded-2xl border border-border-subtle">
            <h2 className="text-2xl font-black text-text-main mb-6">Send us a message</h2>
            <form className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Input 
                  type="text" 
                  placeholder="First Name" 
                  className="bg-white/80 border-border-subtle"
                />
                <Input 
                  type="text" 
                  placeholder="Last Name" 
                  className="bg-white/80 border-border-subtle"
                />
              </div>
              
              <Input 
                type="email" 
                placeholder="Email Address" 
                className="bg-white/80 border-border-subtle"
              />
              
              <Input 
                type="text" 
                placeholder="Subject" 
                className="bg-white/80 border-border-subtle"
              />
              
              <textarea 
                placeholder="Your Message" 
                rows={5}
                className="w-full p-4 rounded-xl border border-border-subtle bg-white/80 focus:ring-2 focus:ring-primary focus:border-primary/30 focus:outline-none resize-none"
              />
              
              <Button className="w-full bg-gradient-to-r from-primary to-green-500 hover:from-primary/90 hover:to-green-500/90 py-6 font-black">
                Send Message
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}