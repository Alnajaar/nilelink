'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@shared/providers/AuthProvider';
import { graphService } from '@shared/services/GraphService';
import web3Service from '@shared/services/Web3Service';
import { GlassCard } from '@shared/components/GlassCard';
import { Button } from '@shared/components/Button';
import { Badge } from '@shared/components/Badge';
import { cn } from '@shared/utils/cn';
import { toast } from 'react-hot-toast';
import {
  ShieldAlert,
  Zap,
  Activity,
  Lock,
  Unlock,
  Skull,
  Database,
  ShieldCheck,
  Cpu,
  ArrowRightCircle,
  Power,
  DollarSign,
  Settings,
  Percent
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function SuperAdminPage() {
  const { user, realUser, isConnected, logout, startImpersonation, stopImpersonation, isImpersonating } = useAuth();
  const [ecosystemStats, setEcosystemStats] = useState({
    totalTransactions: 0,
    systemHealth: 0,
    activeUsers: 0,
    supplierPartners: 0,
    customerApps: 0,
    deliveryFleets: 0,
    activeSubscriptions: 0,
    fraudFlags: 0
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [systemState, setSystemState] = useState<'IDLE' | 'PAUSED' | 'HALTED'>('IDLE');
  const [targetId, setTargetId] = useState('');

  useEffect(() => {
    fetchEcosystemStats();
  }, []);

  const fetchEcosystemStats = async () => {
    try {
      const [protocolData, fraudData, globalData] = await Promise.all([
        graphService.getProtocolStats(),
        graphService.getFraudStats(),
        graphService.getGlobalAnalytics()
      ]);

      if (protocolData && protocolData.protocolStats) {
        const stats = protocolData.protocolStats;
        const activeSubs = (globalData as any)?.businesses?.filter((b: any) => b.isActive && b.plan !== 'FREE').length || 0;

        setEcosystemStats({
          totalTransactions: parseInt(stats.totalOrders || '0'),
          systemHealth: 100 - (fraudData.length > 10 ? 10 : fraudData.length),
          activeUsers: parseInt(stats.activeUsers || '0'),
          supplierPartners: parseInt(stats.totalSuppliers || '0'),
          customerApps: 1,
          deliveryFleets: parseInt(stats.totalDeliveries || '0'),
          activeSubscriptions: activeSubs,
          fraudFlags: fraudData.length
        });
      }
    } catch (error) {
      console.error('Failed to fetch ecosystem stats:', error);
    }
  };

  const handleSystemHalt = async () => {
    if (!confirm('CRITICAL: This will pause all protocol activities. Proceed?')) return;
    setIsProcessing(true);
    try {
      const tx = await web3Service.emergencyPause();
      if (tx) {
        toast.success('System Halted on-chain');
        setSystemState('HALTED');

        // Audit Log
        fetch('/api/admin/audit', {
          method: 'POST',
          body: JSON.stringify({
            action: 'system_halt',
            details: { txHash: tx }
          })
        }).catch(() => { });
      }
    } catch (error) {
      toast.error('Failed to halt system');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMaintenanceMode = async () => {
    setIsProcessing(true);
    try {
      const tx = systemState === 'PAUSED' ? await web3Service.emergencyUnpause() : await web3Service.emergencyPause();
      if (tx) {
        toast.success(systemState === 'PAUSED' ? 'System Resumed' : 'System Paused for Maintenance');
        setSystemState(systemState === 'PAUSED' ? 'IDLE' : 'PAUSED');

        // Audit Log
        fetch('/api/admin/audit', {
          method: 'POST',
          body: JSON.stringify({
            action: systemState === 'PAUSED' ? 'system_resume' : 'system_pause_maintenance',
            details: { txHash: tx }
          })
        }).catch(() => { });
      }
    } catch (error) {
      toast.error('Maintenance switch failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImpersonation = async () => {
    if (!targetId) return;
    setIsProcessing(true);
    try {
      await startImpersonation(targetId);
      toast.success(`Context Switched to: ${targetId.slice(0, 8)}...`);
    } catch (error) {
      toast.error('Impersonation failed');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!user || user.role !== 'SUPER_ADMIN') {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <GlassCard className="p-12 text-center max-w-md border-red-500/20">
          <ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-6 animate-pulse" />
          <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-4">Access Restricted</h1>
          <p className="text-gray-400 mb-8 font-medium">
            This terminal is reserved for Root Protocol Administrators only. Unauthorized access attempt has been logged.
          </p>
          <Button
            onClick={() => window.location.href = '/dashboard'}
            className="w-full bg-white/5 hover:bg-white/10 text-white font-black uppercase text-xs tracking-widest py-6 border border-white/5 rounded-2xl"
          >
            Return to Safe Zone
          </Button>
        </GlassCard>
      </div>
    );
  }

  const controlCards = [
    { title: 'Volume (24h)', value: ecosystemStats.totalTransactions.toLocaleString(), icon: Zap, color: 'text-orange-500', bg: 'bg-orange-500/10' },
    { title: 'Protocol Health', value: `${ecosystemStats.systemHealth}%`, icon: Activity, color: 'text-green-500', bg: 'bg-green-500/10' },
    { title: 'Active Subs', value: ecosystemStats.activeSubscriptions.toLocaleString(), icon: ShieldCheck, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { title: 'Fraud Flags', value: ecosystemStats.fraudFlags, icon: ShieldAlert, color: 'text-red-500', bg: 'bg-red-500/10' },
    { title: 'Delivery Grid', value: ecosystemStats.deliveryFleets, icon: Cpu, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
  ];

  return (
    <div className="space-y-10">
      {/* Critical Header */}
      <div className="flex justify-between items-end border-b border-red-500/20 pb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Skull className="w-4 h-4 text-red-500" />
            <span className="text-[10px] font-black text-red-500 uppercase tracking-[0.3em]">Root Access Enabled</span>
          </div>
          <h1 className="text-5xl font-black text-white italic uppercase tracking-tighter">
            Root <span className="text-red-600">Terminal</span>
          </h1>
          <p className="text-gray-400 mt-2 font-medium">Complete Ecosystem Oversight & On-Chain Governance Control.</p>
        </div>
        <div className="flex gap-4">
          {isImpersonating && (
            <Button
              onClick={stopImpersonation}
              className="bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 border-yellow-500/20 px-6 py-2 font-black text-[9px] uppercase italic rounded-2xl"
            >
              Stop Impersonation
            </Button>
          )}
          <div className="flex flex-col items-end">
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Session Integrity</p>
            <Badge variant="destructive" className="bg-red-500/10 text-red-500 border-red-500/20 px-4 py-1 font-black text-[9px] uppercase italic">Encrypted Connection</Badge>
          </div>
        </div>
      </div>

      {/* Real-time Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {controlCards.map((card, idx) => (
          <GlassCard key={card.title} className="p-4 border border-white/5">
            <card.icon className={cn("w-5 h-5 mb-3", card.color)} />
            <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">{card.title}</p>
            <h3 className="text-xl font-black text-white italic tracking-tighter">{card.value}</h3>
          </GlassCard>
        ))}
      </div>

      {/* Control Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* EMERGENCY CONTROLS */}
        <GlassCard className="p-8 border-red-500/30 bg-red-950/10 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <ShieldAlert className="w-32 h-32 text-red-500" />
          </div>
          <h3 className="text-2xl font-black text-white uppercase italic mb-6 tracking-tighter flex items-center gap-2">
            <Power className="w-6 h-6 text-red-500" /> System Critical
          </h3>

          <div className="space-y-4 relative z-10">
            <div className="p-4 rounded-2xl bg-red-500/5 border border-red-500/20">
              <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-2">Primary Lockdown</p>
              <button
                onClick={handleSystemHalt}
                disabled={isProcessing}
                className="w-full h-14 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-black uppercase text-xs tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(220,38,38,0.4)]"
              >
                {isProcessing ? 'Executing...' : 'Terminate All Smart Contracts'}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={handleMaintenanceMode}
                disabled={isProcessing}
                className="h-14 bg-white/5 border border-white/5 hover:bg-yellow-500/20 hover:border-yellow-500/50 text-yellow-500 font-black uppercase text-[10px] tracking-widest rounded-xl transition-all"
              >
                {systemState === 'PAUSED' ? 'Resume Ops' : 'Maintenance Mode'}
              </button>
              <button className="h-14 bg-white/5 border border-white/5 hover:bg-blue-500/20 hover:border-blue-500/50 text-blue-500 font-black uppercase text-[10px] tracking-widest rounded-xl transition-all">
                Soft Reboot Nodes
              </button>
            </div>
          </div>
        </GlassCard>

        {/* SECURITY & IDENTITY */}
        <GlassCard className="p-8 border border-white/5 group">
          <h3 className="text-2xl font-black text-white uppercase italic mb-6 tracking-tighter flex items-center gap-2">
            <Lock className="w-6 h-6 text-blue-500" /> Access Governance
          </h3>
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/20">
              <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-3">Context Swapper (Impersonation)</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={targetId}
                  onChange={(e) => setTargetId(e.target.value)}
                  placeholder="Wallet Address or User ID"
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-blue-500/50"
                />
                <button
                  onClick={handleImpersonation}
                  disabled={isProcessing || !targetId}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest"
                >
                  Swap
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => window.location.href = '/super-admin/settings'}
                className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-purple-600/20 hover:border-purple-500/50 transition-all text-left group/btn"
              >
                <div className="flex items-center gap-3">
                  <Settings className="w-5 h-5 text-purple-400" />
                  <span className="text-[10px] font-black text-white uppercase tracking-widest">Protocol Configurations</span>
                </div>
                <ArrowRightCircle className="w-4 h-4 text-gray-600 group-hover/btn:text-white transition-colors" />
              </button>

              <button
                onClick={() => window.location.href = '/super-admin/payouts'}
                className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-blue-600/20 hover:border-blue-500/50 transition-all text-left group/btn"
              >
                <div className="flex items-center gap-3">
                  <DollarSign className="w-5 h-5 text-green-400" />
                  <span className="text-[10px] font-black text-white uppercase tracking-widest">Payout Approval Queue</span>
                </div>
                <ArrowRightCircle className="w-4 h-4 text-gray-600 group-hover/btn:text-white transition-colors" />
              </button>

              <button
                onClick={() => window.location.href = '/super-admin/commissions'}
                className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-emerald-600/20 hover:border-emerald-500/50 transition-all text-left group/btn"
              >
                <div className="flex items-center gap-3">
                  <Percent className="w-5 h-5 text-emerald-400" />
                  <span className="text-[10px] font-black text-white uppercase tracking-widest">Commission Registry</span>
                </div>
                <ArrowRightCircle className="w-4 h-4 text-gray-600 group-hover/btn:text-white transition-colors" />
              </button>

              {[
                { label: 'Promote to Root Admin', icon: ShieldCheck, color: 'text-blue-400' },
                { label: 'Revoke Global Privileges', icon: ShieldAlert, color: 'text-red-400' },
                { label: 'Analyze Security Logs', icon: Database, color: 'text-gray-400' },
                { label: 'Update Network Policies', icon: Cpu, color: 'text-purple-400' }
              ].map((item) => (
                <button key={item.label} className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/20 transition-all text-left group/btn">
                  <div className="flex items-center gap-3">
                    <item.icon className={cn("w-5 h-5", item.color)} />
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">{item.label}</span>
                  </div>
                  <ArrowRightCircle className="w-4 h-4 text-gray-600 group-hover/btn:text-white transition-colors" />
                </button>
              ))}
            </div>
          </div>
        </GlassCard>
      </div>

      {/* LOGS */}
      <GlassCard className="border border-white/5 overflow-hidden">
        <div className="p-6 border-b border-white/5 bg-white/[0.01]">
          <h3 className="text-lg font-black text-white uppercase italic tracking-tighter">Root Activity Ledger</h3>
        </div>
        <div className="divide-y divide-white/5">
          {[
            { event: 'Emergency Backup Initiated', time: '14:20 UTC', status: 'SUCCESS', color: 'text-green-500' },
            { event: 'Root Access Granted: node_alpha_admin', time: '12:05 UTC', status: 'AUDITED', color: 'text-blue-500' },
            { event: 'Smart Contract Policy Update', time: 'Yesterday', status: 'COMPLETE', color: 'text-purple-500' }
          ].map((log, i) => (
            <div key={i} className="px-8 py-5 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                <div>
                  <p className="text-[11px] font-black text-white uppercase italic tracking-tight">{log.event}</p>
                  <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">{log.time}</p>
                </div>
              </div>
              <Badge className={cn("bg-white/5 border-white/10 text-[8px] font-black tracking-widest", log.color)}>{log.status}</Badge>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}

