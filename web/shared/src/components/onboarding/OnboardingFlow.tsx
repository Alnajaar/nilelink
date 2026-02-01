'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount, useConnect } from 'wagmi';
import { InjectedConnector } from 'wagmi/connectors/injected';
import { CoinbaseWalletConnector } from 'wagmi/connectors/coinbaseWallet';
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect';
import { PrimaryButton, SecondaryButton } from '@/components/ui/buttons';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ProgressBar } from '@/components/ui/progress';
import { BusinessTypeSelector } from './BusinessTypeSelector';
import { LocationSetup } from './LocationSetup';
import { SubscriptionPlan } from './SubscriptionPlan';
import { WalletConnection } from './WalletConnection';
import { SuccessScreen } from './SuccessScreen';

interface OnboardingData {
  businessType: 'coffee' | 'restaurant' | 'supermarket' | '';
  businessName: string;
  location: {
    address: string;
    coordinates?: { lat: number; lng: number };
  };
  subscriptionPlan: 'starter' | 'professional' | 'enterprise' | '';
  walletConnected: boolean;
  termsAccepted: boolean;
}

interface OnboardingFlowProps {
  userType: 'business' | 'customer' | 'driver';
  onComplete: (data: OnboardingData) => void;
}

const STEPS = {
  business: [
    { id: 'welcome', title: 'Welcome to NileLink' },
    { id: 'business-type', title: 'Business Type' },
    { id: 'business-details', title: 'Business Details' },
    { id: 'location', title: 'Location Setup' },
    { id: 'subscription', title: 'Choose Plan' },
    { id: 'wallet', title: 'Connect Wallet' },
    { id: 'complete', title: 'All Set!' }
  ],
  customer: [
    { id: 'welcome', title: 'Welcome to NileLink' },
    { id: 'location', title: 'Set Your Location' },
    { id: 'preferences', title: 'Food Preferences' },
    { id: 'wallet', title: 'Connect Wallet' },
    { id: 'complete', title: 'Ready to Order!' }
  ],
  driver: [
    { id: 'welcome', title: 'Join NileLink Drivers' },
    { id: 'vehicle', title: 'Vehicle Information' },
    { id: 'documents', title: 'Required Documents' },
    { id: 'wallet', title: 'Connect Wallet' },
    { id: 'complete', title: 'Start Delivering!' }
  ]
};

export function OnboardingFlow({ userType, onComplete }: OnboardingFlowProps) {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();

  const [currentStep, setCurrentStep] = useState(0);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    businessType: '',
    businessName: '',
    location: { address: '' },
    subscriptionPlan: '',
    walletConnected: false,
    termsAccepted: false
  });

  const steps = STEPS[userType];
  const progress = ((currentStep + 1) / steps.length) * 100;

  // Auto-advance when wallet connects
  useEffect(() => {
    if (isConnected && address && !onboardingData.walletConnected) {
      setOnboardingData(prev => ({ ...prev, walletConnected: true }));
      if (currentStep === steps.findIndex(s => s.id === 'wallet')) {
        handleNext();
      }
    }
  }, [isConnected, address, currentStep, onboardingData.walletConnected]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete(onboardingData);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updateData = (updates: Partial<OnboardingData>) => {
    setOnboardingData(prev => ({ ...prev, ...updates }));
  };

  const renderStepContent = () => {
    const step = steps[currentStep];

    switch (step.id) {
      case 'welcome':
        return (
          <div className="text-center space-y-6">
            <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto">
              <span className="text-4xl">🏪</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-text-primary mb-4">
                Welcome to NileLink
              </h1>
              <p className="text-lg text-text-secondary mb-6">
                {userType === 'business'
                  ? 'Transform your business with blockchain-powered operations'
                  : userType === 'customer'
                  ? 'Discover amazing local food and experiences'
                  : 'Start your delivery journey with NileLink'
                }
              </p>
            </div>
            <div className="bg-accent-50 p-6 rounded-xl">
              <h3 className="font-semibold text-text-primary mb-3">What you'll get:</h3>
              <ul className="text-left space-y-2 text-text-secondary">
                {userType === 'business' ? (
                  <>
                    <li>✅ Decentralized POS system</li>
                    <li>✅ Real-time inventory management</li>
                    <li>✅ AI-powered business insights</li>
                    <li>✅ Secure blockchain payments</li>
                  </>
                ) : userType === 'customer' ? (
                  <>
                    <li>✅ Free ordering platform</li>
                    <li>✅ Location-based discovery</li>
                    <li>✅ Loyalty rewards</li>
                    <li>✅ Secure crypto payments</li>
                  </>
                ) : (
                  <>
                    <li>✅ Flexible delivery schedule</li>
                    <li>✅ Real-time order tracking</li>
                    <li>✅ Competitive earnings</li>
                    <li>✅ Secure blockchain payouts</li>
                  </>
                )}
              </ul>
            </div>
          </div>
        );

      case 'business-type':
        return (
          <BusinessTypeSelector
            selectedType={onboardingData.businessType}
            onSelect={(type) => updateData({ businessType: type })}
          />
        );

      case 'business-details':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Business Name
              </label>
              <Input
                type="text"
                placeholder="Enter your business name"
                value={onboardingData.businessName}
                onChange={(e) => updateData({ businessName: e.target.value })}
                className="w-full"
              />
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Business Type: {onboardingData.businessType}</h4>
              <p className="text-blue-700 text-sm">
                {onboardingData.businessType === 'coffee'
                  ? 'Perfect for cafes, coffee shops, and quick-service breakfast spots'
                  : onboardingData.businessType === 'restaurant'
                  ? 'Ideal for full-service restaurants, food trucks, and eateries'
                  : 'Great for supermarkets, grocery stores, and retail outlets'
                }
              </p>
            </div>
          </div>
        );

      case 'location':
        return (
          <LocationSetup
            location={onboardingData.location}
            onLocationChange={(location) => updateData({ location })}
            userType={userType}
          />
        );

      case 'subscription':
        return (
          <SubscriptionPlan
            selectedPlan={onboardingData.subscriptionPlan}
            businessType={onboardingData.businessType}
            onSelect={(plan) => updateData({ subscriptionPlan: plan })}
          />
        );

      case 'wallet':
        return (
          <WalletConnection
            isConnected={onboardingData.walletConnected}
            address={address}
            onConnect={() => {
              // Wallet connection is handled by useEffect
            }}
          />
        );

      case 'complete':
        return (
          <SuccessScreen
            userType={userType}
            data={onboardingData}
          />
        );

      default:
        return <div>Step content not implemented</div>;
    }
  };

  const canProceed = () => {
    switch (steps[currentStep].id) {
      case 'business-type':
        return onboardingData.businessType !== '';
      case 'business-details':
        return onboardingData.businessName.trim() !== '';
      case 'location':
        return onboardingData.location.address.trim() !== '';
      case 'subscription':
        return onboardingData.subscriptionPlan !== '';
      case 'wallet':
        return onboardingData.walletConnected;
      default:
        return true;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl p-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-medium text-text-secondary">
              Step {currentStep + 1} of {steps.length}
            </span>
            <span className="text-sm font-medium text-text-primary">
              {steps[currentStep].title}
            </span>
          </div>
          <ProgressBar progress={progress} />
        </div>

        {/* Step Content */}
        <div className="mb-8">
          {renderStepContent()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <SecondaryButton
            onClick={handleBack}
            disabled={currentStep === 0}
            variant="outline"
          >
            Back
          </SecondaryButton>

          <PrimaryButton
            onClick={handleNext}
            disabled={!canProceed()}
          >
            {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
          </PrimaryButton>
        </div>
      </Card>
    </div>
  );
}
