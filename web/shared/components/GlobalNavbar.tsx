'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useWallet } from '@shared/hooks/useWallet';
// Icons (using Lucide React icons)
import {
  Search,
  Globe,
  User,
  Menu,
  X,
  ChevronDown,
  Home,
  ShoppingBag,
  Truck,
  Package,
  Users,
  TrendingUp,
  FileText,
  LogIn,
  UserPlus,
  LayoutDashboard,
  Star,
  Brain,
  MessageCircle,
  HelpCircle,
  Monitor,
  Settings
  , Fingerprint
} from 'lucide-react';
import { ImperialNavigator } from './ImperialNavigator';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<any>;
  description?: string;
  subItems?: NavItem[];
}

const navigationItems: NavItem[] = [
  {
    label: 'Home',
    href: '/',
    icon: Home,
    description: 'Main landing page'
  },
  {
    label: 'Search',
    href: '/search',
    icon: Search,
    description: 'Advanced restaurant search'
  },
  {
    label: 'Marketplace',
    href: '/marketplace',
    icon: ShoppingBag,
    description: 'Browse restaurants and orders',
    subItems: [
      {
        label: 'Restaurants',
        href: '/restaurants',
        icon: Users,
        description: 'Browse all restaurants'
      },
      {
        label: 'Shop',
        href: '/shop',
        icon: ShoppingBag,
        description: 'Browse products by category'
      },
      {
        label: 'Cart',
        href: '/cart',
        icon: Package,
        description: 'View your shopping cart'
      }
    ]
  },
  {
    label: 'Orders',
    href: '/orders',
    icon: Package,
    description: 'Track your orders',
    subItems: [
      {
        label: 'Current Orders',
        href: '/orders',
        icon: Package,
        description: 'Active orders'
      },
      {
        label: 'Order History',
        href: '/history',
        icon: TrendingUp,
        description: 'Past orders'
      },
      {
        label: 'Track Order',
        href: '/track',
        icon: Truck,
        description: 'Real-time order tracking'
      }
    ]
  },
  {
    label: 'Loyalty',
    href: '/loyalty',
    icon: Star,
    description: 'Points and rewards program'
  },
  {
    label: 'AI Support',
    href: '/ai-support',
    icon: Brain,
    description: 'Advanced AI assistant'
  },
  {
    label: 'Support',
    href: '/support',
    icon: MessageCircle,
    description: 'Customer support & help',
    subItems: [
      {
        label: 'Live Chat',
        href: '/support',
        icon: MessageCircle,
        description: 'Human support team'
      },
      {
        label: 'Help Center',
        href: '/help',
        icon: HelpCircle,
        description: 'FAQ and guides'
      }
    ]
  },
  {
    label: 'POS',
    href: '/terminal',
    icon: Monitor,
    description: 'Elite Terminal Interface'
  },
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    description: 'Mission Control & Analytics'
  },
  {
    label: 'Settings',
    href: '/settings',
    icon: Settings,
    description: 'System Configuration'
  },
  {
    label: 'Pricing',
    href: '/pricing',
    icon: TrendingUp,
    description: 'Protocol Tiers & Economics'
  },
  {
    label: 'About Us',
    href: '/about',
    icon: Globe,
    description: 'Our Ethos & Mission'
  },
  {
    label: 'Docs',
    href: 'https://docs.nilelink.app',
    icon: FileText,
    description: 'Protocol Documentation'
  }
];

interface GlobalNavbarProps {
  variant?: 'default' | 'minimal' | 'transparent';
  showSearch?: boolean;
  context?: 'portal' | 'pos' | 'delivery' | 'supplier' | 'admin' | 'investor';
}

export default function GlobalNavbar({
  variant = 'default',
  showSearch = false,
  context = 'default',
}: GlobalNavbarProps) {
  const pathname = usePathname();
  const { address, isConnected, isConnecting, connect, disconnect } = useWallet();
  const [isNavigatorOpen, setIsNavigatorOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  // Context-aware navigation filtering
  const getContextualNav = () => {
    switch (context) {
      case 'pos':
        return navigationItems.filter(item =>
          ['Pricing', 'About Us', 'Docs'].includes(item.label)
        );
      case 'delivery':
        return navigationItems.filter(item =>
          ['Delivery', 'Marketplace', 'Docs'].includes(item.label)
        );
      case 'supplier':
        return navigationItems.filter(item =>
          ['Suppliers', 'POS', 'Marketplace', 'Docs'].includes(item.label)
        );
      case 'admin':
        return navigationItems.filter(item =>
          ['Home', 'POS', 'Delivery', 'Suppliers', 'Investors', 'Docs'].includes(item.label)
        );
      case 'investor':
        return navigationItems.filter(item =>
          ['Investors', 'Home', 'Docs'].includes(item.label)
        );
      case 'portal': // Customer app
        return navigationItems.filter(item =>
          ['Home', 'Search', 'Marketplace', 'Orders', 'Loyalty', 'AI Support', 'Support'].includes(item.label)
        );
      default:
        return navigationItems;
    }
  };

  const contextualNav = getContextualNav();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    // Only add listener on client side to prevent hydration mismatch
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const navbarClasses = `fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${variant === 'transparent'
    ? 'bg-transparent'
    : context === 'pos'
      ? `${isScrolled ? 'bg-[#02050a]/90 backdrop-blur-md border-b border-white/5 shadow-2xl' : 'bg-transparent border-b border-transparent'}`
      : isScrolled || variant === 'minimal'
        ? 'bg-background-primary/80 backdrop-blur-2xl border-b-2 border-border-subtle'
        : 'bg-background-primary/80 backdrop-blur-2xl border-b-2 border-border-subtle/50'
    }`;

  return (
    <>
      {/* Desktop Navbar */}
      <motion.nav
        className={navbarClasses}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3 }}
        suppressHydrationWarning
      >
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Left: Logo & Navigator Toggle */}
            <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-6 flex-shrink-0">
              <div className="flex items-center space-x-1.5 sm:space-x-2 lg:space-x-4">
                <Link href="/" className="flex items-center space-x-1.5 sm:space-x-2 group flex-shrink-0">
                  <img
                    src="/shared/assets/logo/logo-icon.ico"
                    alt="NileLink Logo"
                    className="w-6 h-6 sm:w-7 lg:w-8 sm:h-7 lg:h-8 group-hover:scale-105 transition-transform flex-shrink-0 rounded-full object-cover border border-white/10"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const fallback = document.createElement('div');
                      fallback.className = 'w-6 h-6 sm:w-7 lg:w-8 sm:h-7 lg:h-8 bg-gradient-accent rounded-full flex items-center justify-center group-hover:scale-105 transition-transform shadow-[0_0_15px_rgba(255,214,102,0.3)]';
                      fallback.innerHTML = '<span class="text-white font-bold text-xs sm:text-sm">NL</span>';
                      target.parentNode?.appendChild(fallback);
                    }}
                  />

                </Link>
              </div>

              <button
                onClick={() => setIsNavigatorOpen(true)}
                className="hidden sm:flex items-center gap-1.5 px-2 sm:px-3 py-1.5 bg-bg-tertiary border border-border-subtle rounded-lg text-text-secondary hover:text-accent hover:border-accent/30 transition-all group flex-shrink-0"
              >
                <LayoutDashboard size={14} className="group-hover:rotate-12 transition-transform flex-shrink-0" />
                <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest whitespace-nowrap">Switch</span>
              </button>

              <button
                onClick={() => setIsNavigatorOpen(true)}
                className="sm:hidden p-2 text-text-secondary hover:text-accent hover:bg-bg-tertiary rounded-lg transition-colors flex-shrink-0"
              >
                <LayoutDashboard size={18} />
              </button>
            </div>

            {/* Center: Navigation */}
            <div className="hidden md:flex items-center space-x-0.5 flex-1 justify-center px-2 lg:px-0">
              {contextualNav.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);

                return (
                  <div key={item.label} className="relative">
                    <Link
                      href={item.href}
                      className={`
                        flex items-center justify-center lg:justify-start space-x-0.5 lg:space-x-2 px-1.5 lg:px-3 py-2 rounded-lg text-xs lg:text-sm font-medium
                        transition-all duration-200 group whitespace-nowrap
                        ${active
                          ? 'text-accent bg-accent/10'
                          : 'text-text-secondary hover:text-text-primary hover:bg-bg-tertiary'
                        }
                      `}
                      onMouseEnter={() => item.subItems && setActiveSubmenu(item.label)}
                      onMouseLeave={() => setActiveSubmenu(null)}
                      title={item.label}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span className="hidden lg:inline">{item.label}</span>
                      {item.subItems && (
                        <ChevronDown className="w-3 h-3 group-hover:rotate-180 transition-transform hidden lg:inline flex-shrink-0" />
                      )}
                    </Link>

                    {/* Submenu */}
                    <AnimatePresence>
                      {activeSubmenu === item.label && item.subItems && (
                        <motion.div
                          className="absolute top-full left-0 mt-2 w-52 lg:w-64 bg-background-secondary/95 backdrop-blur-xl rounded-xl border border-border-subtle shadow-xl overflow-hidden z-50"
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                        >
                          {item.subItems.map((subItem) => {
                            const SubIcon = subItem.icon;
                            return (
                              <Link
                                key={subItem.label}
                                href={subItem.href}
                                className="flex items-center space-x-2 px-3 lg:px-4 py-2 lg:py-3 hover:bg-bg-tertiary transition-colors group text-sm"
                              >
                                <SubIcon className="w-4 h-4 text-accent flex-shrink-0" />
                                <div className="min-w-0">
                                  <div className="text-text-primary font-medium text-xs lg:text-sm truncate">
                                    {subItem.label}
                                  </div>
                                  {subItem.description && (
                                    <div className="text-text-tertiary text-xs hidden lg:block truncate">
                                      {subItem.description}
                                    </div>
                                  )}
                                </div>
                              </Link>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>

            {/* Right: Actions */}
            <div className="flex items-center space-x-0.5 sm:space-x-1 lg:space-x-2 flex-shrink-0">

              {/* Search - Desktop only */}
              {showSearch && (
                <div className="hidden lg:block relative">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-tertiary flex-shrink-0" />
                    <input
                      type="text"
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-48 lg:w-56 pl-10 pr-4 py-2 bg-bg-tertiary/50 border border-border-subtle rounded-lg text-text-primary text-sm placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              )}

              {/* Notifications - Disabled until real service connected */}
              {/* <button className="p-2 text-text-secondary hover:text-text-primary hover:bg-bg-tertiary rounded-lg transition-colors relative flex-shrink-0">
                <Bell className="w-5 h-5" />
              </button> */}



              <Link
                href="/onboarding"
                className="flex items-center space-x-2 px-6 py-2.5 bg-accent text-white hover:bg-accent/90 rounded-lg transition-all text-sm font-black uppercase tracking-[0.1em] shadow-[0_4px_20px_rgba(34,211,238,0.2)] flex-shrink-0"
              >
                <UserPlus className="w-4 h-4" />
                <span>Get Started</span>
              </Link>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 text-text-secondary hover:text-text-primary hover:bg-bg-tertiary rounded-lg transition-colors flex-shrink-0"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div suppressHydrationWarning>
            <motion.div
              className="fixed inset-0 z-40 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
              <motion.div
                className="absolute top-16 left-0 right-0 bg-background-secondary/95 backdrop-blur-xl border-b border-border-subtle max-h-[calc(100vh-64px)] overflow-y-auto"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="px-4 py-4 space-y-3">

                  {/* Mobile Search */}
                  {showSearch && (
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-tertiary" />
                      <input
                        type="text"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-bg-tertiary/50 border border-border-subtle rounded-lg text-text-primary text-sm placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent"
                      />
                    </div>
                  )}

                  {/* Mobile Navigation */}
                  <div className="space-y-1">
                    {contextualNav.map((item) => {
                      const Icon = item.icon;
                      const active = isActive(item.href);

                      return (
                        <Link
                          key={item.label}
                          href={item.href}
                          className={`
                          flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-colors text-sm
                          ${active
                              ? 'bg-accent/10 text-accent'
                              : 'text-text-secondary hover:text-text-primary hover:bg-bg-tertiary'
                            }
                        `}
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <Icon className="w-5 h-5 flex-shrink-0" />
                          <span className="font-medium">{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>

                  {/* Mobile Wallet + Auth */}
                  <div className="border-t border-border-subtle pt-3 space-y-2">
                    {!isConnected ? (
                    <button
                      onClick={() => { connect('metamask'); setIsMobileMenuOpen(false); }}
                      disabled={isConnecting}
                      className="flex items-center justify-center space-x-2 w-full py-2.5 bg-accent/10 text-accent hover:bg-accent/20 rounded-lg transition-colors text-sm font-medium disabled:opacity-50"
                    >
                      <Fingerprint className="w-4 h-4" />
                      <span>{isConnecting ? 'Anchoring...' : 'Identity Anchor'}</span>
                    </button>
                    ) : (
                    <button
                      onClick={() => { disconnect(); setIsMobileMenuOpen(false); }}
                      className="flex items-center justify-center space-x-2 w-full py-2.5 bg-success/10 text-success hover:bg-success/20 rounded-lg transition-colors text-sm font-medium"
                    >
                      <Fingerprint className="w-4 h-4" />
                      <span className="font-mono text-xs">Node ID: {address?.slice(0, 8)}</span>
                    </button>
                    )}

                    <Link
                      href="/auth/login"
                      className="flex items-center justify-center space-x-2 w-full py-2.5 text-text-secondary hover:text-text-primary hover:bg-bg-tertiary rounded-lg transition-colors text-sm"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <LogIn className="w-4 h-4" />
                      <span>Login</span>
                    </Link>

                    <Link
                      href="/onboarding"
                      className="flex items-center justify-center space-x-2 w-full py-2.5 bg-accent text-white hover:bg-accent/90 rounded-lg transition-colors text-sm font-medium"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>Get Started</span>
                    </Link>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Bottom Navigation for Mobile (when scrolled) */}
      {isScrolled && (
        <motion.div
          className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-background-secondary/95 backdrop-blur-xl border-t border-border-subtle"
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.3 }}
          suppressHydrationWarning
        >
          <div className="flex items-center justify-around py-2 px-2">
            {(context === 'portal'
              ? [
                navigationItems.find(item => item.label === 'Home'),
                navigationItems.find(item => item.label === 'Search'),
                navigationItems.find(item => item.label === 'Orders'),
                navigationItems.find(item => item.label === 'Loyalty'),
                navigationItems.find(item => item.label === 'Support')
              ].filter((item): item is typeof item & { icon: any; label: string; href: string } => Boolean(item)).slice(0, 5)
              : contextualNav.slice(0, 5)
            ).map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`
                    flex flex-col items-center space-y-1 p-2 rounded-lg transition-colors flex-1 justify-center
                    ${active ? 'text-accent' : 'text-text-secondary hover:text-text-primary'}
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs text-center leading-tight truncate">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </motion.div>
      )}
      <ImperialNavigator
        isOpen={isNavigatorOpen}
        onClose={() => setIsNavigatorOpen(false)}
      />
    </>
  );
}