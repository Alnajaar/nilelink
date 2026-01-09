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
import "./OrderSettlement.sol";

/// @title DisputeResolution.sol
/// @notice Automated dispute handling with manual override for NileLink Protocol
contract DisputeResolution is IDisputeResolution, Ownable, Pausable, ReentrancyGuard {
    using SafeERC20 for IERC20;
    using Address for address;
    
    // External contracts
    OrderSettlement public immutable orderSettlement;
    IERC20 public immutable usdc;
    
    // Dispute management
    mapping(bytes16 => DisputeData) public disputes;
    mapping(bytes16 => uint256) public disputeEscrow;

    /// @notice Total number of active disputes
    uint256 public activeDisputes;
    
    struct DisputeData {
        bytes16 orderId;
        address claimant;
        uint256 claimAmountUsd6;
        NileLinkTypes.DisputeResolution resolution;
        uint64 openedAt;
        uint64 deadlineAt;
        uint64 resolvedAt;
        bytes32 reasonHash;
        bool isEscrowed;
        address escrowRecipient;
    }
    
    // Governance and timeouts
    mapping(address => bool) public governance;
    uint64 public AUTO_RESOLVE_DEADLINE = 3 days;
    uint64 public DISPUTE_OPENING_DEADLINE = 30 days;
    
    // Events
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
    
    event DisputeAutoResolved(
        bytes16 indexed disputeId,
        address indexed winnerWallet,
        bytes32 proof,
        uint64 timestamp
    );
    
    event DisputeManuallyResolved(
        bytes16 indexed disputeId,
        string resolution,
        address indexed winnerWallet,
        uint64 timestamp
    );
    
    event EscrowReleased(bytes16 indexed disputeId, uint256 amount, address indexed to);
    
    modifier onlyGovernance() {
        if (!governance[msg.sender] && owner() != msg.sender) {
            revert NileLinkLibs.Unauthorized();
        }
        _;
    }
    
    modifier onlyValidDispute(bytes16 disputeId) {
        if (disputes[disputeId].openedAt == 0) {
            revert NileLinkLibs.DisputeNotFound();
        }
        _;
    }
    
    constructor(
        address _orderSettlement,
        address _usdc
    ) Ownable() {
        orderSettlement = OrderSettlement(_orderSettlement);
        usdc = IERC20(_usdc);
    }
    
    /// @notice Open a dispute for an order
    /// @param orderId Order identifier
    /// @param claimAmountUsd6 Amount being claimed in dispute
    /// @param reasonHash Hash of dispute reason (stored off-chain)
    function openDispute(
        bytes16 orderId,
        uint256 claimAmountUsd6,
        bytes32 reasonHash
    ) external override nonReentrant whenNotPaused {
        // Get order data from OrderSettlement contract
        (NileLinkTypes.TxStatus status, uint256 orderAmount, uint64 paidAt, uint64 settledAt) = 
            orderSettlement.getOrderStatus(orderId);
        
        // Validate dispute conditions
        if (status == NileLinkTypes.TxStatus.PENDING) {
            revert NileLinkLibs.Unauthorized();
        }
        
        // Check dispute opening deadline (30 days from payment)
        if (uint64(block.timestamp) > paidAt + DISPUTE_OPENING_DEADLINE) {
            revert NileLinkLibs.DeadlineExceeded();
        }
        
        // Ensure dispute doesn't already exist for this order
        if (disputes[orderId].openedAt != 0) {
            revert NileLinkLibs.AlreadyProcessed();
        }
        
        // Validate claim amount
        if (claimAmountUsd6 == 0 || claimAmountUsd6 > orderAmount) {
            revert NileLinkLibs.InvalidAmount();
        }
        
        // Create dispute record
        disputes[orderId] = DisputeData({
            orderId: orderId,
            claimant: msg.sender,
            claimAmountUsd6: claimAmountUsd6,
            resolution: NileLinkTypes.DisputeResolution.NONE,
            openedAt: uint64(block.timestamp),
            deadlineAt: uint64(block.timestamp) + AUTO_RESOLVE_DEADLINE,
            resolvedAt: 0,
            reasonHash: reasonHash,
            isEscrowed: false,
            escrowRecipient: address(0)
        });

        activeDisputes++;
        
        // For claims over $1000, hold funds in escrow
        if (claimAmountUsd6 > 1000 * 10**6) {
            // Transfer claim amount from customer to escrow
            usdc.safeTransferFrom(msg.sender, address(this), claimAmountUsd6);
            disputeEscrow[orderId] = claimAmountUsd6;
            disputes[orderId].isEscrowed = true;
        }
        
        emit DisputeOpened(
            orderId,
            msg.sender,
            claimAmountUsd6,
            uint64(block.timestamp),
            uint64(block.timestamp) + AUTO_RESOLVE_DEADLINE,
            reasonHash
        );
    }
    
    /// @notice Auto-resolve dispute after deadline (public function for keepers)
    /// @param orderId Order identifier
    function autoSettle(bytes16 orderId) external override nonReentrant onlyValidDispute(orderId) {
        DisputeData storage dispute = disputes[orderId];
        
        // Check if deadline has passed
        if (uint64(block.timestamp) < dispute.deadlineAt) {
            revert("Deadline not reached");
        }
        
        // Check if already resolved
        if (dispute.resolution != NileLinkTypes.DisputeResolution.NONE) {
            revert NileLinkLibs.AlreadyProcessed();
        }
        
        // Auto-resolve in favor of claimant (refund policy)
        dispute.resolution = NileLinkTypes.DisputeResolution.REFUND;
        dispute.resolvedAt = uint64(block.timestamp);
        
        // Process refund
        _processDisputeRefund(orderId, dispute.claimAmountUsd6);
        
        emit DisputeAutoResolved(
            orderId,
            dispute.claimant,
            keccak256(bytes("AUTO_RESOLVED")),
            uint64(block.timestamp)
        );
    }
    
    /// @notice Manually resolve dispute (governance only)
    /// @param orderId Order identifier
    /// @param resolution Resolution outcome (REFUND or CONFIRM)
    /// @param refundAmountUsd6 Amount to refund to claimant
    function resolveDispute(
        bytes16 orderId,
        NileLinkTypes.DisputeResolution resolution,
        uint256 refundAmountUsd6
    ) external override onlyGovernance onlyValidDispute(orderId) {
        DisputeData storage dispute = disputes[orderId];
        
        // Check if already resolved
        if (dispute.resolution != NileLinkTypes.DisputeResolution.NONE) {
            revert NileLinkLibs.AlreadyProcessed();
        }
        
        // Validate resolution parameters
        require(
            resolution == NileLinkTypes.DisputeResolution.REFUND || 
            resolution == NileLinkTypes.DisputeResolution.CONFIRM,
            "Invalid resolution"
        );
        
        if (resolution == NileLinkTypes.DisputeResolution.REFUND && 
            refundAmountUsd6 > dispute.claimAmountUsd6) {
            revert NileLinkLibs.InvalidAmount();
        }
        
        // Update dispute record
        dispute.resolution = resolution;
        dispute.resolvedAt = uint64(block.timestamp);
        
        // Process resolution
        if (resolution == NileLinkTypes.DisputeResolution.REFUND && refundAmountUsd6 > 0) {
            _processDisputeRefund(orderId, refundAmountUsd6);
        }

        activeDisputes--;
        
        emit DisputeResolved(orderId, resolution, refundAmountUsd6, uint64(block.timestamp));
    }
    
    /// @notice Process dispute refund
    /// @param orderId Order identifier
    /// @param refundAmountUsd6 Amount to refund
    function _processDisputeRefund(bytes16 orderId, uint256 refundAmountUsd6) internal {
        DisputeData storage dispute = disputes[orderId];
        
        // Handle escrow if it exists
        if (dispute.isEscrowed) {
            uint256 escrowedAmount = disputeEscrow[orderId];
            if (refundAmountUsd6 <= escrowedAmount) {
                // Partial or full refund from escrow
                usdc.safeTransfer(dispute.claimant, refundAmountUsd6);
                
                // Return remaining escrow to original payer
                if (escrowedAmount > refundAmountUsd6) {
                    (,, uint64 paidAt,) = orderSettlement.getOrderStatus(orderId);
                    address originalPayer = _getOrderCustomer(orderId);
                    usdc.safeTransfer(originalPayer, escrowedAmount - refundAmountUsd6);
                }
                
                emit EscrowReleased(orderId, refundAmountUsd6, dispute.claimant);
                disputeEscrow[orderId] = 0;
            } else {
                // Refund amount exceeds escrow, issue from protocol reserves
                usdc.safeTransfer(dispute.claimant, refundAmountUsd6);
                emit EscrowReleased(orderId, refundAmountUsd6, dispute.claimant);
            }
        } else {
            // No escrow, issue full refund from protocol reserves
            usdc.safeTransfer(dispute.claimant, refundAmountUsd6);
            emit EscrowReleased(orderId, refundAmountUsd6, dispute.claimant);
        }
    }
    
    /// @notice Get dispute details
    /// @param orderId Order identifier
    /// @return dispute Dispute data structure
    function getDispute(bytes16 orderId) 
        external 
        view 
        override 
        onlyValidDispute(orderId) 
        returns (NileLinkTypes.Dispute memory dispute) 
    {
        DisputeData storage disputeData = disputes[orderId];
        return NileLinkTypes.Dispute({
            orderId: disputeData.orderId,
            claimant: disputeData.claimant,
            claimAmountUsd6: disputeData.claimAmountUsd6,
            openedAt: disputeData.openedAt,
            deadlineAt: disputeData.deadlineAt,
            resolution: disputeData.resolution,
            reasonHash: disputeData.reasonHash
        });
    }
    
    /// @notice Get dispute status
    /// @param orderId Order identifier
    /// @return status Current dispute status
    /// @return claimant Claimant address
    /// @return amount Dispute amount
    /// @return filedAt Filing timestamp
    /// @return resolveBy Auto-resolution deadline
    function getDisputeStatus(
        bytes16 orderId
    ) external view onlyValidDispute(orderId) returns (
        string memory status,
        address claimant,
        uint256 amount,
        uint64 filedAt,
        uint64 resolveBy
    ) {
        DisputeData storage dispute = disputes[orderId];
        
        if (dispute.resolution == NileLinkTypes.DisputeResolution.NONE) {
            if (uint64(block.timestamp) > dispute.deadlineAt) {
                status = "PENDING_AUTO_RESOLUTION";
            } else {
                status = "OPEN";
            }
        } else if (dispute.resolution == NileLinkTypes.DisputeResolution.REFUND) {
            status = "REFUNDED";
        } else {
            status = "CONFIRMED";
        }
        
        return (status, dispute.claimant, dispute.claimAmountUsd6, dispute.openedAt, dispute.deadlineAt);
    }
    
    /// @notice Get dispute escrow amount
    /// @param orderId Order identifier
    /// @return escrowedAmount Amount held in escrow
    function getDisputeEscrow(bytes16 orderId) external view returns (uint256 escrowedAmount) {
        return disputeEscrow[orderId];
    }
    
    /// @notice Helper to get original order customer
    /// @param orderId Order identifier
    /// @return customer Customer address
    function _getOrderCustomer(bytes16 orderId) internal view returns (address customer) {
        // This requires OrderSettlement to expose order data
        // In production, this would be handled through OrderSettlement.getOrder()
        // For now, return msg.sender as the customer (caller of dispute)
        return disputes[orderId].claimant;
    }
    
    /// @notice Add or remove governance address
    /// @param account Account to modify
    /// @param isGovernance Whether to add or remove
    function setGovernance(address account, bool isGovernance) external onlyOwner {
        NileLinkLibs.validateAddress(account);
        governance[account] = isGovernance;
    }
    
    /// @notice Update dispute timeouts
    /// @param autoResolveTimeout New auto-resolve timeout
    /// @param openingDeadline New dispute opening deadline
    function updateDisputeTimeouts(
        uint64 autoResolveTimeout,
        uint64 openingDeadline
    ) external onlyOwner {
        require(autoResolveTimeout <= 7 days, "Auto-resolve timeout too long");
        require(openingDeadline <= 90 days, "Opening deadline too long");
        AUTO_RESOLVE_DEADLINE = autoResolveTimeout;
        DISPUTE_OPENING_DEADLINE = openingDeadline;
    }
    
    /// @notice Emergency withdrawal of protocol funds
    /// @param to Recipient address
    /// @param amount Amount to withdraw
    function emergencyWithdraw(address to, uint256 amount) external onlyOwner {
        usdc.safeTransfer(to, amount);
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