// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "../interfaces/SmartContract_Interfaces.sol";
import "../libraries/NileLinkLibs.sol";

// Simple interface for Chainlink oracle (defined inline to avoid dependency issues)
interface AggregatorV3Interface {
    function latestRoundData() external view returns (
        uint80 roundId,
        int256 answer,
        uint256 startedAt,
        uint256 updatedAt,
        uint80 answeredInRound
    );
}

/// @title CurrencyExchange.sol
/// @notice Real-time exchange rate management via Chainlink for NileLink Protocol
contract CurrencyExchange is ICurrencyExchange, Ownable, Pausable, ReentrancyGuard {
    using Address for address;
    
    // Rate storage
    mapping(bytes3 => RateData) public currencyRates;
    mapping(address => mapping(bytes3 => NileLinkTypes.RateSnapshot)) public restaurantRates;
    mapping(bytes3 => RateHistory[]) public rateHistory;
    
    struct RateData {
        uint256 rate; // local currency per 1 USD, scaled by 1e8
        uint64 timestamp;
        address oracleSource;
        bool isValid;
    }
    
    struct RateHistory {
        uint256 rate;
        uint64 timestamp;
        address oracleSource;
    }
    
    // Governance and oracle management
    mapping(address => bool) public authorizedOracles;
    mapping(bytes3 => address) public currencyOracles;
    
    // Events
    event ExchangeRateSnapshotted(
        address indexed restaurant,
        bytes3 indexed localCurrency,
        uint256 rate,
        address indexed oracleSource,
        uint64 timestamp
    );
    
    event OracleUpdated(bytes3 indexed localCurrency, address indexed oracle, uint64 timestamp);
    
    event RateUpdated(
        bytes3 indexed currency,
        uint256 oldRate,
        uint256 newRate,
        address indexed oracleSource,
        uint64 timestamp
    );
    
    event RateOutOfBounds(
        bytes3 indexed currency,
        uint256 rate,
        string expectedRange,
        uint64 timestamp
    );
    
    event RateHistoryPruned(bytes3 indexed currency, uint64 prunedUntil, uint64 timestamp);

    event AnomalyFlagged(
        bytes32 indexed subject,
        bytes32 indexed anomalyType,
        uint8 severity,
        bytes32 detailsHash,
        uint64 timestamp
    );
    
    modifier onlyAuthorizedOracle() {
        if (!authorizedOracles[msg.sender]) {
            revert NileLinkLibs.Unauthorized();
        }
        _;
    }
    
    constructor() Ownable() {}
    
    /// @notice Set Chainlink oracle for a currency
    /// @param currency ISO-4217 currency code
    /// @param oracle Chainlink oracle address
    function setOracle(bytes3 currency, address oracle) external override onlyOwner {
        NileLinkLibs.validateAddress(oracle);
        
        // Verify oracle is a valid Chainlink aggregator
        AggregatorV3Interface priceOracle = AggregatorV3Interface(oracle);
        
        // Try to get latest round data to validate oracle
        try priceOracle.latestRoundData() returns (
            uint80,
            int256 price,
            uint256,
            uint256 updatedAt,
            uint80
        ) {
            require(price > 0, "Invalid oracle price");
            require(updatedAt > 0, "Oracle not initialized");
        } catch {
            revert("Invalid oracle contract");
        }
        
        currencyOracles[currency] = oracle;
        
        emit OracleUpdated(currency, oracle, uint64(block.timestamp));
    }
    
    /// @notice Update exchange rate (authorized oracle only)
    /// @param currency ISO-4217 currency code
    /// @param newRate New exchange rate (scaled by 1e8)
    function updateRate(bytes3 currency, uint256 newRate) external onlyAuthorizedOracle {
        NileLinkLibs.validateRate(newRate);
        
        address oracle = currencyOracles[currency];
        if (oracle == address(0)) {
            revert NileLinkLibs.InvalidAddress();
        }
        
        // Get current rate data
        RateData storage rateData = currencyRates[currency];
        uint256 oldRate = rateData.rate;
        
        // Validate rate bounds (detect anomalies)
        if (!_isRateReasonable(currency, newRate)) {
            emit RateOutOfBounds(
                currency,
                newRate,
                _getExpectedRange(currency),
                uint64(block.timestamp)
            );
            
            // Flag as anomaly but continue
            emit AnomalyFlagged(
                bytes32(uint256(uint160(oracle))),
                keccak256("RATE_ANOMALY"),
                7,
                keccak256("Exchange rate outside expected bounds"),
                uint64(block.timestamp)
            );
        }
        
        // Update rate data
        rateData.rate = newRate;
        rateData.timestamp = uint64(block.timestamp);
        rateData.oracleSource = msg.sender;
        rateData.isValid = true;
        
        // Add to history
        rateHistory[currency].push(RateHistory({
            rate: newRate,
            timestamp: uint64(block.timestamp),
            oracleSource: msg.sender
        }));
        
        // Prune old history (keep last 30 days)
        _pruneRateHistory(currency);
        
        emit RateUpdated(currency, oldRate, newRate, msg.sender, uint64(block.timestamp));
    }
    
    /// @notice Snapshot rate for a specific restaurant order
    /// @param restaurant Restaurant address
    /// @param localCurrency ISO-4217 currency code
    /// @return snapshot Rate snapshot data
    function snapshotRate(
        address restaurant,
        bytes3 localCurrency
    ) external override nonReentrant returns (NileLinkTypes.RateSnapshot memory snapshot) {
        NileLinkLibs.validateAddress(restaurant);
        
        RateData storage currentRate = currencyRates[localCurrency];
        if (!currentRate.isValid) {
            revert NileLinkLibs.InvalidRate();
        }
        
        // Create snapshot for this specific restaurant
        snapshot = NileLinkTypes.RateSnapshot({
            country: "", // Will be populated by caller if needed
            localCurrency: localCurrency,
            rate: currentRate.rate,
            timestamp: currentRate.timestamp,
            oracleSource: currentRate.oracleSource
        });
        
        // Store restaurant-specific snapshot
        restaurantRates[restaurant][localCurrency] = snapshot;
        
        emit ExchangeRateSnapshotted(
            restaurant,
            localCurrency,
            currentRate.rate,
            currentRate.oracleSource,
            uint64(block.timestamp)
        );
        
        return snapshot;
    }
    
    /// @notice Get latest exchange rate for a currency
    /// @param localCurrency ISO-4217 currency code
    /// @return rate Current exchange rate
    /// @return oracle Oracle address
    /// @return updatedAt Last update timestamp
    function getLatestRate(bytes3 localCurrency) 
        external 
        view 
        override 
        returns (uint256 rate, address oracle, uint64 updatedAt) 
    {
        RateData storage rateData = currencyRates[localCurrency];
        return (rateData.rate, rateData.oracleSource, rateData.timestamp);
    }
    
    /// @notice Get restaurant-specific snapshot
    /// @param restaurant Restaurant address
    /// @param localCurrency ISO-4217 currency code
    /// @return snapshot Rate snapshot
    function getRestaurantRate(
        address restaurant,
        bytes3 localCurrency
    ) external view returns (NileLinkTypes.RateSnapshot memory snapshot) {
        return restaurantRates[restaurant][localCurrency];
    }
    
    /// @notice Convert USD amount to local currency
    /// @param localCurrency ISO-4217 currency code
    /// @param amountUsd Amount in USD with 6 decimals
    /// @return amountLocal Amount in local currency (rounded to 2 decimals)
    function convertToLocal(
        bytes3 localCurrency,
        uint256 amountUsd
    ) external view returns (uint256 amountLocal) {
        RateData storage rateData = currencyRates[localCurrency];
        require(rateData.isValid, "Rate not available");
        
        // Convert: amount_usd * rate / 1e8, then round to 2 decimals
        uint256 rawAmount = (amountUsd * rateData.rate) / 10**8;
        
        // Convert to 2 decimal places (assume local currency has cents/paisa)
        amountLocal = (rawAmount / 10**4);
        
        return amountLocal;
    }
    
    /// @notice Convert local currency amount to USD
    /// @param localCurrency ISO-4217 currency code
    /// @param amountLocal Amount in local currency (2 decimals)
    /// @return amountUsd Amount in USD with 6 decimals
    function convertToUSD(
        bytes3 localCurrency,
        uint256 amountLocal
    ) external view returns (uint256 amountUsd) {
        RateData storage rateData = currencyRates[localCurrency];
        require(rateData.isValid, "Rate not available");
        
        // Convert: amount_local * 1e8 / rate, then round to 6 decimals
        uint256 rawAmount = (amountLocal * 10**8) / rateData.rate;
        
        // Convert to 6 decimal places (USD cents)
        amountUsd = (rawAmount * 10**4);
        
        return amountUsd;
    }
    
    /// @notice Get rate history for a currency
    /// @param localCurrency ISO-4217 currency code
    /// @param historyDays Number of days to retrieve
    /// @return rates Array of rate history entries
    function getRateHistory(
        bytes3 localCurrency,
        uint8 historyDays
    ) external view returns (RateHistory[] memory rates) {
        RateHistory[] storage history = rateHistory[localCurrency];
        if (history.length == 0) {
            return new RateHistory[](0);
        }
        
        uint256 cutoffTime = block.timestamp - (uint256(historyDays) * 1 days);
        uint256 validCount = 0;
        
        // Count valid entries
        for (uint256 i = history.length; i > 0; i--) {
            if (history[i-1].timestamp >= cutoffTime) {
                validCount++;
            } else {
                break;
            }
        }
        
        // Extract valid entries
        rates = new RateHistory[](validCount);
        for (uint256 i = 0; i < validCount; i++) {
            rates[i] = history[history.length - validCount + i];
        }
        
        return rates;
    }
    
    /// @notice Check if a rate is within reasonable bounds
    /// @param currency Currency code
    /// @param rate Exchange rate to validate
    /// @return isValid Whether the rate is reasonable
    function _isRateReasonable(bytes3 currency, uint256 rate) internal pure returns (bool isValid) {
        // Define reasonable bounds for common currencies
        // Lebanon LBP: 1,000 - 200,000
        if (currency == "LBP") {
            return rate >= 10_000_000 && rate <= 20_000_000_000; // 1,000 to 200,000 scaled
        }
        
        // USD pairs should be close to 1e8 (1 USD = 1 local)
        if (currency == "USD") {
            return rate >= 90_000_000 && rate <= 110_000_000; // ±10%
        }
        
        // Default bounds: 0.1 to 1000
        return rate >= 10_000_000 && rate <= 100_000_000_000; // 0.1 to 1000 scaled
    }
    
    /// @notice Get expected range description for a currency
    /// @param currency Currency code
    /// @return range description
    function _getExpectedRange(bytes3 currency) internal pure returns (string memory range) {
        if (currency == "LBP") {
            return "1,000-200,000 LBP/USD";
        }
        if (currency == "USD") {
            return "0.9-1.1 USD/USD";
        }
        return "0.1-1000 currency/USD";
    }
    
    /// @notice Prune old rate history (keep last 30 days)
    /// @param currency Currency code
    function _pruneRateHistory(bytes3 currency) internal {
        RateHistory[] storage history = rateHistory[currency];
        if (history.length == 0) return;
        
        uint256 cutoffTime = block.timestamp - 30 days;
        uint256 removeCount = 0;
        
        // Count entries to remove
        for (uint256 i = 0; i < history.length; i++) {
            if (history[i].timestamp < cutoffTime) {
                removeCount++;
            }
        }
        
        // Remove old entries
        if (removeCount > 0) {
            for (uint256 i = 0; i < removeCount; i++) {
                delete history[i];
            }
            
            // Shift array
            for (uint256 i = removeCount; i < history.length; i++) {
                history[i - removeCount] = history[i];
            }
            
            // Resize array
            for (uint256 i = history.length - removeCount; i < history.length; i++) {
                history.pop();
            }
            
            emit RateHistoryPruned(currency, uint64(cutoffTime), uint64(block.timestamp));
        }
    }
    
    /// @notice Add authorized oracle address
    /// @param oracle Oracle address to authorize
    /// @param isAuthorized Whether to authorize or revoke
    function setAuthorizedOracle(address oracle, bool isAuthorized) external onlyOwner {
        NileLinkLibs.validateAddress(oracle);
        authorizedOracles[oracle] = isAuthorized;
    }
    
    /// @notice Get oracle for currency
    /// @param currency Currency code
    /// @return oracle Oracle address
    function getOracle(bytes3 currency) external view returns (address oracle) {
        return currencyOracles[currency];
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