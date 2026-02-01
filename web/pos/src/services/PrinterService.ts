import { OrderWithDetails } from '@/types/order';

interface PrinterConfig {
  id: string;
  name: string;
  type: 'kitchen' | 'receipt' | 'both';
  deviceId?: string;
  ipAddress?: string;
  port?: number;
  apiKey?: string;
  isEnabled: boolean;
  createdAt: number;
  updatedAt: number;
}

interface PrintJob {
  id: string;
  printerId: string;
  type: 'kitchen_ticket' | 'receipt' | 'order_summary' | 'report';
  content: string;
  format: 'text' | 'html' | 'raw';
  status: 'pending' | 'printing' | 'completed' | 'failed';
  createdAt: number;
  completedAt?: number;
  errorMessage?: string;
  metadata: Record<string, any>;
}

class PrinterService {
  private static instance: PrinterService;
  private printers: Map<string, PrinterConfig>;
  private printQueue: PrintJob[];
  private isProcessing: boolean;

  private constructor() {
    this.printers = new Map();
    this.printQueue = [];
    this.isProcessing = false;
    
    // Initialize default printers
    this.initializeDefaultPrinters();
  }

  public static getInstance(): PrinterService {
    if (!PrinterService.instance) {
      PrinterService.instance = new PrinterService();
    }
    return PrinterService.instance;
  }

  /**
   * Initialize default printers
   */
  private initializeDefaultPrinters(): void {
    // Kitchen printer
    this.addPrinter({
      id: 'kitchen_printer_001',
      name: 'Kitchen Ticket Printer',
      type: 'kitchen',
      isEnabled: true,
      createdAt: Date.now(),
      updatedAt: Date.now()
    });

    // Receipt printer
    this.addPrinter({
      id: 'receipt_printer_001',
      name: 'Receipt Printer',
      type: 'receipt',
      isEnabled: true,
      createdAt: Date.now(),
      updatedAt: Date.now()
    });
  }

  /**
   * Add a new printer
   */
  public addPrinter(printer: Omit<PrinterConfig, 'id' | 'createdAt' | 'updatedAt'>): PrinterConfig {
    const newPrinter: PrinterConfig = {
      ...printer,
      id: this.generateId(),
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    this.printers.set(newPrinter.id, newPrinter);
    return newPrinter;
  }

  /**
   * Update printer configuration
   */
  public updatePrinter(printerId: string, updates: Partial<PrinterConfig>): PrinterConfig | null {
    const existingPrinter = this.getPrinterById(printerId);
    if (!existingPrinter) {
      return null;
    }

    const updatedPrinter: PrinterConfig = {
      ...existingPrinter,
      ...updates,
      updatedAt: Date.now()
    };

    this.printers.set(printerId, updatedPrinter);
    return updatedPrinter;
  }

  /**
   * Get printer by ID
   */
  public getPrinterById(printerId: string): PrinterConfig | null {
    return this.printers.get(printerId) || null;
  }

  /**
   * Get all printers
   */
  public getAllPrinters(): PrinterConfig[] {
    return Array.from(this.printers.values());
  }

  /**
   * Get printers by type
   */
  public getPrintersByType(type: PrinterConfig['type']): PrinterConfig[] {
    return Array.from(this.printers.values()).filter(printer => printer.type === type);
  }

  /**
   * Enable/disable printer
   */
  public setPrinterEnabled(printerId: string, enabled: boolean): boolean {
    const printer = this.getPrinterById(printerId);
    if (!printer) {
      return false;
    }

    this.updatePrinter(printerId, { isEnabled: enabled });
    return true;
  }

  /**
   * Queue a print job
   */
  public queuePrintJob(
    printerId: string,
    content: string,
    type: PrintJob['type'],
    format: PrintJob['format'] = 'text'
  ): PrintJob {
    const printer = this.getPrinterById(printerId);
    if (!printer || !printer.isEnabled) {
      throw new Error(`Printer ${printerId} is not available`);
    }

    const printJob: PrintJob = {
      id: this.generateJobId(),
      printerId,
      type,
      content,
      format,
      status: 'pending',
      createdAt: Date.now(),
      metadata: {}
    };

    this.printQueue.push(printJob);
    
    // Start processing if not already processing
    if (!this.isProcessing) {
      this.processQueue();
    }

    return printJob;
  }

  /**
   * Print order receipt
   */
  public printReceipt(order: OrderWithDetails): PrintJob {
    const receiptPrinter = this.getPrintersByType('receipt')[0];
    if (!receiptPrinter) {
      throw new Error('No receipt printer available');
    }

    const receiptContent = this.generateReceiptContent(order);
    return this.queuePrintJob(receiptPrinter.id, receiptContent, 'receipt', 'text');
  }

  /**
   * Print kitchen ticket
   */
  public printKitchenTicket(order: OrderWithDetails): PrintJob {
    const kitchenPrinter = this.getPrintersByType('kitchen')[0];
    if (!kitchenPrinter) {
      throw new Error('No kitchen printer available');
    }

    const ticketContent = this.generateKitchenTicketContent(order);
    return this.queuePrintJob(kitchenPrinter.id, ticketContent, 'kitchen_ticket', 'text');
  }

  /**
   * Generate receipt content
   */
  private generateReceiptContent(order: OrderWithDetails): string {
    let content = '';
    content += '='.repeat(40) + '\n';
    content += '           RECEIPT\n';
    content += ' '.repeat(15) + 'NILELINK POS\n';
    content += ' '.repeat(10) + 'Tripoli, Lebanon\n';
    content += ' '.repeat(8) + '+961 71 234 567\n';
    content += ' '.repeat(12) + 'www.nilelink.com\n';
    content += ' '.repeat(10) + 'TAX ID: NL-12345\n';
    content += '='.repeat(40) + '\n';
    
    content += `ORDER #${order.id.slice(0, 8)}\n`;
    content += `TIME: ${new Date(order.createdAt * 1000).toLocaleString()}\n`;
    if (order.tableNumber) content += `TABLE: ${order.tableNumber}\n`;
    if (order.customerName) content += `CUSTOMER: ${order.customerName}\n`;
    content += '-'.repeat(40) + '\n';
    
    order.items.forEach(item => {
      content += `${item.quantity}x ${item.name}\n`;
      if (item.specialInstructions) {
        content += `  * ${item.specialInstructions}\n`;
      }
      content += `                $${(item.price * item.quantity).toFixed(2)}\n`;
    });
    
    content += '-'.repeat(40) + '\n';
    content += `SUBTOTAL:          $${order.subtotal.toFixed(2)}\n`;
    content += `TAX (${order.taxRate}%):      $${order.taxAmount.toFixed(2)}\n`;
    content += `TOTAL:             $${order.total.toFixed(2)}\n`;
    
    if (order.paymentMethod) {
      content += `-`.repeat(40) + '\n';
      content += `PAYMENT: ${order.paymentMethod.toUpperCase()}\n`;
    }
    
    content += '='.repeat(40) + '\n';
    content += '    THANK YOU FOR YOUR BUSINESS!\n';
    content += '      Visit us again soon!\n';
    content += '='.repeat(40) + '\n';

    return content;
  }

  /**
   * Generate kitchen ticket content
   */
  private generateKitchenTicketContent(order: OrderWithDetails): string {
    let content = '';
    content += '*'.repeat(30) + '\n';
    content += '       KITCHEN TICKET\n';
    content += '*'.repeat(30) + '\n';
    
    content += `ORDER: #${order.id.slice(0, 8)}\n`;
    content += `TIME: ${new Date(order.createdAt * 1000).toLocaleTimeString()}\n`;
    if (order.tableNumber) content += `TABLE: ${order.tableNumber}\n`;
    if (order.customerName) content += `CUSTOMER: ${order.customerName}\n`;
    if (order.priority) content += `PRIORITY: ${order.priority.toUpperCase()}\n`;
    content += '-'.repeat(30) + '\n';
    
    order.items.forEach(item => {
      content += `${item.quantity}x ${item.name}\n`;
      if (item.specialInstructions) {
        content += `  💬 ${item.specialInstructions}\n`;
      }
    });
    
    content += '*'.repeat(30) + '\n';
    content += `TOTAL ITEMS: ${order.items.reduce((sum, item) => sum + item.quantity, 0)}\n`;
    content += '*'.repeat(30) + '\n';

    return content;
  }

  /**
   * Process the print queue
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.printQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    while (this.printQueue.length > 0) {
      const job = this.printQueue.shift();
      if (!job) continue;

      try {
        // Update job status to printing
        this.updateJobStatus(job.id, 'printing');

        // Simulate actual printing (would integrate with real printer API)
        await this.simulatePrintJob(job);

        // Update job status to completed
        this.updateJobStatus(job.id, 'completed');
      } catch (error) {
        // Update job status to failed
        this.updateJobStatus(job.id, 'failed', (error as Error).message);
      }
    }

    this.isProcessing = false;
  }

  /**
   * Simulate print job (would connect to actual printer in real implementation)
   */
  private async simulatePrintJob(job: PrintJob): Promise<void> {
    // In a real implementation, this would connect to the actual printer
    // via network, USB, or cloud printing service
    
    console.log(`Printing job ${job.id} on printer ${job.printerId}`);
    console.log(`Content: ${job.content.substring(0, 100)}...`);
    
    // Simulate printing delay
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  /**
   * Update print job status
   */
  private updateJobStatus(jobId: string, status: PrintJob['status'], errorMessage?: string): void {
    const jobIndex = this.printQueue.findIndex(job => job.id === jobId);
    if (jobIndex !== -1) {
      this.printQueue[jobIndex] = {
        ...this.printQueue[jobIndex],
        status,
        completedAt: status === 'completed' || status === 'failed' ? Date.now() : undefined,
        errorMessage: status === 'failed' ? errorMessage : undefined
      };
    }
  }

  /**
   * Get print job by ID
   */
  public getPrintJobById(jobId: string): PrintJob | undefined {
    return this.printQueue.find(job => job.id === jobId);
  }

  /**
   * Get print jobs by printer
   */
  public getPrintJobsByPrinter(printerId: string): PrintJob[] {
    return this.printQueue.filter(job => job.printerId === printerId);
  }

  /**
   * Get print jobs by status
   */
  public getPrintJobsByStatus(status: PrintJob['status']): PrintJob[] {
    return this.printQueue.filter(job => job.status === status);
  }

  /**
   * Cancel a print job
   */
  public cancelPrintJob(jobId: string): boolean {
    const jobIndex = this.printQueue.findIndex(job => job.id === jobId);
    if (jobIndex !== -1) {
      this.printQueue.splice(jobIndex, 1);
      return true;
    }
    return false;
  }

  /**
   * Get printer status
   */
  public getPrinterStatus(printerId: string): {
    isConnected: boolean;
    isOnline: boolean;
    paperStatus: 'ok' | 'low' | 'empty';
    inkStatus: 'ok' | 'low' | 'empty';
    queuedJobs: number;
    errors: string[];
  } {
    const printer = this.getPrinterById(printerId);
    if (!printer) {
      return {
        isConnected: false,
        isOnline: false,
        paperStatus: 'empty',
        inkStatus: 'empty',
        queuedJobs: 0,
        errors: ['Printer not found']
      };
    }

    const queuedJobs = this.getPrintJobsByPrinter(printerId).length;
    const errors = [];

    if (!printer.isEnabled) {
      errors.push('Printer is disabled');
    }

    // Simulate printer status
    const isConnected = true;
    const isOnline = true;
    const paperStatus = queuedJobs > 10 ? 'low' : 'ok';
    const inkStatus = 'ok';

    return {
      isConnected,
      isOnline,
      paperStatus,
      inkStatus,
      queuedJobs,
      errors
    };
  }

  /**
   * Test printer connection
   */
  public async testPrinterConnection(printerId: string): Promise<boolean> {
    const printer = this.getPrinterById(printerId);
    if (!printer || !printer.isEnabled) {
      return false;
    }

    try {
      // In a real implementation, this would send a test command to the printer
      console.log(`Testing connection to printer ${printerId}`);
      
      // Simulate connection test
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return true;
    } catch (error) {
      console.error(`Printer connection test failed: ${(error as Error).message}`);
      return false;
    }
  }

  /**
   * Get queue statistics
   */
  public getQueueStats(): {
    totalJobs: number;
    pendingJobs: number;
    printingJobs: number;
    completedJobs: number;
    failedJobs: number;
  } {
    return {
      totalJobs: this.printQueue.length,
      pendingJobs: this.printQueue.filter(job => job.status === 'pending').length,
      printingJobs: this.printQueue.filter(job => job.status === 'printing').length,
      completedJobs: this.printQueue.filter(job => job.status === 'completed').length,
      failedJobs: this.printQueue.filter(job => job.status === 'failed').length
    };
  }

  /**
   * Generate a unique ID for printers
   */
  private generateId(): string {
    return `printer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate a unique ID for print jobs
   */
  private generateJobId(): string {
    return `printjob_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Clear print queue
   */
  public clearPrintQueue(): void {
    this.printQueue = [];
  }
}

// Export singleton instance
export const printerService = PrinterService.getInstance();

// Export types
export type { PrinterConfig, PrintJob };
export { PrinterService };