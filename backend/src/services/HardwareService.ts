import net from 'net';

/**
 * Hardware Service for POS Peripherals
 * Supports ESC/POS printers and cash drawers
 */
export class HardwareService {
    /**
     * Generate ESC/POS commands for cash drawer
     * Command: ESC p m t1 t2 (0x1B 0x70 0x00 0x19 0xFA)
     */
    getCashDrawerCommand(): Buffer {
        return Buffer.from([0x1B, 0x70, 0x00, 0x19, 0xFA]);
    }

    /**
     * Generate ESC/POS receipt for order
     */
    generateReceipt(order: any): Buffer {
        const commands: number[] = [];

        // Initialize printer
        commands.push(0x1B, 0x40); // ESC @

        // Center align
        commands.push(0x1B, 0x61, 0x01);

        // Bold on
        commands.push(0x1B, 0x45, 0x01);

        // Restaurant name
        const name = order.restaurant?.name || 'NileLink POS';
        commands.push(...Buffer.from(name + '\n'));

        // Bold off
        commands.push(0x1B, 0x45, 0x00);

        // Left align
        commands.push(0x1B, 0x61, 0x00);

        // Separator
        commands.push(...Buffer.from('--------------------------------\n'));

        // Order details
        commands.push(...Buffer.from(`Order #: ${order.orderNumber}\n`));
        commands.push(...Buffer.from(`Date: ${new Date(order.createdAt).toLocaleString()}\n`));
        commands.push(...Buffer.from('--------------------------------\n'));

        // Items
        if (order.items) {
            for (const item of order.items) {
                const line = `${item.quantity}x ${item.menuItem?.name || 'Item'}\n`;
                commands.push(...Buffer.from(line));

                const price = `   $${Number(item.totalPrice).toFixed(2)}\n`;
                commands.push(...Buffer.from(price));
            }
        }

        commands.push(...Buffer.from('--------------------------------\n'));

        // Totals
        const subtotal = `Subtotal: $${(Number(order.totalAmount) - Number(order.taxAmount)).toFixed(2)}\n`;
        commands.push(...Buffer.from(subtotal));

        const tax = `Tax: $${Number(order.taxAmount).toFixed(2)}\n`;
        commands.push(...Buffer.from(tax));

        if (order.tipAmount > 0) {
            const tip = `Tip: $${Number(order.tipAmount).toFixed(2)}\n`;
            commands.push(...Buffer.from(tip));
        }

        // Bold on for total
        commands.push(0x1B, 0x45, 0x01);
        const total = `TOTAL: $${Number(order.totalAmount).toFixed(2)}\n`;
        commands.push(...Buffer.from(total));
        commands.push(0x1B, 0x45, 0x00);

        commands.push(...Buffer.from('--------------------------------\n'));

        // Payment method
        const payment = `Payment: ${order.paymentMethod || 'N/A'}\n`;
        commands.push(...Buffer.from(payment));

        // Thank you message
        commands.push(0x1B, 0x61, 0x01); // Center
        commands.push(...Buffer.from('\nThank you!\n'));
        commands.push(...Buffer.from('Visit us again\n\n'));

        // Cut paper
        commands.push(0x1D, 0x56, 0x00); // GS V 0

        return Buffer.from(commands);
    }

    /**
     * Generate kitchen order ticket
     */
    generateKitchenTicket(order: any): Buffer {
        const commands: number[] = [];

        // Initialize
        commands.push(0x1B, 0x40);

        // Double width + height for visibility
        commands.push(0x1D, 0x21, 0x11);

        // Center align
        commands.push(0x1B, 0x61, 0x01);

        // Order number
        commands.push(...Buffer.from(`#${order.orderNumber}\n\n`));

        // Normal size
        commands.push(0x1D, 0x21, 0x00);

        // Left align
        commands.push(0x1B, 0x61, 0x00);

        // Items with quantities
        if (order.items) {
            for (const item of order.items) {
                // Item quantity and name
                commands.push(0x1D, 0x21, 0x01); // Double width
                const itemLine = `${item.quantity}x ${item.menuItem?.name}\n`;
                commands.push(...Buffer.from(itemLine));
                commands.push(0x1D, 0x21, 0x00); // Normal

                // Special instructions
                if (item.specialInstructions) {
                    commands.push(...Buffer.from(`   * ${item.specialInstructions}\n`));
                }

                commands.push(...Buffer.from('\n'));
            }
        }

        // Time
        const time = new Date(order.createdAt).toLocaleTimeString();
        commands.push(...Buffer.from(`Time: ${time}\n`));

        // Cut
        commands.push(0x1D, 0x56, 0x00);

        return Buffer.from(commands);
    }

    /**
     * Send raw ESC/POS commands to network printer
     */
    async printToNetworkPrinter(printerIP: string, port: number, data: Buffer): Promise<void> {

        return new Promise((resolve, reject) => {
            const client = new net.Socket();

            client.connect(port, printerIP, () => {
                client.write(data);
                client.end();
            });

            client.on('close', () => {
                resolve();
            });

            client.on('error', (err: any) => {
                reject(err);
            });

            // Timeout after 5 seconds
            client.setTimeout(5000, () => {
                client.destroy();
                reject(new Error('Printer timeout'));
            });
        });
    }

    /**
     * Auto-open cash drawer (usually connected to receipt printer)
     */
    async openCashDrawer(printerIP: string, port: number = 9100): Promise<void> {
        const drawerCommand = this.getCashDrawerCommand();
        await this.printToNetworkPrinter(printerIP, port, drawerCommand);
    }
}

export const hardwareService = new HardwareService();
