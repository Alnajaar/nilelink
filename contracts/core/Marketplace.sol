// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "../interfaces/SmartContract_Interfaces.sol";
import "../libraries/NileLinkLibs.sol";
import "./RestaurantRegistry.sol";
import "./FraudDetection.sol";

/// @title Marketplace.sol
/// @notice Decentralized marketplace for vendor management and order routing
contract Marketplace is IMarketplace, Ownable, Pausable, ReentrancyGuard {
    using Address for address;

    // External contracts
    RestaurantRegistry public immutable restaurantRegistry;
    FraudDetection public immutable fraudDetection;
    IERC20 public immutable usdc;

    // Marketplace configuration
    uint16 public marketplaceFeeBps = 25; // 0.25% marketplace fee
    address public feeRecipient;

    // Vendor management
    mapping(address => VendorProfile) public vendors;
    mapping(address => bool) public approvedVendors;
    mapping(bytes32 => MarketplaceOrder) public marketplaceOrders;

    struct VendorProfile {
        address vendorAddress;
        string name;
        string description;
        bytes32 metadataCid; // IPFS hash for detailed vendor info
        bytes32 catalogCid; // IPFS hash for product catalog
        uint8 reputationScore;
        uint256 totalSales;
        uint64 registeredAt;
        bool isActive;
    }

    struct MarketplaceOrder {
        bytes16 orderId;
        address customer;
        address vendor;
        uint256 amountUsd6;
        bytes32 itemsHash; // IPFS hash of ordered items
        NileLinkTypes.TxStatus status;
        uint64 createdAt;
        uint64 fulfilledAt;
    }

    // Events for rich subgraph indexing
    event VendorRegistered(
        address indexed vendor,
        string indexed name,
        bytes32 metadataCid,
        bytes32 catalogCid,
        uint64 timestamp
    );

    event VendorUpdated(
        address indexed vendor,
        bytes32 indexed metadataCid,
        bytes32 catalogCid,
        uint64 timestamp
    );

    event MarketplaceOrderCreated(
        bytes16 indexed orderId,
        address indexed customer,
        address indexed vendor,
        uint256 amountUsd6,
        bytes32 itemsHash,
        uint64 timestamp
    );

    event OrderFulfilled(
        bytes16 indexed orderId,
        address indexed vendor,
        address indexed customer,
        uint256 amountUsd6,
        bytes32 fulfillmentProof,
        uint64 timestamp
    );

    event VendorReputationUpdated(
        address indexed vendor,
        uint8 indexed oldScore,
        uint8 newScore,
        uint64 timestamp
    );

    event MarketplaceFeeCollected(
        address indexed vendor,
        uint256 indexed amount,
        uint64 timestamp
    );

    modifier onlyApprovedVendor() {
        require(approvedVendors[msg.sender], "Not an approved vendor");
        _;
    }

    modifier onlyActiveVendor(address vendor) {
        require(vendors[vendor].isActive, "Vendor not active");
        require(
            restaurantRegistry.isActive(vendor),
            "Restaurant not active in registry"
        );
        _;
    }

    constructor(
        address _restaurantRegistry,
        address _fraudDetection,
        address _usdc,
        address _feeRecipient
    ) Ownable(msg.sender) {
        restaurantRegistry = RestaurantRegistry(_restaurantRegistry);
        fraudDetection = FraudDetection(_fraudDetection);
        usdc = IERC20(_usdc);
        feeRecipient = _feeRecipient;
    }

    /// @notice Register a new vendor in the marketplace
    /// @param vendor Vendor address (must be registered in RestaurantRegistry)
    /// @param name Vendor display name
    /// @param description Vendor description
    /// @param metadataCid IPFS hash for vendor metadata
    /// @param catalogCid IPFS hash for product catalog
    function registerVendor(
        address vendor,
        string calldata name,
        string calldata description,
        bytes32 metadataCid,
        bytes32 catalogCid
    ) external onlyOwner whenNotPaused {
        NileLinkLibs.validateAddress(vendor);
        require(
            restaurantRegistry.isActive(vendor),
            "Restaurant not registered"
        );
        require(!approvedVendors[vendor], "Vendor already registered");

        // Get reputation score from FraudDetection
        uint8 reputationScore = fraudDetection.getReputationScore(vendor);

        vendors[vendor] = VendorProfile({
            vendorAddress: vendor,
            name: name,
            description: description,
            metadataCid: metadataCid,
            catalogCid: catalogCid,
            reputationScore: reputationScore,
            totalSales: 0,
            registeredAt: uint64(block.timestamp),
            isActive: true
        });

        approvedVendors[vendor] = true;

        emit VendorRegistered(
            vendor,
            name,
            metadataCid,
            catalogCid,
            uint64(block.timestamp)
        );
    }

    /// @notice Update vendor profile
    /// @param metadataCid New IPFS metadata hash
    /// @param catalogCid New IPFS catalog hash
    function updateVendorProfile(
        bytes32 metadataCid,
        bytes32 catalogCid
    ) external onlyApprovedVendor whenNotPaused {
        VendorProfile storage vendor = vendors[msg.sender];
        require(vendor.isActive, "Vendor not active");

        vendor.metadataCid = metadataCid;
        vendor.catalogCid = catalogCid;

        emit VendorUpdated(
            msg.sender,
            metadataCid,
            catalogCid,
            uint64(block.timestamp)
        );
    }

    /// @notice Create marketplace order
    /// @param orderId Unique order identifier
    /// @param vendor Vendor address
    /// @param amountUsd6 Order amount in USD with 6 decimals
    /// @param itemsHash IPFS hash of ordered items
    function createMarketplaceOrder(
        bytes16 orderId,
        address vendor,
        uint256 amountUsd6,
        bytes32 itemsHash
    ) external onlyActiveVendor(vendor) whenNotPaused nonReentrant {
        NileLinkLibs.validateAmount(amountUsd6);
        require(
            marketplaceOrders[keccak256(abi.encodePacked(orderId))].orderId ==
                bytes16(0),
            "Order already exists"
        );

        // Check vendor reputation and rate limits
        require(
            fraudDetection.getReputationScore(vendor) >= 30,
            "Vendor reputation too low"
        );
        require(
            restaurantRegistry.checkAndUpdateRateLimit(vendor, amountUsd6),
            "Rate limit exceeded"
        );

        marketplaceOrders[
            keccak256(abi.encodePacked(orderId))
        ] = MarketplaceOrder({
            orderId: orderId,
            customer: msg.sender,
            vendor: vendor,
            amountUsd6: amountUsd6,
            itemsHash: itemsHash,
            status: NileLinkTypes.TxStatus.PENDING,
            createdAt: uint64(block.timestamp),
            fulfilledAt: 0
        });

        emit MarketplaceOrderCreated(
            orderId,
            msg.sender,
            vendor,
            amountUsd6,
            itemsHash,
            uint64(block.timestamp)
        );
    }

    /// @notice Fulfill marketplace order
    /// @param orderId Order identifier
    function fulfillOrder(
        bytes16 orderId
    ) external onlyApprovedVendor whenNotPaused nonReentrant {
        bytes32 orderKey = keccak256(abi.encodePacked(orderId));
        MarketplaceOrder storage order = marketplaceOrders[orderKey];

        require(order.vendor == msg.sender, "Not order vendor");
        require(
            order.status == NileLinkTypes.TxStatus.CONFIRMED,
            "Order not confirmed"
        );

        // Calculate marketplace fee
        uint256 marketplaceFee = (order.amountUsd6 * marketplaceFeeBps) / 10000;
        uint256 vendorAmount = order.amountUsd6 - marketplaceFee;

        // Transfer fees
        require(
            usdc.transfer(feeRecipient, marketplaceFee),
            "Fee transfer failed"
        );
        require(
            usdc.transfer(order.vendor, vendorAmount),
            "Vendor payment failed"
        );

        // Update vendor stats
        vendors[order.vendor].totalSales += order.amountUsd6;

        // Update order status
        order.status = NileLinkTypes.TxStatus.SETTLED;
        order.fulfilledAt = uint64(block.timestamp);

        // Create fulfillment proof
        bytes32 fulfillmentProof = keccak256(
            abi.encodePacked(
                orderId,
                order.vendor,
                order.customer,
                order.amountUsd6,
                block.timestamp
            )
        );

        emit OrderFulfilled(
            orderId,
            order.vendor,
            order.customer,
            order.amountUsd6,
            fulfillmentProof,
            uint64(block.timestamp)
        );

        emit MarketplaceFeeCollected(
            order.vendor,
            marketplaceFee,
            uint64(block.timestamp)
        );
    }

    /// @notice Update vendor reputation (called by FraudDetection)
    /// @param vendor Vendor address
    /// @param newScore New reputation score
    function updateVendorReputation(address vendor, uint8 newScore) external {
        // Only allow FraudDetection contract to call this
        require(msg.sender == address(fraudDetection), "Unauthorized");

        VendorProfile storage vendorProfile = vendors[vendor];
        if (vendorProfile.vendorAddress != address(0)) {
            uint8 oldScore = vendorProfile.reputationScore;
            vendorProfile.reputationScore = newScore;

            emit VendorReputationUpdated(
                vendor,
                oldScore,
                newScore,
                uint64(block.timestamp)
            );
        }
    }

    /// @notice Get vendor profile
    /// @param vendor Vendor address
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
        )
    {
        VendorProfile memory profile = vendors[vendor];
        return (
            profile.vendorAddress,
            profile.name,
            profile.description,
            profile.metadataCid,
            profile.catalogCid,
            profile.reputationScore,
            profile.totalSales,
            profile.registeredAt,
            profile.isActive
        );
    }

    /// @notice Get marketplace order
    /// @param orderId Order identifier
    function getMarketplaceOrder(
        bytes16 orderId
    ) external view returns (MarketplaceOrder memory) {
        return marketplaceOrders[keccak256(abi.encodePacked(orderId))];
    }

    /// @notice Check if vendor is approved and active
    /// @param vendor Vendor address
    function isVendorActive(address vendor) external view returns (bool) {
        return approvedVendors[vendor] && vendors[vendor].isActive;
    }

    /// @notice Set marketplace fee
    /// @param newFeeBps New fee in basis points
    function setMarketplaceFee(uint16 newFeeBps) external onlyOwner {
        require(newFeeBps <= 500, "Fee cannot exceed 5%");
        marketplaceFeeBps = newFeeBps;
    }

    /// @notice Set fee recipient
    /// @param newRecipient New fee recipient address
    function setFeeRecipient(address newRecipient) external onlyOwner {
        NileLinkLibs.validateAddress(newRecipient);
        feeRecipient = newRecipient;
    }

    /// @notice Suspend vendor
    /// @param vendor Vendor address
    function suspendVendor(address vendor) external onlyOwner {
        require(approvedVendors[vendor], "Vendor not approved");
        vendors[vendor].isActive = false;
    }

    /// @notice Reactivate vendor
    /// @param vendor Vendor address
    function reactivateVendor(address vendor) external onlyOwner {
        require(approvedVendors[vendor], "Vendor not approved");
        vendors[vendor].isActive = true;
    }

    /// @notice Pause contract
    function pause() external onlyOwner {
        _pause();
    }

    /// @notice Unpause contract
    function unpause() external onlyOwner {
        _unpause();
    }
}
