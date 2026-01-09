import { logger } from '../utils/logger';

export interface CurrencyInfo {
    code: string;
    name: string;
    symbol: string;
    precision: number;
    region: string;
}

export const ARAB_CURRENCIES: Record<string, CurrencyInfo> = {
    AED: { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', precision: 2, region: 'GCC' },
    SAR: { code: 'SAR', name: 'Saudi Riyal', symbol: 'ر.س', precision: 2, region: 'GCC' },
    KWD: { code: 'KWD', name: 'Kuwaiti Dinar', symbol: 'د.ك', precision: 3, region: 'GCC' },
    QAR: { code: 'QAR', name: 'Qatari Riyal', symbol: 'ر.ق', precision: 2, region: 'GCC' },
    BHD: { code: 'BHD', name: 'Bahraini Dinar', symbol: 'د.ب', precision: 3, region: 'GCC' },
    OMR: { code: 'OMR', name: 'Omani Rial', symbol: 'ر.ع.', precision: 3, region: 'GCC' },
    EGP: { code: 'EGP', name: 'Egyptian Pound', symbol: 'ج.م', precision: 2, region: 'North Africa' },
    LBP: { code: 'LBP', name: 'Lebanese Pound', symbol: 'ل.ل', precision: 0, region: 'Levant' },
    JOD: { code: 'JOD', name: 'Jordanian Dinar', symbol: 'د.أ', precision: 3, region: 'Levant' },
    IQD: { code: 'IQD', name: 'Iraqi Dinar', symbol: 'د.ع', precision: 0, region: 'Levant' },
    SYP: { code: 'SYP', name: 'Syrian Pound', symbol: 'ل.س', precision: 0, region: 'Levant' },
    YER: { code: 'YER', name: 'Yemeni Rial', symbol: 'ر.ي', precision: 0, region: 'Arabian Peninsula' },
    SDG: { code: 'SDG', name: 'Sudanese Pound', symbol: 'ج.س.', precision: 2, region: 'North Africa' },
    LYD: { code: 'LYD', name: 'Libyan Dinar', symbol: 'د.ل', precision: 3, region: 'North Africa' },
    TND: { code: 'TND', name: 'Tunisian Dinar', symbol: 'د.ت', precision: 3, region: 'North Africa' },
    DZD: { code: 'DZD', name: 'Algerian Dinar', symbol: 'د.ج', precision: 2, region: 'North Africa' },
    MAD: { code: 'MAD', name: 'Moroccan Dirham', symbol: 'د.م.', precision: 2, region: 'North Africa' },
    MRU: { code: 'MRU', name: 'Mauritanian Ouguiya', symbol: 'أ.م', precision: 1, region: 'North Africa' },
    SOS: { code: 'SOS', name: 'Somali Shilling', symbol: 'Sh.So.', precision: 2, region: 'Horn of Africa' },
    DJF: { code: 'DJF', name: 'Djiboutian Franc', symbol: 'Fdj', precision: 0, region: 'Horn of Africa' },
    KMF: { code: 'KMF', name: 'Comorian Franc', symbol: 'CF', precision: 0, region: 'East Africa' },
    ILS: { code: 'ILS', name: 'Israeli New Shekel', symbol: '₪', precision: 2, region: 'Levant' }, // Used in Palestine
};

export class MultiCurrencyService {
    private static instance: MultiCurrencyService;
    private rates: Map<string, number> = new Map(); // Rates against USD
    private lastFetch: Date | null = null;

    private constructor() {
        // Initial mock rates for Arab currencies (approximate)
        this.rates.set('AED', 3.67);
        this.rates.set('SAR', 3.75);
        this.rates.set('EGP', 30.90);
        this.rates.set('LBP', 89500);
        this.rates.set('JOD', 0.71);
        this.rates.set('IQD', 1310);
        this.rates.set('KWD', 0.31);
        this.rates.set('QAR', 3.64);
        this.rates.set('BHD', 0.38);
        this.rates.set('OMR', 0.38);
        this.rates.set('YER', 250);
        this.rates.set('SYP', 13000);
        this.rates.set('SDG', 600);
        this.rates.set('LYD', 4.80);
        this.rates.set('TND', 3.10);
        this.rates.set('DZD', 135);
        this.rates.set('MAD', 10.10);
        this.rates.set('MRU', 38);
        this.rates.set('SOS', 570);
        this.rates.set('DJF', 178);
        this.rates.set('KMF', 450);
        this.rates.set('ILS', 3.70);
    }

    public static getInstance(): MultiCurrencyService {
        if (!MultiCurrencyService.instance) {
            MultiCurrencyService.instance = new MultiCurrencyService();
        }
        return MultiCurrencyService.instance;
    }

    /**
     * Converts an amount from one currency to another.
     * Uses a 'Volatility Buffer' for institutional safety.
     */
    public convert(amount: number, from: string, to: string, includeBuffer: boolean = true): number {
        if (from === to) return amount;

        const fromRate = from === 'USD' ? 1 : this.rates.get(from);
        const toRate = to === 'USD' ? 1 : this.rates.get(to);

        if (!fromRate || !toRate) {
            logger.error(`Unsupported currency pair: ${from} -> ${to}`);
            return amount;
        }

        // Convert to USD first, then to target
        const amountInUSD = amount / fromRate;
        let convertedAmount = amountInUSD * toRate;

        // Apply institutional volatility buffer (e.g. 5%) if requested
        if (includeBuffer) {
            convertedAmount = convertedAmount * 1.05;
        }

        return Number(convertedAmount.toFixed(ARAB_CURRENCIES[to]?.precision || 2));
    }

    /**
     * Formats an amount for display in the target Arab currency.
     */
    public format(amount: number, currencyCode: string): string {
        const currency = ARAB_CURRENCIES[currencyCode];
        if (!currency) return `${amount} ${currencyCode}`;

        return new Intl.NumberFormat('ar-EG', {
            style: 'currency',
            currency: currencyCode,
            minimumFractionDigits: currency.precision
        }).format(amount);
    }

    /**
     * Updates FX rates from a global oracle (simulated).
     */
    public async refreshRates() {
        logger.info('Refreshing Arab Region FX rates via Protocol Oracle...');
        // In production, this would call an external API or chain oracle
        this.lastFetch = new Date();
    }
}

export const multiCurrencyService = MultiCurrencyService.getInstance();
