import React from 'react';
import { ArrowLeft, Shield, Activity } from 'lucide-react';
import { Badge } from '@shared/components/Badge';

type StationType = 'grill' | 'prep' | 'dessert' | 'drinks' | 'plating';

const stationConfig: Record<StationType, { label: string; icon: string; bg: string; color: string; glow: string }> = {
  grill: { label: 'Grill Station', icon: '🔥', bg: 'bg-rose-500/10', color: 'text-rose-500', glow: 'shadow-glow-error' },
  prep: { label: 'Prep Station', icon: '🔪', bg: 'bg-blue-500/10', color: 'text-blue-500', glow: 'shadow-glow-primary' },
  dessert: { label: 'Dessert Station', icon: '🍰', bg: 'bg-fuchsia-500/10', color: 'text-fuchsia-500', glow: 'shadow-glow-accent' },
  drinks: { label: 'Drinks Station', icon: '🥤', bg: 'bg-cyan-500/10', color: 'text-cyan-500', glow: 'shadow-glow-info' },
  plating: { label: 'Plating Station', icon: '🍽️', bg: 'bg-emerald-500/10', color: 'text-emerald-500', glow: 'shadow-glow-success' },
};

// For static export, generate all possible station types
export const dynamicParams = false;

export function generateStaticParams() {
  const stationTypes: StationType[] = ['grill', 'prep', 'dessert', 'drinks', 'plating'];
  return stationTypes.map(type => ({
    type
  }));
}

interface StationPageProps {
  params: { type: string };
}

export default function StationView({ params }: StationPageProps) {
  const stationType = params.type as StationType;
  const config = stationConfig[stationType] || stationConfig.prep;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
      <div className="max-w-md w-full text-center">
        <div className={`w-20 h-20 ${config.bg} border-2 rounded-2xl flex items-center justify-center mx-auto mb-6 text-4xl`}>
          {config.icon}
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{config.label}</h1>
        <Badge variant="secondary" className="bg-green-500/10 border-green-500/20 text-green-700 px-4 py-2">
          Station: {stationType.toUpperCase()}
        </Badge>
        <p className="text-gray-600 mt-4">This station is ready for production use.</p>
      </div>
    </div>
  );
}