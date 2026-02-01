// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "./interfaces/IAIOracle.sol";

/// @title SwarmIntelligence.sol
/// @notice Detects coordinated attacks by analyzing actor behavior patterns
/// @dev Advanced AI system that identifies attack swarms and coordinated threats
contract SwarmIntelligence is Ownable, Pausable {
    // Swarm detection data structures
    struct ActorProfile {
        address actor;
        uint256 totalActions;
        uint256 suspiciousActions;
        uint256 lastActivity;
        uint256 riskScore;
        bytes32 behaviorPattern;
        address[] connections; // Other actors with similar patterns
        mapping(bytes32 => uint256) actionFrequency;
        bool isSwarmMember;
        uint256 swarmId;
    }

    struct AttackSwarm {
        bytes32 swarmId;
        address[] members;
        bytes32 attackPattern;
        uint256 coordinationScore; // 0-10000 (basis points)
        uint256 startTime;
        uint256 lastActivity;
        SwarmStatus status;
        uint256 totalActions;
        mapping(address => uint256) memberActivity;
        bytes32[] attackVectors;
    }

    struct BehaviorPattern {
        bytes32 patternId;
        string patternType;
        bytes32[] actionSequence;
        uint256 frequencyThreshold;
        uint256 timeWindow; // seconds
        uint256 coordinationMultiplier;
        bool isActive;
        uint256 detectionCount;
    }

    // Enums
    enum SwarmStatus {
        FORMING,
        ACTIVE,
        DISRUPTED,
        NEUTRALIZED,
        DORMANT
    }

    // State variables
    mapping(address => ActorProfile) public actorProfiles;
    mapping(bytes32 => AttackSwarm) public attackSwarms;
    mapping(bytes32 => BehaviorPattern) public behaviorPatterns;

    // Global swarm tracking
    bytes32[] public activeSwarms;
    mapping(bytes32 => bytes32[]) public swarmAttackPatterns;

    // Configuration
    uint256 public swarmDetectionThreshold = 7000; // 70% confidence
    uint256 public minSwarmSize = 2; // Minimum actors for swarm
    uint256 public maxSwarmSize = 100; // Maximum tracked actors per swarm
    uint256 public coordinationTimeWindow = 3600; // 1 hour window
    uint256 public patternSimilarityThreshold = 8000; // 80% similarity

    IAIOracle public aiOracle;

    // Events
    event SwarmDetected(
        bytes32 indexed swarmId,
        address[] members,
        bytes32 attackPattern,
        uint256 coordinationScore
    );

    event ActorProfileUpdated(
        address indexed actor,
        uint256 riskScore,
        bool isSwarmMember
    );

    event SwarmStatusChanged(
        bytes32 indexed swarmId,
        SwarmStatus oldStatus,
        SwarmStatus newStatus
    );

    event BehaviorPatternAdded(
        bytes32 indexed patternId,
        string patternType,
        uint256 coordinationMultiplier
    );

    constructor(address _aiOracle) Ownable(msg.sender) {
        if (_aiOracle != address(0)) {
            aiOracle = IAIOracle(_aiOracle);
        }

        // Initialize default behavior patterns
        _initializeDefaultPatterns();
    }

    /// @notice Main swarm analysis function - called for every suspicious action
    /// @param actor Address performing the action
    /// @param actionType Type of action
    /// @param context Additional context data
    /// @return detected Whether a swarm was detected
    /// @return confidence Confidence score of swarm detection
    /// @return swarmMembers Array of swarm member addresses
    function analyzeSwarm(
        address actor,
        bytes32 actionType,
        bytes calldata context
    )
        external
        whenNotPaused
        returns (
            bool detected,
            uint256 confidence,
            address[] memory swarmMembers
        )
    {
        // Update actor profile
        _updateActorProfile(actor, actionType, context);

        // Check for swarm formation
        (detected, confidence, swarmMembers) = _detectSwarmFormation(
            actor,
            actionType,
            context
        );

        if (detected) {
            // Create or update swarm
            bytes32 swarmId = _createOrUpdateSwarm(
                swarmMembers,
                actionType,
                confidence,
                context
            );
            emit SwarmDetected(swarmId, swarmMembers, actionType, confidence);
        }

        return (detected, confidence, swarmMembers);
    }

    /// @notice Analyze actor connections and behavior similarity
    /// @param actors Array of actors to analyze
    /// @return coordinationScore How coordinated their actions are
    /// @return commonPatterns Shared attack patterns
    function analyzeActorConnections(
        address[] calldata actors
    )
        external
        view
        returns (uint256 coordinationScore, bytes32[] memory commonPatterns)
    {
        if (actors.length < 2) return (0, new bytes32[](0));

        uint256 totalConnections = 0;
        uint256 similarPatterns = 0;
        bytes32[] memory patterns = new bytes32[](actors.length);

        // Compare behavior patterns between actors
        for (uint256 i = 0; i < actors.length - 1; i++) {
            ActorProfile storage actor1 = actorProfiles[actors[i]];
            patterns[i] = actor1.behaviorPattern;

            for (uint256 j = i + 1; j < actors.length; j++) {
                ActorProfile storage actor2 = actorProfiles[actors[j]];

                // Check if actors are connected
                if (_areActorsConnected(actor1.actor, actor2.actor)) {
                    totalConnections++;
                }

                // Check pattern similarity
                if (
                    _calculatePatternSimilarity(
                        actor1.behaviorPattern,
                        actor2.behaviorPattern
                    ) >= patternSimilarityThreshold
                ) {
                    similarPatterns++;
                }
            }
        }

        // Calculate coordination score
        uint256 connectionScore = (totalConnections * 10000) /
            ((actors.length * (actors.length - 1)) / 2);
        uint256 patternScore = (similarPatterns * 10000) /
            ((actors.length * (actors.length - 1)) / 2);
        coordinationScore = (connectionScore + patternScore) / 2;

        // Return common patterns (simplified - return first pattern if any)
        if (similarPatterns > 0) {
            commonPatterns = new bytes32[](1);
            commonPatterns[0] = patterns[0];
        }

        return (coordinationScore, commonPatterns);
    }

    /// @notice Predict potential swarm formations
    /// @param timeWindow Time window to analyze (seconds)
    /// @return predictedSwarms Array of predicted swarm formations
    function predictSwarmFormation(
        uint256 timeWindow
    ) external view returns (bytes32[] memory predictedSwarms) {
        // Simplified prediction logic
        // In production, this would use advanced ML models
        uint256 predictionCount = 0;
        bytes32[] memory predictions = new bytes32[](10); // Max predictions

        // Analyze recent actor behavior for potential coordination
        uint256 cutoffTime = block.timestamp - timeWindow;

        for (uint256 i = 0; i < activeSwarms.length; i++) {
            AttackSwarm storage swarm = attackSwarms[activeSwarms[i]];
            if (
                swarm.lastActivity >= cutoffTime &&
                swarm.members.length < maxSwarmSize
            ) {
                // This swarm might grow
                predictions[predictionCount] = swarm.swarmId;
                predictionCount++;
            }
        }

        // Return actual sized array
        predictedSwarms = new bytes32[](predictionCount);
        for (uint256 i = 0; i < predictionCount; i++) {
            predictedSwarms[i] = predictions[i];
        }

        return predictedSwarms;
    }

    /// @notice Get comprehensive swarm analysis
    /// @param swarmId Swarm identifier
    function getSwarmAnalysis(
        bytes32 swarmId
    )
        external
        view
        returns (
            address[] memory members,
            bytes32 attackPattern,
            uint256 coordinationScore,
            SwarmStatus status,
            uint256 totalActions,
            bytes32[] memory attackVectors
        )
    {
        AttackSwarm storage swarm = attackSwarms[swarmId];
        return (
            swarm.members,
            swarm.attackPattern,
            swarm.coordinationScore,
            swarm.status,
            swarm.totalActions,
            swarm.attackVectors
        );
    }

    /// @notice Get actor swarm membership
    /// @param actor Actor address
    function getActorSwarmStatus(
        address actor
    )
        external
        view
        returns (bool isSwarmMember, bytes32 swarmId, uint256 riskScore)
    {
        ActorProfile storage profile = actorProfiles[actor];
        return (
            profile.isSwarmMember,
            bytes32(uint256(profile.swarmId)),
            profile.riskScore
        );
    }

    /// @notice Manually disrupt a detected swarm
    /// @param swarmId Swarm to disrupt
    function disruptSwarm(bytes32 swarmId) external onlyOwner {
        AttackSwarm storage swarm = attackSwarms[swarmId];
        require(swarm.status == SwarmStatus.ACTIVE, "Swarm not active");

        swarm.status = SwarmStatus.DISRUPTED;
        swarm.lastActivity = block.timestamp;

        // Mark all members as high risk
        for (uint256 i = 0; i < swarm.members.length; i++) {
            ActorProfile storage profile = actorProfiles[swarm.members[i]];
            profile.riskScore = 10000; // Maximum risk
        }

        emit SwarmStatusChanged(
            swarmId,
            SwarmStatus.ACTIVE,
            SwarmStatus.DISRUPTED
        );
    }

    /// @notice Add a new behavior pattern for swarm detection
    /// @param patternType Type of attack pattern
    /// @param actionSequence Sequence of actions that define the pattern
    /// @param frequencyThreshold Minimum frequency to trigger detection
    /// @param timeWindow Time window for pattern recognition
    /// @param coordinationMultiplier How much this pattern indicates coordination
    function addBehaviorPattern(
        string calldata patternType,
        bytes32[] calldata actionSequence,
        uint256 frequencyThreshold,
        uint256 timeWindow,
        uint256 coordinationMultiplier
    ) external onlyOwner returns (bytes32) {
        return
            _addBehaviorPattern(
                patternType,
                actionSequence,
                frequencyThreshold,
                timeWindow,
                coordinationMultiplier
            );
    }

    function _addBehaviorPattern(
        string memory patternType,
        bytes32[] memory actionSequence,
        uint256 frequencyThreshold,
        uint256 timeWindow,
        uint256 coordinationMultiplier
    ) internal returns (bytes32 patternId) {
        patternId = keccak256(
            abi.encodePacked(patternType, actionSequence, block.timestamp)
        );

        BehaviorPattern storage pattern = behaviorPatterns[patternId];
        pattern.patternId = patternId;
        pattern.patternType = patternType;
        pattern.frequencyThreshold = frequencyThreshold;
        pattern.timeWindow = timeWindow;
        pattern.coordinationMultiplier = coordinationMultiplier;
        pattern.isActive = true;

        // Copy action sequence
        for (uint256 i = 0; i < actionSequence.length; i++) {
            pattern.actionSequence.push(actionSequence[i]);
        }

        emit BehaviorPatternAdded(
            patternId,
            patternType,
            coordinationMultiplier
        );
        return patternId;
    }

    /// @notice Update swarm detection parameters
    function updateSwarmConfig(
        uint256 _swarmDetectionThreshold,
        uint256 _minSwarmSize,
        uint256 _coordinationTimeWindow,
        uint256 _patternSimilarityThreshold
    ) external onlyOwner {
        require(_swarmDetectionThreshold <= 10000, "Invalid threshold");
        require(_minSwarmSize >= 2, "Minimum swarm size too small");

        swarmDetectionThreshold = _swarmDetectionThreshold;
        minSwarmSize = _minSwarmSize;
        coordinationTimeWindow = _coordinationTimeWindow;
        patternSimilarityThreshold = _patternSimilarityThreshold;
    }

    // Internal functions

    function _updateActorProfile(
        address actor,
        bytes32 actionType,
        bytes calldata context
    ) internal {
        ActorProfile storage profile = actorProfiles[actor];

        if (profile.actor == address(0)) {
            profile.actor = actor;
        }

        profile.totalActions++;
        profile.lastActivity = block.timestamp;
        profile.actionFrequency[actionType]++;

        // Update behavior pattern
        profile.behaviorPattern = keccak256(
            abi.encodePacked(
                profile.behaviorPattern,
                actionType,
                context,
                block.timestamp
            )
        );

        // Calculate risk score based on behavior
        profile.riskScore = _calculateActorRisk(profile);

        emit ActorProfileUpdated(
            actor,
            profile.riskScore,
            profile.isSwarmMember
        );
    }

    function _detectSwarmFormation(
        address actor,
        bytes32 actionType,
        bytes calldata context
    )
        internal
        view
        returns (bool detected, uint256 confidence, address[] memory members)
    {
        // Find actors with similar recent behavior
        address[] memory similarActors = _findSimilarActors(
            actor,
            actionType,
            context
        );
        if (similarActors.length < minSwarmSize - 1) {
            return (false, 0, new address[](0));
        }

        // Include the current actor
        address[] memory potentialMembers = new address[](
            similarActors.length + 1
        );
        potentialMembers[0] = actor;
        for (uint256 i = 0; i < similarActors.length; i++) {
            potentialMembers[i + 1] = similarActors[i];
        }

        // Analyze coordination
        (uint256 coordinationScore, ) = this.analyzeActorConnections(
            potentialMembers
        );

        if (coordinationScore >= swarmDetectionThreshold) {
            return (true, coordinationScore, potentialMembers);
        }

        return (false, coordinationScore, new address[](0));
    }

    function _createOrUpdateSwarm(
        address[] memory members,
        bytes32 attackPattern,
        uint256 coordinationScore,
        bytes calldata context
    ) internal returns (bytes32 swarmId) {
        swarmId = keccak256(
            abi.encodePacked(members, attackPattern, block.timestamp)
        );

        AttackSwarm storage swarm = attackSwarms[swarmId];
        if (swarm.startTime == 0) {
            // New swarm
            swarm.swarmId = swarmId;
            swarm.attackPattern = attackPattern;
            swarm.coordinationScore = coordinationScore;
            swarm.startTime = block.timestamp;
            swarm.status = SwarmStatus.FORMING;
            swarm.attackVectors.push(attackPattern);

            activeSwarms.push(swarmId);
        } else {
            // Update existing swarm
            swarm.coordinationScore = coordinationScore;
            swarm.lastActivity = block.timestamp;
            swarm.totalActions++;

            if (
                swarm.status == SwarmStatus.FORMING && coordinationScore >= 8000
            ) {
                swarm.status = SwarmStatus.ACTIVE;
            }
        }

        // Add members
        for (uint256 i = 0; i < members.length; i++) {
            if (!_isMemberOfSwarm(members[i], swarmId)) {
                swarm.members.push(members[i]);
                swarm.memberActivity[members[i]] = 1;

                // Update actor profile
                ActorProfile storage profile = actorProfiles[members[i]];
                profile.isSwarmMember = true;
                profile.swarmId = uint256(swarmId);
            } else {
                swarm.memberActivity[members[i]]++;
            }
        }

        return swarmId;
    }

    function _findSimilarActors(
        address targetActor,
        bytes32 actionType,
        bytes calldata context
    ) internal view returns (address[] memory similarActors) {
        ActorProfile storage targetProfile = actorProfiles[targetActor];
        address[] memory candidates = new address[](50); // Max candidates
        uint256 candidateCount = 0;

        // Simplified actor discovery - in production, this would be more sophisticated
        // For now, return empty array (would need proper actor database)
        return new address[](0);
    }

    function _areActorsConnected(
        address actor1,
        address actor2
    ) internal view returns (bool) {
        ActorProfile storage profile1 = actorProfiles[actor1];
        ActorProfile storage profile2 = actorProfiles[actor2];

        // Check if actors appear in each other's connections
        for (uint256 i = 0; i < profile1.connections.length; i++) {
            if (profile1.connections[i] == actor2) return true;
        }

        // Check behavior pattern similarity
        return
            _calculatePatternSimilarity(
                profile1.behaviorPattern,
                profile2.behaviorPattern
            ) >= patternSimilarityThreshold;
    }

    function _calculatePatternSimilarity(
        bytes32 pattern1,
        bytes32 pattern2
    ) internal pure returns (uint256) {
        // Simplified similarity calculation - XOR distance
        bytes32 xorResult = pattern1 ^ pattern2;
        uint256 distance = 0;

        for (uint256 i = 0; i < 32; i++) {
            if (xorResult[i] != 0) distance++;
        }

        // Convert to similarity score (0-10000)
        return 10000 - ((distance * 10000) / 256);
    }

    function _calculateActorRisk(
        ActorProfile storage profile
    ) internal view returns (uint256) {
        uint256 riskScore = 0;

        // Base risk from suspicious actions
        if (profile.totalActions > 0) {
            riskScore +=
                (profile.suspiciousActions * 10000) /
                profile.totalActions;
        }

        // Risk from swarm membership
        if (profile.isSwarmMember) {
            riskScore += 3000; // Additional 30% risk
        }

        // Risk from action frequency anomalies
        // (Simplified - would analyze action patterns)

        return riskScore > 10000 ? 10000 : riskScore;
    }

    function _isMemberOfSwarm(
        address actor,
        bytes32 swarmId
    ) internal view returns (bool) {
        AttackSwarm storage swarm = attackSwarms[swarmId];
        for (uint256 i = 0; i < swarm.members.length; i++) {
            if (swarm.members[i] == actor) return true;
        }
        return false;
    }

    function _initializeDefaultPatterns() internal {
        // Add common attack patterns
        bytes32[] memory flashLoanPattern = new bytes32[](3);
        flashLoanPattern[0] = keccak256("large_deposit");
        flashLoanPattern[1] = keccak256("arbitrage_trade");
        flashLoanPattern[2] = keccak256("rapid_withdrawal");

        _addBehaviorPattern(
            "flash_loan_attack",
            flashLoanPattern,
            5, // 5 occurrences
            300, // 5 minutes
            5000 // 50% coordination multiplier
        );

        bytes32[] memory sandwichPattern = new bytes32[](4);
        sandwichPattern[0] = keccak256("front_run");
        sandwichPattern[1] = keccak256("victim_trade");
        sandwichPattern[2] = keccak256("back_run");
        sandwichPattern[3] = keccak256("profit_withdrawal");

        _addBehaviorPattern(
            "sandwich_attack",
            sandwichPattern,
            3,
            60, // 1 minute
            8000 // 80% coordination multiplier
        );
    }

    // Emergency functions
    function emergencyPause() external onlyOwner {
        _pause();
    }

    function emergencyUnpause() external onlyOwner {
        _unpause();
    }
}
