import React from 'react';
import { URLS } from '@/shared/utils/urls';

export const UniversalFooter: React.FC = () => {
    return (
        <footer className="bg-background border-t border-border-subtle py-16">
            <div className="container-nilelink text-center md:text-left">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-16">
                    <div>
                        <h3 className="font-bold text-text-main mb-6 uppercase tracking-wider text-xs">Infrastructure</h3>
                        <ul className="space-y-3 text-sm text-text-muted">
                            <li><a href={URLS.pos} className="hover:text-primary transition-colors">POS Terminal</a></li>
                            <li><a href={URLS.delivery} className="hover:text-primary transition-colors">Logistics Fleet</a></li>
                            <li><a href={URLS.customer} className="hover:text-primary transition-colors">Marketplace</a></li>
                            <li><a href={URLS.supplier} className="hover:text-primary transition-colors">Supplier Core</a></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-bold text-text-main mb-6 uppercase tracking-wider text-xs">Governance</h3>
                        <ul className="space-y-3 text-sm text-text-muted">
                            <li><a href={URLS.dashboard} className="hover:text-primary transition-colors">Treasury</a></li>
                            <li><a href={`${URLS.portal}/transparency`} className="hover:text-primary transition-colors">Transparency</a></li>
                            <li><a href={`${URLS.portal}/vote`} className="hover:text-primary transition-colors">Voting</a></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-bold text-text-main mb-6 uppercase tracking-wider text-xs">Developers</h3>
                        <ul className="space-y-3 text-sm text-text-muted">
                            <li><a href={URLS.docs} className="hover:text-primary transition-colors">Documentation</a></li>
                            <li><a href={`${URLS.portal}/status`} className="hover:text-primary transition-colors">Network Status</a></li>
                            <li><a href="https://github.com/nilelink" className="hover:text-primary transition-colors">GitHub</a></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-bold text-text-main mb-6 uppercase tracking-wider text-xs">Legal</h3>
                        <ul className="space-y-3 text-sm text-text-muted">
                            <li><a href="/legal/privacy" className="hover:text-primary transition-colors">Privacy Policy</a></li>
                            <li><a href="/legal/terms" className="hover:text-primary transition-colors">Terms of Service</a></li>
                        </ul>
                    </div>
                </div>
                <div className="border-t border-border-subtle pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-xs text-text-subtle font-mono">
                        © {new Date().getFullYear()} NileLink Protocol Foundation. All rights reserved.
                    </p>
                    <div className="flex items-center gap-6">
                        <span className="text-xs text-text-subtle font-mono border border-border px-2 py-1 rounded">v1.0.0-rc.1</span>
                        <div className="flex items-center gap-2 text-xs font-bold text-success uppercase tracking-widest">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
                            </span>
                            All Systems Normal
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};
