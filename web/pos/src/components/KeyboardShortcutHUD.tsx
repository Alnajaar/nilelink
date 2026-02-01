"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/shared/Card';
import { Badge } from '@/components/shared/Badge';
import { Command, X } from 'lucide-react';

interface Shortcut {
  keys: string[];
  label: string;
  description: string;
  category: 'navigation' | 'actions' | 'status' | 'other';
}

interface KeyboardShortcutHUDProps {
  shortcuts?: Shortcut[];
  isOpen?: boolean;
  onClose?: () => void;
}

const defaultShortcuts: Shortcut[] = [
  { keys: ['Spacebar'], label: 'Advance Status', description: 'Mark selected order to next status', category: 'status' },
  { keys: ['Arrow', 'Up/Down'], label: 'Navigate Orders', description: 'Move through order list', category: 'navigation' },
  { keys: ['Tab'], label: 'Focus Next', description: 'Focus next interactive element', category: 'navigation' },
  { keys: ['Shift', '+', 'U'], label: 'Urgent', description: 'Mark order as urgent', category: 'actions' },
  { keys: ['?'], label: 'Help', description: 'Show this shortcuts menu', category: 'other' },
];

const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
  navigation: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  actions: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  status: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  other: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
};

export default function KeyboardShortcutHUD({
  shortcuts = defaultShortcuts,
  isOpen = false,
  onClose,
}: KeyboardShortcutHUDProps) {
  const [open, setOpen] = useState(isOpen);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === '?') {
        setOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  return (
    <>
      {/* Floating Help Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(true)}
        className="fixed bottom-6 left-6 z-40 w-12 h-12 bg-primary rounded-full flex items-center justify-center text-background shadow-xl shadow-primary/30 font-black text-lg hover:shadow-2xl transition-all"
        title="Press ? for keyboard shortcuts"
      >
        ?
      </motion.button>

      {/* Modal Overlay */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setOpen(false);
                onClose?.();
              }}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-2xl"
            >
              <Card className="bg-white border-2 border-border-subtle p-8 rounded-3xl shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <Command size={24} className="text-primary" />
                    <h2 className="text-2xl font-black text-text-primary uppercase tracking-tight">
                      Keyboard Shortcuts
                    </h2>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setOpen(false);
                      onClose?.();
                    }}
                    className="w-10 h-10 rounded-xl bg-neutral hover:bg-primary/10 flex items-center justify-center text-text-secondary hover:text-primary transition-colors"
                  >
                    <X size={20} />
                  </motion.button>
                </div>

                {/* Shortcuts Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
                  {shortcuts.map((shortcut, idx) => {
                    const colors = categoryColors[shortcut.category];
                    return (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className={`p-4 rounded-2xl border-2 ${colors.bg} ${colors.border}`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex flex-wrap gap-2">
                            {shortcut.keys.map((key, idx) => (
                              <Badge
                                key={idx}
                                className={`${colors.text} bg-white/60 border-current/20 font-black text-xs uppercase px-2 py-1`}
                              >
                                {key}
                              </Badge>
                            ))}
                          </div>
                          <Badge
                            className={`${colors.bg} ${colors.text} border-current/20 text-[8px] font-black uppercase px-2 py-1`}
                          >
                            {shortcut.category}
                          </Badge>
                        </div>
                        <h4 className={`font-black text-sm mb-1 ${colors.text}`}>
                          {shortcut.label}
                        </h4>
                        <p className="text-xs text-text-secondary/70">
                          {shortcut.description}
                        </p>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Footer */}
                <div className="mt-8 pt-6 border-t border-border-subtle text-center">
                  <p className="text-xs font-bold text-text-secondary/60 uppercase tracking-widest">
                    Press <span className="text-primary font-black">?</span> anytime to show this menu
                  </p>
                </div>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 195, 137, 0.2);
          border-radius: 10px;
        }
      `}</style>
    </>
  );
}