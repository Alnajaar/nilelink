import React from 'react';
import Link from 'next/link';
import { Button } from '@shared/components/Button';
import { ArrowLeft } from 'lucide-react';

export default function CompliancePage() {
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
          <h1 className="text-4xl font-black text-text-main mb-8">Compliance</h1>
          
          <div className="space-y-6 text-text-muted">
            <section>
              <h2 className="text-2xl font-black text-text-main mt-8 mb-4">1. Regulatory Standards</h2>
              <p>
                NileLink adheres to all applicable laws and regulations in the jurisdictions where we operate, 
                including data protection and privacy laws.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-black text-text-main mt-8 mb-4">2. Certification Programs</h2>
              <p>
                Our systems undergo regular audits and certifications to ensure compliance with international 
                standards and industry best practices.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-black text-text-main mt-8 mb-4">3. Reporting</h2>
              <p>
                We maintain transparent reporting mechanisms for compliance activities and regularly review 
                our policies to ensure ongoing adherence.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-black text-text-main mt-8 mb-4">4. Contact</h2>
              <p>
                For questions about our compliance program or to report concerns, please contact our 
                compliance team at compliance@nilelink.io.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}