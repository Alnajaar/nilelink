// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./SupplierRegistry.sol";
import "../libraries/NileLinkLibs.sol";

/// @title SupplyChain.sol
/// @notice Decentralized supply chain management and purchase orders
/// @dev Manages supplier relationships, purchase orders, and inventory tracking
contract SupplyChain is Ownable, Pausable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // Core contracts
    SupplierRegistry public immutable supplierRegistry;
    IERC20 public immutable usdc;

    // Purchase order data structures
    struct PurchaseOrder {
        bytes16 orderId;
        address restaurant;
        address supplier;
        OrderStatus status;
        bytes32 itemsHash; // IPFS hash of order items
        uint256 totalAmountUsd6;
        bytes3 currency; // Order currency
        uint64 createdAt;
        uint64 approvedAt;
        uint64 fulfilledAt;
        uint64 dueDate;
        bytes32 deliveryTermsHash; // IPFS hash of delivery terms
        address approvedBy;
        string notes;
        mapping(bytes3 => uint256) creditUsed; // Credit used per currency
    }

    struct InventoryItem {
        bytes16 itemId;
        address restaurant;
        address supplier;
        string name;
        string category;
        uint256 currentStock;
        uint256 reorderPoint;
        uint256 unitCostUsd6;
        bytes3 currency;
        uint64 lastUpdated;
        uint64 expiryDate;
        bytes32 batchNumber;
        string location; // Warehouse location
        bool trackExpiry;
        bool isActive;
        uint256 tokenId;
        string metadataCid;
    }

    // Enums
    enum OrderStatus {
        DRAFT,
        SUBMITTED,
        APPROVED,
        PROCESSING,
        PARTIALLY_FULFILLED,
        FULFILLED,
        CANCELLED,
        DISPUTED
    }

    enum InventoryMovementType {
        INBOUND_PURCHASE,
        INBOUND_RETURN,
        OUTBOUND_SALE,
        OUTBOUND_WASTE,
        ADJUSTMENT,
        TRANSFER
    }

    // State variables
    mapping(bytes16 => PurchaseOrder) public purchaseOrders;
    mapping(bytes16 => InventoryItem) public inventoryItems;
    mapping(address => mapping(address => bytes16[]))
        public restaurantSupplierOrders; // restaurant => supplier => orders
    mapping(address => bytes16[]) public restaurantInventory; // restaurant => items
    mapping(bytes16 => InventoryMovement[]) public itemMovements;

    // Configuration
    uint256 public maxOrderValueUsd6 = 10000000000; // $10,000 max per order
    uint256 public defaultPaymentTerms = 30 days;
    address public feeRecipient;

    // Counters
    uint256 public totalOrders;
    uint256 public activeOrders;

    // Event for Product Creation (Missing in original audit)
    event ProductAdded(
        bytes16 indexed itemId,
        uint256 indexed tokenId,
        address indexed restaurant,
        address indexed supplier,
        string category,
        string metadataCid,
        uint64 timestamp
    );

    // Events
    event PurchaseOrderCreated(
        bytes16 indexed orderId,
        address indexed restaurant,
        address indexed supplier,
        uint256 totalAmount,
        bytes3 currency,
        uint64 timestamp
    );

    event PurchaseOrderApproved(
        bytes16 indexed orderId,
        address indexed approvedBy,
        uint64 timestamp
    );

    event PurchaseOrderFulfilled(
        bytes16 indexed orderId,
        bytes32 deliveryProof,
        uint64 timestamp
    );

    event InventoryUpdated(
        bytes16 indexed itemId,
        address indexed restaurant,
        uint256 oldStock,
        uint256 newStock,
        InventoryMovementType movementType,
        uint64 timestamp
    );

    event CreditLineExceeded(
        address indexed restaurant,
        address indexed supplier,
        uint256 requestedAmount,
        uint256 availableCredit,
        uint64 timestamp
    );

    // Struct for inventory movements
    struct InventoryMovement {
        bytes16 movementId;
        InventoryMovementType movementType;
        uint256 quantity;
        uint256 unitCostUsd6;
        bytes3 currency;
        bytes32 referenceId; // PO ID, sale ID, etc.
        string reason;
        address performedBy;
        uint64 timestamp;
    }

    // Modifiers
    modifier onlyActiveSupplier(address supplier) {
        require(
            supplierRegistry.isSupplierActive(supplier),
            "Supplier not active"
        );
        _;
    }

    modifier validOrder(bytes16 orderId) {
        require(purchaseOrders[orderId].createdAt > 0, "Order does not exist");
        _;
    }

    // Constructor
    constructor(
        address _supplierRegistry,
        address _usdc,
        address _feeRecipient
    ) Ownable(msg.sender) {
        NileLinkLibs.validateAddress(_supplierRegistry);
        NileLinkLibs.validateAddress(_usdc);
        NileLinkLibs.validateAddress(_feeRecipient);

        supplierRegistry = SupplierRegistry(_supplierRegistry);
        usdc = IERC20(_usdc);
        feeRecipient = _feeRecipient;
    }

    /// @notice Create a new purchase order
    /// @param supplier Supplier address
    /// @param itemsHash IPFS hash of order items
    /// @param totalAmountUsd6 Total order amount in USD (6 decimals)
    /// @param currency Order currency
    /// @param dueDate Due date timestamp
    /// @param notes Order notes
    function createPurchaseOrder(
        address supplier,
        bytes32 itemsHash,
        uint256 totalAmountUsd6,
        bytes3 currency,
        uint64 dueDate,
        string calldata notes
    )
        external
        whenNotPaused
        onlyActiveSupplier(supplier)
        returns (bytes16 orderId)
    {
        require(totalAmountUsd6 > 0, "Order amount must be positive");
        require(
            totalAmountUsd6 <= maxOrderValueUsd6,
            "Order exceeds maximum value"
        );
        require(dueDate > block.timestamp, "Due date must be in future");

        // Check supplier credit limit
        uint256 availableCredit = supplierRegistry.getCreditLimit(
            supplier,
            currency
        );
        require(
            totalAmountUsd6 <= availableCredit,
            "Insufficient supplier credit"
        );

        orderId = bytes16(
            keccak256(
                abi.encodePacked(
                    msg.sender,
                    supplier,
                    block.timestamp,
                    totalOrders
                )
            )
        );

        PurchaseOrder storage order = purchaseOrders[orderId];
        order.orderId = orderId;
        order.restaurant = msg.sender;
        order.supplier = supplier;
        order.status = OrderStatus.DRAFT;
        order.itemsHash = itemsHash;
        order.totalAmountUsd6 = totalAmountUsd6;
        order.currency = currency;
        order.createdAt = uint64(block.timestamp);
        order.approvedAt = 0;
        order.fulfilledAt = 0;
        order.dueDate = dueDate;
        order.deliveryTermsHash = bytes32(0);
        order.approvedBy = address(0);
        order.notes = notes;

        restaurantSupplierOrders[msg.sender][supplier].push(orderId);
        totalOrders++;

        emit PurchaseOrderCreated(
            orderId,
            msg.sender,
            supplier,
            totalAmountUsd6,
            currency,
            uint64(block.timestamp)
        );

        return orderId;
    }

    /// @notice Submit purchase order for approval
    /// @param orderId Order to submit
    function submitPurchaseOrder(
        bytes16 orderId
    ) external validOrder(orderId) whenNotPaused {
        PurchaseOrder storage order = purchaseOrders[orderId];
        require(order.restaurant == msg.sender, "Not order owner");
        require(order.status == OrderStatus.DRAFT, "Order not in draft");

        order.status = OrderStatus.SUBMITTED;
        activeOrders++;
    }

    /// @notice Approve purchase order (restaurant owner/manager)
    /// @param orderId Order to approve
    function approvePurchaseOrder(
        bytes16 orderId
    ) external validOrder(orderId) whenNotPaused {
        PurchaseOrder storage order = purchaseOrders[orderId];
        require(order.status == OrderStatus.SUBMITTED, "Order not submitted");

        // Verify approval permission (simplified - in production, check role)
        require(order.restaurant == msg.sender, "Not authorized to approve");

        order.status = OrderStatus.APPROVED;
        order.approvedAt = uint64(block.timestamp);
        order.approvedBy = msg.sender;

        emit PurchaseOrderApproved(
            orderId,
            msg.sender,
            uint64(block.timestamp)
        );
    }

    /// @notice Fulfill purchase order (supplier only)
    /// @param orderId Order to fulfill
    /// @param deliveryProof IPFS hash of delivery proof
    function fulfillPurchaseOrder(
        bytes16 orderId,
        bytes32 deliveryProof
    )
        external
        validOrder(orderId)
        onlyActiveSupplier(msg.sender)
        whenNotPaused
    {
        PurchaseOrder storage order = purchaseOrders[orderId];
        require(order.supplier == msg.sender, "Not assigned supplier");
        require(order.status == OrderStatus.APPROVED, "Order not approved");
        require(block.timestamp <= order.dueDate, "Order past due date");

        order.status = OrderStatus.FULFILLED;
        order.fulfilledAt = uint64(block.timestamp);

        activeOrders--;

        emit PurchaseOrderFulfilled(
            orderId,
            deliveryProof,
            uint64(block.timestamp)
        );
    }

    /// @notice Add inventory item
    /// @param itemId Unique item identifier
    /// @param supplier Supplier address
    /// @param name Item name
    /// @param category Item category
    /// @param reorderPoint Reorder point quantity
    /// @param unitCostUsd6 Unit cost in USD (6 decimals)
    /// @param currency Item currency
    function addInventoryItem(
        bytes16 itemId,
        address supplier,
        string calldata name,
        string calldata category,
        uint256 reorderPoint,
        uint256 unitCostUsd6,
        bytes3 currency,
        uint256 tokenId,
        string calldata metadataCid
    ) external whenNotPaused {
        require(
            inventoryItems[itemId].restaurant == address(0),
            "Item already exists"
        );

        inventoryItems[itemId] = InventoryItem({
            itemId: itemId,
            restaurant: msg.sender,
            supplier: supplier,
            name: name,
            category: category,
            currentStock: 0,
            reorderPoint: reorderPoint,
            unitCostUsd6: unitCostUsd6,
            currency: currency,
            lastUpdated: uint64(block.timestamp),
            expiryDate: 0,
            batchNumber: bytes32(0),
            location: "",
            trackExpiry: false,
            isActive: true,
            tokenId: tokenId,
            metadataCid: metadataCid
        });

        restaurantInventory[msg.sender].push(itemId);

        emit ProductAdded(
            itemId,
            tokenId,
            msg.sender,
            supplier,
            category,
            metadataCid,
            uint64(block.timestamp)
        );
    }

    /// @notice Update inventory stock
    /// @param itemId Item to update
    /// @param quantity Quantity change (positive for inbound, negative for outbound)
    /// @param movementType Type of inventory movement
    /// @param referenceId Reference ID (PO, sale, etc.)
    /// @param reason Reason for movement
    function updateInventoryStock(
        bytes16 itemId,
        int256 quantity,
        InventoryMovementType movementType,
        bytes32 referenceId,
        string calldata reason
    ) external whenNotPaused {
        InventoryItem storage item = inventoryItems[itemId];
        require(item.restaurant == msg.sender, "Not item owner");
        require(item.isActive, "Item not active");

        uint256 oldStock = item.currentStock;
        uint256 newStock;

        if (quantity > 0) {
            newStock = oldStock + uint256(quantity);
        } else {
            require(oldStock >= uint256(-quantity), "Insufficient stock");
            newStock = oldStock - uint256(-quantity);
        }

        item.currentStock = newStock;
        item.lastUpdated = uint64(block.timestamp);

        // Record movement
        bytes16 movementId = bytes16(
            keccak256(
                abi.encodePacked(
                    itemId,
                    block.timestamp,
                    itemMovements[itemId].length
                )
            )
        );

        itemMovements[itemId].push(
            InventoryMovement({
                movementId: movementId,
                movementType: movementType,
                quantity: quantity > 0 ? uint256(quantity) : uint256(-quantity),
                unitCostUsd6: item.unitCostUsd6,
                currency: item.currency,
                referenceId: referenceId,
                reason: reason,
                performedBy: msg.sender,
                timestamp: uint64(block.timestamp)
            })
        );

        emit InventoryUpdated(
            itemId,
            msg.sender,
            oldStock,
            newStock,
            movementType,
            uint64(block.timestamp)
        );
    }

    /// @notice Receive goods from purchase order
    /// @param orderId Purchase order ID
    /// @param itemUpdates Array of item updates (itemId, quantity, expiryDate, batchNumber)
    function receiveGoods(
        bytes16 orderId,
        ItemReceipt[] calldata itemUpdates
    ) external validOrder(orderId) whenNotPaused {
        PurchaseOrder storage order = purchaseOrders[orderId];
        require(order.restaurant == msg.sender, "Not order owner");
        require(order.status == OrderStatus.APPROVED, "Order not approved");

        for (uint256 i = 0; i < itemUpdates.length; i++) {
            ItemReceipt memory update = itemUpdates[i];

            // Update inventory
            this.updateInventoryStock(
                update.itemId,
                int256(update.quantity),
                InventoryMovementType.INBOUND_PURCHASE,
                orderId,
                "Purchase order receipt"
            );

            // Update item details if provided
            if (update.expiryDate > 0) {
                inventoryItems[update.itemId].expiryDate = update.expiryDate;
                inventoryItems[update.itemId].trackExpiry = true;
            }

            if (update.batchNumber != bytes32(0)) {
                inventoryItems[update.itemId].batchNumber = update.batchNumber;
            }

            if (bytes(update.location).length > 0) {
                inventoryItems[update.itemId].location = update.location;
            }
        }

        // Check if order is fully fulfilled
        bool fullyFulfilled = _checkOrderFulfillment(orderId);
        if (fullyFulfilled) {
            order.status = OrderStatus.FULFILLED;
            order.fulfilledAt = uint64(block.timestamp);
            activeOrders--;
        } else {
            order.status = OrderStatus.PARTIALLY_FULFILLED;
        }
    }

    // Struct for item receipts
    struct ItemReceipt {
        bytes16 itemId;
        uint256 quantity;
        uint64 expiryDate;
        bytes32 batchNumber;
        string location;
    }

    /// @notice Get purchase order details
    /// @param orderId Order ID
    function getPurchaseOrder(
        bytes16 orderId
    )
        external
        view
        returns (
            address restaurant,
            address supplier,
            OrderStatus status,
            uint256 totalAmount,
            bytes3 currency,
            uint64 createdAt,
            uint64 dueDate
        )
    {
        PurchaseOrder storage order = purchaseOrders[orderId];
        return (
            order.restaurant,
            order.supplier,
            order.status,
            order.totalAmountUsd6,
            order.currency,
            order.createdAt,
            order.dueDate
        );
    }

    /// @notice Get inventory item details
    /// @param itemId Item ID
    function getInventoryItem(
        bytes16 itemId
    )
        external
        view
        returns (
            address restaurant,
            string memory name,
            uint256 currentStock,
            uint256 reorderPoint,
            uint256 unitCost,
            bool needsReorder
        )
    {
        InventoryItem storage item = inventoryItems[itemId];
        needsReorder = item.currentStock <= item.reorderPoint && item.isActive;

        return (
            item.restaurant,
            item.name,
            item.currentStock,
            item.reorderPoint,
            item.unitCostUsd6,
            needsReorder
        );
    }

    /// @notice Get orders between restaurant and supplier
    /// @param restaurant Restaurant address
    /// @param supplier Supplier address
    function getRestaurantSupplierOrders(
        address restaurant,
        address supplier
    ) external view returns (bytes16[] memory) {
        return restaurantSupplierOrders[restaurant][supplier];
    }

    /// @notice Get restaurant inventory
    /// @param restaurant Restaurant address
    function getRestaurantInventory(
        address restaurant
    ) external view returns (bytes16[] memory) {
        return restaurantInventory[restaurant];
    }

    /// @notice Get items that need reordering
    /// @param restaurant Restaurant address
    function getItemsNeedingReorder(
        address restaurant
    ) external view returns (bytes16[] memory items) {
        bytes16[] memory allItems = restaurantInventory[restaurant];
        uint256 count = 0;

        // Count items needing reorder
        for (uint256 i = 0; i < allItems.length; i++) {
            if (
                inventoryItems[allItems[i]].currentStock <=
                inventoryItems[allItems[i]].reorderPoint
            ) {
                count++;
            }
        }

        // Build result array
        items = new bytes16[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < allItems.length; i++) {
            if (
                inventoryItems[allItems[i]].currentStock <=
                inventoryItems[allItems[i]].reorderPoint
            ) {
                items[index] = allItems[i];
                index++;
            }
        }

        return items;
    }

    // Internal functions

    /// @dev Check if purchase order is fully fulfilled
    function _checkOrderFulfillment(
        bytes16 orderId
    ) internal pure returns (bool) {
        // Simplified check - in production, compare ordered vs received quantities
        // For now, assume partially fulfilled orders need manual completion
        return false;
    }

    // Admin functions

    /// @notice Update configuration
    function updateConfig(
        uint256 _maxOrderValueUsd6,
        uint256 _defaultPaymentTerms,
        address _feeRecipient
    ) external onlyOwner {
        maxOrderValueUsd6 = _maxOrderValueUsd6;
        defaultPaymentTerms = _defaultPaymentTerms;

        if (_feeRecipient != address(0)) {
            feeRecipient = _feeRecipient;
        }
    }

    /// @notice Emergency pause
    function emergencyPause() external onlyOwner {
        _pause();
    }

    /// @notice Emergency unpause
    function emergencyUnpause() external onlyOwner {
        _unpause();
    }

    /// @notice Emergency withdrawal
    function emergencyWithdraw(
        address token,
        address to,
        uint256 amount
    ) external onlyOwner {
        IERC20(token).transfer(to, amount);
    }
}
