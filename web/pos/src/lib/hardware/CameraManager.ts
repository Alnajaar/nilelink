/**
 * NileLink Camera Manager
 * 
 * Manages IP camera integration via ONVIF and RTSP:
 * - Camera discovery and registration
 * - Health monitoring and heartbeat
 * - PTZ control (simulated)
 * - Metadata extraction for VisionEngine
 */

import { EventEngine } from '../events/EventEngine';
import { LocalLedger } from '../storage/LocalLedger';
import { EventType, CameraLifecycleEvent, CameraEventRecordedEvent } from '../events/types';
import { v4 as uuidv4 } from 'uuid';

export interface CameraDevice {
    id: string;
    name: string;
    model: string;
    ipAddress: string;
    macAddress: string;
    status: 'online' | 'offline' | 'warning' | 'error';
    lastSeen: number;
    capabilities: CameraCapabilities;
    config: CameraConfig;
}

export interface CameraCapabilities {
    onvif: boolean;
    ptz: boolean;
    nightVision: boolean;
    audio: boolean;
    resolution: string;
}

export interface CameraConfig {
    streamUrl: string;
    username?: string;
    password?: string;
    fps: number;
    motionSensitivity: number;
    zones: CameraZone[];
}

export interface CameraZone {
    id: string;
    name: string;
    coordinates: Array<{ x: number; y: number }>;
}

export class CameraManager {
    private eventEngine: EventEngine;
    private ledger: LocalLedger;
    private cameras = new Map<string, CameraDevice>();
    private heartbeats = new Map<string, number>();

    private readonly MONITOR_INTERVAL = 30000; // 30 seconds
    private readonly HEARTBEAT_TIMEOUT = 60000; // 1 minute

    constructor(eventEngine: EventEngine, ledger: LocalLedger) {
        this.eventEngine = eventEngine;
        this.ledger = ledger;
        this.initializeCameras();
        this.startMonitoring();
    }

    /**
     * Initialize default cameras (simulation of discovery)
     */
    private async initializeCameras(): Promise<void> {
        const defaultCameras: CameraDevice[] = [
            {
                id: 'cam_checkout_1',
                name: 'Checkout Lane 1',
                model: 'Hikvision DS-2CD2143G0-I',
                ipAddress: '192.168.1.101',
                macAddress: '00:11:22:33:44:55',
                status: 'online',
                lastSeen: Date.now(),
                capabilities: {
                    onvif: true,
                    ptz: false,
                    nightVision: true,
                    audio: false,
                    resolution: '4K'
                },
                config: {
                    streamUrl: 'rtsp://192.168.1.101/Streaming/Channels/101',
                    fps: 30,
                    motionSensitivity: 75,
                    zones: [
                        { id: 'zone_bagging', name: 'Bagging Area', coordinates: [{ x: 10, y: 10 }, { x: 40, y: 40 }] },
                        { id: 'zone_scanning', name: 'Scanning Area', coordinates: [{ x: 50, y: 10 }, { x: 90, y: 40 }] }
                    ]
                }
            },
            {
                id: 'cam_aisle_1',
                name: 'Alcohol Aisle',
                model: 'Dahua IPC-HDBW2431R-ZS',
                ipAddress: '192.168.1.102',
                macAddress: 'AA:BB:CC:DD:EE:FF',
                status: 'online',
                lastSeen: Date.now(),
                capabilities: {
                    onvif: true,
                    ptz: true,
                    nightVision: true,
                    audio: true,
                    resolution: '2K'
                },
                config: {
                    streamUrl: 'rtsp://192.168.1.102/cam/realmonitor?channel=1&subtype=0',
                    fps: 15,
                    motionSensitivity: 50,
                    zones: []
                }
            }
        ];

        for (const camera of defaultCameras) {
            this.cameras.set(camera.id, camera);
            this.heartbeats.set(camera.id, camera.lastSeen);

            // Log connection event
            this.emitLifecycleEvent(camera, EventType.CAMERA_CONNECTED);
        }

        console.log('✅ Camera Manager initialized with', this.cameras.size, 'devices');
    }

    /**
     * Emit camera lifecycle event to the event engine (Web3 Anchoring)
     */
    private async emitLifecycleEvent(camera: CameraDevice, type: EventType.CAMERA_CONNECTED | EventType.CAMERA_DISCONNECTED | EventType.CAMERA_TAMPER_DETECTED): Promise<void> {
        await this.eventEngine.createEvent<CameraLifecycleEvent>(
            type,
            'system',
            {
                cameraId: camera.id,
                location: camera.name,
                status: camera.status,
                timestamp: Date.now(),
                reason: camera.status === 'offline' ? 'Heartbeat timeout' : undefined
            }
        );
    }

    /**
     * Start camera health monitoring
     */
    private startMonitoring(): void {
        setInterval(() => {
            this.monitorHealth();
        }, this.MONITOR_INTERVAL);
    }

    /**
     * Check heartbeats and update status
     */
    private monitorHealth(): void {
        const now = Date.now();
        for (const [id, lastSeen] of this.heartbeats) {
            const camera = this.cameras.get(id);
            if (!camera) continue;

            if (now - lastSeen > this.HEARTBEAT_TIMEOUT) {
                if (camera.status !== 'offline') {
                    camera.status = 'offline';
                    this.emitLifecycleEvent(camera, EventType.CAMERA_DISCONNECTED);
                    console.warn(`🚨 Camera ${camera.id} (${camera.name}) went offline!`);
                }
            } else if (camera.status === 'offline') {
                camera.status = 'online';
                this.emitLifecycleEvent(camera, EventType.CAMERA_CONNECTED);
                console.log(`✅ Camera ${camera.id} (${camera.name}) back online.`);
            }
        }
    }

    /**
     * Record a vision event (e.g., motion, person detected)
     * This is usually called by the NVR/VisionEngine
     */
    async recordCameraEvent(
        cameraId: string,
        eventType: 'motion' | 'person_detected' | 'item_pickup' | 'checkout_activity',
        metadata: Record<string, any>,
        confidence: number = 1.0,
        transactionId?: string
    ): Promise<void> {
        const camera = this.cameras.get(cameraId);
        if (!camera) return;

        // Update heartbeat
        this.heartbeats.set(cameraId, Date.now());
        camera.lastSeen = Date.now();

        // Create recording event
        await this.eventEngine.createEvent<CameraEventRecordedEvent>(
            EventType.CAMERA_EVENT_RECORDED,
            'vision_engine',
            {
                cameraId,
                timestamp: Date.now(),
                eventType,
                transactionId,
                location: {
                    x: metadata.x || 0,
                    y: metadata.y || 0,
                    zone: metadata.zone || 'general'
                },
                confidence,
                metadata
            }
        );
    }

    /**
     * Handle camera tampering (e.g., lens covered)
     */
    async handleTampering(cameraId: string, reason: string): Promise<void> {
        const camera = this.cameras.get(cameraId);
        if (!camera) return;

        camera.status = 'warning';
        await this.emitLifecycleEvent(camera, EventType.CAMERA_TAMPER_DETECTED);
        console.error(`⚠️ TAMPER ALERT: Camera ${cameraId} - ${reason}`);
    }

    /**
     * Get camera by ID
     */
    getCamera(id: string): CameraDevice | undefined {
        return this.cameras.get(id);
    }

    /**
     * Get all cameras
     */
    getAllCameras(): CameraDevice[] {
        return Array.from(this.cameras.values());
    }

    /**
     * Simulate a heartbeat from a camera
     */
    async receiveHeartbeat(cameraId: string): Promise<void> {
        if (this.cameras.has(cameraId)) {
            this.heartbeats.set(cameraId, Date.now());
            this.cameras.get(cameraId)!.lastSeen = Date.now();
        }
    }
}
