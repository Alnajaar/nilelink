import { Router, Request, Response } from 'express';
import multer from 'multer';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/authenticate';
import { extractTenant } from '../middleware/tenantContext';
import { requirePermission } from '../middleware/authorize';
import { dataImportService } from '../services/DataImportService';

const router = Router();
const prisma = new PrismaClient();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        const allowed = ['.xlsx', '.xls', '.csv'];
        const ext = file.originalname.toLowerCase().slice(file.originalname.lastIndexOf('.'));
        if (allowed.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only Excel and CSV files are allowed.'));
        }
    }
});

// ============================================================================
// DATA IMPORT ROUTES
// ============================================================================

/**
 * POST /api/imports/preview
 * Preview uploaded file (first 10 rows)
 */
router.post('/preview',
    extractTenant,
    authenticate,
    upload.single('file'),
    async (req: Request, res: Response) => {
        try {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    error: 'No file uploaded'
                });
            }

            const preview = await dataImportService.previewFile(
                req.file.buffer,
                req.file.originalname
            );

            res.json({
                success: true,
                data: {
                    fileName: req.file.originalname,
                    rowCount: preview.length,
                    columns: preview.length > 0 ? Object.keys(preview[0]) : [],
                    preview: preview.slice(0, 10),
                }
            });
        } catch (error: any) {
            console.error('Preview error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to preview file'
            });
        }
    }
);

/**
 * POST /api/imports/menu
 * Import menu items from file
 */
router.post('/menu',
    extractTenant,
    authenticate,
    requirePermission('MENU', 'CREATE'),
    upload.single('file'),
    async (req: Request, res: Response) => {
        try {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    error: 'No file uploaded'
                });
            }

            const { restaurantId, columnMapping } = req.body;
            const mapping = JSON.parse(columnMapping || '{}');

            const result = await dataImportService.importMenuItems(
                req.tenantId!,
                restaurantId,
                req.file.buffer,
                req.file.originalname,
                mapping
            );

            // Create import job record
            await prisma.importJob.create({
                data: {
                    tenantId: req.tenantId!,
                    userId: req.user.id,
                    type: 'MENU_ITEMS',
                    status: result.success ? 'COMPLETED' : 'FAILED',
                    fileName: req.file.originalname,
                    fileUrl: 'memory', // In production, upload to S3
                    totalRows: result.importedCount + result.errorCount,
                    processedRows: result.importedCount + result.errorCount,
                    successCount: result.importedCount,
                    errorCount: result.errorCount,
                    errors: result.errors,
                    mappings: mapping,
                    startedAt: new Date(),
                    completedAt: new Date(),
                }
            });

            res.status(result.success ? 200 : 207).json({
                success: result.success,
                data: result
            });
        } catch (error: any) {
            console.error('Import menu error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to import menu items'
            });
        }
    }
);

/**
 * POST /api/imports/inventory
 * Import inventory from file
 */
router.post('/inventory',
    extractTenant,
    authenticate,
    requirePermission('INVENTORY', 'CREATE'),
    upload.single('file'),
    async (req: Request, res: Response) => {
        try {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    error: 'No file uploaded'
                });
            }

            const { restaurantId, columnMapping } = req.body;
            const mapping = JSON.parse(columnMapping || '{}');

            const result = await dataImportService.importInventory(
                req.tenantId!,
                restaurantId,
                req.file.buffer,
                req.file.originalname,
                mapping
            );

            await prisma.importJob.create({
                data: {
                    tenantId: req.tenantId!,
                    userId: req.user.id,
                    type: 'INVENTORY',
                    status: result.success ? 'COMPLETED' : 'FAILED',
                    fileName: req.file.originalname,
                    fileUrl: 'memory',
                    totalRows: result.importedCount + result.errorCount,
                    processedRows: result.importedCount + result.errorCount,
                    successCount: result.importedCount,
                    errorCount: result.errorCount,
                    errors: result.errors,
                    mappings: mapping,
                    startedAt: new Date(),
                    completedAt: new Date(),
                }
            });

            res.status(result.success ? 200 : 207).json({
                success: result.success,
                data: result
            });
        } catch (error: any) {
            console.error('Import inventory error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to import inventory'
            });
        }
    }
);

/**
 * GET /api/imports/jobs
 * List import jobs history
 */
router.get('/jobs',
    extractTenant,
    authenticate,
    async (req: Request, res: Response) => {
        try {
            const jobs = await prisma.importJob.findMany({
                where: { tenantId: req.tenantId },
                orderBy: { createdAt: 'desc' },
                take: 50,
            });

            res.json({
                success: true,
                data: jobs
            });
        } catch (error) {
            console.error('List import jobs error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch import jobs'
            });
        }
    }
);

export default router;
