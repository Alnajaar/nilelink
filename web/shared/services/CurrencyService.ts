/**
 * Currency Service - Multi-Currency Support
 * 
 * Base Currency: USD
 * Supports 120+ currencies with automatic detection based on user location
 * Real-time exchange rates and conversion
 */

export interface Currency {
    code: string;
    name: string;
    symbol: string;
    country: string;
    region: string;
    decimalPlaces: number;
}

export interface ExchangeRate {
    from: string;
    to: string;
    rate: number;
    lastUpdated: number;
}

export interface CurrencyConversion {
    amount: number;
    fromCurrency: string;
    toCurrency: string;
    convertedAmount: number;
    rate: number;
}

// Comprehensive currency database - 120+ currencies
export const CURRENCIES: Record<string, Currency> = {
    // Arabian Countries (Priority)
    'AED': { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', country: 'United Arab Emirates', region: 'Middle East', decimalPlaces: 2 },
    'SAR': { code: 'SAR', name: 'Saudi Riyal', symbol: 'ر.س', country: 'Saudi Arabia', region: 'Middle East', decimalPlaces: 2 },
    'QAR': { code: 'QAR', name: 'Qatari Riyal', symbol: 'ر.ق', country: 'Qatar', region: 'Middle East', decimalPlaces: 2 },
    'KWD': { code: 'KWD', name: 'Kuwaiti Dinar', symbol: 'د.ك', country: 'Kuwait', region: 'Middle East', decimalPlaces: 3 },
    'BHD': { code: 'BHD', name: 'Bahraini Dinar', symbol: 'د.ب', country: 'Bahrain', region: 'Middle East', decimalPlaces: 3 },
    'OMR': { code: 'OMR', name: 'Omani Rial', symbol: 'ر.ع.', country: 'Oman', region: 'Middle East', decimalPlaces: 3 },
    'JOD': { code: 'JOD', name: 'Jordanian Dinar', symbol: 'د.ا', country: 'Jordan', region: 'Middle East', decimalPlaces: 3 },
    'EGP': { code: 'EGP', name: 'Egyptian Pound', symbol: 'ج.م', country: 'Egypt', region: 'Middle East', decimalPlaces: 2 },
    'LBP': { code: 'LBP', name: 'Lebanese Pound', symbol: 'ل.ل', country: 'Lebanon', region: 'Middle East', decimalPlaces: 2 },
    'SYP': { code: 'SYP', name: 'Syrian Pound', symbol: 'ل.س', country: 'Syria', region: 'Middle East', decimalPlaces: 2 },
    'IQD': { code: 'IQD', name: 'Iraqi Dinar', symbol: 'ع.د', country: 'Iraq', region: 'Middle East', decimalPlaces: 3 },
    'YER': { code: 'YER', name: 'Yemeni Rial', symbol: '﷼', country: 'Yemen', region: 'Middle East', decimalPlaces: 2 },
    'SDG': { code: 'SDG', name: 'Sudanese Pound', symbol: 'ج.س.', country: 'Sudan', region: 'Middle East', decimalPlaces: 2 },
    'MAD': { code: 'MAD', name: 'Moroccan Dirham', symbol: 'د.م.', country: 'Morocco', region: 'North Africa', decimalPlaces: 2 },
    'TND': { code: 'TND', name: 'Tunisian Dinar', symbol: 'د.ت', country: 'Tunisia', region: 'North Africa', decimalPlaces: 3 },
    'DZD': { code: 'DZD', name: 'Algerian Dinar', symbol: 'د.ج', country: 'Algeria', region: 'North Africa', decimalPlaces: 2 },
    'LYD': { code: 'LYD', name: 'Libyan Dinar', symbol: 'ل.د', country: 'Libya', region: 'North Africa', decimalPlaces: 3 },
    'MRU': { code: 'MRU', name: 'Mauritanian Ouguiya', symbol: 'UM', country: 'Mauritania', region: 'North Africa', decimalPlaces: 2 },

    // Base Currency
    'USD': { code: 'USD', name: 'US Dollar', symbol: '$', country: 'United States', region: 'North America', decimalPlaces: 2 },

    // Major Currencies
    'EUR': { code: 'EUR', name: 'Euro', symbol: '€', country: 'Eurozone', region: 'Europe', decimalPlaces: 2 },
    'GBP': { code: 'GBP', name: 'British Pound', symbol: '£', country: 'United Kingdom', region: 'Europe', decimalPlaces: 2 },
    'JPY': { code: 'JPY', name: 'Japanese Yen', symbol: '¥', country: 'Japan', region: 'Asia', decimalPlaces: 0 },
    'CNY': { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', country: 'China', region: 'Asia', decimalPlaces: 2 },
    'CHF': { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', country: 'Switzerland', region: 'Europe', decimalPlaces: 2 },
    'CAD': { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', country: 'Canada', region: 'North America', decimalPlaces: 2 },
    'AUD': { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', country: 'Australia', region: 'Oceania', decimalPlaces: 2 },
    'NZD': { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$', country: 'New Zealand', region: 'Oceania', decimalPlaces: 2 },

    // Asian Currencies
    'INR': { code: 'INR', name: 'Indian Rupee', symbol: '₹', country: 'India', region: 'Asia', decimalPlaces: 2 },
    'PKR': { code: 'PKR', name: 'Pakistani Rupee', symbol: '₨', country: 'Pakistan', region: 'Asia', decimalPlaces: 2 },
    'BDT': { code: 'BDT', name: 'Bangladeshi Taka', symbol: '৳', country: 'Bangladesh', region: 'Asia', decimalPlaces: 2 },
    'LKR': { code: 'LKR', name: 'Sri Lankan Rupee', symbol: 'Rs', country: 'Sri Lanka', region: 'Asia', decimalPlaces: 2 },
    'NPR': { code: 'NPR', name: 'Nepalese Rupee', symbol: 'Rs', country: 'Nepal', region: 'Asia', decimalPlaces: 2 },
    'THB': { code: 'THB', name: 'Thai Baht', symbol: '฿', country: 'Thailand', region: 'Asia', decimalPlaces: 2 },
    'MYR': { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM', country: 'Malaysia', region: 'Asia', decimalPlaces: 2 },
    'SGD': { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', country: 'Singapore', region: 'Asia', decimalPlaces: 2 },
    'IDR': { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp', country: 'Indonesia', region: 'Asia', decimalPlaces: 0 },
    'PHP': { code: 'PHP', name: 'Philippine Peso', symbol: '₱', country: 'Philippines', region: 'Asia', decimalPlaces: 2 },
    'VND': { code: 'VND', name: 'Vietnamese Dong', symbol: '₫', country: 'Vietnam', region: 'Asia', decimalPlaces: 0 },
    'KRW': { code: 'KRW', name: 'South Korean Won', symbol: '₩', country: 'South Korea', region: 'Asia', decimalPlaces: 0 },
    'TWD': { code: 'TWD', name: 'Taiwan Dollar', symbol: 'NT$', country: 'Taiwan', region: 'Asia', decimalPlaces: 2 },
    'HKD': { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$', country: 'Hong Kong', region: 'Asia', decimalPlaces: 2 },
    'KHR': { code: 'KHR', name: 'Cambodian Riel', symbol: '៛', country: 'Cambodia', region: 'Asia', decimalPlaces: 2 },
    'LAK': { code: 'LAK', name: 'Lao Kip', symbol: '₭', country: 'Laos', region: 'Asia', decimalPlaces: 2 },
    'MMK': { code: 'MMK', name: 'Myanmar Kyat', symbol: 'K', country: 'Myanmar', region: 'Asia', decimalPlaces: 2 },
    'BND': { code: 'BND', name: 'Brunei Dollar', symbol: 'B$', country: 'Brunei', region: 'Asia', decimalPlaces: 2 },

    // European Currencies
    'SEK': { code: 'SEK', name: 'Swedish Krona', symbol: 'kr', country: 'Sweden', region: 'Europe', decimalPlaces: 2 },
    'NOK': { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr', country: 'Norway', region: 'Europe', decimalPlaces: 2 },
    'DKK': { code: 'DKK', name: 'Danish Krone', symbol: 'kr', country: 'Denmark', region: 'Europe', decimalPlaces: 2 },
    'PLN': { code: 'PLN', name: 'Polish Zloty', symbol: 'zł', country: 'Poland', region: 'Europe', decimalPlaces: 2 },
    'CZK': { code: 'CZK', name: 'Czech Koruna', symbol: 'Kč', country: 'Czech Republic', region: 'Europe', decimalPlaces: 2 },
    'HUF': { code: 'HUF', name: 'Hungarian Forint', symbol: 'Ft', country: 'Hungary', region: 'Europe', decimalPlaces: 0 },
    'RON': { code: 'RON', name: 'Romanian Leu', symbol: 'lei', country: 'Romania', region: 'Europe', decimalPlaces: 2 },
    'BGN': { code: 'BGN', name: 'Bulgarian Lev', symbol: 'лв', country: 'Bulgaria', region: 'Europe', decimalPlaces: 2 },
    'HRK': { code: 'HRK', name: 'Croatian Kuna', symbol: 'kn', country: 'Croatia', region: 'Europe', decimalPlaces: 2 },
    'RSD': { code: 'RSD', name: 'Serbian Dinar', symbol: 'дин', country: 'Serbia', region: 'Europe', decimalPlaces: 2 },
    'UAH': { code: 'UAH', name: 'Ukrainian Hryvnia', symbol: '₴', country: 'Ukraine', region: 'Europe', decimalPlaces: 2 },
    'RUB': { code: 'RUB', name: 'Russian Ruble', symbol: '₽', country: 'Russia', region: 'Europe', decimalPlaces: 2 },
    'TRY': { code: 'TRY', name: 'Turkish Lira', symbol: '₺', country: 'Turkey', region: 'Europe', decimalPlaces: 2 },
    'ISK': { code: 'ISK', name: 'Icelandic Krona', symbol: 'kr', country: 'Iceland', region: 'Europe', decimalPlaces: 0 },

    // African Currencies
    'ZAR': { code: 'ZAR', name: 'South African Rand', symbol: 'R', country: 'South Africa', region: 'Africa', decimalPlaces: 2 },
    'NGN': { code: 'NGN', name: 'Nigerian Naira', symbol: '₦', country: 'Nigeria', region: 'Africa', decimalPlaces: 2 },
    'KES': { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh', country: 'Kenya', region: 'Africa', decimalPlaces: 2 },
    'GHS': { code: 'GHS', name: 'Ghanaian Cedi', symbol: 'GH₵', country: 'Ghana', region: 'Africa', decimalPlaces: 2 },
    'UGX': { code: 'UGX', name: 'Ugandan Shilling', symbol: 'USh', country: 'Uganda', region: 'Africa', decimalPlaces: 0 },
    'TZS': { code: 'TZS', name: 'Tanzanian Shilling', symbol: 'TSh', country: 'Tanzania', region: 'Africa', decimalPlaces: 2 },
    'ETB': { code: 'ETB', name: 'Ethiopian Birr', symbol: 'Br', country: 'Ethiopia', region: 'Africa', decimalPlaces: 2 },
    'XOF': { code: 'XOF', name: 'West African CFA Franc', symbol: 'CFA', country: 'West Africa', region: 'Africa', decimalPlaces: 0 },
    'XAF': { code: 'XAF', name: 'Central African CFA Franc', symbol: 'FCFA', country: 'Central Africa', region: 'Africa', decimalPlaces: 0 },
    'MWK': { code: 'MWK', name: 'Malawian Kwacha', symbol: 'MK', country: 'Malawi', region: 'Africa', decimalPlaces: 2 },
    'ZMW': { code: 'ZMW', name: 'Zambian Kwacha', symbol: 'ZK', country: 'Zambia', region: 'Africa', decimalPlaces: 2 },
    'BWP': { code: 'BWP', name: 'Botswana Pula', symbol: 'P', country: 'Botswana', region: 'Africa', decimalPlaces: 2 },
    'MUR': { code: 'MUR', name: 'Mauritian Rupee', symbol: '₨', country: 'Mauritius', region: 'Africa', decimalPlaces: 2 },
    'SCR': { code: 'SCR', name: 'Seychellois Rupee', symbol: '₨', country: 'Seychelles', region: 'Africa', decimalPlaces: 2 },

    // Latin American Currencies
    'MXN': { code: 'MXN', name: 'Mexican Peso', symbol: '$', country: 'Mexico', region: 'Latin America', decimalPlaces: 2 },
    'BRL': { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', country: 'Brazil', region: 'Latin America', decimalPlaces: 2 },
    'ARS': { code: 'ARS', name: 'Argentine Peso', symbol: '$', country: 'Argentina', region: 'Latin America', decimalPlaces: 2 },
    'CLP': { code: 'CLP', name: 'Chilean Peso', symbol: '$', country: 'Chile', region: 'Latin America', decimalPlaces: 0 },
    'COP': { code: 'COP', name: 'Colombian Peso', symbol: '$', country: 'Colombia', region: 'Latin America', decimalPlaces: 2 },
    'PEN': { code: 'PEN', name: 'Peruvian Sol', symbol: 'S/', country: 'Peru', region: 'Latin America', decimalPlaces: 2 },
    'VES': { code: 'VES', name: 'Venezuelan Bolívar', symbol: 'Bs.', country: 'Venezuela', region: 'Latin America', decimalPlaces: 2 },
    'UYU': { code: 'UYU', name: 'Uruguayan Peso', symbol: '$U', country: 'Uruguay', region: 'Latin America', decimalPlaces: 2 },
    'PYG': { code: 'PYG', name: 'Paraguayan Guarani', symbol: '₲', country: 'Paraguay', region: 'Latin America', decimalPlaces: 0 },
    'BOB': { code: 'BOB', name: 'Bolivian Boliviano', symbol: 'Bs.', country: 'Bolivia', region: 'Latin America', decimalPlaces: 2 },
    'CRC': { code: 'CRC', name: 'Costa Rican Colón', symbol: '₡', country: 'Costa Rica', region: 'Latin America', decimalPlaces: 2 },
    'GTQ': { code: 'GTQ', name: 'Guatemalan Quetzal', symbol: 'Q', country: 'Guatemala', region: 'Latin America', decimalPlaces: 2 },
    'HNL': { code: 'HNL', name: 'Honduran Lempira', symbol: 'L', country: 'Honduras', region: 'Latin America', decimalPlaces: 2 },
    'NIO': { code: 'NIO', name: 'Nicaraguan Córdoba', symbol: 'C$', country: 'Nicaragua', region: 'Latin America', decimalPlaces: 2 },
    'PAB': { code: 'PAB', name: 'Panamanian Balboa', symbol: 'B/.', country: 'Panama', region: 'Latin America', decimalPlaces: 2 },
    'DOP': { code: 'DOP', name: 'Dominican Peso', symbol: 'RD$', country: 'Dominican Republic', region: 'Latin America', decimalPlaces: 2 },
    'JMD': { code: 'JMD', name: 'Jamaican Dollar', symbol: 'J$', country: 'Jamaica', region: 'Caribbean', decimalPlaces: 2 },
    'TTD': { code: 'TTD', name: 'Trinidad and Tobago Dollar', symbol: 'TT$', country: 'Trinidad and Tobago', region: 'Caribbean', decimalPlaces: 2 },
    'BBD': { code: 'BBD', name: 'Barbadian Dollar', symbol: 'Bds$', country: 'Barbados', region: 'Caribbean', decimalPlaces: 2 },

    // Other Currencies
    'ILS': { code: 'ILS', name: 'Israeli Shekel', symbol: '₪', country: 'Israel', region: 'Middle East', decimalPlaces: 2 },
    'IRR': { code: 'IRR', name: 'Iranian Rial', symbol: '﷼', country: 'Iran', region: 'Middle East', decimalPlaces: 2 },
    'AFN': { code: 'AFN', name: 'Afghan Afghani', symbol: '؋', country: 'Afghanistan', region: 'Asia', decimalPlaces: 2 },
    'AMD': { code: 'AMD', name: 'Armenian Dram', symbol: '֏', country: 'Armenia', region: 'Asia', decimalPlaces: 2 },
    'AZN': { code: 'AZN', name: 'Azerbaijani Manat', symbol: '₼', country: 'Azerbaijan', region: 'Asia', decimalPlaces: 2 },
    'GEL': { code: 'GEL', name: 'Georgian Lari', symbol: '₾', country: 'Georgia', region: 'Asia', decimalPlaces: 2 },
    'KZT': { code: 'KZT', name: 'Kazakhstani Tenge', symbol: '₸', country: 'Kazakhstan', region: 'Asia', decimalPlaces: 2 },
    'UZS': { code: 'UZS', name: 'Uzbekistani Som', symbol: 'soʻm', country: 'Uzbekistan', region: 'Asia', decimalPlaces: 2 },
    'TMT': { code: 'TMT', name: 'Turkmenistani Manat', symbol: 'm', country: 'Turkmenistan', region: 'Asia', decimalPlaces: 2 },
    'KGS': { code: 'KGS', name: 'Kyrgyzstani Som', symbol: 'с', country: 'Kyrgyzstan', region: 'Asia', decimalPlaces: 2 },
    'TJS': { code: 'TJS', name: 'Tajikistani Somoni', symbol: 'ЅМ', country: 'Tajikistan', region: 'Asia', decimalPlaces: 2 },
    'MNT': { code: 'MNT', name: 'Mongolian Tugrik', symbol: '₮', country: 'Mongolia', region: 'Asia', decimalPlaces: 2 },
    'KPW': { code: 'KPW', name: 'North Korean Won', symbol: '₩', country: 'North Korea', region: 'Asia', decimalPlaces: 2 },
    'MVR': { code: 'MVR', name: 'Maldivian Rufiyaa', symbol: 'Rf', country: 'Maldives', region: 'Asia', decimalPlaces: 2 },
    'BTN': { code: 'BTN', name: 'Bhutanese Ngultrum', symbol: 'Nu.', country: 'Bhutan', region: 'Asia', decimalPlaces: 2 },
    'FJD': { code: 'FJD', name: 'Fijian Dollar', symbol: 'FJ$', country: 'Fiji', region: 'Oceania', decimalPlaces: 2 },
    'PGK': { code: 'PGK', name: 'Papua New Guinean Kina', symbol: 'K', country: 'Papua New Guinea', region: 'Oceania', decimalPlaces: 2 },
    'WST': { code: 'WST', name: 'Samoan Tala', symbol: 'T', country: 'Samoa', region: 'Oceania', decimalPlaces: 2 },
    'TOP': { code: 'TOP', name: 'Tongan Paʻanga', symbol: 'T$', country: 'Tonga', region: 'Oceania', decimalPlaces: 2 },
    'VUV': { code: 'VUV', name: 'Vanuatu Vatu', symbol: 'VT', country: 'Vanuatu', region: 'Oceania', decimalPlaces: 0 },
};

// Country to currency mapping
export const COUNTRY_TO_CURRENCY: Record<string, string> = {
    // Arabian Countries
    'AE': 'AED', 'SA': 'SAR', 'QA': 'QAR', 'KW': 'KWD', 'BH': 'BHD', 'OM': 'OMR',
    'JO': 'JOD', 'EG': 'EGP', 'LB': 'LBP', 'SY': 'SYP', 'IQ': 'IQD', 'YE': 'YER',
    'SD': 'SDG', 'MA': 'MAD', 'TN': 'TND', 'DZ': 'DZD', 'LY': 'LYD', 'MR': 'MRU',

    // Major Countries
    'US': 'USD', 'GB': 'GBP', 'JP': 'JPY', 'CN': 'CNY', 'CH': 'CHF', 'CA': 'CAD',
    'AU': 'AUD', 'NZ': 'NZD',

    // European Union
    'DE': 'EUR', 'FR': 'EUR', 'IT': 'EUR', 'ES': 'EUR', 'NL': 'EUR', 'BE': 'EUR',
    'AT': 'EUR', 'PT': 'EUR', 'GR': 'EUR', 'FI': 'EUR', 'IE': 'EUR', 'LU': 'EUR',
    'SK': 'EUR', 'SI': 'EUR', 'EE': 'EUR', 'LV': 'EUR', 'LT': 'EUR', 'CY': 'EUR',
    'MT': 'EUR',

    // Asia
    'IN': 'INR', 'PK': 'PKR', 'BD': 'BDT', 'LK': 'LKR', 'NP': 'NPR', 'TH': 'THB',
    'MY': 'MYR', 'SG': 'SGD', 'ID': 'IDR', 'PH': 'PHP', 'VN': 'VND', 'KR': 'KRW',
    'TW': 'TWD', 'HK': 'HKD', 'KH': 'KHR', 'LA': 'LAK', 'MM': 'MMK', 'BN': 'BND',

    // Europe (Non-EU)
    'SE': 'SEK', 'NO': 'NOK', 'DK': 'DKK', 'PL': 'PLN', 'CZ': 'CZK', 'HU': 'HUF',
    'RO': 'RON', 'BG': 'BGN', 'HR': 'HRK', 'RS': 'RSD', 'UA': 'UAH', 'RU': 'RUB',
    'TR': 'TRY', 'IS': 'ISK',

    // Africa
    'ZA': 'ZAR', 'NG': 'NGN', 'KE': 'KES', 'GH': 'GHS', 'UG': 'UGX', 'TZ': 'TZS',
    'ET': 'ETB', 'MW': 'MWK', 'ZM': 'ZMW', 'BW': 'BWP', 'MU': 'MUR', 'SC': 'SCR',

    // Latin America
    'MX': 'MXN', 'BR': 'BRL', 'AR': 'ARS', 'CL': 'CLP', 'CO': 'COP', 'PE': 'PEN',
    'VE': 'VES', 'UY': 'UYU', 'PY': 'PYG', 'BO': 'BOB', 'CR': 'CRC', 'GT': 'GTQ',
    'HN': 'HNL', 'NI': 'NIO', 'PA': 'PAB', 'DO': 'DOP', 'JM': 'JMD', 'TT': 'TTD',
    'BB': 'BBD',

    // Others
    'IL': 'ILS', 'IR': 'IRR', 'AF': 'AFN', 'AM': 'AMD', 'AZ': 'AZN', 'GE': 'GEL',
    'KZ': 'KZT', 'UZ': 'UZS', 'TM': 'TMT', 'KG': 'KGS', 'TJ': 'TJS', 'MN': 'MNT',
    'KP': 'KPW', 'MV': 'MVR', 'BT': 'BTN', 'FJ': 'FJD', 'PG': 'PGK', 'WS': 'WST',
    'TO': 'TOP', 'VU': 'VUV',
};

export class CurrencyService {
    private static instance: CurrencyService;
    private baseCurrency: string = 'USD';
    private exchangeRates: Map<string, ExchangeRate> = new Map();
    private lastUpdate: number = 0;
    private updateInterval: number = 3600000; // 1 hour

    private constructor() {
        this.initializeExchangeRates();
    }

    static getInstance(): CurrencyService {
        if (!CurrencyService.instance) {
            CurrencyService.instance = new CurrencyService();
        }
        return CurrencyService.instance;
    }

    /**
     * Initialize exchange rates (in production, fetch from API)
     */
    private async initializeExchangeRates(): Promise<void> {
        // In production, fetch from API like exchangerate-api.com or openexchangerates.org
        // For now, using approximate rates (as of Dec 2025)
        const rates: Record<string, number> = {
            // Arabian Countries
            'AED': 3.67, 'SAR': 3.75, 'QAR': 3.64, 'KWD': 0.31, 'BHD': 0.38, 'OMR': 0.38,
            'JOD': 0.71, 'EGP': 49.00, 'LBP': 89500, 'SYP': 13000, 'IQD': 1310, 'YER': 250,
            'SDG': 600, 'MAD': 10.00, 'TND': 3.10, 'DZD': 135, 'LYD': 4.80, 'MRU': 39.50,

            // Major Currencies
            'USD': 1.00, 'EUR': 0.92, 'GBP': 0.79, 'JPY': 149.50, 'CNY': 7.24, 'CHF': 0.88,
            'CAD': 1.36, 'AUD': 1.52, 'NZD': 1.65,

            // Asian Currencies
            'INR': 83.20, 'PKR': 278, 'BDT': 110, 'LKR': 325, 'NPR': 133, 'THB': 34.50,
            'MYR': 4.47, 'SGD': 1.34, 'IDR': 15700, 'PHP': 56.00, 'VND': 24500, 'KRW': 1320,
            'TWD': 31.50, 'HKD': 7.80, 'KHR': 4100, 'LAK': 21500, 'MMK': 2100, 'BND': 1.34,

            // European Currencies
            'SEK': 10.40, 'NOK': 10.60, 'DKK': 6.85, 'PLN': 4.02, 'CZK': 22.80, 'HUF': 355,
            'RON': 4.57, 'BGN': 1.80, 'HRK': 6.93, 'RSD': 108, 'UAH': 41.00, 'RUB': 92.00,
            'TRY': 33.50, 'ISK': 138,

            // African Currencies
            'ZAR': 18.20, 'NGN': 1550, 'KES': 129, 'GHS': 15.50, 'UGX': 3700, 'TZS': 2520,
            'ETB': 124, 'XOF': 603, 'XAF': 603, 'MWK': 1730, 'ZMW': 27.00, 'BWP': 13.50,
            'MUR': 45.50, 'SCR': 14.20,

            // Latin American Currencies
            'MXN': 17.00, 'BRL': 4.95, 'ARS': 1000, 'CLP': 950, 'COP': 3900, 'PEN': 3.70,
            'VES': 36.50, 'UYU': 39.50, 'PYG': 7300, 'BOB': 6.91, 'CRC': 510, 'GTQ': 7.75,
            'HNL': 24.70, 'NIO': 36.80, 'PAB': 1.00, 'DOP': 60.00, 'JMD': 155, 'TTD': 6.78,
            'BBD': 2.00,

            // Others
            'ILS': 3.65, 'IRR': 42000, 'AFN': 70.50, 'AMD': 387, 'AZN': 1.70, 'GEL': 2.70,
            'KZT': 455, 'UZS': 12750, 'TMT': 3.50, 'KGS': 84.50, 'TJS': 10.65, 'MNT': 3400,
            'KPW': 900, 'MVR': 15.40, 'BTN': 83.20, 'FJD': 2.25, 'PGK': 3.95, 'WST': 2.70,
            'TOP': 2.35, 'VUV': 119,
        };

        Object.entries(rates).forEach(([currency, rate]) => {
            this.exchangeRates.set(`USD_${currency}`, {
                from: 'USD',
                to: currency,
                rate,
                lastUpdated: Date.now()
            });
        });

        this.lastUpdate = Date.now();
    }

    /**
     * Detect currency from country code
     */
    detectCurrencyFromCountry(countryCode: string): string {
        return COUNTRY_TO_CURRENCY[countryCode.toUpperCase()] || 'USD';
    }

    /**
     * Detect currency from GPS coordinates (using reverse geocoding)
     */
    async detectCurrencyFromLocation(latitude: number, longitude: number): Promise<string> {
        try {
            // In production, use reverse geocoding API (Google Maps, Mapbox, etc.)
            // For now, return USD as default
            // Example: const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${API_KEY}`);

            return 'USD'; // Fallback
        } catch (error) {
            console.error('Failed to detect currency from location:', error);
            return 'USD';
        }
    }

    /**
     * Convert amount from one currency to another
     */
    convert(amount: number, fromCurrency: string, toCurrency: string): CurrencyConversion {
        if (fromCurrency === toCurrency) {
            return {
                amount,
                fromCurrency,
                toCurrency,
                convertedAmount: amount,
                rate: 1
            };
        }

        // Convert to USD first, then to target currency
        const fromRate = this.getExchangeRate('USD', fromCurrency);
        const toRate = this.getExchangeRate('USD', toCurrency);

        const amountInUSD = amount / fromRate;
        const convertedAmount = amountInUSD * toRate;
        const effectiveRate = toRate / fromRate;

        return {
            amount,
            fromCurrency,
            toCurrency,
            convertedAmount: this.roundToCurrencyPrecision(convertedAmount, toCurrency),
            rate: effectiveRate
        };
    }

    /**
     * Get exchange rate between two currencies
     */
    private getExchangeRate(from: string, to: string): number {
        const key = `${from}_${to}`;
        const rate = this.exchangeRates.get(key);
        return rate?.rate || 1;
    }

    /**
     * Round amount to currency's decimal places
     */
    private roundToCurrencyPrecision(amount: number, currencyCode: string): number {
        const currency = CURRENCIES[currencyCode];
        if (!currency) return Math.round(amount * 100) / 100;

        const multiplier = Math.pow(10, currency.decimalPlaces);
        return Math.round(amount * multiplier) / multiplier;
    }

    /**
     * Format amount with currency symbol
     */
    formatAmount(amount: number, currencyCode: string): string {
        const currency = CURRENCIES[currencyCode];
        if (!currency) return `${amount.toFixed(2)} ${currencyCode}`;

        const rounded = this.roundToCurrencyPrecision(amount, currencyCode);
        return `${currency.symbol}${rounded.toLocaleString(undefined, {
            minimumFractionDigits: currency.decimalPlaces,
            maximumFractionDigits: currency.decimalPlaces
        })}`;
    }

    /**
     * Get all supported currencies
     */
    getAllCurrencies(): Currency[] {
        return Object.values(CURRENCIES);
    }

    /**
     * Get currencies by region
     */
    getCurrenciesByRegion(region: string): Currency[] {
        return Object.values(CURRENCIES).filter(c => c.region === region);
    }

    /**
     * Get currency info
     */
    getCurrency(code: string): Currency | undefined {
        return CURRENCIES[code];
    }

    /**
     * Update exchange rates (call periodically)
     */
    async updateExchangeRates(): Promise<void> {
        if (Date.now() - this.lastUpdate < this.updateInterval) {
            return; // Don't update too frequently
        }

        await this.initializeExchangeRates();
    }
}

export const currencyService = CurrencyService.getInstance();
