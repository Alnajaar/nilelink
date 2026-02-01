/**
 * NileLink Universal Hardware Abstraction Layer (HAL)
 * 
 * Standardizes communication with retail hardware across different protocols:
 * - USB HID (WebUSB)
 * - Serial/COM (WebSerial)
 * - Network (TCP/UDP)
 * - Virtual/Simulation
 */

export enum HALDeviceType {
    SCANNER = 'scanner',
    PRINTER = 'printer',
    SCALE = 'scale',
    RFID_READER = 'rfid_reader',
    GATE = 'gate'
}

export enum HALProtocol {
    USB_HID = 'usb_hid',
    SERIAL = 'serial',
    NETWORK = 'network',
    VIRTUAL = 'virtual'
}

export interface HALDeviceInfo {
    id: string;
    type: HALDeviceType;
    protocol: HALProtocol;
    name: string;
    manufacturer?: string;
    productId?: string;
    vendorId?: string;
    address?: string; // IP or COM port
}

export interface HALDeviceStatus {
    isOnline: boolean;
    isReady: boolean;
    error?: string;
    lastSeen: number;
}

/**
 * Base Driver Interface
 */
export interface IHALDriver {
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    send(data: Uint8Array | string): Promise<void>;
    onData(callback: (data: Uint8Array | string) => void): void;
    getStatus(): Promise<HALDeviceStatus>;
}

/**
 * Scanner Specific Interface
 */
export interface IScannerHAL extends IHALDriver {
    setBeep(enabled: boolean): Promise<void>;
    enableScanning(): Promise<void>;
    disableScanning(): Promise<void>;
}

/**
 * Printer Specific Interface (ESC/POS)
 */
export interface IPrinterHAL extends IHALDriver {
    cutPaper(): Promise<void>;
    openDrawer(): Promise<void>;
    getPaperStatus(): Promise<'normal' | 'low' | 'empty'>;
}

/**
 * Scale Specific Interface
 */
export interface IWeightScaleHAL extends IHALDriver {
    getWeight(): Promise<number>;
    zeroScale(): Promise<void>;
    tareScale(): Promise<void>;
}

/**
 * RFID Reader Specific Interface
 */
export interface IRFIDReaderHAL extends IHALDriver {
    inventoryTags(): Promise<string[]>;
    writeTag(id: string, data: string): Promise<void>;
}

/**
 * Virtual Driver for Simulation & Testing
 */
export class VirtualDriver implements IHALDriver {
    protected status: HALDeviceStatus = { isOnline: true, isReady: true, lastSeen: Date.now() };
    protected dataCallback: ((data: Uint8Array | string) => void) | null = null;

    async connect(): Promise<void> {
        this.status.isOnline = true;
        this.status.lastSeen = Date.now();
        console.log(`[HAL] Virtual device connected.`);
    }

    async disconnect(): Promise<void> {
        this.status.isOnline = false;
        console.log(`[HAL] Virtual device disconnected.`);
    }

    async send(data: Uint8Array | string): Promise<void> {
        console.log(`[HAL] Virtual device received:`, data);
    }

    onData(callback: (data: Uint8Array | string) => void): void {
        this.dataCallback = callback;
    }

    async getStatus(): Promise<HALDeviceStatus> {
        return { ...this.status, lastSeen: Date.now() };
    }

    // Simulation helper
    simulateData(data: Uint8Array | string): void {
        if (this.dataCallback) {
            this.dataCallback(data);
        }
    }
}

/**
 * Virtual Scanner Driver
 */
export class VirtualScannerDriver extends VirtualDriver implements IScannerHAL {
    async setBeep(enabled: boolean): Promise<void> {
        console.log(`[HAL] Scanner beep: ${enabled}`);
    }

    async enableScanning(): Promise<void> {
        console.log(`[HAL] Scanner enabled.`);
    }

    async disableScanning(): Promise<void> {
        console.log(`[HAL] Scanner disabled.`);
    }
}

/**
 * Virtual Printer Driver
 */
export class VirtualPrinterDriver extends VirtualDriver implements IPrinterHAL {
    async cutPaper(): Promise<void> {
        console.log(`[HAL] Printer: Cutting paper...`);
    }

    async openDrawer(): Promise<void> {
        console.log(`[HAL] Printer: Opening cash drawer...`);
    }

    async getPaperStatus(): Promise<'normal' | 'low' | 'empty'> {
        return 'normal';
    }
}

/**
 * Virtual Scale Driver
 */
export class VirtualScaleDriver extends VirtualDriver implements IWeightScaleHAL {
    async getWeight(): Promise<number> {
        return 0.5 + Math.random() * 2.0; // Random weight for simulation
    }

    async zeroScale(): Promise<void> {
        console.log(`[HAL] Scale: Zeroed.`);
    }

    async tareScale(): Promise<void> {
        console.log(`[HAL] Scale: Tared.`);
    }
}

/**
 * Virtual RFID Reader Driver
 */
export class VirtualRFIDDriver extends VirtualDriver implements IRFIDReaderHAL {
    async inventoryTags(): Promise<string[]> {
        return ['TAG_001', 'TAG_002', 'TAG_003'];
    }

    async writeTag(id: string, data: string): Promise<void> {
        console.log(`[HAL] RFID: Wrote ${data} to tag ${id}`);
    }
}
