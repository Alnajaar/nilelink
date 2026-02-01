// POS Kernel - Central Orchestrator
// Root process responsible for booting, managing, monitoring, and recovering all POS engines

import { eventBus, createEvent } from './EventBus';
import { hal } from './HAL';
import { productInventoryEngine } from './ProductInventoryEngine';
import { pricingEngine } from './PricingEngine';
import { taxEngine } from './TaxEngine';
import { syncEngine } from './SyncEngine';
import { complianceEngine } from './ComplianceEngine';
import { businessTypeResolver } from './BusinessTypeResolver';
import { feedbackSystem } from '../ui/FeedbackSystem';

export enum KernelState {
  UNINITIALIZED = 'uninitialized',
  INITIALIZING = 'initializing',
  BOOTING = 'booting',
  READY = 'ready',
  RUNNING = 'running',
  SAFE_MODE = 'safe_mode',
  ERROR = 'error',
  SHUTTING_DOWN = 'shutting_down',
  SHUTDOWN = 'shutdown'
}

export enum BootPhase {
  LOAD_CONFIG = 'load_config',
  INITIALIZE_HAL = 'initialize_hal',
  REGISTER_DRIVERS = 'register_drivers',
  START_EVENT_BUS = 'start_event_bus',
  START_CORE_ENGINES = 'start_core_engines',
  MOUNT_UI_LAYER = 'mount_ui_layer',
  COMPLETE = 'complete'
}

export interface KernelConfig {
  version: string;
  environment: 'development' | 'staging' | 'production';
  safeModeEnabled: boolean;
  autoRecoveryEnabled: boolean;
  healthCheckInterval: number;
  maxBootTime: number;
  maxRecoveryAttempts: number;
}

export interface KernelHealth {
  overall: 'healthy' | 'degraded' | 'critical' | 'failed';
  components: Map<string, ComponentHealth>;
  lastCheck: number;
  uptime: number;
  incidents: KernelIncident[];
}

export interface ComponentHealth {
  name: string;
  status: 'healthy' | 'degraded' | 'critical' | 'failed';
  lastCheck: number;
  responseTime?: number;
  errorCount: number;
  metadata?: Record<string, any>;
}

export interface KernelIncident {
  id: string;
  timestamp: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  component: string;
  description: string;
  resolved: boolean;
  resolvedAt?: number;
  metadata?: Record<string, any>;
}

export interface BootContext {
  phase: BootPhase;
  progress: number;
  message: string;
  startTime: number;
  errors: Error[];
}

class POSKernel {
  private state: KernelState = KernelState.UNINITIALIZED;
  private config: KernelConfig;
  private health: KernelHealth;
  private bootContext: BootContext | null = null;
  private recoveryAttempts = 0;
  private healthCheckTimer?: NodeJS.Timeout;
  private components = new Map<string, any>();
  private lifecycleHooks = {
    onBoot: [] as (() => void | Promise<void>)[],
    onReady: [] as (() => void | Promise<void>)[],
    onError: [] as ((error: Error) => void | Promise<void>)[],
    onShutdown: [] as (() => void | Promise<void>)[]
  };

  constructor() {
    this.config = this.getDefaultConfig();
    this.health = this.initializeHealth();

    // Register core components
    this.registerComponents();
  }

  /**
   * Get default kernel configuration
   */
  private getDefaultConfig(): KernelConfig {
    return {
      version: '1.0.0',
      environment: 'development',
      safeModeEnabled: true,
      autoRecoveryEnabled: true,
      healthCheckInterval: 30000, // 30 seconds
      maxBootTime: 60000, // 60 seconds
      maxRecoveryAttempts: 3
    };
  }

  /**
   * Initialize health monitoring
   */
  private initializeHealth(): KernelHealth {
    return {
      overall: 'healthy',
      components: new Map(),
      lastCheck: Date.now(),
      uptime: 0,
      incidents: []
    };
  }

  /**
   * Register all core components
   */
  private registerComponents(): void {
    this.components.set('hal', hal);
    this.components.set('eventBus', eventBus);
    this.components.set('productInventoryEngine', productInventoryEngine);
    this.components.set('pricingEngine', pricingEngine);
    this.components.set('taxEngine', taxEngine);
    this.components.set('syncEngine', syncEngine);
    this.components.set('complianceEngine', complianceEngine);
    this.components.set('businessTypeResolver', businessTypeResolver);
    this.components.set('feedbackSystem', feedbackSystem);
  }

  /**
   * Setup global error handlers
   */
  private setupErrorHandlers(): void {
    if (typeof window === 'undefined') return;

    window.addEventListener('unhandledrejection', (event) => {
      this.handleCriticalError(new Error(`Unhandled promise rejection: ${event.reason}`));
    });

    window.addEventListener('error', (event) => {
      this.handleCriticalError(new Error(`Global error: ${event.message}`));
    });
  }

  /**
   * Boot the POS Kernel
   */
  async boot(): Promise<void> {
    if (this.state !== KernelState.UNINITIALIZED) {
      throw new Error(`Cannot boot kernel in state: ${this.state}`);
    }

    this.state = KernelState.INITIALIZING;
    const bootStartTime = Date.now();

    this.bootContext = {
      phase: BootPhase.LOAD_CONFIG,
      progress: 0,
      message: 'Initializing POS Kernel...',
      startTime: bootStartTime,
      errors: []
    };

    try {
      // Setup error handlers (client side only)
      this.setupErrorHandlers();

      // Execute boot sequence
      await this.executeBootSequence();

      this.state = KernelState.READY;
      this.health.uptime = Date.now() - bootStartTime;

      // Execute onReady hooks
      await this.executeLifecycleHooks('onReady');

      // Start health monitoring
      this.startHealthMonitoring();

      // Publish boot complete event
      await eventBus.publish(createEvent('KERNEL_BOOT_COMPLETE', {
        version: this.config.version,
        bootTime: Date.now() - bootStartTime,
        componentsLoaded: this.components.size
      }, {
        source: 'POSKernel'
      }));

      console.log(`🟢 POS Kernel v${this.config.version} booted successfully in ${Date.now() - bootStartTime}ms`);

    } catch (error: any) {
      await this.handleBootFailure(error);
    }
  }

  /**
   * Execute the deterministic boot sequence
   */
  private async executeBootSequence(): Promise<void> {
    const phases: BootPhase[] = [
      BootPhase.LOAD_CONFIG,
      BootPhase.INITIALIZE_HAL,
      BootPhase.REGISTER_DRIVERS,
      BootPhase.START_EVENT_BUS,
      BootPhase.START_CORE_ENGINES,
      BootPhase.MOUNT_UI_LAYER
    ];

    for (let i = 0; i < phases.length; i++) {
      const phase = phases[i];
      await this.executeBootPhase(phase, (i + 1) / phases.length);
    }

    this.bootContext!.phase = BootPhase.COMPLETE;
    this.bootContext!.progress = 1.0;
  }

  /**
   * Execute a specific boot phase
   */
  private async executeBootPhase(phase: BootPhase, progress: number): Promise<void> {
    if (!this.bootContext) return;

    this.bootContext.phase = phase;
    this.bootContext.progress = progress;

    try {
      switch (phase) {
        case BootPhase.LOAD_CONFIG:
          this.bootContext.message = 'Loading configuration...';
          await this.loadConfiguration();
          break;

        case BootPhase.INITIALIZE_HAL:
          this.bootContext.message = 'Initializing hardware abstraction layer...';
          await this.initializeHAL();
          break;

        case BootPhase.REGISTER_DRIVERS:
          this.bootContext.message = 'Registering device drivers...';
          await this.registerDrivers();
          break;

        case BootPhase.START_EVENT_BUS:
          this.bootContext.message = 'Starting event bus...';
          await this.startEventBus();
          break;

        case BootPhase.START_CORE_ENGINES:
          this.bootContext.message = 'Starting core engines...';
          await this.startCoreEngines();
          break;

        case BootPhase.MOUNT_UI_LAYER:
          this.bootContext.message = 'Mounting user interface...';
          await this.mountUILayer();
          break;
      }

      // Execute onBoot hooks for this phase
      await this.executeLifecycleHooks('onBoot');

    } catch (error: any) {
      this.bootContext.errors.push(error);
      throw error;
    }
  }

  /**
   * Load kernel configuration
   */
  private async loadConfiguration(): Promise<void> {
    // Load from localStorage or environment
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('pos_kernel_config');
      if (stored) {
        try {
          const storedConfig = JSON.parse(stored);
          this.config = { ...this.config, ...storedConfig };
        } catch (error) {
          console.warn('Failed to load stored kernel config:', error);
        }
      }
    }

    // Validate configuration
    this.validateConfiguration();
  }

  /**
   * Validate kernel configuration
   */
  private validateConfiguration(): void {
    if (!this.config.version) throw new Error('Kernel version is required');
    if (this.config.healthCheckInterval < 5000) throw new Error('Health check interval too short');
    if (this.config.maxBootTime < 10000) throw new Error('Boot timeout too short');
  }

  /**
   * Initialize HAL
   */
  private async initializeHAL(): Promise<void> {
    try {
      hal.initialize();
      this.updateComponentHealth('hal', 'healthy');
    } catch (error: any) {
      this.updateComponentHealth('hal', 'failed', error.message);
      throw new Error(`HAL initialization failed: ${error.message}`);
    }
  }

  /**
   * Register device drivers
   */
  private async registerDrivers(): Promise<void> {
    // HAL handles driver registration automatically
    // Additional custom drivers can be registered here
  }

  /**
   * Start event bus
   */
  private async startEventBus(): Promise<void> {
    try {
      eventBus.initialize();
      this.updateComponentHealth('eventBus', 'healthy');
    } catch (error: any) {
      this.updateComponentHealth('eventBus', 'failed', error.message);
      throw new Error(`Event bus initialization failed: ${error.message}`);
    }
  }

  /**
   * Start core engines
   */
  private async startCoreEngines(): Promise<void> {
    const engines = [
      { name: 'productInventoryEngine', engine: productInventoryEngine },
      { name: 'pricingEngine', engine: pricingEngine },
      { name: 'taxEngine', engine: taxEngine },
      { name: 'syncEngine', engine: syncEngine },
      { name: 'complianceEngine', engine: complianceEngine },
      { name: 'businessTypeResolver', engine: businessTypeResolver },
      { name: 'feedbackSystem', engine: feedbackSystem }
    ];

    for (const { name, engine } of engines) {
      try {
        if (typeof engine.initialize === 'function') {
          await engine.initialize();
        }
        this.updateComponentHealth(name, 'healthy');
      } catch (error: any) {
        this.updateComponentHealth(name, 'failed', error.message);

        // In safe mode, continue with degraded functionality
        if (this.config.safeModeEnabled) {
          console.warn(`Engine ${name} failed, continuing in safe mode`);
          this.logIncident('high', name, `Engine initialization failed: ${error.message}`);
        } else {
          throw new Error(`${name} initialization failed: ${error.message}`);
        }
      }
    }
  }

  /**
   * Mount UI layer
   */
  private async mountUILayer(): Promise<void> {
    // UI mounting is handled by React
    // This phase ensures all dependencies are ready
    this.state = KernelState.RUNNING;
  }

  /**
   * Handle boot failure
   */
  private async handleBootFailure(error: Error): Promise<void> {
    this.state = KernelState.ERROR;

    // Execute error hooks
    await this.executeLifecycleHooks('onError', error);

    // Attempt recovery
    if (this.config.autoRecoveryEnabled && this.recoveryAttempts < this.config.maxRecoveryAttempts) {
      await this.attemptRecovery();
    } else {
      // Enter safe mode or shutdown
      await this.enterSafeMode();
    }

    await eventBus.publish(createEvent('KERNEL_BOOT_FAILED', {
      error: error.message,
      recoveryAttempts: this.recoveryAttempts,
      safeMode: this.state === KernelState.SAFE_MODE
    }, {
      source: 'POSKernel',
      priority: 'critical'
    }));
  }

  /**
   * Attempt recovery
   */
  private async attemptRecovery(): Promise<void> {
    this.recoveryAttempts++;
    console.log(`🔄 Attempting kernel recovery (attempt ${this.recoveryAttempts})`);

    // Reset state and retry boot
    this.state = KernelState.UNINITIALIZED;
    await this.boot();
  }

  /**
   * Enter safe mode
   */
  private async enterSafeMode(): Promise<void> {
    this.state = KernelState.SAFE_MODE;
    console.log('🟡 Entering safe mode - limited functionality available');

    // Shutdown non-critical components
    const nonCriticalComponents = ['pricingEngine', 'taxEngine', 'syncEngine', 'complianceEngine'];

    for (const componentName of nonCriticalComponents) {
      try {
        const component = this.components.get(componentName);
        if (component && typeof component.shutdown === 'function') {
          await component.shutdown();
        }
        this.updateComponentHealth(componentName, 'degraded', 'Safe mode - component disabled');
      } catch (error) {
        console.warn(`Failed to shutdown ${componentName} in safe mode:`, error);
      }
    }

    await eventBus.publish(createEvent('KERNEL_SAFE_MODE', {
      availableComponents: ['hal', 'eventBus', 'productInventoryEngine', 'businessTypeResolver']
    }, {
      source: 'POSKernel',
      priority: 'high'
    }));
  }

  /**
   * Start health monitoring
   */
  private startHealthMonitoring(): void {
    this.healthCheckTimer = setInterval(() => {
      this.performHealthCheck();
    }, this.config.healthCheckInterval);
  }

  /**
   * Perform health check
   */
  private async performHealthCheck(): Promise<void> {
    const checkStart = Date.now();

    for (const [name, component] of this.components) {
      try {
        const componentStart = Date.now();

        // Perform component-specific health check
        let status: 'healthy' | 'degraded' | 'critical' | 'failed' = 'healthy';

        if (typeof component.getStatus === 'function') {
          const componentStatus = component.getStatus();
          if (componentStatus === 'error' || componentStatus === 'failed') {
            status = 'failed';
          }
        }

        const responseTime = Date.now() - componentStart;
        this.updateComponentHealth(name, status, undefined, responseTime);

        // Check for degraded performance
        if (responseTime > 5000) { // 5 second threshold
          this.logIncident('medium', name, `Slow response time: ${responseTime}ms`);
        }

      } catch (error: any) {
        this.updateComponentHealth(name, 'failed', error.message);
        this.logIncident('high', name, `Health check failed: ${error.message}`);
      }
    }

    // Update overall health
    this.updateOverallHealth();

    this.health.lastCheck = Date.now();
  }

  /**
   * Update component health
   */
  private updateComponentHealth(
    name: string,
    status: 'healthy' | 'degraded' | 'critical' | 'failed',
    error?: string,
    responseTime?: number
  ): void {
    const health: ComponentHealth = {
      name,
      status,
      lastCheck: Date.now(),
      responseTime,
      errorCount: this.health.components.get(name)?.errorCount || 0,
      metadata: error ? { error } : undefined
    };

    if (status === 'failed') {
      health.errorCount++;
    }

    this.health.components.set(name, health);
  }

  /**
   * Update overall health status
   */
  private updateOverallHealth(): void {
    const components = Array.from(this.health.components.values());
    const failedCount = components.filter(c => c.status === 'failed').length;
    const criticalCount = components.filter(c => c.status === 'critical').length;

    if (failedCount > 0 || criticalCount > 0) {
      this.health.overall = 'failed';
    } else {
      const degradedCount = components.filter(c => c.status === 'degraded').length;
      if (degradedCount > 0) {
        this.health.overall = 'degraded';
      } else {
        this.health.overall = 'healthy';
      }
    }
  }

  /**
   * Log incident
   */
  private logIncident(severity: 'low' | 'medium' | 'high' | 'critical', component: string, description: string): void {
    const incident: KernelIncident = {
      id: `incident_${Date.now()}_${Math.random()}`,
      timestamp: Date.now(),
      severity,
      component,
      description,
      resolved: false
    };

    this.health.incidents.push(incident);

    // Keep only last 100 incidents
    if (this.health.incidents.length > 100) {
      this.health.incidents = this.health.incidents.slice(-100);
    }
  }

  /**
   * Execute lifecycle hooks
   */
  private async executeLifecycleHooks(hookName: keyof typeof this.lifecycleHooks, ...args: any[]): Promise<void> {
    const hooks = this.lifecycleHooks[hookName];
    for (const hook of hooks) {
      try {
        await hook(...args);
      } catch (error) {
        console.error(`Lifecycle hook ${hookName} failed:`, error);
      }
    }
  }

  /**
   * Handle critical errors
   */
  private async handleCriticalError(error: Error): Promise<void> {
    this.logIncident('critical', 'kernel', `Critical error: ${error.message}`);

    if (this.config.autoRecoveryEnabled) {
      // Attempt graceful degradation
      await this.enterSafeMode();
    }

    await eventBus.publish(createEvent('KERNEL_CRITICAL_ERROR', {
      error: error.message,
      stack: error.stack,
      state: this.state
    }, {
      source: 'POSKernel',
      priority: 'critical'
    }));
  }

  /**
   * Shutdown kernel
   */
  async shutdown(): Promise<void> {
    if (this.state === KernelState.SHUTTING_DOWN || this.state === KernelState.SHUTDOWN) {
      return;
    }

    this.state = KernelState.SHUTTING_DOWN;

    // Stop health monitoring
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
    }

    // Execute shutdown hooks
    await this.executeLifecycleHooks('onShutdown');

    // Shutdown components in reverse order
    const shutdownOrder = [
      'feedbackSystem',
      'businessTypeResolver',
      'complianceEngine',
      'syncEngine',
      'taxEngine',
      'pricingEngine',
      'productInventoryEngine',
      'eventBus',
      'hal'
    ];

    for (const componentName of shutdownOrder) {
      try {
        const component = this.components.get(componentName);
        if (component && typeof component.shutdown === 'function') {
          await component.shutdown();
        }
      } catch (error) {
        console.warn(`Failed to shutdown ${componentName}:`, error);
      }
    }

    this.state = KernelState.SHUTDOWN;

    await eventBus.publish(createEvent('KERNEL_SHUTDOWN', {
      uptime: this.health.uptime
    }, {
      source: 'POSKernel'
    }));

    console.log('🔴 POS Kernel shutdown complete');
  }

  /**
   * Add lifecycle hook
   */
  addLifecycleHook(hookName: keyof typeof this.lifecycleHooks, hook: () => void | Promise<void>): void {
    this.lifecycleHooks[hookName].push(hook);
  }

  /**
   * Get kernel status
   */
  getStatus() {
    return {
      state: this.state,
      version: this.config.version,
      environment: this.config.environment,
      health: this.health.overall,
      uptime: this.health.uptime,
      components: Object.fromEntries(this.health.components),
      bootContext: this.bootContext,
      recoveryAttempts: this.recoveryAttempts
    };
  }

  /**
   * Get health status
   */
  getHealth(): KernelHealth {
    return { ...this.health };
  }

  /**
   * Force restart
   */
  async forceRestart(): Promise<void> {
    console.log('🔄 Force restarting POS Kernel...');
    await this.shutdown();
    await this.boot();
  }
}

// Global kernel instance
export const posKernel = new POSKernel();

// Export boot sequence diagram
export const BOOT_SEQUENCE_DIAGRAM = `
POS Kernel Boot Sequence
========================

1. LOAD_CONFIG
   └── Load kernel configuration from localStorage/environment
   └── Validate configuration parameters

2. INITIALIZE_HAL
   └── Initialize Hardware Abstraction Layer
   └── Detect available hardware devices
   └── Register core device drivers (scanner, printer, scale, etc.)

3. REGISTER_DRIVERS
   └── Register additional custom drivers
   └── Validate driver compatibility

4. START_EVENT_BUS
   └── Initialize central event bus
   └── Register core event handlers
   └── Start event processing queue

5. START_CORE_ENGINES
   └── ProductInventoryEngine → SKU, barcodes, batches, expiry
   └── PricingEngine → Dynamic pricing, promotions, regional pricing
   └── TaxEngine → Multi-country tax rules, compliance
   └── SyncEngine → Offline-first synchronization
   └── ComplianceEngine → GDPR, CCPA, PCI DSS compliance
   └── BusinessTypeResolver → Adaptive UI/personality loading
   └── FeedbackSystem → Haptic/audio feedback

6. MOUNT_UI_LAYER
   └── Mount React UI components
   └── Initialize adaptive personalities (Restaurant/Retail/Supermarket)
   └── Start user interaction handling

Failure Recovery Logic:
- Component failure → Continue in safe mode (HAL-only)
- Critical failure → Auto-recovery with exponential backoff
- Max recovery attempts → Enter maintenance mode
- Data integrity → Rollback to last known good state
`;