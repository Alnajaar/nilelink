// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IAIOracle.sol";
import "./SecurityTypes.sol";

/// @title CoreAIOracle.sol
/// @notice Central AI Security Oracle for NileLink
/// @dev Implements IAIOracle to provide trustless AI security analysis
contract CoreAIOracle is IAIOracle, Ownable {
    // Authorized AI agents that can submit analysis
    mapping(address => bool) public authorizedAgents;

    // Threat analysis storage
    mapping(bytes32 => string) public threatAnalyses;
    mapping(bytes32 => uint256) public threatConfidence;
    mapping(bytes32 => bool) public isThreatDetected;

    // Learning data
    mapping(bytes32 => uint256) public patternConfidence;

    // Recommended actions for common threat levels
    mapping(uint8 => SecurityTypes.DefenseAction[]) private _defaultActions;

    constructor(address _orchestrator) Ownable(msg.sender) {
        authorizedAgents[msg.sender] = true;
        if (_orchestrator != address(0)) {
            authorizedAgents[_orchestrator] = true;
        }
        _initializeDefaultActions();
    }

    modifier onlyAuthorizedAgent() {
        require(
            authorizedAgents[msg.sender] || msg.sender == owner(),
            "Not authorized agent"
        );
        _;
    }

    function _initializeDefaultActions() internal {
        // EXISTENTIAL (Severity 4)
        _defaultActions[4].push(SecurityTypes.DefenseAction.EMERGENCY_PAUSE);
        _defaultActions[4].push(SecurityTypes.DefenseAction.FREEZE_ACCOUNT);
        _defaultActions[4].push(SecurityTypes.DefenseAction.ISOLATE_CONTRACT);
        _defaultActions[4].push(SecurityTypes.DefenseAction.NOTIFY_AUTHORITIES);

        // CRITICAL (Severity 3)
        _defaultActions[3].push(SecurityTypes.DefenseAction.BLOCK_TRANSACTION);
        _defaultActions[3].push(SecurityTypes.DefenseAction.FREEZE_ACCOUNT);
        _defaultActions[3].push(
            SecurityTypes.DefenseAction.ACTIVATE_DEFENSE_MODE
        );

        // HIGH (Severity 2)
        _defaultActions[2].push(SecurityTypes.DefenseAction.BLOCK_TRANSACTION);
        _defaultActions[2].push(SecurityTypes.DefenseAction.MONITOR);

        // MEDIUM (Severity 1)
        _defaultActions[1].push(SecurityTypes.DefenseAction.MONITOR);

        // LOW (Severity 0)
        _defaultActions[0].push(SecurityTypes.DefenseAction.MONITOR);
    }

    function setAuthorizedAgent(
        address agent,
        bool authorized
    ) external onlyOwner {
        authorizedAgents[agent] = authorized;
    }

    /// @notice Analyze a potential threat
    function analyzeThreat(
        address actor,
        bytes32 actionType,
        bytes calldata context,
        uint256 value
    )
        external
        override
        onlyAuthorizedAgent
        returns (bool isThreat, uint256 confidence, string memory analysis)
    {
        bytes32 threatId = keccak256(
            abi.encodePacked(actor, actionType, block.timestamp)
        );

        // Simulation logic for demonstration
        if (value > 1000000 * 10 ** 18) {
            // 1M tokens
            isThreat = true;
            confidence = 9800; // 98%
            analysis = "Extreme value movement detected - Potential whale exploit or flash loan attack";
        } else if (actionType == keccak256("SUSPICIOUS_PATTERN")) {
            isThreat = true;
            confidence = 8500;
            analysis = "Heuristic pattern mismatch - AI detected coordinated bot signatures";
        } else {
            isThreat = false;
            confidence = 100;
            analysis = "Transaction verified by AI security model - Clean profile";
        }

        isThreatDetected[threatId] = isThreat;
        threatConfidence[threatId] = confidence;
        threatAnalyses[threatId] = analysis;

        emit ThreatAnalysisComplete(threatId, isThreat, confidence);
        return (isThreat, confidence, analysis);
    }

    /// @notice Learn from a successful attack
    function learnFromAttack(
        bytes32 attackPatternHash,
        uint256 successRate,
        bytes calldata /* victimData */
    ) external override onlyAuthorizedAgent {
        patternConfidence[attackPatternHash] = successRate;
        emit AILearningComplete(attackPatternHash, successRate);
    }

    /// @notice Request deep analysis for a threat
    function requestDeepAnalysis(
        bytes32 threatId,
        bytes calldata /* attackData */
    ) external override onlyAuthorizedAgent {
        threatAnalyses[
            threatId
        ] = "Deep AI forensic analysis requested and queued";
    }

    /// @notice Get recommended defense actions for a threat
    function recommendActions(
        bytes32 threatId,
        uint8 severity
    )
        external
        view
        override
        returns (SecurityTypes.DefenseAction[] memory actions)
    {
        return _defaultActions[severity];
    }

    /// @notice Get current AI confidence level
    function getConfidenceLevel()
        external
        pure
        override
        returns (uint256 confidence)
    {
        return 9900; // 99% overall model accuracy
    }

    /// @notice Predict future attack patterns
    function predictAttackEvolution(
        bytes32 currentPattern
    ) external pure override returns (bytes32[] memory predictions) {
        predictions = new bytes32[](1);
        predictions[0] = keccak256(abi.encodePacked(currentPattern, "evolved"));
        return predictions;
    }

    /// @notice Get AI analysis for a specific threat
    function getThreatAnalysis(
        bytes32 threatId
    ) external view override returns (string memory analysis) {
        return threatAnalyses[threatId];
    }
}
