"use client";

import React from 'react';
import { Card } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { Input } from '@/components/shared/Input';
import { Save } from 'lucide-react';

export default function SupplierSettingsPage() {
    return (
        <div className="min-h-screen bg-background-light p-6 md:p-12 max-w-4xl mx-auto">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-primary-dark">Supplier Settings</h1>
                <p className="text-text-secondary">Configure your profile, API keys, and notification preferences.</p>
            </header>

            <div className="space-y-6">
                <Card title="Company Profile">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
                        <Input label="Company Name" defaultValue="Green Valley Farms" />
                        <Input label="Tax ID" defaultValue="EG-123456789" />
                        <div className="md:col-span-2">
                            <Input label="Warehouse Address" defaultValue="12 Agriculture Rd, Giza" />
                        </div>
                        <Input label="Contact Person" defaultValue="Mahmoud Ali" />
                        <Input label="Email" type="email" defaultValue="agri@greenvalley.eg" />
                    </div>
                    <div className="p-4 border-t border-black/10 flex justify-end">
                        <Button leftIcon={<Save size={18} />}>Save Changes</Button>
                    </div>
                </Card>

                <Card title="API & Integration">
                    <div className="p-4 space-y-4">
                        <div className="bg-black/5 p-4 rounded-lg">
                            <label className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2 block">Public Key</label>
                            <code className="text-xs font-mono break-all text-primary-dark block bg-white p-2 rounded border border-black/10">
                                0x7d5a3f9c...8e2b
                            </code>
                        </div>
                        <Button variant="outline" size="sm">Rotate Keys</Button>
                    </div>
                </Card>
            </div>
        </div>
    );
}
