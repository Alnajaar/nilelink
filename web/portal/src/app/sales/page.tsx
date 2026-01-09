'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiSend, FiMail, FiUser, FiPhone, FiBriefcase } from 'react-icons/fi';
import { UniversalFooter } from '@shared/components/UniversalFooter';

export default function SalesPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        action: 'Enterprise Demo',
        message: ''
    });
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/contact/sales', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!res.ok) throw new Error('Failed to send request');
            setSubmitted(true);
        } catch (err) {
            setError('Something went wrong. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-primary text-white pt-24 pb-12 px-4 relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-4xl mx-auto relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
                        Partner with NileLink
                    </h1>
                    <p className="text-gray-400 text-lg">
                        Transform your business with our Economic Operating System.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl"
                >
                    {submitted ? (
                        <div className="text-center py-12">
                            <div className="w-20 h-20 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-purple-400 text-4xl">
                                ✓
                            </div>
                            <h2 className="text-2xl font-bold mb-2">Inquiry Received!</h2>
                            <p className="text-gray-400">Our sales team will contact you within 24 hours.</p>
                            <button
                                onClick={() => setSubmitted(false)}
                                className="mt-8 px-8 py-3 bg-white/5 hover:bg-white/10 rounded-full transition-colors"
                            >
                                Send another inquiry
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm text-gray-400 pl-4">Full Name</label>
                                    <div className="relative">
                                        <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                                        <input
                                            type="text"
                                            required
                                            className="w-full bg-primary border border-white/10 rounded-xl px-12 py-4 focus:ring-2 focus:ring-purple-500/50 outline-none transition-all placeholder:text-gray-600"
                                            placeholder="Jane Smith"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm text-gray-400 pl-4">Work Email</label>
                                    <div className="relative">
                                        <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                                        <input
                                            type="email"
                                            required
                                            className="w-full bg-primary border border-white/10 rounded-xl px-12 py-4 focus:ring-2 focus:ring-purple-500/50 outline-none transition-all placeholder:text-gray-600"
                                            placeholder="jane@company.com"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm text-gray-400 pl-4">Phone Number</label>
                                    <div className="relative">
                                        <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                                        <input
                                            type="tel"
                                            className="w-full bg-primary border border-white/10 rounded-xl px-12 py-4 focus:ring-2 focus:ring-purple-500/50 outline-none transition-all placeholder:text-gray-600"
                                            placeholder="+1 (555) 000-0000"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm text-gray-400 pl-4">Interested In</label>
                                    <div className="relative">
                                        <FiBriefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                                        <select
                                            className="w-full bg-primary border border-white/10 rounded-xl px-12 py-4 focus:ring-2 focus:ring-purple-500/50 outline-none transition-all appearance-none text-gray-300"
                                            value={formData.action}
                                            onChange={(e) => setFormData({ ...formData, action: e.target.value })}
                                        >
                                            <option>Enterprise Demo</option>
                                            <option>Partnership</option>
                                            <option>Investor Relations</option>
                                            <option>High-volume API Access</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm text-gray-400 pl-4">Message</label>
                                <textarea
                                    rows={5}
                                    className="w-full bg-primary border border-white/10 rounded-xl p-6 focus:ring-2 focus:ring-purple-500/50 outline-none transition-all placeholder:text-gray-600"
                                    placeholder="Tell us about your business needs..."
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                />
                            </div>

                            {error && <p className="text-red-400 text-center">{error}</p>}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Submitting...' : (
                                    <>
                                        Request Demo <FiSend />
                                    </>
                                )}
                            </button>
                        </form>
                    )}
                </motion.div>
            </div>
            <UniversalFooter />
        </div>
    );
}
