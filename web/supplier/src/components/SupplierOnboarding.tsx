'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@shared/components/Card';
import { Button } from '@shared/components/Button';
import { Input } from '@shared/components/Input';
import { Label } from '@shared/components/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@shared/components/Select';
import { Textarea } from '@shared/components/Textarea';
import { Checkbox } from '@shared/components/Checkbox';
import { useAuth } from '@shared/providers/FirebaseAuthProvider';
import { useRouter } from 'next/navigation';

const SupplierOnboarding = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    businessName: '',
    description: '',
    contactEmail: '',
    contactPhone: '',
    address: '',
    taxId: '',
    businessType: 'wholesaler',
    commissionRate: 5.0,
    payoutMethod: 'bank_transfer',
    bankAccountNumber: '',
    bankRoutingNumber: '',
    bankName: '',
    cryptoAddress: '',
    minOrderAmount: 50,
    inventorySyncEnabled: true,
    shippingOptions: [
      {
        name: 'Standard Ground',
        cost: 5.99,
        estimatedDays: 5,
        serviceType: 'standard',
        zones: ['local']
      }
    ]
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (name: string) => {
    setFormData(prev => ({ ...prev, [name]: !(prev as any)[name] }));
  };

  const addShippingOption = () => {
    setFormData(prev => ({
      ...prev,
      shippingOptions: [
        ...prev.shippingOptions,
        {
          name: '',
          cost: 0,
          estimatedDays: 0,
          serviceType: 'standard',
          zones: ['local']
        }
      ]
    }));
  };

  const updateShippingOption = (index: number, field: string, value: string | number) => {
    setFormData(prev => {
      const newShippingOptions = [...prev.shippingOptions];
      (newShippingOptions[index] as any)[field] = value;
      return { ...prev, shippingOptions: newShippingOptions };
    });
  };

  const removeShippingOption = (index: number) => {
    setFormData(prev => ({
      ...prev,
      shippingOptions: prev.shippingOptions.filter((_, i) => i !== index)
    }));
  };

  const validateStep1 = () => {
    if (!formData.businessName.trim()) {
      setError('Business name is required');
      return false;
    }
    if (!formData.contactEmail.trim()) {
      setError('Contact email is required');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.contactEmail)) {
      setError('Invalid email format');
      return false;
    }
    if (!formData.address.trim()) {
      setError('Business address is required');
      return false;
    }
    setError('');
    return true;
  };

  const validateStep2 = () => {
    if (formData.payoutMethod === 'bank_transfer') {
      if (!formData.bankAccountNumber.trim()) {
        setError('Bank account number is required');
        return false;
      }
      if (!formData.bankRoutingNumber.trim()) {
        setError('Bank routing number is required');
        return false;
      }
      if (!formData.bankName.trim()) {
        setError('Bank name is required');
        return false;
      }
    } else if (formData.payoutMethod === 'crypto') {
      if (!formData.cryptoAddress.trim()) {
        setError('Crypto wallet address is required');
        return false;
      }
    }
    setError('');
    return true;
  };

  const nextStep = () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    
    setStep(prev => prev + 1);
    setError('');
  };

  const prevStep = () => {
    setStep(prev => prev - 1);
    setError('');
  };

  const submitApplication = async () => {
    if (!user) {
      setError('You must be logged in to register as a supplier');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Prepare the supplier data for submission
      const supplierData = {
        userId: user.uid,
        businessName: formData.businessName,
        description: formData.description,
        contactEmail: formData.contactEmail,
        contactPhone: formData.contactPhone,
        address: formData.address,
        taxId: formData.taxId,
        businessType: formData.businessType,
        commissionRate: formData.commissionRate,
        payoutMethod: formData.payoutMethod,
        bankDetails: formData.payoutMethod === 'bank_transfer' ? {
          accountNumber: formData.bankAccountNumber,
          routingNumber: formData.bankRoutingNumber,
          bankName: formData.bankName
        } : undefined,
        cryptoAddress: formData.payoutMethod === 'crypto' ? formData.cryptoAddress : undefined,
        minOrderAmount: formData.minOrderAmount,
        shippingOptions: formData.shippingOptions,
        inventorySyncEnabled: formData.inventorySyncEnabled
      };

      // Submit to the API
      const response = await fetch('/api/supplier/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(supplierData),
      });

      const result = await response.json();

      if (response.ok) {
        // Redirect to success page or dashboard
        router.push('/onboarding/success');
      } else {
        setError(result.error || 'Failed to submit application');
      }
    } catch (err) {
      setError('An error occurred while submitting your application');
      console.error('Supplier registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-text-main mb-4">Join Our Supplier Network</h1>
          <p className="text-xl text-text-muted max-w-2xl mx-auto">
            Become a verified supplier on the NileLink marketplace and grow your B2B business
          </p>
        </div>

        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-2xl">Supplier Registration</CardTitle>
            <CardDescription>
              Step {step} of 3: {step === 1 ? 'Business Information' : step === 2 ? 'Payment Setup' : 'Review & Submit'}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {error && (
              <div className="bg-destructive/10 border border-destructive text-destructive p-4 rounded-lg mb-6">
                {error}
              </div>
            )}

            {step === 1 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="businessName">Business Name *</Label>
                    <Input
                      id="businessName"
                      name="businessName"
                      value={formData.businessName}
                      onChange={handleChange}
                      placeholder="Enter your business name"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="businessType">Business Type</Label>
                    <Select value={formData.businessType} onValueChange={(value) => handleSelectChange('businessType', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select business type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="wholesaler">Wholesaler</SelectItem>
                        <SelectItem value="distributor">Distributor</SelectItem>
                        <SelectItem value="manufacturer">Manufacturer</SelectItem>
                        <SelectItem value="retailer">Retailer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Business Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe your business and the products you sell"
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="contactEmail">Contact Email *</Label>
                    <Input
                      id="contactEmail"
                      name="contactEmail"
                      type="email"
                      value={formData.contactEmail}
                      onChange={handleChange}
                      placeholder="your-business@example.com"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="contactPhone">Contact Phone</Label>
                    <Input
                      id="contactPhone"
                      name="contactPhone"
                      type="tel"
                      value={formData.contactPhone}
                      onChange={handleChange}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Business Address *</Label>
                  <Textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Enter your full business address"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="taxId">Tax ID / EIN</Label>
                    <Input
                      id="taxId"
                      name="taxId"
                      value={formData.taxId}
                      onChange={handleChange}
                      placeholder="12-3456789"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="minOrderAmount">Minimum Order Amount ($)</Label>
                    <Input
                      id="minOrderAmount"
                      name="minOrderAmount"
                      type="number"
                      value={formData.minOrderAmount}
                      onChange={handleChange}
                      min="0"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="commissionRate">Preferred Commission Rate (%)</Label>
                  <Input
                    id="commissionRate"
                    name="commissionRate"
                    type="number"
                    value={formData.commissionRate}
                    onChange={handleChange}
                    min="0"
                    max="100"
                    step="0.1"
                  />
                  <p className="text-sm text-muted-foreground">
                    This is the percentage you're willing to pay as commission to the platform. 
                    The platform will confirm this rate during approval.
                  </p>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="payoutMethod">Payout Method</Label>
                  <Select value={formData.payoutMethod} onValueChange={(value) => handleSelectChange('payoutMethod', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select payout method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      <SelectItem value="crypto">Cryptocurrency</SelectItem>
                      <SelectItem value="check">Check</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.payoutMethod === 'bank_transfer' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="bankAccountNumber">Bank Account Number</Label>
                        <Input
                          id="bankAccountNumber"
                          name="bankAccountNumber"
                          value={formData.bankAccountNumber}
                          onChange={handleChange}
                          placeholder="Enter account number"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="bankRoutingNumber">Bank Routing Number</Label>
                        <Input
                          id="bankRoutingNumber"
                          name="bankRoutingNumber"
                          value={formData.bankRoutingNumber}
                          onChange={handleChange}
                          placeholder="Enter routing number"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="bankName">Bank Name</Label>
                      <Input
                        id="bankName"
                        name="bankName"
                        value={formData.bankName}
                        onChange={handleChange}
                        placeholder="Enter bank name"
                      />
                    </div>
                  </div>
                )}

                {formData.payoutMethod === 'crypto' && (
                  <div className="space-y-2">
                    <Label htmlFor="cryptoAddress">Cryptocurrency Address</Label>
                    <Input
                      id="cryptoAddress"
                      name="cryptoAddress"
                      value={formData.cryptoAddress}
                      onChange={handleChange}
                      placeholder="Enter your crypto wallet address"
                    />
                    <p className="text-sm text-muted-foreground">
                      Currently supporting Ethereum-compatible addresses (ERC-20 tokens)
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Shipping Options</Label>
                  <p className="text-sm text-muted-foreground mb-4">
                    Define the shipping options you offer to buyers
                  </p>
                  
                  {formData.shippingOptions.map((option, index) => (
                    <Card key={index} className="p-4 mb-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        <div>
                          <Label>Name</Label>
                          <Input
                            value={option.name}
                            onChange={(e) => updateShippingOption(index, 'name', e.target.value)}
                            placeholder="e.g., Standard Ground"
                          />
                        </div>
                        
                        <div>
                          <Label>Cost ($)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={option.cost}
                            onChange={(e) => updateShippingOption(index, 'cost', parseFloat(e.target.value))}
                            placeholder="0.00"
                          />
                        </div>
                        
                        <div>
                          <Label>Est. Days</Label>
                          <Input
                            type="number"
                            value={option.estimatedDays}
                            onChange={(e) => updateShippingOption(index, 'estimatedDays', parseInt(e.target.value))}
                            placeholder="5"
                          />
                        </div>
                        
                        <div>
                          <Label>Service Type</Label>
                          <Select 
                            value={option.serviceType} 
                            onValueChange={(value) => updateShippingOption(index, 'serviceType', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="standard">Standard</SelectItem>
                              <SelectItem value="express">Express</SelectItem>
                              <SelectItem value="overnight">Overnight</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="flex items-end">
                          <Button
                            type="button"
                            variant="destructive"
                            onClick={() => removeShippingOption(index)}
                            disabled={formData.shippingOptions.length <= 1}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                  
                  <Button type="button" variant="outline" onClick={addShippingOption}>
                    Add Shipping Option
                  </Button>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="inventorySyncEnabled"
                    checked={formData.inventorySyncEnabled}
                    onCheckedChange={() => handleCheckboxChange('inventorySyncEnabled')}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="inventorySyncEnabled" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Enable real-time inventory synchronization
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Allow your inventory to sync automatically with the marketplace
                    </p>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Review Your Information</h3>
                
                <div className="border rounded-lg divide-y">
                  <div className="p-4">
                    <h4 className="font-medium text-muted-foreground mb-2">Business Information</h4>
                    <p><strong>Business Name:</strong> {formData.businessName}</p>
                    <p><strong>Business Type:</strong> {formData.businessType}</p>
                    <p><strong>Contact Email:</strong> {formData.contactEmail}</p>
                    <p><strong>Phone:</strong> {formData.contactPhone || 'Not provided'}</p>
                    <p><strong>Address:</strong> {formData.address}</p>
                    <p><strong>Tax ID:</strong> {formData.taxId || 'Not provided'}</p>
                    <p><strong>Min. Order:</strong> ${formData.minOrderAmount}</p>
                    <p><strong>Commission Rate:</strong> {formData.commissionRate}%</p>
                  </div>
                  
                  <div className="p-4">
                    <h4 className="font-medium text-muted-foreground mb-2">Payment Information</h4>
                    <p><strong>Payout Method:</strong> {formData.payoutMethod}</p>
                    {formData.payoutMethod === 'bank_transfer' && (
                      <>
                        <p><strong>Account:</strong> ****{formData.bankAccountNumber.slice(-4)}</p>
                        <p><strong>Routing:</strong> ****{formData.bankRoutingNumber.slice(-4)}</p>
                        <p><strong>Bank:</strong> {formData.bankName}</p>
                      </>
                    )}
                    {formData.payoutMethod === 'crypto' && (
                      <p><strong>Address:</strong> {formData.cryptoAddress}</p>
                    )}
                  </div>
                  
                  <div className="p-4">
                    <h4 className="font-medium text-muted-foreground mb-2">Shipping Options</h4>
                    {formData.shippingOptions.map((option, index) => (
                      <div key={index} className="mb-2 last:mb-0">
                        <p><strong>{option.name}:</strong> ${option.cost} (~{option.estimatedDays} days)</p>
                      </div>
                    ))}
                  </div>
                  
                  <div className="p-4">
                    <h4 className="font-medium text-muted-foreground mb-2">Settings</h4>
                    <p><strong>Inventory Sync:</strong> {formData.inventorySyncEnabled ? 'Enabled' : 'Disabled'}</p>
                  </div>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-800 mb-2">Terms & Conditions</h4>
                  <p className="text-sm text-blue-700">
                    By submitting this application, you agree to our supplier terms and conditions. 
                    You acknowledge that your application will be reviewed by our team, and approval 
                    is subject to meeting our quality and compliance standards. 
                    Commission rates are subject to final agreement during the approval process.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
          
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={prevStep} disabled={step === 1}>
              Previous
            </Button>
            
            {step < 3 ? (
              <Button onClick={nextStep}>Next</Button>
            ) : (
              <Button onClick={submitApplication} disabled={loading}>
                {loading ? 'Submitting...' : 'Submit Application'}
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default SupplierOnboarding;