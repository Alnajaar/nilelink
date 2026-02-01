/**
 * Flash Deals Smart Contract Interface
 * 
 * This file defines the contract ABI and helper functions
 * for interacting with the Flash Deals smart contract
 */

export const FLASH_DEALS_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_FLASH_DEALS_CONTRACT || '';

export const FLASH_DEALS_ABI = [
    // View functions
    {
        inputs: [],
        name: 'getActiveDeals',
        outputs: [
            {
                components: [
                    { name: 'id', type: 'uint256' },
                    { name: 'restaurantId', type: 'string' },
                    { name: 'menuItemCID', type: 'string' },
                    { name: 'discount', type: 'uint256' },
                    { name: 'inventory', type: 'uint256' },
                    { name: 'expiresAt', type: 'uint256' },
                    { name: 'isActive', type: 'bool' }
                ],
                name: 'deals',
                type: 'tuple[]'
            }
        ],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [{ name: 'dealId', type: 'uint256' }],
        name: 'getDealInventory',
        outputs: [{ name: 'inventory', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [{ name: 'dealId', type: 'uint256' }],
        name: 'getDeal',
        outputs: [
            {
                components: [
                    { name: 'id', type: 'uint256' },
                    { name: 'restaurantId', type: 'string' },
                    { name: 'menuItemCID', type: 'string' },
                    { name: 'discount', type: 'uint256' },
                    { name: 'inventory', type: 'uint256' },
                    { name: 'expiresAt', type: 'uint256' },
                    { name: 'isActive', type: 'bool' }
                ],
                name: 'deal',
                type: 'tuple'
            }
        ],
        stateMutability: 'view',
        type: 'function'
    },
    // Write functions
    {
        inputs: [
            { name: 'dealId', type: 'uint256' },
            { name: 'quantity', type: 'uint256' }
        ],
        name: 'claimDeal',
        outputs: [{ name: 'success', type: 'bool' }],
        stateMutability: 'nonpayable',
        type: 'function'
    },
    // Events
    {
        anonymous: false,
        inputs: [
            { indexed: true, name: 'dealId', type: 'uint256' },
            { indexed: true, name: 'user', type: 'address' },
            { indexed: false, name: 'quantity', type: 'uint256' },
            { indexed: false, name: 'timestamp', type: 'uint256' }
        ],
        name: 'DealClaimed',
        type: 'event'
    }
] as const;

/**
 * Contract interaction helpers
 */
import { ethers } from 'ethers';

export async function claimFlashDeal(
    dealId: string,
    quantity: number,
    signer: ethers.Signer
): Promise<ethers.ContractReceipt> {
    const contract = new ethers.Contract(
        FLASH_DEALS_CONTRACT_ADDRESS,
        FLASH_DEALS_ABI,
        signer
    );

    const tx = await contract.claimDeal(dealId, quantity);
    return await tx.wait();
}

export async function getDealInventoryFromContract(
    dealId: string,
    provider: ethers.providers.Provider
): Promise<number> {
    const contract = new ethers.Contract(
        FLASH_DEALS_CONTRACT_ADDRESS,
        FLASH_DEALS_ABI,
        provider
    );

    const inventory = await contract.getDealInventory(dealId);
    return inventory.toNumber();
}
