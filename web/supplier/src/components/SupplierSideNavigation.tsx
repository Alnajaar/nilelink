"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Home, Package, ShoppingCart, TrendingUp, Zap,
  Settings, LogOut, ChevronDown, Building2, Phone,
  FileText, X, Menu, BarChart3, Repeat, Users
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
}

interface SupplierSideNavigationProps {
  supplierName?: string;
  supplierEmail?: string;
  supplierCategory?: string;
  supplierRating?: number;
  onLogout?: () => void;
}

export default function SupplierSideNavigation({
  supplierName = 'Supplier Name',
  supplierEmail = 'supplier@example.com',
  supplierCategory = 'Premium Supplier',
  supplierRating = 4.8,
  onLogout,
}: SupplierSideNavigationProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const navItems: NavItem[] = [
    { label: 'Dashboard', href: '/dashboard', icon: <Home size={20} /> },
    { label: 'Orders', href: '/orders', icon: <ShoppingCart size={20} />, badge: 12 },
    { label: 'Subscriptions', href: '/subscriptions', icon: <Repeat size={20} />, badge: 8 },
    { label: 'Catalog', href: '/catalog', icon: <Package size={20} /> },
    { label: 'Fulfillment', href: '/fulfillment', icon: <Zap size={20} /> },
    { label: 'Inventory', href: '/inventory', icon: <TrendingUp size={20} /> },
    { label: 'Analytics', href: '/reports', icon: <BarChart3 size={20} /> },
    { label: 'Customers', href: '/customers', icon: <Users size={20} />, badge: 45 },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-6 left-6 z-[999] md:hidden p-2 bg-primary text-white rounded-lg"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Backdrop */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/50 z-[99] md:hidden"
        />
      )}

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: isOpen ? 0 : -300 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed md:relative left-0 top-0 w-80 h-screen bg-white z-[100] md:z-auto overflow-y-auto border-r border-gray-200 md:translate-x-0"
      >
        <div className="p-6 space-y-8">
          {/* Supplier Profile Header */}
          <div className="space-y-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center text-white text-2xl font-black">
              {supplierName.charAt(0)}
            </div>
            <div>
              <h2 className="text-lg font-black text-text uppercase tracking-tight">{supplierName}</h2>
              <p className="text-xs font-bold text-text/60 mt-1">{supplierCategory}</p>
              <p className="text-xs font-bold text-text/40 mt-0.5">{supplierEmail}</p>
              <div className="flex items-center gap-1 mt-2">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className={i < Math.floor(supplierRating) ? 'text-amber-400' : 'text-gray-300'}>
                    ★
                  </span>
                ))}
                <span className="text-xs font-bold text-text/60 ml-1">{supplierRating}</span>
              </div>
            </div>
          </div>

          {/* Business Info */}
          <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
            <div className="flex items-start gap-3">
              <Building2 size={16} className="text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-[10px] font-bold text-text/60 uppercase">Business Type</p>
                <p className="text-sm font-bold text-text">Food & Beverage Supplier</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <FileText size={16} className="text-accent mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-[10px] font-bold text-text/60 uppercase">License Status</p>
                <p className="text-sm font-bold text-text">✓ Verified</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-2">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} onClick={() => setIsOpen(false)}>
                <motion.div
                  whileHover={{ x: 4 }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-black uppercase tracking-widest text-sm transition-all relative overflow-hidden group ${
                    isActive(item.href)
                      ? 'bg-primary text-white'
                      : 'text-text/60 hover:bg-gray-100'
                  }`}
                >
                  {isActive(item.href) && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute inset-0 bg-gradient-to-r from-primary to-accent -z-10"
                    />
                  )}
                  {item.icon}
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <span className="bg-accent text-white text-xs font-black w-6 h-6 rounded-full flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </motion.div>
              </Link>
            ))}
          </nav>

          {/* Divider */}
          <div className="h-px bg-gray-200" />

          {/* Settings & Logout */}
          <nav className="space-y-2">
            <Link href="/settings">
              <motion.div
                whileHover={{ x: 4 }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl font-black uppercase tracking-widest text-sm text-text/60 hover:bg-gray-100 transition-all"
              >
                <Settings size={20} />
                <span>Settings</span>
              </motion.div>
            </Link>
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-black uppercase tracking-widest text-sm text-red-600 hover:bg-red-50 transition-all"
            >
              <LogOut size={20} />
              <span>Log Out</span>
            </button>
          </nav>
        </div>
      </motion.aside>
    </>
  );
}