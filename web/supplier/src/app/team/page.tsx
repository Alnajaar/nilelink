'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Users, UserPlus, Mail, Shield, Edit, Trash2, Search,
    MoreVertical, CheckCircle, XCircle, Crown, User
} from 'lucide-react';
import { useAuth } from '@shared/providers/FirebaseAuthProvider';

export default function TeamPage() {
    const { user } = useAuth();
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const roles = [
        { value: 'OWNER', label: 'Owner', icon: Crown, color: 'text-yellow-400' },
        { value: 'MANAGER', label: 'Manager', icon: Shield, color: 'text-blue-400' },
        { value: 'STAFF', label: 'Staff', icon: User, color: 'text-slate-400' }
    ];

    const teamMembers = [
        {
            id: '1',
            name: user?.firstName + ' ' + user?.lastName || 'John Doe',
            email: user?.email || 'owner@nilelink.app',
            role: 'OWNER',
            status: 'active',
            joinedDate: '2024-01-15',
            lastActive: '2 hours ago'
        },
        {
            id: '2',
            name: 'Sarah Johnson',
            email: 'sarah.j@nilelink.app',
            role: 'MANAGER',
            status: 'active',
            joinedDate: '2024-03-20',
            lastActive: '5 minutes ago'
        },
        {
            id: '3',
            name: 'Mike Chen',
            email: 'mike.c@nilelink.app',
            role: 'STAFF',
            status: 'active',
            joinedDate: '2024-06-10',
            lastActive: '1 day ago'
        },
        {
            id: '4',
            name: 'Emily Davis',
            email: 'emily.d@nilelink.app',
            role: 'STAFF',
            status: 'pending',
            joinedDate: null,
            lastActive: null
        }
    ];

    const getRoleInfo = (role: string) => {
        return roles.find(r => r.value === role) || roles[2];
    };

    const filteredMembers = teamMembers.filter(member =>
        member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-2">Team Management</h1>
                        <p className="text-slate-400">Manage team members, roles, and permissions</p>
                    </div>
                    <button
                        onClick={() => setShowInviteModal(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
                    >
                        <UserPlus className="w-5 h-5" />
                        <span>Invite Member</span>
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-2">
                            <Users className="w-8 h-8 text-blue-400" />
                        </div>
                        <div className="text-3xl font-bold text-white mb-1">4</div>
                        <div className="text-sm text-slate-400">Total Members</div>
                    </div>
                    <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-2">
                            <CheckCircle className="w-8 h-8 text-emerald-400" />
                        </div>
                        <div className="text-3xl font-bold text-white mb-1">3</div>
                        <div className="text-sm text-slate-400">Active</div>
                    </div>
                    <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-2">
                            <Mail className="w-8 h-8 text-yellow-400" />
                        </div>
                        <div className="text-3xl font-bold text-white mb-1">1</div>
                        <div className="text-sm text-slate-400">Pending</div>
                    </div>
                    <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-2">
                            <Shield className="w-8 h-8 text-purple-400" />
                        </div>
                        <div className="text-3xl font-bold text-white mb-1">2</div>
                        <div className="text-sm text-slate-400">Managers</div>
                    </div>
                </div>

                {/* Search */}
                <div className="mb-6">
                    <div className="relative max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search team members..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-slate-900/50 border border-slate-800/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                {/* Team Table */}
                <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-800/50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                        Member
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                        Role
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                        Joined
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                        Last Active
                                    </th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50">
                                {filteredMembers.map((member, index) => {
                                    const roleInfo = getRoleInfo(member.role);
                                    const RoleIcon = roleInfo.icon;

                                    return (
                                        <motion.tr
                                            key={member.id}
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="hover:bg-slate-800/30 transition"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-semibold">
                                                        {member.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-white">{member.name}</div>
                                                        <div className="text-sm text-slate-400">{member.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <RoleIcon className={`w-4 h-4 ${roleInfo.color}`} />
                                                    <span className="text-white">{roleInfo.label}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {member.status === 'active' ? (
                                                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-sm">
                                                        <CheckCircle className="w-3 h-3" />
                                                        Active
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-400 text-sm">
                                                        <Mail className="w-3 h-3" />
                                                        Pending
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-slate-300">
                                                    {member.joinedDate || '-'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-slate-400">
                                                    {member.lastActive || '-'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {member.role !== 'OWNER' && (
                                                        <>
                                                            <button className="p-2 hover:bg-slate-800 rounded-lg transition">
                                                                <Edit className="w-4 h-4 text-slate-400 hover:text-white" />
                                                            </button>
                                                            <button className="p-2 hover:bg-slate-800 rounded-lg transition">
                                                                <Trash2 className="w-4 h-4 text-red-400 hover:text-red-300" />
                                                            </button>
                                                        </>
                                                    )}
                                                    <button className="p-2 hover:bg-slate-800 rounded-lg transition">
                                                        <MoreVertical className="w-4 h-4 text-slate-400" />
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Invite Modal */}
                {showInviteModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl max-w-lg w-full p-8"
                        >
                            <h3 className="text-2xl font-bold text-white mb-6">Invite Team Member</h3>

                            <div className="space-y-4 mb-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-2">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        placeholder="team member@example.com"
                                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-2">
                                        Role
                                    </label>
                                    <select className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                                        <option value="STAFF">Staff</option>
                                        <option value="MANAGER">Manager</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3">
                                <button
                                    onClick={() => setShowInviteModal(false)}
                                    className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        // Send invite logic
                                        setShowInviteModal(false);
                                    }}
                                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
                                >
                                    Send Invite
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </div>
        </div>
    );
}
