import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../services/DatabasePoolService';
import { logger } from '../../utils/logger';

const router = Router();

// Validation schemas
const ContactFormSchema = z.object({
    name: z.string().min(2).max(100),
    email: z.string().email(),
    company: z.string().max(100).optional(),
    message: z.string().min(10).max(2000),
    subject: z.string().max(200).optional(),
    phone: z.string().max(20).optional(),
    category: z.enum(['GENERAL', 'SUPPORT', 'BUSINESS', 'TECHNICAL', 'PARTNERSHIP']).default('GENERAL')
});

const SupportTicketSchema = z.object({
    title: z.string().min(5).max(200),
    description: z.string().min(10).max(5000),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
    category: z.string().max(50).optional(),
    attachments: z.array(z.string()).optional() // URLs to uploaded files
});

/**
 * POST /api/contact/form
 * Handle general contact form submissions
 */
router.post('/form', async (req, res) => {
    try {
        const validatedData = ContactFormSchema.parse(req.body);
        const { name, email, company, message, subject, phone, category } = validatedData;

        // Create contact submission record
        const contactSubmission = await prisma.systemConfig.create({
            data: {
                key: `contact_form_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                value: JSON.stringify({
                    name,
                    email,
                    company: company || '',
                    message,
                    subject: subject || 'General Inquiry',
                    phone: phone || '',
                    category,
                    submittedAt: new Date().toISOString(),
                    status: 'NEW',
                    source: 'WEBSITE_CONTACT_FORM'
                }),
                description: 'Contact form submission from website'
            }
        });

        // Log the submission
        logger.info('Contact form submitted', {
            name,
            email,
            category,
            submissionId: contactSubmission.id
        });

        // TODO: Integrate with email service to notify support team
        // TODO: Send confirmation email to user
        // TODO: Create ticket in support system

        res.json({
            success: true,
            message: 'Thank you for your message! We\'ll get back to you within 24 hours.',
            data: {
                submissionId: contactSubmission.id,
                estimatedResponseTime: '24 hours'
            }
        });

    } catch (error) {
        logger.error('Contact form submission failed', { error });
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                success: false,
                error: 'Validation error',
                details: error.errors
            });
        }

        res.status(500).json({
            success: false,
            error: 'Failed to submit contact form'
        });
    }
});

/**
 * POST /api/contact/support
 * Create a support ticket
 */
router.post('/support', async (req, res) => {
    try {
        const { title, description, priority, category, attachments, userId } = req.body;

        // Create support ticket record
        const ticketId = `ticket_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        const supportTicket = await prisma.systemConfig.create({
            data: {
                key: `support_ticket_${ticketId}`,
                value: JSON.stringify({
                    ticketId,
                    title,
                    description,
                    priority: priority || 'MEDIUM',
                    category: category || 'GENERAL',
                    attachments: attachments || [],
                    status: 'OPEN',
                    createdAt: new Date().toISOString(),
                    userId: userId || null,
                    assignedTo: null,
                    tags: [],
                    updates: [{
                        timestamp: new Date().toISOString(),
                        action: 'CREATED',
                        details: 'Support ticket created via contact form'
                    }]
                }),
                description: `Support ticket: ${title}`
            }
        });

        logger.info('Support ticket created', {
            ticketId,
            title,
            priority,
            category
        });

        res.json({
            success: true,
            message: 'Support ticket created successfully. Our team will respond soon.',
            data: {
                ticketId,
                status: 'OPEN',
                estimatedResponseTime: priority === 'URGENT' ? '2 hours' : '24 hours'
            }
        });

    } catch (error) {
        logger.error('Support ticket creation failed', { error });
        res.status(500).json({
            success: false,
            error: 'Failed to create support ticket'
        });
    }
});

/**
 * GET /api/contact/categories
 * Get available contact categories
 */
router.get('/categories', async (req, res) => {
    const categories = [
        { id: 'GENERAL', name: 'General Inquiry', description: 'General questions about NileLink' },
        { id: 'SUPPORT', name: 'Technical Support', description: 'Help with using our platform' },
        { id: 'BUSINESS', name: 'Business Inquiry', description: 'Partnerships, integrations, enterprise solutions' },
        { id: 'TECHNICAL', name: 'Technical Questions', description: 'API, development, technical specifications' },
        { id: 'PARTNERSHIP', name: 'Partnership Opportunities', description: 'Collaborations and business development' }
    ];

    res.json({
        success: true,
        data: { categories }
    });
});

/**
 * GET /api/contact/stats
 * Get contact form statistics (for admin dashboard)
 */
router.get('/stats', async (req, res) => {
    try {
        // Get recent contact submissions
        const recentSubmissions = await prisma.systemConfig.findMany({
            where: {
                key: { startsWith: 'contact_form_' }
            },
            take: 100
        });

        const submissions = recentSubmissions.map(record => JSON.parse(record.value as string));

        // Calculate stats
        const stats = {
            totalSubmissions: submissions.length,
            submissionsThisWeek: submissions.filter(s =>
                new Date(s.submittedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            ).length,
            submissionsThisMonth: submissions.filter(s =>
                new Date(s.submittedAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            ).length,
            categoryBreakdown: submissions.reduce((acc: any, sub: any) => {
                acc[sub.category] = (acc[sub.category] || 0) + 1;
                return acc;
            }, {}),
            averageResponseTime: '24 hours', // TODO: Calculate from actual response data
            unresolvedCount: submissions.filter((s: any) => s.status === 'NEW').length
        };

        res.json({
            success: true,
            data: { stats, recentSubmissions: submissions.slice(0, 10) }
        });

    } catch (error) {
        logger.error('Failed to get contact stats', { error });
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve contact statistics'
        });
    }
});

export default router;
