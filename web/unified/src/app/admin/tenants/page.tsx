"use client";

import React, { useState } from 'react';
import { Card } from '@/shared/components/Card';
import { Button } from '@/shared/components/Button';
import { Badge } from '@/shared/components/Badge';
import { PermissionGuard, PERMISSIONS } from '@/shared/components/PermissionGuard';
import useSWR from 'swr';

export default function TenantsPage() {
    const { data: tenants, error, isLoading } = useSWR('/api/admin/tenants');

    return (
        <PermissionGuard permissions={PERMISSIONS.TENANTS_MANAGE} fallback={
            <div className="p-8 text-center">
                <h1 className="text-2xl font-bold text-red-500">Access Denied</h1>
                <p className="text-primary-dark/60 mt-2">You do not have permission to manage tenants.</p>
            </div>
        }>
            <div className="p-8 max-w-7xl mx-auto">
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight text-primary-dark">Tenants</h1>
                        <p className="text-primary-dark/60 mt-2">Ecosystem discovery and business management.</p>
                    </div>
                    <Button variant="primary">Add New Business</Button>
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => <div key={i} className="h-48 rounded-2xl bg-black/5 animate-pulse" />)}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {tenants?.map((tenant: any) => (
                            <Card key={tenant.id} className="group hover:border-blue-500/50 transition-all">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-xl font-bold text-primary-dark">{tenant.name}</h3>
                                        <p className="text-sm text-primary-dark/50">{tenant.subdomain}.nilelink.app</p>
                                    </div>
                                    <Badge variant={tenant.status === 'active' ? 'success' : 'neutral'}>
                                        {tenant.status}
                                    </Badge>
                                </div>

                                <div className="space-y-3 mt-6">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-primary-dark/50">Plan</span>
                                        <span className="font-semibold">{tenant.plan}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-primary-dark/50">Members</span>
                                        <span className="font-semibold">{tenant._count?.users || 0}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-primary-dark/50">Trial Ends</span>
                                        <span className="font-semibold">
                                            {tenant.trialEndsAt ? new Date(tenant.trialEndsAt).toLocaleDateString() : 'N/A'}
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-8 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button variant="ghost" size="sm" className="w-full">Dashboard</Button>
                                    <Button variant="secondary" size="sm" className="w-full">Settings</Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </PermissionGuard>
    );
}
