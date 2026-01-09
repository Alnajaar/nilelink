// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "../interfaces/SmartContract_Interfaces.sol";
import "../libraries/NileLinkLibs.sol";

/// @title RestaurantRegistry.sol
/// @notice Restaurant KYC, wallet management, and rate limits for NileLink Protocol
contract RestaurantRegistry is IRestaurantRegistry, Ownable, Pausable, ReentrancyGuard {
    using Address for address;
    
    /// @notice Mapping of restaurant addresses to their configuration
    mapping(address => NileLinkTypes.RestaurantRecord) public restaurants;
    
    /// @notice Mapping to track daily USDC usage for rate limiting
    mapping(address => uint256) public dailyUsdUsage;
    
    /// @notice Mapping to track last settlement timestamp
    mapping(address => uint64) public lastSettlement;

    /// @notice Total number of registered restaurants
    uint256 public totalRestaurants;
    
    /// @notice Chainlink oracle for exchange rates
    mapping(bytes3 => address) public currencyOracles;
    
    /// @notice Governance role for multi-sig operations
    mapping(address => bool) public governance;
    
    /// @notice Events emitted by the contract
    event RestaurantRegistered(
        address indexed restaurant,
        bytes2 indexed country,
        bytes3 indexed localCurrency,
        uint256 dailyRateLimitUsd6,
        address chainlinkOracle,
        uint64 timestamp
    );
    
    event RestaurantConfigUpdated(
        address indexed restaurant,
        uint256 dailyRateLimitUsd6,
        address chainlinkOracle,
        NileLinkTypes.RestaurantStatus status,
        uint64 timestamp
    );
    
    event RateLimitUpdated(
        address indexed restaurant,
        uint256 oldLimit,
        uint256 newLimit,
        uint64 timestamp
    );
    
    event RestaurantSuspended(
        address indexed restaurant,
        string reason,
        uint64 timestamp
    );
    
    event GovernanceUpdated(address indexed account, bool isGovernance);
    
    event RestaurantNotActive(
        address indexed restaurant,
        uint64 timestamp
    );

    event OracleUpdated(bytes3 indexed localCurrency, address indexed oracle, uint64 timestamp);
    
    modifier onlyGovernance() {
        if (!governance[msg.sender] && owner() != msg.sender) {
            revert NileLinkLibs.Unauthorized();
        }
        _;
    }
    
    modifier onlyRestaurantOwner(address restaurant) {
        if (restaurants[restaurant].restaurant != msg.sender) {
            revert NileLinkLibs.Unauthorized();
        }
        _;
    }
    
    constructor() {}
    
    /// @notice Register a new restaurant with the protocol
    /// @param restaurant The restaurant wallet address
    /// @param config Restaurant configuration parameters
    function registerRestaurant(
        address restaurant,
        NileLinkTypes.RestaurantConfig calldata config
    ) external override onlyGovernance whenNotPaused {
        NileLinkLibs.validateAddress(restaurant);
        
        // Validate rate limit bounds
        NileLinkLibs.validateRateLimit(config.dailyRateLimitUsd6);
        
        // Ensure restaurant doesn't already exist
        if (restaurants[restaurant].restaurant != address(0)) {
            revert NileLinkLibs.AlreadyProcessed();
        }
        
        // Validate oracle exists for the currency
        if (config.chainlinkOracle == address(0)) {
            revert NileLinkLibs.InvalidAddress();
        }
        
        // Create restaurant record
        restaurants[restaurant] = NileLinkTypes.RestaurantRecord({
            restaurant: restaurant,
            config: config,
            createdAt: uint64(block.timestamp),
            lastModified: uint64(block.timestamp)
        });

        totalRestaurants++;
        
        // Initialize rate tracking
        lastSettlement[restaurant] = uint64(block.timestamp);
        dailyUsdUsage[restaurant] = 0;
        
        emit RestaurantRegistered(
            restaurant,
            config.country,
            config.localCurrency,
            config.dailyRateLimitUsd6,
            config.chainlinkOracle,
            uint64(block.timestamp)
        );
    }
    
    /// @notice Update restaurant configuration
    /// @param restaurant The restaurant address
    /// @param config New configuration parameters
    function updateRestaurantConfig(
        address restaurant,
        NileLinkTypes.RestaurantConfig calldata config
    ) external override onlyRestaurantOwner(restaurant) whenNotPaused {
        NileLinkLibs.validateAddress(restaurant);
        
        // Validate rate limit bounds
        NileLinkLibs.validateRateLimit(config.dailyRateLimitUsd6);
        
        // Validate oracle
        if (config.chainlinkOracle == address(0)) {
            revert NileLinkLibs.InvalidAddress();
        }
        
        // Get current record
        NileLinkTypes.RestaurantRecord storage record = restaurants[restaurant];
        
        // Store old values for event
        uint256 oldLimit = record.config.dailyRateLimitUsd6;
        address oldOracle = record.config.chainlinkOracle;
        
        // Update configuration
        record.config = config;
        record.lastModified = uint64(block.timestamp);
        
        emit RestaurantConfigUpdated(
            restaurant,
            config.dailyRateLimitUsd6,
            config.chainlinkOracle,
            config.status,
            uint64(block.timestamp)
        );
        
        // Emit separate event for rate limit changes
        if (oldLimit != config.dailyRateLimitUsd6) {
            emit RateLimitUpdated(
                restaurant,
                oldLimit,
                config.dailyRateLimitUsd6,
                uint64(block.timestamp)
            );
        }
    }
    
    /// @notice Set daily rate limit (restricted to owner)
    /// @param restaurant The restaurant address
    /// @param newLimit New daily rate limit in USD with 6 decimals
    function setDailyRateLimit(
        address restaurant,
        uint256 newLimit
    ) external onlyRestaurantOwner(restaurant) whenNotPaused {
        NileLinkLibs.validateRateLimit(newLimit);
        
        NileLinkTypes.RestaurantRecord storage record = restaurants[restaurant];
        uint256 oldLimit = record.config.dailyRateLimitUsd6;
        record.config.dailyRateLimitUsd6 = newLimit;
        record.lastModified = uint64(block.timestamp);
        
        emit RateLimitUpdated(
            restaurant,
            oldLimit,
            newLimit,
            uint64(block.timestamp)
        );
    }
    
    /// @notice Suspend a restaurant (governance only)
    /// @param restaurant The restaurant address
    /// @param reason Suspension reason
    function suspendRestaurant(
        address restaurant,
        string calldata reason
    ) external onlyGovernance {
        NileLinkTypes.RestaurantRecord storage record = restaurants[restaurant];
        if (record.restaurant == address(0)) {
            revert NileLinkLibs.InvalidAddress();
        }
        
        record.config.status = NileLinkTypes.RestaurantStatus.SUSPENDED;
        record.lastModified = uint64(block.timestamp);
        
        emit RestaurantSuspended(restaurant, reason, uint64(block.timestamp));
    }
    
    /// @notice Check and update daily rate limit usage
    /// @param restaurant The restaurant address
    /// @param amount Amount to check in USD with 6 decimals
    /// @return allowed Whether the transaction is allowed
    function checkAndUpdateRateLimit(
        address restaurant,
        uint256 amount
    ) external whenNotPaused returns (bool allowed) {
        NileLinkTypes.RestaurantRecord storage record = restaurants[restaurant];
        
        // Check if restaurant is active
        if (record.config.status != NileLinkTypes.RestaurantStatus.ACTIVE) {
            return false;
        }
        
        // Reset daily usage if 24 hours have passed
        uint64 currentTime = uint64(block.timestamp);
        if (currentTime - lastSettlement[restaurant] >= 1 days) {
            dailyUsdUsage[restaurant] = 0;
            lastSettlement[restaurant] = currentTime;
        }
        
        // Check if amount would exceed rate limit
        uint256 newUsage = dailyUsdUsage[restaurant] + amount;
        if (newUsage > record.config.dailyRateLimitUsd6) {
            emit RestaurantNotActive(restaurant, currentTime);
            return false;
        }
        
        // Update usage
        dailyUsdUsage[restaurant] = newUsage;
        return true;
    }
    
    /// @notice Get comprehensive restaurant status
    /// @param restaurant The restaurant address
    /// @return status Restaurant status enum
    /// @return limit Daily rate limit
    /// @return balance Current daily usage
    /// @return lastSettlementTime Last settlement timestamp
    function getRestaurantStatus(
        address restaurant
    ) external view returns (
        NileLinkTypes.RestaurantStatus status,
        uint256 limit,
        uint256 balance,
        uint64 lastSettlementTime
    ) {
        NileLinkTypes.RestaurantRecord storage record = restaurants[restaurant];
        status = record.config.status;
        limit = record.config.dailyRateLimitUsd6;
        balance = dailyUsdUsage[restaurant];
        lastSettlementTime = lastSettlement[restaurant];
    }
    
    /// @notice Get restaurant record
    /// @param restaurant The restaurant address
    /// @return Restaurant record structure
    function getRestaurant(
        address restaurant
    ) external view override returns (NileLinkTypes.RestaurantRecord memory) {
        return restaurants[restaurant];
    }
    
    /// @notice Check if restaurant is active
    /// @param restaurant The restaurant address
    /// @return active Whether the restaurant is active
    function isActive(
        address restaurant
    ) external view override returns (bool active) {
        NileLinkTypes.RestaurantRecord storage record = restaurants[restaurant];
        return record.restaurant != address(0) && 
               record.config.status == NileLinkTypes.RestaurantStatus.ACTIVE;
    }
    
    /// @notice Get Chainlink oracle for a currency
    /// @param currency The currency code (ISO-4217 alpha-3)
    /// @return oracle Oracle address
    function getOracle(bytes3 currency) external view returns (address oracle) {
        return currencyOracles[currency];
    }
    
    /// @notice Set Chainlink oracle for a currency
    /// @param currency The currency code
    /// @param oracle Oracle address
    function setOracle(bytes3 currency, address oracle) external onlyGovernance {
        NileLinkLibs.validateAddress(oracle);
        currencyOracles[currency] = oracle;
        emit OracleUpdated(currency, oracle, uint64(block.timestamp));
    }
    
    /// @notice Add or remove governance address
    /// @param account Account to modify
    /// @param isGovernance Whether to add or remove
    function setGovernance(address account, bool isGovernance) external onlyOwner {
        NileLinkLibs.validateAddress(account);
        governance[account] = isGovernance;
        emit GovernanceUpdated(account, isGovernance);
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