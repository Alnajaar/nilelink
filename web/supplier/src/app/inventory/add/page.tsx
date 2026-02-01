'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Package, Tag, Hash, MapPin, PackageOpen, 
  Upload, Image as ImageIcon, Globe, DollarSign, 
  Percent, RotateCcw, CheckCircle
} from 'lucide-react';
import { Button } from '@shared/components/Button';
import { Card } from '@shared/components/Card';
import { Badge } from '@shared/components/Badge';
import { useAuth } from '@shared/providers/FirebaseAuthProvider';

interface ProductFormData {
  name: string;
  description: string;
  sku: string;
  category: string;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  weight: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  images: string[];
  tags: string[];
  currency: string;
  taxRate: number;
  supplierId: string;
}

const categories = [
  'Food & Beverages', 'Electronics', 'Clothing', 'Home Goods', 
  'Beauty & Personal Care', 'Industrial Supplies', 'Healthcare',
  'Office Supplies', 'Automotive', 'Construction Materials'
];

const currencies = ['USD', 'EUR', 'EGP', 'GBP', 'AED'];

export default function AddProductPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    sku: '',
    category: '',
    price: 0,
    cost: 0,
    stock: 0,
    minStock: 0,
    weight: 0,
    dimensions: {
      length: 0,
      width: 0,
      height: 0
    },
    images: [],
    tags: [],
    currency: 'USD',
    taxRate: 0,
    supplierId: user?.uid || ''
  });
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const handleInputChange = (field: keyof ProductFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDimensionChange = (dimension: keyof ProductFormData['dimensions'], value: number) => {
    setFormData(prev => ({
      ...prev,
      dimensions: {
        ...prev.dimensions,
        [dimension]: value
      }
    }));
  };

  const addTag = (tag: string) => {
    if (tag.trim() && !formData.tags.includes(tag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag.trim()]
      }));
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // In a real implementation, you would send this data to your backend
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('nilelink_auth_token')}`
        },
        body: JSON.stringify({
          ...formData,
          supplierId: user?.uid
        })
      });

      if (response.ok) {
        router.push('/inventory?success=true');
      } else {
        throw new Error('Failed to add product');
      }
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Failed to add product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { title: 'Basic Info', icon: Package },
    { title: 'Pricing', icon: DollarSign },
    { title: 'Inventory', icon: PackageOpen },
    { title: 'Details', icon: MapPin }
  ];

  return (
    <div className="min-h-screen bg-background antialiased">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-main mb-2">Add New Product</h1>
          <p className="text-text-muted">Fill in the details for your new product listing</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-text-muted">
              Step {currentStep + 1} of {steps.length}
            </span>
          </div>
          <div className="h-2 bg-surface rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-green-500 transition-all duration-500 ease-out"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="mb-8">
            {/* Step Headers */}
            <div className="flex border-b border-border-subtle">
              {steps.map((step, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setCurrentStep(index)}
                  className={`flex-1 py-4 px-2 text-center flex flex-col items-center justify-center ${
                    currentStep === index
                      ? 'text-primary border-b-2 border-primary'
                      : 'text-text-muted hover:text-text-main'
                  }`}
                >
                  <step.icon className="w-5 h-5 mb-1" />
                  <span className="text-sm font-medium">{step.title}</span>
                </button>
              ))}
            </div>

            {/* Step Content */}
            <div className="p-8">
              {currentStep === 0 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <div>
                    <label className="block text-sm font-medium text-text-main mb-2">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full px-4 py-3 bg-surface border border-border-subtle rounded-lg text-text-main focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Enter product name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-main mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 bg-surface border border-border-subtle rounded-lg text-text-main focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Describe your product"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-text-main mb-2">
                        SKU (Stock Keeping Unit) *
                      </label>
                      <input
                        type="text"
                        value={formData.sku}
                        onChange={(e) => handleInputChange('sku', e.target.value)}
                        className="w-full px-4 py-3 bg-surface border border-border-subtle rounded-lg text-text-main focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Unique identifier for this product"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-text-main mb-2">
                        Category
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => handleInputChange('category', e.target.value)}
                        className="w-full px-4 py-3 bg-surface border border-border-subtle rounded-lg text-text-main focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="">Select a category</option>
                        {categories.map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-main mb-2">
                      Tags
                    </label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {formData.tags.map((tag, index) => (
                        <Badge key={index} variant="primary" className="flex items-center gap-1">
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="ml-1 text-white hover:text-gray-200"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addTag((e.target as HTMLInputElement).value);
                            (e.target as HTMLInputElement).value = '';
                          }
                        }}
                        className="flex-1 px-4 py-3 bg-surface border border-border-subtle rounded-lg text-text-main focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Add tags (press Enter)"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={(e) => {
                          const input = (e.target as HTMLElement).previousElementSibling as HTMLInputElement;
                          addTag(input.value);
                          input.value = '';
                        }}
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}

              {currentStep === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-text-main mb-2">
                        Price *
                      </label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted w-5 h-5" />
                        <input
                          type="number"
                          value={formData.price}
                          onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                          className="w-full pl-10 pr-4 py-3 bg-surface border border-border-subtle rounded-lg text-text-main focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-text-main mb-2">
                        Cost Price
                      </label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted w-5 h-5" />
                        <input
                          type="number"
                          value={formData.cost}
                          onChange={(e) => handleInputChange('cost', parseFloat(e.target.value) || 0)}
                          className="w-full pl-10 pr-4 py-3 bg-surface border border-border-subtle rounded-lg text-text-main focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-text-main mb-2">
                        Currency
                      </label>
                      <select
                        value={formData.currency}
                        onChange={(e) => handleInputChange('currency', e.target.value)}
                        className="w-full px-4 py-3 bg-surface border border-border-subtle rounded-lg text-text-main focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        {currencies.map(currency => (
                          <option key={currency} value={currency}>{currency}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-text-main mb-2">
                        Tax Rate (%)
                      </label>
                      <div className="relative">
                        <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted w-5 h-5" />
                        <input
                          type="number"
                          value={formData.taxRate}
                          onChange={(e) => handleInputChange('taxRate', parseFloat(e.target.value) || 0)}
                          className="w-full pl-10 pr-4 py-3 bg-surface border border-border-subtle rounded-lg text-text-main focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="0"
                          min="0"
                          max="100"
                          step="0.1"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {currentStep === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-text-main mb-2">
                        Current Stock *
                      </label>
                      <input
                        type="number"
                        value={formData.stock}
                        onChange={(e) => handleInputChange('stock', parseInt(e.target.value) || 0)}
                        className="w-full px-4 py-3 bg-surface border border-border-subtle rounded-lg text-text-main focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="0"
                        min="0"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-text-main mb-2">
                        Minimum Stock
                      </label>
                      <input
                        type="number"
                        value={formData.minStock}
                        onChange={(e) => handleInputChange('minStock', parseInt(e.target.value) || 0)}
                        className="w-full px-4 py-3 bg-surface border border-border-subtle rounded-lg text-text-main focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="0"
                        min="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-text-main mb-2">
                        Weight (kg)
                      </label>
                      <input
                        type="number"
                        value={formData.weight}
                        onChange={(e) => handleInputChange('weight', parseFloat(e.target.value) || 0)}
                        className="w-full px-4 py-3 bg-surface border border-border-subtle rounded-lg text-text-main focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {currentStep === 3 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <div>
                    <label className="block text-sm font-medium text-text-main mb-2">
                      Product Images
                    </label>
                    <div className="border-2 border-dashed border-border-subtle rounded-xl p-8 text-center">
                      <ImageIcon className="w-12 h-12 text-text-muted mx-auto mb-4" />
                      <p className="text-text-muted mb-2">Drag and drop images here, or click to browse</p>
                      <p className="text-sm text-text-subtle mb-4">Supports JPG, PNG, GIF up to 10MB</p>
                      <Button variant="outline">
                        <Upload className="w-4 h-4 mr-2" />
                        Select Images
                      </Button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-main mb-2">
                      Dimensions (cm)
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs text-text-subtle mb-1">Length</label>
                        <input
                          type="number"
                          value={formData.dimensions.length}
                          onChange={(e) => handleDimensionChange('length', parseFloat(e.target.value) || 0)}
                          className="w-full px-4 py-3 bg-surface border border-border-subtle rounded-lg text-text-main focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="0"
                          min="0"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-text-subtle mb-1">Width</label>
                        <input
                          type="number"
                          value={formData.dimensions.width}
                          onChange={(e) => handleDimensionChange('width', parseFloat(e.target.value) || 0)}
                          className="w-full px-4 py-3 bg-surface border border-border-subtle rounded-lg text-text-main focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="0"
                          min="0"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-text-subtle mb-1">Height</label>
                        <input
                          type="number"
                          value={formData.dimensions.height}
                          onChange={(e) => handleDimensionChange('height', parseFloat(e.target.value) || 0)}
                          className="w-full px-4 py-3 bg-surface border border-border-subtle rounded-lg text-text-main focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="0"
                          min="0"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </Card>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Previous
            </Button>
            
            {currentStep < steps.length - 1 ? (
              <Button
                type="button"
                onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
              >
                Next
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <RotateCcw className="w-4 h-4 mr-2 animate-spin" />
                    Adding Product...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Add Product
                  </>
                )}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}