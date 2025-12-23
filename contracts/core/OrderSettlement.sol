// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "../interfaces/SmartContract_Interfaces.sol";
import "../libraries/NileLinkLibs.sol";
import "./RestaurantRegistry.sol";

/// @title OrderSettlement.sol
/// @notice Order creation, payment validation, and instant settlement for NileLink Protocol
contract OrderSettlement is IOrderSettlement, Ownable, Pausable, ReentrancyGuard {
    using SafeERC20 for IERC20;
    using Address for address;
    
    // External contracts
    RestaurantRegistry public immutable restaurantRegistry;
    IERC20 public immutable usdc;
    
    // Protocol configuration
    uint16 public override protocolFeeBps = 50; // 0.5%
    address public feeRecipient;
    
    // Order management
    mapping(bytes16 => OrderData) public orders;
    mapping(bytes16 => bytes32) public orderRefunds;
    mapping(address => uint256) public dailyOrderCount;
    mapping(address => uint64) public lastOrderCountReset;
    
    struct OrderData {
        address restaurant;
        address customer;
        uint256 amountUsd6;
        NileLinkTypes.PaymentMethod method;
        NileLinkTypes.TxStatus status;
        uint64 createdAt;
        uint64 paidAt;
        uint64 settledAt;
        string items; // IPFS hash or encrypted data
    }
    
    // Events
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
    
    event RateLimitExceeded(
        address indexed restaurant,
        uint256 attemptedAmount,
        uint256 limit,
        uint64 timestamp
    );
    
    event ProtocolFeeUpdated(uint16 oldFeeBps, uint16 newFeeBps, uint64 timestamp);

    event AnomalyFlagged(
        bytes32 indexed subject,
        bytes32 indexed anomalyType,
        uint8 severity,
        bytes32 detailsHash,
        uint64 timestamp
    );
    
    modifier onlyValidOrder(bytes16 orderId) {
        if (orders[orderId].restaurant == address(0)) {
            revert NileLinkLibs.OrderNotFound();
        }
        _;
    }
    
    modifier onlyOrderCustomer(bytes16 orderId) {
        if (orders[orderId].customer != msg.sender) {
            revert NileLinkLibs.Unauthorized();
        }
        _;
    }
    
    constructor(
        address _restaurantRegistry,
        address _usdc,
        address _feeRecipient
    ) Ownable() {
        restaurantRegistry = RestaurantRegistry(_restaurantRegistry);
        usdc = IERC20(_usdc);
        feeRecipient = _feeRecipient;
    }
    
    /// @notice Create a payment intent for an order
    /// @param orderId Unique order identifier (UUIDv4 as bytes16)
    /// @param restaurant Restaurant wallet address
    /// @param customer Customer wallet address
    /// @param amountUsd6 Order amount in USD with 6 decimals
    /// @param method Payment method
    function createPaymentIntent(
        bytes16 orderId,
        address restaurant,
        address customer,
        uint256 amountUsd6,
        NileLinkTypes.PaymentMethod method
    ) external override whenNotPaused {
        NileLinkLibs.validateAddress(restaurant);
        NileLinkLibs.validateAddress(customer);
        NileLinkLibs.validateAmount(amountUsd6);
        
        // Validate restaurant is active
        if (!restaurantRegistry.isActive(restaurant)) {
            revert NileLinkLibs.RestaurantNotActive();
        }
        
        // Ensure order doesn't already exist
        if (orders[orderId].restaurant != address(0)) {
            revert NileLinkLibs.AlreadyProcessed();
        }
        
        // Check rate limit before creating order
        if (!restaurantRegistry.checkAndUpdateRateLimit(restaurant, amountUsd6)) {
            emit RateLimitExceeded(
                restaurant,
                amountUsd6,
                restaurantRegistry.getRestaurant(restaurant).config.dailyRateLimitUsd6,
                uint64(block.timestamp)
            );
            revert NileLinkLibs.RateLimitExceeded();
        }
        
        // Create order record
        orders[orderId] = OrderData({
            restaurant: restaurant,
            customer: customer,
            amountUsd6: amountUsd6,
            method: method,
            status: NileLinkTypes.TxStatus.PENDING,
            createdAt: uint64(block.timestamp),
            paidAt: 0,
            settledAt: 0,
            items: ""
        });
        
        emit PaymentIntentCreated(
            orderId,
            restaurant,
            customer,
            amountUsd6,
            method,
            uint64(block.timestamp)
        );
    }
    
    /// @notice Process payment via USDC transfer
    /// @param orderId Order identifier
    /// @param amountUsd6 Payment amount (must match order amount)
    function pay(bytes16 orderId, uint256 amountUsd6) 
        external 
        override 
        nonReentrant 
        onlyValidOrder(orderId) 
        whenNotPaused 
    {
        OrderData storage order = orders[orderId];
        
        // Validate payment conditions
        if (order.status != NileLinkTypes.TxStatus.PENDING) {
            revert NileLinkLibs.AlreadyProcessed();
        }
        
        if (amountUsd6 != order.amountUsd6) {
            revert NileLinkLibs.InvalidAmount();
        }
        
        // Check order hasn't expired (7 days)
        if (uint64(block.timestamp) > order.createdAt + 7 days) {
            emit AnomalyFlagged(
                bytes32(orderId),
                keccak256(bytes("ORDER_EXPIRED")),
                5,
                keccak256(bytes("Order payment attempted after expiration")),
                uint64(block.timestamp)
            );
            revert NileLinkLibs.DeadlineExceeded();
        }
        
        // Transfer USDC from customer to this contract
        usdc.safeTransferFrom(msg.sender, address(this), amountUsd6);
        
        // Update order status
        order.status = NileLinkTypes.TxStatus.CONFIRMED;
        order.paidAt = uint64(block.timestamp);
        
        emit PaymentReceived(
            orderId,
            msg.sender,
            amountUsd6,
            uint64(block.timestamp)
        );
        
        // Automatically settle the payment
        _settlePayment(orderId);
    }
    
    /// @notice Settle payment to restaurant
    /// @param orderId Order identifier
    function settle(bytes16 orderId) 
        external 
        override 
        nonReentrant 
        onlyValidOrder(orderId) 
        whenNotPaused 
    {
        _settlePayment(orderId);
    }
    
    /// @notice Internal settlement function
    /// @param orderId Order identifier
    function _settlePayment(bytes16 orderId) internal {
        OrderData storage order = orders[orderId];
        
        // Check if order is ready for settlement
        if (order.status != NileLinkTypes.TxStatus.CONFIRMED) {
            revert NileLinkLibs.AlreadyProcessed();
        }
        
        // Calculate fees
        uint256 grossAmount = order.amountUsd6;
        uint256 protocolFee = (grossAmount * protocolFeeBps) / 10000;
        uint256 netAmount = grossAmount - protocolFee;
        
        // Transfer net amount to restaurant
        usdc.safeTransfer(order.restaurant, netAmount);
        
        // Transfer protocol fee to fee recipient
        usdc.safeTransfer(feeRecipient, protocolFee);
        
        // Update order status
        order.status = NileLinkTypes.TxStatus.SETTLED;
        order.settledAt = uint64(block.timestamp);
        
        emit PaymentSettled(
            orderId,
            order.restaurant,
            grossAmount,
            protocolFee,
            netAmount,
            uint64(block.timestamp)
        );
    }
    
    /// @notice Refund payment to customer
    /// @param orderId Order identifier
    /// @param to Refund recipient address
    /// @param amountUsd6 Refund amount (must be ≤ original amount)
    function refund(bytes16 orderId, address to, uint256 amountUsd6) 
        external 
        override 
        nonReentrant 
        onlyValidOrder(orderId) 
        whenNotPaused 
    {
        OrderData storage order = orders[orderId];
        
        // Only allow refunds for confirmed or settled orders
        if (order.status != NileLinkTypes.TxStatus.CONFIRMED && 
            order.status != NileLinkTypes.TxStatus.SETTLED) {
            revert NileLinkLibs.Unauthorized();
        }
        
        // Validate refund amount
        if (amountUsd6 > order.amountUsd6) {
            revert NileLinkLibs.InvalidAmount();
        }
        
        // Check refund deadline (30 days from payment)
        if (uint64(block.timestamp) > order.paidAt + 30 days) {
            revert NileLinkLibs.DeadlineExceeded();
        }
        
        // Transfer refund amount
        usdc.safeTransfer(to, amountUsd6);
        
        // Mark order as refunded if full amount
        if (amountUsd6 == order.amountUsd6) {
            order.status = NileLinkTypes.TxStatus.REFUNDED;
        }
        
        // Store refund reference
        orderRefunds[orderId] = keccak256(abi.encode(to, amountUsd6, uint64(block.timestamp)));
        
        emit PaymentRefunded(orderId, to, amountUsd6, uint64(block.timestamp));
    }
    
    /// @notice Get order status and details
    /// @param orderId Order identifier
    /// @return status Current order status
    /// @return amount Order amount
    /// @return paidAt Payment timestamp
    /// @return settledAt Settlement timestamp
    function getOrderStatus(bytes16 orderId) 
        external 
        view 
        onlyValidOrder(orderId) 
        returns (
            NileLinkTypes.TxStatus status,
            uint256 amount,
            uint64 paidAt,
            uint64 settledAt
        ) 
    {
        OrderData storage order = orders[orderId];
        return (order.status, order.amountUsd6, order.paidAt, order.settledAt);
    }
    
    /// @notice Get order data
    /// @param orderId Order identifier
    /// @return order Order data structure
    function getOrder(bytes16 orderId) 
        external 
        view 
        onlyValidOrder(orderId) 
        returns (OrderData memory order) 
    {
        return orders[orderId];
    }
    
    /// @notice Get refund reference
    /// @param orderId Order identifier
    /// @return refundRef Refund reference hash
    function getRefundReference(bytes16 orderId) external view returns (bytes32 refundRef) {
        return orderRefunds[orderId];
    }
    
    /// @notice Update protocol fee
    /// @param newFeeBps New fee in basis points (e.g., 50 = 0.5%)
    function setProtocolFee(uint16 newFeeBps) external onlyOwner {
        require(newFeeBps <= 100, "Fee cannot exceed 1%");
        uint16 oldFeeBps = protocolFeeBps;
        protocolFeeBps = newFeeBps;
        emit ProtocolFeeUpdated(oldFeeBps, newFeeBps, uint64(block.timestamp));
    }
    
    /// @notice Update fee recipient
    /// @param newRecipient New fee recipient address
    function setFeeRecipient(address newRecipient) external onlyOwner {
        NileLinkLibs.validateAddress(newRecipient);
        feeRecipient = newRecipient;
    }
    
    /// @notice Emergency withdrawal (owner only)
    /// @param token Token to withdraw
    /// @param to Recipient address
    /// @param amount Amount to withdraw
    function emergencyWithdraw(
        IERC20 token,
        address to,
        uint256 amount
    ) external onlyOwner {
        token.safeTransfer(to, amount);
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