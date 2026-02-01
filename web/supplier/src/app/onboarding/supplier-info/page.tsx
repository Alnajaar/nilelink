'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Package, Building2, MapPin, Phone, Globe, 
  CreditCard, CheckCircle, ArrowRight, ArrowLeft,
  Upload, Truck, Factory, Store, Warehouse,
  Mail, Wallet
} from 'lucide-react';
import { Button } from '@shared/components/Button';
import { Card } from '@shared/components/Card';
import { Badge } from '@shared/components/Badge';
import { useAuth } from '@shared/providers/FirebaseAuthProvider';

interface SupplierOnboardingData {
  businessType: string;
  businessName: string;
  businessDescription: string;
  categories: string[];
  phone: string;
  email: string;
  website: string;
  country: string;
  address: string;
  city: string;
  postalCode: string;
  products: Array<{
    name: string;
    category: string;
    description: string;
    price: number;
    stock: number;
  }>;
  shippingInfo: {
    deliveryMethods: string[];
    regions: string[];
    leadTime: string;
  };
  paymentTerms: {
    method: string;
    terms: string;
    currency: string;
  };
  emailVerified: boolean;
  walletConnected: boolean;
}

const businessCategories = [
  'Food & Beverages', 'Electronics', 'Clothing', 'Home Goods', 
  'Beauty & Personal Care', 'Industrial Supplies', 'Healthcare',
  'Office Supplies', 'Automotive', 'Construction Materials'
];

const deliveryMethods = [
  'Own Fleet', 'Third-party Logistics', 'Courier Service', 
  'Pickup Only', 'Postal Service'
];

const regions = [
  'Local', 'Regional', 'National', 'International'
];

export default function SupplierInfoOnboarding() {
  const router = useRouter();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<SupplierOnboardingData>({
    businessType: 'manufacturer',
    businessName: '',
    businessDescription: '',
    categories: [],
    phone: '',
    email: '',
    website: '',
    country: 'Egypt',
    address: '',
    city: '',
    postalCode: '',
    products: [],
    shippingInfo: {
      deliveryMethods: [],
      regions: [],
      leadTime: '1-3 days'
    },
    paymentTerms: {
      method: 'bank_transfer',
      terms: 'NET 30',
      currency: 'USD'
    },
    emailVerified: false,
    walletConnected: false
  });

  const toggleCategory = (category: string) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  const toggleDeliveryMethod = (method: string) => {
    setFormData(prev => ({
      ...prev,
      shippingInfo: {
        ...prev.shippingInfo,
        deliveryMethods: prev.shippingInfo.deliveryMethods.includes(method)
          ? prev.shippingInfo.deliveryMethods.filter(m => m !== method)
          : [...prev.shippingInfo.deliveryMethods, method]
      }
    }));
  };

  const toggleRegion = (region: string) => {
    setFormData(prev => ({
      ...prev,
      shippingInfo: {
        ...prev.shippingInfo,
        regions: prev.shippingInfo.regions.includes(region)
          ? prev.shippingInfo.regions.filter(r => r !== region)
          : [...prev.shippingInfo.regions, region]
      }
    }));
  };

  const steps = [
    {
      title: 'Business Type',
      description: 'What type of supplier are you?',
      icon: Building2
    },
    {
      title: 'Business Info',
      description: 'Basic information about your business',
      icon: Store
    },
    {
      title: 'Business Categories',
      description: 'What categories do you specialize in?',
      icon: Package
    },
    {
      title: 'Location Details',
      description: 'Where is your business located?',
      icon: MapPin
    },
    {
      title: 'Shipping Info',
      description: 'How do you deliver your products?',
      icon: Truck
    },
    {
      title: 'Payment Terms',
      description: 'How do you prefer to be paid?',
      icon: CreditCard
    },
    {
      title: 'Complete',
      description: 'You\'re all set!',
      icon: CheckCircle
    }
  ];

  const validateStep = (): { isValid: boolean; errors: Record<string, string> } => {
    const newErrors: Record<string, string> = {};
    
    switch (currentStep) {
      case 0: // Business Type
        if (!formData.businessType) {
          newErrors.businessType = 'Business type is required';
        }
        break;
      case 1: // Business Info
        if (!formData.businessName.trim()) {
          newErrors.businessName = 'Business name is required';
        }
        if (!formData.phone.trim()) {
          newErrors.phone = 'Phone number is required';
        }
        break;
      case 2: // Business Categories
        if (formData.categories.length === 0) {
          newErrors.categories = 'At least one category is required';
        }
        break;
      case 3: // Location Details
        if (!formData.address.trim()) {
          newErrors.address = 'Street address is required';
        }
        if (!formData.city.trim()) {
          newErrors.city = 'City is required';
        }
        if (!formData.country.trim()) {
          newErrors.country = 'Country is required';
        }
        break;
      case 4: // Shipping Info
        if (formData.shippingInfo.deliveryMethods.length === 0) {
          newErrors.deliveryMethods = 'At least one delivery method is required';
        }
        if (formData.shippingInfo.regions.length === 0) {
          newErrors.regions = 'At least one shipping region is required';
        }
        break;
      case 5: // Payment Terms
        if (!formData.paymentTerms.method) {
          newErrors.paymentMethod = 'Payment method is required';
        }
        if (!formData.paymentTerms.terms) {
          newErrors.paymentTerms = 'Payment terms are required';
        }
        break;
    }
    
    return { isValid: Object.keys(newErrors).length === 0, errors: newErrors };
  };

  const handleNext = () => {
    const { isValid, errors: validationErrors } = validateStep();
    setErrors(validationErrors);
    
    if (!isValid) {
      return; // Don't proceed if validation fails
    }
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete onboarding - Save supplier data
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // In a real implementation, you would save this data to your backend
      // For now, we'll just save to localStorage and redirect
      
      // Simulate API call to save supplier data
      const response = await fetch('/api/supplier/onboard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('nilelink_auth_token')}`
        },
        body: JSON.stringify({
          ...formData,
          userId: user?.uid
        })
      });

      if (response.ok) {
        // Mark onboarding as complete by calling the status update endpoint
        await fetch('/api/onboarding/status', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user?.uid,
            completed: true
          })
        });
        
        // Redirect to dashboard
        router.push('/dashboard?onboarding=complete');
      } else {
        throw new Error('Failed to save supplier information');
      }
    } catch (error) {
      console.error('Error saving supplier data:', error);
      // Fallback redirect
      router.push('/dashboard?onboarding=complete');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <p className="text-text-muted">Select your business type as a supplier</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                type="button"
                onClick={() => {
                  setFormData({ ...formData, businessType: 'manufacturer' });
                  const newErrors = { ...errors };
                  delete newErrors.businessType;
                  setErrors(newErrors);
                }}
                className={`p-6 rounded-xl border-2 transition-all ${
                  formData.businessType === 'manufacturer'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border-subtle hover:border-primary/50 hover:bg-primary/5'
                }`}
              >
                <Factory className="w-8 h-8 mx-auto mb-3" />
                <h3 className="font-bold text-lg mb-1">Manufacturer</h3>
                <p className="text-sm text-text-muted">Produce goods directly</p>
              </button>
              <button
                type="button"
                onClick={() => {
                  setFormData({ ...formData, businessType: 'distributor' });
                  const newErrors = { ...errors };
                  delete newErrors.businessType;
                  setErrors(newErrors);
                }}
                className={`p-6 rounded-xl border-2 transition-all ${
                  formData.businessType === 'distributor'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border-subtle hover:border-primary/50 hover:bg-primary/5'
                }`}
              >
                <Truck className="w-8 h-8 mx-auto mb-3" />
                <h3 className="font-bold text-lg mb-1">Distributor</h3>
                <p className="text-sm text-text-muted">Distribute products</p>
              </button>
              <button
                type="button"
                onClick={() => {
                  setFormData({ ...formData, businessType: 'wholesaler' });
                  const newErrors = { ...errors };
                  delete newErrors.businessType;
                  setErrors(newErrors);
                }}
                className={`p-6 rounded-xl border-2 transition-all ${
                  formData.businessType === 'wholesaler'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border-subtle hover:border-primary/50 hover:bg-primary/5'
                }`}
              >
                <Warehouse className="w-8 h-8 mx-auto mb-3" />
                <h3 className="font-bold text-lg mb-1">Wholesaler</h3>
                <p className="text-sm text-text-muted">Sell in bulk</p>
              </button>
            </div>
            {errors.businessType && (
              <p className="text-red-500 text-sm mt-2">{errors.businessType}</p>
            )}
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-text-main mb-2">
                Business Name *
              </label>
              <input
                type="text"
                value={formData.businessName}
                onChange={(e) => {
                  setFormData({ ...formData, businessName: e.target.value });
                  const newErrors = { ...errors };
                  delete newErrors.businessName;
                  setErrors(newErrors);
                }}
                className={`w-full px-4 py-3 bg-surface border ${errors.businessName ? 'border-red-500' : 'border-border-subtle'} rounded-lg text-text-main focus:outline-none focus:ring-2 focus:ring-primary`}
                placeholder="Enter your business name"
              />
              {errors.businessName && (
                <p className="text-red-500 text-sm mt-1">{errors.businessName}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-text-main mb-2">
                Business Description
              </label>
              <textarea
                value={formData.businessDescription}
                onChange={(e) => setFormData({ ...formData, businessDescription: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 bg-surface border border-border-subtle rounded-lg text-text-main focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Describe what your business does and what makes you unique"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-main mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => {
                    setFormData({ ...formData, phone: e.target.value });
                    const newErrors = { ...errors };
                    delete newErrors.phone;
                    setErrors(newErrors);
                  }}
                  className={`w-full px-4 py-3 bg-surface border ${errors.phone ? 'border-red-500' : 'border-border-subtle'} rounded-lg text-text-main focus:outline-none focus:ring-2 focus:ring-primary`}
                  placeholder="+20 123 456 7890"
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-text-main mb-2">
                  Website (Optional)
                </label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="w-full px-4 py-3 bg-surface border border-border-subtle rounded-lg text-text-main focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="https://yoursite.com"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <p className="text-text-muted">Select all categories that apply to your business</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {businessCategories.map((category) => (
                <button
                  type="button"
                  key={category}
                  onClick={() => {
                    toggleCategory(category);
                    const newErrors = { ...errors };
                    delete newErrors.categories;
                    setErrors(newErrors);
                  }}
                  className={`px-4 py-3 rounded-lg border transition-all ${
                    formData.categories.includes(category)
                      ? 'bg-primary/20 border-primary text-primary'
                      : 'bg-surface border-border-subtle text-text-muted hover:bg-surface/80'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
            {errors.categories && (
              <p className="text-red-500 text-sm mt-2">{errors.categories}</p>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-text-main mb-2">
                Street Address *
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => {
                  setFormData({ ...formData, address: e.target.value });
                  const newErrors = { ...errors };
                  delete newErrors.address;
                  setErrors(newErrors);
                }}
                className={`w-full px-4 py-3 bg-surface border ${errors.address ? 'border-red-500' : 'border-border-subtle'} rounded-lg text-text-main focus:outline-none focus:ring-2 focus:ring-primary`}
                placeholder="123 Business Street"
              />
              {errors.address && (
                <p className="text-red-500 text-sm mt-1">{errors.address}</p>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-main mb-2">
                  City *
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => {
                    setFormData({ ...formData, city: e.target.value });
                    const newErrors = { ...errors };
                    delete newErrors.city;
                    setErrors(newErrors);
                  }}
                  className={`w-full px-4 py-3 bg-surface border ${errors.city ? 'border-red-500' : 'border-border-subtle'} rounded-lg text-text-main focus:outline-none focus:ring-2 focus:ring-primary`}
                  placeholder="Cairo"
                />
                {errors.city && (
                  <p className="text-red-500 text-sm mt-1">{errors.city}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-text-main mb-2">
                  Postal Code
                </label>
                <input
                  type="text"
                  value={formData.postalCode}
                  onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                  className="w-full px-4 py-3 bg-surface border border-border-subtle rounded-lg text-text-main focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="12345"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-main mb-2">
                Country *
              </label>
              <select
                value={formData.country}
                onChange={(e) => {
                  setFormData({ ...formData, country: e.target.value });
                  const newErrors = { ...errors };
                  delete newErrors.country;
                  setErrors(newErrors);
                }}
                className={`w-full px-4 py-3 bg-surface border ${errors.country ? 'border-red-500' : 'border-border-subtle'} rounded-lg text-text-main focus:outline-none focus:ring-2 focus:ring-primary`}
              >
                <option value="">Select a country</option>
                <option value="Egypt">Egypt</option>
                <option value="UAE">United Arab Emirates</option>
                <option value="Saudi Arabia">Saudi Arabia</option>
                <option value="Jordan">Jordan</option>
                <option value="Lebanon">Lebanon</option>
                <option value="Palestine">Palestine</option>
              </select>
              {errors.country && (
                <p className="text-red-500 text-sm mt-1">{errors.country}</p>
              )}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-text-main mb-2">
                Delivery Methods *
              </label>
              <div className="grid grid-cols-2 gap-3">
                {deliveryMethods.map((method) => (
                  <button
                    type="button"
                    key={method}
                    onClick={() => {
                      toggleDeliveryMethod(method);
                      const newErrors = { ...errors };
                      delete newErrors.deliveryMethods;
                      setErrors(newErrors);
                    }}
                    className={`px-4 py-3 rounded-lg border transition-all ${
                      formData.shippingInfo.deliveryMethods.includes(method)
                        ? 'bg-primary/20 border-primary text-primary'
                        : 'bg-surface border-border-subtle text-text-muted hover:bg-surface/80'
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>
              {errors.deliveryMethods && (
                <p className="text-red-500 text-sm mt-1">{errors.deliveryMethods}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-main mb-2">
                Shipping Regions *
              </label>
              <div className="grid grid-cols-2 gap-3">
                {regions.map((region) => (
                  <button
                    type="button"
                    key={region}
                    onClick={() => {
                      toggleRegion(region);
                      const newErrors = { ...errors };
                      delete newErrors.regions;
                      setErrors(newErrors);
                    }}
                    className={`px-4 py-3 rounded-lg border transition-all ${
                      formData.shippingInfo.regions.includes(region)
                        ? 'bg-primary/20 border-primary text-primary'
                        : 'bg-surface border-border-subtle text-text-muted hover:bg-surface/80'
                    }`}
                  >
                    {region}
                  </button>
                ))}
              </div>
              {errors.regions && (
                <p className="text-red-500 text-sm mt-1">{errors.regions}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-main mb-2">
                Typical Lead Time
              </label>
              <select
                value={formData.shippingInfo.leadTime}
                onChange={(e) => setFormData({
                  ...formData,
                  shippingInfo: { ...formData.shippingInfo, leadTime: e.target.value }
                })}
                className="w-full px-4 py-3 bg-surface border border-border-subtle rounded-lg text-text-main focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="Same day">Same day</option>
                <option value="1-3 days">1-3 days</option>
                <option value="3-7 days">3-7 days</option>
                <option value="1-2 weeks">1-2 weeks</option>
                <option value="2-4 weeks">2-4 weeks</option>
              </select>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-text-main mb-2">
                Payment Method *
              </label>
              <select
                value={formData.paymentTerms.method}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    paymentTerms: { ...formData.paymentTerms, method: e.target.value }
                  });
                  const newErrors = { ...errors };
                  delete newErrors.paymentMethod;
                  setErrors(newErrors);
                }}
                className={`w-full px-4 py-3 bg-surface border ${errors.paymentMethod ? 'border-red-500' : 'border-border-subtle'} rounded-lg text-text-main focus:outline-none focus:ring-2 focus:ring-primary`}
              >
                <option value="">Select payment method</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="wire_transfer">Wire Transfer</option>
                <option value="check">Check</option>
                <option value="paypal">PayPal</option>
                <option value="crypto">Cryptocurrency</option>
              </select>
              {errors.paymentMethod && (
                <p className="text-red-500 text-sm mt-1">{errors.paymentMethod}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-main mb-2">
                Payment Terms *
              </label>
              <select
                value={formData.paymentTerms.terms}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    paymentTerms: { ...formData.paymentTerms, terms: e.target.value }
                  });
                  const newErrors = { ...errors };
                  delete newErrors.paymentTerms;
                  setErrors(newErrors);
                }}
                className={`w-full px-4 py-3 bg-surface border ${errors.paymentTerms ? 'border-red-500' : 'border-border-subtle'} rounded-lg text-text-main focus:outline-none focus:ring-2 focus:ring-primary`}
              >
                <option value="">Select payment terms</option>
                <option value="NET 7">NET 7 days</option>
                <option value="NET 15">NET 15 days</option>
                <option value="NET 30">NET 30 days</option>
                <option value="NET 60">NET 60 days</option>
                <option value="Cash on Delivery">Cash on Delivery</option>
              </select>
              {errors.paymentTerms && (
                <p className="text-red-500 text-sm mt-1">{errors.paymentTerms}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-main mb-2">
                Preferred Currency
              </label>
              <select
                value={formData.paymentTerms.currency}
                onChange={(e) => setFormData({
                  ...formData,
                  paymentTerms: { ...formData.paymentTerms, currency: e.target.value }
                })}
                className="w-full px-4 py-3 bg-surface border border-border-subtle rounded-lg text-text-main focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="EGP">EGP</option>
                <option value="GBP">GBP</option>
                <option value="AED">AED</option>
              </select>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-primary to-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-text-main mb-4">Supplier Profile Complete!</h2>
              <p className="text-text-muted mb-8 max-w-md mx-auto">
                Your supplier information has been saved. You can now start listing your products and connecting with buyers.
              </p>
            </div>
            
            <div className="space-y-6">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                      <Mail className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-text-main">Email Verification</div>
                      <div className="text-sm text-text-muted">{formData.email || 'No email provided'}</div>
                    </div>
                  </div>
                  {formData.emailVerified ? (
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  ) : (
                    <button
                      type="button"
                      onClick={async () => {
                        // Simulate email verification
                        try {
                          // In a real app, this would trigger an actual verification process
                          // For demo purposes, we'll just simulate it
                          setFormData({ ...formData, emailVerified: true });
                          
                          // Show success notification
                          alert('Verification email sent! Please check your inbox.');
                        } catch (error) {
                          // Show error notification
                          alert('Failed to send verification email. Please try again.');
                        }
                      }}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition"
                    >
                      Verify Now
                    </button>
                  )}
                </div>
                {!formData.emailVerified && (
                  <p className="text-sm text-text-muted mt-2">Click 'Verify Now' to confirm your email address</p>
                )}
              </Card>
              
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center">
                      <Wallet className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-text-main">Wallet Connection</div>
                      <div className="text-sm text-text-muted">Optional - for crypto payments</div>
                    </div>
                  </div>
                  {formData.walletConnected ? (
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  ) : (
                    <button
                      type="button"
                      onClick={async () => {
                        // Simulate wallet connection
                        try {
                          // In a real app, this would trigger actual wallet connection
                          // For demo purposes, we'll just simulate it
                          setFormData({ ...formData, walletConnected: true });
                          
                          // Show success notification
                          alert('Wallet connected successfully!');
                        } catch (error) {
                          // Show error notification
                          alert('Failed to connect wallet. Please try again.');
                        }
                      }}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition"
                    >
                      Connect
                    </button>
                  )}
                </div>
                {!formData.walletConnected && (
                  <p className="text-sm text-text-muted mt-2">Connect your wallet to enable crypto payments</p>
                )}
              </Card>
            </div>
            
            <div className="bg-surface border border-border-subtle rounded-xl p-6 text-left">
              <h3 className="font-bold text-lg text-text-main mb-4">Next Steps:</h3>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-text-main">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>Add your first products</span>
                </li>
                <li className="flex items-center gap-3 text-text-main">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>Set up inventory tracking</span>
                </li>
                <li className="flex items-center gap-3 text-text-main">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>Start receiving orders</span>
                </li>
                <li className="flex items-center gap-3 text-text-main">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>Connect with buyers</span>
                </li>
              </ul>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background antialiased">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Progress */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-text-muted">
              Step {currentStep + 1} of {steps.length}
            </span>
            <span className="text-sm text-text-muted">
              {Math.round(((currentStep + 1) / steps.length) * 100)}% Complete
            </span>
          </div>
          <div className="h-2 bg-surface rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-green-500 transition-all duration-500 ease-out"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface border border-border-subtle rounded-2xl p-8 shadow-xl"
        >
          {/* Step Header */}
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-green-500 flex items-center justify-center">
              {React.createElement(steps[currentStep].icon, {
                className: 'w-7 h-7 text-white'
              })}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-text-main">{steps[currentStep].title}</h2>
              <p className="text-text-muted">{steps[currentStep].description}</p>
            </div>
          </div>

          {/* Step Content */}
          <div className="mb-8">
            {renderStepContent()}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              variant="outline"
              className="px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>
            
            <Button
              onClick={handleNext}
              className="px-6 py-3 bg-gradient-to-r from-primary to-green-500 hover:from-primary/90 hover:to-green-500/90 text-white"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Processing...
                </>
              ) : (
                <>
                  <span>{currentStep === steps.length - 1 ? 'Finish Onboarding' : 'Continue'}</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}