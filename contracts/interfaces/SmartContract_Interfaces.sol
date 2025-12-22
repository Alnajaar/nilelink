// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title NileLink Protocol v0.1 — Smart Contract Interfaces
/// @notice ABI-compatible interfaces for the NileLink on-chain components.
/// @dev These are interfaces only (no implementation). Implementations MUST emit the events defined here.

library NileLinkTypes {
    enum RestaurantStatus {
        ACTIVE,
        SUSPENDED,
        INACTIVE
    }

    enum PaymentMethod {
        BLOCKCHAIN,
        FIAT,
        NILE_FUTURE
    }

    enum TxStatus {
        PENDING,
        CONFIRMED,
        SETTLED,
        DISPUTED,
        REFUNDED
    }

    enum DisputeResolution {
        NONE,
        REFUND,
        CONFIRM
    }

    struct RestaurantConfig {
        bytes32 ownerPhoneHash; // E.164 phone, hashed off-chain (e.g., keccak256)
        bytes32 legalNameHash; // hash of legalName (Arabic+English allowed)
        bytes32 localNameHash; // hash of localName
        bytes2 country; // ISO-3166 alpha-2
        bytes3 localCurrency; // ISO-4217 alpha-3
        uint256 dailyRateLimitUsd6; // USD limit with 6 decimals
        int32 timezoneOffsetMinutes; // e.g., Beirut = +180
        uint16 taxBps; // 1000 = 10.00%
        address chainlinkOracle;
        RestaurantStatus status;
    }

    struct RestaurantRecord {
        address restaurant;
        RestaurantConfig config;
        uint64 createdAt;
        uint64 lastModified;
    }

    /// @dev UUIDv4 represented as bytes16.
    struct OrderRef {
        bytes16 orderId;
        address restaurant;
        address customer;
    }

    struct RateSnapshot {
        bytes2 country;
        bytes3 localCurrency;
        uint256 rate; // local per 1 USD, scaled by 1e8 (Chainlink style)
        uint64 timestamp;
        address oracleSource;
    }

    struct Dispute {
        bytes16 orderId;
        address claimant;
        uint256 claimAmountUsd6;
        uint64 openedAt;
        uint64 deadlineAt;
        DisputeResolution resolution;
        bytes32 reasonHash;
    }

    struct CreditLine {
        address restaurant;
        address supplier;
        uint256 limitUsd6;
        uint256 usedUsd6;
        uint64 updatedAt;
        bytes32 termsHash; // COD/Net-30/etc off-chain terms hash
    }
}

/// @notice Restaurant KYC, rate limits, status.
interface IRestaurantRegistry {
    function registerRestaurant(address restaurant, NileLinkTypes.RestaurantConfig calldata config) external;
    function updateRestaurantConfig(address restaurant, NileLinkTypes.RestaurantConfig calldata config) external;
    function getRestaurant(address restaurant) external view returns (NileLinkTypes.RestaurantRecord memory);
    function isActive(address restaurant) external view returns (bool);
}

/// @notice Order creation, payment validation, settlement.
interface IOrderSettlement {
    function protocolFeeBps() external view returns (uint16);
    function createPaymentIntent(bytes16 orderId, address restaurant, address customer, uint256 amountUsd6, NileLinkTypes.PaymentMethod method) external;
    function pay(bytes16 orderId, uint256 amountUsd6) external;
    function settle(bytes16 orderId) external;
    function refund(bytes16 orderId, address to, uint256 amountUsd6) external;
    function getOrderStatus(bytes16 orderId) external view returns (NileLinkTypes.TxStatus status, uint256 amount, uint64 paidAt, uint64 settledAt);
}

/// @notice Real-time rate management via Chainlink.
interface ICurrencyExchange {
    function setOracle(bytes3 localCurrency, address oracle) external;
    function snapshotRate(address restaurant, bytes3 localCurrency) external returns (NileLinkTypes.RateSnapshot memory);
    function getLatestRate(bytes3 localCurrency) external view returns (uint256 rate, address oracle, uint64 updatedAt);
}

/// @notice 3-day auto-settle, manual override.
interface IDisputeResolution {
    function openDispute(bytes16 orderId, uint256 claimAmountUsd6, bytes32 reasonHash) external;
    function resolveDispute(bytes16 orderId, NileLinkTypes.DisputeResolution resolution, uint256 refundAmountUsd6) external;
    function autoSettle(bytes16 orderId) external;
    function getDispute(bytes16 orderId) external view returns (NileLinkTypes.Dispute memory);
}

/// @notice Anomaly detection logic.
interface IFraudDetection {
    event AnomalyFlagged(
        bytes32 indexed subject,
        bytes32 indexed anomalyType,
        uint8 severity,
        bytes32 detailsHash,
        uint64 timestamp
    );

    event TransactionBlocked(bytes32 indexed txRef, bytes32 reasonHash, uint64 timestamp);

    function flagAnomaly(bytes32 subject, bytes32 anomalyType, uint8 severity, bytes32 detailsHash) external;
    function blockTransaction(bytes32 txRef, bytes32 reasonHash) external;
    function isBlocked(bytes32 txRef) external view returns (bool);
}

/// @notice Multi-restaurant portfolio management.
interface IInvestorVault {
    function deposit(address restaurant, uint256 amountUsd6) external;
    function withdraw(address restaurant, uint256 amountUsd6) external;
    function claimDividend(address restaurant) external returns (uint256 claimedUsd6);
    function positionOf(address investor, address restaurant) external view returns (uint256 investedUsd6, uint256 ownershipBps);
}

/// @notice Credit line tracking and enforcement.
interface ISupplierCredit {
    function setCreditLine(address restaurant, address supplier, uint256 limitUsd6, bytes32 termsHash) external;
    function getCreditLine(address restaurant, address supplier) external view returns (NileLinkTypes.CreditLine memory);
}