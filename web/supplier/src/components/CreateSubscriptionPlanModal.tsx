'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Plus, Package, Calendar, DollarSign, Users, Clock, MapPin } from 'lucide-react';
import { Button } from '@shared/components/Button';
import { useNotifications } from '@shared/contexts/NotificationContext';

interface CreateSubscriptionPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (planData: any) => void;
}

export default function CreateSubscriptionPlanModal({ 
  isOpen, 
  onClose, 
  onSubmit 
}: CreateSubscriptionPlanModalProps) {
  const { addNotification: notify } = useNotifications();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    currency: 'USD',
    frequency: 'daily',
    maxSubscribers: '',
    deliveryWindow: '08:00-12:00',
    deliveryDays: ['MON', 'TUE', 'WED', 'THU', 'FRI'],
    includedItems: [''] as string[],
    benefits: [''] as string[]
  });

  const frequencies = [
    { value: 'daily', label: 'Daily', description: 'Delivered every day' },
    { value: 'weekly', label: 'Weekly', description: 'Delivered once per week' },
    { value: 'biweekly', label: 'Bi-weekly', description: 'Delivered every two weeks' },
    { value: 'monthly', label: 'Monthly', description: 'Delivered once per month' }
  ];

  const currencies = ['USD', 'EUR', 'GBP', 'EGP'];

  const daysOfWeek = [
    { value: 'MON', label: 'Monday' },
    { value: 'TUE', label: 'Tuesday' },
    { value: 'WED', label: 'Wednesday' },
    { value: 'THU', label: 'Thursday' },
    { value: 'FRI', label: 'Friday' },
    { value: 'SAT', label: 'Saturday' },
    { value: 'SUN', label: 'Sunday' }
  ];

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price || !formData.description) {
      notify({ type: 'error', title: 'Validation Error', message: 'Please fill in all required fields' });
      return;
    }

    const planData = {
      ...formData,
      price: parseFloat(formData.price),
      maxSubscribers: parseInt(formData.maxSubscribers) || 100,
      includedItems: formData.includedItems.filter(item => item.trim()),
      benefits: formData.benefits.filter(benefit => benefit.trim())
    };

    onSubmit(planData);
    onClose();
    
    // Reset form
    setFormData({
      name: '',
      description: '',
      price: '',
      currency: 'USD',
      frequency: 'daily',
      maxSubscribers: '',
      deliveryWindow: '08:00-12:00',
      deliveryDays: ['MON', 'TUE', 'WED', 'THU', 'FRI'],
      includedItems: [''],
      benefits: ['']
    });
  };

  const addIncludedItem = () => {
    setFormData(prev => ({
      ...prev,
      includedItems: [...prev.includedItems, '']
    }));
  };

  const removeIncludedItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      includedItems: prev.includedItems.filter((_, i) => i !== index)
    }));
  };

  const updateIncludedItem = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      includedItems: prev.includedItems.map((item, i) => i === index ? value : item)
    }));
  };

  const addBenefit = () => {
    setFormData(prev => ({
      ...prev,
      benefits: [...prev.benefits, '']
    }));
  };

  const removeBenefit = (index: number) => {
    setFormData(prev => ({
      ...prev,
      benefits: prev.benefits.filter((_, i) => i !== index)
    }));
  };

  const updateBenefit = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      benefits: prev.benefits.map((benefit, i) => i === index ? value : benefit)
    }));
  };

  const toggleDeliveryDay = (day: string) => {
    setFormData(prev => ({
      ...prev,
      deliveryDays: prev.deliveryDays.includes(day)
        ? prev.deliveryDays.filter(d => d !== day)
        : [...prev.deliveryDays, day]
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-900">Create Subscription Plan</h2>
              <p className="text-sm text-gray-600">Set up a recurring delivery service for your customers</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="p-6 space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Plan Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Daily Essentials Box"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Price *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    placeholder="0.00"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe what customers will receive in this subscription"
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                required
              />
            </div>

            {/* Frequency and Capacity */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Delivery Frequency
                </label>
                <select
                  value={formData.frequency}
                  onChange={(e) => setFormData(prev => ({ ...prev, frequency: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                >
                  {frequencies.map(freq => (
                    <option key={freq.value} value={freq.value}>
                      {freq.label} - {freq.description}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Max Subscribers
                </label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="number"
                    value={formData.maxSubscribers}
                    onChange={(e) => setFormData(prev => ({ ...prev, maxSubscribers: e.target.value }))}
                    placeholder="100"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Delivery Days */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">
                Delivery Days
              </label>
              <div className="flex flex-wrap gap-2">
                {daysOfWeek.map(day => (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() => toggleDeliveryDay(day.value)}
                    className={`px-3 py-2 rounded-lg text-sm font-bold transition-all ${
                      formData.deliveryDays.includes(day.value)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {day.label.substring(0, 3)}
                  </button>
                ))}
              </div>
            </div>

            {/* Included Items */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-bold text-gray-700">
                  Included Items
                </label>
                <button
                  type="button"
                  onClick={addIncludedItem}
                  className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-bold"
                >
                  <Plus size={16} />
                  Add Item
                </button>
              </div>
              <div className="space-y-2">
                {formData.includedItems.map((item, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => updateIncludedItem(index, e.target.value)}
                      placeholder="e.g., Fresh milk, organic bread, free-range eggs"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                    {formData.includedItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeIncludedItem(index)}
                        className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Benefits */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-bold text-gray-700">
                  Plan Benefits
                </label>
                <button
                  type="button"
                  onClick={addBenefit}
                  className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-bold"
                >
                  <Plus size={16} />
                  Add Benefit
                </button>
              </div>
              <div className="space-y-2">
                {formData.benefits.map((benefit, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={benefit}
                      onChange={(e) => updateBenefit(index, e.target.value)}
                      placeholder="e.g., Priority delivery, exclusive discounts, flexible scheduling"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                    {formData.benefits.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeBenefit(index)}
                        className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 bg-gray-50 flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 h-12 font-bold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 font-bold shadow-lg"
            >
              Create Plan
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}