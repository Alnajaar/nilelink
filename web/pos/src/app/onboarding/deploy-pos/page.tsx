// web/pos/src/app/onboarding/deploy-pos/page.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  CheckCircle,
  Server,
  Database,
  Shield,
  Zap,
  AlertCircle,
  Loader2,
  Cpu,
  HardDrive,
  Wifi
} from 'lucide-react'
import { Button } from '@shared/components/Button'
import { Card } from '@shared/components/Card'
import { useAuth } from '@shared/providers/AuthProvider'
import { toast } from 'react-hot-toast'

interface DeploymentStatus {
  step: number
  totalSteps: number
  currentAction: string
  completed: boolean
  error?: string
}

export default function DeployPOSOnboarding() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [deploymentStatus, setDeploymentStatus] = useState<DeploymentStatus>({
    step: 0,
    totalSteps: 5,
    currentAction: 'Initializing deployment...',
    completed: false
  })
  const [isUserValidated, setIsUserValidated] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)

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
      
      setIsUserValidated(true)
    }
  }, [user, authLoading, router])

  const deploymentSteps = [
    { 
      id: 1, 
      title: 'Verifying Business Information', 
      icon: CheckCircle,
      description: 'Confirming business details and plan selection'
    },
    { 
      id: 2, 
      title: 'Setting up POS Infrastructure', 
      icon: Server,
      description: 'Creating dedicated POS environment and databases'
    },
    { 
      id: 3, 
      title: 'Configuring Security Protocols', 
      icon: Shield,
      description: 'Enabling encryption and access controls'
    },
    { 
      id: 4, 
      title: 'Deploying Business Services', 
      icon: Database,
      description: 'Activating inventory, orders, and analytics systems'
    },
    { 
      id: 5, 
      title: 'Final System Activation', 
      icon: Zap,
      description: 'Completing setup and granting dashboard access'
    }
  ]

  const startDeployment = async () => {
    setShowConfirmation(false)
    
    try {
      // Simulate deployment steps
      for (let i = 0; i < deploymentSteps.length; i++) {
        const step = deploymentSteps[i]
        
        setDeploymentStatus(prev => ({
          ...prev,
          step: i + 1,
          currentAction: step.description
        }))

        // Simulate processing time (in real implementation, this would be actual API calls)
        await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000))
      }

      // Finalize deployment
      await finalizeDeployment()
      
    } catch (error: any) {
      console.error('Deployment error:', error)
      setDeploymentStatus(prev => ({
        ...prev,
        error: error.message || 'Deployment failed. Please try again.'
      }))
      toast.error('Deployment failed. Please try again.')
    }
  }

  const finalizeDeployment = async () => {
    try {
      // Call API to finalize onboarding
      const response = await fetch('/api/onboarding/finalize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to finalize deployment')
      }

      // Update local state to reflect completion
      setDeploymentStatus(prev => ({
        ...prev,
        completed: true,
        currentAction: 'POS System Ready!'
      }))

      toast.success('POS deployment completed successfully!')
      
      // Redirect to dashboard after a brief delay
      setTimeout(() => {
        router.push('/dashboard')
      }, 3000)

    } catch (error: any) {
      throw new Error(error.message)
    }
  }

  const getStatusIcon = (stepId: number) => {
    if (stepId < deploymentStatus.step) {
      return <CheckCircle className="w-6 h-6 text-green-400" />
    } else if (stepId === deploymentStatus.step) {
      return <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
    } else {
      return <div className="w-6 h-6 rounded-full bg-gray-600" />
    }
  }

  if (authLoading || !isUserValidated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-300">Loading deployment setup...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Deploy Your POS System
          </h1>
          <p className="text-xl text-gray-300">
            Step 3 of 3: Finalizing your business setup
          </p>
        </div>

        {!showConfirmation && !deploymentStatus.completed && (
          <Card className="bg-gray-800/50 backdrop-blur-lg border border-gray-700">
            <div className="p-8">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-500/20 mb-6">
                  <Server className="w-10 h-10 text-blue-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-4">Ready for Deployment</h2>
                <p className="text-gray-300 mb-6">
                  You're about to deploy your fully configured POS system. 
                  This will create your dedicated business environment and activate all services.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="text-center">
                    <Cpu className="w-8 h-8 text-green-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-300">Dedicated Infrastructure</p>
                  </div>
                  <div className="text-center">
                    <HardDrive className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-300">Secure Storage</p>
                  </div>
                  <div className="text-center">
                    <Wifi className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-300">Real-time Sync</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={() => router.back()}
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  Back to Plan Selection
                </Button>
                <Button
                  onClick={() => setShowConfirmation(true)}
                  className="bg-green-600 hover:bg-green-700 text-white py-3 px-8"
                >
                  Deploy POS System
                </Button>
              </div>
            </div>
          </Card>
        )}

        {showConfirmation && !deploymentStatus.completed && (
          <Card className="bg-gray-800/50 backdrop-blur-lg border border-gray-700">
            <div className="p-8">
              <h2 className="text-2xl font-bold text-white mb-6 text-center">
                Deployment in Progress
              </h2>
              
              {deploymentStatus.error ? (
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/20 mb-4">
                    <AlertCircle className="w-8 h-8 text-red-400" />
                  </div>
                  <p className="text-red-300 mb-6">{deploymentStatus.error}</p>
                  <Button
                    onClick={() => {
                      setDeploymentStatus(prev => ({ ...prev, error: undefined }))
                      setShowConfirmation(false)
                    }}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Try Again
                  </Button>
                </div>
              ) : (
                <>
                  <div className="mb-8">
                    <div className="flex justify-between text-sm text-gray-400 mb-2">
                      <span>Progress</span>
                      <span>{deploymentStatus.step} of {deploymentStatus.totalSteps}</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2.5">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                        style={{ width: `${(deploymentStatus.step / deploymentStatus.totalSteps) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="space-y-4 mb-8">
                    {deploymentSteps.map((step) => (
                      <div 
                        key={step.id}
                        className={`flex items-center p-4 rounded-lg ${
                          step.id <= deploymentStatus.step 
                            ? 'bg-green-500/10 border border-green-500/20' 
                            : 'bg-gray-700/50'
                        }`}
                      >
                        <div className="mr-4">
                          {getStatusIcon(step.id)}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-white">{step.title}</h3>
                          <p className="text-sm text-gray-400">{step.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="text-center">
                    <div className="inline-flex items-center">
                      <Loader2 className="w-5 h-5 text-blue-400 animate-spin mr-3" />
                      <span className="text-gray-300">{deploymentStatus.currentAction}</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </Card>
        )}

        {deploymentStatus.completed && (
          <Card className="bg-green-500/10 backdrop-blur-lg border border-green-500/30">
            <div className="p-8 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/20 mb-6">
                <CheckCircle className="w-10 h-10 text-green-400" />
              </div>
              
              <h2 className="text-3xl font-bold text-white mb-4">
                Deployment Complete!
              </h2>
              
              <p className="text-xl text-green-300 mb-2">
                Your POS system is now live and ready to use
              </p>
              
              <p className="text-gray-300 mb-8">
                You'll be automatically redirected to your dashboard in a few moments...
              </p>
              
              <div className="inline-flex items-center text-sm text-gray-400">
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Redirecting to dashboard
              </div>
            </div>
          </Card>
        )}

        <div className="mt-8 text-center text-gray-400 text-sm">
          <p>Step 3 of 3 • Business Info → Plan Selection → Deploy POS</p>
          <p className="mt-2">Need help? Contact support at support@nilelink.com</p>
        </div>
      </div>
    </div>
  )
}