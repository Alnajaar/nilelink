import React from 'react';
import Link from 'next/link';
// import { motion } from 'framer-motion';

// Icons
import {
  Shield,
  Lock,
  Cpu,
  Github,
  Twitter,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  ExternalLink,
  CheckCircle,
  Zap,
  Globe
} from 'lucide-react';

interface FooterSection {
  title: string;
  links: {
    label: string;
    href: string;
    external?: boolean;
    icon?: React.ComponentType<any>;
  }[];
}

const footerSections: FooterSection[] = [
  {
    title: 'Ecosystem',
    links: [
      { label: 'Home', href: '/' },
      { label: 'POS System', href: '/pos' },
      { label: 'Delivery App', href: '/delivery' },
      { label: 'Supplier Network', href: '/supplier' },
      { label: 'Marketplace', href: '/marketplace' }
    ]
  },
  {
    title: 'Developers',
    links: [
      { label: 'API Documentation', href: '/docs', icon: ExternalLink },
      { label: 'System Status', href: '/status', icon: CheckCircle },
      { label: 'GitHub', href: 'https://github.com/nilelink', external: true, icon: Github }
    ]
  },
  {
    title: 'Legal & Compliance',
    links: [
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Compliance', href: '/compliance' },
      { label: 'Security', href: '/security' }
    ]
  },
  {
    title: 'Contact',
    links: [
      { label: 'support@nilelink.app', href: 'mailto:support@nilelink.app', icon: Mail },
      { label: '+1 (555) 123-4567', href: 'tel:+15551234567', icon: Phone },
      { label: 'Global Headquarters', href: '#', icon: MapPin }
    ]
  }
];

const trustBadges = [
  {
    icon: Shield,
    label: 'Bank-Grade Security',
    description: 'Enterprise security standards'
  },
  {
    icon: Lock,
    label: 'Blockchain Verified',
    description: 'Immutable transaction ledger'
  },
  {
    icon: Cpu,
    label: 'AI-Powered',
    description: 'Intelligent automation'
  },
  {
    icon: Zap,
    label: 'Lightning Fast',
    description: 'Sub-second processing'
  }
];

const socialLinks = [
  { icon: Twitter, href: 'https://twitter.com/nilelink', label: 'Twitter' },
  { icon: Linkedin, href: 'https://linkedin.com/company/nilelink', label: 'LinkedIn' },
  { icon: Github, href: 'https://github.com/nilelink', label: 'GitHub' }
];

interface GlobalFooterProps {
  variant?: 'default' | 'minimal';
  showTrustBadges?: boolean;
  showNewsletter?: boolean;
}

export default function GlobalFooter({
  variant = 'default',
  showTrustBadges = true,
  showNewsletter = true
}: GlobalFooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-background-primary border-t-2 border-border-subtle">
      {/* Trust Badges Section */}
      {showTrustBadges && (
        <div className="border-b border-border-subtle">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {trustBadges.map((badge, index) => {
                const Icon = badge.icon;
                return (
                  <div
                    key={badge.label}
                    className="flex items-center space-x-3 group"
                  >
                    <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                      <Icon className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <div className="text-text-primary font-medium text-sm">
                        {badge.label}
                      </div>
                      <div className="text-text-tertiary text-xs">
                        {badge.description}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">

          {/* Brand Section */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center space-x-2 group mb-4">
              <div className="w-10 h-10 bg-gradient-accent rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                <span className="text-white font-bold text-sm">NL</span>
              </div>
              <span className="text-text-primary font-bold text-xl tracking-tight">
                NileLink
              </span>
            </Link>
            <p className="text-text-secondary text-sm leading-relaxed mb-6">
              Revolutionizing food delivery through blockchain technology and AI-powered logistics.
              Connecting restaurants, suppliers, and customers in a seamless ecosystem.
            </p>

            {/* Social Links */}
            <div className="flex space-x-4">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 bg-bg-tertiary rounded-lg flex items-center justify-center text-text-secondary hover:text-accent hover:bg-accent/10 transition-colors"
                    aria-label={social.label}
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Footer Sections */}
          {footerSections.map((section, sectionIndex) => (
            <div
              key={section.title}
              className="space-y-4"
            >
              <h3 className="text-text-primary font-semibold text-sm uppercase tracking-wider">
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link) => {
                  const Icon = link.icon;
                  return (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className={`
                          flex items-center space-x-2 text-text-secondary hover:text-accent transition-colors text-sm group
                          ${link.external ? 'hover:underline' : ''}
                        `}
                        {...(link.external && {
                          target: '_blank',
                          rel: 'noopener noreferrer'
                        })}
                      >
                        {Icon && <Icon className="w-3 h-3 group-hover:scale-110 transition-transform" />}
                        <span>{link.label}</span>
                        {link.external && <ExternalLink className="w-3 h-3 opacity-50" />}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter Section */}
        {showNewsletter && (
          <div
            className="mt-12 pt-8 border-t border-border-subtle"
          >
            <div className="max-w-md">
              <h3 className="text-text-primary font-semibold text-lg mb-2">
                Stay Updated
              </h3>
              <p className="text-text-secondary text-sm mb-4">
                Get the latest updates on NileLink's ecosystem development and new features.
              </p>
              <div className="flex space-x-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-2 bg-bg-tertiary border border-border-subtle rounded-lg text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                />
                <button className="px-6 py-2 bg-accent hover:bg-accent-600 text-white rounded-lg transition-colors font-medium">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-border-subtle">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-6 text-text-tertiary text-sm">
              <span>© {currentYear} NileLink. All rights reserved.</span>
              <div className="flex items-center space-x-4">
                <Link href="/privacy" className="hover:text-text-secondary transition-colors">
                  Privacy
                </Link>
                <Link href="/terms" className="hover:text-text-secondary transition-colors">
                  Terms
                </Link>

              </div>
            </div>

            <div className="flex items-center space-x-4 text-text-tertiary text-sm">
              <div className="flex items-center space-x-1">
                <Globe className="w-4 h-4" />
                <span>Global</span>
              </div>
              <div className="flex items-center space-x-1">
                <span>v1.0.0</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
