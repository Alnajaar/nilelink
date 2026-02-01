// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "./OrderSettlement.sol";
import "../libraries/NileLinkLibs.sol";

/// @title DeliveryCoordinator.sol
/// @notice AI-powered delivery coordination and route optimization
/// @dev Manages driver assignments, route optimization, and real-time tracking
contract DeliveryCoordinator is Ownable, Pausable, ReentrancyGuard {
    using Address for address;

    // Core protocol contracts
    OrderSettlement public immutable orderSettlement;

    // Delivery data structures
    struct DeliveryOrder {
        bytes16 orderId;
        address restaurant;
        address customer;
        address assignedDriver;
        uint256 amountUsd6;
        DeliveryStatus status;
        uint64 createdAt;
        uint64 assignedAt;
        uint64 pickedUpAt;
        uint64 deliveredAt;
        bytes32 routeHash; // IPFS hash of optimized route
        bytes32 proofHash; // GPS proof hash
        DeliveryPriority priority;
        string specialInstructions;
    }

    struct Driver {
        address driverAddress;
        string name;
        string licenseNumber;
        VehicleType vehicleType;
        bool isActive;
        bool isAvailable;
        uint256 rating; // 1-5 scale, multiplied by 100 (e.g., 450 = 4.5)
        uint256 totalDeliveries;
        uint256 completedDeliveries;
        address walletAddress;
        bytes32 currentLocation; // Encoded lat/lng
        uint64 lastLocationUpdate;
        uint16 zoneId;
    }

    struct DeliveryZone {
        uint16 zoneId;
        string name;
        bytes32 boundaryHash; // IPFS hash of geo boundary
        uint256 baseFeeUsd6;
        uint256 perKmFeeUsd6;
        uint16 estimatedTimeMinutes;
        bool isActive;
    }

    // Enums
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

    // State variables
    mapping(bytes16 => DeliveryOrder) public deliveryOrders;
    mapping(address => Driver) public drivers;
    mapping(uint16 => DeliveryZone) public deliveryZones;
    mapping(address => bytes16[]) public driverDeliveries;
    mapping(bytes16 => uint16) public orderToZone;

    // Counters and IDs
    uint16 public nextZoneId = 1;
    uint256 public totalDeliveries;
    uint256 public activeDeliveries;

    // Configuration
    uint256 public maxDeliveriesPerDriver = 5;
    uint256 public driverTimeoutMinutes = 30;
    address public feeRecipient;

    // Events
    event DeliveryOrderCreated(
        bytes16 indexed orderId,
        address indexed restaurant,
        address indexed customer,
        uint16 zoneId,
        DeliveryPriority priority
    );

    event DriverAssigned(
        bytes16 indexed orderId,
        address indexed driver,
        uint64 assignedAt
    );

    event DeliveryStatusUpdated(
        bytes16 indexed orderId,
        DeliveryStatus oldStatus,
        DeliveryStatus newStatus,
        uint64 timestamp
    );

    event ProofOfDeliverySubmitted(
        bytes16 indexed orderId,
        address indexed driver,
        bytes32 proofHash,
        uint64 timestamp
    );

    event DriverRegistered(
        address indexed driver,
        string name,
        VehicleType vehicleType,
        uint16 zoneId
    );

    event ZoneCreated(uint16 indexed zoneId, string name, uint256 baseFeeUsd6);

    // Modifiers
    modifier onlyActiveDriver() {
        require(drivers[msg.sender].isActive, "Not an active driver");
        _;
    }

    modifier validOrder(bytes16 orderId) {
        require(deliveryOrders[orderId].createdAt > 0, "Order does not exist");
        _;
    }

    constructor(
        address _orderSettlement,
        address _feeRecipient
    ) Ownable(msg.sender) {
        NileLinkLibs.validateAddress(_orderSettlement);
        NileLinkLibs.validateAddress(_feeRecipient);

        orderSettlement = OrderSettlement(_orderSettlement);
        feeRecipient = _feeRecipient;
    }

    /// @notice Create a new delivery order
    /// @param orderId Unique order identifier
    /// @param restaurant Restaurant address
    /// @param customer Customer address
    /// @param amountUsd6 Order amount in USD with 6 decimals
    /// @param restaurantLocation Encoded restaurant coordinates
    /// @param customerLocation Encoded customer coordinates
    /// @param priority Delivery priority
    /// @param specialInstructions Any special delivery instructions
    function createDeliveryOrder(
        bytes16 orderId,
        address restaurant,
        address customer,
        uint256 amountUsd6,
        bytes32 restaurantLocation,
        bytes32 customerLocation,
        DeliveryPriority priority,
        string calldata specialInstructions
    ) external whenNotPaused returns (uint16 zoneId) {
        require(deliveryOrders[orderId].createdAt == 0, "Order already exists");

        // Determine delivery zone based on locations
        zoneId = _calculateDeliveryZone(restaurantLocation, customerLocation);
        require(deliveryZones[zoneId].isActive, "Invalid delivery zone");

        // Calculate delivery fee
        uint256 deliveryFee = _calculateDeliveryFee(
            zoneId,
            restaurantLocation,
            customerLocation
        );

        // Create delivery order
        deliveryOrders[orderId] = DeliveryOrder({
            orderId: orderId,
            restaurant: restaurant,
            customer: customer,
            assignedDriver: address(0),
            amountUsd6: amountUsd6,
            status: DeliveryStatus.PENDING,
            createdAt: uint64(block.timestamp),
            assignedAt: 0,
            pickedUpAt: 0,
            deliveredAt: 0,
            routeHash: bytes32(0),
            proofHash: bytes32(0),
            priority: priority,
            specialInstructions: specialInstructions
        });

        orderToZone[orderId] = zoneId;
        totalDeliveries++;
        activeDeliveries++;

        emit DeliveryOrderCreated(
            orderId,
            restaurant,
            customer,
            zoneId,
            priority
        );

        // Auto-assign driver for high priority orders
        if (priority >= DeliveryPriority.EXPRESS) {
            _autoAssignDriver(orderId, zoneId);
        }

        return zoneId;
    }

    /// @notice Assign a driver to a delivery order
    /// @param orderId Order to assign
    /// @param driver Driver address
    function assignDriver(
        bytes16 orderId,
        address driver
    ) external validOrder(orderId) whenNotPaused {
        DeliveryOrder storage order = deliveryOrders[orderId];
        require(order.status == DeliveryStatus.PENDING, "Order not pending");
        require(drivers[driver].isActive, "Driver not active");
        require(drivers[driver].isAvailable, "Driver not available");
        require(
            driverDeliveries[driver].length < maxDeliveriesPerDriver,
            "Driver at capacity"
        );

        order.assignedDriver = driver;
        order.status = DeliveryStatus.ASSIGNED;
        order.assignedAt = uint64(block.timestamp);

        driverDeliveries[driver].push(orderId);
        drivers[driver].isAvailable = false;

        emit DriverAssigned(orderId, driver, order.assignedAt);
        emit DeliveryStatusUpdated(
            orderId,
            DeliveryStatus.PENDING,
            DeliveryStatus.ASSIGNED,
            order.assignedAt
        );
    }

    /// @notice Update delivery status (called by driver)
    /// @param orderId Order ID
    /// @param newStatus New delivery status
    /// @param locationProof GPS location proof (optional)
    function updateDeliveryStatus(
        bytes16 orderId,
        DeliveryStatus newStatus,
        bytes32 locationProof
    ) external validOrder(orderId) onlyActiveDriver whenNotPaused {
        DeliveryOrder storage order = deliveryOrders[orderId];
        require(order.assignedDriver == msg.sender, "Not assigned driver");
        require(
            _isValidStatusTransition(order.status, newStatus),
            "Invalid status transition"
        );

        DeliveryStatus oldStatus = order.status;
        order.status = newStatus;

        // Update timestamps based on status
        if (newStatus == DeliveryStatus.PICKED_UP) {
            order.pickedUpAt = uint64(block.timestamp);
        } else if (newStatus == DeliveryStatus.DELIVERED) {
            order.deliveredAt = uint64(block.timestamp);
            activeDeliveries--;

            // Release driver for next delivery
            drivers[msg.sender].isAvailable = true;

            // Trigger Settlement on OrderSettlement contract
            try orderSettlement.settle(orderId) {
                // Settlement successful
            } catch {
                // Settle failed (e.g. already settled or paused).
                // We don't revert here because we want to record the Delivery status update regardless.
                // It can be retried manually if needed.
            }
        }

        // Store location proof for critical status changes
        if (
            locationProof != bytes32(0) &&
            (newStatus == DeliveryStatus.PICKED_UP ||
                newStatus == DeliveryStatus.DELIVERED)
        ) {
            order.proofHash = _generateProofHash(
                orderId,
                msg.sender,
                locationProof,
                block.timestamp
            );

            emit ProofOfDeliverySubmitted(
                orderId,
                msg.sender,
                order.proofHash,
                uint64(block.timestamp)
            );
        }

        emit DeliveryStatusUpdated(
            orderId,
            oldStatus,
            newStatus,
            uint64(block.timestamp)
        );
    }

    /// @notice Register a new delivery driver
    /// @param driverAddress Driver's wallet address
    /// @param name Driver's name
    /// @param licenseNumber Driver's license number
    /// @param vehicleType Type of vehicle
    /// @param zoneId Operating zone ID
    function registerDriver(
        address driverAddress,
        string calldata name,
        string calldata licenseNumber,
        VehicleType vehicleType,
        uint16 zoneId
    ) external onlyOwner {
        require(deliveryZones[zoneId].isActive, "Invalid zone");
        require(!drivers[driverAddress].isActive, "Driver already registered");

        drivers[driverAddress] = Driver({
            driverAddress: driverAddress,
            name: name,
            licenseNumber: licenseNumber,
            vehicleType: vehicleType,
            isActive: true,
            isAvailable: true,
            rating: 500, // Start with 5.0 rating
            totalDeliveries: 0,
            completedDeliveries: 0,
            walletAddress: driverAddress,
            currentLocation: bytes32(0),
            lastLocationUpdate: 0,
            zoneId: zoneId
        });

        emit DriverRegistered(driverAddress, name, vehicleType, zoneId);
    }

    /// @notice Create a new delivery zone
    /// @param name Zone name
    /// @param boundaryHash IPFS hash of geo boundary
    /// @param baseFeeUsd6 Base delivery fee
    /// @param perKmFeeUsd6 Per kilometer fee
    /// @param estimatedTimeMinutes Estimated delivery time
    function createDeliveryZone(
        string calldata name,
        bytes32 boundaryHash,
        uint256 baseFeeUsd6,
        uint256 perKmFeeUsd6,
        uint16 estimatedTimeMinutes
    ) external onlyOwner returns (uint16 zoneId) {
        zoneId = nextZoneId++;

        deliveryZones[zoneId] = DeliveryZone({
            zoneId: zoneId,
            name: name,
            boundaryHash: boundaryHash,
            baseFeeUsd6: baseFeeUsd6,
            perKmFeeUsd6: perKmFeeUsd6,
            estimatedTimeMinutes: estimatedTimeMinutes,
            isActive: true
        });

        emit ZoneCreated(zoneId, name, baseFeeUsd6);
        return zoneId;
    }

    /// @notice Update driver location (called by driver app)
    /// @param location Encoded GPS coordinates
    function updateDriverLocation(bytes32 location) external onlyActiveDriver {
        drivers[msg.sender].currentLocation = location;
        drivers[msg.sender].lastLocationUpdate = uint64(block.timestamp);
    }

    /// @notice Get delivery order details
    /// @param orderId Order ID
    function getDeliveryOrder(
        bytes16 orderId
    ) external view returns (DeliveryOrder memory) {
        return deliveryOrders[orderId];
    }

    /// @notice Get driver details
    /// @param driver Driver address
    function getDriver(address driver) external view returns (Driver memory) {
        return drivers[driver];
    }

    /// @notice Get delivery zone details
    /// @param zoneId Zone ID
    function getDeliveryZone(
        uint16 zoneId
    ) external view returns (DeliveryZone memory) {
        return deliveryZones[zoneId];
    }

    /// @notice Get available drivers in a zone
    /// @param zoneId Zone ID
    function getAvailableDrivers(
        uint16 zoneId
    ) external pure returns (address[] memory availableDrivers) {
        // This would be more efficient with a separate data structure
        // For now, returning empty array - implementation needed
        return new address[](0);
    }

    // Internal functions

    /// @dev Calculate delivery zone based on locations
    function _calculateDeliveryZone(
        bytes32 restaurantLocation,
        bytes32 customerLocation
    ) internal pure returns (uint16) {
        // Simplified zone calculation - in production, use geo libraries
        // For now, return zone 1 as default
        return 1;
    }

    /// @dev Calculate delivery fee
    function _calculateDeliveryFee(
        uint16 zoneId,
        bytes32 restaurantLocation,
        bytes32 customerLocation
    ) internal view returns (uint256) {
        DeliveryZone memory zone = deliveryZones[zoneId];

        // Simplified distance calculation
        uint256 distanceKm = 5; // Placeholder - calculate actual distance

        return zone.baseFeeUsd6 + (distanceKm * zone.perKmFeeUsd6);
    }

    /// @dev Auto-assign driver for urgent orders
    function _autoAssignDriver(bytes16 orderId, uint16 zoneId) internal {
        // Find best available driver in zone
        // Implementation needed - for now, this is a placeholder
    }

    /// @dev Validate status transition
    function _isValidStatusTransition(
        DeliveryStatus current,
        DeliveryStatus next
    ) internal pure returns (bool) {
        if (
            current == DeliveryStatus.PENDING && next == DeliveryStatus.ASSIGNED
        ) return true;
        if (
            current == DeliveryStatus.ASSIGNED &&
            next == DeliveryStatus.PICKED_UP
        ) return true;
        if (
            current == DeliveryStatus.PICKED_UP &&
            next == DeliveryStatus.IN_TRANSIT
        ) return true;
        if (
            current == DeliveryStatus.IN_TRANSIT &&
            next == DeliveryStatus.DELIVERED
        ) return true;
        if (next == DeliveryStatus.CANCELLED || next == DeliveryStatus.FAILED)
            return true;

        return false;
    }

    /// @dev Generate proof hash for delivery verification
    function _generateProofHash(
        bytes16 orderId,
        address driver,
        bytes32 locationProof,
        uint256 timestamp
    ) internal pure returns (bytes32) {
        return
            keccak256(
                abi.encodePacked(orderId, driver, locationProof, timestamp)
            );
    }

    // Admin functions

    /// @notice Update delivery configuration
    function updateConfig(
        uint256 _maxDeliveriesPerDriver,
        uint256 _driverTimeoutMinutes,
        address _feeRecipient
    ) external onlyOwner {
        maxDeliveriesPerDriver = _maxDeliveriesPerDriver;
        driverTimeoutMinutes = _driverTimeoutMinutes;

        if (_feeRecipient != address(0)) {
            feeRecipient = _feeRecipient;
        }
    }

    /// @notice Pause delivery operations
    function pause() external onlyOwner {
        _pause();
    }

    /// @notice Unpause delivery operations
    function unpause() external onlyOwner {
        _unpause();
    }

    /// @notice Emergency withdrawal
    function emergencyWithdraw(
        IERC20 token,
        address to,
        uint256 amount
    ) external onlyOwner {
        token.transfer(to, amount);
    }
}
