// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "../interfaces/SmartContract_Interfaces.sol";
import "../libraries/NileLinkLibs.sol";

/// @title FraudDetection.sol
/// @notice Automated anomaly detection and transaction blocking for NileLink Protocol
contract FraudDetection is IFraudDetection, Ownable, Pausable, ReentrancyGuard {
    using Address for address;
    
    // Anomaly tracking
    mapping(bytes32 => AnomalyData) public anomalies;
    mapping(bytes32 => bool) public blockedTransactions;
    mapping(address => RuleSet) public restaurantRules;
    
    struct AnomalyData {
        bytes32 subject;
        bytes32 anomalyType;
        uint8 severity; // 1-10, 10 being highest
        bytes32 detailsHash;
        uint64 timestamp;
        bool resolved;
        address resolvedBy;
    }
    
    struct RuleSet {
        uint256 maxOrderAmount; // Maximum order amount in USD with 6 decimals
        uint256 maxOrdersPerHour; // Maximum orders per hour
        uint256 maxDailyVolume; // Maximum daily volume in USD with 6 decimals
        uint8 maxRefundRateBps; // Maximum refund rate in basis points
        bool customRulesEnabled;
    }
    
    // Default anomaly thresholds
    uint256 public constant DEFAULT_MAX_ORDER_AMOUNT = 10000 * 10**6; // $10,000
    uint256 public constant DEFAULT_MAX_ORDERS_PER_HOUR = 50;
    uint256 public constant DEFAULT_MAX_DAILY_VOLUME = 100000 * 10**6; // $100,000
    uint8 public constant DEFAULT_MAX_REFUND_RATE_BPS = 500; // 5%
    
    // Volume tracking for anomaly detection
    mapping(address => HourlyVolume) public hourlyVolume;
    mapping(address => DailyStats) public dailyStats;
    
    struct HourlyVolume {
        uint256 ordersCount;
        uint256 volumeUsd6;
        uint256 startTime;
    }
    
    struct DailyStats {
        uint256 totalOrders;
        uint256 totalVolumeUsd6;
        uint256 refundCount;
        uint256 startDate;
    }
    
    // Governance
    mapping(address => bool) public governance;
    
    // Events
    event AnomalyFlagged(
        bytes32 indexed subject,
        bytes32 indexed anomalyType,
        uint8 severity,
        bytes32 detailsHash,
        uint64 timestamp
    );
    
    event TransactionBlocked(bytes32 indexed txRef, bytes32 reasonHash, uint64 timestamp);
    
    event RuleSetUpdated(
        address indexed restaurant,
        uint256 maxOrderAmount,
        uint256 maxOrdersPerHour,
        uint256 maxDailyVolume,
        uint8 maxRefundRateBps,
        uint64 timestamp
    );
    
    event AnomalyResolved(bytes32 indexed anomalyId, address indexed resolver, uint64 timestamp);
    
    modifier onlyGovernance() {
        if (!governance[msg.sender] && owner() != msg.sender) {
            revert NileLinkLibs.Unauthorized();
        }
        _;
    }
    
    constructor() Ownable(msg.sender) {}
    
    /// @notice Flag an anomaly in the system
    /// @param subject Subject being flagged (restaurant address, orderId, etc.)
    /// @param anomalyType Type of anomaly detected
    /// @param severity Severity level (1-10)
    /// @param detailsHash Hash of detailed anomaly information
    function flagAnomaly(
        bytes32 subject,
        bytes32 anomalyType,
        uint8 severity,
        bytes32 detailsHash
    ) public override whenNotPaused {
        require(severity >= 1 && severity <= 10, "Invalid severity");
        
        // Create unique anomaly ID
        bytes32 anomalyId = keccak256(abi.encodePacked(subject, anomalyType, block.timestamp));
        
        // Store anomaly data
        anomalies[anomalyId] = AnomalyData({
            subject: subject,
            anomalyType: anomalyType,
            severity: severity,
            detailsHash: detailsHash,
            timestamp: uint64(block.timestamp),
            resolved: false,
            resolvedBy: address(0)
        });
        
        // Automatically block high-severity anomalies
        if (severity >= 8) {
            blockedTransactions[subject] = true;
        }
        
        emit AnomalyFlagged(subject, anomalyType, severity, detailsHash, uint64(block.timestamp));
    }
    
    /// @notice Block a specific transaction
    /// @param txRef Transaction reference (hash, orderId, etc.)
    /// @param reasonHash Hash of blocking reason
    function blockTransaction(
        bytes32 txRef,
        bytes32 reasonHash
    ) external override onlyGovernance whenNotPaused {
        blockedTransactions[txRef] = true;
        
        emit TransactionBlocked(txRef, reasonHash, uint64(block.timestamp));
    }
    
    /// @notice Check if a transaction is blocked
    /// @param txRef Transaction reference
    /// @return isBlocked Whether the transaction is blocked
    function isBlocked(bytes32 txRef) external view override returns (bool blocked) {
        return blockedTransactions[txRef];
    }
    
    /// @notice Check for anomalies in order creation
    /// @param restaurant Restaurant address
    /// @param orderId Order identifier
    /// @param amount Order amount in USD with 6 decimals
    /// @return isAnomaly Whether an anomaly was detected
    /// @return severity Severity level if anomaly detected
    /// @return recommendedAction Recommended action to take
    function checkOrderAnomaly(
        address restaurant,
        bytes16 orderId,
        uint256 amount
    ) external whenNotPaused returns (
        bool isAnomaly,
        uint8 severity,
        string memory recommendedAction
    ) {
        // Check if restaurant has custom rules
        RuleSet storage rules = restaurantRules[restaurant];
        uint256 maxOrderAmount = rules.customRulesEnabled ? 
            rules.maxOrderAmount : DEFAULT_MAX_ORDER_AMOUNT;
        
        // Check order amount
        if (amount > maxOrderAmount) {
            flagAnomaly(
                bytes32(uint256(uint160(restaurant))),
                keccak256("LARGE_ORDER"),
                _calculateSeverity(amount, maxOrderAmount),
                keccak256("Order amount exceeds threshold")
            );
            
            return (true, _calculateSeverity(amount, maxOrderAmount), "BLOCK_ORDER");
        }
        
        // Update hourly volume tracking
        _updateHourlyVolume(restaurant, amount);
        
        // Check hourly order limits
        HourlyVolume storage hourly = hourlyVolume[restaurant];
        uint256 maxOrdersPerHour = rules.customRulesEnabled ? 
            rules.maxOrdersPerHour : DEFAULT_MAX_ORDERS_PER_HOUR;
            
        if (hourly.ordersCount > maxOrdersPerHour) {
            flagAnomaly(
                bytes32(uint256(uint160(restaurant))),
                keccak256("HIGH_ORDER_FREQUENCY"),
                7,
                keccak256("Orders per hour exceed threshold")
            );
            
            return (true, 7, "REVIEW_ORDER");
        }
        
        // Check daily volume limits
        _updateDailyStats(restaurant, amount);
        DailyStats storage daily = dailyStats[restaurant];
        uint256 maxDailyVolume = rules.customRulesEnabled ? 
            rules.maxDailyVolume : DEFAULT_MAX_DAILY_VOLUME;
            
        if (daily.totalVolumeUsd6 > maxDailyVolume) {
            flagAnomaly(
                bytes32(uint256(uint160(restaurant))),
                keccak256("HIGH_DAILY_VOLUME"),
                6,
                keccak256("Daily volume exceeds threshold")
            );
            
            return (true, 6, "REVIEW_ORDER");
        }
        
        return (false, 0, "APPROVE");
    }
    
    /// @notice Check for refund anomalies
    /// @param restaurant Restaurant address
    /// @param orderId Order identifier
    /// @param refundAmount Refund amount in USD with 6 decimals
    /// @return isAnomaly Whether an anomaly was detected
    function checkRefundAnomaly(
        address restaurant,
        bytes16 orderId,
        uint256 refundAmount
    ) external whenNotPaused returns (bool isAnomaly) {
        // Update refund tracking
        dailyStats[restaurant].refundCount++;
        
        // Calculate refund rate
        uint256 refundRate = dailyStats[restaurant].refundCount * 10000 / 
            (dailyStats[restaurant].totalOrders + 1);
        
        // Get refund rate limit
        RuleSet storage rules = restaurantRules[restaurant];
        uint8 maxRefundRate = rules.customRulesEnabled ? 
            rules.maxRefundRateBps : DEFAULT_MAX_REFUND_RATE_BPS;
        
        if (refundRate > maxRefundRate) {
            flagAnomaly(
                bytes32(uint256(uint160(restaurant))),
                keccak256("HIGH_REFUND_RATE"),
                8,
                keccak256("Refund rate exceeds threshold")
            );
            
            return true;
        }
        
        return false;
    }
    
    /// @notice Update custom rules for a restaurant
    /// @param restaurant Restaurant address
    /// @param maxOrderAmount Maximum order amount in USD with 6 decimals
    /// @param maxOrdersPerHour Maximum orders per hour
    /// @param maxDailyVolume Maximum daily volume in USD with 6 decimals
    /// @param maxRefundRateBps Maximum refund rate in basis points
    function updateRestaurantRules(
        address restaurant,
        uint256 maxOrderAmount,
        uint256 maxOrdersPerHour,
        uint256 maxDailyVolume,
        uint8 maxRefundRateBps
    ) external onlyGovernance {
        NileLinkLibs.validateAddress(restaurant);
        require(maxRefundRateBps <= 10000, "Invalid refund rate");
        
        restaurantRules[restaurant] = RuleSet({
            maxOrderAmount: maxOrderAmount,
            maxOrdersPerHour: maxOrdersPerHour,
            maxDailyVolume: maxDailyVolume,
            maxRefundRateBps: maxRefundRateBps,
            customRulesEnabled: true
        });
        
        emit RuleSetUpdated(
            restaurant,
            maxOrderAmount,
            maxOrdersPerHour,
            maxDailyVolume,
            maxRefundRateBps,
            uint64(block.timestamp)
        );
    }
    
    /// @notice Get anomaly rules for a restaurant
    /// @param restaurant Restaurant address
    /// @return rules RuleSet structure
    /// @return customEnabled Whether custom rules are enabled
    function getAnomalyRules(address restaurant) 
        external 
        view 
        returns (RuleSet memory rules, bool customEnabled) 
    {
        RuleSet storage ruleSet = restaurantRules[restaurant];
        return (ruleSet, ruleSet.customRulesEnabled);
    }
    
    /// @notice Get anomaly data
    /// @param anomalyId Anomaly identifier
    /// @return anomaly Anomaly data structure
    function getAnomaly(bytes32 anomalyId) external view returns (AnomalyData memory anomaly) {
        return anomalies[anomalyId];
    }
    
    /// @notice Resolve an anomaly (remove block)
    /// @param anomalyId Anomaly identifier
    function resolveAnomaly(bytes32 anomalyId) external onlyGovernance {
        AnomalyData storage anomaly = anomalies[anomalyId];
        require(!anomaly.resolved, "Already resolved");
        
        anomaly.resolved = true;
        anomaly.resolvedBy = msg.sender;
        
        // Remove block if it was applied
        blockedTransactions[anomaly.subject] = false;
        
        emit AnomalyResolved(anomalyId, msg.sender, uint64(block.timestamp));
    }
    
    /// @notice Get restaurant volume statistics
    /// @param restaurant Restaurant address
    /// @return hourly Hourly volume data
    /// @return daily Daily statistics
    function getRestaurantStats(address restaurant) 
        external 
        view 
        returns (HourlyVolume memory hourly, DailyStats memory daily) 
    {
        return (hourlyVolume[restaurant], dailyStats[restaurant]);
    }
    
    /// @notice Calculate severity based on amount and threshold
    /// @param amount Current amount
    /// @param threshold Threshold amount
    /// @return severity Severity level (1-10)
    function _calculateSeverity(uint256 amount, uint256 threshold) internal pure returns (uint8 severity) {
        uint256 ratio = (amount * 100) / threshold; // Percentage over threshold
        
        if (ratio <= 110) return 3; // 0-10% over
        if (ratio <= 150) return 5; // 10-50% over
        if (ratio <= 200) return 7; // 50-100% over
        return 9; // 100%+ over
    }
    
    /// @notice Update hourly volume tracking
    /// @param restaurant Restaurant address
    /// @param amount Order amount
    function _updateHourlyVolume(address restaurant, uint256 amount) internal {
        HourlyVolume storage hourly = hourlyVolume[restaurant];
        uint256 hourStart = (block.timestamp / 1 hours) * 1 hours;
        
        if (hourly.startTime != hourStart) {
            // New hour, reset counters
            hourly.ordersCount = 1;
            hourly.volumeUsd6 = amount;
            hourly.startTime = hourStart;
        } else {
            hourly.ordersCount++;
            hourly.volumeUsd6 += amount;
        }
    }
    
    /// @notice Update daily statistics
    /// @param restaurant Restaurant address
    /// @param amount Order amount
    function _updateDailyStats(address restaurant, uint256 amount) internal {
        DailyStats storage daily = dailyStats[restaurant];
        uint256 dayStart = (block.timestamp / 1 days) * 1 days;
        
        if (daily.startDate != dayStart) {
            // New day, reset counters
            daily.totalOrders = 1;
            daily.totalVolumeUsd6 = amount;
            daily.refundCount = 0;
            daily.startDate = dayStart;
        } else {
            daily.totalOrders++;
            daily.totalVolumeUsd6 += amount;
        }
    }
    
    /// @notice Add or remove governance address
    /// @param account Account to modify
    /// @param isGovernance Whether to add or remove
    function setGovernance(address account, bool isGovernance) external onlyOwner {
        NileLinkLibs.validateAddress(account);
        governance[account] = isGovernance;
    }
    
    /// @notice Pause contract operations
    function pause() external onlyOwner {
        _pause();
    }
    
    /// @notice Unpause contract operations
    function unpause() external onlyOwner {
        _unpause();
    }
}