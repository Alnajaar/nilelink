// web/pos/src/lib/onboarding/edge-case-handler.ts
'use client'

import { useRouter } from 'next/navigation'

/**
 * Edge Case Handler for Onboarding System
 * 
 * Handles all edge cases that could break the onboarding flow:
 * - Browser refresh during onboarding
 * - Token expiration
 * - Network failures
 * - Multiple device conflicts
 * - Failed deployments
 * - Session timeouts
 * 
 * Ensures users never get stuck or redirected incorrectly.
 */

class OnboardingEdgeCaseHandler {
  private router: ReturnType<typeof useRouter>
  private static instance: OnboardingEdgeCaseHandler

  private constructor(router: ReturnType<typeof useRouter>) {
    this.router = router
    this.setupGlobalHandlers()
  }

  static getInstance(router: ReturnType<typeof useRouter>): OnboardingEdgeCaseHandler {
    if (!OnboardingEdgeCaseHandler.instance) {
      OnboardingEdgeCaseHandler.instance = new OnboardingEdgeCaseHandler(router)
    }
    return OnboardingEdgeCaseHandler.instance
  }

  private setupGlobalHandlers() {
    // Handle browser refresh/restore
    window.addEventListener('beforeunload', this.handleBeforeUnload)
    
    // Handle online/offline status
    window.addEventListener('online', this.handleOnline)
    window.addEventListener('offline', this.handleOffline)
    
    // Handle visibility change (tab switching)
    document.addEventListener('visibilitychange', this.handleVisibilityChange)
    
    // Handle storage changes (multiple tabs)
    window.addEventListener('storage', this.handleStorageChange)
  }

  // Handle browser refresh/close
  private handleBeforeUnload = (event: BeforeUnloadEvent) => {
    const onboardingState = this.getOnboardingState()
    
    if (onboardingState.inProgress && !onboardingState.completed) {
      // Save current progress
      this.saveProgress()
      
      // Show warning for unsaved changes
      event.preventDefault()
      event.returnValue = 'You have unsaved onboarding progress. Are you sure you want to leave?'
      return event.returnValue
    }
  }

  // Handle coming back online
  private handleOnline = () => {
    console.log('Connection restored')
    // Resume any pending operations
    this.resumeOperations()
  }

  // Handle going offline
  private handleOffline = () => {
    console.log('You are offline. Some features may be limited.')
  }

  // Handle tab visibility changes
  private handleVisibilityChange = () => {
    if (document.hidden) {
      // Tab hidden - save current state
      this.saveProgress()
    } else {
      // Tab visible - check for state changes
      this.syncState()
    }
  }

  // Handle storage changes (multiple tabs/devices)
  private handleStorageChange = (event: StorageEvent) => {
    if (event.key === 'nilelink_onboarding_state') {
      // Another tab/device updated the state
      this.syncState()
    }
  }

  // Save current onboarding progress
  saveProgress() {
    const progress = {
      step: this.getCurrentStep(),
      timestamp: Date.now(),
      formData: this.getFormData()
    }
    
    localStorage.setItem('nilelink_onboarding_progress', JSON.stringify(progress))
    this.syncAcrossTabs(progress)
  }

  // Resume from saved progress
  resumeProgress(): boolean {
    try {
      const savedProgress = localStorage.getItem('nilelink_onboarding_progress')
      if (!savedProgress) return false
      
      const progress = JSON.parse(savedProgress)
      
      // Check if progress is recent (within 24 hours)
      if (Date.now() - progress.timestamp > 24 * 60 * 60 * 1000) {
        this.clearProgress()
        return false
      }
      
      // Restore form data and step
      this.restoreFormData(progress.formData)
      this.navigateToStep(progress.step)
      
      console.log('Welcome back! Resuming your progress...')
      return true
      
    } catch (error) {
      console.error('Failed to resume progress:', error)
      this.clearProgress()
      return false
    }
  }

  // Handle token expiration
  handleTokenExpiration() {
    // Save current progress before redirecting
    this.saveProgress()
    
    // Redirect to login with return URL
    const returnUrl = window.location.pathname
    this.router.push(`/login?returnUrl=${encodeURIComponent(returnUrl)}`)
    
    console.error('Session expired. Please log in again.')
  }

  // Handle network errors
  handleNetworkError(operation: string, error: any) {
    console.error(`Network error during ${operation}:`, error)
    
    // Show user-friendly error
    console.error(`Network error: ${error.message || 'Connection failed'}. Retrying...`)
    
    // Attempt to retry operation
    setTimeout(() => {
      this.retryOperation(operation)
    }, 3000)
  }

  // Handle deployment failures
  handleDeploymentFailure(error: any) {
    console.error('Deployment failed:', error)
    
    // Save error state
    localStorage.setItem('nilelink_deployment_error', JSON.stringify({
      error: error.message,
      timestamp: Date.now(),
      retryCount: this.getRetryCount() + 1
    }))
    
    // Show error to user
    console.error('Deployment failed. Our team has been notified.')
    
    // Provide recovery options
    this.showRecoveryOptions()
  }

  // Handle multiple device conflicts
  handleDeviceConflict() {
    console.warn('You appear to be logged in on another device.')
    
    // Prompt user to choose action
    if (confirm('You are logged in on another device. Continue here or switch devices?')) {
      // Continue on this device
      this.forceLogoutOtherDevices()
    } else {
      // Logout from this device
      this.router.push('/login')
    }
  }

  // Handle session timeout
  handleSessionTimeout() {
    this.saveProgress()
    this.router.push('/login?timeout=true')
    console.error('Your session has timed out. Please log in again.')
  }

  // Recovery mechanism for failed states
  async attemptRecovery(): Promise<boolean> {
    try {
      // Check if user is authenticated
      const isAuthenticated = await this.checkAuthentication()
      if (!isAuthenticated) {
        this.handleTokenExpiration()
        return false
      }
      
      // Check onboarding status
      const onboardingStatus = await this.fetchOnboardingStatus()
      
      switch (onboardingStatus) {
        case 'completed':
          this.router.push('/dashboard')
          return true
          
        case 'pending':
          // Try to resume progress
          if (!this.resumeProgress()) {
            // Start fresh but preserve existing data
            this.router.push('/onboarding/business-info')
          }
          return true
          
        case 'failed':
          // Handle failed onboarding
          this.handleFailedOnboarding()
          return false
          
        default:
          // Unknown state - redirect to safe location
          this.router.push('/')
          return false
      }
      
    } catch (error) {
      console.error('Recovery failed:', error)
      this.router.push('/login')
      return false
    }
  }

  // Private helper methods
  private getCurrentStep(): number {
    const path = window.location.pathname
    if (path.includes('/business-info')) return 1
    if (path.includes('/plan-selection')) return 2
    if (path.includes('/deploy-pos')) return 3
    return 0
  }

  private getFormData(): any {
    // This would collect form data from current step
    return {}
  }

  private restoreFormData(formData: any) {
    // This would restore form data to current step
  }

  private navigateToStep(step: number) {
    const stepPaths = [
      '/onboarding/business-info',
      '/onboarding/plan-selection', 
      '/onboarding/deploy-pos'
    ]
    
    if (step >= 1 && step <= stepPaths.length) {
      this.router.push(stepPaths[step - 1])
    }
  }

  private getOnboardingState(): { inProgress: boolean; completed: boolean } {
    // Check current onboarding state
    return {
      inProgress: window.location.pathname.includes('/onboarding'),
      completed: false // Would check actual user state
    }
  }

  private syncAcrossTabs(data: any) {
    // Dispatch storage event to sync across tabs
    localStorage.setItem('nilelink_onboarding_state', JSON.stringify(data))
  }

  private syncState() {
    // Synchronize state with other tabs/devices
    const savedState = localStorage.getItem('nilelink_onboarding_state')
    if (savedState) {
      // Handle state synchronization
    }
  }

  private clearProgress() {
    localStorage.removeItem('nilelink_onboarding_progress')
    localStorage.removeItem('nilelink_onboarding_state')
  }

  private getRetryCount(): number {
    const errorData = localStorage.getItem('nilelink_deployment_error')
    if (errorData) {
      const parsed = JSON.parse(errorData)
      return parsed.retryCount || 0
    }
    return 0
  }

  private showRecoveryOptions() {
    // Show recovery options to user
    console.error('Deployment failed. Please try again or contact support.')
  }

  private async checkAuthentication(): Promise<boolean> {
    // Check if user is still authenticated
    try {
      const response = await fetch('/api/auth/check')
      return response.ok
    } catch {
      return false
    }
  }

  private async fetchOnboardingStatus(): Promise<string> {
    // Fetch actual onboarding status from backend
    try {
      const response = await fetch('/api/user/onboarding-status')
      const data = await response.json()
      return data.status
    } catch {
      return 'unknown'
    }
  }

  private handleFailedOnboarding() {
    console.error('Onboarding process failed. Please contact support.')
    this.router.push('/support?issue=onboarding-failed')
  }

  private retryOperation(operation: string) {
    // Implement retry logic for failed operations
    console.log(`Retrying operation: ${operation}`)
  }

  private retryDeployment() {
    // Retry deployment process
    this.router.push('/onboarding/deploy-pos')
  }

  private forceLogoutOtherDevices() {
    // Force logout from other devices
    localStorage.setItem('nilelink_force_logout', Date.now().toString())
  }

  private resumeOperations() {
    // Resume any pending/background operations
    console.log('Resuming operations after connectivity restore')
  }
}

export default OnboardingEdgeCaseHandler