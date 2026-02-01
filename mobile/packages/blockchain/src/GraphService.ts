/**
 * The Graph Service for Mobile
 * Decentralized data querying using GraphQL subgraphs
 */

interface GraphQLResponse<T = any> {
    data?: T;
    errors?: any[];
}

export class GraphService {
    private endpoint = 'https://api.studio.thegraph.com/query/YOUR_ID/nilelink-amoy/version/latest';

    async query<T = any>(query: string, variables?: Record<string, any>): Promise<T | null> {
        try {
            const response = await fetch(this.endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query, variables: variables || {} }),
            });

            if (!response.ok) throw new Error(`Status: ${response.status}`);
            const result: GraphQLResponse<T> = await response.json();

            if (result.errors && result.errors.length > 0) {
                console.error('GraphQL Errors:', result.errors);
                return null;
            }

            return result.data || null;
        } catch (error) {
            console.error('Graph Query Failed:', error);
            return null;
        }
    }

    async getAvailableDeliveries() {
        const query = `
            query GetAvailableDeliveries {
                deliveries(where: { status: "READY" }, orderBy: createdAt, orderDirection: desc) {
                    id
                    order {
                        id
                        orderNumber
                        deliveryAddress
                        totalAmountUsd6
                    }
                    restaurant {
                        id
                        metadataCid
                    }
                    status
                    createdAt
                }
            }
        `;
        return this.query(query);
    }
}

export const graphService = new GraphService();
