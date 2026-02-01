/**
 * Business Service
 * Manages merchant settings and metadata, including currency rates
 */

import { ipfsService } from './IPFSService';
import { graphService } from './GraphService';
import { currencyService } from './CurrencyService';

export class BusinessService {
    /**
     * Update business metadata including custom currency rates
     */
    async updateBusinessSettings(businessId: string, settings: {
        name: string;
        customCurrencyRate?: number;
        localCurrency?: string;
        [key: string]: any;
    }) {
        try {
            console.log(`[Business Service] ⚙️ Updating settings for ${businessId}`);

            // 1. Upload new metadata to IPFS
            const ipfsHash = await ipfsService.uploadBusinessMetadata({
                ...settings,
                updatedAt: new Date().toISOString()
            });

            // 2. Log update (in production, trigger on-chain transaction to update metadataURI)
            console.log(`[Business Service] ✅ Metadata anchored to IPFS: ${ipfsHash}`);

            // 3. Update local currency service for immediate feedback
            if (settings.customCurrencyRate && settings.localCurrency) {
                currencyService.setCustomMerchantRate(settings.localCurrency, settings.customCurrencyRate);
            }

            return { success: true, ipfsHash };
        } catch (error) {
            console.error('[Business Service] ❌ Update failed:', error);
            return { success: false, error };
        }
    }

    /**
     * Load business settings from IPFS
     */
    async loadBusinessSettings(businessId: string) {
        try {
            // 1. Get business from Graph
            const business = await graphService.getBusinessById(businessId);
            if (!business || !business.metadataURI) return null;

            // 2. Fetch metadata from IPFS
            const metadata = await ipfsService.fetch(business.metadataURI);

            // 3. Apply custom currency rate if present
            if (metadata.customCurrencyRate && metadata.localCurrency) {
                currencyService.setCustomMerchantRate(metadata.localCurrency, metadata.customCurrencyRate);
            }

            return metadata;
        } catch (error) {
            console.error('[Business Service] ❌ Load failed:', error);
            return null;
        }
    }
}

export const businessService = new BusinessService();
