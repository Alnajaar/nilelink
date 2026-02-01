/**
 * GraphQL Client for The Graph
 * 
 * Simplified client using fetch for decentralized data queries
 */

// The Graph subgraph endpoint
const SUBGRAPH_URL = process.env.NEXT_PUBLIC_SUBGRAPH_URL ||
  'https://api.studio.thegraph.com/query/<YOUR-SUBGRAPH-ID>/nilelink-amoy/version/latest';

/**
 * Simple GraphQL query function
 */
export async function graphQuery<T = any>(query: string, variables?: Record<string, any>): Promise<T> {
  try {
    const response = await fetch(SUBGRAPH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, variables }),
    });

    const result = await response.json();

    if (result.errors) {
      console.error('GraphQL errors:', result.errors);
      throw new Error(result.errors[0]?.message || 'GraphQL query failed');
    }

    return result.data;
  } catch (error) {
    console.error('GraphQL query error:', error);
    throw error;
  }
}

/**
 * The Graph Queries
 */
export const QUERIES = {
  // Flash Deals
  GET_FLASH_DEALS: `
    query GetFlashDeals($currentTimestamp: BigInt!) {
      flashDeals(
        where: { isActive: true, expiresAt_gt: $currentTimestamp }
        orderBy: discount
        orderDirection: desc
        first: 10
      ) {
        id
        restaurantId
        menuItemCID
        discount
        inventory
        expiresAt
        isActive
        createdAt
      }
    }
  `,

  // User orders (via wallet address)
  GET_USER_ORDERS: `
    query GetUserOrders($userAddress: Bytes!) {
      userOrders(
        where: { user: $userAddress }
        orderBy: timestamp
        orderDirection: desc
        first: 20
      ) {
        id
        user
        restaurant
        items
        total
        timestamp
      }
    }
  `,

  // Restaurant data
  GET_RESTAURANTS: `
    query GetRestaurants {
      restaurants(first: 100, orderBy: rating, orderDirection: desc) {
        id
        name
        cuisine
        rating
        priceRange
        menuCID
        isActive
      }
    }
  `
};
