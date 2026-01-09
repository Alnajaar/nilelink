'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
    CreditCard,
    ArrowLeft,
    Plus,
    Edit,
    Trash2,
    Check,
    DollarSign,
    Users,
    Zap,
    Crown
} from 'lucide-react'

interface SubscriptionPlan {
    id: string
    name: string
    price: number
    currency: string
    interval: 'monthly' | 'yearly'
    features: string[]
    maxUsers: number
    maxLocations: number
    isPopular: boolean
    isActive: boolean
}

export default function SubscriptionsPage() {
    const router = useRouter()
    const [plans, setPlans] = useState<SubscriptionPlan[]>([])
    const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null)
    const [showEditModal, setShowEditModal] = useState(false)
    const [editForm, setEditForm] = useState<Partial<SubscriptionPlan>>({})

    useEffect(() => {
        // Check admin authentication
        const adminSession = localStorage.getItem('admin_session')
        if (!adminSession) {
            router.push('/login')
            return
        }

        loadPlans()
    }, [router])

    const loadPlans = () => {
        const storedPlans = localStorage.getItem('subscriptionPlans')
        if (storedPlans) {
            setPlans(JSON.parse(storedPlans))
        } else {
            // Default plans
            const defaultPlans: SubscriptionPlan[] = [
                {
                    id: 'starter',
                    name: 'Starter',
                    price: 29,
                    currency: 'USD',
                    interval: 'monthly',
                    features: [
                        '1 Location',
                        'Up to 5 Users',
                        'Basic POS Features',
                        'Email Support',
                        'Mobile App Access'
                    ],
                    maxUsers: 5,
                    maxLocations: 1,
                    isPopular: false,
                    isActive: true
                },
                {
                    id: 'professional',
                    name: 'Professional',
                    price: 79,
                    currency: 'USD',
                    interval: 'monthly',
                    features: [
                        'Up to 3 Locations',
                        'Up to 15 Users',
                        'Advanced Analytics',
                        'Priority Support',
                        'Custom Branding',
                        'API Access'
                    ],
                    maxUsers: 15,
                    maxLocations: 3,
                    isPopular: true,
                    isActive: true
                },
                {
                    id: 'enterprise',
                    name: 'Enterprise',
                    price: 199,
                    currency: 'USD',
                    interval: 'monthly',
                    features: [
                        'Unlimited Locations',
                        'Unlimited Users',
                        'White-label Solution',
                        '24/7 Dedicated Support',
                        'Custom Integrations',
                        'SLA Guarantee',
                        'Blockchain Features'
                    ],
                    maxUsers: -1,
                    maxLocations: -1,
                    isPopular: false,
                    isActive: true
                }
            ]
            setPlans(defaultPlans)
            localStorage.setItem('subscriptionPlans', JSON.stringify(defaultPlans))
        }
    }

    const handleEditPlan = (plan: SubscriptionPlan) => {
        setSelectedPlan(plan)
        setEditForm(plan)
        setShowEditModal(true)
    }

    const handleSavePlan = () => {
        if (!selectedPlan) return

        const updatedPlans = plans.map(p =>
            p.id === selectedPlan.id ? { ...p, ...editForm } : p
        )
        setPlans(updatedPlans)
        localStorage.setItem('subscriptionPlans', JSON.stringify(updatedPlans))
        setShowEditModal(false)
        setSelectedPlan(null)
        setEditForm({})
    }

    const handleTogglePlanStatus = (planId: string) => {
        const updatedPlans = plans.map(p =>
            p.id === planId ? { ...p, isActive: !p.isActive } : p
        )
        setPlans(updatedPlans)
        localStorage.setItem('subscriptionPlans', JSON.stringify(updatedPlans))
    }

    const handleDeletePlan = (planId: string) => {
        if (confirm('Are you sure you want to delete this plan?')) {
            const updatedPlans = plans.filter(p => p.id !== planId)
            setPlans(updatedPlans)
            localStorage.setItem('subscriptionPlans', JSON.stringify(updatedPlans))
        }
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div className="flex items-center">
                            <button onClick={() => router.push('/dashboard')} className="mr-4">
                                <ArrowLeft className="h-6 w-6 text-gray-600" />
                            </button>
                            <div className="flex items-center">
                                <CreditCard className="h-8 w-8 text-red-600 mr-3" />
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">Subscription Plans</h1>
                                    <p className="text-sm text-gray-500">Manage pricing and features</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-lg p-6 shadow-sm border">
                        <div className="flex items-center">
                            <CreditCard className="h-8 w-8 text-blue-500 mr-3" />
                            <div>
                                <p className="text-sm font-medium text-gray-600">Active Plans</p>
                                <p className="text-2xl font-bold text-blue-600">
                                    {plans.filter(p => p.isActive).length}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg p-6 shadow-sm border">
                        <div className="flex items-center">
                            <DollarSign className="h-8 w-8 text-green-500 mr-3" />
                            <div>
                                <p className="text-sm font-medium text-gray-600">Starting Price</p>
                                <p className="text-2xl font-bold text-green-600">
                                    ${Math.min(...plans.map(p => p.price))}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg p-6 shadow-sm border">
                        <div className="flex items-center">
                            <Crown className="h-8 w-8 text-yellow-500 mr-3" />
                            <div>
                                <p className="text-sm font-medium text-gray-600">Premium Price</p>
                                <p className="text-2xl font-bold text-yellow-600">
                                    ${Math.max(...plans.map(p => p.price))}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Plans Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {plans.map((plan) => (
                        <div
                            key={plan.id}
                            className={`bg-white rounded-2xl shadow-lg border-2 ${plan.isPopular ? 'border-red-500' : 'border-gray-200'
                                } overflow-hidden relative`}
                        >
                            {plan.isPopular && (
                                <div className="absolute top-0 right-0 bg-red-500 text-white px-4 py-1 text-xs font-bold rounded-bl-lg">
                                    POPULAR
                                </div>
                            )}

                            <div className="p-8">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                                    {!plan.isActive && (
                                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                                            Inactive
                                        </span>
                                    )}
                                </div>

                                <div className="mb-6">
                                    <span className="text-4xl font-black text-gray-900">${plan.price}</span>
                                    <span className="text-gray-600 ml-2">/{plan.interval}</span>
                                </div>

                                <div className="space-y-3 mb-8">
                                    {plan.features.map((feature, index) => (
                                        <div key={index} className="flex items-start">
                                            <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                                            <span className="text-sm text-gray-700">{feature}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="space-y-2">
                                    <button
                                        onClick={() => handleEditPlan(plan)}
                                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                                    >
                                        <Edit className="h-4 w-4 mr-2" />
                                        Edit Plan
                                    </button>
                                    <button
                                        onClick={() => handleTogglePlanStatus(plan.id)}
                                        className={`w-full px-4 py-2 rounded-lg transition-colors ${plan.isActive
                                                ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                                            }`}
                                    >
                                        {plan.isActive ? 'Deactivate' : 'Activate'}
                                    </button>
                                    <button
                                        onClick={() => handleDeletePlan(plan.id)}
                                        className="w-full px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors flex items-center justify-center"
                                    >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete Plan
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Edit Modal */}
                {showEditModal && selectedPlan && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold">Edit Plan: {selectedPlan.name}</h2>
                                <button
                                    onClick={() => setShowEditModal(false)}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Plan Name
                                    </label>
                                    <input
                                        type="text"
                                        value={editForm.name || ''}
                                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Price
                                        </label>
                                        <input
                                            type="number"
                                            value={editForm.price || 0}
                                            onChange={(e) => setEditForm({ ...editForm, price: Number(e.target.value) })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Interval
                                        </label>
                                        <select
                                            value={editForm.interval || 'monthly'}
                                            onChange={(e) => setEditForm({ ...editForm, interval: e.target.value as 'monthly' | 'yearly' })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                        >
                                            <option value="monthly">Monthly</option>
                                            <option value="yearly">Yearly</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Max Users
                                        </label>
                                        <input
                                            type="number"
                                            value={editForm.maxUsers || 0}
                                            onChange={(e) => setEditForm({ ...editForm, maxUsers: Number(e.target.value) })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                            placeholder="-1 for unlimited"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Max Locations
                                        </label>
                                        <input
                                            type="number"
                                            value={editForm.maxLocations || 0}
                                            onChange={(e) => setEditForm({ ...editForm, maxLocations: Number(e.target.value) })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                            placeholder="-1 for unlimited"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={editForm.isPopular || false}
                                        onChange={(e) => setEditForm({ ...editForm, isPopular: e.target.checked })}
                                        className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                                    />
                                    <label className="ml-2 block text-sm text-gray-900">
                                        Mark as Popular
                                    </label>
                                </div>
                            </div>

                            <div className="mt-6 flex gap-4">
                                <button
                                    onClick={handleSavePlan}
                                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                                >
                                    Save Changes
                                </button>
                                <button
                                    onClick={() => setShowEditModal(false)}
                                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
