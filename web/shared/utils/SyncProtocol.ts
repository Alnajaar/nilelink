/**
 * SyncProtocol - Mission Critical State Convergence
 * 
 * Implements Vector Clock logic to resolve conflicts between
 * distributed edge nodes (POS, Delivery, Supplier).
 */

export interface VectorClock {
    [nodeId: string]: number;
}

export interface SyncObject<T> {
    data: T;
    clock: VectorClock;
    lastHash: string;
    updatedAt: number;
}

export class SyncProtocol {
    /**
     * Resolves conflict between two versions of the same object
     * Uses Vector Clock 'Happened-Before' relation.
     */
    static resolve<T>(local: SyncObject<T>, remote: SyncObject<T>): SyncObject<T> {
        const localIsNewer = this.isNewer(local.clock, remote.clock);
        const remoteIsNewer = this.isNewer(remote.clock, local.clock);

        if (localIsNewer && !remoteIsNewer) {
            return local;
        }

        if (remoteIsNewer && !localIsNewer) {
            return remote;
        }

        // Concurrent Conflict: Fallback to Last-Writer-Wins (Timestamp)
        if (remote.updatedAt > local.updatedAt) {
            return remote;
        }

        return local;
    }

    /**
     * Merges two vector clocks
     */
    static mergeClocks(a: VectorClock, b: VectorClock): VectorClock {
        const merged: VectorClock = { ...a };
        for (const node in b) {
            merged[node] = Math.max(merged[node] || 0, b[node]);
        }
        return merged;
    }

    /**
     * Checks if clock A is strictly newer than clock B
     */
    private static isNewer(a: VectorClock, b: VectorClock): boolean {
        let greater = false;
        for (const node in a) {
            if (a[node] > (b[node] || 0)) {
                greater = true;
            } else if (a[node] < (b[node] || 0)) {
                return false;
            }
        }
        return greater;
    }

    /**
     * Increment clock for a specific node
     */
    static increment(clock: VectorClock, nodeId: string): VectorClock {
        return {
            ...clock,
            [nodeId]: (clock[nodeId] || 0) + 1
        };
    }
}
