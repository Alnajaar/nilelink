import React from 'react';
import Link from 'next/link';
import { Button } from '@shared/components/Button';
import { ArrowLeft } from 'lucide-react';

export default function TermsPage() {
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
          <h1 className="text-4xl font-black text-text-main mb-8">Terms of Service</h1>
          
          <div className="space-y-6 text-text-muted">
            <section>
              <h2 className="text-2xl font-black text-text-main mt-8 mb-4">1. Acceptance of Terms</h2>
              <p>
                By accessing and using the NileLink platform, you accept and agree to be bound by the 
                terms and provisions of this agreement.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-black text-text-main mt-8 mb-4">2. Use License</h2>
              <p>
                Permission is granted to temporarily download one copy of the materials on NileLink's 
                website for personal, non-commercial transitory viewing only.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-black text-text-main mt-8 mb-4">3. Disclaimer</h2>
              <p>
                The materials on NileLink's website are provided on an 'as is' basis. NileLink makes 
                no warranties, expressed or implied, and hereby disclaims and negates all other warranties.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-black text-text-main mt-8 mb-4">4. Limitations</h2>
              <p>
                In no event shall NileLink or its suppliers be liable for any damages arising out of 
                the use or inability to use the materials on NileLink's website.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}