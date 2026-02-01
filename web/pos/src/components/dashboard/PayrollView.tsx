import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Banknote, Clock, Users, ArrowUpRight, Calendar, AlertCircle, CheckCircle } from 'lucide-react';
import { usePOS } from '@/contexts/POSContext';
import { Button } from '@/shared/components/Button';
import { Badge } from '@/shared/components/Badge';

export const PayrollView = () => {
    const { engines, currentStaff } = usePOS();
    const [activeShifts, setActiveShifts] = useState<any[]>([]);
    const [processedPayrolls, setProcessedPayrolls] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Mock data for initial render if engine is empty
    const mockShifts = [
        { id: '1', name: 'Sarah Connor', role: 'MANAGER', start: Date.now() - 14400000, status: 'ACTIVE' }, // 4 hours ago
        { id: '2', name: 'John Wick', role: 'SECURITY', start: Date.now() - 28800000, status: 'COMPLETED', duration: '8h 00m' }, // 8 hours ago
    ];

    useEffect(() => {
        const fetchRealData = async () => {
            if (engines.payrollEngine) {
                const shifts = await engines.payrollEngine.getActiveShifts();
                // Enrich shift data with staff names (mock for now as shifts only have ID)
                // In production, we would join this with engines.staffEngine.getStaffById(s.staffId)
                const enrichedShifts = shifts.map((s: any) => ({
                    id: s.id,
                    staffId: s.staffId,
                    name: `Staff #${s.staffId.slice(-4)}`, // Placeholder name until staff lookup
                    role: 'STAFF', // Placeholder role
                    start: s.clockIn,
                    status: s.status,
                    duration: 'Running...'
                }));
                setActiveShifts(enrichedShifts);
            }
        };

        fetchRealData();
        const interval = setInterval(fetchRealData, 10000); // 10s polling for live dashboard
        return () => clearInterval(interval);
    }, [engines.payrollEngine]);

    const calculateLiveCost = () => {
        // Calculate total hours currently active x Avg Rate ($25)
        const totalHours = activeShifts.reduce((acc, shift) => {
            const durationHours = (Date.now() - shift.start) / (1000 * 60 * 60);
            return acc + durationHours;
        }, 0);
        return totalHours * 25.00;
    };

    return (
        <div className="space-y-8 pb-20 p-6">
            {/* Header KPI Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-8 bg-pos-bg-secondary/40 border border-pos-border-subtle rounded-[2.5rem] relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-pos-accent/5 blur-3xl rounded-full" />
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 rounded-2xl bg-pos-bg-primary border border-pos-border-subtle text-pos-accent">
                            <Banknote size={20} />
                        </div>
                        <Badge variant="outline" className="border-pos-accent/30 text-pos-accent text-[9px] font-black uppercase tracking-widest px-3">Live Burn</Badge>
                    </div>
                    <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-pos-text-secondary mb-1">Current Shift Cost</h3>
                    <p className="text-4xl font-black italic tracking-tighter text-white">${calculateLiveCost().toFixed(2)}</p>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="p-8 bg-pos-bg-secondary/40 border border-pos-border-subtle rounded-[2.5rem] relative overflow-hidden">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 rounded-2xl bg-pos-bg-primary border border-pos-border-subtle text-success">
                            <Users size={20} />
                        </div>
                        <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-success">
                            <ArrowUpRight size={12} /> Optimal
                        </div>
                    </div>
                    <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-pos-text-secondary mb-1">Active Staff</h3>
                    <p className="text-4xl font-black italic tracking-tighter text-white">4 <span className="text-lg text-pos-text-muted not-italic">/ 12</span></p>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="p-8 bg-pos-bg-secondary/40 border border-pos-border-subtle rounded-[2.5rem] relative overflow-hidden">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 rounded-2xl bg-pos-bg-primary border border-pos-border-subtle text-warning">
                            <Clock size={20} />
                        </div>
                        <Badge variant="outline" className="border-warning/30 text-warning text-[9px] font-black uppercase tracking-widest px-3">Pending Action</Badge>
                    </div>
                    <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-pos-text-secondary mb-1">Pending OT Approval</h3>
                    <p className="text-4xl font-black italic tracking-tighter text-white">2.5 <span className="text-lg text-pos-text-muted not-italic">hrs</span></p>
                </motion.div>
            </div>

            {/* Active Shifts Table */}
            <div className="bg-pos-bg-secondary/20 border border-pos-border-subtle rounded-[2rem] overflow-hidden">
                <div className="p-8 border-b border-pos-border-subtle flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-black italic uppercase tracking-tighter text-white">Active Shift Roster</h3>
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-pos-text-muted mt-1">Real-time attendance ledger</p>
                    </div>
                    <Button variant="outline" className="border-pos-accent text-pos-accent font-bold uppercase text-xs h-10">
                        Export Report
                    </Button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-pos-bg-primary/50">
                            <tr>
                                <th className="px-8 py-4 text-left text-[10px] font-black uppercase tracking-widest text-pos-text-muted">Staff Member</th>
                                <th className="px-8 py-4 text-left text-[10px] font-black uppercase tracking-widest text-pos-text-muted">Role</th>
                                <th className="px-8 py-4 text-left text-[10px] font-black uppercase tracking-widest text-pos-text-muted">Clock In</th>
                                <th className="px-8 py-4 text-left text-[10px] font-black uppercase tracking-widest text-pos-text-muted">Duration</th>
                                <th className="px-8 py-4 text-left text-[10px] font-black uppercase tracking-widest text-pos-text-muted">Status</th>
                                <th className="px-8 py-4 text-left text-[10px] font-black uppercase tracking-widest text-pos-text-muted">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-pos-border-subtle/50">
                            {activeShifts.map((shift, idx) => (
                                <tr key={shift.id} className="hover:bg-pos-accent/5 transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-pos-bg-tertiary flex items-center justify-center font-bold text-xs">
                                                {shift.name.charAt(0)}
                                            </div>
                                            <span className="font-bold text-xs text-white uppercase tracking-wider">{shift.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <Badge variant="secondary" className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5">
                                            {shift.role}
                                        </Badge>
                                    </td>
                                    <td className="px-8 py-6 font-mono text-xs text-pos-text-secondary">
                                        {new Date(shift.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </td>
                                    <td className="px-8 py-6 font-mono text-xs text-white font-bold">
                                        {shift.duration || 'Running...'}
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${shift.status === 'ACTIVE' ? 'bg-success animate-pulse' : 'bg-pos-text-muted'}`} />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-pos-text-secondary">{shift.status}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        {shift.status === 'ACTIVE' && (
                                            <Button size="sm" variant="ghost" className="text-pos-danger hover:text-red-400 hover:bg-pos-danger/10 text-[10px] font-black uppercase tracking-widest h-8">
                                                Force Clock-out
                                            </Button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
