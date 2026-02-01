import { StaffEngine } from '../src/lib/staff/StaffEngine';
import { CashEngine } from '../src/lib/cash/CashEngine';
import { JournalEngine } from '../src/lib/accounting/JournalEngine';
import { EventEngine } from '../src/lib/events/EventEngine';
import { LocalLedger } from '../src/lib/storage/LocalLedger';
import { EventType } from '../src/lib/events/types';
import { POS_ROLE } from '../src/utils/permissions';

/**
 * Protocol Integrity Verification Script
 * Automates the audit of security, mathematical, and cryptographic layers.
 */

// Mock environment for Node.js
global.localStorage = {
    _data: {} as any,
    getItem: (key: string) => global.localStorage._data[key] || null,
    setItem: (key: string, value: string) => { global.localStorage._data[key] = value; },
    removeItem: (key: string) => { delete global.localStorage._data[key]; },
    clear: () => { global.localStorage._data = {}; },
    key: (i: number) => Object.keys(global.localStorage._data)[i] || null,
    get length() { return Object.keys(global.localStorage._data).length; }
} as any;

global.navigator = {
    onLine: true
} as any;

// Mock Fetch for sql.js if needed (though we'll try to avoid it)
global.fetch = async () => ({
    ok: true,
    arrayBuffer: async () => new ArrayBuffer(0)
}) as any;

// Mock Cryptographic API (Mission Critical for Node.js)
import * as crypto from 'crypto';
global.crypto = {
    subtle: {
        digest: async (algorithm: string, data: Uint8Array) => {
            const hash = crypto.createHash('sha256').update(data).digest();
            return hash.buffer.slice(hash.byteOffset, hash.byteOffset + hash.byteLength);
        }
    }
} as any;

// Polyfill TextEncoder if missing
if (typeof TextEncoder === 'undefined') {
    global.TextEncoder = require('util').TextEncoder;
}

// CRITICAL: We need to bypass actual WASM for pure logic verification if WASM fails in node
// We'll use a light bypass for LocalLedger initialization in test mode
process.env.TEST_MODE = 'true';

async function runAudit() {
    console.log('🚀 [Audit] Initiating Mission-Critical Protocol Verification...');

    let totalTests = 0;
    let passedTests = 0;

    const assert = (condition: boolean, message: string, detail?: any) => {
        totalTests++;
        if (condition) {
            passedTests++;
            console.log(`✅ [PASS] ${message}`);
        } else {
            console.log(`❌ [FAIL] ${message}`);
            if (detail) console.log('   Detail:', JSON.stringify(detail, null, 2));
        }
    };

    try {
        // Initialize Ledger
        const ledger = new LocalLedger();
        const eventEngine = new EventEngine('dev-1', 'br-1', ledger);
        const staffEngine = new StaffEngine(ledger);
        const cashEngine = new CashEngine(eventEngine, ledger);
        const journalEngine = new JournalEngine(ledger);

        // --- 1. Security Audit ---
        console.log('\n--- 1. Security Audit ---');

        // PID/PIN Resolution
        const staff = await staffEngine.createStaff({
            username: 'Test Operator',
            phone: '12345678',
            pin: '123456',
            roles: [POS_ROLE.CASHIER] as POS_ROLE[],
            branchId: 'br-1'
        });

        assert(staff.uniqueCode.length === 8, 'Operator ID must be 8 digits');

        const verified = await staffEngine.verifyPin(staff.uniqueCode, '123456');
        assert(verified !== null && verified.id === staff.id, 'PID/PIN resolution successful');

        const failed = await staffEngine.verifyPin(staff.uniqueCode, 'wrong-pin');
        assert(failed === null, 'PIN bypass prevention active');

        // --- 2. Mathematical Audit ---
        console.log('\n--- 2. Mathematical Audit ---');

        await cashEngine.openDrawer(staff.id, 100.50, 'EGP');
        const balance = cashEngine.getStaffBalance(staff.id);
        assert(balance?.currentBalance === 100.50, 'Opening balance precision verified (100.50)');

        await cashEngine.recordCashSale('ord-1', 25.75, 'EGP', staff.id, 30);
        const updatedBalance = cashEngine.getStaffBalance(staff.id);
        console.log(`DEBUG: Balance after sale: ${updatedBalance?.currentBalance}`);
        assert(updatedBalance?.currentBalance === 126.25, 'Incremental balance addition verified (126.25)', updatedBalance);

        // --- 3. Cryptographic Audit ---
        console.log('\n--- 3. Cryptographic Audit ---');

        const events = await ledger.getAllEvents();
        assert(events.length >= 2, 'Event persistence verified');

        const lastEvent = events[events.length - 1];
        assert(lastEvent.actorId === staff.id, 'Actor identity propagation verified');

        const chainValid = await eventEngine.verifyEventChain(events);
        assert(chainValid === true, 'Cryptographic hash-link integrity verified');

        console.log('\n--- Audit Summary ---');
        console.log(`Protocol Rating: ${passedTests === totalTests ? 'S-TIER (MISSION READY)' : 'FAILURE'}`);
        console.log(`Tests: ${passedTests}/${totalTests}`);

        if (passedTests === totalTests) {
            process.exit(0);
        } else {
            process.exit(1);
        }

    } catch (err) {
        console.error('❌ [CRITICAL] Audit aborted due to engine failure:', err);
        process.exit(1);
    }
}

runAudit();
