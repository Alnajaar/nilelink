/**
 * AddStaffModal - Mission Critical Staff Registration
 */

import React, { useState } from 'react';
import { X, User, Phone, Shield, Lock, Image as ImageIcon, CheckCircle2, ChevronRight } from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { Input } from '@/shared/components/Input';
import { Badge } from '@/shared/components/Badge';
import { Card } from '@/shared/components/Card';
import { POS_ROLE, PERMISSION, ROLE_PERMISSIONS, getRoleLabel } from '@/utils/permissions';
import { motion, AnimatePresence } from 'framer-motion';

interface AddStaffModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (staffData: any) => Promise<void>;
}

export const AddStaffModal: React.FC<AddStaffModalProps> = ({ isOpen, onClose, onAdd }) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        username: '',
        phone: '',
        pin: '',
        confirmPin: '',
        roles: [] as POS_ROLE[],
        permissions: [] as PERMISSION[],
        image: null as string | null
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleRoleToggle = (role: POS_ROLE) => {
        setFormData(prev => {
            const newRoles = prev.roles.includes(role)
                ? prev.roles.filter(r => r !== role)
                : [...prev.roles, role];

            // Auto-sync permissions
            const newPermissions = Array.from(new Set(newRoles.flatMap(r => ROLE_PERMISSIONS[r] || [])));

            return { ...prev, roles: newRoles, permissions: newPermissions };
        });
    };

    const handleFinish = async () => {
        if (formData.pin !== formData.confirmPin) {
            setError('PIN codes do not match');
            return;
        }
        if (formData.pin.length < 4) {
            setError('PIN must be at least 4 digits');
            return;
        }

        setIsLoading(true);
        try {
            await onAdd(formData);
            onClose();
            // Reset for next time
            setStep(1);
            setFormData({ username: '', phone: '', pin: '', confirmPin: '', roles: [], permissions: [], image: null });
        } catch (err) {
            setError('Failed to initialize staff record');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
                {/* Header */}
                <div className="p-8 border-b border-border-subtle flex items-center justify-between bg-neutral/30">
                    <div>
                        <h2 className="text-2xl font-black text-text-primary tracking-tighter uppercase italic">Recruit Operator</h2>
                        <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">NileLink Personnel Protocol</p>
                    </div>
                    <button onClick={onClose} className="w-12 h-12 rounded-2xl bg-white border border-border-subtle flex items-center justify-center hover:bg-error/10 hover:text-error transition-all">
                        <X size={20} />
                    </button>
                </div>

                {/* Progress Rail */}
                <div className="flex px-8 pt-6 gap-2">
                    {[1, 2, 3].map(i => (
                        <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= i ? 'bg-primary' : 'bg-neutral'}`} />
                    ))}
                </div>

                {/* Content */}
                <div className="p-8 overflow-y-auto flex-1">
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] ml-2">Operator Name / اسم الموظف</label>
                                        <div className="relative">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-text-subtle" size={18} />
                                            <Input
                                                className="pl-12 h-14 rounded-2xl bg-neutral/50 border-transparent focus:bg-white"
                                                placeholder="e.g. Hadi Jihad"
                                                value={formData.username}
                                                onChange={e => setFormData({ ...formData, username: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] ml-2">Secure Phone / رقم الهاتف</label>
                                        <div className="relative">
                                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-text-subtle" size={18} />
                                            <Input
                                                className="pl-12 h-14 rounded-2xl bg-neutral/50 border-transparent focus:bg-white"
                                                placeholder="+20 ..."
                                                value={formData.phone}
                                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="p-8 border-2 border-dashed border-border-subtle rounded-[2rem] flex flex-col items-center justify-center gap-4 bg-neutral/20 group hover:border-primary/50 transition-all cursor-pointer">
                                    <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-text-subtle group-hover:text-primary group-hover:scale-110 transition-all shadow-lg">
                                        <ImageIcon size={24} />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-xs font-black text-text-primary uppercase tracking-widest">Profile Visual / صورة شخصية</p>
                                        <p className="text-[9px] text-text-muted uppercase font-medium mt-1">Optional biometric verification</p>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] ml-2">Assign Protocol Roles / المهام الوظيفية</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {Object.values(POS_ROLE).map(role => (
                                            <button
                                                key={role}
                                                onClick={() => handleRoleToggle(role)}
                                                className={`p-4 rounded-2xl border-2 text-left transition-all ${formData.roles.includes(role)
                                                        ? 'border-primary bg-primary/5 shadow-lg'
                                                        : 'border-transparent bg-neutral hover:bg-white hover:border-border-subtle'
                                                    }`}
                                            >
                                                <div className="flex items-center justify-between mb-1">
                                                    <Badge className="font-black text-[9px] tracking-widest uppercase py-1">{getRoleLabel(role)}</Badge>
                                                    {formData.roles.includes(role) && <CheckCircle2 size={16} className="text-primary" />}
                                                </div>
                                                <p className="text-[9px] font-bold text-text-muted uppercase tracking-tight">Access level: {role}</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div
                                key="step3"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-8"
                            >
                                <div className="bg-primary/5 p-8 rounded-[2rem] border border-primary/10">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/30">
                                            <Lock size={20} />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-black text-text-primary uppercase tracking-widest">Security Credentials</h4>
                                            <p className="text-[9px] text-text-muted uppercase font-medium">Define operator access PIN</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] ml-2">Access PIN (6 Digits)</label>
                                            <Input
                                                type="password"
                                                className="h-14 rounded-2xl bg-white border-primary/20 text-center font-black text-2xl tracking-[0.5em]"
                                                maxLength={8}
                                                value={formData.pin}
                                                onChange={e => setFormData({ ...formData, pin: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] ml-2">Confirm PIN</label>
                                            <Input
                                                type="password"
                                                className="h-14 rounded-2xl bg-white border-primary/20 text-center font-black text-2xl tracking-[0.5em]"
                                                maxLength={8}
                                                value={formData.confirmPin}
                                                onChange={e => setFormData({ ...formData, confirmPin: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    {error && (
                                        <p className="mt-4 text-[10px] font-black text-error uppercase tracking-widest text-center flex items-center justify-center gap-2">
                                            <Shield size={14} />
                                            {error}
                                        </p>
                                    )}
                                </div>

                                <div className="p-6 bg-warning/5 rounded-2xl border border-warning/20 flex gap-4">
                                    <Shield size={20} className="text-warning shrink-0" />
                                    <p className="text-[10px] font-medium text-text-secondary leading-relaxed uppercase">
                                        Unique Operator ID will be generated upon confirmation. This PIN should not be shared and is tied to individual financial accountability.
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Footer Buttons */}
                <div className="p-8 border-t border-border-subtle flex gap-4 bg-neutral/10">
                    {step > 1 && (
                        <Button variant="outline" className="h-14 px-8 rounded-2xl" onClick={() => setStep(step - 1)}>
                            Back
                        </Button>
                    )}
                    <Button
                        className="h-14 flex-1 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 group"
                        onClick={step === 3 ? handleFinish : () => setStep(step + 1)}
                        isLoading={isLoading}
                        disabled={step === 2 && formData.roles.length === 0}
                    >
                        {step === 3 ? 'Finalize Recruitment' : 'Continue / متابعة'}
                        <ChevronRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                </div>
            </motion.div>
        </div>
    );
};
