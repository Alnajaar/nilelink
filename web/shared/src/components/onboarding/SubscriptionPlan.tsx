import React from 'react';
import { Check, Star } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface SubscriptionPlanProps {
  selectedPlan: 'starter' | 'professional' | 'enterprise' | '';
  businessType: 'coffee' | 'restaurant' | 'supermarket' | '';
  onSelect: (plan: 'starter' | 'professional' | 'enterprise') => void;
}

const plans = [
  {
    id: 'starter' as const,
    name: 'Starter',
    price: '$29',
    period: 'month',
    description: 'Perfect for small businesses getting started',
    features: [
      'Up to 3 branches',
      'Basic POS features',
      'Customer ordering',
      'Basic analytics',
      'Email support',
      'Mobile app access'
    ],
    limitations: [
      'Limited to 50 products',
      'Basic reporting only',
      'No advanced AI features'
    ],
    recommended: false
  },
  {
    id: 'professional' as const,
    name: 'Professional',
    price: '$79',
    period: 'month',
    description: 'For growing businesses with advanced needs',
    features: [
      'Up to 10 branches',
      'Advanced POS features',
      'Full customer app integration',
      'Advanced analytics & AI',
      'Priority support',
      'API access',
      'Custom integrations'
    ],
    limitations: [
      'Up to 500 products',
      'Advanced reporting'
    ],
    recommended: true
  },
  {
    id: 'enterprise' as const,
    name: 'Enterprise',
    price: '$199',
    period: 'month',
    description: 'For large operations with custom requirements',
    features: [
      'Unlimited branches',
      'All POS features',
      'Full ecosystem integration',
      'Advanced AI & automation',
      'Dedicated support',
      'White-label options',
      'Custom development',
      'SLA guarantees'
    ],
    limitations: [],
    recommended: false
  }
];

export function SubscriptionPlan({ selectedPlan, businessType, onSelect }: SubscriptionPlanProps) {
  const getBusinessSpecificFeatures = (planId: string, businessType: string) => {
    const businessFeatures: Record<string, Record<string, string[]>> = {
      coffee: {
        starter: ['Table management', 'Beverage recipes', 'Quick order mode'],
        professional: ['Menu optimization AI', 'Inventory forecasting', 'Customer loyalty analytics'],
        enterprise: ['Multi-location sync', 'Advanced menu engineering', 'Supply chain integration']
      },
      restaurant: {
        starter: ['Table reservations', 'Kitchen display', 'Menu management'],
        professional: ['Recipe costing', 'Staff scheduling', 'Customer feedback AI'],
        enterprise: ['Multi-concept management', 'Advanced kitchen analytics', 'Franchise management']
      },
      supermarket: {
        starter: ['Barcode scanning', 'Basic inventory', 'Cashier management'],
        professional: ['Automated reordering', 'Shelf management', 'Loss prevention AI'],
        enterprise: ['Supply chain optimization', 'Advanced pricing AI', 'Multi-store analytics']
      }
    };

    return businessFeatures[businessType]?.[planId] || [];
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-text-primary mb-2">
          Choose Your Plan
        </h2>
        <p className="text-text-secondary">
          Select the plan that best fits your business needs. You can change it anytime.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan) => {
          const businessFeatures = getBusinessSpecificFeatures(plan.id, businessType);
          const isSelected = selectedPlan === plan.id;

          return (
            <Card
              key={plan.id}
              className={`relative p-6 cursor-pointer transition-all duration-200 hover:shadow-lg ${
                isSelected
                  ? 'ring-2 ring-primary border-primary'
                  : 'hover:border-gray-300'
              } ${plan.recommended ? 'border-2 border-primary/50' : ''}`}
              onClick={() => onSelect(plan.id)}
            >
              {plan.recommended && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <div className="bg-primary text-white px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
                    <Star className="w-3 h-3" />
                    <span>Most Popular</span>
                  </div>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-text-primary mb-2">{plan.name}</h3>
                <div className="mb-2">
                  <span className="text-3xl font-bold text-primary">{plan.price}</span>
                  <span className="text-text-secondary">/{plan.period}</span>
                </div>
                <p className="text-sm text-text-secondary">{plan.description}</p>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-text-primary mb-2">Features:</h4>
                  <ul className="space-y-1">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center space-x-2 text-sm">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                    {businessFeatures.map((feature, index) => (
                      <li key={`business-${index}`} className="flex items-center space-x-2 text-sm">
                        <Check className="w-4 h-4 text-blue-500 flex-shrink-0" />
                        <span className="text-blue-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {plan.limitations.length > 0 && (
                  <div>
                    <h4 className="font-medium text-text-primary mb-2">Limitations:</h4>
                    <ul className="space-y-1">
                      {plan.limitations.map((limitation, index) => (
                        <li key={index} className="flex items-center space-x-2 text-sm text-orange-600">
                          <span>•</span>
                          <span>{limitation}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t">
                <div className={`w-full py-2 px-4 rounded-lg text-center font-medium ${
                  isSelected
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-text-primary hover:bg-gray-200'
                }`}>
                  {isSelected ? 'Selected' : 'Select Plan'}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="bg-gray-50 rounded-lg p-4 text-center">
        <p className="text-sm text-text-secondary">
          All plans include a 14-day free trial. No credit card required to start.
        </p>
        <p className="text-xs text-text-tertiary mt-1">
          Cancel anytime. Upgrade or downgrade at any time.
        </p>
      </div>
    </div>
  );
}
