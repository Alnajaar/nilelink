import React from 'react';
import { Card } from '@/components/ui/card';

interface BusinessTypeSelectorProps {
  selectedType: 'coffee' | 'restaurant' | 'supermarket' | '';
  onSelect: (type: 'coffee' | 'restaurant' | 'supermarket') => void;
}

const businessTypes = [
  {
    id: 'coffee' as const,
    name: 'Coffee Shop',
    description: 'Cafes, coffee shops, and quick-service breakfast spots',
    icon: '☕',
    features: ['Table management', 'Quick orders', 'Beverage focus', 'Bakery items']
  },
  {
    id: 'restaurant' as const,
    name: 'Restaurant',
    description: 'Full-service restaurants, food trucks, and eateries',
    icon: '🍽️',
    features: ['Table reservations', 'Kitchen management', 'Full menu', 'Delivery integration']
  },
  {
    id: 'supermarket' as const,
    name: 'Supermarket',
    description: 'Grocery stores, supermarkets, and retail outlets',
    icon: '🏪',
    features: ['Barcode scanning', 'Inventory tracking', 'Multiple registers', 'Bulk ordering']
  }
];

export function BusinessTypeSelector({ selectedType, onSelect }: BusinessTypeSelectorProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-text-primary mb-2">
          What type of business do you run?
        </h2>
        <p className="text-text-secondary">
          This helps us customize your experience and features
        </p>
      </div>

      <div className="grid gap-4">
        {businessTypes.map((type) => (
          <Card
            key={type.id}
            className={`p-6 cursor-pointer transition-all duration-200 hover:shadow-md ${
              selectedType === type.id
                ? 'ring-2 ring-primary border-primary'
                : 'hover:border-gray-300'
            }`}
            onClick={() => onSelect(type.id)}
          >
            <div className="flex items-start space-x-4">
              <div className="text-3xl">{type.icon}</div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-text-primary mb-1">
                  {type.name}
                </h3>
                <p className="text-text-secondary mb-3">{type.description}</p>
                <div className="flex flex-wrap gap-2">
                  {type.features.map((feature, index) => (
                    <span
                      key={index}
                      className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                selectedType === type.id
                  ? 'border-primary bg-primary'
                  : 'border-gray-300'
              }`}>
                {selectedType === type.id && (
                  <div className="w-3 h-3 bg-white rounded-full" />
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
