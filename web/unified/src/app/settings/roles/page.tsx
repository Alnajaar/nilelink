"use client";

import React, { useState } from 'react';
import { Card } from '@/shared/components/Card';
import { Button } from '@/shared/components/Button';
import { Badge } from '@/shared/components/Badge';
import { PermissionGuard, PERMISSIONS } from '@/shared/components/PermissionGuard';
import useSWR from 'swr';

export default function RolesPage() {
    const { data: roles, error, isLoading } = useSWR('/api/roles');

    return (
        <PermissionGuard permissions={PERMISSIONS.SETTINGS_EDIT} fallback={
            <div className="p-8 text-center">
                <h1 className="text-2xl font-bold text-red-500">Access Denied</h1>
                <p className="text-primary-dark/60 mt-2">You do not have permission to manage roles.</p>
            </div>
        }>
            <div className="p-8 max-w-7xl mx-auto">
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight text-primary-dark">Roles & Permissions</h1>
                        <p className="text-primary-dark/60 mt-2">Define what your staff can and cannot do.</p>
                    </div>
                    <Button variant="primary">Create Custom Role</Button>
                </div>

                {isLoading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => <div key={i} className="h-20 rounded-xl bg-black/5 animate-pulse" />)}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {roles?.map((role: any) => (
                            <Card key={role.id} className="p-0 overflow-hidden">
                                <div className="flex items-center justify-between p-6 bg-white">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 rounded-xl bg-primary-dark text-white">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" />
                                                <path d="M12 16V12" /><path d="M12 8H12.01" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-primary-dark uppercase tracking-wider">{role.name}</h3>
                                            <p className="text-sm text-primary-dark/40">{role.permissions?.length || 0} permissions assigned</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="ghost" size="sm">Edit Permissions</Button>
                                        <Button variant="secondary" size="sm">View Staff</Button>
                                    </div>
                                </div>

                                <div className="px-6 pb-6 pt-0 flex flex-wrap gap-2">
                                    {role.permissions?.slice(0, 8).map((perm: string) => (
                                        <span key={perm} className="px-2 py-1 bg-black/5 rounded text-[10px] font-mono text-primary-dark/60">
                                            {perm}
                                        </span>
                                    ))}
                                    {role.permissions?.length > 8 && (
                                        <span className="text-[10px] text-primary-dark/30 flex items-center">
                                            + {role.permissions.length - 8} more
                                        </span>
                                    )}
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </PermissionGuard>
    );
}
