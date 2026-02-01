// web/pos/src/app/onboarding/plan-selection/page.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  CreditCard, 
  Calendar, 
  CheckCircle,
  AlertCircle,
  Loader2,
  Star,
  Zap
} from 'lucide-react'
import { Button } from '@shared/components/Button'
import { Card } from '@shared/components/Card'
import { useAuth } from '@shared/providers/AuthProvider'
import { toast } from 'react-hot-toast'

interface Plan {
  id: string
  name: string
  price: number
  period: 'monthly' | 'yearly'
  features: string[]
  popular?: boolean
  savings?: string
}

export default function PlanSelectionOnboarding() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isUserValidated, setIsUserValidated] = useState(false)

  // Check authentication and onboarding status
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login')
        return
      }
      
      // Check if onboarding already completed
      if (user.onboardingStatus === 'completed') {
        router.push('/dashboard')
        return
      }
      
      // Check if business info is completed (this would be checked via API in real implementation)
      setIsUserValidated(true)
    }
  }, [user, authLoading, router])

  const plans: Plan[] = [
    {
      id: 'starter',
      name: 'Starter',
      price: billingCycle === 'yearly' ? 19 : 24,
      period: billingCycle,
      features: [
        'Up to 100 orders/month',
        'Basic inventory management',
        'Standard reporting',
        'Email support',
        '1 user account'
      ]
    },
    {
      id: 'business',
      name: 'Business',
      price: billingCycle === 'yearly' ? 49 : 59,
      period: billingCycle,
      popular: true,
      savings: billingCycle === 'yearly' ? 'Save $120/year' : undefined,
      features: [
        'Up to 1,000 orders/month',
        'Advanced inventory management',
        'Detailed analytics & reporting',
        'Priority email support',
        'Up to 5 user accounts',
        'API access',
        'Custom branding'
      ]
    },
    {
      id: 'premium',
      name: 'Premium',
      price: billingCycle === 'yearly' ? 99 : 119,
      period: billingCycle,
      features: [
        'Unlimited orders',
        'Advanced inventory with forecasting',
        'Real-time analytics dashboard',
        '24/7 priority support',
        'Unlimited user accounts',
        'Full API access',
        'White-label solution',
        'Custom integrations',
        'Dedicated account manager'
      ]
    }
  ]

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId)
    setError(null)
  }

  const handleSubmit = async () => {
    if (!selectedPlan) {
      setError('Please select a plan to continue')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Save plan selection
      const response = await fetch('/api/onboarding/plan-selection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id,
          planId: selectedPlan,
          billingCycle
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save plan selection')
      }

      toast.success('Plan selected successfully!')
      
      // Redirect to final deployment step
      router.push('/onboarding/deploy-pos')

    } catch (err: any) {
      console.error('Plan selection error:', err)
      setError(err.message)
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const toggleBillingCycle = () => {
    setBillingCycle(prev => prev === 'monthly' ? 'yearly' : 'monthly')
    // Reset selection when toggling to avoid confusion
    setSelectedPlan(null)
  }

  if (authLoading || !isUserValidated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-300">Loading plan selection...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-300">
            Step 2 of 3: Select the perfect plan for your business
          </p>
          
          {/* Billing Toggle */}
          <div className="mt-8 flex justify-center">
            <div className="bg-gray-800/50 backdrop-blur-lg rounded-full p-1 flex">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                  billingCycle === 'monthly'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all relative ${
                  billingCycle === 'yearly'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                Yearly
                <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                  Save 20%
                </span>
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-8 max-w-2xl mx-auto">
            <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center">
              <AlertCircle className="w-5 h-5 text-red-400 mr-3 flex-shrink-0" />
              <span className="text-red-300">{error}</span>
            </div>
          </div>
        )}

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`bg-gray-800/50 backdrop-blur-lg border-2 transition-all cursor-pointer ${
                selectedPlan === plan.id
                  ? 'border-blue-500 shadow-xl shadow-blue-500/20 scale-105'
                  : 'border-gray-700 hover:border-gray-600 hover:shadow-lg'
              }`}
              onClick={() => handlePlanSelect(plan.id)}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black text-xs font-bold px-4 py-1 rounded-full flex items-center">
                    <Star className="w-3 h-3 mr-1" />
                    MOST POPULAR
                  </div>
                </div>
              )}

              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
                  {plan.popular && <Zap className="w-6 h-6 text-yellow-400" />}
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline">
                    <span className="text-4xl font-bold text-white">${plan.price}</span>
                    <span className="text-gray-400 ml-2">
                      /{plan.period === 'yearly' ? 'year' : 'month'}
                    </span>
                  </div>
                  {plan.savings && (
                    <p className="text-green-400 text-sm font-medium mt-1">{plan.savings}</p>
                  )}
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  variant={selectedPlan === plan.id ? 'default' : 'outline'}
                  className={`w-full ${
                    selectedPlan === plan.id
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'border-gray-600 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {selectedPlan === plan.id ? (
                    <>
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Selected
                    </>
                  ) : (
                    'Select Plan'
                  )}
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Continue Button */}
        <div className="text-center">
          <Button
            onClick={handleSubmit}
            disabled={loading || !selectedPlan}
            className="bg-blue-600 hover:bg-blue-700 text-white py-4 px-12 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Processing Selection...
              </>
            ) : (
              'Continue to POS Deployment'
            )}
          </Button>
          
          <p className="text-gray-400 mt-4 text-sm">
            Step 2 of 3 • Business Info → Plan Selection → Deploy POS
          </p>
        </div>

        {/* Payment Security Note */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center bg-gray-800/30 backdrop-blur-sm rounded-full px-6 py-3 border border-gray-700">
            <CreditCard className="w-5 h-5 text-green-400 mr-3" />
            <span className="text-gray-300 text-sm">
              Secure payment processing • Cancel anytime • 30-day money-back guarantee
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}