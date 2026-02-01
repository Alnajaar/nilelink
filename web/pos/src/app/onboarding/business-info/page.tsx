// web/pos/src/app/onboarding/business-info/page.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Building2, 
  MapPin, 
  Tags, 
  Phone, 
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react'
import { Button } from '@shared/components/Button'
import { Card } from '@shared/components/Card'
import { Input } from '@shared/components/Input'
import { Select } from '@shared/components/Select'
import { useAuth } from '@shared/providers/AuthProvider'
import { prisma } from '@shared/lib/prisma'
import { toast } from 'react-hot-toast'

interface BusinessInfoForm {
  businessName: string
  businessCategory: string
  country: string
  city: string
  zone: string
  phoneNumber: string
  exactLocation: string // This would be coordinates from map selection
}

export default function BusinessInfoOnboarding() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [formData, setFormData] = useState<BusinessInfoForm>({
    businessName: '',
    businessCategory: '',
    country: '',
    city: '',
    zone: '',
    phoneNumber: '',
    exactLocation: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isUserValidated, setIsUserValidated] = useState(false)

  // Check authentication on mount
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        // Not authenticated - redirect to login
        router.push('/login')
        return
      }
      
      // Check if onboarding already completed
      if (user.onboardingStatus === 'completed') {
        router.push('/dashboard')
        return
      }
      
      setIsUserValidated(true)
    }
  }, [user, authLoading, router])

  const categories = [
    { value: 'restaurant', label: 'Restaurant' },
    { value: 'supermarket', label: 'Supermarket' },
    { value: 'cafe', label: 'Coffee Shop' },
    { value: 'food-truck', label: 'Food Truck' },
    { value: 'catering', label: 'Catering Service' },
    { value: 'bakery', label: 'Bakery' }
  ]

  const countries = [
    { value: 'lebanon', label: 'Lebanon' },
    { value: 'uae', label: 'United Arab Emirates' },
    { value: 'ksa', label: 'Saudi Arabia' },
    { value: 'jordan', label: 'Jordan' },
    { value: 'egypt', label: 'Egypt' }
  ]

  const validateForm = (): boolean => {
    const errors = []
    
    if (!formData.businessName.trim()) {
      errors.push('Business name is required')
    }
    
    if (!formData.businessCategory) {
      errors.push('Business category is required')
    }
    
    if (!formData.country) {
      errors.push('Country is required')
    }
    
    if (!formData.city.trim()) {
      errors.push('City is required')
    }
    
    if (!formData.phoneNumber.trim()) {
      errors.push('Phone number is required')
    }
    
    if (!formData.exactLocation) {
      errors.push('Exact business location is required')
    }
    
    if (errors.length > 0) {
      setError(errors.join(', '))
      return false
    }
    
    setError(null)
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setLoading(true)
    setError(null)
    
    try {
      // Update user's onboarding status and business information
      const response = await fetch('/api/onboarding/business-info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id,
          businessInfo: formData
        })
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to save business information')
      }
      
      toast.success('Business information saved successfully!')
      
      // Redirect to plan selection
      router.push('/onboarding/plan-selection')
      
    } catch (err: any) {
      console.error('Business info submission error:', err)
      setError(err.message)
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof BusinessInfoForm, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Clear error when user starts typing
    if (error) {
      setError(null)
    }
  }

  if (authLoading || !isUserValidated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-300">Loading onboarding...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Business Information
          </h1>
          <p className="text-xl text-gray-300">
            Step 1 of 3: Tell us about your business
          </p>
        </div>

        <Card className="bg-gray-800/50 backdrop-blur-lg border border-gray-700">
          <div className="p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center">
                <AlertCircle className="w-5 h-5 text-red-400 mr-3 flex-shrink-0" />
                <span className="text-red-300">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Business Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Business Name *
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type="text"
                    value={formData.businessName}
                    onChange={(e) => handleInputChange('businessName', e.target.value)}
                    placeholder="Enter your business name"
                    className="pl-10 bg-gray-700/50 border-gray-600 text-white placeholder-gray-400"
                    required
                  />
                </div>
              </div>

              {/* Business Category */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Business Category *
                </label>
                <div className="relative">
                  <Tags className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Select
                    value={formData.businessCategory}
                    onValueChange={(value) => handleInputChange('businessCategory', value)}
                    className="pl-10 bg-gray-700/50 border-gray-600 text-white"
                  >
                    <option value="">Select category</option>
                    {categories.map(category => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>

              {/* Location Fields */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Country *
                  </label>
                  <Select
                    value={formData.country}
                    onValueChange={(value) => handleInputChange('country', value)}
                    className="bg-gray-700/50 border-gray-600 text-white"
                  >
                    <option value="">Select country</option>
                    {countries.map(country => (
                      <option key={country.value} value={country.value}>
                        {country.label}
                      </option>
                    ))}
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    City *
                  </label>
                  <Input
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    placeholder="City"
                    className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Zone/Area
                  </label>
                  <Input
                    type="text"
                    value={formData.zone}
                    onChange={(e) => handleInputChange('zone', e.target.value)}
                    placeholder="Zone/Area"
                    className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400"
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Business Phone Number *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                    placeholder="+961 1 234 5678"
                    className="pl-10 bg-gray-700/50 border-gray-600 text-white placeholder-gray-400"
                    required
                  />
                </div>
              </div>

              {/* Location Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Exact Business Location *
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-4 text-gray-400 w-5 h-5" />
                  <div className="pl-10 bg-gray-700/50 border border-gray-600 rounded-lg p-4 min-h-[120px] flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-gray-400 mb-2">Map integration would go here</p>
                      <Button 
                        type="button"
                        variant="outline"
                        size="sm"
                        className="border-gray-600 text-gray-300 hover:bg-gray-600"
                        onClick={() => {
                          // In real implementation, this would open a map selector
                          handleInputChange('exactLocation', '33.8938,35.5018') // Beirut coordinates
                          toast.success('Location selected')
                        }}
                      >
                        <MapPin className="w-4 h-4 mr-2" />
                        Select on Map
                      </Button>
                    </div>
                  </div>
                </div>
                {formData.exactLocation && (
                  <p className="text-sm text-green-400 mt-2 flex items-center">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Location selected: {formData.exactLocation}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-6">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-semibold"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Saving Business Information...
                    </>
                  ) : (
                    'Continue to Plan Selection'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </Card>

        <div className="mt-8 text-center text-gray-400 text-sm">
          <p>All fields marked with * are required</p>
          <p className="mt-2">Step 1 of 3 • Business Information → Plan Selection → Deploy POS</p>
        </div>
      </div>
    </div>
  )
}