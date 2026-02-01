// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IDefenseActions
 * @notice Shared interface for defense actions used across security contracts
 */
interface IDefenseActions {
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
}