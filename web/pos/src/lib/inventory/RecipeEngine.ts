/**
 * Recipe Engine - Recipe-Aware Inventory Management
 * 
 * Enables menu items to be composed of ingredients
 * Automatic deduction on sale, variance tracking, waste management
 */

export interface RecipeIngredient {
    ingredientId: string;
    ingredientName: string;
    quantity: number;
    unit: 'kg' | 'L' | 'pcs' | 'g' | 'ml';
    costPerUnit: number;
    alternatives?: string[]; // Alternative ingredient IDs
}

export interface Recipe {
    id: string;
    menuItemId: string;
    menuItemName: string;
    ingredients: RecipeIngredient[];
    yield: number;              // Number of servings
    costPerServing: number;     // Auto-calculated
    prepTime: number;           // minutes
    branchVariants?: {          // Different recipes per branch
        [branchId: string]: RecipeIngredient[];
    };
    createdAt: number;
    updatedAt: number;
}

export interface InventoryItem {
    ingredientId: string;
    ingredientName: string;
    currentStock: number;
    unit: 'kg' | 'L' | 'pcs' | 'g' | 'ml';
    reorderLevel: number;
    costPerUnit: number;
    supplierId?: string;
    lastRestocked?: number;
}

export class RecipeEngine {
    private recipes: Map<string, Recipe> = new Map();
    private inventory: Map<string, InventoryItem> = new Map();

    /**
     * Add or update a recipe
     */
    setRecipe(recipe: Recipe): void {
        // Calculate cost per serving
        recipe.costPerServing = this.calculateRecipeCost(recipe);
        this.recipes.set(recipe.menuItemId, recipe);
    }

    /**
     * Get recipe by menu item ID
     */
    getRecipe(menuItemId: string, branchId?: string): Recipe | null {
        const recipe = this.recipes.get(menuItemId);
        if (!recipe) return null;

        // Use branch-specific variant if available
        if (branchId && recipe.branchVariants?.[branchId]) {
            return {
                ...recipe,
                ingredients: recipe.branchVariants[branchId],
            };
        }

        return recipe;
    }

    /**
     * Calculate recipe cost from ingredients
     */
    private calculateRecipeCost(recipe: Recipe): number {
        let totalCost = 0;

        for (const ingredient of recipe.ingredients) {
            totalCost += ingredient.quantity * ingredient.costPerUnit;
        }

        return recipe.yield > 0 ? totalCost / recipe.yield : 0;
    }

    /**
     * Deduct ingredients for a menu item sale
     */
    deductForSale(
        menuItemId: string,
        quantity: number,
        branchId?: string
    ): Array<{
        ingredientId: string;
        ingredientName: string;
        deducted: number;
        unit: string;
        remainingStock: number;
    }> {
        const recipe = this.getRecipe(menuItemId, branchId);
        if (!recipe) {
            throw new Error(`Recipe not found for menu item: ${menuItemId}`);
        }

        const deductions: Array<{
            ingredientId: string;
            ingredientName: string;
            deducted: number;
            unit: string;
            remainingStock: number;
        }> = [];

        for (const ingredient of recipe.ingredients) {
            const inventoryItem = this.inventory.get(ingredient.ingredientId);
            if (!inventoryItem) {
                console.warn(`Ingredient ${ingredient.ingredientName} not in inventory`);
                continue;
            }

            const totalDeduction = ingredient.quantity * quantity;

            // Check stock availability
            if (inventoryItem.currentStock < totalDeduction) {
                console.warn(
                    `Insufficient stock for ${ingredient.ingredientName}. ` +
                    `Required: ${totalDeduction}, Available: ${inventoryItem.currentStock}`
                );
            }

            // Deduct from inventory
            inventoryItem.currentStock -= totalDeduction;

            deductions.push({
                ingredientId: ingredient.ingredientId,
                ingredientName: ingredient.ingredientName,
                deducted: totalDeduction,
                unit: ingredient.unit,
                remainingStock: inventoryItem.currentStock,
            });
        }

        return deductions;
    }

    /**
     * Check if recipe can be fulfilled with current inventory
     */
    canFulfillRecipe(menuItemId: string, quantity: number, branchId?: string): {
        canFulfill: boolean;
        missingIngredients: Array<{
            ingredientName: string;
            required: number;
            available: number;
            unit: string;
        }>;
    } {
        const recipe = this.getRecipe(menuItemId, branchId);
        if (!recipe) {
            return { canFulfill: false, missingIngredients: [] };
        }

        const missingIngredients: Array<{
            ingredientName: string;
            required: number;
            available: number;
            unit: string;
        }> = [];

        for (const ingredient of recipe.ingredients) {
            const inventoryItem = this.inventory.get(ingredient.ingredientId);
            const required = ingredient.quantity * quantity;
            const available = inventoryItem?.currentStock || 0;

            if (available < required) {
                missingIngredients.push({
                    ingredientName: ingredient.ingredientName,
                    required,
                    available,
                    unit: ingredient.unit,
                });
            }
        }

        return {
            canFulfill: missingIngredients.length === 0,
            missingIngredients,
        };
    }

    /**
     * Update inventory item
     */
    updateInventory(item: InventoryItem): void {
        this.inventory.set(item.ingredientId, item);
    }

    /**
     * Get ingredients needing reorder
     */
    getReorderList(): InventoryItem[] {
        const reorderItems: InventoryItem[] = [];

        for (const [, item] of this.inventory) {
            if (item.currentStock <= item.reorderLevel) {
                reorderItems.push(item);
            }
        }

        return reorderItems.sort((a, b) => a.currentStock - b.currentStock);
    }

    /**
     * Calculate variance (expected vs actual usage)
     */
    calculateVariance(
        ingredientId: string,
        expectedUsage: number,
        actualStock: number
    ): {
        ingredientId: string;
        expectedUsage: number;
        actualStock: number;
        variance: number;
        variancePercent: number;
        status: 'normal' | 'high-variance' | 'critical-variance';
    } {
        const item = this.inventory.get(ingredientId);
        if (!item) {
            throw new Error(`Ingredient ${ingredientId} not found in inventory`);
        }

        const theoreticalStock = item.currentStock - expectedUsage;
        const variance = theoreticalStock - actualStock;
        const variancePercent = expectedUsage > 0 ? (variance / expectedUsage) * 100 : 0;

        let status: 'normal' | 'high-variance' | 'critical-variance' = 'normal';
        if (Math.abs(variancePercent) > 20) {
            status = 'critical-variance';
        } else if (Math.abs(variancePercent) > 10) {
            status = 'high-variance';
        }

        return {
            ingredientId,
            expectedUsage,
            actualStock,
            variance,
            variancePercent,
            status,
        };
    }

    /**
     * Get profit margin for menu item
     */
    calculateProfitMargin(menuItemId: string, sellingPrice: number, branchId?: string): {
        cost: number;
        price: number;
        profit: number;
        marginPercent: number;
    } {
        const recipe = this.getRecipe(menuItemId, branchId);
        if (!recipe) {
            return { cost: 0, price: sellingPrice, profit: sellingPrice, marginPercent: 100 };
        }

        const cost = recipe.costPerServing;
        const profit = sellingPrice - cost;
        const marginPercent = sellingPrice > 0 ? (profit / sellingPrice) * 100 : 0;

        return {
            cost,
            price: sellingPrice,
            profit,
            marginPercent,
        };
    }

    /**
     * Get all recipes
     */
    getAllRecipes(): Recipe[] {
        return Array.from(this.recipes.values());
    }

    /**
     * Get all inventory
     */
    getAllInventory(): InventoryItem[] {
        return Array.from(this.inventory.values());
    }

    /**
     * Seed with default data for demo
     */
    seed(): void {
        // Add Ingredients
        const ingredients: InventoryItem[] = [
            { ingredientId: 'ing-1', ingredientName: 'Beef Patty', currentStock: 100, unit: 'pcs', reorderLevel: 20, costPerUnit: 2.5 },
            { ingredientId: 'ing-2', ingredientName: 'Bun', currentStock: 100, unit: 'pcs', reorderLevel: 20, costPerUnit: 0.5 },
            { ingredientId: 'ing-3', ingredientName: 'Potatoes', currentStock: 50, unit: 'kg', reorderLevel: 10, costPerUnit: 1.2 },
            { ingredientId: 'ing-4', ingredientName: 'Truffle Oil', currentStock: 5, unit: 'L', reorderLevel: 1, costPerUnit: 45 },
            { ingredientId: 'ing-5', ingredientName: 'Pizza Dough', currentStock: 40, unit: 'pcs', reorderLevel: 10, costPerUnit: 1.5 },
            { ingredientId: 'ing-6', ingredientName: 'Coffee Beans', currentStock: 10, unit: 'kg', reorderLevel: 2, costPerUnit: 18 },
        ];

        ingredients.forEach(i => this.inventory.set(i.ingredientId, i));

        // Add Recipes
        this.setRecipe({
            id: 'rec-1',
            menuItemId: '1', // Burger Classic
            menuItemName: 'Burger Classic',
            ingredients: [
                { ingredientId: 'ing-1', ingredientName: 'Beef Patty', quantity: 1, unit: 'pcs', costPerUnit: 2.5 },
                { ingredientId: 'ing-2', ingredientName: 'Bun', quantity: 1, unit: 'pcs', costPerUnit: 0.5 },
            ],
            yield: 1,
            costPerServing: 3,
            prepTime: 10,
            createdAt: Date.now(),
            updatedAt: Date.now(),
        });

        this.setRecipe({
            id: 'rec-2',
            menuItemId: '2', // Truffle Fries
            menuItemName: 'Truffle Fries',
            ingredients: [
                { ingredientId: 'ing-3', ingredientName: 'Potatoes', quantity: 0.3, unit: 'kg', costPerUnit: 1.2 },
                { ingredientId: 'ing-4', ingredientName: 'Truffle Oil', quantity: 0.01, unit: 'L', costPerUnit: 45 },
            ],
            yield: 1,
            costPerServing: 0.81,
            prepTime: 5,
            createdAt: Date.now(),
            updatedAt: Date.now(),
        });
    }
}
