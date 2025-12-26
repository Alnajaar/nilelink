import React from 'react';
import { URLS } from '../utils/urls';

export const UniversalFooter: React.FC = () => {
    return (
        <footer className="bg-background-light border-t border-black/5 py-12">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    <div>
                        <h3 className="font-semibold text-primary-dark mb-4">Ecosystem</h3>
                        <ul className="space-y-2 text-sm text-primary-dark/70">
                            <li><a href={URLS.pos} className="hover:text-primary-dark transition-colors">POS System</a></li>
                            <li><a href={URLS.delivery} className="hover:text-primary-dark transition-colors">Delivery Network</a></li>
                            <li><a href={URLS.customer} className="hover:text-primary-dark transition-colors">Marketplace</a></li>
                            <li><a href={URLS.supplier} className="hover:text-primary-dark transition-colors">Supplier Hub</a></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-semibold text-primary-dark mb-4">Protocol</h3>
                        <ul className="space-y-2 text-sm text-primary-dark/70">
                            <li><a href={URLS.dashboard} className="hover:text-primary-dark transition-colors">Investor Dashboard</a></li>
                            <li><a href={`${URLS.portal}/governance`} className="hover:text-primary-dark transition-colors">Governance</a></li>
                            <li><a href={`${URLS.portal}/tokenomics`} className="hover:text-primary-dark transition-colors">Tokenomics</a></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-semibold text-primary-dark mb-4">Resources</h3>
                        <ul className="space-y-2 text-sm text-primary-dark/70">
                            <li><a href={URLS.docs} className="hover:text-primary-dark transition-colors">Documentation</a></li>
                            <li><a href={`${URLS.portal}/status`} className="hover:text-primary-dark transition-colors">System Status</a></li>
                            <li><a href="/support" className="hover:text-primary-dark transition-colors">Support</a></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-semibold text-primary-dark mb-4">Legal</h3>
                        <ul className="space-y-2 text-sm text-primary-dark/70">
                            <li><a href="/privacy" className="hover:text-primary-dark transition-colors">Privacy Policy</a></li>
                            <li><a href="/terms" className="hover:text-primary-dark transition-colors">Terms of Service</a></li>
                        </ul>
                    </div>
                </div>
                <div className="border-t border-black/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-xs text-primary-dark/40">
                        © {new Date().getFullYear()} NileLink Protocol. All rights reserved.
                    </p>
                    <div className="flex items-center gap-4">
                        <span className="text-xs text-primary-dark/40 font-mono">v1.0.0-beta</span>
                        <span className="flex items-center gap-1.5 text-xs text-primary-dark/40">
                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                            Systems Normal
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    );
};
