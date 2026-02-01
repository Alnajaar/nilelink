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
        bytes32 ownerPhoneHash; // E.164 phone, hashed off-chain
        bytes32 legalNameHash; // hash of legalName
        bytes32 localNameHash; // hash of localName
        bytes32 metadataCid; // IPFS CID for rich metadata (logo, bio, images)
        bytes32 catalogCid; // IPFS CID for product catalog/menu
        bytes2 country; // ISO-3166 alpha-2
        bytes3 localCurrency; // ISO-4217 alpha-3
        uint256 dailyRateLimitUsd6; // USD limit with 6 decimals
        int32 timezoneOffsetMinutes; // e.g., Beirut = +180
        uint16 taxBps; // 1000 = 10.00%
        address chainlinkOracle;
        RestaurantStatus status;
        uint256 tokenId; // Unique NFT identifier for the business
        string businessType; // e.g., "restaurant", "cafe", "retail"
        string plan; // e.g., "basic", "premium", "enterprise"
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
    function registerRestaurant(
        address restaurant,
        NileLinkTypes.RestaurantConfig calldata config
    ) external;

    function updateRestaurantConfig(
        address restaurant,
        NileLinkTypes.RestaurantConfig calldata config
    ) external;

    function getRestaurant(
        address restaurant
    ) external view returns (NileLinkTypes.RestaurantRecord memory);

    function isActive(address restaurant) external view returns (bool);
}

/// @notice Order creation, payment validation, settlement.
interface IOrderSettlement {
    function protocolFeeBps() external view returns (uint16);

    function createPaymentIntent(
        bytes16 orderId,
        address restaurant,
        address customer,
        uint256 amountUsd6,
        NileLinkTypes.PaymentMethod method
    ) external;

    function pay(bytes16 orderId, uint256 amountUsd6) external;

    function settle(bytes16 orderId) external;

    function refund(bytes16 orderId, address to, uint256 amountUsd6) external;

    function getOrderStatus(
        bytes16 orderId
    )
        external
        view
        returns (
            NileLinkTypes.TxStatus status,
            uint256 amount,
            uint64 paidAt,
            uint64 settledAt
        );
}

/// @notice Real-time rate management via Chainlink.
interface ICurrencyExchange {
    function setOracle(bytes3 localCurrency, address oracle) external;

    function snapshotRate(
        address restaurant,
        bytes3 localCurrency
    ) external returns (NileLinkTypes.RateSnapshot memory);

    function getLatestRate(
        bytes3 localCurrency
    ) external view returns (uint256 rate, address oracle, uint64 updatedAt);
}

/// @notice 3-day auto-settle, manual override.
interface IDisputeResolution {
    function openDispute(
        bytes16 orderId,
        uint256 claimAmountUsd6,
        bytes32 reasonHash
    ) external;

    function resolveDispute(
        bytes16 orderId,
        NileLinkTypes.DisputeResolution resolution,
        uint256 refundAmountUsd6
    ) external;

    function autoSettle(bytes16 orderId) external;

    function getDispute(
        bytes16 orderId
    ) external view returns (NileLinkTypes.Dispute memory);
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

    event TransactionBlocked(
        bytes32 indexed txRef,
        bytes32 reasonHash,
        uint64 timestamp
    );

    function flagAnomaly(
        bytes32 subject,
        bytes32 anomalyType,
        uint8 severity,
        bytes32 detailsHash
    ) external;

    function blockTransaction(bytes32 txRef, bytes32 reasonHash) external;

    function isBlocked(bytes32 txRef) external view returns (bool);
}

/// @notice Multi-restaurant portfolio management.
interface IInvestorVault {
    function deposit(address restaurant, uint256 amountUsd6) external;

    function withdraw(address restaurant, uint256 amountUsd6) external;

    function claimDividend(
        address restaurant
    ) external returns (uint256 claimedUsd6);

    function positionOf(
        address investor,
        address restaurant
    ) external view returns (uint256 investedUsd6, uint256 ownershipBps);
}

/// @notice Credit line tracking and enforcement.
interface ISupplierCredit {
    function setCreditLine(
        address restaurant,
        address supplier,
        uint256 limitUsd6,
        bytes32 termsHash
    ) external;

    function getCreditLine(
        address restaurant,
        address supplier
    ) external view returns (NileLinkTypes.CreditLine memory);
}

/// @notice Decentralized marketplace for vendor management.
interface IMarketplace {
    function registerVendor(
        address vendor,
        string calldata name,
        string calldata description,
        bytes32 metadataCid,
        bytes32 catalogCid
    ) external;

    function createMarketplaceOrder(
        bytes16 orderId,
        address vendor,
        uint256 amountUsd6,
        bytes32 itemsHash
    ) external;

    function fulfillOrder(bytes16 orderId) external;

    function getVendorProfile(
        address vendor
    )
        external
        view
        returns (
            address vendorAddress,
            string memory name,
            string memory description,
            bytes32 metadataCid,
            bytes32 catalogCid,
            uint8 reputationScore,
            uint256 totalSales,
            uint64 registeredAt,
            bool isActive
        );

    function isVendorActive(address vendor) external view returns (bool);
}

/// @notice Delivery coordination and route optimization.
interface IDeliveryCoordinator {
    enum DeliveryStatus {
        PENDING,
        ASSIGNED,
        PICKED_UP,
        IN_TRANSIT,
        DELIVERED,
        CANCELLED,
        FAILED
    }
    enum VehicleType {
        BICYCLE,
        MOTORCYCLE,
        CAR,
        VAN,
        TRUCK
    }
    enum DeliveryPriority {
        STANDARD,
        EXPRESS,
        URGENT
    }

    function createDeliveryOrder(
        bytes16 orderId,
        address restaurant,
        address customer,
        uint256 amountUsd6,
        bytes32 restaurantLocation,
        bytes32 customerLocation,
        DeliveryPriority priority,
        string calldata specialInstructions
    ) external returns (uint16 zoneId);

    function assignDriver(bytes16 orderId, address driver) external;

    function updateDeliveryStatus(
        bytes16 orderId,
        DeliveryStatus newStatus,
        bytes32 locationProof
    ) external;

    function updateDriverLocation(bytes32 location) external;

    function registerDriver(
        address driverAddress,
        string calldata name,
        string calldata licenseNumber,
        VehicleType vehicleType,
        uint16 zoneId
    ) external;
}

/// @notice Decentralized supplier registry and verification.
interface ISupplierRegistry {
    enum SupplierStatus {
        PENDING_VERIFICATION,
        ACTIVE,
        SUSPENDED,
        BLACKLISTED,
        INACTIVE
    }
    enum VerificationType {
        BASIC_KYC,
        ENHANCED_DUE_DILIGENCE,
        COMPLIANCE_CHECK,
        CREDIT_ASSESSMENT,
        PRODUCT_CERTIFICATION
    }
    enum VerificationStatus {
        PENDING,
        UNDER_REVIEW,
        APPROVED,
        REJECTED,
        REQUIRES_MORE_INFO
    }

    function registerSupplier(
        string calldata businessName,
        string calldata contactName,
        string calldata email,
        string calldata phone,
        string calldata businessType,
        string calldata industry,
        bytes2 country,
        bytes3 localCurrency,
        bytes32 metadataCid
    ) external;

    function requestVerification(
        address supplier,
        VerificationType requestType,
        bytes32 documentsHash,
        string calldata notes
    ) external payable returns (bytes16 requestId);

    function processVerification(
        bytes16 requestId,
        bool approve,
        uint8 reputationScore,
        string calldata notes
    ) external;

    function isSupplierActive(address supplier) external view returns (bool);

    function updateReputationScore(
        address supplier,
        uint8 newScore,
        string calldata reason
    ) external;
}
