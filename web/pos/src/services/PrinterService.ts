// Simple console logger for POS frontend
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

export class PrinterService {
    private printers: Map<string, Printer> = new Map();
    private printQueue: PrintJob[] = [];
    private isProcessing: boolean = false;
    private detectionInterval: NodeJS.Timeout | null = null;
    private connectionCheckInterval: NodeJS.Timeout | null = null;

    constructor() {
        this.startPrinterDetection();
        this.startConnectionMonitoring();
    }

    // Printer Detection
    async detectPrinters(): Promise<Printer[]> {
        const detectedPrinters: Printer[] = [];

        try {
            // USB Printer Detection
            const usbPrinters = await this.detectUSBPrinters();
            detectedPrinters.push(...usbPrinters);

            // Bluetooth Printer Detection
            const bluetoothPrinters = await this.detectBluetoothPrinters();
            detectedPrinters.push(...bluetoothPrinters);

            // WiFi/Network Printer Detection
            const networkPrinters = await this.detectNetworkPrinters();
            detectedPrinters.push(...networkPrinters);

            // Update printer registry
            for (const printer of detectedPrinters) {
                this.printers.set(printer.id, {
                    ...printer,
                    lastSeen: new Date()
                });
            }

            logger.info(`Detected ${detectedPrinters.length} printers`, {
                usb: usbPrinters.length,
                bluetooth: bluetoothPrinters.length,
                network: networkPrinters.length
            });

        } catch (error) {
            logger.error('Printer detection failed', { error });
        }

        return detectedPrinters;
    }

    private async detectUSBPrinters(): Promise<Printer[]> {
        const printers: Printer[] = [];

        // In a real implementation, this would use WebUSB API or Electron APIs
        // For now, we'll simulate detection
        try {
            // Check for common USB printer ports
            const usbDevices = await this.getUSBDevices();

            for (const device of usbDevices) {
                if (this.isPrinterDevice(device)) {
                    printers.push({
                        id: `usb-${device.serialNumber || device.productId}`,
                        name: device.productName || 'USB Printer',
                        type: PrinterType.RECEIPT,
                        connectionType: PrinterConnectionType.USB,
                        status: PrinterStatus.CONNECTED,
                        capabilities: {
                            paperWidth: 80,
                            dpi: 203,
                            cutter: true,
                            buzzer: true,
                            cashDrawer: true
                        }
                    });
                }
            }
        } catch (error) {
            logger.warn('USB printer detection failed', { error });
        }

        return printers;
    }

    private async detectBluetoothPrinters(): Promise<Printer[]> {
        const printers: Printer[] = [];

        try {
            // Check for Bluetooth devices
            const bluetoothDevices = await this.getBluetoothDevices();

            for (const device of bluetoothDevices) {
                if (this.isPrinterDevice(device)) {
                    printers.push({
                        id: `bt-${device.id}`,
                        name: device.name || 'Bluetooth Printer',
                        type: PrinterType.RECEIPT,
                        connectionType: PrinterConnectionType.BLUETOOTH,
                        status: PrinterStatus.CONNECTED,
                        macAddress: device.macAddress,
                        capabilities: {
                            paperWidth: 58,
                            dpi: 203,
                            cutter: false,
                            buzzer: false,
                            cashDrawer: false
                        }
                    });
                }
            }
        } catch (error) {
            logger.warn('Bluetooth printer detection failed', { error });
        }

        return printers;
    }

    private async detectNetworkPrinters(): Promise<Printer[]> {
        const printers: Printer[] = [];

        try {
            // Network printer discovery (would use mDNS/Bonjour in real implementation)
            const networkDevices = await this.getNetworkDevices();

            for (const device of networkDevices) {
                if (this.isPrinterDevice(device)) {
                    printers.push({
                        id: `net-${device.ip}`,
                        name: device.name || 'Network Printer',
                        type: PrinterType.RECEIPT,
                        connectionType: PrinterConnectionType.WIFI,
                        status: PrinterStatus.CONNECTED,
                        ipAddress: device.ip,
                        port: device.port || 9100,
                        capabilities: {
                            paperWidth: 80,
                            dpi: 203,
                            cutter: true,
                            buzzer: true,
                            cashDrawer: true
                        }
                    });
                }
            }
        } catch (error) {
            logger.warn('Network printer detection failed', { error });
        }

        return printers;
    }

    private async getUSBDevices(): Promise<any[]> {
        // Mock implementation - would use WebUSB in browser or system APIs in Electron
        return [
            {
                productId: '1234',
                productName: 'EPSON TM-T88V',
                serialNumber: 'ABC123'
            }
        ];
    }

    private async getBluetoothDevices(): Promise<any[]> {
        // Mock implementation - would use Web Bluetooth API
        return [
            {
                id: 'BT001',
                name: 'Star Micronics mPOP',
                macAddress: 'AA:BB:CC:DD:EE:FF'
            }
        ];
    }

    private async getNetworkDevices(): Promise<any[]> {
        // Mock implementation - would use network scanning
        return [
            {
                ip: '192.168.1.100',
                name: 'Kitchen Printer',
                port: 9100
            }
        ];
    }

    private isPrinterDevice(device: any): boolean {
        // Basic printer detection logic
        const printerNames = ['printer', 'pos', 'receipt', 'thermal', 'epson', 'star', 'citizen'];
        const deviceName = (device.name || device.productName || '').toLowerCase();

        return printerNames.some(name => deviceName.includes(name)) ||
               device.vendorId === 0x04B8 || // Epson
               device.vendorId === 0x0519 || // Star Micronics
               device.vendorId === 0x1A86;   // Citizen
    }

    // Printer Management
    registerPrinter(printer: Omit<Printer, 'status' | 'lastSeen'>): void {
        this.printers.set(printer.id, {
            ...printer,
            status: PrinterStatus.DISCONNECTED,
            lastSeen: new Date()
        });
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
        this.processPrintQueue();

        logger.info('Receipt print job queued', { jobId: printJob.id, printerId });
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
        this.processPrintQueue();

        logger.info('Report print job queued', { jobId: printJob.id, printerId });
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

                    // Retry logic for failed jobs
                    if (job.priority === 'high') {
                        // Re-queue high priority jobs
                        this.printQueue.unshift(job);
                        await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
                    }
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

        // Format print data based on printer type and capabilities
        const printData = this.formatPrintData(job, printer);

        // Send to printer (implementation depends on connection type)
        switch (printer.connectionType) {
            case PrinterConnectionType.USB:
                await this.printToUSB(printer, printData);
                break;
            case PrinterConnectionType.BLUETOOTH:
                await this.printToBluetooth(printer, printData);
                break;
            case PrinterConnectionType.WIFI:
                await this.printToNetwork(printer, printData);
                break;
            default:
                throw new Error(`Unsupported connection type: ${printer.connectionType}`);
        }
    }

    private formatPrintData(job: PrintJob, printer: Printer): string {
        // ESC/POS command formatting for thermal printers
        let commands = '';

        switch (job.type) {
            case 'receipt':
                commands = this.formatReceipt(job.data, printer);
                break;
            case 'report':
                commands = this.formatReport(job.data, printer);
                break;
            default:
                commands = job.data.toString();
        }

        return commands;
    }

    private formatReceipt(data: any, printer: Printer): string {
        let commands = '';

        // Initialize printer
        commands += '\x1B\x40'; // ESC @ - Initialize

        // Set character size
        commands += '\x1B\x21\x01'; // ESC ! 1 - Double height

        // Header
        commands += 'NileLink POS\n';
        commands += '================\n';

        // Reset character size
        commands += '\x1B\x21\x00'; // ESC ! 0 - Normal size

        // Order details
        if (data.orderNumber) {
            commands += `Order: ${data.orderNumber}\n`;
        }
        if (data.timestamp) {
            commands += `Time: ${new Date(data.timestamp).toLocaleString()}\n`;
        }
        commands += '\n';

        // Items
        if (data.items && Array.isArray(data.items)) {
            commands += 'Items:\n';
            data.items.forEach((item: any) => {
                commands += `${item.name} x${item.quantity} - $${item.total.toFixed(2)}\n`;
            });
            commands += '\n';
        }

        // Totals
        if (data.subtotal) {
            commands += `Subtotal: $${data.subtotal.toFixed(2)}\n`;
        }
        if (data.tax) {
            commands += `Tax: $${data.tax.toFixed(2)}\n`;
        }
        if (data.total) {
            commands += '\x1B\x21\x01'; // Double height for total
            commands += `TOTAL: $${data.total.toFixed(2)}\n`;
            commands += '\x1B\x21\x00'; // Reset
        }

        // Payment method
        if (data.paymentMethod) {
            commands += `\nPayment: ${data.paymentMethod.toUpperCase()}\n`;
        }

        // Footer
        commands += '\nThank you for your business!\n';
        commands += 'www.nilelink.app\n\n';

        // Cut paper (if supported)
        if (printer.capabilities.cutter) {
            commands += '\x1D\x56\x42\x00'; // GS V B 0 - Full cut
        }

        return commands;
    }

    private formatReport(data: any, printer: Printer): string {
        let commands = '';

        commands += '\x1B\x40'; // Initialize
        commands += '\x1B\x21\x01'; // Double height

        commands += 'NileLink Daily Report\n';
        commands += '=====================\n';

        commands += '\x1B\x21\x00'; // Normal size

        if (data.date) {
            commands += `Date: ${data.date}\n\n`;
        }

        // Financial summary
        if (data.financial) {
            commands += 'FINANCIAL SUMMARY\n';
            commands += '=================\n';
            commands += `Total Sales: $${data.financial.totalSales?.toFixed(2) || '0.00'}\n`;
            commands += `Cash Sales: $${data.financial.cashSales?.toFixed(2) || '0.00'}\n`;
            commands += `Card Sales: $${data.financial.cardSales?.toFixed(2) || '0.00'}\n`;
            commands += `Refunds: $${data.financial.refunds?.toFixed(2) || '0.00'}\n\n`;
        }

        // Order summary
        if (data.orders) {
            commands += 'ORDER SUMMARY\n';
            commands += '=============\n';
            commands += `Total Orders: ${data.orders.total || 0}\n`;
            commands += `Completed: ${data.orders.completed || 0}\n`;
            commands += `Cancelled: ${data.orders.cancelled || 0}\n`;
            commands += `Average Order: $${data.orders.average?.toFixed(2) || '0.00'}\n\n`;
        }

        // Popular items
        if (data.popularItems && Array.isArray(data.popularItems)) {
            commands += 'POPULAR ITEMS\n';
            commands += '=============\n';
            data.popularItems.slice(0, 5).forEach((item: any, index: number) => {
                commands += `${index + 1}. ${item.name} (${item.count})\n`;
            });
        }

        commands += '\n\n';

        // Cut paper
        if (printer.capabilities.cutter) {
            commands += '\x1D\x56\x42\x00';
        }

        return commands;
    }

    private async printToUSB(printer: Printer, data: string): Promise<void> {
        // Implementation would use WebUSB API or Electron APIs
        // For now, simulate printing
        logger.info('Printing to USB printer', { printerId: printer.id, dataLength: data.length });

        // Simulate print delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Simulate cash drawer opening for receipt printers with cash drawer capability
        if (printer.capabilities.cashDrawer && data.includes('Payment: CASH')) {
            await this.openCashDrawer(printer);
        }
    }

    private async printToBluetooth(printer: Printer, data: string): Promise<void> {
        // Implementation would use Web Bluetooth API
        logger.info('Printing to Bluetooth printer', { printerId: printer.id, dataLength: data.length });

        await new Promise(resolve => setTimeout(resolve, 3000));
    }

    private async printToNetwork(printer: Printer, data: string): Promise<void> {
        // Implementation would use fetch to printer IP
        logger.info('Printing to network printer', { printerId: printer.id, dataLength: data.length });

        await new Promise(resolve => setTimeout(resolve, 1500));
    }

    async openCashDrawer(printer?: Printer): Promise<void> {
        // Find a receipt printer with cash drawer capability
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

        // ESC/POS command to open cash drawer
        const openCommand = '\x1B\x70\x00\x19\xFA'; // ESC p 0 25 250

        try {
            switch (targetPrinter.connectionType) {
                case PrinterConnectionType.USB:
                    await this.printToUSB(targetPrinter, openCommand);
                    break;
                case PrinterConnectionType.BLUETOOTH:
                    await this.printToBluetooth(targetPrinter, openCommand);
                    break;
                case PrinterConnectionType.WIFI:
                    await this.printToNetwork(targetPrinter, openCommand);
                    break;
            }

            logger.info('Cash drawer opened', { printerId: targetPrinter.id });

        } catch (error) {
            logger.error('Failed to open cash drawer', { error, printerId: targetPrinter.id });
            throw error;
        }
    }

    async testPrinter(printerId: string): Promise<boolean> {
        const printer = this.printers.get(printerId);
        if (!printer) {
            throw new Error(`Printer ${printerId} not found`);
        }

        try {
            const testData = this.formatReceipt({
                orderNumber: 'TEST-001',
                timestamp: new Date(),
                items: [{ name: 'Test Item', quantity: 1, total: 10.00 }],
                total: 10.00,
                paymentMethod: 'TEST'
            }, printer);

            await this.executePrintJob({
                id: `test-${Date.now()}`,
                printerId,
                type: 'receipt',
                data: testData,
                priority: 'high',
                status: 'queued',
                createdAt: new Date()
            });

            return true;

        } catch (error) {
            logger.error('Printer test failed', { printerId, error });
            return false;
        }
    }

    private startPrinterDetection(): void {
        // Run initial detection
        this.detectPrinters();

        // Schedule periodic detection
        this.detectionInterval = setInterval(() => {
            this.detectPrinters();
        }, 30000); // Every 30 seconds
    }

    private startConnectionMonitoring(): void {
        this.connectionCheckInterval = setInterval(() => {
            this.checkPrinterConnections();
        }, 10000); // Every 10 seconds
    }

    private async checkPrinterConnections(): Promise<void> {
        for (const [id, printer] of this.printers) {
            try {
                // Simple connectivity check (implementation depends on printer type)
                const isConnected = await this.checkPrinterConnection(printer);

                const newStatus = isConnected ? PrinterStatus.CONNECTED : PrinterStatus.DISCONNECTED;

                if (newStatus !== printer.status) {
                    logger.info('Printer status changed', {
                        printerId: id,
                        oldStatus: printer.status,
                        newStatus
                    });

                    this.printers.set(id, {
                        ...printer,
                        status: newStatus,
                        lastSeen: newStatus === PrinterStatus.CONNECTED ? new Date() : printer.lastSeen
                    });
                }

            } catch (error) {
                logger.error('Connection check failed', { printerId: id, error });

                this.printers.set(id, {
                    ...printer,
                    status: PrinterStatus.ERROR
                });
            }
        }
    }

    private async checkPrinterConnection(printer: Printer): Promise<boolean> {
        // Implementation would vary by connection type
        // For now, return mock status
        return printer.status !== PrinterStatus.ERROR;
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

    cleanup(): void {
        if (this.detectionInterval) {
            clearInterval(this.detectionInterval);
        }
        if (this.connectionCheckInterval) {
            clearInterval(this.connectionCheckInterval);
        }

        // Cancel pending print jobs
        this.printQueue.forEach(job => {
            if (job.status === 'queued' || job.status === 'printing') {
                job.status = 'failed';
                job.error = 'Service shutdown';
            }
        });
    }
}

// Global printer service instance
export const printerService = new PrinterService();