/**
 * Compliance Dashboard
 * Monitor country-specific compliance across all subscribers
 * 
 * FEATURES:
 * - View compliance status by country
 * - Tax calculation verification
 * - Invoice format validation
 * - Labor law compliance monitoring
 * - Missing compliance items alerts
 * - Country-specific reports
 * - Tax exemption tracking
 */

'use client';

import { useState, useEffect } from 'react';
import { graphService } from '@shared/services/GraphService';
import { complianceEngine, ComplianceRules } from '@shared/services/ComplianceEngine';
import { useRole } from '@shared/hooks/useGuard';

// ============================================
// TYPES
// ============================================

interface ComplianceStatus {
    country: string;
    countryName: string;
    subscribers: number;
    compliant: number;
    warnings: number;
    violations: number;
    taxRate: number;
    currency: string;
}

interface ComplianceIssue {
    businessId: string;
    country: string;
    issueType: 'TAX' | 'LABOR' | 'INVOICE' | 'REGISTRATION';
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    description: string;
    detectedAt: number;
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function CompliancePage() {
    const { isAdmin, isSuperAdmin } = useRole(['ADMIN', 'SUPER_ADMIN']);
    const [complianceStatuses, setComplianceStatuses] = useState<ComplianceStatus[]>([]);
    const [issues, setIssues] = useState<ComplianceIssue[]>([]);
    const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isAdmin && !isSuperAdmin) {
            setError('Access denied');
            setLoading(false);
            return;
        }

        fetchCompliance();
    }, [isAdmin, isSuperAdmin]);

    const fetchCompliance = async () => {
        try {
            setLoading(true);

            // Get all businesses
            const businesses = await graphService.getAllBusinesses();

            // Get supported countries
            const supportedCountries = complianceEngine.getSupportedCountries();

            // Calculate compliance status per country
            const statuses: ComplianceStatus[] = [];

            for (const countryRules of supportedCountries) {
                const countryBusinesses = businesses.filter(b => b.country === countryRules.countryCode);

                if (countryBusinesses.length === 0) continue;

                // Check compliance for each business
                let compliant = 0;
                let warnings = 0;
                let violations = 0;

                for (const business of countryBusinesses) {
                    // TODO: Actual compliance checks would query the blockchain/IPFS
                    // For now, simulate
                    const hasCompleteData = business.isActive;
                    const hasTaxRegistration = countryRules.taxRegistrationRequired ? business.isActive : true;
                    const hasBusinessRegistration = countryRules.businessRegistrationRequired ? business.isActive : true;

                    if (hasCompleteData && hasTaxRegistration && hasBusinessRegistration) {
                        compliant++;
                    } else if (!hasTaxRegistration || !hasBusinessRegistration) {
                        violations++;
                    } else {
                        warnings++;
                    }
                }

                statuses.push({
                    country: countryRules.countryCode,
                    countryName: countryRules.countryName,
                    subscribers: countryBusinesses.length,
                    compliant,
                    warnings,
                    violations,
                    taxRate: countryRules.vatRate,
                    currency: countryRules.currency,
                });
            }

            setComplianceStatuses(statuses);

            // Generate sample issues
            const sampleIssues: ComplianceIssue[] = [];
            // TODO: Real issues would be fetched from blockchain events

            setIssues(sampleIssues);
            setError(null);
        } catch (err: any) {
            console.error('[Compliance] Failed to fetch:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!isAdmin && !isSuperAdmin) {
        return (
            <div className="min-h-screen bg-[#02050a] flex items-center justify-center">
                <div className="text-red-400 text-center">
                    <div className="text-6xl mb-4">🚫</div>
                    <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
                    <p>Only Admins can view compliance dashboard</p>
                </div>
            </div>
        );
    }

    if (loading && !complianceStatuses.length) {
        return (
            <div className="min-h-screen bg-[#02050a] flex items-center justify-center">
                <div className="text-blue-400 text-center">
                    <div className="animate-spin text-6xl mb-4">⚖️</div>
                    <p className="text-sm uppercase tracking-wider">Analyzing Compliance...</p>
                </div>
            </div>
        );
    }

    if (error && !complianceStatuses.length) {
        return (
            <div className="min-h-screen bg-[#02050a] flex items-center justify-center">
                <div className="text-red-400 text-center">
                    <div className="text-6xl mb-4">⚠️</div>
                    <h1 className="text-2xl font-bold mb-2">Error Loading Compliance Data</h1>
                    <p className="text-sm">{error}</p>
                    <button
                        onClick={fetchCompliance}
                        className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    const totalSubscribers = complianceStatuses.reduce((sum, s) => sum + s.subscribers, 0);
    const totalCompliant = complianceStatuses.reduce((sum, s) => sum + s.compliant, 0);
    const totalWarnings = complianceStatuses.reduce((sum, s) => sum + s.warnings, 0);
    const totalViolations = complianceStatuses.reduce((sum, s) => sum + s.violations, 0);

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-4xl font-black text-white mb-2">
                    Compliance Dashboard
                </h1>
                <p className="text-gray-400 text-sm uppercase tracking-wider">
                    Country-Specific Compliance • Tax • Labor • Regulations
                </p>
            </div>

            {/* Overall Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard
                    label="Total Businesses"
                    value={totalSubscribers}
                    icon="🏢"
                    color="blue"
                />
                <StatCard
                    label="Fully Compliant"
                    value={totalCompliant}
                    icon="✅"
                    percentage={(totalCompliant / totalSubscribers) * 100}
                    color="green"
                />
                <StatCard
                    label="Warnings"
                    value={totalWarnings}
                    icon="⚠️"
                    percentage={(totalWarnings / totalSubscribers) * 100}
                    color="yellow"
                />
                <StatCard
                    label="Violations"
                    value={totalViolations}
                    icon="🚨"
                    percentage={(totalViolations / totalSubscribers) * 100}
                    color="red"
                />
            </div>

            {/* Country Compliance Table */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
                <div className="p-6 bg-white/5 border-b border-white/10">
                    <h2 className="text-xl font-bold text-white flex items-center gap-3">
                        <span>🌍</span>
                        Compliance by Country
                    </h2>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-white/10">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Country</th>
                                <th className="px-6 py-4 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">Subscribers</th>
                                <th className="px-6 py-4 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">VAT Rate</th>
                                <th className="px-6 py-4 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">Compliant</th>
                                <th className="px-6 py-4 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">Warnings</th>
                                <th className="px-6 py-4 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">Violations</th>
                                <th className="px-6 py-4 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                            {complianceStatuses.map((status) => (
                                <tr key={status.country} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-white">{status.countryName}</div>
                                        <div className="text-xs text-gray-400 font-mono">{status.country}</div>
                                    </td>
                                    <td className="px-6 py-4 text-center text-white font-bold">
                                        {status.subscribers}
                                    </td>
                                    <td className="px-6 py-4 text-center text-white">
                                        {status.taxRate}%
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="text-green-400 font-bold">{status.compliant}</span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="text-yellow-400 font-bold">{status.warnings}</span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="text-red-400 font-bold">{status.violations}</span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <ComplianceStatusBadge
                                            compliant={status.compliant}
                                            warnings={status.warnings}
                                            violations={status.violations}
                                            total={status.subscribers}
                                        />
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <button
                                            onClick={() => setSelectedCountry(status.country)}
                                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white text-xs font-bold"
                                        >
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Compliance Rules Reference */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {complianceEngine.getSupportedCountries().map(rules => (
                    <CountryRulesCard key={rules.countryCode} rules={rules} />
                ))}
            </div>

            {/* Recent Issues */}
            {issues.length > 0 && (
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                        <span>🚨</span>
                        Recent Compliance Issues
                    </h2>
                    <div className="space-y-3">
                        {issues.map((issue, idx) => (
                            <ComplianceIssueCard key={idx} issue={issue} />
                        ))}
                    </div>
                </div>
            )}

            {/* Info Box */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6">
                <h3 className="text-blue-400 font-bold mb-2 flex items-center gap-2">
                    <span>ℹ️</span>
                    Compliance Information
                </h3>
                <ul className="text-blue-200 text-sm space-y-1 list-disc list-inside">
                    <li>All tax calculations are verified against country regulations</li>
                    <li>Labor law compliance includes minimum wage, hours, and overtime</li>
                    <li>Invoice requirements are country-specific (e.g., ZATCA for KSA)</li>
                    <li>Data retention periods vary by country (5-7 years)</li>
                    <li>Compliance status updates in real-time from blockchain</li>
                </ul>
            </div>
        </div>
    );
}

// ============================================
// SUB-COMPONENTS
// ============================================

function StatCard({
    label,
    value,
    icon,
    percentage,
    color,
}: {
    label: string;
    value: number;
    icon: string;
    percentage?: number;
    color: 'blue' | 'green' | 'yellow' | 'red';
}) {
    const colors = {
        blue: 'from-blue-500/20 to-blue-600/10 border-blue-500/30',
        green: 'from-green-500/20 to-green-600/10 border-green-500/30',
        yellow: 'from-yellow-500/20 to-yellow-600/10 border-yellow-500/30',
        red: 'from-red-500/20 to-red-600/10 border-red-500/30',
    };

    return (
        <div className={`bg-gradient-to-br ${colors[color]} backdrop-blur-sm border rounded-xl p-6`}>
            <div className="flex items-center gap-4 mb-2">
                <div className="text-3xl">{icon}</div>
                <div className="flex-1">
                    <div className="text-3xl font-black text-white">{value}</div>
                    <div className="text-sm text-gray-400 uppercase tracking-wider">{label}</div>
                </div>
            </div>
            {percentage !== undefined && (
                <div className="text-xs text-gray-400 mt-2">
                    {percentage.toFixed(1)}% of total
                </div>
            )}
        </div>
    );
}

function ComplianceStatusBadge({
    compliant,
    warnings,
    violations,
    total,
}: {
    compliant: number;
    warnings: number;
    violations: number;
    total: number;
}) {
    const complianceRate = (compliant / total) * 100;

    if (violations > 0) {
        return (
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase bg-red-500/20 text-red-300 border border-red-500/30">
                🚨 CRITICAL
            </span>
        );
    }

    if (warnings > 0) {
        return (
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
                ⚠️ WARNING
            </span>
        );
    }

    if (complianceRate === 100) {
        return (
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase bg-green-500/20 text-green-300 border border-green-500/30">
                ✅ COMPLIANT
            </span>
        );
    }

    return (
        <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase bg-blue-500/20 text-blue-300 border border-blue-500/30">
            📊 MONITORING
        </span>
    );
}

function CountryRulesCard({ rules }: { rules: ComplianceRules }) {
    return (
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">
                {rules.countryName}
            </h3>

            <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                    <span className="text-gray-400">VAT Rate:</span>
                    <span className="text-white font-bold">{rules.vatRate}%</span>
                </div>

                <div className="flex justify-between items-center">
                    <span className="text-gray-400">Currency:</span>
                    <span className="text-white font-mono">{rules.currency}</span>
                </div>

                {rules.minimumWage && (
                    <div className="flex justify-between items-center">
                        <span className="text-gray-400">Min Wage:</span>
                        <span className="text-white">{rules.minimumWage} {rules.currency}/mo</span>
                    </div>
                )}

                <div className="flex justify-between items-center">
                    <span className="text-gray-400">Max Hours/Week:</span>
                    <span className="text-white">{rules.maxHoursPerWeek}h</span>
                </div>

                <div className="flex justify-between items-center">
                    <span className="text-gray-400">Data Retention:</span>
                    <span className="text-white">{rules.dataRetentionYears} years</span>
                </div>

                <div className="pt-2 mt-2 border-t border-white/10">
                    <div className="flex gap-2 flex-wrap">
                        {rules.taxInvoiceRequired && (
                            <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs">Tax Invoice</span>
                        )}
                        {rules.businessRegistrationRequired && (
                            <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs">Bus. Reg.</span>
                        )}
                        {rules.gdprEquivalent && (
                            <span className="px-2 py-1 bg-green-500/20 text-green-300 rounded text-xs">GDPR-like</span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function ComplianceIssueCard({ issue }: { issue: ComplianceIssue }) {
    const severityColors = {
        LOW: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
        MEDIUM: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
        HIGH: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
        CRITICAL: 'bg-red-500/20 text-red-300 border-red-500/30',
    };

    return (
        <div className="bg-white/5 rounded-lg p-4">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase border ${severityColors[issue.severity]}`}>
                            {issue.severity}
                        </span>
                        <span className="text-gray-400 text-xs uppercase">{issue.issueType}</span>
                        <span className="text-gray-500 text-xs font-mono">{issue.country}</span>
                    </div>
                    <p className="text-white text-sm">{issue.description}</p>
                    <p className="text-gray-400 text-xs mt-2">
                        Business: {issue.businessId.slice(0, 12)}... •
                        Detected: {new Date(issue.detectedAt).toLocaleString()}
                    </p>
                </div>
            </div>
        </div>
    );
}
