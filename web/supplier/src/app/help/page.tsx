'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    HelpCircle, MessageCircle, Mail, Phone, BookOpen,
    Video, Search, ChevronRight, ExternalLink, FileText
} from 'lucide-react';

export default function HelpPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');

    const categories = [
        { id: 'all', label: 'All Topics' },
        { id: 'getting-started', label: 'Getting Started' },
        { id: 'products', label: 'Products & Inventory' },
        { id: 'orders', label: 'Orders & Fulfillment' },
        { id: 'payments', label: 'Payments & Billing' },
        { id: 'account', label: 'Account Management' }
    ];

    const faqs = [
        {
            category: 'getting-started',
            question: 'How do I add my first product?',
            answer: 'Go to the Catalog page and click "Add Product". Fill in the product details including name, category, price, and stock quantity.'
        },
        {
            category: 'getting-started',
            question: 'How does the onboarding process work?',
            answer: 'Complete the 7-step onboarding process to set up your supplier account. This includes business information, contact details, address, product categories, payment setup, and verification.'
        },
        {
            category: 'products',
            question: 'How do I manage inventory levels?',
            answer: 'Use the Inventory page to view and update stock levels. You can set minimum and maximum stock thresholds and receive low stock alerts.'
        },
        {
            category: 'products',
            question: 'Can I bulk upload products?',
            answer: 'Yes! Use the bulk upload feature in the Catalog page to import products via CSV file. Download our template for the correct format.'
        },
        {
            category: 'orders',
            question: 'How do I accept or reject orders?',
            answer: 'Go to the Orders page, click on an order to view details, then use the "Accept" or "Reject" buttons. Add a note when rejecting to help the customer.'
        },
        {
            category: 'orders',
            question: 'What happens after I accept an order?',
            answer: 'Once accepted, prepare the items and mark them as shipped. The customer will be notified and can track the delivery.'
        },
        {
            category: 'payments',
            question: 'When do I receive payments?',
            answer: 'Payments are transferred to your bank account 2-3 business days after order delivery confirmation.'
        },
        {
            category: 'payments',
            question: 'What payment methods do you support?',
            answer: 'We support bank transfers and credit/debit cards for receiving payments. Cryptocurrency payments are coming soon.'
        },
        {
            category: 'account',
            question: 'How do I add team members?',
            answer: 'Go to Team Management and click "Invite Member". Enter their email and assign a role (Manager or Staff).'
        },
        {
            category: 'account',
            question: 'How can I change my business information?',
            answer: 'Visit your Profile page to update business details, or go to Settings for more advanced options.'
        }
    ];

    const filteredFAQs = faqs.filter(faq => {
        const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
        const matchesSearch = searchQuery === '' ||
            faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm mb-6">
                        <HelpCircle className="w-4 h-4" />
                        <span>Support Center</span>
                    </div>
                    <h1 className="text-5xl font-bold text-white mb-4">How can we help you?</h1>
                    <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                        Find answers, tutorials, and support resources for the NileLink supplier platform
                    </p>

                    {/* Search */}
                    <div className="max-w-2xl mx-auto mt-8">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search for help..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 bg-slate-900/50 border border-slate-800/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid md:grid-cols-3 gap-6 mb-12">
                    <a
                        href="mailto:support@nilelink.com"
                        className="bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-2xl p-6 hover:bg-slate-900/70 transition group"
                    >
                        <Mail className="w-10 h-10 text-blue-400 mb-4" />
                        <h3 className="text-xl font-semibold text-white mb-2">Email Support</h3>
                        <p className="text-slate-400 mb-3">Get help via email within 24 hours</p>
                        <span className="text-blue-400 group-hover:text-blue-300 flex items-center gap-2">
                            support@nilelink.com
                            <ExternalLink className="w-4 h-4" />
                        </span>
                    </a>

                    <a
                        href="/docs"
                        className="bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-2xl p-6 hover:bg-slate-900/70 transition group"
                    >
                        <BookOpen className="w-10 h-10 text-purple-400 mb-4" />
                        <h3 className="text-xl font-semibold text-white mb-2">Documentation</h3>
                        <p className="text-slate-400 mb-3">Comprehensive guides and API docs</p>
                        <span className="text-purple-400 group-hover:text-purple-300 flex items-center gap-2">
                            Browse Docs
                            <ChevronRight className="w-4 h-4" />
                        </span>
                    </a>

                    <a
                        href="/demo"
                        className="bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-2xl p-6 hover:bg-slate-900/70 transition group"
                    >
                        <Video className="w-10 h-10 text-emerald-400 mb-4" />
                        <h3 className="text-xl font-semibold text-white mb-2">Video Tutorials</h3>
                        <p className="text-slate-400 mb-3">Learn with step-by-step videos</p>
                        <span className="text-emerald-400 group-hover:text-emerald-300 flex items-center gap-2">
                            Watch Demos
                            <ChevronRight className="w-4 h-4" />
                        </span>
                    </a>
                </div>

                {/* FAQ Section */}
                <div>
                    <h2 className="text-3xl font-bold text-white mb-6">Frequently Asked Questions</h2>

                    {/* Category Filter */}
                    <div className="flex flex-wrap gap-2 mb-6">
                        {categories.map((category) => (
                            <button
                                key={category.id}
                                onClick={() => setSelectedCategory(category.id)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${selectedCategory === category.id
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800'
                                    }`}
                            >
                                {category.label}
                            </button>
                        ))}
                    </div>

                    {/* FAQ List */}
                    <div className="space-y-4">
                        {filteredFAQs.length === 0 ? (
                            <div className="text-center py-16">
                                <HelpCircle className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-slate-400 mb-2">No results found</h3>
                                <p className="text-slate-500">Try adjusting your search or category filter</p>
                            </div>
                        ) : (
                            filteredFAQs.map((faq, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-xl p-6"
                                >
                                    <h3 className="text-lg font-semibold text-white mb-3 flex items-start gap-3">
                                        <HelpCircle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                                        <span>{faq.question}</span>
                                    </h3>
                                    <p className="text-slate-400 pl-8">{faq.answer}</p>
                                </motion.div>
                            ))
                        )}
                    </div>
                </div>

                {/* Contact Card */}
                <div className="mt-12 bg-gradient-to-br from-blue-950/20 to-cyan-950/20 border border-blue-500/20 rounded-2xl p-8 text-center">
                    <h2 className="text-2xl font-bold text-white mb-2">Still need help?</h2>
                    <p className="text-slate-400 mb-6">Our support team is here to assist you</p>
                    <div className="flex items-center justify-center gap-4 flex-wrap">
                        <a
                            href="mailto:support@nilelink.com"
                            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
                        >
                            Contact Support
                        </a>
                        <a
                            href="/dashboard"
                            className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition"
                        >
                            Back to Dashboard
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
