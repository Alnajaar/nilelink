// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title NileLink Protocol v0.1 — Smart Contract Interfaces
/// @notice ABI-compatible interfaces for the NileLink on-chain components.
/// @dev These are interfaces only (no implementation). Implementations MUST emit the events defined here.

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);

    function transferFrom(address from, address to, uint256 amount) external returns (bool);

    function balanceOf(address account) external view returns (uint256);

    function allowance(address owner, address spender) external view returns (uint256);

    function decimals() external view returns (uint8);
}

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

    function registerRestaurant(address restaurant, NileLinkTypes.RestaurantConfig calldata config) external;

    function updateRestaurantConfig(address restaurant, NileLinkTypes.RestaurantConfig calldata config) external;

    function getRestaurant(address restaurant) external view returns (NileLinkTypes.RestaurantRecord memory);

    function isActive(address restaurant) external view returns (bool);
}

/// @notice Order creation, payment validation, settlement.
interface IOrderSettlement {
    event PaymentIntentCreated(
        bytes16 indexed orderId,
        address indexed restaurant,
        address indexed customer,
        uint256 amountUsd6,
        NileLinkTypes.PaymentMethod method,
        uint64 timestamp
    );

    event PaymentReceived(
        bytes16 indexed orderId,
        address indexed payer,
        uint256 amountUsd6,
        uint64 timestamp
    );

    event PaymentSettled(
        bytes16 indexed orderId,
        address indexed restaurant,
        uint256 grossUsd6,
        uint256 feeUsd6,
        uint256 netUsd6,
        uint64 timestamp
    );

    event PaymentRefunded(
        bytes16 indexed orderId,
        address indexed to,
        uint256 amountUsd6,
        uint64 timestamp
    );

    function usdc() external view returns (IERC20);

    function protocolFeeBps() external view returns (uint16);

    function createPaymentIntent(
        bytes16 orderId,
        address restaurant,
        address customer,
        uint256 amountUsd6,
        NileLinkTypes.PaymentMethod method
    ) external;

    /// @notice Collects funds from `msg.sender` via USDC transferFrom.
    function pay(bytes16 orderId, uint256 amountUsd6) external;

    /// @notice Settles funds to restaurant and fee recipient.
    function settle(bytes16 orderId) external;

    /// @notice Refunds customer. Implementations MUST enforce dispute/authorization rules.
    function refund(bytes16 orderId, address to, uint256 amountUsd6) external;
}

/// @notice Real-time rate management via Chainlink.
interface ICurrencyExchange {
    event ExchangeRateSnapshotted(
        address indexed restaurant,
        bytes3 indexed localCurrency,
        uint256 rate,
        address indexed oracleSource,
        uint64 timestamp
    );

    event OracleUpdated(bytes3 indexed localCurrency, address indexed oracle, uint64 timestamp);

    function setOracle(bytes3 localCurrency, address oracle) external;

    /// @notice Snapshot a rate used for an order/settlement. Must be deterministic and auditable.
    function snapshotRate(address restaurant, bytes3 localCurrency) external returns (NileLinkTypes.RateSnapshot memory);

    function getLatestRate(bytes3 localCurrency) external view returns (uint256 rate, address oracle, uint64 updatedAt);
}

/// @notice 3-day auto-settle, manual override.
interface IDisputeResolution {
    event DisputeOpened(
        bytes16 indexed orderId,
        address indexed claimant,
        uint256 claimAmountUsd6,
        uint64 openedAt,
        uint64 deadlineAt,
        bytes32 reasonHash
    );

    event DisputeResolved(
        bytes16 indexed orderId,
        NileLinkTypes.DisputeResolution resolution,
        uint256 refundAmountUsd6,
        uint64 resolvedAt
    );

    function openDispute(bytes16 orderId, uint256 claimAmountUsd6, bytes32 reasonHash) external;

    /// @notice Resolve dispute by an authorized role.
    function resolveDispute(bytes16 orderId, NileLinkTypes.DisputeResolution resolution, uint256 refundAmountUsd6) external;

    /// @notice Auto-settle after deadline according to policy.
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
    event InvestmentDeposited(
        address indexed investor,
        address indexed restaurant,
        uint256 amountUsd6,
        uint64 timestamp
    );

    event InvestmentWithdrawn(
        address indexed investor,
        address indexed restaurant,
        uint256 amountUsd6,
        uint64 timestamp
    );

    event DividendClaimed(
        address indexed investor,
        address indexed restaurant,
        uint256 amountUsd6,
        uint64 timestamp
    );

    function deposit(address restaurant, uint256 amountUsd6) external;

    function withdraw(address restaurant, uint256 amountUsd6) external;

    function claimDividend(address restaurant) external returns (uint256 claimedUsd6);

    function positionOf(address investor, address restaurant) external view returns (uint256 investedUsd6, uint256 ownershipBps);
}

/// @notice Credit line tracking and enforcement.
interface ISupplierCredit {
    event CreditLineSet(
        address indexed restaurant,
        address indexed supplier,
        uint256 limitUsd6,
        bytes32 termsHash,
        uint64 timestamp
    );

    event CreditUsed(
        address indexed restaurant,
        address indexed supplier,
        bytes16 indexed invoiceId,
        uint256 creditAmountUsd6,
        uint64 timestamp
    );

    event CreditRepaid(
        address indexed restaurant,
        address indexed supplier,
        bytes16 indexed invoiceId,
        uint256 repaidAmountUsd6,
        uint64 timestamp
    );

    function setCreditLine(address restaurant, address supplier, uint256 limitUsd6, bytes32 termsHash) external;

    function useCredit(address restaurant, address supplier, bytes16 invoiceId, uint256 creditAmountUsd6) external;

    function repay(address restaurant, address supplier, bytes16 invoiceId, uint256 repaidAmountUsd6) external;

    function getCreditLine(address restaurant, address supplier) external view returns (NileLinkTypes.CreditLine memory);
}
