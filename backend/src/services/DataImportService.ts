import { PrismaClient } from '@prisma/client';
import * as XLSX from 'xlsx';
import { parse } from 'papaparse';

const prisma = new PrismaClient();

interface ImportJobResult {
    success: boolean;
    importedCount: number;
    errorCount: number;
    errors: any[];
}

/**
 * Data Import Service
 * Handles Excel, CSV imports for menu items, inventory, etc.
 */
export class DataImportService {
    /**
     * Import menu items from Excel/CSV file
     */
    async importMenuItems(
        tenantId: string,
        restaurantId: string,
        fileBuffer: Buffer,
        fileName: string,
        columnMapping: Record<string, string>
    ): Promise<ImportJobResult> {
        const result: ImportJobResult = {
            success: true,
            importedCount: 0,
            errorCount: 0,
            errors: []
        };

        try {
            // Parse file based on extension
            let rows: any[] = [];

            if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
                // Parse Excel
                const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                rows = XLSX.utils.sheet_to_json(worksheet);
            } else if (fileName.endsWith('.csv')) {
                // Parse CSV
                const csvString = fileBuffer.toString('utf-8');
                const parsed = parse(csvString, { header: true });
                rows = parsed.data as any[];
            } else {
                throw new Error('Unsupported file format. Use .xlsx, .xls, or .csv');
            }

            console.log(`Parsed ${rows.length} rows from ${fileName}`);

            // Process each row
            for (const [index, row] of rows.entries()) {
                try {
                    // Map columns to MenuItem fields
                    const menuItemData = {
                        restaurantId,
                        name: row[columnMapping.name] || row.name || row['Product Name'],
                        description: row[columnMapping.description] || row.description || row.Description,
                        price: parseFloat(row[columnMapping.price] || row.price || row.Price || '0'),
                        category: row[columnMapping.category] || row.category || row.Category || 'Uncategorized',
                        isAvailable: true,
                    };

                    // Validate required fields
                    if (!menuItemData.name || menuItemData.price <= 0) {
                        result.errors.push({
                            row: index + 1,
                            error: 'Missing required fields: name or price',
                            data: row
                        });
                        result.errorCount++;
                        continue;
                    }

                    // Create menu item
                    await prisma.menuItem.create({
                        data: menuItemData
                    });

                    result.importedCount++;
                } catch (error: any) {
                    result.errors.push({
                        row: index + 1,
                        error: error.message,
                        data: row
                    });
                    result.errorCount++;
                }
            }

            result.success = result.errorCount === 0;
        } catch (error: any) {
            result.success = false;
            result.errors.push({
                error: 'File processing failed',
                message: error.message
            });
        }

        return result;
    }

    /**
     * Import inventory from Excel/CSV
     */
    async importInventory(
        tenantId: string,
        restaurantId: string,
        fileBuffer: Buffer,
        fileName: string,
        columnMapping: Record<string, string>
    ): Promise<ImportJobResult> {
        const result: ImportJobResult = {
            success: true,
            importedCount: 0,
            errorCount: 0,
            errors: []
        };

        try {
            let rows: any[] = [];

            if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
                const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                rows = XLSX.utils.sheet_to_json(worksheet);
            } else if (fileName.endsWith('.csv')) {
                const csvString = fileBuffer.toString('utf-8');
                const parsed = parse(csvString, { header: true });
                rows = parsed.data as any[];
            }

            for (const [index, row] of rows.entries()) {
                try {
                    const inventoryData = {
                        restaurantId,
                        itemName: row[columnMapping.itemName] || row.itemName || row['Item Name'],
                        sku: row[columnMapping.sku] || row.sku || row.SKU,
                        quantity: parseFloat(row[columnMapping.quantity] || row.quantity || row.Quantity || '0'),
                        unit: row[columnMapping.unit] || row.unit || row.Unit || 'unit',
                        minimumLevel: parseFloat(row[columnMapping.minimumLevel] || row.minimumLevel || '0'),
                        costPerUnit: parseFloat(row[columnMapping.costPerUnit] || row.costPerUnit || row.Cost || '0'),
                    };

                    if (!inventoryData.itemName) {
                        result.errors.push({
                            row: index + 1,
                            error: 'Missing item name',
                            data: row
                        });
                        result.errorCount++;
                        continue;
                    }

                    await prisma.inventory.create({
                        data: inventoryData as any
                    });

                    result.importedCount++;
                } catch (error: any) {
                    result.errors.push({
                        row: index + 1,
                        error: error.message,
                        data: row
                    });
                    result.errorCount++;
                }
            }

            result.success = result.errorCount === 0;
        } catch (error: any) {
            result.success = false;
            result.errors.push({
                error: 'File processing failed',
                message: error.message
            });
        }

        return result;
    }

    /**
     * Preview import file (first 10 rows)
     */
    async previewFile(fileBuffer: Buffer, fileName: string): Promise<any[]> {
        try {
            let rows: any[] = [];

            if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
                const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                rows = XLSX.utils.sheet_to_json(worksheet);
            } else if (fileName.endsWith('.csv')) {
                const csvString = fileBuffer.toString('utf-8');
                const parsed = parse(csvString, { header: true });
                rows = parsed.data as any[];
            }

            return rows.slice(0, 10); // Return first 10 rows
        } catch (error) {
            console.error('Preview error:', error);
            return [];
        }
    }
}

export const dataImportService = new DataImportService();
