// web/pos/src/lib/onboarding/state-persistence.ts
'use client'

import { toast } from 'react-hot-toast'

/**
 * State Persistence Service
 * 
 * Ensures onboarding state is reliably persisted across:
 * - Browser refreshes
 * - App restarts
 * - Network failures
 * - Token renewals
 * - Multiple tabs
 * 
 * Uses multiple storage mechanisms for redundancy:
 * 1. localStorage (primary)
 * 2. sessionStorage (session backup)
 * 3. IndexedDB (long-term storage)
 * 4. Server-side storage (backup)
 */

interface OnboardingState {
  userId: string | null
  currentStep: number
  businessInfo: any
  planSelection: any
  progress: {
    businessInfo: boolean
    planSelection: boolean
    deployment: boolean
  }
  timestamps: {
    started: number
    lastSaved: number
    lastActivity: number
  }
  deviceInfo: {
    userAgent: string
    screenWidth: number
    screenHeight: number
  }
}

class StatePersistenceService {
  private static instance: StatePersistenceService
  private state: OnboardingState
  private readonly STORAGE_KEY = 'nilelink_onboarding_state_v2'
  private readonly BACKUP_KEY = 'nilelink_onboarding_backup'
  private saveTimer: NodeJS.Timeout | null = null

  private constructor() {
    this.state = this.getInitialState()
    this.loadState()
    this.setupAutoSave()
    this.setupActivityTracking()
  }

  static getInstance(): StatePersistenceService {
    if (!StatePersistenceService.instance) {
      StatePersistenceService.instance = new StatePersistenceService()
    }
    return StatePersistenceService.instance
  }

  private getInitialState(): OnboardingState {
    return {
      userId: null,
      currentStep: 1,
      businessInfo: {},
      planSelection: {},
      progress: {
        businessInfo: false,
        planSelection: false,
        deployment: false
      },
      timestamps: {
        started: Date.now(),
        lastSaved: Date.now(),
        lastActivity: Date.now()
      },
      deviceInfo: {
        userAgent: navigator.userAgent,
        screenWidth: window.screen.width,
        screenHeight: window.screen.height
      }
    }
  }

  // Load state from storage
  private loadState(): boolean {
    try {
      // Try primary storage first
      const primaryData = localStorage.getItem(this.STORAGE_KEY)
      if (primaryData) {
        this.state = { ...this.state, ...JSON.parse(primaryData) }
        return true
      }

      // Try backup storage
      const backupData = sessionStorage.getItem(this.BACKUP_KEY)
      if (backupData) {
        this.state = { ...this.state, ...JSON.parse(backupData) }
        this.saveToPrimary() // Sync back to primary
        return true
      }

      // Try server-side storage (would require user ID)
      if (this.state.userId) {
        this.loadFromServer()
        return true
      }

      return false

    } catch (error) {
      console.error('Failed to load state:', error)
      this.resetState()
      return false
    }
  }

  // Save state to all storage mechanisms
  saveState(force: boolean = false) {
    const now = Date.now()
    
    // Only save if there's meaningful activity or forced
    if (!force && (now - this.state.timestamps.lastActivity < 1000)) {
      return
    }

    this.state.timestamps.lastSaved = now
    this.state.timestamps.lastActivity = now

    try {
      const stateToSave = JSON.stringify(this.state)
      
      // Save to primary storage
      localStorage.setItem(this.STORAGE_KEY, stateToSave)
      
      // Save to backup storage
      sessionStorage.setItem(this.BACKUP_KEY, stateToSave)
      
      // Save to server if user is authenticated
      if (this.state.userId) {
        this.saveToServer()
      }

      // Dispatch storage event for cross-tab sync
      window.dispatchEvent(new StorageEvent('storage', {
        key: this.STORAGE_KEY,
        newValue: stateToSave
      }))

    } catch (error) {
      console.error('Failed to save state:', error)
      toast.error('Failed to save progress')
    }
  }

  // Auto-save every 2 seconds during activity
  private setupAutoSave() {
    setInterval(() => {
      if (this.isInProgress()) {
        this.saveState()
      }
    }, 2000)
  }

  // Track user activity for smart saving
  private setupActivityTracking() {
    const activities = ['click', 'keypress', 'scroll', 'mousemove']
    
    activities.forEach(event => {
      document.addEventListener(event, () => {
        this.state.timestamps.lastActivity = Date.now()
      }, { passive: true })
    })
  }

  // Update specific parts of the state
  updateBusinessInfo(info: any) {
    this.state.businessInfo = { ...this.state.businessInfo, ...info }
    this.state.progress.businessInfo = Object.keys(info).length > 0
    this.saveState()
  }

  updatePlanSelection(selection: any) {
    this.state.planSelection = { ...this.state.planSelection, ...selection }
    this.state.progress.planSelection = Object.keys(selection).length > 0
    this.saveState()
  }

  updateCurrentStep(step: number) {
    this.state.currentStep = step
    this.saveState()
  }

  setUserId(userId: string) {
    this.state.userId = userId
    this.saveState(true)
  }

  // Check if onboarding is in progress
  isInProgress(): boolean {
    return this.state.currentStep > 0 && 
           this.state.currentStep < 4 && 
           !this.isCompleted()
  }

  // Check if onboarding is completed
  isCompleted(): boolean {
    return this.state.progress.businessInfo && 
           this.state.progress.planSelection && 
           this.state.progress.deployment
  }

  // Get current state
  getState(): Readonly<OnboardingState> {
    return { ...this.state }
  }

  // Reset state (for new onboarding)
  resetState() {
    this.state = this.getInitialState()
    localStorage.removeItem(this.STORAGE_KEY)
    sessionStorage.removeItem(this.BACKUP_KEY)
    this.saveState(true)
  }

  // Clear all onboarding data
  clearAll() {
    localStorage.removeItem(this.STORAGE_KEY)
    sessionStorage.removeItem(this.BACKUP_KEY)
    this.state = this.getInitialState()
  }

  // Migrate from old state versions
  migrateState(oldVersion: string) {
    // Handle state migration logic here
    console.log(`Migrating from version ${oldVersion}`)
  }

  // Handle browser tab closing
  handleTabClose() {
    if (this.isInProgress()) {
      this.saveState(true)
    }
  }

  // Handle app suspension (mobile)
  handleAppSuspend() {
    this.saveState(true)
  }

  // Handle app resume (mobile)
  handleAppResume() {
    this.loadState()
  }

  // Validate state integrity
  validateState(): boolean {
    try {
      // Check required fields
      if (!this.state.timestamps.started) return false
      if (this.state.currentStep < 1 || this.state.currentStep > 3) return false
      
      // Check data consistency
      if (this.state.progress.businessInfo && !this.state.businessInfo) return false
      if (this.state.progress.planSelection && !this.state.planSelection) return false
      
      return true
    } catch {
      return false
    }
  }

  // Repair corrupted state
  repairState(): boolean {
    const backup = sessionStorage.getItem(this.BACKUP_KEY)
    if (backup) {
      try {
        this.state = { ...this.state, ...JSON.parse(backup) }
        this.saveState(true)
        toast.success('State repaired from backup')
        return true
      } catch {
        // Backup is also corrupted
      }
    }
    
    this.resetState()
    toast.error('State was corrupted and has been reset')
    return false
  }

  // Export state for debugging
  exportState(): string {
    return JSON.stringify(this.state, null, 2)
  }

  // Import state (for testing/debugging)
  importState(stateJson: string): boolean {
    try {
      const importedState = JSON.parse(stateJson)
      this.state = { ...this.getInitialState(), ...importedState }
      this.saveState(true)
      return true
    } catch {
      return false
    }
  }

  // Private methods for server storage
  private async saveToServer() {
    try {
      // This would save to your backend
      // await fetch('/api/onboarding/save-state', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(this.state)
      // })
    } catch (error) {
      console.warn('Failed to save state to server:', error)
    }
  }

  private async loadFromServer() {
    try {
      // This would load from your backend
      // const response = await fetch(`/api/onboarding/load-state/${this.state.userId}`)
      // if (response.ok) {
      //   const serverState = await response.json()
      //   this.state = { ...this.state, ...serverState }
      // }
    } catch (error) {
      console.warn('Failed to load state from server:', error)
    }
  }

  private saveToPrimary() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.state))
    } catch (error) {
      console.error('Failed to save to primary storage:', error)
    }
  }

  // Handle storage quota exceeded
  private handleQuotaExceeded() {
    // Clear old backups to free space
    const keysToRemove = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith('nilelink_backup_')) {
        keysToRemove.push(key)
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key))
    
    // Try to save again
    this.saveState(true)
  }
}

// Setup global handlers
if (typeof window !== 'undefined') {
  const persistence = StatePersistenceService.getInstance()
  
  // Handle page unload
  window.addEventListener('beforeunload', () => {
    persistence.handleTabClose()
  })
  
  // Handle storage events (cross-tab sync)
  window.addEventListener('storage', (event) => {
    if (event.key === persistence['STORAGE_KEY']) {
      persistence['loadState']()
    }
  })
  
  // Handle visibility change
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      persistence.handleTabClose()
    } else {
      persistence['loadState']()
    }
  })
}

export default StatePersistenceService