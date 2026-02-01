'use client';

import { useState } from 'react';
import { GlassCard } from '@shared/components/GlassCard';
import { Button } from '@shared/components/Button';
import { Badge } from '@shared/components/Badge';
import {
  Calendar,
  Video,
  Link as LinkIcon,
  Clock,
  UserPlus,
  MoreHorizontal,
  Search,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MeetingsPage() {
  const [selectedDate, setSelectedDate] = useState(new Date().getDate());

  const meetings = [
    { id: '1', title: 'Protocol Governance Sync', time: '10:00 AM', duration: '45m', type: 'VIDEO', attendees: 8, status: 'UPCOMING' },
    { id: '2', title: 'Brand Onboarding: Starlink', time: '1:30 PM', duration: '30m', type: 'HYBRID', attendees: 3, status: 'UPCOMING' },
    { id: '3', title: 'Security Audit Review', time: '4:00 PM', duration: '1h', type: 'VIDEO', attendees: 5, status: 'PENDING' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-blue-500" />
            <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em]">Communication Hub</span>
          </div>
          <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter">
            Schedule <span className="text-blue-500">Node</span>
          </h1>
          <p className="text-gray-400 mt-2 font-medium">Manage stakeholder syncs, governance meetings, and technical briefings.</p>
        </div>

        <Button className="bg-blue-600 hover:bg-blue-700 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl px-8 py-6 shadow-lg shadow-blue-500/20">
          <Plus className="w-4 h-4 mr-2" /> Book Session
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Calendar Sidebar */}
        <div className="space-y-6">
          <GlassCard className="p-6 border border-white/5">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-black text-white uppercase italic tracking-widest">January 2026</h3>
              <div className="flex gap-2">
                <button className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white"><ChevronLeft className="w-4 h-4" /></button>
                <button className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white"><ChevronRight className="w-4 h-4" /></button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center mb-2">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
                <span key={d} className="text-[9px] font-black text-gray-600 uppercase">{d}</span>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                <button
                  key={day}
                  onClick={() => setSelectedDate(day)}
                  className={cn(
                    "h-9 rounded-xl text-[10px] font-bold transition-all border border-transparent flex items-center justify-center",
                    selectedDate === day ? "bg-blue-600 text-white shadow-lg border-blue-400" : "text-gray-400 hover:bg-white/5 hover:text-white"
                  )}
                >
                  {day}
                </button>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="p-6 border border-white/5 bg-blue-600/5 relative overflow-hidden group">
            <Video className="absolute -right-8 -bottom-8 w-32 h-32 text-blue-500/10 group-hover:scale-110 transition-transform" />
            <h4 className="text-xs font-black text-white uppercase tracking-widest mb-2">Quick Conference</h4>
            <p className="text-[10px] text-gray-500 mb-6 leading-relaxed">Start an instant session and broadcast the DID invite to your active node group.</p>
            <Button variant="outline" className="w-full border-blue-500/30 text-blue-400 hover:bg-blue-600 hover:text-white text-[9px] font-black uppercase tracking-widest py-5 rounded-xl">Instant Broadcast</Button>
          </GlassCard>
        </div>

        {/* Meetings List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-4 mb-2">
            <h3 className="text-sm font-black text-gray-500 uppercase tracking-[0.2em]">Agenda For {selectedDate} Jan</h3>
            <div className="flex gap-4 items-center">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="w-7 h-7 rounded-lg bg-gray-800 border-2 border-[#02050a] flex items-center justify-center text-[8px] font-bold text-gray-400">U{i}</div>
                ))}
                <div className="w-7 h-7 rounded-lg bg-blue-600 border-2 border-[#02050a] flex items-center justify-center text-[8px] font-bold text-white">+5</div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {meetings.map((mtg, i) => (
              <motion.div
                key={mtg.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <GlassCard className="p-6 border border-white/5 hover:border-blue-500/30 transition-all group">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex items-center gap-6">
                      <div className="w-14 h-14 bg-white/5 rounded-2xl flex flex-col items-center justify-center border border-white/5 group-hover:bg-blue-600/20 transition-all">
                        <span className="text-[10px] font-black text-blue-400 uppercase leading-none mb-1">{mtg.time.split(' ')[1]}</span>
                        <span className="text-lg font-black text-white italic leading-none">{mtg.time.split(' ')[0]}</span>
                      </div>
                      <div>
                        <h4 className="text-xl font-black text-white italic uppercase tracking-tight mb-2 group-hover:text-blue-400 transition-colors">{mtg.title}</h4>
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1.5 text-[9px] font-bold text-gray-500 uppercase tracking-widest"><Clock className="w-3 h-3 text-blue-500" /> {mtg.duration} Pulse</span>
                          <span className="w-1 h-1 rounded-full bg-gray-700" />
                          <span className="flex items-center gap-1.5 text-[9px] font-bold text-gray-500 uppercase tracking-widest"><UserPlus className="w-3 h-3 text-purple-500" /> {mtg.attendees} Delegates</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 ml-auto">
                      <Badge className={cn(
                        "text-[8px] font-black uppercase tracking-[0.2em] px-3",
                        mtg.type === 'VIDEO' ? "bg-blue-500/10 text-blue-400 border-blue-500/20" : "bg-purple-500/10 text-purple-400 border-purple-500/20"
                      )}>{mtg.type}</Badge>
                      <Button size="sm" className="h-10 px-6 bg-white/5 hover:bg-blue-600 border border-white/5 text-[9px] font-black uppercase tracking-widest rounded-xl shadow-none">Join</Button>
                      <button className="p-2.5 rounded-xl hover:bg-white/5 text-gray-500 hover:text-white transition-colors"><MoreHorizontal className="w-5 h-5" /></button>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}

            {/* Empty Space / Slot */}
            <div className="border-2 border-dashed border-white/5 rounded-[2.5rem] p-8 text-center group hover:border-blue-500/20 transition-all cursor-pointer">
              <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] group-hover:text-blue-500/60 transition-colors">+ Reserve Protocol Slot</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
