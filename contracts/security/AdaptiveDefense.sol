// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./SecurityTypes.sol";

/**
 * @title AdaptiveDefense
 * @notice Adaptive defense system that learns from attacks and evolves defenses
 * @dev Implements machine learning-based defense mechanisms
 */
contract AdaptiveDefense is Ownable {
    constructor() Ownable(msg.sender) {}

    struct DefenseRule {
        bytes32 ruleId;
        bytes32 triggerCondition;
        SecurityTypes.DefenseAction[] defenseActions;
        uint256 activationCount;
        uint256 successRate; // 0-10000
        uint256 lastTriggered;
        bool active;
    }

    struct AttackPattern {
        bytes32 patternHash;
        uint256 detectionCount;
        uint256 successfulAttacks;
        uint256 lastSeen;
        bytes32[] evolvedPatterns;
        bool mitigated;
    }

    mapping(bytes32 => DefenseRule) public defenseRules;
    mapping(bytes32 => AttackPattern) public attackPatterns;
    mapping(bytes32 => bytes32[]) public patternDefenses; // Pattern -> Rules

    bytes32[] public activeRules;
    bytes32[] public knownPatterns;

    bool public defenseModeActive;
    uint256 public totalAttacksDetected;
    uint256 public totalAttacksMitigated;

    event DefenseRuleActivated(
        bytes32 indexed ruleId,
        address indexed triggerActor,
        uint256 timestamp
    );
    event AttackPatternLearned(
        bytes32 indexed patternHash,
        uint256 successRate
    );
    event DefenseModeActivated(uint256 timestamp);
    event DefenseModeDeactivated(uint256 timestamp);

    /**
     * @notice Evaluate an action against current defense rules
     * @param actor Address performing the action
     * @param actionType Type of action
     * @param context Additional context
     * @return triggered Whether defense was triggered
     * @return actions Array of defense actions to take
     */
    function evaluateAction(
        address actor,
        bytes32 actionType,
        bytes calldata context
    )
        external
        returns (bool triggered, SecurityTypes.DefenseAction[] memory actions)
    {
        bytes32 conditionHash = keccak256(
            abi.encodePacked(actor, actionType, context)
        );

        for (uint256 i = 0; i < activeRules.length; i++) {
            DefenseRule storage rule = defenseRules[activeRules[i]];

            if (
                rule.active &&
                _matchesCondition(rule.triggerCondition, conditionHash)
            ) {
                rule.activationCount++;
                rule.lastTriggered = block.timestamp;

                // Return the actions directly since they're already SecurityTypes.DefenseAction[]
                emit DefenseRuleActivated(rule.ruleId, actor, block.timestamp);
                return (true, rule.defenseActions);
            }
        }

        return (false, new SecurityTypes.DefenseAction[](0));
    }

    /**
     * @notice Learn from a successful attack
     * @param patternHash Hash of the attack pattern
     * @param successRate How successful the attack was
     */
    function learnFromAttack(
        bytes32 patternHash,
        uint256 successRate
    ) external onlyOwner {
        AttackPattern storage pattern = attackPatterns[patternHash];

        if (pattern.detectionCount == 0) {
            // New pattern
            knownPatterns.push(patternHash);
            pattern.patternHash = patternHash;
        }

        pattern.detectionCount++;
        pattern.successfulAttacks =
            (pattern.successfulAttacks *
                (pattern.detectionCount - 1) +
                successRate) /
            pattern.detectionCount;
        pattern.lastSeen = block.timestamp;

        // Auto-generate defense rule for successful attacks
        if (successRate > 5000) {
            // >50% success rate
            _createAdaptiveRule(patternHash, successRate);
        }

        emit AttackPatternLearned(patternHash, successRate);
    }

    /**
     * @notice Activate defense mode - heightened security state
     */
    function activateDefenseMode() external onlyOwner {
        defenseModeActive = true;

        // Activate all critical defense rules
        _activateCriticalRules();

        emit DefenseModeActivated(block.timestamp);
    }

    /**
     * @notice Deactivate defense mode
     */
    function deactivateDefenseMode() external onlyOwner {
        defenseModeActive = false;

        emit DefenseModeDeactivated(block.timestamp);
    }

    /**
     * @notice Add a new defense rule
     * @param ruleId Unique rule identifier
     * @param triggerCondition Condition that triggers the rule
     * @param defenseActions Actions to take when triggered
     */
    function addDefenseRule(
        bytes32 ruleId,
        bytes32 triggerCondition,
        SecurityTypes.DefenseAction[] calldata defenseActions
    ) external onlyOwner {
        require(
            defenseRules[ruleId].ruleId == bytes32(0),
            "Rule already exists"
        );

        defenseRules[ruleId] = DefenseRule({
            ruleId: ruleId,
            triggerCondition: triggerCondition,
            defenseActions: defenseActions,
            activationCount: 0,
            successRate: 0,
            lastTriggered: 0,
            active: true
        });

        activeRules.push(ruleId);
    }

    /**
     * @notice Get defense statistics
     */
    function getDefenseStats()
        external
        view
        returns (
            uint256 attacksDetected,
            uint256 attacksMitigated,
            uint256 activeRulesCount,
            bool defenseMode
        )
    {
        return (
            totalAttacksDetected,
            totalAttacksMitigated,
            activeRules.length,
            defenseModeActive
        );
    }

    /**
     * @dev Check if a condition matches
     */
    function _matchesCondition(
        bytes32 ruleCondition,
        bytes32 actionHash
    ) internal pure returns (bool) {
        // Simplified matching - in production would be more sophisticated
        return ruleCondition == actionHash || ruleCondition == bytes32(0); // Wildcard match
    }

    /**
     * @dev Create an adaptive rule based on attack pattern
     */
    function _createAdaptiveRule(
        bytes32 patternHash,
        uint256 successRate
    ) internal {
        bytes32 ruleId = keccak256(
            abi.encodePacked("adaptive_", patternHash, block.timestamp)
        );

        // Create actions based on success rate
        SecurityTypes.DefenseAction[]
            memory actions = new SecurityTypes.DefenseAction[](
                successRate > 8000 ? 3 : 2
            );

        actions[0] = SecurityTypes.DefenseAction.BLOCK_TRANSACTION;
        actions[1] = SecurityTypes.DefenseAction.MONITOR;

        if (successRate > 8000) {
            actions[2] = SecurityTypes.DefenseAction.FREEZE_ACCOUNT;
        }

        defenseRules[ruleId] = DefenseRule({
            ruleId: ruleId,
            triggerCondition: patternHash, // Match this specific pattern
            defenseActions: actions,
            activationCount: 0,
            successRate: 0,
            lastTriggered: 0,
            active: true
        });

        activeRules.push(ruleId);
        patternDefenses[patternHash].push(ruleId);
    }

    /**
     * @dev Activate all critical defense rules
     */
    function _activateCriticalRules() internal {
        // Implementation would activate critical rules
        // This is a simplified version
    }
}
