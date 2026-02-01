'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    User, Mail, Phone, MapPin, Globe, Building2, Award,
    Edit, Save, X, Camera, CheckCircle, Shield, Star,
    Calendar, Package, TrendingUp, Users
} from 'lucide-react';
import { useAuth } from '@shared/providers/FirebaseAuthProvider';

interface ProfileData {
    id: string;
    businessName: string;
    ownerName: string;
    email: string;
    phone: string;
    address: string;
    website: string;
    description: string;
    category: string;
    taxId: string;
    established: string;
    businessType?: string;
    businessSize?: string;
    certifications?: string[];
    shippingMethods?: string[];
    paymentTerms?: string;
    verified: boolean;
    createdAt: string;
    updatedAt: string;
}

export default function ProfilePage() {
    const { user } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<ProfileData>({
        id: '',
        businessName: '',
        ownerName: user?.firstName + ' ' + user?.lastName || '',
        email: user?.email || '',
        phone: '',
        address: '',
        website: '',
        description: '',
        category: '',
        taxId: '',
        established: '',
        verified: false,
        createdAt: '',
        updatedAt: ''
    });
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                // Use the user's ID from auth context to fetch specific profile
                const userId = user?.uid;
                const url = userId ? `/api/profile?userId=${userId}` : '/api/profile';
                
                const response = await fetch(url);
                if (response.ok) {
                    const data = await response.json();
                    setFormData(data);
                } else {
                    console.error('Failed to fetch profile:', response.statusText);
                }
            } catch (error) {
                console.error('Error fetching profile:', error);
            } finally {
                setLoading(false);
            }
        };
        
        if (user) {
            fetchProfile();
        }
    }, [user]);

    const stats = [
        { label: 'Total Products', value: '156', icon: Package, color: 'text-blue-400' },
        { label: 'Active Orders', value: '42', icon: TrendingUp, color: 'text-emerald-400' },
        { label: 'Team Members', value: '8', icon: Users, color: 'text-purple-400' },
        { label: 'Rating', value: '4.8', icon: Star, color: 'text-yellow-400' },
    ];

    const handleSave = async () => {
        try {
            // Include the user ID in the update request
            const userId = user?.uid;
            const url = userId ? `/api/profile?userId=${userId}` : '/api/profile';
            
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({...formData, id: userId})
            });
            
            if (response.ok) {
                const result = await response.json();
                console.log('Profile updated successfully:', result);
                setIsEditing(false);
            } else {
                console.error('Failed to update profile');
            }
        } catch (error) {
            console.error('Error saving profile:', error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
                <div className="text-white text-xl">Loading profile...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-2">Supplier Profile</h1>
                        <p className="text-slate-400">Manage your business information and public profile</p>
                    </div>
                    {!isEditing ? (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
                        >
                            <Edit className="w-4 h-4" />
                            <span>Edit Profile</span>
                        </button>
                    ) : (
                        <div className="flex gap-3">
                            <button
                                onClick={() => setIsEditing(false)}
                                className="flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition"
                            >
                                <X className="w-4 h-4" />
                                <span>Cancel</span>
                            </button>
                            <button
                                onClick={handleSave}
                                className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition"
                            >
                                <Save className="w-4 h-4" />
                                <span>Save Changes</span>
                            </button>
                        </div>
                    )}
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left Column - Profile Card */}
                    <div className="lg:col-span-1">
                        <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-2xl p-6">
                            {/* Profile Picture */}
                            <div className="relative mb-6">
                                <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-4xl font-bold">
                                    {formData.businessName.charAt(0)}
                                </div>
                                {isEditing && (
                                    <button className="absolute bottom-0 right-1/2 translate-x-1/2 translate-y-2 p-2 bg-blue-600 hover:bg-blue-700 rounded-full transition">
                                        <Camera className="w-4 h-4 text-white" />
                                    </button>
                                )}
                            </div>

                            <div className="text-center mb-6">
                                <h2 className="text-2xl font-bold text-white mb-1">{formData.businessName}</h2>
                                <p className="text-slate-400 mb-3">{formData.category}</p>
                                <div className="flex items-center justify-center gap-2 text-emerald-400">
                                    <CheckCircle className="w-4 h-4" />
                                    <span className="text-sm font-medium">Verified Supplier</span>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-2 gap-4">
                                {stats.map((stat) => (
                                    <div key={stat.label} className="bg-slate-800/50 rounded-lg p-4">
                                        <stat.icon className={`w-5 h-5 ${stat.color} mb-2`} />
                                        <div className="text-2xl font-bold text-white">{stat.value}</div>
                                        <div className="text-xs text-slate-400">{stat.label}</div>
                                    </div>
                                ))}
                            </div>

                            {/* Badges */}
                            <div className="mt-6 pt-6 border-t border-slate-800/50">
                                <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                                    <Award className="w-4 h-4 text-yellow-400" />
                                    Achievements
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    <span className="px-3 py-1 bg-yellow-500/10 text-yellow-400 rounded-full text-xs font-medium">
                                        Top Supplier 2025
                                    </span>
                                    <span className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-xs font-medium">
                                        100+ Orders
                                    </span>
                                    <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-xs font-medium">
                                        5 Year Partner
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Details */}
                    <div className="lg:col-span-2">
                        <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-2xl p-8">
                            <h3 className="text-xl font-bold text-white mb-6">Business Information</h3>

                            <div className="space-y-6">
                                {/* Business Name */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-2">
                                        Business Name
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={formData.businessName}
                                            onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    ) : (
                                        <div className="flex items-center gap-3 px-4 py-3 bg-slate-800/30 rounded-lg">
                                            <Building2 className="w-5 h-5 text-slate-400" />
                                            <span className="text-white">{formData.businessName}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Owner Name */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-2">
                                        Owner Name
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={formData.ownerName}
                                            onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    ) : (
                                        <div className="flex items-center gap-3 px-4 py-3 bg-slate-800/30 rounded-lg">
                                            <User className="w-5 h-5 text-slate-400" />
                                            <span className="text-white">{formData.ownerName}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-2">
                                        Email
                                    </label>
                                    <div className="flex items-center gap-3 px-4 py-3 bg-slate-800/30 rounded-lg">
                                        <Mail className="w-5 h-5 text-slate-400" />
                                        <span className="text-white">{formData.email}</span>
                                        <CheckCircle className="w-4 h-4 text-emerald-400 ml-auto" />
                                    </div>
                                </div>

                                {/* Phone */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-2">
                                        Phone
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    ) : (
                                        <div className="flex items-center gap-3 px-4 py-3 bg-slate-800/30 rounded-lg">
                                            <Phone className="w-5 h-5 text-slate-400" />
                                            <span className="text-white">{formData.phone}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Address */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-2">
                                        Address
                                    </label>
                                    {isEditing ? (
                                        <textarea
                                            value={formData.address}
                                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                            rows={2}
                                            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    ) : (
                                        <div className="flex items-start gap-3 px-4 py-3 bg-slate-800/30 rounded-lg">
                                            <MapPin className="w-5 h-5 text-slate-400 mt-0.5" />
                                            <span className="text-white">{formData.address}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Website */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-2">
                                        Website
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="url"
                                            value={formData.website}
                                            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    ) : (
                                        <div className="flex items-center gap-3 px-4 py-3 bg-slate-800/30 rounded-lg">
                                            <Globe className="w-5 h-5 text-slate-400" />
                                            <a href={formData.website} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
                                                {formData.website}
                                            </a>
                                        </div>
                                    )}
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-2">
                                        Business Description
                                    </label>
                                    {isEditing ? (
                                        <textarea
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            rows={4}
                                            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    ) : (
                                        <div className="px-4 py-3 bg-slate-800/30 rounded-lg">
                                            <p className="text-white">{formData.description}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Tax Information */}
                                <div className="grid md:grid-cols-2 gap-6 pt-6 border-t border-slate-800/50">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-2">
                                            Tax ID
                                        </label>
                                        <div className="flex items-center gap-3 px-4 py-3 bg-slate-800/30 rounded-lg">
                                            <Shield className="w-5 h-5 text-slate-400" />
                                            <span className="text-white font-mono">{formData.taxId}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-2">
                                            Established
                                        </label>
                                        <div className="flex items-center gap-3 px-4 py-3 bg-slate-800/30 rounded-lg">
                                            <Calendar className="w-5 h-5 text-slate-400" />
                                            <span className="text-white">{formData.established}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
