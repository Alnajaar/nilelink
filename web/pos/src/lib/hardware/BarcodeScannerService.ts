/**
 * Barcode Scanner Service - Hardware Integration for Supermarket Scanning
 * 
 * Provides realistic barcode scanning simulation with hardware-like behavior
 * Supports various barcode formats and scanning workflows
 */

import { EventEmitter } from 'events';

export interface BarcodeScanResult {
    code: string;
    format: BarcodeFormat;
    timestamp: number;
    rawData: string;
    isValid: boolean;
    productInfo?: {
        productId: string;
        productName: string;
        price: number;
        category: string;
    };
}

export type BarcodeFormat = 
    | 'UPC-A'
    | 'UPC-E'
    | 'EAN-8'
    | 'EAN-13'
    | 'CODE-39'
    | 'CODE-128'
    | 'ITF'
    | 'QR_CODE'
    | 'DATA_MATRIX';

export interface ScannerConfig {
    enabled: boolean;
    autoFocus: boolean;
    soundEnabled: boolean;
    vibrationEnabled: boolean;
    continuousMode: boolean;
    timeout: number; // ms
    supportedFormats: BarcodeFormat[];
}

export class BarcodeScannerService extends EventEmitter {
    private config: ScannerConfig;
    private isScanning: boolean = false;
    private scanTimeout: NodeJS.Timeout | null = null;
    private inputBuffer: string = '';
    private lastScanTime: number = 0;
    private mockProducts: Map<string, any>;

    constructor() {
        super();
        this.config = {
            enabled: true,
            autoFocus: true,
            soundEnabled: true,
            vibrationEnabled: true,
            continuousMode: false,
            timeout: 30000,
            supportedFormats: [
                'UPC-A', 'UPC-E', 'EAN-8', 'EAN-13', 
                'CODE-39', 'CODE-128', 'ITF'
            ]
        };

        // Mock product database for demonstration
        this.mockProducts = new Map([
            ['123456789012', {
                productId: 'prod_001',
                productName: 'Organic Bananas',
                price: 2.99,
                category: 'Produce',
                barcode: '123456789012'
            }],
            ['234567890123', {
                productId: 'prod_002',
                productName: 'Whole Milk 1L',
                price: 3.49,
                category: 'Dairy',
                barcode: '234567890123'
            }],
            ['345678901234', {
                productId: 'prod_003',
                productName: 'White Bread',
                price: 2.29,
                category: 'Bakery',
                barcode: '345678901234'
            }],
            ['456789012345', {
                productId: 'prod_004',
                productName: 'Ground Beef 1lb',
                price: 5.99,
                category: 'Meat',
                barcode: '456789012345'
            }],
            ['567890123456', {
                productId: 'prod_005',
                productName: 'Apple Juice 64oz',
                price: 3.79,
                category: 'Beverages',
                barcode: '567890123456'
            }]
        ]);

        this.setupKeyboardCapture();
    }

    /**
     * Initialize scanner hardware (simulated)
     */
    async initialize(): Promise<boolean> {
        try {
            console.log('🔍 Initializing barcode scanner...');
            
            // Simulate hardware initialization
            await new Promise(resolve => setTimeout(resolve, 500));
            
            this.emit('scanner.initialized', {
                supportedFormats: this.config.supportedFormats
            });
            
            return true;
        } catch (error) {
            console.error('Failed to initialize scanner:', error);
            this.emit('scanner.error', { error: 'Initialization failed' });
            return false;
        }
    }

    /**
     * Start scanning session
     */
    startScanning(): boolean {
        if (!this.config.enabled) {
            console.warn('Scanner is disabled');
            return false;
        }

        if (this.isScanning) {
            console.warn('Scanner already active');
            return false;
        }

        this.isScanning = true;
        this.inputBuffer = '';
        this.lastScanTime = Date.now();
        
        if (this.config.timeout > 0) {
            this.scanTimeout = setTimeout(() => {
                this.stopScanning();
            }, this.config.timeout);
        }

        this.emit('scanner.started');
        console.log('🔍 Scanner activated - ready for barcode input');
        return true;
    }

    /**
     * Stop scanning session
     */
    stopScanning(): void {
        this.isScanning = false;
        
        if (this.scanTimeout) {
            clearTimeout(this.scanTimeout);
            this.scanTimeout = null;
        }

        if (this.inputBuffer) {
            // Process any remaining input as incomplete scan
            this.emit('scanner.timeout', {
                partialInput: this.inputBuffer,
                duration: Date.now() - this.lastScanTime
            });
            this.inputBuffer = '';
        }

        this.emit('scanner.stopped');
        console.log('⏹️ Scanner deactivated');
    }

    /**
     * Simulate barcode scan (for testing/demo)
     */
    simulateScan(barcode: string, format: BarcodeFormat = 'UPC-A'): void {
        if (!this.isScanning) {
            console.warn('Scanner not active - cannot simulate scan');
            return;
        }

        const result: BarcodeScanResult = {
            code: barcode,
            format,
            timestamp: Date.now(),
            rawData: barcode,
            isValid: this.validateBarcode(barcode, format)
        };

        if (result.isValid) {
            // Look up product information
            const product = this.mockProducts.get(barcode);
            if (product) {
                result.productInfo = {
                    productId: product.productId,
                    productName: product.productName,
                    price: product.price,
                    category: product.category
                };
            }
        }

        this.processScanResult(result);
    }

    /**
     * Process keyboard input as barcode scans
     */
    private setupKeyboardCapture(): void {
        if (typeof window === 'undefined') return;

        const handleKeyDown = (event: KeyboardEvent) => {
            if (!this.isScanning || !this.config.enabled) return;

            // Handle Enter key as scan completion
            if (event.key === 'Enter') {
                event.preventDefault();
                this.completeScan();
                return;
            }

            // Handle Escape key as scan cancellation
            if (event.key === 'Escape') {
                event.preventDefault();
                this.cancelScan();
                return;
            }

            // Capture numeric and common barcode characters
            const validChars = /^[0-9]$/;
            if (validChars.test(event.key)) {
                event.preventDefault();
                this.inputBuffer += event.key;
                
                // Reset timeout on input
                if (this.scanTimeout) {
                    clearTimeout(this.scanTimeout);
                    this.scanTimeout = setTimeout(() => {
                        this.stopScanning();
                    }, this.config.timeout);
                }

                this.emit('scanner.input', {
                    char: event.key,
                    bufferLength: this.inputBuffer.length
                });
            }
        };

        window.addEventListener('keydown', handleKeyDown);
    }

    /**
     * Complete current scan
     */
    private completeScan(): void {
        if (!this.inputBuffer) {
            console.warn('No barcode data to process');
            return;
        }

        const barcode = this.inputBuffer.trim();
        const format = this.detectFormat(barcode);
        
        this.simulateScan(barcode, format);
        this.inputBuffer = '';

        if (!this.config.continuousMode) {
            this.stopScanning();
        }
    }

    /**
     * Cancel current scan
     */
    private cancelScan(): void {
        this.inputBuffer = '';
        this.emit('scanner.cancelled');
        
        if (!this.config.continuousMode) {
            this.stopScanning();
        }
    }

    /**
     * Process scan result
     */
    private processScanResult(result: BarcodeScanResult): void {
        console.log(`📱 Scanned: ${result.code} (${result.format})`);

        // Play sound if enabled
        if (this.config.soundEnabled) {
            this.playBeepSound();
        }

        // Vibrate if enabled
        if (this.config.vibrationEnabled && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
            navigator.vibrate([100]);
        }

        this.emit('scanner.scanned', result);

        if (!result.isValid) {
            this.emit('scanner.invalid', result);
        } else if (result.productInfo) {
            this.emit('scanner.product.found', result);
        } else {
            this.emit('scanner.product.notfound', result);
        }
    }

    /**
     * Validate barcode format
     */
    private validateBarcode(code: string, format: BarcodeFormat): boolean {
        switch (format) {
            case 'UPC-A':
                return /^\d{12}$/.test(code);
            case 'UPC-E':
                return /^\d{6,8}$/.test(code);
            case 'EAN-8':
                return /^\d{8}$/.test(code);
            case 'EAN-13':
                return /^\d{13}$/.test(code);
            case 'CODE-39':
                return /^[A-Z0-9\-.$/+% ]+$/.test(code.toUpperCase());
            case 'CODE-128':
                return /^[\x00-\x7F]+$/.test(code); // ASCII characters
            case 'ITF':
                return /^\d+$/.test(code) && code.length % 2 === 0;
            default:
                return code.length > 0;
        }
    }

    /**
     * Detect barcode format from code
     */
    private detectFormat(code: string): BarcodeFormat {
        if (/^\d{12}$/.test(code)) return 'UPC-A';
        if (/^\d{13}$/.test(code)) return 'EAN-13';
        if (/^\d{8}$/.test(code)) return 'EAN-8';
        if (/^\d{6,8}$/.test(code)) return 'UPC-E';
        if (/^[A-Z0-9\-.$/+% ]+$/i.test(code)) return 'CODE-39';
        if (/^[\x00-\x7F]+$/.test(code)) return 'CODE-128';
        if (/^\d+$/ && code.length % 2 === 0) return 'ITF';
        return 'CODE-128'; // Default fallback
    }

    /**
     * Play beep sound on successful scan
     */
    private playBeepSound(): void {
        try {
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 1200;
            oscillator.type = 'square';
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1);
        } catch (error) {
            // Silent fail - audio might not be available
        }
    }

    /**
     * Configure scanner settings
     */
    configure(settings: Partial<ScannerConfig>): void {
        this.config = { ...this.config, ...settings };
        this.emit('scanner.config.changed', this.config);
    }

    /**
     * Get current configuration
     */
    getConfig(): ScannerConfig {
        return { ...this.config };
    }

    /**
     * Check if scanner is currently active
     */
    isCurrentlyScanning(): boolean {
        return this.isScanning;
    }

    /**
     * Get mock product by barcode (for testing)
     */
    getProductByBarcode(barcode: string): any {
        return this.mockProducts.get(barcode);
    }

    /**
     * Add mock product (for testing)
     */
    addMockProduct(barcode: string, product: any): void {
        this.mockProducts.set(barcode, {
            ...product,
            barcode
        });
    }

    /**
     * Get scanner status
     */
    getStatus(): {
        enabled: boolean;
        scanning: boolean;
        supportedFormats: BarcodeFormat[];
        mockProducts: number;
    } {
        return {
            enabled: this.config.enabled,
            scanning: this.isScanning,
            supportedFormats: [...this.config.supportedFormats],
            mockProducts: this.mockProducts.size
        };
    }
}

// Singleton instance
let barcodeScannerService: BarcodeScannerService | null = null;

export function getBarcodeScannerService(): BarcodeScannerService {
    if (!barcodeScannerService) {
        barcodeScannerService = new BarcodeScannerService();
    }
    return barcodeScannerService;
}