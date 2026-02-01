/**
 * Country Compliance Engine
 * Enforces country-specific legal, tax, and labor compliance
 * 
 * SUPPORTED COUNTRIES (Arab Markets):
 * - KSA (Saudi Arabia)
 * - UAE (United Arab Emirates)
 * - Egypt
 * - Jordan
 * - Kuwait
 * 
 * CRITICAL: All calculations must be accurate for real business operations
 */

export interface ComplianceRules {
    countryCode: string;
    countryName: string;
    countryNameAr: string;
    currency: string;

    // Tax Rules
    vatRate: number; // Percentage (e.g., 15 for 15%)
    taxExemptions: string[]; // Exempt categories
    taxRounding: 'UP' | 'DOWN' | 'NEAREST';

    // Labor Rules
    minimumWage?: number; // Monthly minimum wage
    maxHoursPerWeek: number;
    overtimeMultiplier: number; // e.g., 1.5 for time-and-a-half
    mandatoryBreaks: boolean;
    paidLeavePerYear: number; // Days

    // Invoice Requirements
    taxInvoiceRequired: boolean;
    invoiceNumberFormat: string;
    requiredInvoiceFields: string[];

    // Data Protection
    dataRetentionYears: number;
    gdprEquivalent: boolean;

    // Business Registration
    businessRegistrationRequired: boolean;
    taxRegistrationRequired: boolean;
}

// ============================================
// COUNTRY COMPLIANCE DATA
// ============================================

export const COUNTRY_COMPLIANCE_RULES: Record<string, ComplianceRules> = {
    // Saudi Arabia (KSA)
    SA: {
        countryCode: 'SA',
        countryName: 'Saudi Arabia',
        countryNameAr: 'المملكة العربية السعودية',
        currency: 'SAR',

        // Tax (15% VAT since 2020)
        vatRate: 15,
        taxExemptions: ['education', 'healthcare', 'financial_services'],
        taxRounding: 'NEAREST',

        // Labor Laws
        minimumWage: 4000, // SAR per month
        maxHoursPerWeek: 48,
        overtimeMultiplier: 1.5,
        mandatoryBreaks: true,
        paidLeavePerYear: 21,

        // Invoice Requirements (ZATCA compliance)
        taxInvoiceRequired: true,
        invoiceNumberFormat: 'INV-{YEAR}-{SEQUENTIAL}',
        requiredInvoiceFields: [
            'taxNumber',
            'invoiceNumber',
            'invoiceDate',
            'supplierName',
            'supplierAddress',
            'vatAmount',
            'totalAmount',
            'qrCode', // ZATCA requirement
        ],

        // Data Protection
        dataRetentionYears: 7, // Tax records
        gdprEquivalent: false,

        // Business
        businessRegistrationRequired: true,
        taxRegistrationRequired: true,
    },

    // United Arab Emirates (UAE)
    AE: {
        countryCode: 'AE',
        countryName: 'United Arab Emirates',
        countryNameAr: 'الإمارات العربية المتحدة',
        currency: 'AED',

        // Tax (5% VAT since 2018)
        vatRate: 5,
        taxExemptions: ['education', 'healthcare', 'residential_property'],
        taxRounding: 'NEAREST',

        // Labor Laws (no minimum wage, but typical ranges)
        minimumWage: undefined, // No legal minimum
        maxHoursPerWeek: 48,
        overtimeMultiplier: 1.25,
        mandatoryBreaks: true,
        paidLeavePerYear: 30,

        // Invoice Requirements (FTA compliance)
        taxInvoiceRequired: true,
        invoiceNumberFormat: 'UAE-{YEAR}-{SEQUENTIAL}',
        requiredInvoiceFields: [
            'taxNumber',
            'invoiceNumber',
            'invoiceDate',
            'supplierName',
            'vatAmount',
            'totalAmount',
        ],

        // Data Protection
        dataRetentionYears: 5,
        gdprEquivalent: false,

        // Business
        businessRegistrationRequired: true,
        taxRegistrationRequired: true,
    },

    // Egypt
    EG: {
        countryCode: 'EG',
        countryName: 'Egypt',
        countryNameAr: 'مصر',
        currency: 'EGP',

        // Tax (14% VAT)
        vatRate: 14,
        taxExemptions: ['basic_food', 'education', 'healthcare'],
        taxRounding: 'DOWN',

        // Labor Laws
        minimumWage: 4500, // EGP per month (2024)
        maxHoursPerWeek: 48,
        overtimeMultiplier: 1.35,
        mandatoryBreaks: true,
        paidLeavePerYear: 21,

        // Invoice Requirements
        taxInvoiceRequired: true,
        invoiceNumberFormat: 'EG-{YEAR}-{SEQUENTIAL}',
        requiredInvoiceFields: [
            'taxNumber',
            'invoiceNumber',
            'invoiceDate',
            'supplierName',
            'vatAmount',
            'totalAmount',
        ],

        // Data Protection
        dataRetentionYears: 5,
        gdprEquivalent: false,

        // Business
        businessRegistrationRequired: true,
        taxRegistrationRequired: true,
    },

    // Jordan
    JO: {
        countryCode: 'JO',
        countryName: 'Jordan',
        countryNameAr: 'الأردن',
        currency: 'JOD',

        // Tax (16% sales tax)
        vatRate: 16,
        taxExemptions: ['basic_food', 'education', 'healthcare'],
        taxRounding: 'NEAREST',

        // Labor Laws
        minimumWage: 260, // JOD per month
        maxHoursPerWeek: 48,
        overtimeMultiplier: 1.25,
        mandatoryBreaks: true,
        paidLeavePerYear: 14,

        // Invoice Requirements
        taxInvoiceRequired: true,
        invoiceNumberFormat: 'JO-{YEAR}-{SEQUENTIAL}',
        requiredInvoiceFields: [
            'taxNumber',
            'invoiceNumber',
            'invoiceDate',
            'supplierName',
            'vatAmount',
            'totalAmount',
        ],

        // Data Protection
        dataRetentionYears: 5,
        gdprEquivalent: false,

        // Business
        businessRegistrationRequired: true,
        taxRegistrationRequired: true,
    },

    // Kuwait
    KW: {
        countryCode: 'KW',
        countryName: 'Kuwait',
        countryNameAr: 'الكويت',
        currency: 'KWD',

        // Tax (No VAT yet, but planned)
        vatRate: 0, // Will be 5% when implemented
        taxExemptions: [],
        taxRounding: 'NEAREST',

        // Labor Laws
        minimumWage: 75, // KWD per month (for private sector)
        maxHoursPerWeek: 48,
        overtimeMultiplier: 1.25,
        mandatoryBreaks: true,
        paidLeavePerYear: 30,

        // Invoice Requirements
        taxInvoiceRequired: false, // No VAT yet
        invoiceNumberFormat: 'KW-{YEAR}-{SEQUENTIAL}',
        requiredInvoiceFields: [
            'invoiceNumber',
            'invoiceDate',
            'supplierName',
            'totalAmount',
        ],

        // Data Protection
        dataRetentionYears: 5,
        gdprEquivalent: false,

        // Business
        businessRegistrationRequired: true,
        taxRegistrationRequired: false, // No VAT yet
    },
};

// ============================================
// COMPLIANCE ENGINE CLASS
// ============================================

export class ComplianceEngine {
    /**
     * Get compliance rules for a country
     */
    getRules(countryCode: string): ComplianceRules | null {
        const rules = COUNTRY_COMPLIANCE_RULES[countryCode.toUpperCase()];
        if (!rules) {
            console.warn(`[Compliance] No rules found for country: ${countryCode}`);
            return null;
        }
        return rules;
    }

    /**
     * Calculate VAT/Tax for an amount
     */
    calculateTax(amount: number, countryCode: string): {
        subtotal: number;
        taxRate: number;
        taxAmount: number;
        total: number;
        currency: string;
    } {
        const rules = this.getRules(countryCode);

        if (!rules) {
            // Fail-safe: no tax if country unknown
            return {
                subtotal: amount,
                taxRate: 0,
                taxAmount: 0,
                total: amount,
                currency: 'USD',
            };
        }

        const taxRate = rules.vatRate;
        let taxAmount = (amount * taxRate) / 100;

        // Apply rounding rules
        switch (rules.taxRounding) {
            case 'UP':
                taxAmount = Math.ceil(taxAmount * 100) / 100;
                break;
            case 'DOWN':
                taxAmount = Math.floor(taxAmount * 100) / 100;
                break;
            case 'NEAREST':
                taxAmount = Math.round(taxAmount * 100) / 100;
                break;
        }

        return {
            subtotal: amount,
            taxRate,
            taxAmount,
            total: amount + taxAmount,
            currency: rules.currency,
        };
    }

    /**
     * Validate if minimum wage is met
     */
    validateMinimumWage(salary: number, countryCode: string): {
        valid: boolean;
        minimumWage?: number;
        difference?: number;
        message: string;
    } {
        const rules = this.getRules(countryCode);

        if (!rules) {
            return { valid: false, message: 'Unknown country' };
        }

        if (!rules.minimumWage) {
            return { valid: true, message: 'No minimum wage law in this country' };
        }

        if (salary >= rules.minimumWage) {
            return {
                valid: true,
                minimumWage: rules.minimumWage,
                message: 'Salary meets minimum wage',
            };
        }

        return {
            valid: false,
            minimumWage: rules.minimumWage,
            difference: rules.minimumWage - salary,
            message: `Salary below minimum wage by ${rules.currency} ${rules.minimumWage - salary}`,
        };
    }

    /**
     * Calculate overtime pay
     */
    calculateOvertime(
        regularHours: number,
        overtimeHours: number,
        hourlyRate: number,
        countryCode: string
    ): {
        regularPay: number;
        overtimePay: number;
        totalPay: number;
        overtimeMultiplier: number;
    } {
        const rules = this.getRules(countryCode);
        const multiplier = rules?.overtimeMultiplier || 1.5;

        const regularPay = regularHours * hourlyRate;
        const overtimePay = overtimeHours * hourlyRate * multiplier;

        return {
            regularPay,
            overtimePay,
            totalPay: regularPay + overtimePay,
            overtimeMultiplier: multiplier,
        };
    }

    /**
     * Validate invoice format
     */
    validateInvoice(invoice: {
        invoiceNumber?: string;
        taxNumber?: string;
        fields: string[];
    }, countryCode: string): {
        valid: boolean;
        missingFields: string[];
        message: string;
    } {
        const rules = this.getRules(countryCode);

        if (!rules) {
            return { valid: false, missingFields: [], message: 'Unknown country' };
        }

        const missingFields: string[] = [];

        if (rules.taxInvoiceRequired) {
            for (const field of rules.requiredInvoiceFields) {
                if (!invoice.fields.includes(field)) {
                    missingFields.push(field);
                }
            }
        }

        if (missingFields.length > 0) {
            return {
                valid: false,
                missingFields,
                message: `Missing required fields: ${missingFields.join(', ')}`,
            };
        }

        return {
            valid: true,
            missingFields: [],
            message: 'Invoice is compliant',
        };
    }

    /**
     * Generate invoice number
     */
    generateInvoiceNumber(countryCode: string, sequentialNumber: number): string {
        const rules = this.getRules(countryCode);
        const year = new Date().getFullYear();

        if (!rules) {
            return `INV-${year}-${String(sequentialNumber).padStart(6, '0')}`;
        }

        return rules.invoiceNumberFormat
            .replace('{YEAR}', String(year))
            .replace('{SEQUENTIAL}', String(sequentialNumber).padStart(6, '0'));
    }

    /**
     * Check if business registration is required
     */
    requiresBusinessRegistration(countryCode: string): boolean {
        const rules = this.getRules(countryCode);
        return rules?.businessRegistrationRequired || false;
    }

    /**
     * Check if tax registration is required
     */
    requiresTaxRegistration(countryCode: string): boolean {
        const rules = this.getRules(countryCode);
        return rules?.taxRegistrationRequired || false;
    }

    /**
     * Get data retention period
     */
    getDataRetentionPeriod(countryCode: string): number {
        const rules = this.getRules(countryCode);
        return rules?.dataRetentionYears || 5; // Default 5 years
    }

    /**
     * Check if category is tax-exempt
     */
    isTaxExempt(category: string, countryCode: string): boolean {
        const rules = this.getRules(countryCode);
        if (!rules) return false;
        return rules.taxExemptions.includes(category.toLowerCase());
    }

    /**
     * Get all supported countries
     */
    getSupportedCountries(): ComplianceRules[] {
        return Object.values(COUNTRY_COMPLIANCE_RULES);
    }

    /**
     * Get country by code
     */
    getCountryInfo(countryCode: string): {
        code: string;
        name: string;
        nameAr: string;
        currency: string;
        vatRate: number;
    } | null {
        const rules = this.getRules(countryCode);
        if (!rules) return null;

        return {
            code: rules.countryCode,
            name: rules.countryName,
            nameAr: rules.countryNameAr,
            currency: rules.currency,
            vatRate: rules.vatRate,
        };
    }
}

// Singleton instance
export const complianceEngine = new ComplianceEngine();

// Convenience functions
export function calculateTax(amount: number, country: string) {
    return complianceEngine.calculateTax(amount, country);
}

export function validateMinimumWage(salary: number, country: string) {
    return complianceEngine.validateMinimumWage(salary, country);
}

export function generateInvoiceNumber(country: string, sequential: number) {
    return complianceEngine.generateInvoiceNumber(country, sequential);
}

export function getCountryRules(country: string) {
    return complianceEngine.getRules(country);
}
