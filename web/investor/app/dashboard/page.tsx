"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp, TrendingDown, DollarSign, PieChart,
  BarChart3, Activity, Calendar, Target, Award,
  ArrowUpRight, ArrowDownRight, Clock, Users
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

export default function InvestorDashboard() {
  const { isConnected } = useAuth();
  const [activeTab, setActiveTab] = useState('Overview');

  // Mock data for dashboard
  const dashboardData = {
    totalValue: 150000,
    dailyChange: 2.34,
    weeklyChange: 8.72,
    monthlyChange: 12.45,
    totalInvestments: 5,
    activeInvestments: 4,
    totalReturns: 18750,
    upcomingDividends: 1250.50,
    performanceData: [
      { date: '2024-01-01', value: 120000 },
      { date: '2024-01-08', value: 128000 },
      { date: '2024-01-15', value: 135000 },
      { date: '2024-01-22', value: 142000 },
      { date: '2024-01-29', value: 150000 }
    ],
    recentInvestments: [
      { id: 1, name: 'NileBurgers Franchise', amount: 50000, status: 'Active', roi: 12.5, nextDividend: '2024-02-15' },
      { id: 2, name: 'GreenLeaf Catering Co.', amount: 35000, status: 'Active', roi: 8.9, nextDividend: '2024-02-20' },
      { id: 3, name: 'UrbanEats POS Network', amount: 25000, status: 'Pending', roi: 15.2, nextDividend: '2024-03-01' },
      { id: 4, name: 'Mediterranean Grill', amount: 40000, status: 'Active', roi: 10.3, nextDividend: '2024-02-10' }
    ],
    portfolioAllocation: [
      { sector: 'Restaurant Chains', percentage: 45, color: 'bg-blue-500' },
      { sector: 'Catering Services', percentage: 30, color: 'bg-green-500' },
      { sector: 'Food Technology', percentage: 15, color: 'bg-purple-500' },
      { sector: 'Beverage Brands', percentage: 10, color: 'bg-orange-500' }
    ]
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-8">
        <GlassCard className="max-w-md text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Users size={32} className="text-primary" />
          </div>
          <h2 className="text-2xl font-black text-text mb-4">Connect Your Wallet</h2>
          <p className="text-text/60 mb-8">
            Connect your Web3 wallet to access your investment dashboard and track your portfolio performance.
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
          <h1 className="text-4xl font-black text-text mb-2">Investment Dashboard</h1>
          <p className="text-text/60">Monitor your restaurant equity investments and returns</p>
        </div>
        <div className="flex gap-3">
          <Badge className="bg-primary text-background">Live Market Data</Badge>
          <Badge className="bg-green-500 text-white">All Systems Operational</Badge>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <GlassCard>
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">Total Portfolio Value</p>
              <h3 className="text-3xl font-black text-text">${dashboardData.totalValue.toLocaleString()}</h3>
            </div>
            <div className="p-3 bg-primary/10 rounded-xl">
              <DollarSign size={24} className="text-primary" />
            </div>
          </div>
          <div className="flex items-center gap-2 text-green-500">
            <ArrowUpRight size={16} />
            <span className="text-sm font-bold">+${(dashboardData.totalValue * dashboardData.dailyChange / 100).toFixed(0)} ({dashboardData.dailyChange}%)</span>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">Total Returns</p>
              <h3 className="text-3xl font-black text-text">${dashboardData.totalReturns.toLocaleString()}</h3>
            </div>
            <div className="p-3 bg-green-500/10 rounded-xl">
              <TrendingUp size={24} className="text-green-500" />
            </div>
          </div>
          <div className="flex items-center gap-2 text-green-500">
            <Target size={14} />
            <span className="text-sm font-bold">{((dashboardData.totalReturns / dashboardData.totalValue) * 100).toFixed(1)}% of portfolio</span>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">Active Investments</p>
              <h3 className="text-3xl font-black text-text">{dashboardData.activeInvestments}</h3>
              <p className="text-xs text-text/60">of {dashboardData.totalInvestments} total</p>
            </div>
            <div className="p-3 bg-blue-500/10 rounded-xl">
              <Activity size={24} className="text-blue-500" />
            </div>
          </div>
          <div className="w-full bg-surface rounded-full h-2 mt-4">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-1000"
              style={{ width: `${(dashboardData.activeInvestments / dashboardData.totalInvestments) * 100}%` }}
            />
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">Upcoming Dividends</p>
              <h3 className="text-3xl font-black text-text">${dashboardData.upcomingDividends.toFixed(0)}</h3>
            </div>
            <div className="p-3 bg-yellow-500/10 rounded-xl">
              <Calendar size={24} className="text-yellow-500" />
            </div>
          </div>
          <div className="flex items-center gap-2 text-yellow-500">
            <Clock size={14} />
            <span className="text-sm font-bold">Next payout in 7 days</span>
          </div>
        </GlassCard>
      </div>

      {/* Chart & Allocation */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2">
          <GlassCard>
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-text">Portfolio Performance</h3>
              <div className="flex gap-2">
                <Badge className="bg-primary text-background">30 Days</Badge>
                <Badge className="bg-surface text-text">90 Days</Badge>
                <Badge className="bg-surface text-text">1 Year</Badge>
              </div>
            </div>
            <PortfolioChart data={dashboardData.performanceData} />
            <div className="flex justify-between items-center mt-6 pt-6 border-t border-white/10">
              <div>
                <p className="text-sm font-bold text-text/60">Monthly Growth</p>
                <p className="text-2xl font-black text-green-500">+{dashboardData.monthlyChange}%</p>
              </div>
              <div>
                <p className="text-sm font-bold text-text/60">Weekly Growth</p>
                <p className="text-2xl font-black text-blue-500">+{dashboardData.weeklyChange}%</p>
              </div>
              <div>
                <p className="text-sm font-bold text-text/60">Best Performer</p>
                <p className="text-lg font-black text-text">UrbanEats POS</p>
              </div>
            </div>
          </GlassCard>
        </div>

        <div>
          <GlassCard>
            <h3 className="text-xl font-black text-text mb-6">Portfolio Allocation</h3>
            <div className="space-y-4">
              {dashboardData.portfolioAllocation.map((sector, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full ${sector.color}`} />
                    <span className="text-sm font-bold text-text">{sector.sector}</span>
                  </div>
                  <span className="text-sm font-mono font-bold text-text">{sector.percentage}%</span>
                </div>
              ))}
            </div>
            <div className="mt-8 p-4 bg-primary/10 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Award size={16} className="text-primary" />
                <span className="text-sm font-bold text-text">Diversification Score</span>
              </div>
              <div className="text-2xl font-black text-primary">8.7/10</div>
              <p className="text-xs text-text/60 mt-1">Well-balanced across food sectors</p>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Recent Investments */}
      <GlassCard>
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-black text-text">Recent Investments</h3>
          <button className="text-primary hover:text-primary/80 font-bold text-sm flex items-center gap-2">
            View All <ArrowUpRight size={16} />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {dashboardData.recentInvestments.map((investment) => (
            <div key={investment.id} className="p-6 bg-white/5 rounded-xl border border-white/10 hover:border-primary/50 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-black text-text mb-1">{investment.name}</h4>
                  <Badge className={investment.status === 'Active' ? 'bg-green-500 text-white' : 'bg-yellow-500 text-black'}>
                    {investment.status}
                  </Badge>
                </div>
                <div className="text-right">
                  <p className="text-lg font-black text-text">${investment.amount.toLocaleString()}</p>
                  <p className="text-sm text-green-500 font-bold">+{investment.roi}% ROI</p>
                </div>
              </div>
              <div className="flex justify-between items-center text-sm text-text/60">
                <span>Next dividend: {investment.nextDividend}</span>
                <button className="text-primary hover:text-primary/80 font-bold">View Details</button>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}