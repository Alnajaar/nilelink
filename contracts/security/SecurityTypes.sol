// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title SecurityTypes.sol
/// @notice Shared security types for NileLink AI Security System
library SecurityTypes {
    enum ThreatType {
        INDIVIDUAL_ATTACK,
        COORDINATED_ATTACK,
        SWARM_ATTACK,
        STATE_ACTOR_ATTACK,
        AI_GENERATED_ATTACK,
        QUANTUM_ATTACK,
        SUPPLY_CHAIN_ATTACK,
        GOVERNANCE_ATTACK,
        FLASH_LOAN_ATTACK,
        SANDWICH_ATTACK,
        FRONT_RUNNING,
        BACK_RUNNING,
        MEV_ATTACK,
        ORACLE_MANIPULATION,
        BRIDGE_EXPLOIT,
        CROSS_CHAIN_ATTACK
    }

    enum ThreatSeverity {
        LOW,
        MEDIUM,
        HIGH,
        CRITICAL,
        EXISTENTIAL
    }

    enum ThreatStatus {
        DETECTED,
        ANALYZING,
        MITIGATING,
        NEUTRALIZED,
        ESCALATED,
        FALSE_POSITIVE
    }

    enum DefenseAction {
        MONITOR,
        BLOCK_TRANSACTION,
        FREEZE_ACCOUNT,
        ISOLATE_CONTRACT,
        EMERGENCY_PAUSE,
        ACTIVATE_DEFENSE_MODE,
        INITIATE_COUNTER_ATTACK,
        NOTIFY_AUTHORITIES,
        ACTIVATE_BACKUP_SYSTEMS
    }

    enum ThreatLevel {
        NONE,
        LOW,
        MEDIUM,
        HIGH,
        CRITICAL
    }

    enum AnomalyType {
        NONE,
        LARGE_TRANSACTION,
        RAPID_TRANSACTIONS,
        SUSPICIOUS_PATTERN
    }

    struct ThreatProfile {
        bytes32 threatId;
        address primaryActor;
        address[] coordinatedActors;
        ThreatType threatType;
        ThreatSeverity severity;
        uint256 confidenceScore; // 0-10000 (basis points)
        uint256 firstDetectedAt;
        uint256 lastActivityAt;
        bytes32 attackPatternHash;
        ThreatStatus status;
        uint256 neutralizedAt;
        string aiAnalysis;
    }

    struct SecurityMetrics {
        uint256 totalThreatsDetected;
        uint256 activeThreats;
        uint256 threatsNeutralized;
        uint256 falsePositives;
        uint256 coordinatedAttacksPrevented;
        uint256 averageResponseTime; // milliseconds
        uint256 systemUptime; // percentage with 2 decimals
        uint256 lastUpdatedAt;
    }
}
