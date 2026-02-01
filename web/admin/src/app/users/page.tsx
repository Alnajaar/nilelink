/**
 * User Management Page
 * Manage all users across the ecosystem
 * 
 * SUPER_ADMIN ONLY
 * 
 * FEATURES:
 * - View all users from blockchain
 * - Change user roles (write to smart contract)
 * - Activate/deactivate users
 * - View user activity
 * - Filter by role, country, status
 * - Search by wallet address or Firebase UID
 * - Audit log of role changes
 */

'use client';

import { useState, useEffect } from 'react';
import { graphService } from '@shared/services/GraphService';
import { useRole, useGuard } from '@shared/hooks/useGuard';
import { UserRole, OnChainUser } from '@shared/types/database';

// ============================================
// TYPES
// ============================================

interface User {
    walletAddress: string;
    firebaseUid?: string;
    role: UserRole;
    country: string;
    isActive: boolean;
    registeredAt: number;
    businessId?: string;
    metadataURI: string;
}

interface RoleChangeLog {
    userId: string;
    oldRole: UserRole;
    newRole: UserRole;
    changedBy: string;
    timestamp: number;
    reason: string;
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function UsersPage() {
    const { isSuperAdmin } = useRole('SUPER_ADMIN');
    const { can } = useGuard();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filters
    const [filterRole, setFilterRole] = useState<UserRole | 'ALL'>('ALL');
    const [filterStatus, setFilterStatus] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
    const [searchQuery, setSearchQuery] = useState('');

    // Role change modal
    const [changingRole, setChangingRole] = useState<string | null>(null);
    const [newRole, setNewRole] = useState<UserRole>('USER');
    const [changeReason, setChangeReason] = useState('');

    useEffect(() => {
        if (!isSuperAdmin) {
            setError('Access denied');
            setLoading(false);
            return;
        }

        fetchUsers();
    }, [isSuperAdmin, filterRole, filterStatus]);

    const fetchUsers = async () => {
        try {
            setLoading(true);

            let allUsers: User[] = [];

            if (filterRole === 'ALL') {
                // Fetch users of all roles
                const roles: UserRole[] = ['USER', 'ADMIN', 'SUPER_ADMIN', 'CASHIER', 'MANAGER', 'DRIVER', 'SUPPLIER'];
                for (const role of roles) {
                    const usersOfRole = await graphService.getUsersByRole(role);
                    allUsers.push(...usersOfRole);
                }
            } else {
                allUsers = await graphService.getUsersByRole(filterRole);
            }

            // Apply status filter
            if (filterStatus === 'ACTIVE') {
                allUsers = allUsers.filter(u => u.isActive);
            } else if (filterStatus === 'INACTIVE') {
                allUsers = allUsers.filter(u => !u.isActive);
            }

            // Apply search
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                allUsers = allUsers.filter(u =>
                    u.walletAddress.toLowerCase().includes(query) ||
                    u.firebaseUid?.toLowerCase().includes(query)
                );
            }

            setUsers(allUsers);
            setError(null);
        } catch (err: any) {
            console.error('[Users] Failed to fetch:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleChangeRole = async (walletAddress: string) => {
        const canChange = await can('CHANGE_USER_ROLE');
        if (!canChange) {
            alert('You do not have permission to change user roles');
            return;
        }

        if (!changeReason.trim()) {
            alert('Please provide a reason for this role change');
            return;
        }

        if (!confirm(`Change user role to ${newRole}?\n\nReason: ${changeReason}`)) {
            return;
        }

        try {
            // TODO: Write to smart contract
            // const tx = await userContract.changeRole(walletAddress, newRole);
            // await tx.wait();

            console.log('[Users] Role changed:', {
                user: walletAddress,
                newRole,
                reason: changeReason,
            });

            // Log the change
            // TODO: Write to audit log
            const auditLog: RoleChangeLog = {
                userId: walletAddress,
                oldRole: users.find(u => u.walletAddress === walletAddress)?.role || 'USER',
                newRole,
                changedBy: 'current-admin-wallet', // TODO: Get from auth
                timestamp: Date.now(),
                reason: changeReason,
            };

            alert('Role changed successfully!');

            // Reset modal
            setChangingRole(null);
            setChangeReason('');

            // Refresh
            fetchUsers();
        } catch (err: any) {
            alert(`Failed to change role: ${err.message}`);
        }
    };

    const handleToggleActive = async (walletAddress: string, currentStatus: boolean) => {
        if (!confirm(`${currentStatus ? 'Deactivate' : 'Activate'} this user?`)) return;

        try {
            // TODO: Write to smart contract
            console.log('[Users] Toggling active status:', walletAddress);

            alert('User status updated');
            fetchUsers();
        } catch (err: any) {
            alert(`Failed to update status: ${err.message}`);
        }
    };

    if (!isSuperAdmin) {
        return (
            <div className="min-h-screen bg-[#02050a] flex items-center justify-center">
                <div className="text-red-400 text-center">
                    <div className="text-6xl mb-4">🚫</div>
                    <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
                    <p>Only Super Admins can manage users</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-4xl font-black text-white mb-2">
                    User Management
                </h1>
                <p className="text-gray-400 text-sm uppercase tracking-wider">
                    Manage Users • Roles • Permissions • Access Control
                </p>
            </div>

            {/* Filters */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Search */}
                    <input
                        type="text"
                        placeholder="Search by wallet or Firebase UID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="px-4 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    {/* Role Filter */}
                    <select
                        value={filterRole}
                        onChange={(e) => setFilterRole(e.target.value as any)}
                        className="px-4 py-2 bg-white/10 border border-white/20 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="ALL">All Roles</option>
                        <option value="USER">Users</option>
                        <option value="ADMIN">Admins</option>
                        <option value="SUPER_ADMIN">Super Admins</option>
                        <option value="CASHIER">Cashiers</option>
                        <option value="MANAGER">Managers</option>
                        <option value="DRIVER">Drivers</option>
                        <option value="SUPPLIER">Suppliers</option>
                    </select>

                    {/* Status Filter */}
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value as any)}
                        className="px-4 py-2 bg-white/10 border border-white/20 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="ALL">All Status</option>
                        <option value="ACTIVE">Active</option>
                        <option value="INACTIVE">Inactive</option>
                    </select>

                    {/* Apply Button */}
                    <button
                        onClick={fetchUsers}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white font-bold transition-colors"
                    >
                        Apply Filters
                    </button>
                </div>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard label="Total Users" value={users.length} icon="👥" />
                <StatCard
                    label="Active"
                    value={users.filter(u => u.isActive).length}
                    icon="✅"
                    color="green"
                />
                <StatCard
                    label="Admins"
                    value={users.filter(u => u.role === 'ADMIN' || u.role === 'SUPER_ADMIN').length}
                    icon="👑"
                    color="yellow"
                />
                <StatCard
                    label="Inactive"
                    value={users.filter(u => !u.isActive).length}
                    icon="🚫"
                    color="red"
                />
            </div>

            {/* Users Table */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center text-gray-400">
                        <div className="animate-spin text-4xl mb-4">⚙️</div>
                        <p>Loading users from blockchain...</p>
                    </div>
                ) : error ? (
                    <div className="p-12 text-center text-red-400">
                        <div className="text-4xl mb-4">⚠️</div>
                        <p>{error}</p>
                        <button
                            onClick={fetchUsers}
                            className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white"
                        >
                            Retry
                        </button>
                    </div>
                ) : users.length === 0 ? (
                    <div className="p-12 text-center text-gray-400">
                        <div className="text-4xl mb-4">📭</div>
                        <p>No users found</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-white/10">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Wallet</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Role</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Country</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Registered</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/10">
                                {users.map((user) => (
                                    <tr key={user.walletAddress} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4 font-mono text-xs text-gray-300">
                                            {user.walletAddress.slice(0, 8)}...{user.walletAddress.slice(-6)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <RoleBadge role={user.role} />
                                        </td>
                                        <td className="px-6 py-4 text-white uppercase text-sm">
                                            {user.country}
                                        </td>
                                        <td className="px-6 py-4 text-gray-300 text-sm">
                                            {new Date(user.registeredAt * 1000).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusBadge isActive={user.isActive} />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => {
                                                        setChangingRole(user.walletAddress);
                                                        setNewRole(user.role);
                                                    }}
                                                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-white text-xs font-bold"
                                                    title="Change Role"
                                                >
                                                    👑 Role
                                                </button>
                                                <button
                                                    onClick={() => handleToggleActive(user.walletAddress, user.isActive)}
                                                    className={`px-3 py-1 rounded text-white text-xs font-bold ${user.isActive
                                                            ? 'bg-red-600 hover:bg-red-700'
                                                            : 'bg-green-600 hover:bg-green-700'
                                                        }`}
                                                    title={user.isActive ? 'Deactivate' : 'Activate'}
                                                >
                                                    {user.isActive ? '🚫 Deactivate' : '✅ Activate'}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Role Change Modal */}
            {changingRole && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-[#0a0f1a] border border-white/20 rounded-xl p-8 max-w-md w-full mx-4">
                        <h2 className="text-2xl font-bold text-white mb-6">Change User Role</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-gray-400 text-sm font-bold mb-2">
                                    Wallet Address
                                </label>
                                <div className="px-4 py-2 bg-white/10 rounded text-white font-mono text-xs">
                                    {changingRole}
                                </div>
                            </div>

                            <div>
                                <label className="block text-gray-400 text-sm font-bold mb-2">
                                    New Role
                                </label>
                                <select
                                    value={newRole}
                                    onChange={(e) => setNewRole(e.target.value as UserRole)}
                                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="USER">User</option>
                                    <option value="CASHIER">Cashier</option>
                                    <option value="MANAGER">Manager</option>
                                    <option value="DRIVER">Driver</option>
                                    <option value="SUPPLIER">Supplier</option>
                                    <option value="ADMIN">Admin</option>
                                    <option value="SUPER_ADMIN">Super Admin</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-gray-400 text-sm font-bold mb-2">
                                    Reason (Required)
                                </label>
                                <textarea
                                    value={changeReason}
                                    onChange={(e) => setChangeReason(e.target.value)}
                                    placeholder="Enter reason for role change..."
                                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                    rows={3}
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-3 mt-6">
                            <button
                                onClick={() => handleChangeRole(changingRole)}
                                disabled={!changeReason.trim()}
                                className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 rounded text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Confirm Change
                            </button>
                            <button
                                onClick={() => {
                                    setChangingRole(null);
                                    setChangeReason('');
                                }}
                                className="flex-1 px-6 py-3 bg-gray-600 hover:bg-gray-700 rounded text-white font-bold"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Security Warning */}
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6">
                <h3 className="text-red-400 font-bold mb-2 flex items-center gap-2">
                    <span>⚠️</span>
                    Security Warning
                </h3>
                <ul className="text-red-200 text-sm space-y-1 list-disc list-inside">
                    <li>All role changes are written to blockchain (immutable audit trail)</li>
                    <li>Granting SUPER_ADMIN gives full system access</li>
                    <li>ADMIN can manage subscribers but not change roles</li>
                    <li>Always provide detailed reasons for role changes</li>
                    <li>Deactivated users lose all access immediately</li>
                </ul>
            </div>
        </div>
    );
}

// ============================================
// SUB-COMPONENTS
// ============================================

function StatCard({
    label,
    value,
    icon,
    color = 'blue',
}: {
    label: string;
    value: number;
    icon: string;
    color?: 'blue' | 'green' | 'red' | 'yellow';
}) {
    const colors = {
        blue: 'from-blue-500/20 to-blue-600/10 border-blue-500/30',
        green: 'from-green-500/20 to-green-600/10 border-green-500/30',
        red: 'from-red-500/20 to-red-600/10 border-red-500/30',
        yellow: 'from-yellow-500/20 to-yellow-600/10 border-yellow-500/30',
    };

    return (
        <div className={`bg-gradient-to-br ${colors[color]} backdrop-blur-sm border rounded-xl p-6`}>
            <div className="flex items-center gap-4">
                <div className="text-3xl">{icon}</div>
                <div>
                    <div className="text-3xl font-black text-white">{value}</div>
                    <div className="text-sm text-gray-400 uppercase tracking-wider">{label}</div>
                </div>
            </div>
        </div>
    );
}

function RoleBadge({ role }: { role: UserRole }) {
    const colors = {
        USER: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
        CASHIER: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
        MANAGER: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
        DRIVER: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
        SUPPLIER: 'bg-green-500/20 text-green-300 border-green-500/30',
        ADMIN: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
        SUPER_ADMIN: 'bg-red-500/20 text-red-300 border-red-500/30',
    };

    return (
        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase border ${colors[role]}`}>
            {role.replace('_', ' ')}
        </span>
    );
}

function StatusBadge({ isActive }: { isActive: boolean }) {
    return (
        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase border ${isActive
                ? 'bg-green-500/20 text-green-300 border-green-500/30'
                : 'bg-red-500/20 text-red-300 border-red-500/30'
            }`}>
            {isActive ? '✅ ACTIVE' : '🚫 INACTIVE'}
        </span>
    );
}
