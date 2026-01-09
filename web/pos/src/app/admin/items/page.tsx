"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
    ArrowLeft,
    Plus,
    Search,
    Edit3,
    Trash2,
    Eye,
    Upload,
    Image as ImageIcon,
    Package,
    DollarSign,
    Hash,
    Save,
    X,
    Check,
    Camera,
    FileImage
} from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { Card } from '@/shared/components/Card';
import { Badge } from '@/shared/components/Badge';
import { usePOS } from '@/contexts/POSContext';

interface MenuItem {
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    image?: string;
    isAvailable: boolean;
    preparationTime?: number;
    cost?: number;
    stock?: number;
    barcode?: string;
    customizations?: any;
    createdAt: string;
    updatedAt: string;
}

export default function ItemsManagementPage() {
    const router = useRouter();
    const { demoMode } = usePOS();
    const [items, setItems] = useState<MenuItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
    const [viewingItem, setViewingItem] = useState<MenuItem | null>(null);
    const [saving, setSaving] = useState(false);

    // Mock data for demonstration
    useEffect(() => {
        const mockItems: MenuItem[] = [
            {
                id: '1',
                name: 'Wagyu Burger',
                description: 'Premium Japanese Wagyu beef patty with truffle aioli',
                price: 45.99,
                category: 'Burgers',
                image: '/api/placeholder/200/150',
                isAvailable: true,
                preparationTime: 15,
                cost: 18.50,
                stock: 25,
                barcode: '1234567890123',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: '2',
                name: 'Truffle Fries',
                description: 'Hand-cut fries with black truffle oil and parmesan',
                price: 12.99,
                category: 'Sides',
                image: '/api/placeholder/200/150',
                isAvailable: true,
                preparationTime: 8,
                cost: 3.25,
                stock: 50,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }
        ];
        setItems(mockItems);
        setLoading(false);
    }, []);

    const filteredItems = items.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const categories = ['all', ...Array.from(new Set(items.map(item => item.category)))];

    const handleSaveItem = async (itemData: Partial<MenuItem>) => {
        setSaving(true);
        try {
            // Mock API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            if (editingItem) {
                // Update existing item
                setItems(prev => prev.map(item =>
                    item.id === editingItem.id
                        ? { ...item, ...itemData, updatedAt: new Date().toISOString() }
                        : item
                ));
            } else {
                // Add new item
                const newItem: MenuItem = {
                    id: Date.now().toString(),
                    name: itemData.name || '',
                    description: itemData.description || '',
                    price: itemData.price || 0,
                    category: itemData.category || 'Uncategorized',
                    image: itemData.image,
                    isAvailable: itemData.isAvailable ?? true,
                    preparationTime: itemData.preparationTime,
                    cost: itemData.cost,
                    stock: itemData.stock,
                    barcode: itemData.barcode,
                    customizations: itemData.customizations,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };
                setItems(prev => [...prev, newItem]);
            }

            setShowAddModal(false);
            setEditingItem(null);
        } catch (error) {
            console.error('Failed to save item:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteItem = async (itemId: string) => {
        if (!confirm('Are you sure you want to delete this item?')) return;

        try {
            // Mock API call
            await new Promise(resolve => setTimeout(resolve, 500));
            setItems(prev => prev.filter(item => item.id !== itemId));
        } catch (error) {
            console.error('Failed to delete item:', error);
        }
    };

    if (loading) {
        return (
            <div className="p-8 text-center">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-text-muted">Loading items...</p>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/admin" className="p-2 hover:bg-background-subtle rounded-lg transition-colors">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <div className="flex items-center gap-4 mb-2">
                            <h1 className="text-4xl font-black text-text-main">Items Management</h1>
                            {demoMode && <Badge className="bg-orange-500 text-white">DEMO DATA</Badge>}
                        </div>
                        <p className="text-text-muted font-medium text-lg">Manage menu items, inventory, and pricing</p>
                    </div>
                </div>

                <Button onClick={() => setShowAddModal(true)} className="gap-2">
                    <Plus size={20} />
                    Add New Item
                </Button>
            </div>

            {/* Filters and Search */}
            <Card className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search items..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-background-subtle border border-border-subtle rounded-xl text-text-main font-medium placeholder:text-text-subtle/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        />
                    </div>

                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="px-4 py-3 bg-background-subtle border border-border-subtle rounded-xl text-text-main font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    >
                        {categories.map(category => (
                            <option key={category} value={category}>
                                {category === 'all' ? 'All Categories' : category}
                            </option>
                        ))}
                    </select>
                </div>
            </Card>

            {/* Items Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredItems.map((item) => (
                    <Card key={item.id} className="p-6 hover:shadow-xl transition-all duration-300 group">
                        {/* Item Image */}
                        <div className="relative mb-4">
                            <div className="w-full h-48 bg-background-subtle rounded-xl overflow-hidden relative">
                                {item.image ? (
                                    <Image
                                        src={item.image}
                                        alt={item.name}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-text-muted">
                                        <ImageIcon size={48} />
                                    </div>
                                )}
                            </div>

                            <Badge
                                variant={item.isAvailable ? 'success' : 'error'}
                                className="absolute top-3 right-3"
                            >
                                {item.isAvailable ? 'Available' : 'Unavailable'}
                            </Badge>
                        </div>

                        {/* Item Details */}
                        <div className="space-y-3">
                            <div>
                                <h3 className="text-xl font-black text-text-main mb-1">{item.name}</h3>
                                <p className="text-sm text-text-muted leading-relaxed">{item.description}</p>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <DollarSign size={16} className="text-primary" />
                                    <span className="text-xl font-black text-primary">
                                        ${item.price.toFixed(2)}
                                    </span>
                                </div>

                                {item.stock !== undefined && (
                                    <div className="flex items-center gap-2">
                                        <Package size={16} className="text-text-muted" />
                                        <span className="text-sm font-medium text-text-muted">
                                            {item.stock} left
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center justify-between text-xs text-text-muted">
                                <span>Prep: {item.preparationTime}min</span>
                                <span className="capitalize">{item.category}</span>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2 pt-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setEditingItem(item)}
                                    className="flex-1 gap-2"
                                >
                                    <Edit3 size={16} />
                                    Edit
                                </Button>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setViewingItem(item)}
                                    className="gap-2"
                                >
                                    <Eye size={16} />
                                    View
                                </Button>

                                <Button
                                    variant="danger"
                                    size="sm"
                                    onClick={() => handleDeleteItem(item.id)}
                                    className="gap-2"
                                >
                                    <Trash2 size={16} />
                                </Button>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Add/Edit Item Modal */}
            {(showAddModal || editingItem) && (
                <ItemModal
                    item={editingItem}
                    onSave={handleSaveItem}
                    onClose={() => {
                        setShowAddModal(false);
                        setEditingItem(null);
                    }}
                    saving={saving}
                />
            )}

            {/* View Item Modal */}
            {viewingItem && (
                <ViewItemModal
                    item={viewingItem}
                    onClose={() => setViewingItem(null)}
                    onEdit={() => {
                        setEditingItem(viewingItem);
                        setViewingItem(null);
                    }}
                />
            )}
        </div>
    );
}

interface ItemModalProps {
    item: MenuItem | null;
    onSave: (itemData: Partial<MenuItem>) => Promise<void>;
    onClose: () => void;
    saving: boolean;
}

function ItemModal({ item, onSave, onClose, saving }: ItemModalProps) {
    const [formData, setFormData] = useState({
        name: item?.name || '',
        description: item?.description || '',
        price: item?.price || 0,
        category: item?.category || '',
        preparationTime: item?.preparationTime || 0,
        cost: item?.cost || 0,
        stock: item?.stock || 0,
        barcode: item?.barcode || '',
        isAvailable: item?.isAvailable ?? true
    });

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(item?.image || null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const itemData = {
            ...formData,
            image: imagePreview || item?.image
        };

        await onSave(itemData);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="p-8">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-black text-text-main">
                            {item ? 'Edit Item' : 'Add New Item'}
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-background-subtle rounded-lg transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Image Upload */}
                        <div>
                            <label className="block text-sm font-black uppercase tracking-widest text-text-subtle mb-3">
                                Item Image
                            </label>
                            <div className="flex gap-4">
                                <div className="w-32 h-32 bg-background-subtle rounded-xl overflow-hidden flex items-center justify-center relative">
                                    {imagePreview ? (
                                        <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                                    ) : (
                                        <ImageIcon size={32} className="text-text-muted" />
                                    )}
                                </div>
                                <div className="flex-1 space-y-3">
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="hidden"
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="w-full gap-2"
                                    >
                                        <Upload size={16} />
                                        Upload Image
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="w-full gap-2"
                                    >
                                        <Camera size={16} />
                                        Take Photo
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Basic Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-black uppercase tracking-widest text-text-subtle mb-2">
                                    Item Name *
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    className="w-full px-4 py-3 bg-background-subtle border border-border-subtle rounded-xl text-text-main font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-black uppercase tracking-widest text-text-subtle mb-2">
                                    Category *
                                </label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                                    className="w-full px-4 py-3 bg-background-subtle border border-border-subtle rounded-xl text-text-main font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                    required
                                >
                                    <option value="">Select Category</option>
                                    <option value="Burgers">Burgers</option>
                                    <option value="Pizza">Pizza</option>
                                    <option value="Pasta">Pasta</option>
                                    <option value="Salads">Salads</option>
                                    <option value="Sides">Sides</option>
                                    <option value="Desserts">Desserts</option>
                                    <option value="Beverages">Beverages</option>
                                </select>
                            </div>
                        </div>

                        {/* Pricing */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-black uppercase tracking-widest text-text-subtle mb-2">
                                    Selling Price *
                                </label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted w-5 h-5" />
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.price}
                                        onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                                        className="w-full pl-10 pr-4 py-3 bg-background-subtle border border-border-subtle rounded-xl text-text-main font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-black uppercase tracking-widest text-text-subtle mb-2">
                                    Cost Price
                                </label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted w-5 h-5" />
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.cost}
                                        onChange={(e) => setFormData(prev => ({ ...prev, cost: parseFloat(e.target.value) || 0 }))}
                                        className="w-full pl-10 pr-4 py-3 bg-background-subtle border border-border-subtle rounded-xl text-text-main font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-black uppercase tracking-widest text-text-subtle mb-2">
                                    Stock Quantity
                                </label>
                                <div className="relative">
                                    <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted w-5 h-5" />
                                    <input
                                        type="number"
                                        value={formData.stock}
                                        onChange={(e) => setFormData(prev => ({ ...prev, stock: parseInt(e.target.value) || 0 }))}
                                        className="w-full pl-10 pr-4 py-3 bg-background-subtle border border-border-subtle rounded-xl text-text-main font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Additional Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-black uppercase tracking-widest text-text-subtle mb-2">
                                    Preparation Time (minutes)
                                </label>
                                <input
                                    type="number"
                                    value={formData.preparationTime}
                                    onChange={(e) => setFormData(prev => ({ ...prev, preparationTime: parseInt(e.target.value) || 0 }))}
                                    className="w-full px-4 py-3 bg-background-subtle border border-border-subtle rounded-xl text-text-main font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-black uppercase tracking-widest text-text-subtle mb-2">
                                    Barcode
                                </label>
                                <input
                                    type="text"
                                    value={formData.barcode}
                                    onChange={(e) => setFormData(prev => ({ ...prev, barcode: e.target.value }))}
                                    className="w-full px-4 py-3 bg-background-subtle border border-border-subtle rounded-xl text-text-main font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                />
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-black uppercase tracking-widest text-text-subtle mb-2">
                                Description
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                rows={3}
                                className="w-full px-4 py-3 bg-background-subtle border border-border-subtle rounded-xl text-text-main font-medium placeholder:text-text-subtle/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                                placeholder="Describe the item..."
                            />
                        </div>

                        {/* Availability */}
                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                id="isAvailable"
                                checked={formData.isAvailable}
                                onChange={(e) => setFormData(prev => ({ ...prev, isAvailable: e.target.checked }))}
                                className="w-5 h-5 text-primary bg-background-subtle border-border-subtle rounded focus:ring-primary focus:ring-2"
                            />
                            <label htmlFor="isAvailable" className="text-sm font-medium text-text-main">
                                Item is available for ordering
                            </label>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-4 pt-6">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                                className="flex-1"
                                disabled={saving}
                            >
                                Cancel
                            </Button>

                            <Button
                                type="submit"
                                className="flex-1 gap-2"
                                disabled={saving || !formData.name || !formData.category}
                            >
                                {saving ? (
                                    <>
                                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save size={16} />
                                        {item ? 'Update Item' : 'Create Item'}
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
            </Card>
        </div>
    );
}

interface ViewItemModalProps {
    item: MenuItem;
    onClose: () => void;
    onEdit: () => void;
}

function ViewItemModal({ item, onClose, onEdit }: ViewItemModalProps) {
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="p-8">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-black text-text-main">View Item Details</h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-background-subtle rounded-lg transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="space-y-6">
                        {/* Image */}
                        <div className="flex justify-center">
                            <div className="w-48 h-48 bg-background-subtle rounded-xl overflow-hidden flex items-center justify-center relative">
                                {item.image ? (
                                    <Image
                                        src={item.image}
                                        alt={item.name}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <ImageIcon size={48} className="text-text-muted" />
                                )}
                            </div>
                        </div>

                        {/* Basic Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-black uppercase tracking-widest text-text-subtle mb-2">
                                    Item Name
                                </label>
                                <p className="text-lg font-bold text-text-main">{item.name}</p>
                            </div>

                            <div>
                                <label className="block text-sm font-black uppercase tracking-widest text-text-subtle mb-2">
                                    Category
                                </label>
                                <p className="text-lg font-bold text-text-main capitalize">{item.category}</p>
                            </div>
                        </div>

                        {/* Pricing */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-black uppercase tracking-widest text-text-subtle mb-2">
                                    Selling Price
                                </label>
                                <p className="text-2xl font-black text-primary">${item.price.toFixed(2)}</p>
                            </div>

                            {item.cost && (
                                <div>
                                    <label className="block text-sm font-black uppercase tracking-widest text-text-subtle mb-2">
                                        Cost Price
                                    </label>
                                    <p className="text-xl font-bold text-text-main">${item.cost.toFixed(2)}</p>
                                </div>
                            )}

                            {item.stock !== undefined && (
                                <div>
                                    <label className="block text-sm font-black uppercase tracking-widest text-text-subtle mb-2">
                                        Stock Quantity
                                    </label>
                                    <p className={`text-xl font-bold ${item.stock > 10 ? 'text-green-600' : item.stock > 0 ? 'text-orange-600' : 'text-red-600'}`}>
                                        {item.stock}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Additional Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {item.preparationTime && (
                                <div>
                                    <label className="block text-sm font-black uppercase tracking-widest text-text-subtle mb-2">
                                        Preparation Time
                                    </label>
                                    <p className="text-lg font-bold text-text-main">{item.preparationTime} minutes</p>
                                </div>
                            )}

                            {item.barcode && (
                                <div>
                                    <label className="block text-sm font-black uppercase tracking-widest text-text-subtle mb-2">
                                        Barcode
                                    </label>
                                    <p className="text-lg font-mono font-bold text-text-main">{item.barcode}</p>
                                </div>
                            )}
                        </div>

                        {/* Description */}
                        {item.description && (
                            <div>
                                <label className="block text-sm font-black uppercase tracking-widest text-text-subtle mb-2">
                                    Description
                                </label>
                                <p className="text-text-main leading-relaxed">{item.description}</p>
                            </div>
                        )}

                        {/* Availability */}
                        <div className="flex items-center gap-3">
                            <Badge variant={item.isAvailable ? 'success' : 'error'}>
                                {item.isAvailable ? 'Available' : 'Unavailable'}
                            </Badge>
                        </div>

                        {/* Timestamps */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border-subtle">
                            <div>
                                <label className="block text-sm font-black uppercase tracking-widest text-text-subtle mb-2">
                                    Created
                                </label>
                                <p className="text-sm font-medium text-text-main">
                                    {new Date(item.createdAt).toLocaleString()}
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-black uppercase tracking-widest text-text-subtle mb-2">
                                    Last Updated
                                </label>
                                <p className="text-sm font-medium text-text-main">
                                    {new Date(item.updatedAt).toLocaleString()}
                                </p>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-4 pt-6">
                            <Button
                                variant="outline"
                                onClick={onClose}
                                className="flex-1"
                            >
                                Close
                            </Button>

                            <Button
                                onClick={onEdit}
                                className="flex-1 gap-2"
                            >
                                <Edit3 size={16} />
                                Edit Item
                            </Button>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
}