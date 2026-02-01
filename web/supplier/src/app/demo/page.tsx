'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@shared/components/Button';
import { motion } from 'framer-motion';
import { ArrowLeft, Zap, Package, ShoppingCart, TrendingUp } from 'lucide-react';

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-surface antialiased">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-text-main to-primary mb-6">
            NileLink Demo Experience
          </h1>
          <p className="text-xl text-text-muted max-w-2xl mx-auto mb-10">
            Explore the power of our B2B supply chain platform with a guided demonstration.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {[
            { icon: Package, title: 'Inventory Management', desc: 'See how our unified catalog syncs across all sales channels in real-time.' },
            { icon: ShoppingCart, title: 'Order Processing', desc: 'Watch automated fulfillment flows from marketplace to your dashboard.' },
            { icon: TrendingUp, title: 'Analytics Dashboard', desc: 'Experience AI-powered insights for demand forecasting and optimization.' },
          ].map((feature, idx) => (
            <div key={idx} className="p-8 rounded-2xl border border-border-subtle bg-white/50 backdrop-blur-sm hover:shadow-xl transition-all">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-4">
                <feature.icon size={24} />
              </div>
              <h3 className="text-xl font-black text-text-main mb-2">{feature.title}</h3>
              <p className="text-text-muted">{feature.desc}</p>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-r from-primary/5 to-green-500/5 rounded-2xl p-10 text-center mb-12 border border-primary/10">
          <Zap className="w-12 h-12 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-black text-text-main mb-4">Ready to Experience More?</h2>
          <p className="text-text-muted mb-6 max-w-lg mx-auto">
            Sign up for a personalized demo with our supply chain experts who will walk you through 
            the features most relevant to your business.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register">
              <Button className="bg-gradient-to-r from-primary to-green-500 hover:from-primary/90 hover:to-green-500/90 px-8 py-6 font-black text-lg">
                Start Free Trial
              </Button>
            </Link>
            
            <Link href="/onboarding">
              <Button variant="outline" className="px-8 py-6 font-black text-lg border-2 border-primary text-primary">
                Schedule Demo
              </Button>
            </Link>
          </div>
        </div>

        <div className="text-center">
          <Link href="/">
            <Button variant="ghost" className="flex items-center gap-2 mx-auto">
              <ArrowLeft size={16} />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}