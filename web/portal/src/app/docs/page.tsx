
"use client";

import React from 'react';
import { UniversalNavbar } from '@/shared/components/UniversalNavbar';
import { UniversalFooter } from '@/shared/components/UniversalFooter';
import { Button } from "@/shared/components/Button";
import { Card } from "@/shared/components/Card";

export default function DocsPage() {
    return (
        <div className="min-h-screen flex flex-col bg-background-light">
            <UniversalNavbar />

            <main className="flex-1">
                <div className="max-w-4xl mx-auto px-8 py-16">
                    <div className="text-center mb-16">
                        <h1 className="text-4xl font-bold text-primary-dark mb-4">NileLink Protocol Documentation</h1>
                        <p className="text-lg text-text-secondary">Complete technical documentation for the decentralized daily economy protocol</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-background-white p-8 rounded-lg border border-border-light">
                            <h2 className="text-2xl font-bold text-primary-dark mb-4">Getting Started</h2>
                            <p className="text-text-secondary mb-6">Learn how to integrate with the NileLink Protocol and start building decentralized commerce applications.</p>
                            <ul className="space-y-2 text-text-secondary">
                                <li>• Protocol Overview</li>
                                <li>• API Reference</li>
                                <li>• SDK Installation</li>
                                <li>• Quick Start Guide</li>
                            </ul>
                        </div>

                        <div className="bg-background-white p-8 rounded-lg border border-border-light">
                            <h2 className="text-2xl font-bold text-primary-dark mb-4">Core Concepts</h2>
                            <p className="text-text-secondary mb-6">Understand the fundamental concepts behind the NileLink decentralized economic operating system.</p>
                            <ul className="space-y-2 text-text-secondary">
                                <li>• Offline-First Architecture</li>
                                <li>• Edge Synchronization</li>
                                <li>• Ledger-Based Settlement</li>
                                <li>• Multi-Stakeholder Economics</li>
                            </ul>
                        </div>

                        <div className="bg-background-white p-8 rounded-lg border border-border-light">
                            <h2 className="text-2xl font-bold text-primary-dark mb-4">Integration Guides</h2>
                            <p className="text-text-secondary mb-6">Step-by-step guides for integrating different components of the NileLink ecosystem.</p>
                            <ul className="space-y-2 text-text-secondary">
                                <li>• POS Terminal Integration</li>
                                <li>• Delivery Network API</li>
                                <li>• Customer App SDK</li>
                                <li>• Supplier Hub Connection</li>
                            </ul>
                        </div>

                        <div className="bg-background-white p-8 rounded-lg border border-border-light">
                            <h2 className="text-2xl font-bold text-primary-dark mb-4">Technical Reference</h2>
                            <p className="text-text-secondary mb-6">Detailed technical specifications and reference materials for developers.</p>
                            <ul className="space-y-2 text-text-secondary">
                                <li>• Smart Contract Interfaces</li>
                                <li>• State Machine Diagrams</li>
                                <li>• Security Specifications</li>
                                <li>• Performance Benchmarks</li>
                            </ul>
                        </div>
                    </div>

                    <div className="mt-16 text-center">
                        <div className="bg-primary-dark text-background-light p-8 rounded-lg">
                            <h3 className="text-2xl font-bold mb-4">Protocol Version 1.0</h3>
                            <p className="text-background-light opacity-90 mb-6">The NileLink Protocol is now live and operational. All smart contracts have been deployed and verified on Polygon mainnet.</p>
                            <div className="flex justify-center gap-4">
                                <span className="bg-success-default text-background-light px-4 py-2 rounded-lg text-sm font-medium">Status: Live</span>
                                <span className="bg-background-light text-primary-dark px-4 py-2 rounded-lg text-sm font-medium">Network: Polygon</span>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <UniversalFooter />
        </div>
    );
}