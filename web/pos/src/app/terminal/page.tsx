"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  Plus, Search, Filter, CheckCircle2, Utensils, ShoppingBag,
  Truck, Star, ChefHat, Flame, Clock, DollarSign, Users,
  TrendingUp, AlertCircle, Zap, BarChart3, Package, Menu
} from 'lucide-react';

import { POSSideMenu } from '@/components/POSSideMenu';
import { usePOS } from '@/contexts/POSContext';
import { useAuth } from '@shared/providers/AuthProvider';
import { POS_ROLE, PERMISSION, getRoleLabel, getRoleColor } from '@/utils/permissions';
import { PermissionGuard, RoleGuard } from '@/components/PermissionGuard';
// import { restaurantApi } from '@/shared/utils/api';
import { Button } from '@/shared/components/Button';
import { Card } from '@/shared/components/Card';
import { Badge } from '@/shared/components/Badge';
import { CurrencyDisplay } from '@/shared/components/CurrencyDisplay';
import { OrderSummary } from '@/components/OrderSummary';
import { OfflineIndicator } from '@/components/OfflineIndicator';
import { useIntelligence } from '@shared/hooks/useIntelligence';
import { NeuralUpsellHUD } from '@shared/components/NeuralUpsellHUD';
import { IncomingOrderHUD } from '@/components/IncomingOrderHUD';

export default function AdvancedTerminal() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { branchId, isOnline, currentRole, hasPermission, restaurantId, engines } = usePOS();
  const [mounted, setMounted] = useState(false);
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Authentication redirect removed to allow Guest Mode
  // useEffect(() => {
  //   if (mounted && !authLoading && !user) {
  //     router.push('/auth/login');
  //   }
  // }, [user, authLoading, mounted, router]);

  // Sales State
  const [cart, setCart] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [menu, setMenu] = useState<any[]>([]);
  const [isLoadingMenu, setIsLoadingMenu] = useState(true);
  const [orderType, setOrderType] = useState<'dine-in' | 'takeaway' | 'delivery'>('dine-in');

  // Intelligence Integration
  const { data: intelligence, isAnalyzing: isAIAnalyzing, analyze: runIntelligence, reportOutcome } = useIntelligence();
  const lastAnalysisRef = useRef<number>(0);

  // Role-specific dashboard stats
  const [stats, setStats] = useState({
    todaySales: 0.00,
    ordersToday: 0,
    avgOrderValue: 0.00,
    pendingOrders: 0,
    activeKitchen: 0,
    cashOnHand: 0.00
  });

  const hardwareStatus = {
    paperLevel: 'HIGH',
    connection: 'ONLINE'
  };

  // Fetch menu / assets
  useEffect(() => {
    if (authLoading || !mounted) return;

    const loadBusinessAssets = async () => {
      setIsLoadingMenu(true);
      try {
        // Try to load real products if engine is ready
        if (engines.productEngine && restaurantId) {
          const products = await engines.productEngine.searchProducts({ businessId: restaurantId });
          if (products && products.length > 0) {
            setMenu(products.map(p => ({
              id: p.id,
              name: p.name,
              category: p.category || 'General',
              price: p.variants?.[0]?.price || 0,
              image: '📦'
            })));
          } else {
            // Fallback to defaults if no products found
            setMenu([
              { id: 1, name: 'Premium Coffee', category: 'Beverages', price: 4.50, image: '☕' },
              { id: 2, name: 'Espresso', category: 'Beverages', price: 3.00, image: '☕' },
              { id: 3, name: 'Croissant', category: 'Bakery', price: 3.50, image: '🥐' },
              { id: 4, name: 'Blueberry Muffin', category: 'Bakery', price: 4.00, image: '🧁' },
              { id: 5, name: 'Avocado Toast', category: 'Breakfast', price: 12.50, image: '🥑' },
            ]);
          }
        }
      } catch (error) {
        console.error('Failed to load menu:', error);
      } finally {
        setIsLoadingMenu(false);
      }
    };

    loadBusinessAssets();
  }, [user, authLoading, mounted, engines, restaurantId]);

  const categories = ['All', ...Array.from(new Set(menu.map((m: any) => m.category)))];

  const filteredMenu = menu.filter(item => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const addToCart = (item: any) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { ...item, qty: 1 }];
    });
  };

  // Trigger AI Intelligence on cart changes (debounced)
  useEffect(() => {
    if (cart.length === 0) return;

    const timer = setTimeout(() => {
      const total = cart.reduce((acc, item) => acc + item.price * item.qty, 0);
      runIntelligence({
        amount: total,
        currency: 'USD',
        userId: user?.id || 'anonymous',
        userAgeDays: 0,
        txnHistoryCount: 0,
        ipCountry: 'Local',
        billingCountry: 'Local',
        items: cart
      }, {
        role: 'vendor',
        system_state: 'pos',
        urgency_level: 8,
        emotional_signals: hardwareStatus.paperLevel === 'LOW' ? ['operational_stress'] : [],
      } as any);
    }, 1000);

    return () => clearTimeout(timer);
  }, [cart, user, runIntelligence]);

  // Handle high-risk transaction guard
  const executeSecurePayment = async (method: string) => {
    if (intelligence?.data?.decision === 'REJECT') {
      alert(`🚨 SECURITY PROTOCOL: This transaction has been REJECTED by the Risk Agent. Reason: ${intelligence.data.concerns[0]}`);
      return;
    }

    if (intelligence?.data?.risk_level === 'HIGH') {
      const confirmed = window.confirm(`⚠️ HIGH RISK DETECTED: ${intelligence.data.concerns[0]}. Proceed with Manager Override?`);
      if (!confirmed) return;
    }

    handleCheckout(method);
    if (intelligence?.request_id) {
      reportOutcome(intelligence.request_id, 'SUCCESS');
    }
  };
  const updateCartQty = (itemId: number | string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === itemId) {
        const newQty = Math.max(0, item.qty + delta);
        return { ...item, qty: newQty };
      }
      return item;
    }).filter(item => item.qty > 0));
  };

  const clearCart = () => setCart([]);

  const handleCheckout = (method: string) => {
    router.push('/terminal/payment');
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="h-screen flex flex-col bg-[#020408] text-white overflow-hidden relative selection:bg-pos-accent/20">
      {/* Ultra-Premium Header */}
      <div className="h-20 bg-pos-bg-primary/40 backdrop-blur-2xl border-b border-pos-border-subtle flex items-center justify-between px-8 shrink-0 relative z-30">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.1, rotate: 5 }}
              onClick={() => setIsSideMenuOpen(true)}
              className="w-12 h-12 bg-pos-accent rounded-2xl flex items-center justify-center text-black shadow-2xl shadow-pos-accent/20 cursor-pointer"
            >
              <Menu size={24} />
            </motion.button>
            <div>
              <h1 className="text-xl font-black text-white leading-none tracking-tighter uppercase italic">
                {user?.businessName || 'Guest Terminal'}
              </h1>
              <p className="text-[9px] font-black text-pos-accent uppercase tracking-[0.3em] mt-1.5 opacity-60">
                {user ? `${user.firstName} ${user.lastName} • Root Administrator` : 'Guest Operator • Demo Mode'}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats Bar */}
        <div className="flex items-center gap-8">
          <div className="flex flex-col items-end">
            <span className="text-[8px] font-black text-pos-text-muted uppercase tracking-widest opacity-40 mb-1">Session Volume</span>
            <div className="flex items-center gap-2">
              <TrendingUp size={14} className="text-success" />
              <span className="font-black text-white text-sm tracking-tight">${stats.todaySales.toLocaleString()}</span>
            </div>
          </div>

          <div className="h-10 w-[1px] bg-pos-border-subtle" />
          <OfflineIndicator />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col overflow-hidden bg-pos-bg-secondary/10 relative z-10 text-white">
          {/* Search & Filter Bar */}
          <div className="px-8 py-6 bg-pos-bg-primary/40 backdrop-blur-xl border-b border-pos-border-subtle shrink-0">
            <div className="flex gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-pos-text-muted opacity-40" size={18} />
                <input
                  type="text"
                  placeholder="Search Protocol Inventory..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-16 pl-14 pr-6 bg-pos-bg-secondary/30 border border-pos-border-subtle rounded-3xl focus:outline-none focus:border-pos-accent text-sm font-black uppercase tracking-widest placeholder:text-pos-text-muted/30 transition-all"
                />
              </div>
            </div>

            {/* Category Pills */}
            <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap transition-all ${selectedCategory === cat
                    ? 'bg-pos-accent text-black shadow-[0_0_20px_rgba(34,211,238,0.3)]'
                    : 'bg-pos-bg-secondary/50 text-pos-text-muted hover:bg-pos-bg-tertiary border border-pos-border-subtle'
                    }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Product Grid */}
          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {filteredMenu.map((item) => (
                <motion.button
                  key={item.id}
                  onClick={() => addToCart(item)}
                  whileHover={{ y: -5, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-pos-bg-secondary/30 border border-pos-border-subtle rounded-[2.5rem] p-6 text-left hover:border-pos-accent/50 transition-all group flex flex-col justify-between"
                >
                  <div className="text-4xl mb-4 grayscale group-hover:grayscale-0 transition-all">{item.image}</div>
                  <div>
                    <h4 className="font-black text-white text-[10px] uppercase tracking-widest leading-tight mb-2">{item.name}</h4>
                    <div className="flex items-center justify-between">
                      <span className="font-black text-pos-accent text-sm italic tracking-tighter">${item.price}</span>
                      <div className="w-10 h-10 rounded-2xl bg-white/5 group-hover:bg-pos-accent group-hover:text-black transition-all flex items-center justify-center">
                        <Plus size={20} />
                      </div>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        {/* Cart Panel */}
        <div className="w-[450px] bg-pos-bg-primary border-l border-pos-border-subtle flex flex-col relative z-20">
          <div className="p-10 border-b border-pos-border-subtle">
            <h3 className="text-2xl font-black text-white uppercase tracking-tighter italic mb-8">Active Manifest</h3>
            <div className="flex gap-3">
              {(['dine-in', 'takeaway', 'delivery'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setOrderType(type)}
                  className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border ${orderType === type
                    ? 'bg-pos-accent text-black border-pos-accent shadow-lg shadow-pos-accent/20'
                    : 'bg-pos-bg-secondary text-pos-text-muted border-pos-border-subtle hover:bg-pos-bg-tertiary'
                    }`}
                >
                  {type.replace('-', ' ')}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-10 custom-scrollbar bg-black/20">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-20">
                <ShoppingBag size={48} className="mb-6" />
                <p className="text-[10px] font-black uppercase tracking-[0.5em]">Inventory Empty</p>
              </div>
            ) : (
              <div className="space-y-4">
                <AnimatePresence>
                  {cart.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="flex items-center gap-6 p-6 bg-pos-bg-secondary/50 rounded-[2rem] border border-pos-border-subtle group"
                    >
                      <div className="text-3xl grayscale group-hover:grayscale-0 transition-all">{item.image}</div>
                      <div className="flex-1 min-w-0">
                        <h5 className="font-black text-white text-[10px] uppercase tracking-widest truncate">{item.name}</h5>
                        <p className="font-black text-pos-accent text-xs italic">${item.price}</p>
                      </div>
                      <div className="flex items-center gap-4 bg-black/40 p-1.5 rounded-2xl">
                        <button onClick={() => updateCartQty(item.id, -1)} className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 text-white">-</button>
                        <span className="text-xs font-black">{item.qty}</span>
                        <button onClick={() => updateCartQty(item.id, 1)} className="w-8 h-8 rounded-xl bg-pos-accent text-black flex items-center justify-center shadow-lg">+</button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>

          {cart.length > 0 && (
            <div className="p-10 border-t border-pos-border-subtle bg-pos-bg-primary/80 backdrop-blur-xl">
              <NeuralUpsellHUD data={intelligence} isAnalyzing={isAIAnalyzing} />

              <div className="mt-8 space-y-6">
                <div className="flex justify-between items-center text-pos-text-muted">
                  <span className="text-[10px] font-black uppercase tracking-widest">Protocol Ledger Fee</span>
                  <span className="font-black text-sm italic">$0.00</span>
                </div>
                <div className="bg-pos-bg-secondary/50 p-8 rounded-[2.5rem] flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-[8px] font-black text-pos-accent uppercase tracking-widest mb-1">Total Settlement</span>
                    <span className="text-3xl font-black italic tracking-tighter uppercase leading-none">Net Value</span>
                  </div>
                  <span className="text-4xl font-black text-pos-accent italic tracking-tighter">
                    ${cart.reduce((acc, item) => acc + item.price * item.qty, 0).toFixed(2)}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Button onClick={clearCart} variant="outline" className="h-20 rounded-3xl font-black uppercase text-[10px] tracking-widest opacity-40 hover:opacity-100">Void Manifest</Button>
                  <Button onClick={() => executeSecurePayment('cash')} className="h-20 bg-pos-accent text-black font-black uppercase text-[10px] tracking-widest rounded-3xl shadow-xl shadow-pos-accent/20">Execute</Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <IncomingOrderHUD />
      <POSSideMenu isOpen={isSideMenuOpen} onClose={() => setIsSideMenuOpen(false)} />
    </div>
  );
}
