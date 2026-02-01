// Hardware Abstraction Layer (HAL) - Universal Hardware Interface
// Provides unified API for all POS hardware devices

import { eventBus } from './EventBus';

export enum HardwareType {
  SCANNER = 'scanner',
  PRINTER = 'printer',
  SCALE = 'scale',
  CASH_DRAWER = 'cash_drawer',
  CARD_READER = 'card_reader',
  CAMERA = 'camera',
  RFID_READER = 'rfid_reader',
  NFC_READER = 'nfc_reader',
  DISPLAY = 'display',
  KEYPAD = 'keypad',
  ALARM = 'alarm',
  WEIGHT_SENSOR = 'weight_sensor',
  EAS_GATE = 'eas_gate'
}

export enum ConnectionType {
  USB = 'usb',
  SERIAL = 'serial',
  BLUETOOTH = 'bluetooth',
  WIFI = 'wifi',
  ETHERNET = 'ethernet',
  GPIO = 'gpio',
  CAMERA = 'camera'
}

export enum HardwareStatus {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  ERROR = 'error',
  BUSY = 'busy'
}

export interface HardwareDevice {
  id: string;
  type: HardwareType;
  name: string;
  manufacturer: string;
  model: string;
  connectionType: ConnectionType;
  status: HardwareStatus;
  config: Record<string, any>;
  capabilities: string[];
  lastSeen?: number;
  error?: string;
}

export interface HardwareDriver {
  type: HardwareType;
  name: string;
  version: string;

  // Device detection and connection
  detectDevices(): Promise<HardwareDevice[]>;
  connect(device: HardwareDevice): Promise<boolean>;
  disconnect(deviceId: string): Promise<void>;

  // Device operations
  sendCommand(deviceId: string, command: string, params?: any): Promise<any>;
  readData(deviceId: string): Promise<any>;

  // Event handling
  onData?(deviceId: string, callback: (data: any) => void): void;
  onError?(deviceId: string, callback: (error: Error) => void): void;
}

export interface HardwareAdapter {
  driver: HardwareDriver;
  device: HardwareDevice;
  isActive: boolean;

  initialize(): Promise<void>;
  shutdown(): Promise<void>;
  execute(operation: string, params?: any): Promise<any>;
}

class HardwareManager {
  private drivers: Map<HardwareType, HardwareDriver> = new Map();
  private adapters: Map<string, HardwareAdapter> = new Map();
  private devices: Map<string, HardwareDevice> = new Map();
  private autoDetectInterval?: NodeJS.Timeout;
  private isInitialized = false;

  constructor() {
    this.registerCoreDrivers();
    if (typeof window !== 'undefined') {
      this.startAutoDetection();
    }
  }

  /**
   * Register a hardware driver
   */
  registerDriver(driver: HardwareDriver): void {
    this.drivers.set(driver.type, driver);
    console.log(`HAL: Registered driver ${driver.name} v${driver.version} for ${driver.type}`);
  }

  /**
   * Get all registered devices
   */
  getDevices(type?: HardwareType): HardwareDevice[] {
    const allDevices = Array.from(this.devices.values());

    if (type) {
      return allDevices.filter(device => device.type === type);
    }

    return allDevices;
  }

  /**
   * Get device by ID
   */
  getDevice(deviceId: string): HardwareDevice | null {
    return this.devices.get(deviceId) || null;
  }

  /**
   * Connect to a hardware device
   */
  async connectDevice(deviceId: string): Promise<boolean> {
    const device = this.devices.get(deviceId);
    if (!device) {
      throw new Error(`Device ${deviceId} not found`);
    }

    const driver = this.drivers.get(device.type);
    if (!driver) {
      throw new Error(`No driver available for device type ${device.type}`);
    }

    try {
      device.status = HardwareStatus.CONNECTING;
      this.devices.set(deviceId, device);

      const connected = await driver.connect(device);
      if (connected) {
        device.status = HardwareStatus.CONNECTED;
        device.lastSeen = Date.now();
        this.devices.set(deviceId, device);

        // Create adapter
        const adapter: HardwareAdapter = {
          driver,
          device,
          isActive: true,
          initialize: async () => {
            if (driver.onData) {
              driver.onData(deviceId, (data) => {
                eventBus.publish({
                  type: `HARDWARE_DATA_${device.type.toUpperCase()}`,
                  source: 'HAL',
                  payload: { deviceId, data },
                  metadata: {
                    branchId: 'current-branch',
                    priority: 'normal'
                  }
                });
              });
            }

            if (driver.onError) {
              driver.onError(deviceId, (error) => {
                eventBus.publish({
                  type: 'HARDWARE_ERROR',
                  source: 'HAL',
                  payload: { deviceId, error: error.message },
                  metadata: {
                    branchId: 'current-branch',
                    priority: 'high'
                  }
                });
              });
            }
          },
          shutdown: async () => {
            adapter.isActive = false;
            await driver.disconnect(deviceId);
          },
          execute: async (operation: string, params?: any) => {
            return await driver.sendCommand(deviceId, operation, params);
          }
        };

        this.adapters.set(deviceId, adapter);
        await adapter.initialize();

        eventBus.publish({
          type: 'HARDWARE_CONNECTED',
          source: 'HAL',
          payload: { deviceId, device },
          metadata: {
            branchId: 'current-branch',
            priority: 'normal'
          }
        });

        return true;
      }

      device.status = HardwareStatus.ERROR;
      device.error = 'Connection failed';
      this.devices.set(deviceId, device);
      return false;

    } catch (error: any) {
      device.status = HardwareStatus.ERROR;
      device.error = error.message;
      this.devices.set(deviceId, device);

      eventBus.publish({
        type: 'HARDWARE_ERROR',
        source: 'HAL',
        payload: { deviceId, error: error.message },
        metadata: {
          branchId: 'current-branch',
          priority: 'high'
        }
      });

      return false;
    }
  }

  /**
   * Disconnect from a hardware device
   */
  async disconnectDevice(deviceId: string): Promise<void> {
    const adapter = this.adapters.get(deviceId);
    if (adapter) {
      await adapter.shutdown();
      this.adapters.delete(deviceId);
    }

    const device = this.devices.get(deviceId);
    if (device) {
      device.status = HardwareStatus.DISCONNECTED;
      device.lastSeen = Date.now();
      this.devices.set(deviceId, device);

      eventBus.publish({
        type: 'HARDWARE_DISCONNECTED',
        source: 'HAL',
        payload: { deviceId },
        metadata: {
          branchId: 'current-branch',
          priority: 'normal'
        }
      });
    }
  }

  /**
   * Execute operation on hardware device
   */
  async executeOnDevice(deviceId: string, operation: string, params?: any): Promise<any> {
    const adapter = this.adapters.get(deviceId);
    if (!adapter || !adapter.isActive) {
      throw new Error(`Device ${deviceId} not connected or not active`);
    }

    return await adapter.execute(operation, params);
  }

  /**
   * Auto-detect available hardware devices
   */
  private async autoDetectDevices(): Promise<void> {
    if (!this.isInitialized) return;

    for (const [type, driver] of this.drivers) {
      try {
        const detectedDevices = await driver.detectDevices();

        for (const device of detectedDevices) {
          if (!this.devices.has(device.id)) {
            device.status = HardwareStatus.DISCONNECTED;
            this.devices.set(device.id, device);

            eventBus.publish({
              type: 'HARDWARE_DETECTED',
              source: 'HAL',
              payload: { device },
              metadata: {
                branchId: 'current-branch',
                priority: 'low'
              }
            });
          }
        }
      } catch (error) {
        console.warn(`HAL: Failed to auto-detect ${type} devices:`, error);
      }
    }
  }

  /**
   * Start auto-detection of hardware devices
   */
  private startAutoDetection(): void {
    this.autoDetectInterval = setInterval(() => {
      this.autoDetectDevices();
    }, 5000); // Check every 5 seconds
  }

  /**
   * Register core hardware drivers
   */
  private registerCoreDrivers(): void {
    // Scanner Driver
    this.registerDriver({
      type: HardwareType.SCANNER,
      name: 'Universal Scanner Driver',
      version: '1.0.0',

      async detectDevices(): Promise<HardwareDevice[]> {
        // In a real implementation, this would scan for USB/serial devices
        // For now, return mock devices based on browser capabilities
        const devices: HardwareDevice[] = [];

        // Camera-based scanner (available on most devices)
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          devices.push({
            id: 'camera_scanner_001',
            type: HardwareType.SCANNER,
            name: 'Camera Barcode Scanner',
            manufacturer: 'Built-in',
            model: 'Camera API',
            connectionType: ConnectionType.CAMERA,
            status: HardwareStatus.DISCONNECTED,
            config: {},
            capabilities: ['barcode', 'qr_code', 'continuous_scan']
          });
        }

        return devices;
      },

      async connect(device: HardwareDevice): Promise<boolean> {
        // Simulate connection delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        return true;
      },

      async disconnect(deviceId: string): Promise<void> {
        // Cleanup resources
      },

      async sendCommand(deviceId: string, command: string, params?: any): Promise<any> {
        // Handle scanner commands
        switch (command) {
          case 'start_scan':
            // In real implementation, activate camera/USB scanner
            return { status: 'scanning' };
          case 'stop_scan':
            return { status: 'stopped' };
          default:
            throw new Error(`Unknown command: ${command}`);
        }
      },

      async readData(deviceId: string): Promise<any> {
        // Return mock scanned data
        return {
          type: 'barcode',
          data: '123456789012',
          timestamp: Date.now()
        };
      }
    });

    // Printer Driver
    this.registerDriver({
      type: HardwareType.PRINTER,
      name: 'Universal Printer Driver',
      version: '1.0.0',

      async detectDevices(): Promise<HardwareDevice[]> {
        // Detect available printers
        return [{
          id: 'system_printer_001',
          type: HardwareType.PRINTER,
          name: 'System Printer',
          manufacturer: 'System',
          model: 'Default',
          connectionType: ConnectionType.USB,
          status: HardwareStatus.DISCONNECTED,
          config: { dpi: 203, width: 80 },
          capabilities: ['receipt', 'label', 'cut_paper']
        }];
      },

      async connect(device: HardwareDevice): Promise<boolean> {
        await new Promise(resolve => setTimeout(resolve, 500));
        return true;
      },

      async disconnect(deviceId: string): Promise<void> {
        // Cleanup
      },

      async sendCommand(deviceId: string, command: string, params?: any): Promise<any> {
        switch (command) {
          case 'print_receipt':
            console.log('HAL: Printing receipt:', params);
            return { status: 'printed', jobId: Date.now() };
          case 'cut_paper':
            return { status: 'cut' };
          default:
            throw new Error(`Unknown command: ${command}`);
        }
      },

      async readData(deviceId: string): Promise<any> {
        return { status: 'ready' };
      }
    });

    // Scale Driver
    this.registerDriver({
      type: HardwareType.SCALE,
      name: 'Digital Scale Driver',
      version: '1.0.0',

      async detectDevices(): Promise<HardwareDevice[]> {
        return [{
          id: 'scale_001',
          type: HardwareType.SCALE,
          name: 'Digital Scale',
          manufacturer: 'Generic',
          model: 'WeightMaster 2000',
          connectionType: ConnectionType.SERIAL,
          status: HardwareStatus.DISCONNECTED,
          config: { maxWeight: 50, precision: 0.01 },
          capabilities: ['weight', 'tare', 'zero']
        }];
      },

      async connect(device: HardwareDevice): Promise<boolean> {
        await new Promise(resolve => setTimeout(resolve, 800));
        return true;
      },

      async disconnect(deviceId: string): Promise<void> {
        // Cleanup
      },

      async sendCommand(deviceId: string, command: string, params?: any): Promise<any> {
        switch (command) {
          case 'tare':
            return { status: 'tared' };
          case 'zero':
            return { status: 'zeroed' };
          case 'read_weight':
            return {
              weight: Math.random() * 10, // Mock weight
              unit: 'kg',
              stable: true
            };
          default:
            throw new Error(`Unknown command: ${command}`);
        }
      },

      async readData(deviceId: string): Promise<any> {
        return {
          weight: Math.random() * 5,
          unit: 'kg',
          timestamp: Date.now()
        };
      }
    });
  }

  /**
   * Initialize HAL
   */
  initialize(): void {
    this.isInitialized = true;
    eventBus.publish({
      type: 'SYSTEM_STARTUP',
      source: 'HAL',
      payload: { component: 'HAL', status: 'initialized' },
      metadata: { priority: 'high' }
    });
  }

  /**
   * Shutdown HAL
   */
  async shutdown(): Promise<void> {
    if (this.autoDetectInterval) {
      clearInterval(this.autoDetectInterval);
    }

    // Disconnect all devices
    for (const deviceId of this.adapters.keys()) {
      await this.disconnectDevice(deviceId);
    }

    this.isInitialized = false;
  }
}

// Global HAL instance
export const hal = new HardwareManager();

// Initialize HAL when module loads
if (typeof window !== 'undefined') {
  hal.initialize();
}