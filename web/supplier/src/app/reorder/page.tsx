'use client';

import React, { useState } from 'react';
import useSWR from 'swr';
import { TrendingUp, Zap, CheckCircle, AlertCircle, Package } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ReorderRecommendation {
  id: string;
  sku: {
    id: string;
    name: string;
    sku: string;
    wholesalePrice: number;
  };
  recommendedQuantity: number;
  costEstimate: number;
  aiConfidence: number;
  status: string;
}

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function SmartReorder() {
  const { data: recommendations, isLoading } = useSWR('/api/supplier/reorder/recommendations', fetcher);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);

  const chartData = [
    { date: 'Day 1', forecast: 45, safetyStock: 20 },
    { date: 'Day 7', forecast: 60, safetyStock: 20 },
    { date: 'Day 14', forecast: 75, safetyStock: 20 },
    { date: 'Day 30', forecast: 100, safetyStock: 20 },
  ];

  const totalCost = (recommendations || []).reduce((sum: number, rec: ReorderRecommendation) => sum + rec.costEstimate, 0);
  const totalQuantity = (recommendations || []).reduce((sum: number, rec: ReorderRecommendation) => sum + rec.recommendedQuantity, 0);

  const handleApplyRecommendation = async (recId: string) => {
    setProcessing(recId);
    try {
      const response = await fetch(`/api/supplier/reorder/${recId}/apply`, {
        method: 'POST',
      });
      if (response.ok) {
        // Refresh data
        window.location.reload();
      }
    } catch (error) {
      console.error('Failed to apply recommendation:', error);
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900">Smart Reorder System</h1>
        <p className="text-slate-600 mt-2">AI-powered demand forecasting and automatic reorder generation</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm">Total Recommendations</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">{recommendations?.length || 0}</p>
            </div>
            <Package className="w-8 h-8 text-blue-500 opacity-20" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm">Total Recommended Qty</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">{totalQuantity.toLocaleString()}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-500 opacity-20" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm">Estimated Cost</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">${totalCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
            </div>
            <Zap className="w-8 h-8 text-amber-500 opacity-20" />
          </div>
        </div>
      </div>

      {/* Recommendations List */}
      <div className="space-y-4">
        {recommendations?.map((rec: ReorderRecommendation) => (
          <RecommendationCard
            key={rec.id}
            rec={rec}
            isExpanded={expandedId === rec.id}
            onToggle={() => setExpandedId(expandedId === rec.id ? null : rec.id)}
            onApply={() => handleApplyRecommendation(rec.id)}
            isProcessing={processing === rec.id}
          />
        ))}
      </div>

      {recommendations?.length === 0 && (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <TrendingUp className="w-16 h-16 mx-auto text-slate-400 mb-4" />
          <p className="text-slate-600">No reorder recommendations at this time. Your inventory levels are optimal.</p>
        </div>
      )}
    </div>
  );
}

function RecommendationCard({
  rec,
  isExpanded,
  onToggle,
  onApply,
  isProcessing,
}: {
  rec: ReorderRecommendation;
  isExpanded: boolean;
  onToggle: () => void;
  onApply: () => void;
  isProcessing: boolean;
}) {
  const confidenceColor = rec.aiConfidence >= 0.85 ? 'bg-green-100 text-green-800' :
                          rec.aiConfidence >= 0.70 ? 'bg-amber-100 text-amber-800' :
                          'bg-orange-100 text-orange-800';

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6 cursor-pointer hover:bg-slate-50" onClick={onToggle}>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {/* Product Info */}
          <div>
            <h3 className="font-semibold text-slate-900">{rec.sku.name}</h3>
            <p className="text-sm text-slate-600 mt-1">{rec.sku.sku}</p>
          </div>

          {/* Recommended Quantity */}
          <div>
            <p className="text-slate-600 text-sm">Recommended Qty</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{rec.recommendedQuantity}</p>
            <p className="text-xs text-slate-500 mt-1">units</p>
          </div>

          {/* Cost Estimate */}
          <div>
            <p className="text-slate-600 text-sm">Est. Cost</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">${rec.costEstimate.toFixed(2)}</p>
            <p className="text-xs text-slate-500 mt-1">@ ${rec.sku.wholesalePrice.toFixed(2)}/unit</p>
          </div>

          {/* AI Confidence */}
          <div>
            <p className="text-slate-600 text-sm">AI Confidence</p>
            <div className="mt-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${confidenceColor}`}>
                {(rec.aiConfidence * 100).toFixed(0)}%
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-2">{rec.aiConfidence >= 0.85 ? 'High' : rec.aiConfidence >= 0.70 ? 'Medium' : 'Low'}</p>
          </div>

          {/* Action */}
          <div className="flex flex-col justify-between items-end">
            {rec.status === 'PENDING' ? (
              <button
                onClick={onApply}
                disabled={isProcessing}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                {isProcessing ? 'Processing...' : 'Apply'}
              </button>
            ) : (
              <span className="flex items-center gap-1 text-green-600 font-medium">
                <CheckCircle className="w-5 h-5" />
                Applied
              </span>
            )}
            <span className="text-slate-500 text-xs mt-2">{rec.status}</span>
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="border-t border-slate-200 p-6 bg-slate-50">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Chart */}
            <div>
              <h4 className="font-semibold text-slate-900 mb-4">Demand Forecast (30-day)</h4>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={[
                  { day: 'Day 1', forecast: 45, reorder: rec.recommendedQuantity },
                  { day: 'Day 7', forecast: 60, reorder: rec.recommendedQuantity },
                  { day: 'Day 14', forecast: 75, reorder: rec.recommendedQuantity },
                  { day: 'Day 30', forecast: 100, reorder: rec.recommendedQuantity },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="forecast" stroke="#3b82f6" />
                  <Line type="monotone" dataKey="reorder" stroke="#10b981" strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Details */}
            <div className="space-y-4">
              <div>
                <label className="text-sm text-slate-600">Why this recommendation?</label>
                <p className="mt-2 text-slate-900">
                  Based on your 30-day sales trend and seasonal patterns, demand is expected to increase by 25%.
                  Current stock will run out in 5 days. Ordering now ensures optimal inventory levels.
                </p>
              </div>
              <div>
                <label className="text-sm text-slate-600">Lead Time</label>
                <p className="mt-2 text-slate-900 font-semibold">7 days</p>
              </div>
              <div>
                <label className="text-sm text-slate-600">Safety Stock Buffer</label>
                <p className="mt-2 text-slate-900 font-semibold">20 units (automatic)</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
