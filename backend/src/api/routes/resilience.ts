import { Router } from 'express';
import { prisma } from '../../services/DatabasePoolService';
import { authenticate } from '../../middleware/authenticate';
import { logger } from '../../utils/logger';
import { z } from 'zod';

const router = Router();
import { resilienceService } from '../../services/ResilienceService';

const heartBeatSchema = z.object({
    nodeId: z.string(),
    status: z.enum(['HEALTHY', 'DEGRADED', 'MAINTENANCE']).optional().default('HEALTHY'),
    load: z.string().optional()
});

const chaosTriggerSchema = z.object({
    type: z.enum(['NODE_FAILURE', 'NETWORK_LATENCY', 'BRIDGE_CONGESTION', 'SUPPLIER_OUTAGE']),
    target: z.string(),
    duration: z.number().optional().default(300), // seconds
    severity: z.number().min(1).max(10).optional().default(5)
});

// Chaos Memory - Store active stressors
let activeStressors: any[] = [];

// POST /api/resilience/heartbeat - Node check-in
router.post('/heartbeat', async (req, res) => {
    try {
        const { nodeId, status, load } = heartBeatSchema.parse(req.body);
        resilienceService.recordHeartbeat(nodeId, status);
        res.json({ success: true });
    } catch (error) {
        res.status(400).json({ success: false });
    }
});

// POST /api/resilience/chaos/trigger - Manually trigger a chaos event (Admin/DAO only)
router.post('/chaos/trigger', authenticate, async (req, res) => {
    try {
        const { type, target, duration, severity } = chaosTriggerSchema.parse(req.body);

        const event = {
            id: `chaos_${Date.now()}`,
            type,
            target,
            severity,
            startTime: new Date(),
            expiresAt: new Date(Date.now() + duration * 1000),
            status: 'ACTIVE'
        };

        activeStressors.push(event);

        logger.warn('CHAOS EVENT TRIGGERED', event);

        // Simulate system impact (e.g., logging to event store for AI agents to pick up)
        await prisma.domainEvent.create({
            data: {
                eventType: 'ChaosEventTriggered',
                aggregateId: target,
                aggregateType: 'SYSTEM',
                eventData: JSON.stringify(event),
                eventDataIv: 'none',
                eventDataHash: 'none',
                version: 1,
                timestamp: new Date()
            }
        });

        res.json({ success: true, message: 'Chaos event injected', data: event });
    } catch (error) {
        res.status(400).json({ success: false, error: 'Invalid chaos parameters' });
    }
});

// GET /api/resilience/health/global - Global node health status
router.get('/health/global', async (req, res) => {
    try {
        // Simulated health check for ecosystem nodes
        const nodes = [
            { id: 'pos-main-cairo', type: 'POS_GATEWAY', status: 'HEALTHY', latency: '42ms', region: 'ME-NORTH' },
            { id: 'supplier-delta-01', type: 'SUPPLIER_NODE', status: activeStressors.find(s => s.target === 'supplier-delta-01') ? 'DEGRADED' : 'HEALTHY', latency: '110ms', region: 'DE-WEST' },
            { id: 'bridge-eth-poly', type: 'BRIDGE_ORACLE', status: 'HEALTHY', latency: '1.2s', region: 'GLOBAL' },
            { id: 'ai-orchestrator', type: 'INTELLIGENCE_LAYER', status: 'HEALTHY', load: '24%', region: 'US-EAST' }
        ];

        res.json({
            success: true,
            data: {
                nodes,
                activeStressors: activeStressors.filter(s => s.expiresAt > new Date()),
                timestamp: new Date()
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Health aggregation failed' });
    }
});

// GET /api/resilience/chaos/active - List active stressors
router.get('/chaos/active', (req, res) => {
    activeStressors = activeStressors.filter(s => s.expiresAt > new Date());
    res.json({ success: true, data: activeStressors });
});

export default router;
