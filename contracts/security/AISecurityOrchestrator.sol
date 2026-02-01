// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./SecurityTypes.sol";

/**
 * @title AISecurityOrchestrator
 * @dev AI-powered security orchestration for fraud detection and threat prevention
 */
contract AISecurityOrchestrator is Ownable, ReentrancyGuard {
    using SecurityTypes for SecurityTypes.ThreatLevel;
    using SecurityTypes for SecurityTypes.AnomalyType;

    struct SecurityEvent {
        uint256 timestamp;
        address actor;
        SecurityTypes.ThreatLevel threatLevel;
        SecurityTypes.AnomalyType anomalyType;
        string description;
        bytes32 transactionHash;
        bool resolved;
    }

    struct RiskProfile {
        address user;
        uint256 riskScore;
        uint256 lastActivity;
        uint256 suspiciousTransactions;
        SecurityTypes.ThreatLevel currentThreatLevel;
        mapping(SecurityTypes.AnomalyType => uint256) anomalyCounts;
    }

    mapping(address => RiskProfile) public riskProfiles;
    mapping(bytes32 => SecurityEvent) public securityEvents;
    mapping(address => bool) public blacklistedAddresses;

    uint256 public constant MAX_RISK_SCORE = 1000;
    uint256 public constant HIGH_RISK_THRESHOLD = 700;
    uint256 public constant CRITICAL_RISK_THRESHOLD = 900;

    event SecurityAlert(
        address indexed actor,
        SecurityTypes.ThreatLevel threatLevel,
        string description,
        bytes32 transactionHash
    );

    event RiskProfileUpdated(address indexed user, uint256 newRiskScore);
    event AddressBlacklisted(address indexed addr, string reason);

    address public fraudDetection;
    address public swarmIntelligence;
    address public adaptiveDefense;
    address public predictiveThreatModel;
    address public aiOracle;

    event AIOracleUpdated(address indexed oracle);

    constructor(
        address _fraudDetection,
        address _swarmIntelligence,
        address _adaptiveDefense,
        address _predictiveThreatModel,
        address _aiOracle
    ) Ownable(msg.sender) {
        fraudDetection = _fraudDetection;
        swarmIntelligence = _swarmIntelligence;
        adaptiveDefense = _adaptiveDefense;
        predictiveThreatModel = _predictiveThreatModel;
        aiOracle = _aiOracle;
    }

    /**
     * @dev Set the AI Security Oracle
     */
    function setAIOracle(address _aiOracle) external onlyOwner {
        aiOracle = _aiOracle;
        emit AIOracleUpdated(_aiOracle);
    }

    /**
     * @dev Analyze transaction for security threats
     */
    function analyzeTransaction(
        address user,
        uint256 amount,
        uint256 timestamp,
        bytes32 txHash
    ) external returns (SecurityTypes.ThreatLevel) {
        RiskProfile storage profile = riskProfiles[user];

        // Update profile activity
        profile.lastActivity = timestamp;

        // AI-based anomaly detection
        SecurityTypes.AnomalyType anomaly = _detectAnomalies(
            user,
            amount,
            timestamp
        );
        SecurityTypes.ThreatLevel threatLevel = _calculateThreatLevel(
            profile,
            anomaly,
            amount
        );

        // Update risk profile
        if (anomaly != SecurityTypes.AnomalyType.NONE) {
            profile.anomalyCounts[anomaly]++;
            profile.suspiciousTransactions++;
        }

        profile.riskScore = _calculateRiskScore(profile);
        profile.currentThreatLevel = threatLevel;

        // Log security event
        bytes32 eventId = keccak256(abi.encodePacked(user, timestamp, txHash));
        securityEvents[eventId] = SecurityEvent({
            timestamp: timestamp,
            actor: user,
            threatLevel: threatLevel,
            anomalyType: anomaly,
            description: _getAnomalyDescription(anomaly),
            transactionHash: txHash,
            resolved: false
        });

        // Emit alerts for high-risk activities
        if (threatLevel >= SecurityTypes.ThreatLevel.HIGH) {
            emit SecurityAlert(
                user,
                threatLevel,
                _getAnomalyDescription(anomaly),
                txHash
            );
        }

        // Auto-blacklist critical threats
        if (threatLevel == SecurityTypes.ThreatLevel.CRITICAL) {
            _blacklistAddress(user, "Critical security threat detected");
        }

        emit RiskProfileUpdated(user, profile.riskScore);

        return threatLevel;
    }

    /**
     * @dev AI-powered anomaly detection
     */
    function _detectAnomalies(
        address user,
        uint256 amount,
        uint256 timestamp
    ) internal view returns (SecurityTypes.AnomalyType) {
        RiskProfile storage profile = riskProfiles[user];

        // Check for unusual transaction amounts (AI pattern recognition)
        if (amount > 1000 * 10 ** 18) {
            // Large transaction
            return SecurityTypes.AnomalyType.LARGE_TRANSACTION;
        }

        // Check for rapid successive transactions
        if (timestamp - profile.lastActivity < 60) {
            // Within 1 minute
            return SecurityTypes.AnomalyType.RAPID_TRANSACTIONS;
        }

        // Check for suspicious patterns
        if (profile.suspiciousTransactions > 5) {
            return SecurityTypes.AnomalyType.SUSPICIOUS_PATTERN;
        }

        return SecurityTypes.AnomalyType.NONE;
    }

    /**
     * @dev Calculate threat level based on AI analysis
     */
    function _calculateThreatLevel(
        RiskProfile storage profile,
        SecurityTypes.AnomalyType anomaly,
        uint256 amount
    ) internal view returns (SecurityTypes.ThreatLevel) {
        uint256 baseScore = 0;

        // Anomaly-based scoring
        if (anomaly == SecurityTypes.AnomalyType.LARGE_TRANSACTION) {
            baseScore += 300;
        } else if (anomaly == SecurityTypes.AnomalyType.RAPID_TRANSACTIONS) {
            baseScore += 200;
        } else if (anomaly == SecurityTypes.AnomalyType.SUSPICIOUS_PATTERN) {
            baseScore += 400;
        }

        // Risk profile scoring
        baseScore += profile.riskScore / 10;

        // Amount-based scoring
        if (amount > 500 * 10 ** 18) {
            baseScore += 200;
        }

        if (baseScore >= 800) return SecurityTypes.ThreatLevel.CRITICAL;
        if (baseScore >= 600) return SecurityTypes.ThreatLevel.HIGH;
        if (baseScore >= 400) return SecurityTypes.ThreatLevel.MEDIUM;
        if (baseScore >= 200) return SecurityTypes.ThreatLevel.LOW;

        return SecurityTypes.ThreatLevel.NONE;
    }

    /**
     * @dev Calculate comprehensive risk score
     */
    function _calculateRiskScore(
        RiskProfile storage profile
    ) internal view returns (uint256) {
        uint256 score = 0;

        // Base suspicious transaction score
        score += profile.suspiciousTransactions * 50;

        // Anomaly type scoring
        score +=
            profile.anomalyCounts[SecurityTypes.AnomalyType.LARGE_TRANSACTION] *
            100;
        score +=
            profile.anomalyCounts[
                SecurityTypes.AnomalyType.RAPID_TRANSACTIONS
            ] *
            75;
        score +=
            profile.anomalyCounts[
                SecurityTypes.AnomalyType.SUSPICIOUS_PATTERN
            ] *
            150;

        // Time-based decay (reduce score over time)
        uint256 daysSinceLastActivity = (block.timestamp -
            profile.lastActivity) / 86400;
        if (daysSinceLastActivity > 30) {
            score = (score * 80) / 100; // 20% reduction
        }

        return score > MAX_RISK_SCORE ? MAX_RISK_SCORE : score;
    }

    /**
     * @dev Get human-readable anomaly description
     */
    function _getAnomalyDescription(
        SecurityTypes.AnomalyType anomaly
    ) internal pure returns (string memory) {
        if (anomaly == SecurityTypes.AnomalyType.LARGE_TRANSACTION) {
            return "Unusually large transaction amount detected";
        } else if (anomaly == SecurityTypes.AnomalyType.RAPID_TRANSACTIONS) {
            return "Rapid successive transactions detected";
        } else if (anomaly == SecurityTypes.AnomalyType.SUSPICIOUS_PATTERN) {
            return "Suspicious transaction pattern identified";
        }
        return "No anomalies detected";
    }

    /**
     * @dev Blacklist an address
     */
    function _blacklistAddress(address addr, string memory reason) internal {
        blacklistedAddresses[addr] = true;
        emit AddressBlacklisted(addr, reason);
    }

    /**
     * @dev Manual blacklist function for admin
     */
    function blacklistAddress(
        address addr,
        string calldata reason
    ) external onlyOwner {
        _blacklistAddress(addr, reason);
    }

    /**
     * @dev Check if address is blacklisted
     */
    function isBlacklisted(address addr) external view returns (bool) {
        return blacklistedAddresses[addr];
    }

    /**
     * @dev Get risk profile for user
     */
    function getRiskProfile(
        address user
    )
        external
        view
        returns (
            uint256 riskScore,
            uint256 suspiciousTransactions,
            SecurityTypes.ThreatLevel threatLevel
        )
    {
        RiskProfile storage profile = riskProfiles[user];
        return (
            profile.riskScore,
            profile.suspiciousTransactions,
            profile.currentThreatLevel
        );
    }

    /**
     * @dev Reset risk profile (admin only)
     */
    function resetRiskProfile(address user) external onlyOwner {
        delete riskProfiles[user];
    }
}
