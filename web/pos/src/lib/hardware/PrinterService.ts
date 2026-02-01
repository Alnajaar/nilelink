// Simple Printer Service for POS frontend - No background detection
const logger = {
    info: (message: string, meta?: any) => console.log(`[PrinterService] ${message}`, meta),
    warn: (message: string, meta?: any) => console.warn(`[PrinterService] ${message}`, meta),
    error: (message: string, meta?: any) => console.error(`[PrinterService] ${message}`, meta)
};

export enum PrinterType {
    RECEIPT = 'receipt',
    LABEL = 'label',
    KITCHEN = 'kitchen'
}

export enum PrinterConnectionType {
    USB = 'usb',
    BLUETOOTH = 'bluetooth',
    WIFI = 'wifi',
    SERIAL = 'serial'
}

export enum PrinterStatus {
    CONNECTED = 'connected',
    DISCONNECTED = 'disconnected',
    BUSY = 'busy',
    ERROR = 'error',
    LOW_PAPER = 'low_paper',
    OFFLINE = 'offline'
}

export interface Printer {
    id: string;
    name: string;
    type: PrinterType;
    connectionType: PrinterConnectionType;
    status: PrinterStatus;
    ipAddress?: string;
    macAddress?: string;
    port?: number;
    lastSeen?: Date;
    capabilities: {
        paperWidth: number; // mm
        dpi: number;
        cutter: boolean;
        buzzer: boolean;
        cashDrawer: boolean;
    };
}

export interface PrintJob {
    id: string;
    printerId: string;
    type: 'receipt' | 'report' | 'label';
    data: any;
    priority: 'low' | 'normal' | 'high';
    status: 'queued' | 'printing' | 'completed' | 'failed';
    createdAt: Date;
    completedAt?: Date;
    error?: string;
}

// Simple Printer Service - No automatic background detection
export class PrinterService {
    private printers: Map<string, Printer> = new Map();
    private printQueue: PrintJob[] = [];
    private isProcessing: boolean = false;

    constructor() {
        // Initialize with some mock printers for testing
        this.initializeMockPrinters();
    }

    private initializeMockPrinters(): void {
        // Mock network printers for testing
        const mockPrinters: Printer[] = [
            {
                id: 'net-192.168.1.100',
                name: 'Kitchen Printer',
                type: PrinterType.KITCHEN,
                connectionType: PrinterConnectionType.WIFI,
                status: PrinterStatus.CONNECTED,
                ipAddress: '192.168.1.100',
                port: 9100,
                capabilities: {
                    paperWidth: 80,
                    dpi: 203,
                    cutter: true,
                    buzzer: true,
                    cashDrawer: false
                }
            },
            {
                id: 'net-192.168.1.101',
                name: 'Bar Printer',
                type: PrinterType.RECEIPT,
                connectionType: PrinterConnectionType.WIFI,
                status: PrinterStatus.CONNECTED,
                ipAddress: '192.168.1.101',
                port: 9100,
                capabilities: {
                    paperWidth: 80,
                    dpi: 203,
                    cutter: true,
                    buzzer: true,
                    cashDrawer: true
                }
            }
        ];

        for (const printer of mockPrinters) {
            this.printers.set(printer.id, {
                ...printer,
                lastSeen: new Date()
            });
        }

        logger.info(`Initialized with ${mockPrinters.length} mock printers`);
    }

    // Manual printer detection - call when needed
    async detectPrinters(): Promise<Printer[]> {
        logger.info('Manual printer detection requested');
        
        // In a real implementation, this would scan for actual printers
        // For now, we just return the existing printers
        return this.getPrinters();
    }

    // Printer Management
    registerPrinter(printer: Omit<Printer, 'status' | 'lastSeen'>): void {
        this.printers.set(printer.id, {
            ...printer,
            status: PrinterStatus.DISCONNECTED,
            lastSeen: new Date()
        });
        logger.info('Printer registered', { printerId: printer.id });
    }

    getPrinters(): Printer[] {
        return Array.from(this.printers.values());
    }

    getPrinterById(id: string): Printer | undefined {
        return this.printers.get(id);
    }

    getPrintersByType(type: PrinterType): Printer[] {
        return Array.from(this.printers.values()).filter(p => p.type === type);
    }

    getAvailablePrinters(): Printer[] {
        return Array.from(this.printers.values()).filter(p => p.status === PrinterStatus.CONNECTED);
    }

    // Print Job Management
    async printReceipt(printerId: string, receiptData: any): Promise<boolean> {
        const printer = this.printers.get(printerId);
        if (!printer || printer.status !== PrinterStatus.CONNECTED) {
            throw new Error(`Printer ${printerId} is not available`);
        }

        const printJob: PrintJob = {
            id: `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            printerId,
            type: 'receipt',
            data: receiptData,
            priority: 'normal',
            status: 'queued',
            createdAt: new Date()
        };

        this.printQueue.push(printJob);
        await this.processPrintQueue();

        logger.info('Receipt print job completed', { jobId: printJob.id, printerId });
        return true;
    }

    async printReport(printerId: string, reportData: any): Promise<boolean> {
        const printJob: PrintJob = {
            id: `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            printerId,
            type: 'report',
            data: reportData,
            priority: 'high',
            status: 'queued',
            createdAt: new Date()
        };

        // Add to front of queue for high priority
        this.printQueue.unshift(printJob);
        await this.processPrintQueue();

        logger.info('Report print job completed', { jobId: printJob.id, printerId });
        return true;
    }

    private async processPrintQueue(): Promise<void> {
        if (this.isProcessing || this.printQueue.length === 0) return;

        this.isProcessing = true;

        try {
            while (this.printQueue.length > 0) {
                const job = this.printQueue.shift();
                if (!job) break;

                job.status = 'printing';

                try {
                    await this.executePrintJob(job);
                    job.status = 'completed';
                    job.completedAt = new Date();

                    logger.info('Print job completed', { jobId: job.id });

                } catch (error) {
                    job.status = 'failed';
                    job.error = error instanceof Error ? error.message : 'Print failed';

                    logger.error('Print job failed', { jobId: job.id, error });
                }
            }
        } finally {
            this.isProcessing = false;
        }
    }

    private async executePrintJob(job: PrintJob): Promise<void> {
        const printer = this.printers.get(job.printerId);
        if (!printer) {
            throw new Error(`Printer ${job.printerId} not found`);
        }

        // Simulate printing delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Handle cash drawer opening for receipt printers
        if (printer.capabilities.cashDrawer && job.data.paymentMethod === 'CASH') {
            await this.openCashDrawer(printer);
        }

        logger.info('Print job executed', { jobId: job.id, printerId: job.printerId });
    }

    async openCashDrawer(printer?: Printer): Promise<void> {
        let targetPrinter = printer;

        if (!targetPrinter) {
            targetPrinter = Array.from(this.printers.values()).find(p =>
                p.type === PrinterType.RECEIPT &&
                p.capabilities.cashDrawer &&
                p.status === PrinterStatus.CONNECTED
            );
        }

        if (!targetPrinter) {
            throw new Error('No cash drawer equipped printer found');
        }

        logger.info('Cash drawer opened', { printerId: targetPrinter.id });
        // Simulate cash drawer opening delay
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    async testPrinter(printerId: string): Promise<boolean> {
        const printer = this.printers.get(printerId);
        if (!printer) {
            throw new Error(`Printer ${printerId} not found`);
        }

        try {
            const testData = {
                orderNumber: 'TEST-001',
                timestamp: new Date(),
                items: [{ name: 'Test Item', quantity: 1, total: 10.00 }],
                total: 10.00,
                paymentMethod: 'TEST'
            };

            await this.printReceipt(printerId, testData);
            return true;

        } catch (error) {
            logger.error('Printer test failed', { printerId, error });
            return false;
        }
    }

    getPrintQueue(): PrintJob[] {
        return [...this.printQueue];
    }

    getPrinterStatusSummary(): any {
        const printers = Array.from(this.printers.values());
        const summary = {
            total: printers.length,
            connected: printers.filter(p => p.status === PrinterStatus.CONNECTED).length,
            disconnected: printers.filter(p => p.status === PrinterStatus.DISCONNECTED).length,
            error: printers.filter(p => p.status === PrinterStatus.ERROR).length,
            byType: {} as Record<PrinterType, number>,
            byConnection: {} as Record<PrinterConnectionType, number>
        };

        printers.forEach(printer => {
            summary.byType[printer.type] = (summary.byType[printer.type] || 0) + 1;
            summary.byConnection[printer.connectionType] = (summary.byConnection[printer.connectionType] || 0) + 1;
        });

        return summary;
    }

    // Cleanup method
    cleanup(): void {
        logger.info('Printer service cleanup completed');
    }
}

// Create singleton instance
let printerServiceInstance: PrinterService | null = null;

export function getPrinterService(): PrinterService {
    if (!printerServiceInstance) {
        printerServiceInstance = new PrinterService();
    }
    return printerServiceInstance;
}

// Export the service for direct use
export default getPrinterService();