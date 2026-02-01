// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../SecurityTypes.sol";

/// @title IAIOracle.sol
/// @notice Interface for AI-powered security oracle
/// @dev Provides advanced threat analysis and learning capabilities
interface IAIOracle {
    /// @notice Analyze a potential threat
    /// @param actor Address performing the action
    /// @param actionType Type of action
    /// @param context Additional context data
    /// @param value Value involved
    /// @return isThreat Whether this is considered a threat
    /// @return confidence Confidence score (0-10000)
    /// @return analysis AI-generated analysis string
    function analyzeThreat(
        address actor,
        bytes32 actionType,
        bytes calldata context,
        uint256 value
    )
        external
        returns (bool isThreat, uint256 confidence, string memory analysis);

    /// @notice Learn from a successful attack
    /// @param attackPatternHash Hash of the attack pattern
    /// @param successRate How successful the attack was
    /// @param victimData Data about what was compromised
    function learnFromAttack(
        bytes32 attackPatternHash,
        uint256 successRate,
        bytes calldata victimData
    ) external;

    /// @notice Request deep analysis for a threat
    /// @param threatId Unique threat identifier
    /// @param attackData Raw attack data for analysis
    function requestDeepAnalysis(
        bytes32 threatId,
        bytes calldata attackData
    ) external;

    /// @notice Get recommended defense actions for a threat
    /// @param threatId Threat identifier
    /// @param severity Threat severity level
    /// @return actions Array of recommended defense actions
    function recommendActions(
        bytes32 threatId,
        uint8 severity
    ) external view returns (SecurityTypes.DefenseAction[] memory actions);

    /// @notice Get current AI confidence level
    /// @return confidence AI confidence score (0-10000)
    function getConfidenceLevel() external view returns (uint256 confidence);

    /// @notice Predict future attack patterns
    /// @param currentPattern Current attack pattern
    /// @return predictions Array of predicted attack patterns
    function predictAttackEvolution(
        bytes32 currentPattern
    ) external view returns (bytes32[] memory predictions);

    /// @notice Get AI analysis for a specific threat
    /// @param threatId Threat identifier
    /// @return analysis Detailed AI analysis
    function getThreatAnalysis(
        bytes32 threatId
    ) external view returns (string memory analysis);

    // Events
    event AILearningComplete(
        bytes32 indexed patternHash,
        uint256 newConfidence
    );
    event ThreatAnalysisComplete(
        bytes32 indexed threatId,
        bool isThreat,
        uint256 confidence
    );
    event AttackPatternPredicted(
        bytes32 indexed currentPattern,
        bytes32[] predictedPatterns
    );
}
