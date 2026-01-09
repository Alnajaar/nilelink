'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, UserCheck, UserX, Eye, Mail, Phone, Building, Calendar, Shield } from 'lucide-react'

interface PendingUser {
  id: string;
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  businessName?: string;
  selectedPlan?: string;
  status: string;
  registeredAt: string;
  verified: {
    email: boolean;
    phone: boolean;
    wallet: boolean;
  };
}

export default function UserApprovalsPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([])
  const [selectedUser, setSelectedUser] = useState<PendingUser | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [processingUser, setProcessingUser] = useState<string | null>(null)

  useEffect(() => {
    // Check admin authentication
    const adminSession = localStorage.getItem('admin_session')
    if (!adminSession) {
      router.push('/login')
      return
    }

    try {
      const session = JSON.parse(adminSession)
      if (!session.authenticated) {
        router.push('/login')
        return
      }
      setIsAuthenticated(true)
      loadPendingUsers()
    } catch {
      router.push('/login')
    }
  }, [router])

  const loadPendingUsers = () => {
    const allUsers = JSON.parse(localStorage.getItem('allRegisteredUsers') || '[]')
    const pending = allUsers.filter((user: PendingUser) => user.status === 'pending_approval')
    setPendingUsers(pending)
  }

  const handleApprove = async (userId: string) => {
    setProcessingUser(userId)

    const allUsers = JSON.parse(localStorage.getItem('allRegisteredUsers') || '[]')
    const userIndex = allUsers.findIndex((u: PendingUser) => u.id === userId)

    if (userIndex >= 0) {
      allUsers[userIndex].status = 'approved'
      allUsers[userIndex].approvedBy = 'admin@nilelink.app'
      allUsers[userIndex].approvedAt = new Date().toISOString()

      localStorage.setItem('allRegisteredUsers', JSON.stringify(allUsers))

      // Update pending users list
      setPendingUsers(prev => prev.filter(u => u.id !== userId))
      setSelectedUser(null)
    }

    setProcessingUser(null)
  }

  const handleReject = async () => {
    if (!selectedUser || !rejectionReason.trim()) return

    setProcessingUser(selectedUser.id)

    const allUsers = JSON.parse(localStorage.getItem('allRegisteredUsers') || '[]')
    const userIndex = allUsers.findIndex((u: PendingUser) => u.id === selectedUser.id)

    if (userIndex >= 0) {
      allUsers[userIndex].status = 'rejected'
      allUsers[userIndex].statusReason = rejectionReason
      allUsers[userIndex].approvedBy = 'admin@nilelink.app'

      localStorage.setItem('allRegisteredUsers', JSON.stringify(allUsers))

      setPendingUsers(prev => prev.filter(u => u.id !== selectedUser.id))
      setSelectedUser(null)
      setRejectionReason('')
    }

    setProcessingUser(null)
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="p-2 hover:bg-gray-100 rounded-md"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">User Approvals</h1>
                <p className="text-sm text-gray-500">Review and approve new user registrations</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700 bg-red-50 px-3 py-1 rounded-full">
                <Shield className="h-4 w-4 inline mr-1" />
                Super Admin
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {pendingUsers.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
            <UserCheck className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">All Caught Up!</h3>
            <p className="text-gray-600">No pending user approvals at this time.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {pendingUsers.map((user) => (
              <div key={user.id} className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <Building className="h-6 w-6 text-blue-600" />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {user.businessName || `${user.firstName} ${user.lastName}`}
                        </h3>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Pending Approval
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        {user.email && (
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Mail className="h-4 w-4" />
                            <span>{user.email}</span>
                            {user.verified.email && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                Verified
                              </span>
                            )}
                          </div>
                        )}

                        {user.phone && (
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Phone className="h-4 w-4" />
                            <span>{user.phone}</span>
                            {user.verified.phone && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                Verified
                              </span>
                            )}
                          </div>
                        )}

                        {user.selectedPlan && (
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <span className="font-medium">Plan:</span>
                            <span>{user.selectedPlan}</span>
                          </div>
                        )}

                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Calendar className="h-4 w-4" />
                          <span>Registered: {new Date(user.registeredAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setSelectedUser(user)}
                      className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md flex items-center space-x-2"
                    >
                      <Eye className="h-4 w-4" />
                      <span>Review</span>
                    </button>

                    <button
                      onClick={() => handleApprove(user.id)}
                      disabled={processingUser === user.id}
                      className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 rounded-md flex items-center space-x-2"
                    >
                      <UserCheck className="h-4 w-4" />
                      <span>{processingUser === user.id ? 'Approving...' : 'Approve'}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* User Review Modal */}
        {selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Review User Application</h2>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="p-2 hover:bg-gray-100 rounded-md"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4">User Information</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Business Name</p>
                        <p className="font-medium">{selectedUser.businessName || 'N/A'}</p>
                      </div>

                      {selectedUser.email && (
                        <div>
                          <p className="text-sm font-medium text-gray-500">Email</p>
                          <div className="flex items-center space-x-2">
                            <p>{selectedUser.email}</p>
                            {selectedUser.verified.email && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Verified
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {selectedUser.phone && (
                        <div>
                          <p className="text-sm font-medium text-gray-500">Phone</p>
                          <div className="flex items-center space-x-2">
                            <p>{selectedUser.phone}</p>
                            {selectedUser.verified.phone && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Verified
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      <div>
                        <p className="text-sm font-medium text-gray-500">Plan</p>
                        <p className="font-medium">{selectedUser.selectedPlan || 'Not specified'}</p>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-gray-500">Registered</p>
                        <p>{new Date(selectedUser.registeredAt).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4">Rejection Reason</h3>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Provide a reason for rejection (required for rejection)..."
                      className="w-full h-32 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-6 border-t">
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleReject}
                    disabled={!rejectionReason.trim() || processingUser === selectedUser.id}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-md flex items-center space-x-2"
                  >
                    <UserX className="h-4 w-4" />
                    <span>{processingUser === selectedUser.id ? 'Rejecting...' : 'Reject User'}</span>
                  </button>

                  <button
                    onClick={() => handleApprove(selectedUser.id)}
                    disabled={processingUser === selectedUser.id}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-md flex items-center space-x-2"
                  >
                    <UserCheck className="h-4 w-4" />
                    <span>{processingUser === selectedUser.id ? 'Approving...' : 'Approve User'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}