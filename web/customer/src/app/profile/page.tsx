"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@shared/contexts/AuthContext';
import { fetchProfile as apiFetchProfile, updateProfile as apiUpdateProfile, addLocation as apiAddLocation } from '@/lib/api/user';
import { LoadingState } from '@/components/shared/LoadingState';
import { Plus, MapPin, ChevronRight, LogOut, Edit2, CheckCircle, Smartphone, Mail, User, CreditCard, ShieldCheck, Zap } from 'lucide-react';
import { auth } from '@shared/providers/FirebaseAuthProvider';
import AuthGuard from '@shared/components/AuthGuard';

const alertToast = (msg: string) => {
  if (typeof window !== 'undefined') {
    alert(msg);
  }
};

interface UserLocation {
  id: string;
  label: string;
  address: string;
  city: string;
  country: string;
  isDefault: boolean;
  icon: string;
}

export default function ProfilePage() {
  return (
    <AuthGuard>
      <ProfileContent />
    </AuthGuard>
  );
}

function ProfileContent() {
  const { user, loading, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [showAddLocation, setShowAddLocation] = useState(false);
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    locations: [] as UserLocation[]
  });

  const [affiliateStats, setAffiliateStats] = useState({
    totalReferrals: 0,
    lifetimeEarnings: 0,
    status: 'Inactive'
  });

  const [newLocation, setNewLocation] = useState({
    label: '',
    address: '',
    city: 'Cairo',
    country: 'Egypt',
    icon: '🏠'
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchAffiliateStats();

      // If user authenticated via phone, populate phone number from Firebase
      if (auth.currentUser?.phoneNumber && !profile.phone) {
        setProfile(prev => ({
          ...prev,
          phone: auth.currentUser?.phoneNumber || ''
        }));
      }
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const token = auth.currentUser ? await auth.currentUser.getIdToken() : null;
      const res = await fetch('/api/user/profile', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      const data = await res.json();
      if (data.success) {
        // Merge API data with Firebase user data
        const firebasePhone = auth.currentUser?.phoneNumber;
        const firebaseName = auth.currentUser?.displayName;

        setProfile({
          ...data.data,
          // Use Firebase phone if API doesn't have it
          phone: data.data.phone || firebasePhone || '',
          // Parse display name if firstName/lastName not in API
          firstName: data.data.firstName || firebaseName?.split(' ')[0] || '',
          lastName: data.data.lastName || firebaseName?.split(' ').slice(1).join(' ') || '',
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      // Fallback to Firebase data if API fails
      const firebasePhone = auth.currentUser?.phoneNumber;
      const firebaseName = auth.currentUser?.displayName;
      setProfile(prev => ({
        ...prev,
        phone: firebasePhone || '',
        firstName: firebaseName?.split(' ')[0] || '',
        lastName: firebaseName?.split(' ').slice(1).join(' ') || '',
        email: auth.currentUser?.email || ''
      }));
    }
  };

  const fetchAffiliateStats = async () => {
    try {
      const token = auth.currentUser ? await auth.currentUser.getIdToken() : null;
      const res = await fetch('/api/affiliates/me', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      const data = await res.json();
      if (data.success && data.data.stats) {
        setAffiliateStats({
          totalReferrals: data.data.stats.totalReferrals,
          lifetimeEarnings: data.data.stats.lifetimeEarnings,
          status: data.data.profile ? 'Active' : 'Inactive'
        });
      }
    } catch (error) {
      console.error('Error fetching affiliate stats:', error);
    }
  };

  const handleSaveProfile = async () => {
    try {
      const token = auth.currentUser ? await auth.currentUser.getIdToken() : null;
      const res = await fetch('/api/user/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({
          firstName: profile.firstName,
          lastName: profile.lastName,
          email: profile.email,
          phone: profile.phone
        })
      });
      if (res.ok) {
        setIsEditing(false);
        alertToast('Profile updated successfully! ✨');
        fetchProfile(); // Refresh
      }
    } catch (error) {
      alertToast('Failed to update profile ❌');
    }
  };

  const handleAddLocation = async () => {
    if (!newLocation.label || !newLocation.address) {
      alertToast('Please fill in all fields 📍');
      return;
    }

    try {
      const token = auth.currentUser ? await auth.currentUser.getIdToken() : null;
      const res = await fetch('/api/user/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({
          locations: [...profile.locations, {
            ...newLocation,
            id: Date.now().toString(),
            isDefault: profile.locations.length === 0
          }]
        })
      });
      if (res.ok) {
        setShowAddLocation(false);
        setNewLocation({ label: '', address: '', city: 'Cairo', country: 'Egypt', icon: '🏠' });
        fetchProfile();
        alertToast('Location added successfully! 🏠');
      }
    } catch (error) {
      alertToast('Failed to add location ❌');
    }
  };

  if (loading) return <LoadingState />;

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-20 font-sans">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <Link href="/" className="group flex items-center justify-center w-12 h-12 bg-white rounded-2xl shadow-elevation-1 border border-gray-100 hover:border-primary-500 transition-all">
              <ChevronRight className="rotate-180 text-gray-400 group-hover:text-primary-500 transition-colors" size={24} />
            </Link>
            <div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight">Account</h1>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-[0.2em]">Profile & Settings</p>
            </div>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 bg-primary-50 rounded-2xl border border-primary-100">
            <ShieldCheck size={20} className="text-primary-500" />
            <span className="text-xs font-black text-primary-600 uppercase tracking-widest leading-none">Verified</span>
          </div>
        </div>

        {/* Info Card with Gradient Avatar */}
        <div className="bg-white rounded-[2.5rem] shadow-elevation-2 border border-blue-50/50 overflow-hidden mb-8 group hover:shadow-elevation-3 transition-shadow duration-500">
          <div className="p-8 sm:p-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="w-24 h-24 bg-gradient-to-br from-primary-400 via-primary-500 to-primary-700 rounded-[2rem] flex items-center justify-center text-white text-4xl font-black shadow-xl shadow-primary-200 group-hover:rotate-6 transition-transform duration-500">
                    {profile.firstName?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-white rounded-2xl shadow-lg border border-gray-50 flex items-center justify-center">
                    <Zap size={20} className="text-accent-500 fill-accent-500" />
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-black text-gray-900 leading-tight">Personal Details</h2>
                  <p className="text-gray-400 font-medium">Profile synchronization active</p>
                </div>
              </div>

              <button
                onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
                className={`flex items-center gap-2 h-14 px-8 rounded-2xl font-black uppercase tracking-widest text-sm transition-all duration-300 ${isEditing
                  ? 'bg-primary-500 text-white shadow-lg shadow-primary-200 hover:bg-primary-600 hover:scale-105'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-100'
                  }`}
              >
                {isEditing ? <CheckCircle size={20} /> : <Edit2 size={20} />}
                {isEditing ? 'Save Profile' : 'Edit Info'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              {[
                { label: 'First Name', key: 'firstName', icon: <User size={20} />, type: 'text' },
                { label: 'Last Name', key: 'lastName', icon: <User size={20} />, type: 'text' },
                { label: 'Email Address', key: 'email', icon: <Mail size={20} />, type: 'email' },
                { label: 'Phone Number', key: 'phone', icon: <Smartphone size={20} />, type: 'tel' },
              ].map((field) => (
                <div key={field.key} className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">{field.label}</label>
                  <div className="relative group/input">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within/input:text-primary-500 transition-colors">
                      {field.icon}
                    </div>
                    <input
                      type={field.type}
                      value={(profile as any)[field.key] || ''}
                      onChange={(e) => setProfile({ ...profile, [field.key]: e.target.value })}
                      disabled={!isEditing}
                      className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-gray-50 bg-gray-50/50 text-gray-900 font-bold placeholder-gray-300 focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/5 transition-all disabled:opacity-50"
                      placeholder={`Your ${field.label.split(' ')[0].toLowerCase()}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Dynamic Grid for Locations and Payments */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Saved Locations */}
          <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-elevation-2 flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl font-black text-gray-900">Delivery Spots</h2>
                <p className="text-sm text-gray-400 font-medium">Quick checkout points</p>
              </div>
              <button
                onClick={() => setShowAddLocation(true)}
                className="w-12 h-12 bg-primary-50 text-primary-500 rounded-2xl flex items-center justify-center hover:bg-primary-500 hover:text-white transition-all duration-300 border border-primary-100"
              >
                <Plus size={24} />
              </button>
            </div>

            <div className="space-y-4 flex-1">
              {profile.locations.map((loc) => (
                <div key={loc.id} className={`p-5 rounded-3xl border-2 transition-all group/loc ${loc.isDefault ? 'border-primary-100 bg-primary-50/30' : 'border-gray-50 bg-gray-50/20 hover:border-gray-200'}`}>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-elevation-1 border border-gray-100 text-2xl group-hover/loc:scale-110 transition-transform">
                      {loc.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-black text-gray-900 truncate tracking-tight">{loc.label}</p>
                        {loc.isDefault && <span className="bg-primary-500 text-[10px] text-white px-2 py-0.5 rounded-lg font-black uppercase tracking-widest">Main</span>}
                      </div>
                      <p className="text-sm text-gray-500 font-medium truncate">{loc.address}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">{loc.city} Node</p>
                    </div>
                  </div>
                </div>
              ))}

              {profile.locations.length === 0 && (
                <div className="flex flex-col items-center justify-center py-10 opacity-30 grayscale saturate-0">
                  <MapPin size={48} className="mb-4 text-gray-300" />
                  <p className="font-bold text-gray-400">Establish your first delivery node</p>
                </div>
              )}
            </div>
          </div>

          {/* Payment Card Section - High Contrast */}
          <div className="bg-gray-900 rounded-[2.5rem] p-10 border border-gray-800 shadow-2xl flex flex-col relative overflow-hidden group/pay">
            <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none group-hover/pay:opacity-20 transition-opacity duration-1000">
              <Zap size={200} className="text-primary-500" />
            </div>

            <div className="flex items-center justify-between mb-8 relative z-10">
              <div>
                <h2 className="text-xl font-black text-white">Payment Rail</h2>
                <p className="text-sm text-gray-500 font-medium">Financial synchronization</p>
              </div>
              <button
                onClick={() => alertToast('Secure card integration phase coming soon! 🛡️')}
                className="px-4 py-2 bg-accent-500/10 text-accent-500 rounded-xl font-black text-[10px] uppercase tracking-widest border border-accent-500/20 hover:bg-accent-500 hover:text-gray-900 transition-all duration-300"
              >
                Sync Device
              </button>
            </div>

            <div className="flex-1 flex flex-col justify-center relative z-10">
              <div className="relative group transition-all duration-500 hover:scale-105">
                <div className="w-full aspect-[1.58/1] bg-gradient-to-br from-[#111] via-[#1a1a1a] to-[#050505] rounded-[2rem] p-8 text-white shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 overflow-hidden relative">
                  <div className="h-full flex flex-col justify-between relative z-10">
                    <div className="flex justify-between items-start">
                      <div className="w-14 h-11 bg-white/5 rounded-xl backdrop-blur-md border border-white/10 p-2 flex items-center justify-center">
                        <div className="w-full h-0.5 bg-accent-500/50 rounded-full mb-1"></div>
                        <div className="w-full h-0.5 bg-accent-500/30 rounded-full"></div>
                      </div>
                      <div className="text-right italic font-black text-2xl tracking-tighter opacity-80 group-hover:opacity-100 transition-opacity">VISA</div>
                    </div>

                    <div>
                      <div className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-2">Vault Identifier</div>
                      <div className="text-2xl sm:text-3xl font-black tracking-[0.25em] text-white/90">•••• •••• •••• 4242</div>
                    </div>

                    <div className="flex justify-between items-end border-t border-white/5 pt-4">
                      <div>
                        <div className="text-[8px] font-black text-white/30 uppercase tracking-[0.3em] mb-1">Keyholder</div>
                        <div className="font-bold text-sm tracking-widest uppercase truncate max-w-[120px]">{profile.firstName || 'User'} {profile.lastName || 'Profile'}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[8px] font-black text-white/30 uppercase tracking-[0.3em] mb-1">Term</div>
                        <div className="font-black text-sm tracking-widest">12/26</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute inset-0 bg-primary-500/10 rounded-[2rem] blur-3xl -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
              </div>
              <p className="text-center text-[10px] text-gray-600 mt-8 font-black uppercase tracking-[0.4em] opacity-40">NileLink Secure Payment Node</p>
            </div>
          </div>
        </div>

        {/* Affiliate Center Section */}
        <div className="bg-white rounded-[2.5rem] p-8 sm:p-10 border border-gray-100 shadow-elevation-2 mb-10 group hover:border-primary-100 transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
            <div>
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">Referral Protocol</h2>
              <p className="text-gray-400 font-medium">Ecosystem growth and secondary earnings</p>
            </div>
            <Link href="/affiliate" className="inline-flex items-center justify-center gap-3 bg-gray-900 text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-primary-500 transition-all duration-300 shadow-xl shadow-gray-200 group-hover:shadow-primary-100">
              Network Hub
              <ChevronRight size={18} className="translate-x-0 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { label: 'Network Size', value: affiliateStats.totalReferrals, sub: 'Active referrals', color: 'primary' },
              { label: 'Ecosystem Earnings', value: `$${affiliateStats.lifetimeEarnings.toFixed(2)}`, sub: 'Realized value', color: 'success' },
              { label: 'Node Status', value: affiliateStats.status, sub: 'System standing', color: 'warning' }
            ].map((stat, i) => (
              <div key={i} className="p-6 rounded-[2rem] bg-gray-50 border border-gray-50 group-hover:bg-white group-hover:border-primary-50 transition-all duration-300">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 leading-none">{stat.label}</p>
                <p className={`text-4xl font-black mb-1 truncate leading-none ${stat.color === 'primary' ? 'text-primary-500' :
                  stat.color === 'success' ? 'text-emerald-500' : 'text-amber-500'
                  }`}>
                  {stat.value}
                </p>
                <p className="text-[10px] font-bold text-gray-400 tracking-tight mt-2 opacity-60">{stat.sub}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Action Center Footer */}
        <div className="flex flex-col items-center gap-6">
          <div className="h-px w-32 bg-gray-200"></div>
          <button
            onClick={logout}
            className="flex items-center gap-3 text-gray-400 font-black uppercase tracking-[0.3em] text-[10px] hover:text-red-500 hover:tracking-[0.4em] transition-all duration-500 py-3 px-8 rounded-full border border-transparent hover:border-red-100 hover:bg-red-50"
          >
            <LogOut size={16} />
            Terminate Active Session
          </button>
        </div>
      </div>

      {/* Modern Add Location Modal */}
      {showAddLocation && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 overflow-y-auto">
          <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-md animate-in fade-in duration-500" onClick={() => setShowAddLocation(false)}></div>
          <div className="relative bg-white w-full max-w-md rounded-[3rem] p-10 shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">
            <div className="text-center mb-10">
              <div className="w-20 h-20 bg-primary-50 text-primary-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                <MapPin size={40} />
              </div>
              <h3 className="text-3xl font-black text-gray-900 tracking-tight">New Entry Point</h3>
              <p className="text-gray-400 font-semibold mt-1">Expanding your reach</p>
            </div>

            <div className="space-y-6 mb-10">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Identity & Tag</label>
                <div className="flex gap-3">
                  <select
                    value={newLocation.icon}
                    onChange={(e) => setNewLocation({ ...newLocation, icon: e.target.value })}
                    className="w-24 px-4 py-4 rounded-2xl border-2 border-gray-50 bg-gray-50 text-2xl text-center focus:bg-white focus:border-primary-500 transition-all outline-none"
                  >
                    <option>🏠</option>
                    <option>💼</option>
                    <option>🏫</option>
                    <option>📍</option>
                    <option>⭐</option>
                    <option>🏩</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Home, HQ, etc."
                    value={newLocation.label}
                    onChange={(e) => setNewLocation({ ...newLocation, label: e.target.value })}
                    className="flex-1 px-5 py-4 rounded-2xl border-2 border-gray-50 bg-gray-50 font-black text-gray-900 placeholder-gray-300 focus:bg-white focus:border-primary-500 transition-all outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Coordinate/Street Address</label>
                <textarea
                  rows={3}
                  placeholder="Enter the full coordinates or address..."
                  value={newLocation.address}
                  onChange={(e) => setNewLocation({ ...newLocation, address: e.target.value })}
                  className="w-full px-5 py-4 rounded-2xl border-2 border-gray-50 bg-gray-50 font-bold text-gray-900 placeholder-gray-300 focus:bg-white focus:border-primary-500 transition-all outline-none resize-none"
                />
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <button
                onClick={handleAddLocation}
                className="w-full bg-primary-500 text-white py-5 rounded-[1.5rem] font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-primary-200 hover:bg-primary-600 hover:-translate-y-1 transition-all duration-300"
              >
                Establish Location
              </button>
              <button
                onClick={() => setShowAddLocation(false)}
                className="w-full py-4 rounded-[1.5rem] font-black text-xs uppercase tracking-widest text-gray-400 hover:text-gray-900 transition-colors"
              >
                Abort Action
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}