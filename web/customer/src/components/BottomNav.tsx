'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Search,
  ShoppingCart,
  Heart,
  User,
} from 'lucide-react';

const navItems = [
  { path: '/home', icon: Home, label: 'Home' },
  { path: '/search', icon: Search, label: 'Search' },
  { path: '/cart', icon: ShoppingCart, label: 'Cart' },
  { path: '/wishlist', icon: Heart, label: 'Wishlist' },
  { path: '/account', icon: User, label: 'Account' },
];

export default function BottomNav() {
  const pathname = usePathname();

  // Don't show on certain pages
  if (pathname.includes('/auth') || pathname.includes('/checkout')) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.path);

            return (
              <Link
                key={item.path}
                href={item.path}
                className={`
                  flex flex-col items-center justify-center w-full py-3
                  transition-colors duration-200 border-t-2 -mt-px
                  ${
                    isActive
                      ? 'border-primary-600 text-primary-600'
                      : 'border-transparent text-text-tertiary hover:text-text-secondary'
                  }
                `}
              >
                <Icon className="w-6 h-6 mb-1" />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
