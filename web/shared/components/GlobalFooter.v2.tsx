'use client';

import React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Github,
  Mail,
  Phone,
  MapPin,
  Shield,
  Lock,
  Cpu,
  CheckCircle,
  Zap,
  Globe,
} from 'lucide-react';

interface GlobalFooterProps {
  context?: 'portal' | 'pos' | 'delivery' | 'supplier' | 'admin' | 'investor' | 'public';
  variant?: 'default' | 'minimal' | 'compact';
}

const GlobalFooter = ({
  context = 'public',
  variant = 'default',
}: GlobalFooterProps): React.ReactElement => {
  const currentYear = new Date().getFullYear();

  // Context-specific customization
  const footerConfig = {
    portal: { bgGradient: 'from-blue-950 to-slate-950', accentColor: 'blue' },
    pos: { bgGradient: 'from-purple-950 to-slate-950', accentColor: 'purple' },
    delivery: { bgGradient: 'from-orange-950 to-slate-950', accentColor: 'orange' },
    supplier: { bgGradient: 'from-green-950 to-slate-950', accentColor: 'green' },
    admin: { bgGradient: 'from-red-950 to-slate-950', accentColor: 'red' },
    investor: { bgGradient: 'from-cyan-950 to-slate-950', accentColor: 'cyan' },
    public: { bgGradient: 'from-slate-950 to-slate-950', accentColor: 'blue' },
  };

  const config = footerConfig[context];

  return (
    <footer className={`bg-gradient-to-b ${config.bgGradient} border-t border-slate-700/50 relative`}>
      {/* Minimal variant - simplified footer */}
      {variant === 'minimal' && (
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            {/* Brand */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-semibold text-slate-100">NileLink © {currentYear}</span>
            </div>

            {/* Quick Links */}
            <div className="flex flex-wrap justify-center gap-6">
              <Link href="/about" className="text-xs text-slate-400 hover:text-slate-100 transition-colors">
                About
              </Link>
              <Link href="/privacy" className="text-xs text-slate-400 hover:text-slate-100 transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="text-xs text-slate-400 hover:text-slate-100 transition-colors">
                Terms
              </Link>
              <Link href="/contact" className="text-xs text-slate-400 hover:text-slate-100 transition-colors">
                Contact
              </Link>
            </div>

            {/* Social */}
            <div className="flex gap-4">
              <a href="#" className="text-slate-400 hover:text-blue-400 transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="text-slate-400 hover:text-blue-400 transition-colors">
                <Linkedin className="w-4 h-4" />
              </a>
              <a href="#" className="text-slate-400 hover:text-blue-400 transition-colors">
                <Github className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Compact variant - two-section footer */}
      {variant === 'compact' && (
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Brand Section */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img
                  src="/logo.png"
                  alt="NileLink Logo"
                  className="w-10 h-10 object-contain"
                />
                <h2 className="text-xl font-bold text-slate-100">NileLink</h2>
              </div>
              <p className="text-sm text-slate-400 mb-6 max-w-xs">
                Supply chains reimagined with AI-powered intelligence and blockchain-backed trust.
              </p>
              <div className="flex gap-3">
                <a href="#" className="text-slate-400 hover:text-blue-400 transition-colors">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="#" className="text-slate-400 hover:text-blue-400 transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" className="text-slate-400 hover:text-blue-400 transition-colors">
                  <Linkedin className="w-5 h-5" />
                </a>
                <a href="#" className="text-slate-400 hover:text-blue-400 transition-colors">
                  <Github className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Links Grid */}
            <div className="grid grid-cols-2 gap-8">
              <div>
                <h3 className="text-sm font-semibold text-slate-100 mb-4">Product</h3>
                <ul className="space-y-2">
                  <li>
                    <Link href="#" className="text-sm text-slate-400 hover:text-slate-100 transition-colors">
                      Features
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-sm text-slate-400 hover:text-slate-100 transition-colors">
                      Pricing
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-sm text-slate-400 hover:text-slate-100 transition-colors">
                      API Docs
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-100 mb-4">Legal</h3>
                <ul className="space-y-2">
                  <li>
                    <Link href="#" className="text-sm text-slate-400 hover:text-slate-100 transition-colors">
                      Terms
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-sm text-slate-400 hover:text-slate-100 transition-colors">
                      Privacy
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-sm text-slate-400 hover:text-slate-100 transition-colors">
                      Compliance
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-slate-700/50 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-slate-500">
              © {currentYear} NileLink Protocol. All rights reserved.
            </p>
            <div className="flex gap-6">
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <Shield className="w-3 h-3" />
                ISO 27001
              </span>
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <Cpu className="w-3 h-3" />
                Blockchain Verified
              </span>
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <Lock className="w-3 h-3" />
                GDPR Compliant
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Default variant - full 5-section footer */}
      {variant === 'default' && (
        <div className="relative">
          {/* Top section with blur gradient background */}
          <div className="absolute inset-0 top-0 h-1/3 bg-gradient-to-b from-blue-500/5 to-transparent pointer-events-none" />

          <div className="max-w-7xl mx-auto px-6 py-16 relative z-10">
            {/* Main Grid - 5 Sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
              {/* Section 1: Brand & Mission */}
              <div className="lg:col-span-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-100">NileLink</h2>
                </div>

                <p className="text-sm text-slate-400 mb-6 line-clamp-3">
                  Supply chains reimagined with AI-powered intelligence and blockchain-backed trust.
                </p>

                <p className="text-xs text-slate-500 mb-6">
                  <strong>Mission:</strong> Democratizing global supply chains through transparent technology.
                </p>

                {/* Social Links */}
                <div className="flex gap-3">
                  <a
                    href="https://facebook.com"
                    className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-slate-800/50 hover:bg-blue-600/50 text-slate-400 hover:text-slate-100 transition-all duration-200"
                  >
                    <Facebook className="w-4 h-4" />
                  </a>
                  <a
                    href="https://twitter.com"
                    className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-slate-800/50 hover:bg-blue-600/50 text-slate-400 hover:text-slate-100 transition-all duration-200"
                  >
                    <Twitter className="w-4 h-4" />
                  </a>
                  <a
                    href="https://linkedin.com"
                    className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-slate-800/50 hover:bg-blue-600/50 text-slate-400 hover:text-slate-100 transition-all duration-200"
                  >
                    <Linkedin className="w-4 h-4" />
                  </a>
                  <a
                    href="https://instagram.com"
                    className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-slate-800/50 hover:bg-blue-600/50 text-slate-400 hover:text-slate-100 transition-all duration-200"
                  >
                    <Instagram className="w-4 h-4" />
                  </a>
                  <a
                    href="https://github.com"
                    className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-slate-800/50 hover:bg-blue-600/50 text-slate-400 hover:text-slate-100 transition-all duration-200"
                  >
                    <Github className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* Section 2: Ecosystem (Portals) */}
              <div>
                <h3 className="text-sm font-semibold text-slate-100 mb-4 uppercase tracking-wider">
                  Ecosystem
                </h3>
                <ul className="space-y-3">
                  <li>
                    <Link
                      href="/customer"
                      className="text-sm text-slate-400 hover:text-blue-400 transition-colors flex items-center gap-2 group"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500/50 group-hover:bg-blue-400 transition-colors" />
                      Customer Portal
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/supplier"
                      className="text-sm text-slate-400 hover:text-green-400 transition-colors flex items-center gap-2 group"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500/50 group-hover:bg-green-400 transition-colors" />
                      Supplier Portal
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/pos"
                      className="text-sm text-slate-400 hover:text-purple-400 transition-colors flex items-center gap-2 group"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-500/50 group-hover:bg-purple-400 transition-colors" />
                      POS System
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/driver"
                      className="text-sm text-slate-400 hover:text-orange-400 transition-colors flex items-center gap-2 group"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-500/50 group-hover:bg-orange-400 transition-colors" />
                      Delivery App
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/admin"
                      className="text-sm text-slate-400 hover:text-cyan-400 transition-colors flex items-center gap-2 group"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-500/50 group-hover:bg-cyan-400 transition-colors" />
                      Admin Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/investor"
                      className="text-sm text-slate-400 hover:text-red-400 transition-colors flex items-center gap-2 group"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500/50 group-hover:bg-red-400 transition-colors" />
                      Investor Dashboard
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Section 3: Developers */}
              <div>
                <h3 className="text-sm font-semibold text-slate-100 mb-4 uppercase tracking-wider">
                  Developers
                </h3>
                <ul className="space-y-3">
                  <li>
                    <Link
                      href="/docs"
                      className="text-sm text-slate-400 hover:text-blue-400 transition-colors flex items-center gap-2"
                    >
                      <ArrowRight className="w-3 h-3" />
                      API Documentation
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/docs/sdk"
                      className="text-sm text-slate-400 hover:text-blue-400 transition-colors flex items-center gap-2"
                    >
                      <ArrowRight className="w-3 h-3" />
                      SDKs & Libraries
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/docs/webhooks"
                      className="text-sm text-slate-400 hover:text-blue-400 transition-colors flex items-center gap-2"
                    >
                      <ArrowRight className="w-3 h-3" />
                      Webhooks
                    </Link>
                  </li>
                  <li>
                    <a
                      href="https://github.com/nilelink"
                      className="text-sm text-slate-400 hover:text-blue-400 transition-colors flex items-center gap-2"
                    >
                      <ArrowRight className="w-3 h-3" />
                      GitHub
                    </a>
                  </li>
                  <li>
                    <Link
                      href="/status"
                      className="text-sm text-slate-400 hover:text-blue-400 transition-colors flex items-center gap-2"
                    >
                      <ArrowRight className="w-3 h-3" />
                      Status Page
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Section 4: Legal & Compliance */}
              <div>
                <h3 className="text-sm font-semibold text-slate-100 mb-4 uppercase tracking-wider">
                  Legal
                </h3>
                <ul className="space-y-3">
                  <li>
                    <Link
                      href="/legal/terms"
                      className="text-sm text-slate-400 hover:text-blue-400 transition-colors flex items-center gap-2"
                    >
                      <CheckCircle className="w-3 h-3" />
                      Terms of Service
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/legal/privacy"
                      className="text-sm text-slate-400 hover:text-blue-400 transition-colors flex items-center gap-2"
                    >
                      <Lock className="w-3 h-3" />
                      Privacy Policy
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/legal/cookies"
                      className="text-sm text-slate-400 hover:text-blue-400 transition-colors flex items-center gap-2"
                    >
                      <Cpu className="w-3 h-3" />
                      Cookie Policy
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/legal/compliance"
                      className="text-sm text-slate-400 hover:text-blue-400 transition-colors flex items-center gap-2"
                    >
                      <Shield className="w-3 h-3" />
                      Compliance
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/security"
                      className="text-sm text-slate-400 hover:text-blue-400 transition-colors flex items-center gap-2"
                    >
                      <Globe className="w-3 h-3" />
                      Security
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Section 5: Contact & Support */}
              <div>
                <h3 className="text-sm font-semibold text-slate-100 mb-4 uppercase tracking-wider">
                  Contact
                </h3>
                <ul className="space-y-3">
                  <li>
                    <a
                      href="mailto:support@nilelink.io"
                      className="text-sm text-slate-400 hover:text-blue-400 transition-colors flex items-center gap-2"
                    >
                      <Mail className="w-4 h-4" />
                      <span>support@nilelink.io</span>
                    </a>
                  </li>
                  <li>
                    <a
                      href="tel:+201001234567"
                      className="text-sm text-slate-400 hover:text-blue-400 transition-colors flex items-center gap-2"
                    >
                      <Phone className="w-4 h-4" />
                      <span>+20 100 123 4567</span>
                    </a>
                  </li>
                  <li>
                    <Link
                      href="https://maps.google.com/maps?q=Cairo,+Egypt"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-slate-400 hover:text-blue-400 transition-colors flex items-center gap-2"
                    >
                      <MapPin className="w-4 h-4" />
                      <span>Cairo, Egypt</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/contact"
                      className="text-sm text-slate-400 hover:text-blue-400 transition-colors flex items-center gap-2 pt-2 border-t border-slate-700/50 mt-2"
                    >
                      <ArrowRight className="w-3 h-3" />
                      Send Message
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-slate-700/50 my-8" />

            {/* Bottom Section - Trust Badges & Copyright */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              {/* Trust Badges */}
              <div className="flex flex-wrap justify-center md:justify-start gap-6">
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800/30 border border-slate-700/50 hover:border-green-500/50 transition-colors group">
                  <Shield className="w-4 h-4 text-green-400 group-hover:text-green-300 transition-colors" />
                  <span className="text-xs font-semibold text-slate-300 group-hover:text-slate-100 transition-colors">
                    ISO 27001
                  </span>
                </div>

                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800/30 border border-slate-700/50 hover:border-blue-500/50 transition-colors group">
                  <Cpu className="w-4 h-4 text-blue-400 group-hover:text-blue-300 transition-colors" />
                  <span className="text-xs font-semibold text-slate-300 group-hover:text-slate-100 transition-colors">
                    Blockchain Verified
                  </span>
                </div>

                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800/30 border border-slate-700/50 hover:border-purple-500/50 transition-colors group">
                  <Lock className="w-4 h-4 text-purple-400 group-hover:text-purple-300 transition-colors" />
                  <span className="text-xs font-semibold text-slate-300 group-hover:text-slate-100 transition-colors">
                    GDPR Compliant
                  </span>
                </div>

                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800/30 border border-slate-700/50 hover:border-cyan-500/50 transition-colors group">
                  <Globe className="w-4 h-4 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
                  <span className="text-xs font-semibold text-slate-300 group-hover:text-slate-100 transition-colors">
                    PCI DSS
                  </span>
                </div>
              </div>

              {/* Copyright */}
              <div className="text-xs text-slate-500 text-center md:text-right">
                <p>
                  © {currentYear} NileLink Protocol. Built with{' '}
                  <span className="text-red-500">❤️</span> for supply chains worldwide.
                </p>
                <p className="mt-1 text-slate-600">Powered by Polygon • USDC • Ethereum</p>
              </div>
            </div>
          </div>

          {/* Bottom gradient accent */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-600/50 to-transparent" />
        </div>
      )}
    </footer>
  );
};

export default GlobalFooter;
