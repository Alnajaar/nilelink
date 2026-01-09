"use client";

import React from 'react';
import { Phone, ThumbsUp, ThumbsDown, MessageSquare } from 'lucide-react';
import { Button } from '@/shared/components/Button';

interface DriverCardProps {
    name: string;
    phone: string;
    photoUrl?: string;
    onCall?: () => void;
    onMessage?: () => void;
    onFeedback?: (type: 'up' | 'down') => void;
}

export const DriverCard: React.FC<DriverCardProps> = ({
    name = "Hadi Jihad Metlej",
    phone = "+961 79 198 059",
    photoUrl = "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200",
    onCall,
    onMessage,
    onFeedback
}) => {
    return (
        <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100 mt-4">
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full border-2 border-white shadow-md overflow-hidden bg-slate-200">
                        <img src={photoUrl} alt={name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                        <h4 className="text-sm font-black text-slate-900 leading-tight">{name}</h4>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <Phone size={10} className="text-slate-400" />
                            <span className="text-[10px] font-bold text-slate-500">{phone}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onFeedback?.('down')}
                        className="w-10 h-10 rounded-full bg-white border border-slate-100 text-red-500 shadow-sm p-0 hover:bg-red-50"
                    >
                        <ThumbsDown size={18} />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onFeedback?.('up')}
                        className="w-10 h-10 rounded-full bg-white border border-slate-100 text-emerald-500 shadow-sm p-0 hover:bg-emerald-50"
                    >
                        <ThumbsUp size={18} />
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-4">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onCall}
                    className="h-10 rounded-xl border-slate-200 text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 flex items-center justify-center"
                >
                    <Phone size={14} className="mr-2" />
                    Call Driver
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onMessage}
                    className="h-10 rounded-xl border-slate-200 text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 flex items-center justify-center transition-all"
                >
                    <MessageSquare size={14} className="mr-2" />
                    Message
                </Button>
            </div>
        </div>
    );
};
