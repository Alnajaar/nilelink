/**
 * NileLink Chaos Engine
 * 
 * "Chaos Monkey" for retail POS:
 * - Deterministic and randomized failure injection
 * - Network isolation simulation
 * - Hardware timeout/latency injection
 * - State corruption testing
 * 
 * Used to verify the self-healing and decentralized resilience of the ecosystem.
 */

import { EventEngine } from '../events/EventEngine';
import { HardwareMonitor } from '../hardware/HardwareMonitor';
import { OfflineManager } from './OfflineManager';

export class ChaosEngine {
    private eventEngine: EventEngine;
    private hwMonitor: HardwareMonitor;
    private offlineManager: OfflineManager;
    private activeExperiments: Set<string> = new Set();

    constructor(
        eventEngine: EventEngine,
        hwMonitor: HardwareMonitor,
        offlineManager: OfflineManager
    ) {
        this.eventEngine = eventEngine;
        this.hwMonitor = hwMonitor;
        this.offlineManager = offlineManager;
    }

    /**
     * Simulate a network "Brownout" (Packet loss / High Latency)
     */
    public simulateNetworkDegradation(durationMs: number): void {
        console.log(`🧨 CHAOS: Injecting Network Degradation for ${durationMs}ms...`);
        this.activeExperiments.add('network_degradation');

        // In a real browser we might intercept fetch or use a proxy
        // Here we simulate the logical impact on the state machines
        (window as any).isNetworkDegraded = true;

        setTimeout(() => {
            (window as any).isNetworkDegraded = false;
            this.activeExperiments.delete('network_degradation');
            console.log('✅ CHAOS: Network recovered.');
        }, durationMs);
    }

    /**
     * Simulate a complete Network "Blackout"
     */
    public simulateNetworkOutage(): void {
        console.log('🧨 CHAOS: Injecting Network Outage (Offline Mode)...');
        // This triggers the OfflineManager's resilience logic
        this.offlineManager.handleConnectivityChange(false);
    }

    /**
     * Inject hardware failure on a specific peripheral
     */
    public simulateHardwareFailure(type: 'scanner' | 'printer' | 'rfid'): void {
        console.log(`🧨 CHAOS: Killing ${type} peripheral...`);
        // We bypass the HAL to simulate a "dead" device at the monitor level
        const hwState = this.hwMonitor.getHardwareState() as any;
        if (type === 'scanner') hwState.scanner = null;
        if (type === 'printer') hwState.printer = null;
        if (type === 'rfid') hwState.rfidReader = null;

        this.eventEngine.createEvent('HARDWARE_ERROR' as any, 'chaos_engine', { type, error: 'TIMEOUT' });
    }

    /**
     * Randomly inject a failure every 5-10 minutes to test long-term stability
     */
    public startRandomMonkeyEffect(): void {
        console.log('🐒 CHAOS: Chaos Monkey is now loose in the store.');
        const nextAttack = Math.random() * 300000 + 300000; // 5-10 mins

        setTimeout(() => {
            const types = ['network', 'hardware', 'latency'];
            const choice = types[Math.floor(Math.random() * types.length)];

            if (choice === 'network') this.simulateNetworkDegradation(30000);
            if (choice === 'hardware') this.simulateHardwareFailure('scanner');

            this.startRandomMonkeyEffect(); // Schedule next
        }, nextAttack);
    }

    /**
     * Clear all synthetic failures
     */
    public stopAllExperiments(): void {
        this.activeExperiments.clear();
        (window as any).isNetworkDegraded = false;
        this.offlineManager.handleConnectivityChange(true);
        console.log('🛡️ CHAOS: All experiments stopped. System return to baseline.');
    }
}
