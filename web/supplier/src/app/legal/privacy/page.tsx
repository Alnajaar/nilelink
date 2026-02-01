import React from 'react';
import Link from 'next/link';
import { Button } from '@shared/components/Button';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPage() {
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
          <h1 className="text-4xl font-black text-text-main mb-8">Privacy Policy</h1>
          
          <div className="space-y-6 text-text-muted">
            <section>
              <h2 className="text-2xl font-black text-text-main mt-8 mb-4">1. Information We Collect</h2>
              <p>
                We collect information you provide directly to us, such as when you create an account, 
                use our services, or communicate with us.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-black text-text-main mt-8 mb-4">2. How We Use Information</h2>
              <p>
                We use information about you to provide, maintain, and improve our services, and to 
                develop new features and services.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-black text-text-main mt-8 mb-4">3. Information Sharing</h2>
              <p>
                We do not share your personal information with companies, organizations, or individuals 
                outside of NileLink except in limited circumstances.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-black text-text-main mt-8 mb-4">4. Data Security</h2>
              <p>
                We implement appropriate technical and organizational measures to protect your personal 
                data against unauthorized access, alteration, disclosure, or destruction.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}