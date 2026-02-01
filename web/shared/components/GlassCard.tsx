"use client";

import React from "react";
import { motion } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface GlassCardProps {
    children: React.ReactNode;
    className?: string;
    delay?: number;
    pulse?: boolean;
}

export function GlassCard({ children, className, delay = 0, pulse = false }: GlassCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay }}
            className={cn(
                "glass rounded-[2.5rem] p-8 relative overflow-hidden group hover:border-white/20 transition-all cursor-default",
                className
            )}
        >
            {/* Neural Pulse Effect */}
            {pulse && (
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.1, 0.3, 0.1]
                    }}
                    transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute inset-0 bg-blue-500/10 blur-[80px] pointer-events-none"
                />
            )}

            {/* Hover Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

            {/* Content Container */}
            <div className="relative z-10">
                {children}
            </div>

            {/* Micro-border for Premium Feel */}
            <div className="absolute inset-0 border border-white/5 rounded-[2.5rem] pointer-events-none" />
        </motion.div>
    );
}
