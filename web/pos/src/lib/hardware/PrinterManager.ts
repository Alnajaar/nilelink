/**
 * NileLink Multi-Printer Routing Manager
 * 
 * Orchestrates printing tasks across various hardware endpoints:
 * - Receipt Printers (Cashier)
 * - Kitchen Printers (Impact/Network)
 * - Label Printers (Inventory/Barcode)
 * - Manager Reports (Office)
 * 
 * Fulfills Phase 2.2 of the security and operations roadmap.
 */

import { EventEngine } from '../events/EventEngine';
import { LocalLedger } from '../storage/LocalLedger';
import {
    EventType,
    PrinterJobEvent
} from '../events/types';
import { v4 as uuidv4 } from 'uuid';

export interface Printer {
    id: string;
    name: string;
    type: 'receipt' | 'kitchen' | 'manager' | 'label';
    connection: 'usb' | 'network' | 'bluetooth';
    status: 'online' | 'offline' | 'error';
    characteristics: {
        width: 58 | 80; // Paper width
        canCut: boolean;
        canOpenDrawer: boolean;
        isColor: boolean;
    };
    location: string;
}

export interface PrintJob {
    id: string;
    type: 'receipt' | 'kitchen' | 'report' | 'label';
    content: any; // PDF, Text, HTML, or Command Sequence
    priority: number;
    targetPrinterId?: string;
    createdAt: number;
}

export class PrinterManager {
    private eventEngine: EventEngine;
    private ledger: LocalLedger;
    private printers = new Map<string, Printer>();
    private activeJobs = new Map<string, PrintJob>();

    constructor(eventEngine: EventEngine, ledger: LocalLedger) {
        this.eventEngine = eventEngine;
        this.ledger = ledger;
        this.initializePrinters();
    }

    private initializePrinters() {
        // Default printer configuration
        const defaults: Printer[] = [
            {
                id: 'printer_main_receipt',
                name: 'Main Receipt Printer',
                type: 'receipt',
                connection: 'usb',
                status: 'online',
                characteristics: { width: 80, canCut: true, canOpenDrawer: true, isColor: false },
                location: 'Cashier 1'
            },
            {
                id: 'printer_kitchen_1',
                name: 'Kitchen Hot Station',
                type: 'kitchen',
                connection: 'network',
                status: 'online',
                characteristics: { width: 80, canCut: true, canOpenDrawer: false, isColor: false },
                location: 'Kitchen'
            }
        ];

        for (const p of defaults) {
            this.printers.set(p.id, p);
        }
    }

    /**
     * Route a print job to the most appropriate printer
     */
    async routePrintJob(job: Omit<PrintJob, 'id' | 'createdAt'>): Promise<string> {
        const jobId = uuidv4();
        const fullJob: PrintJob = { ...job, id: jobId, createdAt: Date.now() };

        // Find best printer
        let targetId = job.targetPrinterId;
        if (!targetId) {
            const potentialPrinters = Array.from(this.printers.values())
                .filter(p => p.type === job.type && p.status === 'online');

            if (potentialPrinters.length > 0) {
                targetId = potentialPrinters[0].id; // Simple round-robin or first-available
            }
        }

        if (!targetId) {
            throw new Error(`No available printer found for type: ${job.type}`);
        }

        // 1. Log Job Start Decentralized
        await this.eventEngine.createEvent<PrinterJobEvent>(
            EventType.PRINTER_JOB_STARTED,
            'system',
            {
                jobId,
                printerId: targetId,
                printerType: job.type as any,
                contentHash: 'hash_of_content', // Ideally SHA256 of job.content
                status: 'printing',
                timestamp: Date.now()
            }
        );

        this.activeJobs.set(jobId, fullJob);

        // 2. Perform Physical Print (Mock for now, would use HAL)
        setTimeout(async () => {
            await this.completeJob(jobId, targetId!);
        }, 1500);

        return jobId;
    }

    private async completeJob(jobId: string, printerId: string) {
        this.activeJobs.delete(jobId);

        await this.eventEngine.createEvent<PrinterJobEvent>(
            EventType.PRINTER_JOB_COMPLETED,
            'system',
            {
                jobId,
                printerId,
                printerType: 'receipt', // Placeholder
                contentHash: 'hash_of_content',
                status: 'completed',
                timestamp: Date.now()
            }
        );

        console.log(`[PrinterManager] Job ${jobId} completed on ${printerId}`);
    }

    async reportError(jobId: string, printerId: string, error: string) {
        await this.eventEngine.createEvent<PrinterJobEvent>(
            EventType.PRINTER_ERROR,
            'system',
            {
                jobId,
                printerId,
                printerType: 'receipt',
                contentHash: 'error_content',
                status: 'failed',
                error,
                timestamp: Date.now()
            }
        );
    }

    getPrinters(): Printer[] {
        return Array.from(this.printers.values());
    }

    updatePrinterStatus(id: string, status: Printer['status']) {
        const p = this.printers.get(id);
        if (p) p.status = status;
    }
}
