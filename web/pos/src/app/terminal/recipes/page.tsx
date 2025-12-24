"use client";

import React, { useState } from 'react';
import {
    ChefHat,
    Plus,
    Edit2,
    Trash2,
    DollarSign,
    Package,
    TrendingUp,
    AlertCircle,
    Search
} from 'lucide-react';

interface RecipeIngredient {
    ingredientId: string;
    ingredientName: string;
    quantity: number;
    unit: 'kg' | 'L' | 'pcs' | 'g' | 'ml';
    costPerUnit: number;
}

interface Recipe {
    id: string;
    menuItemName: string;
    ingredients: RecipeIngredient[];
    yield: number;
    costPerServing: number;
    sellingPrice: number;
    profitMargin: number;
}

export default function RecipeManagement() {
    const [recipes, setRecipes] = useState<Recipe[]>([
        {
            id: '1',
            menuItemName: 'Burger Classic',
            yield: 1,
            sellingPrice: 50,
            costPerServing: 20,
            profitMargin: 60,
            ingredients: [
                { ingredientId: 'beef', ingredientName: 'Ground Beef', quantity: 0.2, unit: 'kg', costPerUnit: 75 },
                { ingredientId: 'bun', ingredientName: 'Burger Bun', quantity: 1, unit: 'pcs', costPerUnit: 2 },
                { ingredientId: 'cheese', ingredientName: 'Cheddar Cheese', quantity: 2, unit: 'pcs', costPerUnit: 1.5 },
            ],
        },
        {
            id: '2',
            menuItemName: 'Truffle Fries',
            yield: 1,
            sellingPrice: 25,
            costPerServing: 8,
            profitMargin: 68,
            ingredients: [
                { ingredientId: 'potato', ingredientName: 'Potatoes', quantity: 0.3, unit: 'kg', costPerUnit: 10 },
                { ingredientId: 'truffle', ingredientName: 'Truffle Oil', quantity: 5, unit: 'ml', costPerUnit: 0.5 },
            ],
        },
    ]);

    const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

    return (
        <div className="space-y-12 max-w-7xl">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <ChefHat size={24} className="text-nile-silver" />
                        <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase">Recipe Management</h1>
                    </div>
                    <p className="text-nile-silver/30 font-bold uppercase tracking-widest text-xs">Menu Intelligence & Cost Control</p>
                </div>
                <button className="btn-primary flex items-center gap-3 py-3 px-8 shadow-nile-silver/10">
                    <Plus size={18} />
                    New Recipe
                </button>
            </header>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="p-8 rounded-[3rem] bg-white/5 border border-white/10">
                    <div className="text-[10px] font-black uppercase tracking-widest text-nile-silver/20 mb-2">Total Recipes</div>
                    <div className="text-3xl font-black text-white italic tracking-tighter">{recipes.length}</div>
                </div>
                <div className="p-8 rounded-[3rem] bg-white/5 border border-white/10">
                    <div className="text-[10px] font-black uppercase tracking-widest text-nile-silver/20 mb-2">Avg Cost</div>
                    <div className="text-3xl font-black text-white italic tracking-tighter">
                        {(recipes.reduce((sum, r) => sum + r.costPerServing, 0) / recipes.length || 0).toFixed(2)} EGP
                    </div>
                </div>
                <div className="p-8 rounded-[3rem] bg-white/5 border border-white/10">
                    <div className="text-[10px] font-black uppercase tracking-widest text-nile-silver/20 mb-2">Avg Margin</div>
                    <div className="text-3xl font-black text-emerald-500 italic tracking-tighter">
                        {(recipes.reduce((sum, r) => sum + r.profitMargin, 0) / recipes.length || 0).toFixed(1)}%
                    </div>
                </div>
                <div className="p-8 rounded-[3rem] bg-white/5 border border-white/10">
                    <div className="text-[10px] font-black uppercase tracking-widest text-nile-silver/20 mb-2">Ingredients</div>
                    <div className="text-3xl font-black text-white italic tracking-tighter">
                        {new Set(recipes.flatMap(r => r.ingredients.map(i => i.ingredientId))).size}
                    </div>
                </div>
            </div>

            {/* Recipe List */}
            <div className="glass-panel rounded-[3rem] overflow-hidden border-white/10">
                <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
                    <div className="flex items-center gap-4 px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-nile-silver text-sm flex-1 max-w-md">
                        <Search size={18} className="text-nile-silver/20" />
                        <input type="text" placeholder="Search recipes..." className="bg-transparent border-none focus:outline-none w-full" />
                    </div>
                </div>

                <div className="divide-y divide-white/5">
                    {recipes.map((recipe) => (
                        <div
                            key={recipe.id}
                            className="p-8 hover:bg-white/[0.02] transition-all cursor-pointer group"
                            onClick={() => setSelectedRecipe(recipe)}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <h3 className="text-xl font-black text-white italic tracking-tight uppercase mb-2">{recipe.menuItemName}</h3>
                                    <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-widest text-nile-silver/20">
                                        <span className="flex items-center gap-2">
                                            <Package size={12} />
                                            {recipe.ingredients.length} Ingredients
                                        </span>
                                        <span className="flex items-center gap-2">
                                            <DollarSign size={12} />
                                            Cost: {recipe.costPerServing.toFixed(2)} EGP
                                        </span>
                                        <span className="flex items-center gap-2">
                                            <TrendingUp size={12} className="text-emerald-500" />
                                            Margin: {recipe.profitMargin.toFixed(1)}%
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="text-right">
                                        <div className="text-[10px] font-black uppercase tracking-widest text-nile-silver/20 mb-1">Selling Price</div>
                                        <div className="text-2xl font-black text-white italic tracking-tighter">{recipe.sellingPrice} EGP</div>
                                    </div>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-nile-silver">
                                            <Edit2 size={16} />
                                        </button>
                                        <button className="p-3 rounded-xl bg-white/5 hover:bg-red-500/20 border border-white/5 text-nile-silver hover:text-red-500">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Ingredients Breakdown (Expandable) */}
                            {selectedRecipe?.id === recipe.id && (
                                <div className="mt-8 pt-8 border-t border-white/5">
                                    <h4 className="text-sm font-black uppercase tracking-widest text-nile-silver/20 mb-6">Ingredient Breakdown</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {recipe.ingredients.map((ing, i) => (
                                            <div key={i} className="p-6 rounded-3xl bg-white/5 border border-white/5">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-sm font-bold text-white">{ing.ingredientName}</span>
                                                    <span className="text-xs font-black text-nile-silver/40">{(ing.quantity * ing.costPerUnit).toFixed(2)} EGP</span>
                                                </div>
                                                <div className="text-[10px] font-black uppercase tracking-widest text-nile-silver/20">
                                                    {ing.quantity} {ing.unit} × {ing.costPerUnit} EGP/{ing.unit}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Profit Analysis */}
            <div className="p-12 rounded-[4rem] bg-gradient-to-br from-nile-dark to-black border border-white/5">
                <div className="flex items-center gap-4 mb-8">
                    <AlertCircle size={24} className="text-nile-silver/20" />
                    <h3 className="text-xl font-black text-white italic tracking-tight">Cost Intelligence</h3>
                </div>
                <p className="text-sm font-medium text-nile-silver/30 leading-relaxed mb-8">
                    Recipe costing is automatically recalculated when ingredient prices change.
                    Each sale deducts exact ingredient quantities from inventory for perfect variance tracking.
                </p>
                <div className="grid grid-cols-3 gap-8">
                    {recipes.slice(0, 3).map((recipe) => (
                        <div key={recipe.id} className="p-6 rounded-3xl bg-white/5 text-center">
                            <div className="text-xs font-bold text-white mb-2">{recipe.menuItemName}</div>
                            <div className={`text-2xl font-black italic ${recipe.profitMargin > 50 ? 'text-emerald-500' : 'text-amber-500'}`}>
                                {recipe.profitMargin.toFixed(1)}%
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
