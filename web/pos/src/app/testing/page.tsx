"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Zap, CheckCircle2, XCircle, Loader2, Clock, BarChart3, AlertTriangle } from 'lucide-react';
import { runE2ETests, runStressTest, E2ETestReport } from '@/lib/testing/E2ETestHarness';

// Define Button component locally to avoid import issues
const Button = ({ children, onClick, disabled, className }: any) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={className}
    >
        {children}
    </button>
);

// Define Card component locally to avoid import issues
const Card = ({ children, className }: any) => (
    <div className={className}>
        {children}
    </div>
);

// Define Badge component locally to avoid import issues
const Badge = ({ children, className }: any) => (
    <span className={className}>
        {children}
    </span>
);

export default function TestingPage() {
    const [isRunning, setIsRunning] = useState(false);
    const [testReport, setTestReport] = useState<E2ETestReport | null>(null);
    const [stressTestResult, setStressTestResult] = useState<any>(null);
    const [testType, setTestType] = useState<'e2e' | 'stress' | null>(null);

    const handleRunE2E = async () => {
        setIsRunning(true);
        setTestType('e2e');
        setTestReport(null);

        try {
            const report = await runE2ETests({
                businessId: localStorage.getItem('nilelink_branch_id') || 'test-business',
                verbose: true
            });

            setTestReport(report);
        } catch (error) {
            console.error('E2E test failed:', error);
        } finally {
            setIsRunning(false);
        }
    };

    const handleRunStressTest = async () => {
        setIsRunning(true);
        setTestType('stress');
        setStressTestResult(null);

        try {
            const result = await runStressTest({
                businessId: localStorage.getItem('nilelink_branch_id') || 'test-business',
                concurrentTransactions: 10,
                duration: 10000 // 10 seconds
            });

            setStressTestResult(result);
        } catch (error) {
            console.error('Stress test failed:', error);
        } finally {
            setIsRunning(false);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--pos-bg-primary)] p-8 combat-bg">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-12">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 bg-[var(--pos-accent)] rounded-2xl flex items-center justify-center text-[var(--pos-text-inverse)]">
                            <Zap size={32} />
                        </div>
                        <div>
                            <h1 className="text-4xl font-black uppercase tracking-tighter text-[var(--pos-text-primary)]">
                                POS Test Harness
                            </h1>
                            <p className="text-[var(--pos-text-muted)] text-sm font-bold uppercase tracking-widest mt-1">
                                End-to-End Validation & Performance Testing
                            </p>
                        </div>
                    </div>
                </div>

                {/* Test Control Panel */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                    <Card className="bg-[var(--pos-bg-secondary)] border border-[var(--pos-border-subtle)] p-8">
                        <div className="flex items-center gap-4 mb-6">
                            <CheckCircle2 size={32} className="text-[var(--pos-accent)]" />
                            <div>
                                <h2 className="text-xl font-black uppercase tracking-tight">E2E Test Suite</h2>
                                <p className="text-xs text-[var(--pos-text-muted)] font-bold uppercase tracking-widest mt-1">
                                    Complete Flow Validation
                                </p>
                            </div>
                        </div>

                        <p className="text-sm text-[var(--pos-text-secondary)] mb-6 font-medium">
                            Tests: System Init → Product Loading → Cache → Cart → Transactions → Events → Sync Queue → Error Recovery → Performance
                        </p>

                        <Button
                            onClick={handleRunE2E}
                            disabled={isRunning}
                            className="combat-btn combat-btn-primary w-full h-14 text-sm font-black uppercase"
                        >
                            {isRunning && testType === 'e2e' ? (
                                <>
                                    <Loader2 className="animate-spin mr-2" size={20} />
                                    Running Tests...
                                </>
                            ) : (
                                <>
                                    <Play size={20} className="mr-2" />
                                    Run E2E Tests
                                </>
                            )}
                        </Button>
                    </Card>

                    <Card className="bg-[var(--pos-bg-secondary)] border border-[var(--pos-border-subtle)] p-8">
                        <div className="flex items-center gap-4 mb-6">
                            <BarChart3 size={32} className="text-[var(--pos-accent)]" />
                            <div>
                                <h2 className="text-xl font-black uppercase tracking-tight">Stress Test</h2>
                                <p className="text-xs text-[var(--pos-text-muted)] font-bold uppercase tracking-widest mt-1">
                                    Concurrent Load Testing
                                </p>
                            </div>
                        </div>

                        <p className="text-sm text-[var(--pos-text-secondary)] mb-6 font-medium">
                            Simulates 10 concurrent transactions over 10 seconds to test system resilience and performance under load.
                        </p>

                        <Button
                            onClick={handleRunStressTest}
                            disabled={isRunning}
                            className="combat-btn combat-btn-accent w-full h-14 text-sm font-black uppercase"
                        >
                            {isRunning && testType === 'stress' ? (
                                <>
                                    <Loader2 className="animate-spin mr-2" size={20} />
                                    Running Stress Test...
                                </>
                            ) : (
                                <>
                                    <Zap size={20} className="mr-2" />
                                    Run Stress Test
                                </>
                            )}
                        </Button>
                    </Card>
                </div>

                {/* E2E Test Results */}
                {testReport && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        {/* Summary Card */}
                        <Card className={`bg-[var(--pos-bg-secondary)] border-2 p-8 ${testReport.success ? 'border-[var(--pos-success)]' : 'border-[var(--pos-danger)]'}`}>
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-4">
                                    {testReport.success ? (
                                        <CheckCircle2 size={48} className="text-[var(--pos-success)]" />
                                    ) : (
                                        <XCircle size={48} className="text-[var(--pos-danger)]" />
                                    )}
                                    <div>
                                        <h3 className="text-2xl font-black uppercase tracking-tight">
                                            {testReport.success ? 'All Tests Passed' : 'Tests Failed'}
                                        </h3>
                                        <div className="flex items-center gap-3 mt-2">
                                            <Clock size={14} className="text-[var(--pos-text-muted)]" />
                                            <span className="text-sm font-bold text-[var(--pos-text-muted)]">
                                                {testReport.totalDuration}ms
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-6">
                                    <div className="text-center">
                                        <div className="text-3xl font-black text-[var(--pos-success)]">
                                            {testReport.summary.passed}
                                        </div>
                                        <div className="text-xs font-black uppercase tracking-widest text-[var(--pos-text-muted)] mt-1">
                                            Passed
                                        </div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-3xl font-black text-[var(--pos-danger)]">
                                            {testReport.summary.failed}
                                        </div>
                                        <div className="text-xs font-black uppercase tracking-widest text-[var(--pos-text-muted)] mt-1">
                                            Failed
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Phase Results */}
                        <div className="space-y-3">
                            {testReport.phases.map((phase, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                >
                                    <Card className="bg-[var(--pos-bg-secondary)] border border-[var(--pos-border-subtle)] p-6 hover:border-[var(--pos-accent)] transition-all">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4 flex-1">
                                                {phase.success ? (
                                                    <CheckCircle2 size={24} className="text-[var(--pos-success)]" />
                                                ) : (
                                                    <XCircle size={24} className="text-[var(--pos-danger)]" />
                                                )}
                                                <div className="flex-1">
                                                    <h4 className="font-black uppercase tracking-tight text-sm">
                                                        {phase.phase}
                                                    </h4>
                                                    {phase.error && (
                                                        <p className="text-xs text-[var(--pos-danger)] font-mono mt-1">
                                                            Error: {phase.error}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4">
                                                <Badge className={`${phase.success ? 'bg-[var(--pos-success-bg)] text-[var(--pos-success)]' : 'bg-[var(--pos-danger-bg)] text-[var(--pos-danger)]'}`}>
                                                    {phase.success ? 'PASS' : 'FAIL'}
                                                </Badge>
                                                <span className="text-xs font-mono text-[var(--pos-text-muted)]">
                                                    {phase.duration}ms
                                                </span>
                                            </div>
                                        </div>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Stress Test Results */}
                {stressTestResult && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <Card className={`bg-[var(--pos-bg-secondary)] border-2 p-8 ${stressTestResult.success ? 'border-[var(--pos-success)]' : 'border-[var(--pos-danger)]'}`}>
                            <div className="flex items-center gap-4 mb-8">
                                <BarChart3 size={48} className="text-[var(--pos-accent)]" />
                                <div>
                                    <h3 className="text-2xl font-black uppercase tracking-tight">Stress Test Results</h3>
                                    <p className="text-xs text-[var(--pos-text-muted)] font-bold uppercase tracking-widest mt-1">
                                        Performance Under Load
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-6">
                                <div className="p-6 bg-[var(--pos-bg-primary)] rounded-xl border border-[var(--pos-border-subtle)]">
                                    <div className="text-4xl font-black text-[var(--pos-accent)] mb-2">
                                        {stressTestResult.transactionsProcessed}
                                    </div>
                                    <div className="text-xs font-black uppercase tracking-widest text-[var(--pos-text-muted)]">
                                        Transactions Processed
                                    </div>
                                </div>

                                <div className="p-6 bg-[var(--pos-bg-primary)] rounded-xl border border-[var(--pos-border-subtle)]">
                                    <div className="text-4xl font-black text-[var(--pos-accent)] mb-2">
                                        {stressTestResult.averageTime.toFixed(2)}ms
                                    </div>
                                    <div className="text-xs font-black uppercase tracking-widest text-[var(--pos-text-muted)]">
                                        Average Time
                                    </div>
                                </div>

                                <div className="p-6 bg-[var(--pos-bg-primary)] rounded-xl border border-[var(--pos-border-subtle)]">
                                    <div className={`text-4xl font-black mb-2 ${stressTestResult.errors === 0 ? 'text-[var(--pos-success)]' : 'text-[var(--pos-danger)]'}`}>
                                        {stressTestResult.errors}
                                    </div>
                                    <div className="text-xs font-black uppercase tracking-widest text-[var(--pos-text-muted)]">
                                        Errors
                                    </div>
                                </div>
                            </div>

                            {stressTestResult.errors > 0 && (
                                <div className="mt-6 p-4 bg-[var(--pos-danger-bg)] border border-[var(--pos-danger)] rounded-xl flex items-center gap-3">
                                    <AlertTriangle size={20} className="text-[var(--pos-danger)]" />
                                    <span className="text-sm font-bold text-[var(--pos-danger)]">
                                        System experienced errors under load. Review logs for details.
                                    </span>
                                </div>
                            )}
                        </Card>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
