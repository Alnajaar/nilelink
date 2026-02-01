'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ShoppingBag, Truck, Package, Users, Zap, ArrowRight,
  CheckCircle, TrendingUp, Wallet, Globe, Cube, Brain
} from 'lucide-react';
import GlobalNavbar from '@/shared/components/Navbar.v2';
import GlobalFooter from '@/shared/components/GlobalFooter';

export default function Home() {
  return (
    <>
      <GlobalNavbar variant="transparent" context="public" />

      {/* Hero Section */}
      <section className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 pt-20 px-6 flex items-center">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                Supply Chains Reimagined
              </h1>
              <p className="text-xl text-slate-300 mb-8 leading-relaxed">
                AI-powered inventory management, real-time POS integration, and blockchain payments. 
                Connect your entire ecosystem in one platform.
              </p>
              <div className="flex gap-4 flex-wrap">
                <Link href="/signup" className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all duration-200 flex items-center gap-2">
                  Get Started <ArrowRight className="w-5 h-5" />
                </Link>
                <Link href="/docs" className="px-8 py-3 border border-slate-700 hover:border-blue-500 text-slate-300 hover:text-white rounded-lg font-semibold transition-all duration-200">
                  Explore Docs
                </Link>
              </div>
            </motion.div>

            {/* Hero Visual */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="hidden lg:block"
            >
              <div className="relative w-full aspect-square">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-cyan-500/20 to-transparent rounded-full blur-3xl" />
                <div className="relative w-full h-full rounded-xl border border-slate-700/50 bg-slate-900/50 backdrop-blur-sm p-8">
                  <div className="grid grid-cols-2 gap-4 h-full">
                    <div className="bg-slate-800/50 rounded-lg p-4 flex items-center justify-center">
                      <Package className="w-12 h-12 text-blue-400" />
                    </div>
                    <div className="bg-slate-800/50 rounded-lg p-4 flex items-center justify-center">
                      <Truck className="w-12 h-12 text-cyan-400" />
                    </div>
                    <div className="bg-slate-800/50 rounded-lg p-4 flex items-center justify-center">
                      <Wallet className="w-12 h-12 text-green-400" />
                    </div>
                    <div className="bg-slate-800/50 rounded-lg p-4 flex items-center justify-center">
                      <Brain className="w-12 h-12 text-purple-400" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Ecosystem Cards */}
      <section className="py-20 px-6 bg-slate-950">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-white text-center mb-16">The Complete Ecosystem</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: ShoppingBag,
                title: 'Customer Portal',
                description: 'Seamless shopping experience with real-time inventory sync',
                color: 'blue'
              },
              {
                icon: Package,
                title: 'Vendor Portal',
                description: 'Manage inventory, orders, and fulfillment efficiently',
                color: 'cyan'
              },
              {
                icon: Package,
                title: 'POS System',
                description: 'Modern point-of-sale with blockchain payments',
                color: 'green'
              },
              {
                icon: Truck,
                title: 'Delivery App',
                description: 'Real-time tracking with AI-optimized routes',
                color: 'purple'
              },
              {
                icon: Users,
                title: 'Supplier Network',
                description: 'AI demand forecasting and automated reordering',
                color: 'orange'
              },
              {
                icon: TrendingUp,
                title: 'Investor Dashboard',
                description: 'Comprehensive metrics and growth analytics',
                color: 'red'
              }
            ].map((item, idx) => {
              const Icon = item.icon;
              const colorMap = {
                blue: 'from-blue-500 to-blue-600',
                cyan: 'from-cyan-500 to-cyan-600',
                green: 'from-green-500 to-green-600',
                purple: 'from-purple-500 to-purple-600',
                orange: 'from-orange-500 to-orange-600',
                red: 'from-red-500 to-red-600'
              };

              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="group"
                >
                  <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-8 hover:border-blue-500/50 transition-all duration-300 h-full">
                    <div className={`w-14 h-14 rounded-lg bg-gradient-to-br ${colorMap[item.color as keyof typeof colorMap]} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">{item.title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">{item.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6 bg-slate-900/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-white text-center mb-16">How It Works</h2>
          
          <div className="space-y-8">
            {[
              {
                number: '1',
                title: 'Connect Your Store',
                description: 'Integrate your POS system, inventory, and delivery partners in minutes',
                icon: Globe
              },
              {
                number: '2',
                title: 'AI Powers Your Decisions',
                description: 'Machine learning predicts demand, optimizes pricing, and detects fraud in real-time',
                icon: Brain
              },
              {
                number: '3',
                title: 'Instant Settlement',
                description: 'Blockchain-based payments settle instantly with USDC on Polygon',
                icon: Wallet
              }
            ].map((step, idx) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex gap-6 items-start"
                >
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-600">
                      <span className="text-white font-bold text-lg">{step.number}</span>
                    </div>
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-2xl font-semibold text-white mb-2">{step.title}</h3>
                    <p className="text-slate-400">{step.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* AI & Blockchain */}
      <section className="py-20 px-6 bg-slate-950">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-white text-center mb-16">AI & Blockchain Advantage</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* AI Section */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <Brain className="w-8 h-8 text-purple-400" />
                <h3 className="text-2xl font-bold text-white">AI Intelligence</h3>
              </div>
              <ul className="space-y-4">
                {[
                  'Demand forecasting with 95% accuracy',
                  'Dynamic pricing algorithms',
                  'Fraud detection in real-time',
                  'Route optimization for delivery',
                  'Inventory anomaly detection'
                ].map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-slate-300">
                    <CheckCircle className="w-5 h-5 text-purple-400 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Blockchain Section */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <Cube className="w-8 h-8 text-cyan-400" />
                <h3 className="text-2xl font-bold text-white">Blockchain Security</h3>
              </div>
              <ul className="space-y-4">
                {[
                  'USDC payments on Polygon',
                  'Instant settlement (< 30 seconds)',
                  'Immutable audit trail',
                  'Smart contract escrow',
                  'DeFi composability'
                ].map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-slate-300">
                    <CheckCircle className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6 bg-slate-900/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-white text-center mb-16">Trusted by Businesses</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                quote: "NileLink transformed our supply chain. Inventory costs dropped 35%.",
                author: "Ahmed Hassan",
                role: "CEO, Cairo Foods"
              },
              {
                quote: "The AI demand forecasting is incredibly accurate. We never run out of stock.",
                author: "Fatima Al-Zahra",
                role: "Operations Director, Nile Retail"
              },
              {
                quote: "Blockchain payments eliminated our settlement delays. Amazing platform.",
                author: "Omar Khalid",
                role: "CFO, El-Nile Logistics"
              },
              {
                quote: "Our delivery times improved by 40%. The route optimization is brilliant.",
                author: "Layla Mohamed",
                role: "Manager, Cairo Delivery Co."
              }
            ].map((testimonial, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-6"
              >
                <p className="text-slate-300 mb-4 italic">"{testimonial.quote}"</p>
                <div>
                  <p className="text-white font-semibold">{testimonial.author}</p>
                  <p className="text-slate-500 text-sm">{testimonial.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-blue-600 to-cyan-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Transform Your Business?</h2>
          <p className="text-lg text-blue-100 mb-8">
            Join hundreds of businesses optimizing their supply chains with NileLink.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/signup" className="px-8 py-4 bg-white hover:bg-slate-100 text-blue-600 rounded-lg font-bold transition-colors">
              Start Free Trial
            </Link>
            <Link href="/contact" className="px-8 py-4 border-2 border-white hover:bg-white/10 text-white rounded-lg font-bold transition-colors">
              Schedule Demo
            </Link>
          </div>
        </div>
      </section>

      <GlobalFooter />
    </>
  );
}
