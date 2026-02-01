/**
 * Flash Deals Hook - Decentralized Data Fetching
 * 
 * Fetches flash deals from:
 * - The Graph subgraph (on-chain deal state)
 * - IPFS (menu item details)
 * - Smart contracts (real-time inventory)
 */

import { useState, useEffect } from 'react';
import { graphQuery, QUERIES } from '@/lib/graphql/client';

export interface FlashDeal {
    id: string;
    restaurantId: string;
    menuItemCID: string;
    discount: number;
    inventory: number;
    expiresAt: number;
    isActive: boolean;
    createdAt: number;
    // Populated from IPFS
    itemName?: string;
    itemDescription?: string;
    itemImage?: string;
    originalPrice?: number;
    // Calculated
    discountedPrice?: number;
    hoursRemaining?: number;
}

export function useFlashDeals() {
    const [deals, setDeals] = useState<FlashDeal[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchDeals() {
            setIsLoading(true);
            setError(null);
            try {
                const currentTimestamp = Math.floor(Date.now() / 1000);

                const data = await graphQuery(QUERIES.GET_FLASH_DEALS, {
                    currentTimestamp
                });

                if (!data?.flashDeals) {
                    setDeals([]);
                    setIsLoading(false);
                    return;
                }

                const enrichedDeals = await Promise.all(
                    data.flashDeals.map(async (deal: any) => {
                        // Fetch menu item details from IPFS
                        const menuData = await fetchFromIPFS(deal.menuItemCID);

                        const originalPrice = menuData?.price || 0;
                        const discountedPrice = originalPrice * (1 - deal.discount / 100);
                        const hoursRemaining = Math.max(0, (deal.expiresAt - currentTimestamp) / 3600);

                        return {
                            ...deal,
                            itemName: menuData?.name,
                            itemDescription: menuData?.description,
                            itemImage: menuData?.image,
                            originalPrice,
                            discountedPrice,
                            hoursRemaining: Math.round(hoursRemaining),
                        };
                    })
                );

                setDeals(enrichedDeals);
                setIsLoading(false);
            } catch (err: any) {
                console.error('Error fetching deals:', err);
                setError(err.message);
                setDeals([]);
                setIsLoading(false);
            }
        }

        fetchDeals();

        // Poll for updates every 30 seconds
        const interval = setInterval(fetchDeals, 30000);
        return () => clearInterval(interval);
    }, []);

    return { deals, isLoading, error };
}

/**
 * Fetch data from IPFS using Pinata gateway
 */
async function fetchFromIPFS(cid: string): Promise<any> {
    try {
        const gateway = process.env.NEXT_PUBLIC_IPFS_GATEWAY || 'https://gateway.pinata.cloud/ipfs/';
        const response = await fetch(`${gateway}${cid}`);

        if (!response.ok) {
            throw new Error(`IPFS fetch failed: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('IPFS fetch error:', error);
        return null;
    }
}

/**
 * Get real-time inventory from smart contract
 * This should be called when user attempts to claim a deal
 */
export async function getRealTimeInventory(dealId: string): Promise<number> {
    try {
        // This would interact with the smart contract directly
        // For now, return from The Graph data (cached)
        // In production, this should call contract.getDealInventory(dealId)

        // const contract = new ethers.Contract(DEAL_CONTRACT_ADDRESS, DEAL_ABI, provider);
        // const inventory = await contract.getDealInventory(dealId);
        // return inventory.toNumber();

        console.log('Real-time inventory check for deal:', dealId);
        return 0; // Placeholder
    } catch (error) {
        console.error('Error fetching real-time inventory:', error);
        throw error;
    }
}
