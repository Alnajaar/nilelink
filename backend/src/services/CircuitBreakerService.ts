import { logger } from '../utils/logger';

export enum CircuitState {
    CLOSED = 'CLOSED',     // Normal operation
    OPEN = 'OPEN',         // Circuit is open, failing fast
    HALF_OPEN = 'HALF_OPEN' // Testing if service recovered
}

export interface CircuitBreakerConfig {
    failureThreshold: number;    // Number of failures before opening
    recoveryTimeout: number;     // Time to wait before trying again (ms)
    monitoringPeriod: number;    // Time window to track failures (ms)
    successThreshold: number;    // Successes needed to close circuit in HALF_OPEN
}

export class CircuitBreakerService {
    private circuits: Map<string, {
        state: CircuitState;
        failures: number;
        successes: number;
        lastFailureTime: number;
        nextAttemptTime: number;
        config: CircuitBreakerConfig;
    }> = new Map();

    constructor() {
        // Start monitoring loop
        if (process.env.NODE_ENV !== 'test') {
            setInterval(() => this.monitorCircuits(), 30000); // Check every 30 seconds
        }
    }

    async execute<T>(
        serviceName: string,
        operation: () => Promise<T>,
        config: Partial<CircuitBreakerConfig> = {}
    ): Promise<T> {
        const circuit = this.getOrCreateCircuit(serviceName, config);

        switch (circuit.state) {
            case CircuitState.OPEN:
                if (Date.now() < circuit.nextAttemptTime) {
                    throw new Error(`Circuit breaker is OPEN for ${serviceName}`);
                }
                circuit.state = CircuitState.HALF_OPEN;
                logger.info(`Circuit breaker HALF_OPEN for ${serviceName}`);

            case CircuitState.HALF_OPEN:
            case CircuitState.CLOSED:
                try {
                    const result = await operation();

                    // Success - reset failure count
                    circuit.failures = 0;
                    circuit.successes++;

                    if (circuit.state === CircuitState.HALF_OPEN && circuit.successes >= circuit.config.successThreshold) {
                        circuit.state = CircuitState.CLOSED;
                        circuit.successes = 0;
                        logger.info(`Circuit breaker CLOSED for ${serviceName}`);
                    }

                    return result;

                } catch (error) {
                    circuit.failures++;
                    circuit.lastFailureTime = Date.now();

                    if (circuit.failures >= circuit.config.failureThreshold) {
                        circuit.state = CircuitState.OPEN;
                        circuit.nextAttemptTime = Date.now() + circuit.config.recoveryTimeout;
                        logger.warn(`Circuit breaker OPENED for ${serviceName}`, {
                            failures: circuit.failures,
                            threshold: circuit.config.failureThreshold
                        });
                    }

                    throw error;
                }
        }
    }

    getCircuitState(serviceName: string): CircuitState | null {
        const circuit = this.circuits.get(serviceName);
        return circuit ? circuit.state : null;
    }

    resetCircuit(serviceName: string): void {
        const circuit = this.circuits.get(serviceName);
        if (circuit) {
            circuit.state = CircuitState.CLOSED;
            circuit.failures = 0;
            circuit.successes = 0;
            logger.info(`Circuit breaker manually reset for ${serviceName}`);
        }
    }

    private getOrCreateCircuit(serviceName: string, config: Partial<CircuitBreakerConfig>) {
        if (!this.circuits.has(serviceName)) {
            const defaultConfig: CircuitBreakerConfig = {
                failureThreshold: 5,
                recoveryTimeout: 60000, // 1 minute
                monitoringPeriod: 300000, // 5 minutes
                successThreshold: 3,
                ...config
            };

            this.circuits.set(serviceName, {
                state: CircuitState.CLOSED,
                failures: 0,
                successes: 0,
                lastFailureTime: 0,
                nextAttemptTime: 0,
                config: defaultConfig
            });
        }

        return this.circuits.get(serviceName)!;
    }

    private monitorCircuits(): void {
        const now = Date.now();

        for (const [serviceName, circuit] of this.circuits) {
            // Reset failure count if monitoring period has passed
            if (circuit.failures > 0 &&
                (now - circuit.lastFailureTime) > circuit.config.monitoringPeriod) {
                circuit.failures = 0;
                logger.debug(`Reset failure count for ${serviceName} after monitoring period`);
            }

            // Check if OPEN circuit should transition to HALF_OPEN
            if (circuit.state === CircuitState.OPEN && now >= circuit.nextAttemptTime) {
                circuit.state = CircuitState.HALF_OPEN;
                circuit.successes = 0;
                logger.info(`Circuit breaker transitioning to HALF_OPEN for ${serviceName}`);
            }
        }
    }

    getStats(): Record<string, any> {
        const stats: Record<string, any> = {};

        for (const [serviceName, circuit] of this.circuits) {
            stats[serviceName] = {
                state: circuit.state,
                failures: circuit.failures,
                successes: circuit.successes,
                lastFailureTime: circuit.lastFailureTime,
                nextAttemptTime: circuit.nextAttemptTime,
                threshold: circuit.config.failureThreshold
            };
        }

        return stats;
    }
}

// Global circuit breaker instance
export const circuitBreaker = new CircuitBreakerService();
