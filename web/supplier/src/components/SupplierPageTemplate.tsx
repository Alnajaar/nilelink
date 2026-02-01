'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

/**
 * Standard Page Template for Supplier App
 * All pages should follow this structure for design consistency
 */

interface PageTemplateProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  actions?: React.ReactNode;
  children: React.ReactNode;
  backgroundGradient?: boolean;
}

export default function SupplierPageTemplate({
  title,
  subtitle,
  icon: Icon,
  actions,
  children,
  backgroundGradient = true
}: PageTemplateProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-background to-slate-50">
      {/* Animated Background Orbs */}
      {backgroundGradient && (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="absolute top-[-20%] right-[-20%] w-[600px] h-[600px] bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl"
          />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="absolute bottom-[-20%] left-[-20%] w-[600px] h-[600px] bg-gradient-to-tr from-green-400/5 to-cyan-400/5 rounded-full blur-3xl"
          />
        </div>
      )}

      {/* Sticky Header */}
      <header className="sticky top-0 z-40 border-b border-gray-200/50 bg-white/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* Header Left */}
            <div className="flex items-start gap-4">
              {Icon && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                  className="w-14 h-14 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl 
                           flex items-center justify-center text-blue-600 shadow-lg"
                >
                  <Icon size={28} />
                </motion.div>
              )}
              <div>
                <motion.h1
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-3xl lg:text-4xl font-black text-gray-900 uppercase tracking-tighter leading-none"
                >
                  {title}
                </motion.h1>
                {subtitle && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="text-gray-600 font-medium mt-1"
                  >
                    {subtitle}
                  </motion.p>
                )}
              </div>
            </div>

            {/* Header Right - Actions */}
            {actions && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-3"
              >
                {actions}
              </motion.div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-12 lg:py-16 pt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}

// ============================================
// REUSABLE SECTION COMPONENTS
// ============================================

interface SectionProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  fullWidth?: boolean;
}

export function PageSection({ title, subtitle, action, children, fullWidth = false }: SectionProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className={`space-y-6 ${!fullWidth && 'mb-12'}`}
    >
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">
            {title}
          </h2>
          {subtitle && (
            <p className="text-gray-600 font-medium mt-1">{subtitle}</p>
          )}
        </div>
        {action && action}
      </div>

      {/* Content */}
      {children}
    </motion.section>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  change?: string;
  icon: LucideIcon;
  color: 'blue' | 'emerald' | 'amber' | 'red' | 'purple' | 'cyan';
  trend?: 'up' | 'down' | 'neutral';
}

const colorMap = {
  blue: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100' },
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100' },
  amber: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100' },
  red: { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-100' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-100' },
  cyan: { bg: 'bg-cyan-50', text: 'text-cyan-600', border: 'border-cyan-100' },
};

export function StatCard({ label, value, change, icon: Icon, color, trend }: StatCardProps) {
  const colors = colorMap[color];

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300 }}
      className={`bg-white border ${colors.border} rounded-xl p-6 shadow-sm 
                   hover:shadow-md transition-all group`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className={`w-12 h-12 rounded-2xl ${colors.bg} flex items-center justify-center 
                        ${colors.text} group-hover:scale-110 transition-transform`}>
          <Icon size={24} />
        </div>
        {change && (
          <span className={`text-xs font-black px-2.5 py-1 rounded-full 
                          ${trend === 'up' ? 'bg-emerald-100 text-emerald-700' : 
                            trend === 'down' ? 'bg-red-100 text-red-700' : 
                            'bg-gray-100 text-gray-700'}`}>
            {change}
          </span>
        )}
      </div>
      <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">
        {label}
      </p>
      <p className="text-3xl font-black text-gray-900 tracking-tighter">
        {value}
      </p>
    </motion.div>
  );
}