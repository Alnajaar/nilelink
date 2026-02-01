/**
 * IPFS Migration Script for NileLink (JS Version)
 * Dumps local product and menu data to a JSON file for IPFS pinning.
 */

const fs = require('fs');
const path = require('path');

// Sample Catalog Structure for IPFS
const catalog = {
    version: "1.0.0",
    restaurantId: "cairo-grill-001",
    name: "Cairo Grill",
    products: [
        {
            id: "1",
            name: "Burger Classic",
            description: "A premium beef patty with fresh lettuce and secret sauce.",
            price: 15.99,
            currency: "USD",
            category: "Burgers",
            imageCid: "Qm...placeholder",
            recipe: {
                ingredients: [
                    { id: "ing-1", name: "Beef Patty", qty: 1, unit: "pcs" },
                    { id: "ing-2", name: "Bun", qty: 1, unit: "pcs" }
                ]
            }
        },
        {
            id: "2",
            name: "Truffle Fries",
            description: "Crispy fries drizzled with authentic truffle oil.",
            price: 8.50,
            currency: "USD",
            category: "Sides",
            imageCid: "Qm...placeholder",
            recipe: {
                ingredients: [
                    { id: "ing-3", name: "Potatoes", qty: 0.3, unit: "kg" },
                    { id: "ing-4", name: "Truffle Oil", qty: 0.01, unit: "L" }
                ]
            }
        }
    ],
    metadata: {
        address: "123 Nile St, Cairo",
        phone: "+20 123 456 7890",
        location: { lat: 30.0444, lng: 31.2357 }
    }
};

const outputPath = path.resolve(__dirname, '../web/pos/public/catalog.json');

try {
    fs.writeFileSync(outputPath, JSON.stringify(catalog, null, 2));
    console.log(`✅ Catalog exported to ${outputPath}`);
    console.log(`🚀 Next Step: Pin this file to IPFS and update the catalogCid in the RestaurantRegistry contract.`);
} catch (error) {
    console.error('❌ Failed to export catalog:', error);
}
