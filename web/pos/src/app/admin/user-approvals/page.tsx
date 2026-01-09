"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    CheckCircle,
    XCircle,
    Clock,
    User,
    Building,
    Mail,
    Phone,
    CreditCard,
    Eye,
    AlertCircle,
    Shield,
    ArrowLeft,
    RefreshCw,
    AlertTriangle
} from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { Card } from '@/shared/components/Card';
import { Badge } from '@/shared/components/Badge';
import { useAuth } from '@shared/contexts/AuthContext';
import { api } from '@/shared/utils/api';
import { toast } from '@/shared/components/Toast';

interface PendingUser {
    id: string;
    email?: string;
    phone?: string;
    firstName?: string;
    lastName?: string;
    businessName?: string;
    selectedPlan?: string;
    status: 'pending_verification' | 'pending_approval' | 'approved' | 'rejected' | 'suspended';
    registeredAt: string;
    verified: {
        email: boolean;
        phone: boolean;
        wallet: boolean;
    };
    tenant?: {
        id: string;
        name: string;
        subdomain: string;
    };
}

export default function UserApprovalsPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingUser, setProcessingUser] = useState<string | null>(null);
    const [selectedUser, setSelectedUser] = useState<PendingUser | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [error, setError] = useState<string | null>(null);

    const loadPendingUsers = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await api.get('/admin/users/pending') as any;
            if (response.success && response.data.users) {
                setPendingUsers(response.data.users);
            } else {
                setError('Failed to load pending users');
                toast.error('Failed to load pending users');
            }
        } catch (error: any) {
            console.error('Error loading pending users:', error);
            setError(error.message || 'Failed to load pending users');
            toast.error('Failed to load pending users');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Check if user is super admin (simplified - in real app check user.role === 'SUPER_ADMIN')
        const isSuperAdmin = user?.role === 'SUPER_ADMIN' || user?.email?.endsWith('@nilelink.admin');

        if (!isSuperAdmin) {
            router.push('/admin');
            return;
        }

        loadPendingUsers();
    }, [router, user]);

    const handleApprove = async (userId: string) => {
        setProcessingUser(userId);
        try {
            const userToApprove = pendingUsers.find(u => u.id === userId);
            const response = await api.post(`/admin/users/${userId}/approve`, {
                notes: `Approved via admin panel by ${user?.email}. ${userToApprove?.tenant ? `Tenant: ${userToApprove.tenant.name}` : ''}`
            }) as any;

            if (response.success) {
                setPendingUsers((prev: PendingUser[]) => prev.filter((u: PendingUser) => u.id !== userId));
                setSelectedUser(null);
                toast.success(`${userToApprove?.businessName || userToApprove?.firstName || 'User'} approved successfully`);
            } else {
                toast.error(response.error || 'Failed to approve user');
            }
        } catch (error: any) {
            console.error('Error approving user:', error);
            toast.error('Failed to approve user');
        } finally {
            setProcessingUser(null);
        }
    };

    const handleReject = async () => {
        if (!selectedUser || !rejectionReason.trim()) return;

        setProcessingUser(selectedUser.id);
        try {
            const response = await api.post(`/admin/users/${selectedUser.id}/reject`, {
                reason: rejectionReason,
                notes: `Rejected via admin panel by ${user?.email}. ${selectedUser?.tenant ? `Tenant: ${selectedUser.tenant.name}` : ''}`
            }) as any;

            if (response.success) {
                setPendingUsers((prev: PendingUser[]) => prev.filter((u: PendingUser) => u.id !== selectedUser.id));
                setSelectedUser(null);
                setRejectionReason('');
                toast.success(`${selectedUser.businessName || selectedUser.firstName || 'User'} rejected successfully`);
            } else {
                toast.error(response.error || 'Failed to reject user');
            }
        } catch (error: any) {
            console.error('Error rejecting user:', error);
            toast.error('Failed to reject user');
        } finally {
            setProcessingUser(null);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending_verification': return <Clock className="w-4 h-4 text-yellow-500" />;
            case 'pending_approval': return <AlertCircle className="w-4 h-4 text-blue-500" />;
            case 'approved': return <CheckCircle className="w-4 h-4 text-green-500" />;
            case 'rejected': return <XCircle className="w-4 h-4 text-red-500" />;
            default: return <Clock className="w-4 h-4 text-gray-500" />;
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending_verification': return <Badge variant="warning">Pending Verification</Badge>;
            case 'pending_approval': return <Badge variant="info">Pending Approval</Badge>;
            case 'approved': return <Badge variant="success">Approved</Badge>;
            case 'rejected': return <Badge variant="error">Rejected</Badge>;
            default: return <Badge variant="neutral">{status}</Badge>;
        }
    };

    // Check if user is super admin
    const isSuperAdmin = user?.role === 'SUPER_ADMIN' || user?.email?.endsWith('@nilelink.admin');

    if (!isSuperAdmin) {
        return (
            <div className="p-8 text-center">
                <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h2 className="text-2xl font-black text-text-main mb-2">Access Denied</h2>
                <p className="text-text-muted">Super admin access required</p>
                <p className="text-sm text-text-subtle mt-2">Your current role: {user?.role || 'Unknown'}</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="p-8 text-center">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-text-muted">Loading pending approvals...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 text-center">
                <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h2 className="text-2xl font-black text-text-main mb-2">Error Loading Data</h2>
                <p className="text-text-muted mb-4">{error}</p>
                <Button onClick={loadPendingUsers} className="gap-2">
                    <RefreshCw size={16} />
                    Try Again
                </Button>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/admin" className="p-2 hover:bg-background-subtle rounded-lg transition-colors">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-4xl font-black text-text-main mb-2">User Approvals</h1>
                        <p className="text-text-muted font-medium text-lg">Review and approve new user registrations</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        onClick={loadPendingUsers}
                        disabled={loading}
                        className="gap-2"
                    >
                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                        Refresh
                    </Button>
                    <Badge variant="success" className="px-4 py-2 text-lg">
                        <Shield size={16} className="mr-2" />
                        Super Admin
                    </Badge>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="p-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-yellow-100 rounded-xl">
                            <Clock className="w-6 h-6 text-yellow-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-black text-text-main">{pendingUsers.length}</p>
                            <p className="text-sm text-text-muted">Pending Approvals</p>
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 rounded-xl">
                            <User className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-black text-text-main">
                                {pendingUsers.filter((u: PendingUser) => u.verified.email || u.verified.phone).length}
                            </p>
                            <p className="text-sm text-text-muted">Verified</p>
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-100 rounded-xl">
                            <Building className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-black text-text-main">
                                {pendingUsers.filter((u: PendingUser) => u.businessName).length}
                            </p>
                            <p className="text-sm text-text-muted">Businesses</p>
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-100 rounded-xl">
                            <CreditCard className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-black text-text-main">
                                {pendingUsers.filter((u: PendingUser) => u.selectedPlan).length}
                            </p>
                            <p className="text-sm text-text-muted">Selected Plans</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Pending Users List */}
            <Card className="p-8">
                <h2 className="text-2xl font-black text-text-main mb-6">Pending Approvals</h2>

                {pendingUsers.length === 0 ? (
                    <div className="text-center py-12">
                        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                        <h3 className="text-xl font-black text-text-main mb-2">All Caught Up!</h3>
                        <p className="text-text-muted">No pending user approvals at this time.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {pendingUsers.map((pendingUser: PendingUser) => (
                            <div key={pendingUser.id} className="border border-border-subtle rounded-2xl p-6 hover:bg-background-subtle transition-colors">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-primary/10 rounded-xl">
                                            <User className="w-6 h-6 text-primary" />
                                        </div>

                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-lg font-black text-text-main">
                                                    {pendingUser.businessName || `${pendingUser.firstName} ${pendingUser.lastName}`}
                                                </h3>
                                                {getStatusBadge(pendingUser.status)}
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                {pendingUser.email && (
                                                    <div className="flex items-center gap-2 text-sm text-text-muted">
                                                        <Mail size={16} />
                                                        {pendingUser.email}
                                                        {pendingUser.verified.email && <CheckCircle size={14} className="text-green-500" />}
                                                    </div>
                                                )}

                                                {pendingUser.phone && (
                                                    <div className="flex items-center gap-2 text-sm text-text-muted">
                                                        <Phone size={16} />
                                                        {pendingUser.phone}
                                                        {pendingUser.verified.phone && <CheckCircle size={14} className="text-green-500" />}
                                                    </div>
                                                )}

                                                {pendingUser.selectedPlan && (
                                                    <div className="flex items-center gap-2 text-sm text-text-muted">
                                                        <CreditCard size={16} />
                                                        Plan: {pendingUser.selectedPlan}
                                                    </div>
                                                )}

                                                <div className="flex items-center gap-2 text-sm text-text-muted">
                                                    <Clock size={16} />
                                                    Registered: {new Date(pendingUser.registeredAt).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setSelectedUser(pendingUser)}
                                            className="gap-2"
                                        >
                                            <Eye size={16} />
                                            Review
                                        </Button>

                                        <Button
                                            size="sm"
                                            onClick={() => handleApprove(pendingUser.id)}
                                            isLoading={processingUser === pendingUser.id}
                                            className="gap-2"
                                        >
                                            <CheckCircle size={16} />
                                            Approve
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Card>

            {/* User Review Modal */}
            {selectedUser && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-2xl p-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-black text-text-main">Review User Application</h2>
                            <button
                                onClick={() => setSelectedUser(null)}
                                className="p-2 hover:bg-background-subtle rounded-lg transition-colors"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="font-black text-text-main mb-3">User Information</h3>
                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-xs font-black uppercase tracking-widest text-text-subtle">Name</p>
                                            <p className="font-medium">{selectedUser.businessName || `${selectedUser.firstName} ${selectedUser.lastName}`}</p>
                                        </div>

                                        {selectedUser.email && (
                                            <div>
                                                <p className="text-xs font-black uppercase tracking-widest text-text-subtle">Email</p>
                                                <div className="flex items-center gap-2">
                                                    <p className="font-medium">{selectedUser.email}</p>
                                                    {selectedUser.verified.email && <CheckCircle size={14} className="text-green-500" />}
                                                </div>
                                            </div>
                                        )}

                                        {selectedUser.phone && (
                                            <div>
                                                <p className="text-xs font-black uppercase tracking-widest text-text-subtle">Phone</p>
                                                <div className="flex items-center gap-2">
                                                    <p className="font-medium">{selectedUser.phone}</p>
                                                    {selectedUser.verified.phone && <CheckCircle size={14} className="text-green-500" />}
                                                </div>
                                            </div>
                                        )}

                                        <div>
                                            <p className="text-xs font-black uppercase tracking-widest text-text-subtle">Plan</p>
                                            <p className="font-medium">{selectedUser.selectedPlan || 'Not specified'}</p>
                                        </div>

                                        <div>
                                            <p className="text-xs font-black uppercase tracking-widest text-text-subtle">Registered</p>
                                            <p className="font-medium">{new Date(selectedUser.registeredAt).toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="font-black text-text-main mb-3">Verification Status</h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-3 h-3 rounded-full ${selectedUser.verified.email ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                            <span className="text-sm font-medium">Email {selectedUser.verified.email ? 'Verified' : 'Not Verified'}</span>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <div className={`w-3 h-3 rounded-full ${selectedUser.verified.phone ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                            <span className="text-sm font-medium">Phone {selectedUser.verified.phone ? 'Verified' : 'Not Verified'}</span>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <div className={`w-3 h-3 rounded-full ${selectedUser.verified.wallet ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                            <span className="text-sm font-medium">Wallet {selectedUser.verified.wallet ? 'Connected' : 'Not Connected'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Rejection Reason Input */}
                            <div>
                                <h3 className="font-black text-text-main mb-3">Rejection Reason (Optional)</h3>
                                <textarea
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    placeholder="Provide a reason for rejection..."
                                    className="w-full h-24 p-4 bg-background-subtle border border-border-subtle rounded-2xl text-text-main font-medium placeholder:text-text-subtle/50 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all resize-none"
                                />
                            </div>

                            <div className="flex gap-4 pt-6">
                                <Button
                                    variant="outline"
                                    onClick={() => setSelectedUser(null)}
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>

                                <Button
                                    variant="danger"
                                    onClick={handleReject}
                                    isLoading={processingUser === selectedUser.id}
                                    disabled={!rejectionReason.trim()}
                                    className="flex-1 gap-2"
                                >
                                    <XCircle size={16} />
                                    Reject User
                                </Button>

                                <Button
                                    onClick={() => handleApprove(selectedUser.id)}
                                    isLoading={processingUser === selectedUser.id}
                                    className="flex-1 gap-2"
                                >
                                    <CheckCircle size={16} />
                                    Approve User
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}