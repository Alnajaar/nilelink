/**
 * NileLink Print Router
 *
 * Intelligent multi-printer routing system for retail operations:
 * - Printer classification and capabilities management
 * - Intelligent routing to cashier, kitchen, and manager printers
 * - Kitchen printer filtering (food items only, station sorting)
 * - Offline print queuing and automatic failover
 * - Print job prioritization and optimization
 */

import { EventEngine } from '../events/EventEngine';
import { LocalLedger } from '../storage/LocalLedger';
import { AlertManager } from '../security/AlertManager';
import { EventType } from '../events/types';
import { IPrinterHAL, VirtualPrinterDriver } from './hal/HAL';
import { v4 as uuidv4 } from 'uuid';

export enum PrinterType {
    CASHIER_RECEIPT = 'cashier_receipt',
    CASHIER_REFUND = 'cashier_refund',
    KITCHEN_ORDER = 'kitchen_order',
    KITCHEN_PREP = 'kitchen_prep',
    MANAGER_REPORT = 'manager_report',
    MANAGER_RECEIPT = 'manager_receipt'
}

export enum KitchenStation {
    GRILL = 'grill',
    FRYER = 'fryer',
    SALAD = 'salad',
    DRINKS = 'drinks',
    DESSERT = 'dessert',
    ALL = 'all'
}

export interface PrinterDevice {
    id: string;
    name: string;
    type: 'thermal' | 'impact' | 'laser';
    location: string; // "cashier_1", "kitchen_grill", "manager_office"
    supportedTypes: PrinterType[];
    capabilities: PrinterCapabilities;
    status: PrinterStatus;
    lastSeen: number;
    config: PrinterConfig;
    hal: IPrinterHAL; // Standardized hardware driver
}

export interface PrinterCapabilities {
    paperWidth: number; // mm
    supportsColor: boolean;
    supportsGraphics: boolean;
    maxCharsPerLine: number;
    supportsCut: boolean;
    duplexPrinting: boolean;
}

export interface PrinterStatus {
    isOnline: boolean;
    isReady: boolean;
    paperLow: boolean;
    errorMessage?: string;
    queueLength: number;
    lastPrintTime?: number;
}

export interface PrinterConfig {
    timeout: number;
    retries: number;
    priority: number;
    kitchenStations?: KitchenStation[];
    autoCut: boolean;
    logoPrinting: boolean;
}

export interface PrintJob {
    id: string;
    type: PrinterType;
    printerId?: string; // Auto-assigned if not specified
    data: PrintData;
    priority: 'low' | 'normal' | 'high' | 'urgent';
    createdAt: number;
    status: 'queued' | 'printing' | 'completed' | 'failed';
    retryCount: number;
    maxRetries: number;
    transactionId?: string;
    errorMessage?: string;
}

export interface PrintData {
    // Receipt/order data
    header?: ReceiptHeader;
    items?: PrintItem[];
    totals?: ReceiptTotals;
    footer?: ReceiptFooter;

    // Report data
    reportData?: any;

    // Raw text/graphics
    rawText?: string;
    graphics?: PrintGraphic[];
}

export interface ReceiptHeader {
    storeName: string;
    storeAddress: string;
    transactionId: string;
    dateTime: string;
    cashierName?: string;
    customerInfo?: string;
}

export interface PrintItem {
    name: string;
    quantity: number;
    price: number;
    total: number;
    modifiers?: string[];
    isFoodItem: boolean;
    kitchenStation?: KitchenStation;
    specialInstructions?: string;
}

export interface ReceiptTotals {
    subtotal: number;
    tax: number;
    discount?: number;
    total: number;
    paymentMethod?: string;
    change?: number;
}

export interface ReceiptFooter {
    thankYouMessage: string;
    barcode?: string;
    qrCode?: string;
    loyaltyInfo?: string;
}

export interface PrintGraphic {
    type: 'logo' | 'barcode' | 'qrcode' | 'line' | 'text';
    data: any;
    position: { x: number; y: number };
    size?: { width: number; height: number };
}

export class PrintRouter {
    private eventEngine: EventEngine;
    private ledger: LocalLedger;
    private alertManager: AlertManager;
    private printers = new Map<string, PrinterDevice>();
    private printQueue: PrintJob[] = [];
    private activeJobs = new Map<string, PrintJob>();

    // Configuration
    private readonly MAX_QUEUE_SIZE = 1000;
    private readonly PRINT_TIMEOUT = 30000; // 30 seconds
    private readonly MAX_RETRIES = 3;

    constructor(
        eventEngine: EventEngine,
        ledger: LocalLedger,
        alertManager: AlertManager
    ) {
        this.eventEngine = eventEngine;
        this.ledger = ledger;
        this.alertManager = alertManager;
        this.initializePrinters();
        this.startPrintProcessor();
    }

    /**
     * Initialize printer devices
     */
    private async initializePrinters(): Promise<void> {
        // Initialize default printers
        const defaultPrinters: PrinterDevice[] = [
            {
                id: 'printer_cashier_1',
                name: 'Cashier Printer 1',
                type: 'thermal',
                location: 'cashier_1',
                supportedTypes: [PrinterType.CASHIER_RECEIPT, PrinterType.CASHIER_REFUND],
                capabilities: {
                    paperWidth: 80,
                    supportsColor: false,
                    supportsGraphics: true,
                    maxCharsPerLine: 48,
                    supportsCut: true,
                    duplexPrinting: false
                },
                status: {
                    isOnline: true,
                    isReady: true,
                    paperLow: false,
                    queueLength: 0
                },
                lastSeen: Date.now(),
                config: {
                    timeout: this.PRINT_TIMEOUT,
                    retries: this.MAX_RETRIES,
                    priority: 1,
                    autoCut: true,
                    logoPrinting: true
                },
                hal: new VirtualPrinterDriver()
            },
            {
                id: 'printer_kitchen_grill',
                name: 'Kitchen Grill Printer',
                type: 'thermal',
                location: 'kitchen_grill',
                supportedTypes: [PrinterType.KITCHEN_ORDER],
                capabilities: {
                    paperWidth: 80,
                    supportsColor: false,
                    supportsGraphics: false,
                    maxCharsPerLine: 48,
                    supportsCut: true,
                    duplexPrinting: false
                },
                status: {
                    isOnline: true,
                    isReady: true,
                    paperLow: false,
                    queueLength: 0
                },
                lastSeen: Date.now(),
                config: {
                    timeout: this.PRINT_TIMEOUT,
                    retries: this.MAX_RETRIES,
                    priority: 2,
                    kitchenStations: [KitchenStation.GRILL],
                    autoCut: true,
                    logoPrinting: false
                },
                hal: new VirtualPrinterDriver()
            },
            {
                id: 'printer_kitchen_drinks',
                name: 'Kitchen Drinks Printer',
                type: 'thermal',
                location: 'kitchen_drinks',
                supportedTypes: [PrinterType.KITCHEN_ORDER],
                capabilities: {
                    paperWidth: 80,
                    supportsColor: false,
                    supportsGraphics: false,
                    maxCharsPerLine: 48,
                    supportsCut: true,
                    duplexPrinting: false
                },
                status: {
                    isOnline: true,
                    isReady: true,
                    paperLow: false,
                    queueLength: 0
                },
                lastSeen: Date.now(),
                config: {
                    timeout: this.PRINT_TIMEOUT,
                    retries: this.MAX_RETRIES,
                    priority: 2,
                    kitchenStations: [KitchenStation.DRINKS],
                    autoCut: true,
                    logoPrinting: false
                },
                hal: new VirtualPrinterDriver()
            },
            {
                id: 'printer_manager',
                name: 'Manager Printer',
                type: 'laser',
                location: 'manager_office',
                supportedTypes: [PrinterType.MANAGER_REPORT, PrinterType.MANAGER_RECEIPT],
                capabilities: {
                    paperWidth: 210, // A4 width
                    supportsColor: true,
                    supportsGraphics: true,
                    maxCharsPerLine: 80,
                    supportsCut: false,
                    duplexPrinting: true
                },
                status: {
                    isOnline: true,
                    isReady: true,
                    paperLow: false,
                    queueLength: 0
                },
                lastSeen: Date.now(),
                config: {
                    timeout: this.PRINT_TIMEOUT * 2, // Longer timeout for reports
                    retries: this.MAX_RETRIES,
                    priority: 3,
                    autoCut: false,
                    logoPrinting: true
                },
                hal: new VirtualPrinterDriver()
            }
        ];

        for (const printer of defaultPrinters) {
            this.printers.set(printer.id, printer);
            printer.hal.connect(); // Connect via HAL
        }

        console.log('✅ Print Router initialized with', this.printers.size, 'printers');
    }

    /**
     * Queue a print job
     */
    async queuePrintJob(
        type: PrinterType,
        data: PrintData,
        priority: 'low' | 'normal' | 'high' | 'urgent' = 'normal',
        transactionId?: string,
        specificPrinterId?: string
    ): Promise<string> {
        const job: PrintJob = {
            id: uuidv4(),
            type,
            printerId: specificPrinterId,
            data,
            priority,
            createdAt: Date.now(),
            status: 'queued',
            retryCount: 0,
            maxRetries: this.MAX_RETRIES,
            transactionId
        };

        // Auto-assign printer if not specified
        if (!job.printerId) {
            job.printerId = this.findBestPrinter(job);
        }

        this.printQueue.push(job);

        // Sort queue by priority
        this.sortPrintQueue();

        // Create event - simplified for now, would use proper event interface
        console.log(`Print job queued: ${job.id} for ${job.printerId}`);

        return job.id;
    }

    /**
     * Print receipt for transaction
     */
    async printReceipt(
        transactionId: string,
        items: PrintItem[],
        totals: ReceiptTotals,
        header: ReceiptHeader,
        footer: ReceiptFooter,
        printerType: PrinterType = PrinterType.CASHIER_RECEIPT
    ): Promise<string> {
        const printData: PrintData = {
            header,
            items,
            totals,
            footer
        };

        return this.queuePrintJob(printerType, printData, 'high', transactionId);
    }

    /**
     * Print kitchen order
     */
    async printKitchenOrder(
        transactionId: string,
        items: PrintItem[],
        header: ReceiptHeader
    ): Promise<string[]> {
        const jobIds: string[] = [];

        // Group items by kitchen station
        const stationGroups = this.groupItemsByStation(items);

        for (const [station, stationItems] of stationGroups) {
            if (stationItems.length === 0) continue;

            // Find appropriate kitchen printer
            const printerId = this.findKitchenPrinter(station);
            if (!printerId) continue;

            const printData: PrintData = {
                header: {
                    ...header,
                    storeName: `${header.storeName} - ${station.toUpperCase()}`
                },
                items: stationItems
            };

            const jobId = await this.queuePrintJob(
                PrinterType.KITCHEN_ORDER,
                printData,
                'urgent',
                transactionId,
                printerId
            );

            jobIds.push(jobId);
        }

        return jobIds;
    }

    /**
     * Find best printer for job
     */
    private findBestPrinter(job: PrintJob): string {
        const candidates = Array.from(this.printers.values())
            .filter(p => p.supportedTypes.includes(job.type) && p.status.isOnline && p.status.isReady)
            .sort((a, b) => {
                // Sort by priority, then by queue length
                if (a.config.priority !== b.config.priority) {
                    return b.config.priority - a.config.priority;
                }
                return a.status.queueLength - b.status.queueLength;
            });

        return candidates[0]?.id || 'printer_cashier_1'; // Fallback
    }

    /**
     * Find appropriate kitchen printer for station
     */
    private findKitchenPrinter(station: KitchenStation): string | null {
        for (const [printerId, printer] of this.printers) {
            if (printer.supportedTypes.includes(PrinterType.KITCHEN_ORDER) &&
                printer.config.kitchenStations?.includes(station) &&
                printer.status.isOnline &&
                printer.status.isReady) {
                return printerId;
            }
        }

        // Fallback to any kitchen printer
        for (const [printerId, printer] of this.printers) {
            if (printer.supportedTypes.includes(PrinterType.KITCHEN_ORDER) &&
                printer.status.isOnline &&
                printer.status.isReady) {
                return printerId;
            }
        }

        return null;
    }

    /**
     * Group items by kitchen station
     */
    private groupItemsByStation(items: PrintItem[]): Map<KitchenStation, PrintItem[]> {
        const groups = new Map<KitchenStation, PrintItem[]>();

        for (const item of items) {
            if (!item.isFoodItem) continue;

            const station = item.kitchenStation || KitchenStation.ALL;
            if (!groups.has(station)) {
                groups.set(station, []);
            }
            groups.get(station)!.push(item);
        }

        return groups;
    }

    /**
     * Start print processor
     */
    private startPrintProcessor(): void {
        setInterval(() => {
            this.processPrintQueue();
        }, 1000); // Process every second

        // Health monitoring
        setInterval(() => {
            this.monitorPrinterHealth();
        }, 30000); // Every 30 seconds
    }

    /**
     * Process print queue
     */
    private async processPrintQueue(): Promise<void> {
        if (this.printQueue.length === 0) return;

        // Process high priority jobs first
        const highPriorityJobs = this.printQueue.filter(job => job.priority === 'urgent' || job.priority === 'high');
        const normalJobs = this.printQueue.filter(job => job.priority === 'normal');
        const lowJobs = this.printQueue.filter(job => job.priority === 'low');

        const jobToProcess = highPriorityJobs[0] || normalJobs[0] || lowJobs[0];
        if (!jobToProcess) return;

        // Remove from queue
        const jobIndex = this.printQueue.indexOf(jobToProcess);
        if (jobIndex > -1) {
            this.printQueue.splice(jobIndex, 1);
        }

        // Check if printer is available
        const printer = this.printers.get(jobToProcess.printerId!);
        if (!printer || !printer.status.isOnline || !printer.status.isReady) {
            // Re-queue with retry
            if (jobToProcess.retryCount < jobToProcess.maxRetries) {
                jobToProcess.retryCount++;
                this.printQueue.push(jobToProcess);
            } else {
                jobToProcess.status = 'failed';
                jobToProcess.errorMessage = 'Printer unavailable';

                await this.alertManager.createAlert(
                    'medium',
                    'system',
                    'Print Job Failed',
                    `Print job ${jobToProcess.id} failed after ${jobToProcess.maxRetries} retries`,
                    { jobId: jobToProcess.id, printerId: jobToProcess.printerId },
                    'PrintRouter'
                );
            }
            return;
        }

        // Mark as printing
        jobToProcess.status = 'printing';
        this.activeJobs.set(jobToProcess.id, jobToProcess);
        printer.status.queueLength++;

        // Send to hardware via HAL
        try {
            // In a real implementation, we'd convert job.data to ESC/POS or raw bytes
            const printContent = JSON.stringify(job.data);
            await printer.hal.send(printContent);

            if (printer.config.autoCut) {
                await printer.hal.cutPaper();
            }

            jobToProcess.status = 'completed';
            printer.status.lastPrintTime = Date.now();

            // Create completion event - simplified for now
            console.log(`Print job completed: ${jobToProcess.id}`);

        } catch (error) {
            jobToProcess.status = 'failed';
            jobToProcess.errorMessage = error instanceof Error ? error.message : 'Unknown error';

            // Re-queue if retries available
            if (jobToProcess.retryCount < jobToProcess.maxRetries) {
                jobToProcess.retryCount++;
                jobToProcess.status = 'queued';
                this.printQueue.push(jobToProcess);
            } else {
                await this.alertManager.createAlert(
                    'low',
                    'system',
                    'Print Job Failed',
                    `Print job ${jobToProcess.id} failed: ${jobToProcess.errorMessage}`,
                    { jobId: jobToProcess.id, error: jobToProcess.errorMessage },
                    'PrintRouter'
                );
            }
        } finally {
            this.activeJobs.delete(jobToProcess.id);
            printer.status.queueLength = Math.max(0, printer.status.queueLength - 1);
        }
    }

    /**
     * Simulate printing (replace with actual printer communication)
     */
    private async simulatePrint(job: PrintJob, printer: PrinterDevice): Promise<void> {
        // Simulate print time based on job complexity
        const printTime = Math.max(1000, job.data.items?.length || 0 * 500);

        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Simulate occasional failures
                if (Math.random() < 0.05) { // 5% failure rate
                    reject(new Error('Paper jam'));
                } else {
                    console.log(`🖨️ Printed ${job.type} on ${printer.name}`);
                    resolve();
                }
            }, printTime);
        });
    }

    /**
     * Sort print queue by priority
     */
    private sortPrintQueue(): void {
        const priorityOrder = { urgent: 0, high: 1, normal: 2, low: 3 };

        this.printQueue.sort((a, b) => {
            const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
            if (priorityDiff !== 0) return priorityDiff;

            // Same priority: sort by creation time (FIFO)
            return a.createdAt - b.createdAt;
        });
    }

    /**
     * Monitor printer health
     */
    private monitorPrinterHealth(): void {
        const now = Date.now();

        for (const [printerId, printer] of this.printers) {
            // Check if printer has been seen recently
            if (now - printer.lastSeen > 5 * 60 * 1000) { // 5 minutes
                if (printer.status.isOnline) {
                    printer.status.isOnline = false;
                    printer.status.isReady = false;
                    printer.status.errorMessage = 'Printer offline (HAL Timeout)';

                    this.createPrinterStatusEvent(printer, 'offline');
                }
            }

            // Real paper status via HAL
            printer.hal.getPaperStatus().then(paperStatus => {
                if (paperStatus === 'low' && !printer.status.paperLow) {
                    printer.status.paperLow = true;
                    this.alertManager.createAlert(
                        'low',
                        'system',
                        'Printer Paper Low',
                        `Paper low on ${printer.name} (HAL Detection)`,
                        { printerId },
                        'PrintRouter'
                    );
                } else if (paperStatus === 'normal') {
                    printer.status.paperLow = false;
                }
            });
        }
    }

    /**
     * Create printer status event
     */
    private async createPrinterStatusEvent(printer: PrinterDevice, status: string): Promise<void> {
        // Simplified event creation for now
        console.log(`Printer ${printer.id} status changed to ${status}`);
    }

    /**
     * Get printer status
     */
    getPrinterStatus(): { printerId: string; status: string; queueLength: number; isOnline: boolean }[] {
        return Array.from(this.printers.values()).map(printer => ({
            printerId: printer.id,
            status: printer.status.isReady ? 'ready' : 'error',
            queueLength: printer.status.queueLength,
            isOnline: printer.status.isOnline
        }));
    }

    /**
     * Get print queue status
     */
    getPrintQueueStatus(): {
        queued: number;
        printing: number;
        completed: number;
        failed: number;
    } {
        const queued = this.printQueue.length;
        const printing = this.activeJobs.size;
        const completed = 0; // Would track in real implementation
        const failed = 0; // Would track in real implementation

        return { queued, printing, completed, failed };
    }

    /**
     * Emergency stop all printing
     */
    emergencyStop(): void {
        this.printQueue = [];
        for (const job of this.activeJobs.values()) {
            job.status = 'failed';
            job.errorMessage = 'Emergency stop';
        }
        this.activeJobs.clear();
    }
}