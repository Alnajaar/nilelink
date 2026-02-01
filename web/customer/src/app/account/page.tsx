"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, User, CreditCard, MapPin, Bell, Lock, Package, Heart, Star, Settings } from 'lucide-react';
import { PremiumButton } from '@/components/shared/PremiumButton';
import AuthGuard from '@shared/components/AuthGuard';

export default function AccountPage() {
  const menuItems = [
    { icon: User, label: 'Personal Info', href: '/profile' },
    { icon: MapPin, label: 'Saved Locations', href: '/profile' },
    { icon: CreditCard, label: 'Payment Methods', href: '/profile' },
    { icon: Bell, label: 'Notifications', href: '/profile' },
    { icon: Lock, label: 'Security', href: '/profile' },
    { icon: Package, label: 'Order History', href: '/orders' },
    { icon: Heart, label: 'Favorites', href: '/wishlist' },
    { icon: Star, label: 'Loyalty Program', href: '/loyalty' },
    { icon: Settings, label: 'Settings', href: '/settings' },
  ];

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-8">
            <Link href="/">
              <PremiumButton variant="ghost" icon={<ArrowLeft size={20} />}>
                Back
              </PremiumButton>
            </Link>
            <h1 className="text-3xl md:text-4xl font-black text-text-primary">My Account</h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {menuItems.map((item) => (
              <Link key={item.label} href={item.href}>
                <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-200 hover:border-primary cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <item.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-text-primary">{item.label}</h3>
                      <p className="text-sm text-text-secondary">Manage your {item.label.toLowerCase()}</p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
