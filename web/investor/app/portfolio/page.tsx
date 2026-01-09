"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp, TrendingDown, DollarSign, PieChart,
  Building, MapPin, Users, Calendar, Award,
  ArrowUpRight, ExternalLink, Filter, Search
} from 'lucide-react';
import PortfolioChart from '../components/PortfolioChart';
import { useAuth } from '../client-layout';

const Badge = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${className}`}>
    {children}
  </span>
);

const GlassCard = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <div className={`glass-v2 rounded-[2.5rem] p-8 card-shine ${className}`}>
    {children}
  </div>
);

export default function PortfolioPage() {
  const { isConnected } = useAuth();
  const [selectedInvestment, setSelectedInvestment] = useState<any>(null);

  // Mock portfolio data
  const portfolioData = {
    totalValue: 150000,
    totalInvested: 130000,
    totalReturns: 20000,
    assets: [
      {
        id: 1,
        name: 'NileBurgers Franchise Network',
        type: 'Restaurant Chain',
        location: 'Cairo, Egypt',
        investment: 50000,
        currentValue: 57500,
        roi: 15.0,
        status: 'Active',
        dividendYield: 8.5,
        nextDividend: '2024-02-15',
        description: 'Leading fast-casual burger chain with 12 locations across Cairo',
        metrics: {
          monthlyRevenue: 45000,
          customerSatisfaction: 4.6,
          employeeCount: 45,
          marketShare: 12.3
        },
        history: [
          { date: '2024-01-01', value: 50000 },
          { date: '2024-01-08', value: 51200 },
          { date: '2024-01-15', value: 52800 },
          { date: '2024-01-22', value: 55100 },
          { date: '2024-01-29', value: 57500 }
        ]
      },
      {
        id: 2,
        name: 'GreenLeaf Organic Catering',
        type: 'Catering Service',
        location: 'Dubai, UAE',
        investment: 35000,
        currentValue: 37870,
        roi: 8.2,
        status: 'Active',
        dividendYield: 6.8,
        nextDividend: '2024-02-20',
        description: 'Premium organic catering service for corporate events',
        metrics: {
          monthlyRevenue: 28000,
          customerSatisfaction: 4.8,
          employeeCount: 28,
          marketShare: 8.7
        },
        history: [
          { date: '2024-01-01', value: 35000 },
          { date: '2024-01-08', value: 35800 },
          { date: '2024-01-15', value: 36500 },
          { date: '2024-01-22', value: 37200 },
          { date: '2024-01-29', value: 37870 }
        ]
      },
      {
        id: 3,
        name: 'UrbanEats POS Technology',
        type: 'Technology Investment',
        location: 'Remote',
        investment: 25000,
        currentValue: 31500,
        roi: 26.0,
        status: 'Active',
        dividendYield: 12.2,
        nextDividend: '2024-02-01',
        description: 'AI-powered POS system for modern restaurants',
        metrics: {
          monthlyRevenue: 15000,
          customerSatisfaction: 4.9,
          activeUsers: 250,
          growthRate: 15.3
        },
        history: [
          { date: '2024-01-01', value: 25000 },
          { date: '2024-01-08', value: 26500 },
          { date: '2024-01-15', value: 28500 },
          { date: '2024-01-22', value: 29500 },
          { date: '2024-01-29', value: 31500 }
        ]
      },
      {
        id: 4,
        name: 'Mediterranean Grill Chain',
        type: 'Restaurant Chain',
        location: 'Riyadh, KSA',
        investment: 20000,
        currentValue: 21300,
        roi: 6.5,
        status: 'Active',
        dividendYield: 7.1,
        nextDividend: '2024-02-10',
        description: 'Authentic Mediterranean cuisine with 8 locations',
        metrics: {
          monthlyRevenue: 35000,
          customerSatisfaction: 4.4,
          employeeCount: 62,
          marketShare: 6.8
        },
        history: [
          { date: '2024-01-01', value: 20000 },
          { date: '2024-01-08', value: 20300 },
          { date: '2024-01-15', value: 20800 },
          { date: '2024-01-22', value: 21100 },
          { date: '2024-01-29', value: 21300 }
        ]
      }
    ]
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-8">
        <GlassCard className="max-w-md text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <PieChart size={32} className="text-primary" />
          </div>
          <h2 className="text-2xl font-black text-text mb-4">Portfolio Access Required</h2>
          <p className="text-text/60 mb-8">
            Connect your wallet to view your investment portfolio and detailed performance metrics.
          </p>
          <button
            onClick={() => window.location.href = '/'}
            className="w-full bg-primary text-background font-black uppercase tracking-widest py-4 rounded-xl hover:scale-105 transition-transform"
          >
            Connect Wallet
          </button>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-text mb-2">Investment Portfolio</h1>
          <p className="text-text/60">Detailed breakdown of your restaurant equity investments</p>
        </div>
        <div className="flex gap-3">
          <button className="px-6 py-3 bg-surface text-text font-black uppercase tracking-widest rounded-xl hover:bg-surface/80 transition-colors">
            Export Report
          </button>
          <button className="px-6 py-3 bg-primary text-background font-black uppercase tracking-widest rounded-xl hover:bg-primary/90 transition-colors">
            New Investment
          </button>
        </div>
      </div>

      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <GlassCard>
          <div className="text-center">
            <DollarSign size={32} className="text-primary mx-auto mb-4" />
            <h3 className="text-2xl font-black text-text mb-1">${portfolioData.totalValue.toLocaleString()}</h3>
            <p className="text-sm text-text/60 font-bold">Current Portfolio Value</p>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="text-center">
            <TrendingUp size={32} className="text-green-500 mx-auto mb-4" />
            <h3 className="text-2xl font-black text-green-500 mb-1">+${portfolioData.totalReturns.toLocaleString()}</h3>
            <p className="text-sm text-text/60 font-bold">Total Returns</p>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="text-center">
            <Award size={32} className="text-blue-500 mx-auto mb-4" />
            <h3 className="text-2xl font-black text-blue-500 mb-1">{portfolioData.assets.length}</h3>
            <p className="text-sm text-text/60 font-bold">Active Investments</p>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="text-center">
            <Calendar size={32} className="text-yellow-500 mx-auto mb-4" />
            <h3 className="text-2xl font-black text-yellow-500 mb-1">Feb 1</h3>
            <p className="text-sm text-text/60 font-bold">Next Dividend Payout</p>
          </div>
        </GlassCard>
      </div>

      {/* Investment List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {portfolioData.assets.map((asset) => (
          <motion.div
            key={asset.id}
            whileHover={{ scale: 1.02 }}
            className="glass-v2 rounded-[2.5rem] p-8 cursor-pointer hover:border-primary/50 transition-all"
            onClick={() => setSelectedInvestment(asset)}
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-black text-text mb-2">{asset.name}</h3>
                <div className="flex items-center gap-4 text-sm text-text/60 mb-3">
                  <div className="flex items-center gap-1">
                    <Building size={14} />
                    <span>{asset.type}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin size={14} />
                    <span>{asset.location}</span>
                  </div>
                </div>
              </div>
              <Badge className={asset.status === 'Active' ? 'bg-green-500 text-white' : 'bg-yellow-500 text-black'}>
                {asset.status}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <p className="text-sm font-bold text-text/60 mb-1">Invested</p>
                <p className="text-lg font-black text-text">${asset.investment.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm font-bold text-text/60 mb-1">Current Value</p>
                <p className="text-lg font-black text-green-500">${asset.currentValue.toLocaleString()}</p>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-sm font-bold text-text/60">ROI</p>
                  <p className="text-lg font-black text-green-500">+{asset.roi}%</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-text/60">Dividend Yield</p>
                  <p className="text-lg font-black text-blue-500">{asset.dividendYield}%</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-text/60">Next Dividend</p>
                <p className="text-sm font-black text-yellow-500">{asset.nextDividend}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Investment Detail Modal */}
      {selectedInvestment && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-background rounded-[3rem] max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-8 border-b border-white/10">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-3xl font-black text-text mb-2">{selectedInvestment.name}</h2>
                  <p className="text-text/60">{selectedInvestment.description}</p>
                </div>
                <button
                  onClick={() => setSelectedInvestment(null)}
                  className="text-text/60 hover:text-text"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-8 space-y-8">
              {/* Performance Chart */}
              <div>
                <h3 className="text-xl font-black text-text mb-6">Performance History</h3>
                <PortfolioChart data={selectedInvestment.history} />
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {Object.entries(selectedInvestment.metrics).map(([key, value]) => (
                  <div key={key} className="text-center p-4 bg-surface rounded-xl">
                    <p className="text-sm font-bold text-text/60 mb-1 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                    </p>
                    <p className="text-xl font-black text-text">
                      {typeof value === 'number' ? value.toLocaleString() : String(value)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Investment Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 bg-surface rounded-xl">
                  <h4 className="font-black text-text mb-4">Investment Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-text/60">Initial Investment</span>
                      <span className="font-bold text-text">${selectedInvestment.investment.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text/60">Current Value</span>
                      <span className="font-bold text-green-500">${selectedInvestment.currentValue.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text/60">Total Returns</span>
                      <span className="font-bold text-green-500">
                        ${(selectedInvestment.currentValue - selectedInvestment.investment).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-surface rounded-xl">
                  <h4 className="font-black text-text mb-4">Dividend Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-text/60">Annual Yield</span>
                      <span className="font-bold text-blue-500">{selectedInvestment.dividendYield}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text/60">Next Payout</span>
                      <span className="font-bold text-yellow-500">{selectedInvestment.nextDividend}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text/60">Monthly Income</span>
                      <span className="font-bold text-green-500">
                        ${(selectedInvestment.currentValue * selectedInvestment.dividendYield / 100 / 12).toFixed(0)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-surface rounded-xl">
                  <h4 className="font-black text-text mb-4">Risk Assessment</h4>
                  <div className="text-center">
                    <div className="text-4xl font-black text-green-500 mb-2">Low</div>
                    <p className="text-sm text-text/60">Stable performance with consistent returns</p>
                    <div className="mt-4 flex justify-center">
                      <Badge className="bg-green-500 text-white">Conservative Investment</Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-6 border-t border-white/10">
                <button className="flex-1 bg-primary text-background font-black uppercase tracking-widest py-4 rounded-xl hover:bg-primary/90 transition-colors">
                  Reinvest Dividends
                </button>
                <button className="flex-1 bg-surface text-text font-black uppercase tracking-widest py-4 rounded-xl hover:bg-surface/80 transition-colors">
                  View Full Report
                </button>
                <button className="px-8 bg-surface text-text font-black uppercase tracking-widest py-4 rounded-xl hover:bg-surface/80 transition-colors">
                  <ExternalLink size={20} />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}