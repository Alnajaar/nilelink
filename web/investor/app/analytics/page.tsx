"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3, TrendingUp, TrendingDown, PieChart,
  Calendar, Download, Filter, RefreshCw,
  Target, Award, Zap, Users, Shield
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

export default function AnalyticsPage() {
  const { isConnected } = useAuth();
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState('performance');

  // Mock analytics data
  const analyticsData = {
    overview: {
      totalReturn: 18750,
      winRate: 87.5,
      avgMonthlyReturn: 1450,
      bestPerformer: 'UrbanEats POS',
      riskScore: 3.2,
      sharpeRatio: 1.8
    },
    performance: [
      { month: 'Jan', return: 1200, benchmark: 800 },
      { month: 'Feb', return: 1800, benchmark: 950 },
      { month: 'Mar', return: 2100, benchmark: 1100 },
      { month: 'Apr', return: 1600, benchmark: 1200 },
      { month: 'May', return: 2400, benchmark: 1300 },
      { month: 'Jun', return: 1900, benchmark: 1400 }
    ],
    sectorPerformance: [
      { sector: 'Restaurant Chains', return: 15.8, allocation: 45, risk: 'Medium' },
      { sector: 'Catering Services', return: 12.3, allocation: 30, risk: 'Low' },
      { sector: 'Food Technology', return: 22.1, allocation: 15, risk: 'High' },
      { sector: 'Beverage Brands', return: 8.7, allocation: 10, risk: 'Low' }
    ],
    dividendHistory: [
      { date: '2024-01-15', amount: 1250, investments: 4 },
      { date: '2024-02-15', amount: 1320, investments: 4 },
      { date: '2024-03-15', amount: 1480, investments: 4 }
    ]
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-8">
        <GlassCard className="max-w-md text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <BarChart3 size={32} className="text-primary" />
          </div>
          <h2 className="text-2xl font-black text-text mb-4">Analytics Access Required</h2>
          <p className="text-text/60 mb-8">
            Connect your wallet to access advanced portfolio analytics and performance insights.
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
          <h1 className="text-4xl font-black text-text mb-2">Portfolio Analytics</h1>
          <p className="text-text/60">Advanced insights and performance metrics for your investments</p>
        </div>
        <div className="flex gap-3">
          <button className="px-6 py-3 bg-surface text-text font-black uppercase tracking-widest rounded-xl hover:bg-surface/80 transition-colors">
            <Download size={16} className="inline mr-2" />
            Export
          </button>
          <button className="px-6 py-3 bg-primary text-background font-black uppercase tracking-widest rounded-xl hover:bg-primary/90 transition-colors">
            <RefreshCw size={16} className="inline mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Time Range Selector */}
      <div className="flex gap-3">
        {['7d', '30d', '90d', '1y'].map((range) => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={`px-6 py-3 font-black uppercase tracking-widest rounded-xl transition-all ${
              timeRange === range
                ? 'bg-primary text-background'
                : 'bg-surface text-text hover:bg-surface/80'
            }`}
          >
            {range}
          </button>
        ))}
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <GlassCard>
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">Total Return</p>
              <h3 className="text-3xl font-black text-green-500">${analyticsData.overview.totalReturn.toLocaleString()}</h3>
            </div>
            <div className="p-3 bg-green-500/10 rounded-xl">
              <TrendingUp size={24} className="text-green-500" />
            </div>
          </div>
          <div className="text-sm text-green-500 font-bold">+23.4% vs benchmark</div>
        </GlassCard>

        <GlassCard>
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">Win Rate</p>
              <h3 className="text-3xl font-black text-blue-500">{analyticsData.overview.winRate}%</h3>
            </div>
            <div className="p-3 bg-blue-500/10 rounded-xl">
              <Target size={24} className="text-blue-500" />
            </div>
          </div>
          <div className="text-sm text-blue-500 font-bold">Above average performance</div>
        </GlassCard>

        <GlassCard>
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">Risk Score</p>
              <h3 className="text-3xl font-black text-yellow-500">{analyticsData.overview.riskScore}/10</h3>
            </div>
            <div className="p-3 bg-yellow-500/10 rounded-xl">
              <Shield size={24} className="text-yellow-500" />
            </div>
          </div>
          <div className="text-sm text-yellow-500 font-bold">Conservative portfolio</div>
        </GlassCard>

        <GlassCard>
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">Sharpe Ratio</p>
              <h3 className="text-3xl font-black text-purple-500">{analyticsData.overview.sharpeRatio}</h3>
            </div>
            <div className="p-3 bg-purple-500/10 rounded-xl">
              <Award size={24} className="text-purple-500" />
            </div>
          </div>
          <div className="text-sm text-purple-500 font-bold">Excellent risk-adjusted returns</div>
        </GlassCard>
      </div>

      {/* Performance Chart */}
      <GlassCard>
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-black text-text">Performance vs Benchmark</h3>
          <div className="flex gap-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-primary rounded-full"></div>
              <span className="text-sm font-bold text-text">Portfolio</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
              <span className="text-sm font-bold text-text/60">Benchmark</span>
            </div>
          </div>
        </div>
        <div className="h-80">
          <PortfolioChart data={analyticsData.performance.map(d => ({
            date: d.month,
            value: d.return,
            benchmark: d.benchmark
          }))} />
        </div>
      </GlassCard>

      {/* Sector Analysis */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <GlassCard>
          <h3 className="text-xl font-black text-text mb-6">Sector Performance</h3>
          <div className="space-y-4">
            {analyticsData.sectorPerformance.map((sector, index) => (
              <div key={index} className="p-4 bg-surface rounded-xl">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-black text-text">{sector.sector}</h4>
                  <Badge className={sector.risk === 'Low' ? 'bg-green-500 text-white' :
                                   sector.risk === 'Medium' ? 'bg-yellow-500 text-black' : 'bg-red-500 text-white'}>
                    {sector.risk} Risk
                  </Badge>
                </div>
                <div className="flex justify-between items-center text-sm mb-2">
                  <span className="text-text/60">Return</span>
                  <span className="font-black text-green-500">+{sector.return}%</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-text/60">Allocation</span>
                  <span className="font-black text-text">{sector.allocation}%</span>
                </div>
                <div className="mt-3 w-full bg-surface rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${sector.allocation}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard>
          <h3 className="text-xl font-black text-text mb-6">Dividend History</h3>
          <div className="space-y-4">
            {analyticsData.dividendHistory.map((dividend, index) => (
              <div key={index} className="flex justify-between items-center p-4 bg-surface rounded-xl">
                <div>
                  <p className="font-black text-text">{dividend.date}</p>
                  <p className="text-sm text-text/60">{dividend.investments} investments</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-black text-green-500">${dividend.amount}</p>
                  <p className="text-sm text-green-500 font-bold">Paid</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 p-4 bg-primary/10 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-text/60">Next Dividend</p>
                <p className="text-lg font-black text-primary">Feb 15, 2024</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-text/60">Estimated</p>
                <p className="text-lg font-black text-primary">$1,450</p>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* AI Insights */}
      <GlassCard className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-primary rounded-xl">
            <Zap size={24} className="text-background" />
          </div>
          <div>
            <h3 className="text-xl font-black text-text">AI-Powered Insights</h3>
            <p className="text-text/60">Advanced analytics and recommendations</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-white/50 rounded-xl">
            <h4 className="font-black text-text mb-2">Market Opportunity</h4>
            <p className="text-sm text-text/60 mb-3">
              AI detected a 23% growth opportunity in Middle Eastern food delivery sector.
            </p>
            <button className="text-primary font-bold text-sm hover:text-primary/80">
              Explore Opportunity →
            </button>
          </div>

          <div className="p-4 bg-white/50 rounded-xl">
            <h4 className="font-black text-text mb-2">Risk Optimization</h4>
            <p className="text-sm text-text/60 mb-3">
              Recommended reducing food tech allocation from 15% to 12% for better diversification.
            </p>
            <button className="text-primary font-bold text-sm hover:text-primary/80">
              View Recommendations →
            </button>
          </div>

          <div className="p-4 bg-white/50 rounded-xl">
            <h4 className="font-black text-text mb-2">Performance Prediction</h4>
            <p className="text-sm text-text/60 mb-3">
              Next quarter projected returns: 18-22% based on current market trends.
            </p>
            <button className="text-primary font-bold text-sm hover:text-primary/80">
              See Forecast →
            </button>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}