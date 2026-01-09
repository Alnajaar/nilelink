import { logger } from '../utils/logger';

export interface RegionalCompliance {
    country: string;
    vatRate: number; // Decimal percentage (e.g., 0.05 for 5%)
    requiredReporting: boolean;
    currencyLimit?: number; // Institutional limit for large transactions
}

export const ARAB_COMPLIANCE_MAP: Record<string, RegionalCompliance> = {
    AE: { country: 'United Arab Emirates', vatRate: 0.05, requiredReporting: true, currencyLimit: 500000 },
    SA: { country: 'Saudi Arabia', vatRate: 0.15, requiredReporting: true, currencyLimit: 1000000 },
    EG: { country: 'Egypt', vatRate: 0.14, requiredReporting: true, currencyLimit: 250000 },
    LB: { country: 'Lebanon', vatRate: 0.11, requiredReporting: false },
    JO: { country: 'Jordan', vatRate: 0.16, requiredReporting: true },
    OM: { country: 'Oman', vatRate: 0.05, requiredReporting: true },
    BH: { country: 'Bahrain', vatRate: 0.10, requiredReporting: true },
    KW: { country: 'Kuwait', vatRate: 0.00, requiredReporting: true }, // 5% planned
    QA: { country: 'Qatar', vatRate: 0.00, requiredReporting: true },  // 5% planned
    IQ: { country: 'Iraq', vatRate: 0.00, requiredReporting: false },
    SY: { country: 'Syria', vatRate: 0.00, requiredReporting: false },
    YE: { country: 'Yemen', vatRate: 0.00, requiredReporting: false },
    SD: { country: 'Sudan', vatRate: 0.17, requiredReporting: false },
    LY: { country: 'Libya', vatRate: 0.00, requiredReporting: false },
    TN: { country: 'Tunisia', vatRate: 0.19, requiredReporting: true },
    DZ: { country: 'Algeria', vatRate: 0.19, requiredReporting: true },
    MA: { country: 'Morocco', vatRate: 0.20, requiredReporting: true },
    MR: { country: 'Mauritania', vatRate: 0.16, requiredReporting: false },
    SO: { country: 'Somalia', vatRate: 0.00, requiredReporting: false },
    DJ: { country: 'Djibouti', vatRate: 0.10, requiredReporting: false },
    KM: { country: 'Comoros', vatRate: 0.10, requiredReporting: false },
    PS: { country: 'Palestine', vatRate: 0.16, requiredReporting: true },
};

export class ComplianceBridge {
    private static instance: ComplianceBridge;

    private constructor() { }

    public static getInstance(): ComplianceBridge {
        if (!ComplianceBridge.instance) {
            ComplianceBridge.instance = new ComplianceBridge();
        }
        return ComplianceBridge.instance;
    }

    /**
     * Calculates the regional tax for a given country and amount.
     */
    public calculateRegionalTax(amount: number, countryCode: string): number {
        const compliance = ARAB_COMPLIANCE_MAP[countryCode.toUpperCase()];
        if (!compliance) {
            logger.warn(`No compliance rules found for country: ${countryCode}`);
            return 0;
        }

        return amount * compliance.vatRate;
    }

    /**
     * Checks if a transaction requires institutional reporting in its region.
     */
    public requiresInstitutionalReporting(amount: number, countryCode: string): boolean {
        const compliance = ARAB_COMPLIANCE_MAP[countryCode.toUpperCase()];
        if (!compliance) return false;

        if (compliance.requiredReporting) {
            if (compliance.currencyLimit && amount > compliance.currencyLimit) {
                return true;
            }
            // Add other logic here if needed
        }

        return false;
    }

    /**
     * Returns the full compliance profile for a region.
     */
    public getRegionalProfile(countryCode: string): RegionalCompliance | null {
        return ARAB_COMPLIANCE_MAP[countryCode.toUpperCase()] || null;
    }
}

export const complianceBridge = ComplianceBridge.getInstance();
