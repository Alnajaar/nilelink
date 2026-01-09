"use client";

import React from 'react';
import { Zap, Github, Twitter, Linkedin, Mail, MapPin, Phone, ArrowUpRight, Heart } from 'lucide-react';
import Link from 'next/link';

export function UniversalFooter() {
    return (
        <footer className="bg-accent-dark text-background-light">
            {/* Main Footer Content */}
            <div className="py-16">
                <div className="max-w-7xl mx-auto px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                        {/* Company Info */}
                        <div className="lg:col-span-2">
                            <div className="flex items-center gap-2 mb-6">
                                <Zap className="w-8 h-8 text-secondary-soft" />
                                <span className="text-2xl font-black">NileLink</span>
                            </div>
                            <p className="text-background-light/80 mb-6 max-w-md leading-relaxed">
                                Revolutionizing food delivery through blockchain technology. Connecting restaurants,
                                delivery drivers, and customers with secure, transparent, and efficient transactions
                                powered by smart contracts.
                            </p>
                            <div className="flex gap-4">
                                <a href="https://github.com/nilelink" className="w-10 h-10 bg-background-light/10 rounded-lg flex items-center justify-center hover:bg-secondary-soft hover:text-background transition-colors">
                                    <Github size={20} />
                                </a>
                                <a href="https://twitter.com/nilelink" className="w-10 h-10 bg-background-light/10 rounded-lg flex items-center justify-center hover:bg-secondary-soft hover:text-background transition-colors">
                                    <Twitter size={20} />
                                </a>
                                <a href="https://linkedin.com/company/nilelink" className="w-10 h-10 bg-background-light/10 rounded-lg flex items-center justify-center hover:bg-secondary-soft hover:text-background transition-colors">
                                    <Linkedin size={20} />
                                </a>
                            </div>
                        </div>

                        {/* Platform */}
                        <div>
                            <h4 className="font-bold text-background-light mb-6">Platform</h4>
                            <div className="space-y-3">
                                <Link href="/dashboard" className="block text-background-light/80 hover:text-secondary-soft transition-colors">Dashboard</Link>
                                <Link href="/governance" className="block text-background-light/80 hover:text-secondary-soft transition-colors">Governance</Link>
                                <Link href="/transparency" className="block text-background-light/80 hover:text-secondary-soft transition-colors">Transparency</Link>
                                <Link href="/status" className="block text-background-light/80 hover:text-secondary-soft transition-colors">System Status</Link>
                                <Link href="/vote" className="block text-background-light/80 hover:text-secondary-soft transition-colors">Vote</Link>
                            </div>
                        </div>

                        {/* Company */}
                        <div>
                            <h4 className="font-bold text-background-light mb-6">Company</h4>
                            <div className="space-y-3">
                                <Link href="/docs" className="block text-background-light/80 hover:text-secondary-soft transition-colors">Documentation</Link>
                                <Link href="/pricing" className="block text-background-light/80 hover:text-secondary-soft transition-colors">Pricing</Link>
                                <Link href="/privacy" className="block text-background-light/80 hover:text-secondary-soft transition-colors">Privacy Policy</Link>
                                <Link href="/terms" className="block text-background-light/80 hover:text-secondary-soft transition-colors">Terms of Service</Link>
                                <Link href="/demo" className="block text-background-light/80 hover:text-secondary-soft transition-colors">Demo</Link>
                            </div>
                        </div>
                    </div>

                    {/* Contact Info */}
                    <div className="mt-12 pt-8 border-t border-background-light/10">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="flex items-center gap-3">
                                <Mail className="w-5 h-5 text-secondary-soft" />
                                <div>
                                    <p className="text-sm text-background-light/60">Email</p>
                                    <a href="mailto:hello@nilelink.app" className="text-background-light hover:text-secondary-soft transition-colors">
                                        hello@nilelink.app
                                    </a>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <MapPin className="w-5 h-5 text-secondary-soft" />
                                <div>
                                    <p className="text-sm text-background-light/60">Location</p>
                                    <span className="text-background-light">Dubai, UAE</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 bg-success-default rounded-full animate-pulse"></div>
                                <div>
                                    <p className="text-sm text-background-light/60">Status</p>
                                    <span className="text-background-light font-medium">All Systems Operational</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-background-light/10 py-6">
                <div className="max-w-7xl mx-auto px-8">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-4 text-sm text-background-light/60">
                            <span>© 2024 NileLink. All rights reserved.</span>
                            <span className="hidden md:block">•</span>
                            <span>Protocol v1.0.0</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-background-light/60">
                            <span>Made with</span>
                            <Heart className="w-4 h-4 text-red-500 fill-current" />
                            <span>in Dubai</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
