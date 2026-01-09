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
    Search,
    ArrowRight
} from 'lucide-react';
import { Card } from '@/shared/components/Card';
import { Button } from '@/shared/components/Button';
import { Input } from '@/shared/components/Input';
import { Badge } from '@/shared/components/Badge';
import { CurrencyDisplay } from '@/shared/components/CurrencyDisplay';
import { motion, AnimatePresence } from 'framer-motion';

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
        <div className="h-full flex flex-col p-6 gap-8 bg-background overflow-hidden relative">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 shrink-0 z-10">
                <div>
                    <h1 className="text-4xl font-black text-text-main uppercase tracking-tight leading-none mb-2">Recipe Costing</h1>
                    <p className="text-text-muted font-medium">Menu Engineering & Profit Analysis</p>
                </div>
                <Button size="lg" className="shadow-xl shadow-primary/20 rounded-2xl h-14">
                    <Plus size={20} className="mr-2" />
                    New Recipe
                </Button>
            </header>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 shrink-0">
                {[
                    { label: 'Total Recipes', value: recipes.length, unit: '' },
                    { label: 'Avg Cost', value: (recipes.reduce((sum, r) => sum + r.costPerServing, 0) / recipes.length || 0).toFixed(2), unit: 'EGP' },
                    { label: 'Avg Margin', value: (recipes.reduce((sum, r) => sum + r.profitMargin, 0) / recipes.length || 0).toFixed(1), unit: '%', textClass: 'text-success' },
                    { label: 'Ingredients', value: new Set(recipes.flatMap(r => r.ingredients.map(i => i.ingredientId))).size, unit: 'Unique' },
                ].map((stat, i) => (
                    <Card key={i} className="p-6 bg-white border-border-subtle">
                        <div className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2">{stat.label}</div>
                        <div className={`text-3xl font-black italic tracking-tighter ${stat.textClass || 'text-text-main'}`}>
                            {stat.value} <span className="text-sm not-italic opacity-50 ml-1">{stat.unit}</span>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Main Content Split */}
            <div className="flex-1 flex gap-6 min-h-0">
                {/* List View */}
                <div className="flex-1 flex flex-col gap-4">
                    <div className="relative shrink-0">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted transition-colors" size={20} />
                        <Input
                            placeholder="Search recipes..."
                            className="pl-12 h-14 rounded-2xl bg-white border-border-subtle text-lg font-medium"
                        />
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2">
                        {recipes.map((recipe) => (
                            <motion.div
                                key={recipe.id}
                                layoutId={`recipe-${recipe.id}`}
                                onClick={() => setSelectedRecipe(recipe)}
                                className={`
                                    cursor-pointer group relative overflow-hidden rounded-3xl border-2 transition-all p-6
                                    ${selectedRecipe?.id === recipe.id
                                        ? 'bg-secondary border-secondary text-white shadow-2xl shadow-primary/20'
                                        : 'bg-white border-border-subtle hover:border-primary/30 text-text-main hover:shadow-lg'
                                    }
                                `}
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-xl font-black uppercase tracking-tight mb-2">{recipe.menuItemName}</h3>
                                        <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-wider opacity-80">
                                            <span className="flex items-center gap-1"><Package size={14} /> {recipe.ingredients.length} Ingred.</span>
                                            <span className="flex items-center gap-1"><DollarSign size={14} /> Cost: {recipe.costPerServing.toFixed(2)}</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Margin</div>
                                        <div className={`text-2xl font-black italic ${selectedRecipe?.id === recipe.id ? 'text-emerald-400' : 'text-success'
                                            }`}>
                                            {recipe.profitMargin.toFixed(1)}%
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Details View */}
                <AnimatePresence mode="wait">
                    {selectedRecipe ? (
                        <motion.div
                            key="details"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="w-[480px] shrink-0 flex flex-col gap-6"
                        >
                            <Card className="flex-1 bg-white border-border-subtle p-8 overflow-y-auto rounded-[32px] shadow-2xl">
                                <div className="flex items-center justify-between mb-8">
                                    <h2 className="text-2xl font-black text-text-main uppercase tracking-tight">Ingredient Breakdown</h2>
                                    <div className="flex gap-2">
                                        <Button size="sm" variant="ghost"><Edit2 size={18} /></Button>
                                        <Button size="sm" variant="ghost" className="text-error hover:text-error hover:bg-error/10"><Trash2 size={18} /></Button>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {selectedRecipe.ingredients.map((ing, i) => (
                                        <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-background-subtle border border-border-subtle">
                                            <div>
                                                <div className="font-bold text-text-main">{ing.ingredientName}</div>
                                                <div className="text-xs text-text-muted font-medium mt-1">
                                                    {ing.quantity} {ing.unit} @ {ing.costPerUnit}/{ing.unit}
                                                </div>
                                            </div>
                                            <div className="font-black font-mono text-primary">
                                                <CurrencyDisplay amount={ing.quantity * ing.costPerUnit} currency="USD" />
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-8 pt-8 border-t-2 border-dashed border-border-subtle space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-bold text-text-muted">Total Cost</span>
                                        <span className="text-xl font-black text-text-main"><CurrencyDisplay amount={selectedRecipe.costPerServing} currency="USD" /></span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-bold text-text-muted">Selling Price</span>
                                        <span className="text-xl font-black text-text-main"><CurrencyDisplay amount={selectedRecipe.sellingPrice} currency="USD" /></span>
                                    </div>
                                    <div className="p-4 bg-success/10 rounded-xl flex justify-between items-center">
                                        <span className="text-sm font-black text-success uppercase tracking-widest">Net Profit</span>
                                        <span className="text-2xl font-black text-success">
                                            <CurrencyDisplay amount={selectedRecipe.sellingPrice - selectedRecipe.costPerServing} currency="USD" />
                                        </span>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    ) : (
                        <div className="w-[480px] shrink-0 flex items-center justify-center text-text-muted opacity-40">
                            <div className="text-center">
                                <ChefHat size={64} className="mx-auto mb-4" />
                                <p className="font-bold uppercase tracking-widest">Select a recipe to view details</p>
                            </div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
