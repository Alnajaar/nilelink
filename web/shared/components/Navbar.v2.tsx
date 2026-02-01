'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../providers/FirebaseAuthProvider';

import {
  Search, Bell, Globe, User, Menu, X, ChevronDown,
  Home, ShoppingBag, Truck, Package, Users, TrendingUp,
  FileText, LogOut, Settings, Zap, BarChart3, ChevronRight
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<any>;
  description?: string;
  subItems?: NavItem[];
  roles?: string[]; // Only show for these roles
}

const navigationItems: NavItem[] = [
  {
    label: 'Home',
    href: '/',
    icon: Home,
    description: 'Main landing'
  },
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: BarChart3,
    description: 'Overview & Analytics',
    roles: ['ADMIN', 'OWNER']
  },
  {
    label: 'Marketplace',
    href: '/marketplace',
    icon: ShoppingBag,
    description: 'Browse & shop',
    subItems: [
      { label: 'Stores', href: '/marketplace/stores', icon: ShoppingBag },
      { label: 'Categories', href: '/marketplace/categories', icon: Package },
      { label: 'Deals', href: '/marketplace/deals', icon: Zap }
    ]
  },
  {
    label: 'POS',
    href: '/pos/dashboard',
    icon: Package,
    description: 'Point of Sale System',
    roles: ['ADMIN', 'OWNER', 'RESTAURANT_STAFF']
  },
  {
    label: 'Delivery',
    href: '/delivery/dashboard',
    icon: Truck,
    description: 'Logistics & Tracking',
    roles: ['ADMIN', 'DELIVERY_DRIVER']
  },
  {
    label: 'Suppliers',
    href: '/supplier/dashboard',
    icon: Users,
    description: 'Inventory & Fulfillment',
    roles: ['ADMIN', 'VENDOR']
  },
  {
    label: 'Investors',
    href: '/investor/dashboard',
    icon: TrendingUp,
    description: 'Growth Metrics',
    roles: ['ADMIN']
  },
  {
    label: 'Documentation',
    href: '/docs',
    icon: FileText,
    description: 'API & Guides'
  }
];

interface GlobalNavbarProps {
  variant?: 'default' | 'minimal' | 'transparent';
  context?: 'portal' | 'pos' | 'delivery' | 'supplier' | 'admin' | 'investor' | 'public';
}

export default function GlobalNavbar({ variant = 'default', context = 'public' }: GlobalNavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user: authUser, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const [localUser, setLocalUser] = useState<any>(null);

  // Use auth context user only after mount to avoid hydration mismatch
  const user = isMounted ? (authUser || localUser) : null;
  const isLoggedIn = isMounted && !!user;

  // Load user from localStorage on mount for immediate display
  useEffect(() => {
    setIsMounted(true);
    try {
      const storedUserJson = localStorage.getItem('nilelink_current_user');
      if (storedUserJson) {
        const storedUser = JSON.parse(storedUserJson);
        setLocalUser(storedUser);
      }
    } catch (e) {
      console.error('Failed to parse stored user:', e);
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Filter nav items based on user role
  const visibleItems = navigationItems.filter(item => {
    if (!item.roles) return true;
    if (!isLoggedIn) return !item.roles.length;
    return item.roles.includes(user?.role);
  });

  const bgClass = variant === 'transparent'
    ? 'bg-transparent'
    : scrolled
      ? 'bg-background-primary border-b border-border-medium shadow-2xl transition-all'
      : 'bg-background-primary/90 backdrop-blur-2xl border-b border-border-default transition-all';

  const logoColor = context === 'public' ? 'text-white' : 'text-blue-400';

  // Don't render until mounted to avoid hydration errors
  if (!isMounted) {
    return (
      <nav className="hidden md:block sticky top-0 z-40 w-full bg-background-primary/70 backdrop-blur-lg border-b border-border-default">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center">
              <div className="w-10 h-10 bg-primary/20 rounded-lg" />
            </Link>
            <div className="flex items-center gap-4">
              <div className="h-9 w-20 bg-background-secondary rounded-lg animate-pulse" />
              <div className="h-9 w-24 bg-primary/20 rounded-lg animate-pulse" />
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <>
      {/* Desktop Navbar */}
      <motion.nav
        className={`hidden md:block sticky top-0 z-40 w-full transition-all duration-300 ${bgClass}`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center group">
              <img
                src="/logo.png"
                alt="NileLink Logo"
                className="w-10 h-10 object-contain group-hover:scale-110 transition-transform duration-300"
              />
            </Link>

            {/* Center Navigation */}
            <div className="flex items-center gap-4">
              {visibleItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <div key={item.href} className="relative group">
                    <Link
                      href={item.href}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 text-sm font-bold uppercase tracking-widest ${pathname.startsWith(item.href)
                        ? 'text-primary bg-primary/10 shadow-glow-primary/5'
                        : 'text-text-secondary hover:text-white hover:bg-white/5'
                        }`}
                    >
                      <IconComponent className="w-4 h-4" />
                      <span className="hidden lg:inline">{item.label}</span>
                      {item.subItems && <ChevronDown className="w-3 h-3" />}
                    </Link>

                    {/* Submenu */}
                    {item.subItems && (
                      <AnimatePresence>
                        <motion.div
                          className="absolute left-0 mt-2 w-56 bg-slate-900/95 backdrop-blur-sm border border-slate-700/50 rounded-lg shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pt-2"
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                        >
                          <div className="p-2">
                            {item.subItems.map((subitem) => {
                              const SubIconComponent = subitem.icon;
                              return (
                                <Link
                                  key={subitem.href}
                                  href={subitem.href}
                                  className="flex items-center gap-3 px-4 py-2 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-slate-800/70 transition"
                                >
                                  <SubIconComponent className="w-4 h-4" />
                                  <span>{subitem.label}</span>
                                </Link>
                              );
                            })}
                          </div>
                        </motion.div>
                      </AnimatePresence>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="relative hidden lg:block">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-48 px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                  <Search className="absolute right-3 top-2.5 w-4 h-4 text-slate-500" />
                </div>
              </div>

              {/* Notifications */}
              <button className="relative p-2 hover:bg-slate-800/50 rounded-lg transition">
                <Bell className="w-5 h-5 text-slate-300 hover:text-white" />
                {unreadNotifications > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                )}
              </button>

              {/* Language */}
              <button className="p-2 hover:bg-slate-800/50 rounded-lg transition">
                <Globe className="w-5 h-5 text-slate-300 hover:text-white" />
              </button>

              {/* Profile / Login */}
              {isMounted && (isLoggedIn ? (
                <div className="relative group">
                  <button className="flex items-center gap-2 px-3 py-2 hover:bg-slate-800/50 rounded-lg transition">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-sm font-bold">
                      {user?.firstName?.charAt(0) || 'U'}
                    </div>
                  </button>
                  <motion.div
                    className="absolute right-0 mt-2 w-48 bg-slate-900/95 backdrop-blur-sm border border-slate-700/50 rounded-lg shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-2"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <div className="px-4 py-2 text-sm text-slate-400 border-b border-slate-700/30">
                      {user?.email || user?.firstName}
                    </div>
                    <Link href="/profile" className="flex items-center gap-3 px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800/70">
                      <User className="w-4 h-4" />
                      <span>Profile</span>
                    </Link>
                    <Link href="/settings" className="flex items-center gap-3 px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800/70">
                      <Settings className="w-4 h-4" />
                      <span>Settings</span>
                    </Link>
                    <hr className="my-2 border-slate-700/30" />
                    <button onClick={async () => {
                      await logout();
                      router.push('/login');
                    }} className="w-full flex items-center gap-3 px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800/70 text-left">
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </motion.div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link href="/login" className="px-4 py-2 text-slate-300 hover:text-white transition">
                    Login
                  </Link>
                  <Link href="/signup" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition">
                    Sign Up
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Navbar */}
      <motion.nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-md border-t border-slate-800/50">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Left: Logo */}
          <Link href="/" className="flex items-center gap-2">
            <img
              src="/logo.png"
              alt="NileLink Logo"
              className="w-8 h-8 object-contain"
            />
          </Link>

          {/* Center: Nav Icons */}
          <div className="flex gap-2">
            {visibleItems.slice(0, 5).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex-1 flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-xs transition ${pathname.startsWith(item.href)
                  ? 'text-blue-400 bg-blue-500/10'
                  : 'text-slate-400 hover:text-white'
                  }`}
              >
                <item.icon className="w-5 h-5" />
              </Link>
            ))}
          </div>

          {/* Right: Menu Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 hover:bg-slate-800/50 rounded-lg transition"
          >
            {mobileOpen ? (
              <X className="w-5 h-5 text-slate-300" />
            ) : (
              <Menu className="w-5 h-5 text-slate-300" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              className="absolute bottom-full left-0 right-0 bg-slate-900/95 border-t border-slate-800/50 max-h-64 overflow-y-auto"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
            >
              {visibleItems.map((item) => (
                <div key={item.href}>
                  <Link
                    href={item.href}
                    className="block px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-800/50 transition text-sm font-medium"
                  >
                    {item.label}
                  </Link>
                  {item.subItems && (
                    <div className="bg-slate-950/50">
                      {item.subItems.map((subitem) => (
                        <Link
                          key={subitem.href}
                          href={subitem.href}
                          className="block px-8 py-2 text-slate-400 hover:text-white hover:bg-slate-800/30 transition text-xs"
                        >
                          {subitem.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Mobile Spacing */}
      <div className="md:hidden h-20" />
    </>
  );
}
