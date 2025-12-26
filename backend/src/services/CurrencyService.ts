import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import cron from 'node-cron';

const prisma = new PrismaClient();

/**
 * Currency Exchange Rate Service
 * Fetches and updates exchange rates daily
 */
export class CurrencyService {
    private apiKey = process.env.EXCHANGE_RATE_API_KEY || '';
    private apiUrl = 'https://api.exchangerate-api.com/v4/latest/USD';

    /**
     * Seed initial currencies
     */
    async seedCurrencies(): Promise<void> {
        const currencies = [
            { code: 'USD', symbol: '$', name: 'US Dollar' },
            { code: 'EUR', symbol: '€', name: 'Euro' },
            { code: 'GBP', symbol: '£', name: 'British Pound' },
            { code: 'EGP', symbol: 'E£', name: 'Egyptian Pound' },
            { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal' },
            { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
            { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
            { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
            { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
        ];

        for (const currency of currencies) {
            await prisma.currency.upsert({
                where: { code: currency.code },
                create: currency,
                update: currency,
            });
        }

        console.log('✅ Seeded currencies');
    }

    /**
     * Update exchange rates from external API
     */
    async updateExchangeRates(): Promise<void> {
        try {
            console.log('Fetching latest exchange rates...');

            const response = await axios.get(this.apiUrl);
            const rates = response.data.rates as Record<string, number>;

            const today = new Date();
            today.setHours(0, 0, 0, 0); // Normalize to start of day

            // Create exchange rates for all supported currencies
            for (const [toCurrency, rate] of Object.entries(rates)) {
                // Check if this currency is in our system
                const currency = await prisma.currency.findUnique({
                    where: { code: toCurrency }
                });

                if (currency) {
                    await prisma.exchangeRate.upsert({
                        where: {
                            fromCurrencyCode_toCurrencyCode_date: {
                                fromCurrencyCode: 'USD',
                                toCurrencyCode: toCurrency,
                                date: today,
                            }
                        },
                        create: {
                            fromCurrencyCode: 'USD',
                            toCurrencyCode: toCurrency,
                            rate: rate,
                            date: today,
                            source: 'exchangerate-api.com',
                        },
                        update: {
                            rate: rate,
                        }
                    });
                }
            }

            console.log(`✅ Updated exchange rates for ${Object.keys(rates).length} currencies`);
        } catch (error) {
            console.error('Failed to update exchange rates:', error);
        }
    }

    /**
     * Convert amount from one currency to another
     */
    async convert(amount: number, from: string, to: string): Promise<number> {
        if (from === to) return amount;

        // Fetch latest exchange rate
        const rate = await prisma.exchangeRate.findFirst({
            where: {
                fromCurrencyCode: from,
                toCurrencyCode: to,
            },
            orderBy: { date: 'desc' }
        });

        if (!rate) {
            throw new Error(`Exchange rate not found for ${from} to ${to}`);
        }

        return amount * Number(rate.rate);
    }

    /**
     * Get latest rates for all currencies from base
     */
    async getLatestRates(baseCurrency: string = 'USD'): Promise<Record<string, number>> {
        const rates = await prisma.exchangeRate.findMany({
            where: {
                fromCurrencyCode: baseCurrency,
            },
            orderBy: { date: 'desc' },
            distinct: ['toCurrencyCode'],
        });

        const result: Record<string, number> = {};
        rates.forEach(rate => {
            result[rate.toCurrencyCode] = Number(rate.rate);
        });

        return result;
    }

    /**
     * Start daily cron job to update rates
     */
    startDailyCron(): void {
        // Run every day at 3 AM
        cron.schedule('0 3 * * *', async () => {
            console.log('Running daily exchange rate update...');
            await this.updateExchangeRates();
        });

        console.log('✅ Exchange rate cron job scheduled (daily at 3 AM)');
    }
}

export const currencyService = new CurrencyService();
