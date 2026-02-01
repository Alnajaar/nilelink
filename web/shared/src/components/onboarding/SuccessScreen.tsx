import React from 'react';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { PrimaryButton } from '@/components/ui/buttons';

interface SuccessScreenProps {
  userType: 'business' | 'customer' | 'driver';
  data: any;
}

export function SuccessScreen({ userType, data }: SuccessScreenProps) {
  const getSuccessContent = () => {
    switch (userType) {
      case 'business':
        return {
          title: 'Your Business is Ready!',
          subtitle: 'Welcome to the NileLink ecosystem',
          description: `Your ${data.businessType} business "${data.businessName}" is now set up and ready to operate.`,
          nextSteps: [
            'Complete your menu setup',
            'Configure your POS stations',
            'Invite your staff members',
            'Start accepting orders'
          ],
          dashboardUrl: '/pos/dashboard'
        };
      case 'customer':
        return {
          title: 'Ready to Order!',
          subtitle: 'Discover amazing food near you',
          description: 'Your account is set up and you can start exploring restaurants in your area.',
          nextSteps: [
            'Browse nearby restaurants',
            'Place your first order',
            'Earn loyalty points',
            'Track your deliveries'
          ],
          dashboardUrl: '/restaurants'
        };
      case 'driver':
        return {
          title: 'Ready to Deliver!',
          subtitle: 'Start earning with NileLink',
          description: 'Your driver profile is complete and you can begin accepting delivery orders.',
          nextSteps: [
            'Go online to receive orders',
            'Complete your first delivery',
            'Build your reputation',
            'Increase your earnings'
          ],
          dashboardUrl: '/driver/dashboard'
        };
      default:
        return {
          title: 'Setup Complete!',
          subtitle: 'Welcome to NileLink',
          description: 'Your account has been successfully configured.',
          nextSteps: [],
          dashboardUrl: '/'
        };
    }
  };

  const content = getSuccessContent();

  return (
    <div className="text-center space-y-8">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle className="w-12 h-12 text-green-600" />
      </div>

      <div>
        <h1 className="text-3xl font-bold text-text-primary mb-2">
          {content.title}
        </h1>
        <h2 className="text-xl text-text-secondary mb-4">
          {content.subtitle}
        </h2>
        <p className="text-lg text-text-secondary">
          {content.description}
        </p>
      </div>

      <div className="bg-gradient-to-r from-primary-50 to-accent-50 rounded-xl p-6">
        <h3 className="font-semibold text-text-primary mb-4">What's Next?</h3>
        <div className="grid gap-3 text-left">
          {content.nextSteps.map((step, index) => (
            <div key={index} className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-bold">{index + 1}</span>
              </div>
              <span className="text-text-primary">{step}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <PrimaryButton size="lg" className="w-full">
          Get Started
          <ArrowRight className="w-4 h-4 ml-2" />
        </PrimaryButton>

        <p className="text-sm text-text-tertiary">
          Need help? Check out our{' '}
          <a href="/help" className="text-primary hover:underline">
            help center
          </a>{' '}
          or contact{' '}
          <a href="/support" className="text-primary hover:underline">
            support
          </a>
        </p>
      </div>

      <div className="border-t pt-6">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-medium text-text-primary">Account Type</p>
            <p className="text-text-secondary capitalize">{userType}</p>
          </div>
          <div>
            <p className="font-medium text-text-primary">Status</p>
            <p className="text-green-600">Active</p>
          </div>
        </div>
      </div>
    </div>
  );
}
