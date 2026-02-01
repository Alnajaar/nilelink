// web/pos/src/app/admin/commissions/page.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { Card } from '@shared/components/Card'
import { Button } from '@shared/components/Button'
import { Input } from '@shared/components/Input'
import { Select } from '@shared/components/Select'
import { 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  AlertTriangle, 
  CheckCircle,
  DollarSign,
  MapPin,
  Store,
  Users
} from 'lucide-react'
import { toast } from 'react-hot-toast'

interface CommissionRule {
  id: string
  businessType: string
  orderCommissionPct: number
  deliveryCommissionPct: number
  isActive: boolean
  country?: string
  city?: string
  zone?: string
  business?: {
    name: string
    businessType: string
  }
}

export default function CommissionsPage() {
  const [activeTab, setActiveTab] = useState('global')
  const [rules, setRules] = useState<CommissionRule[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingRule, setEditingRule] = useState<CommissionRule | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    businessType: 'RESTAURANT',
    orderCommissionPct: 10,
    deliveryCommissionPct: 15,
    country: '',
    city: '',
    zone: '',
    isZeroCommission: false,
    justification: ''
  })

  useEffect(() => {
    fetchRules()
  }, [activeTab])

  const fetchRules = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/commissions?type=${activeTab}`)
      const data = await response.json()
      
      if (response.ok) {
        setRules(data.data)
      } else {
        toast.error(data.error || 'Failed to fetch rules')
      }
    } catch (error) {
      toast.error('Network error')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const method = editingRule ? 'PUT' : 'POST'
      const body = {
        type: activeTab,
        id: editingRule?.id,
        ...formData
      }

      const response = await fetch('/api/admin/commissions', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(editingRule ? 'Rule updated successfully' : 'Rule created successfully')
        setShowModal(false)
        resetForm()
        fetchRules()
      } else {
        toast.error(data.error || 'Failed to save rule')
      }
    } catch (error) {
      toast.error('Network error')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to deactivate this rule?')) return

    try {
      const response = await fetch(`/api/admin/commissions?id=${id}&type=${activeTab}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Rule deactivated successfully')
        fetchRules()
      } else {
        toast.error(data.error || 'Failed to delete rule')
      }
    } catch (error) {
      toast.error('Network error')
    }
  }

  const resetForm = () => {
    setFormData({
      businessType: 'RESTAURANT',
      orderCommissionPct: 10,
      deliveryCommissionPct: 15,
      country: '',
      city: '',
      zone: '',
      isZeroCommission: false,
      justification: ''
    })
    setEditingRule(null)
  }

  const openModal = (rule?: CommissionRule) => {
    if (rule) {
      setEditingRule(rule)
      setFormData({
        businessType: rule.businessType,
        orderCommissionPct: rule.orderCommissionPct,
        deliveryCommissionPct: rule.deliveryCommissionPct,
        country: rule.country || '',
        city: rule.city || '',
        zone: rule.zone || '',
        isZeroCommission: false,
        justification: ''
      })
    } else {
      resetForm()
    }
    setShowModal(true)
  }

  const tabs = [
    { id: 'global', label: 'Global Rules', icon: Settings },
    { id: 'location', label: 'Location Rules', icon: MapPin },
    { id: 'merchant', label: 'Merchant Overrides', icon: Store }
  ]

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Commission Management</h1>
        <p className="text-gray-600">Configure platform revenue rules and commission structures</p>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Header Actions */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            {tabs.find(t => t.id === activeTab)?.label}
          </h2>
          <p className="text-gray-600 mt-1">
            {activeTab === 'global' && 'Default commission rates for all businesses'}
            {activeTab === 'location' && 'Location-specific commission rules'}
            {activeTab === 'merchant' && 'Individual merchant commission overrides'}
          </p>
        </div>
        <Button onClick={() => openModal()} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Rule
        </Button>
      </div>

      {/* Rules List */}
      <Card className="overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading rules...</p>
          </div>
        ) : rules.length === 0 ? (
          <div className="p-8 text-center">
            <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No rules found</h3>
            <p className="text-gray-600 mb-4">Get started by creating your first commission rule</p>
            <Button onClick={() => openModal()}>Create Rule</Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {activeTab === 'global' && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Business Type
                    </th>
                  )}
                  {activeTab === 'location' && (
                    <>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Business Type
                      </th>
                    </>
                  )}
                  {activeTab === 'merchant' && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Merchant
                    </th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order Commission
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Delivery Commission
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {rules.map((rule) => (
                  <tr key={rule.id} className="hover:bg-gray-50">
                    {activeTab === 'global' && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {rule.businessType}
                      </td>
                    )}
                    {activeTab === 'location' && (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {rule.country}
                          {rule.city && `, ${rule.city}`}
                          {rule.zone && `, ${rule.zone}`}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {rule.businessType || 'All Types'}
                        </td>
                      </>
                    )}
                    {activeTab === 'merchant' && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {rule.business?.name || 'Unknown Merchant'}
                        <div className="text-xs text-gray-500">
                          {rule.business?.businessType}
                        </div>
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {rule.orderCommissionPct}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {rule.deliveryCommissionPct}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        rule.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {rule.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openModal(rule)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(rule.id)}
                          disabled={!rule.isActive}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">
                {editingRule ? 'Edit Commission Rule' : 'Create Commission Rule'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                {activeTab === 'global' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Business Type
                    </label>
                    <Select
                      value={formData.businessType}
                      onValueChange={(value) => setFormData({...formData, businessType: value})}
                    >
                      <option value="RESTAURANT">Restaurant</option>
                      <option value="SUPERMARKET">Supermarket</option>
                      <option value="COFFEE_SHOP">Coffee Shop</option>
                      <option value="SUPPLIER">Supplier</option>
                    </Select>
                  </div>
                )}

                {activeTab === 'location' && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Country *
                        </label>
                        <Input
                          value={formData.country}
                          onChange={(e) => setFormData({...formData, country: e.target.value})}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          City
                        </label>
                        <Input
                          value={formData.city}
                          onChange={(e) => setFormData({...formData, city: e.target.value})}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Zone/District
                      </label>
                      <Input
                        value={formData.zone}
                        onChange={(e) => setFormData({...formData, zone: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Business Type (Optional)
                      </label>
                      <Select
                        value={formData.businessType}
                        onValueChange={(value) => setFormData({...formData, businessType: value})}
                      >
                        <option value="">All Business Types</option>
                        <option value="RESTAURANT">Restaurant</option>
                        <option value="SUPERMARKET">Supermarket</option>
                        <option value="COFFEE_SHOP">Coffee Shop</option>
                      </Select>
                    </div>
                  </>
                )}

                {activeTab === 'merchant' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Merchant Business ID *
                    </label>
                    <Input
                      value={formData.businessType}
                      onChange={(e) => setFormData({...formData, businessType: e.target.value})}
                      placeholder="Enter business ID"
                      required
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Order Commission (%)
                    </label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={formData.orderCommissionPct}
                      onChange={(e) => setFormData({...formData, orderCommissionPct: parseFloat(e.target.value) || 0})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Delivery Commission (%)
                    </label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={formData.deliveryCommissionPct}
                      onChange={(e) => setFormData({...formData, deliveryCommissionPct: parseFloat(e.target.value) || 0})}
                    />
                  </div>
                </div>

                {activeTab === 'merchant' && (
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="zeroCommission"
                      checked={formData.isZeroCommission}
                      onChange={(e) => setFormData({...formData, isZeroCommission: e.target.checked})}
                      className="rounded border-gray-300"
                    />
                    <label htmlFor="zeroCommission" className="text-sm text-gray-700">
                      Zero Commission (requires justification)
                    </label>
                  </div>
                )}

                {(activeTab === 'merchant' && formData.isZeroCommission) && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Justification *
                    </label>
                    <textarea
                      value={formData.justification}
                      onChange={(e) => setFormData({...formData, justification: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder="Explain why this merchant should have zero commission..."
                      required={formData.isZeroCommission}
                    />
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowModal(false)
                      resetForm()
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingRule ? 'Update Rule' : 'Create Rule'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}