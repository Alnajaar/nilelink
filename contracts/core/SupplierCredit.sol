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

/// @title SupplierCredit.sol
/// @notice Supplier credit line tracking and enforcement for NileLink Protocol
contract SupplierCredit is ISupplierCredit, Ownable, Pausable, ReentrancyGuard {
    using SafeERC20 for IERC20;
    using Address for address;
    
    // External contracts
    IERC20 public immutable usdc;
    
    // Credit line management
    mapping(address => mapping(address => CreditLine)) public creditLines;
    mapping(bytes16 => Invoice) public invoices;
    mapping(address => SupplierInfo) public supplierInfo;
    
    struct CreditLine {
        address restaurant;
        address supplier;
        uint256 limitUsd6;
        uint256 usedUsd6;
        uint64 updatedAt;
        bytes32 termsHash;
        bool isActive;
        uint64 termsExpiration;
    }
    
    struct Invoice {
        bytes16 invoiceId;
        address supplier;
        address restaurant;
        uint256 amountUsd6;
        uint256 paidAmountUsd6;
        uint64 issuedAt;
        uint64 dueDate;
        uint64 paidAt;
        bytes32 termsHash;
        InvoiceStatus status;
    }
    
    enum InvoiceStatus {
        PENDING,
        PARTIAL,
        PAID,
        OVERDUE,
        DISPUTED
    }
    
    struct SupplierInfo {
        uint256 totalCreditExtended;
        uint256 totalOutstanding;
        uint256 totalPaid;
        uint64 registeredAt;
        bool isVerified;
    }
    
    // Governance and verification
    mapping(address => bool) public governance;
    mapping(address => bool) public verifiedSuppliers;
    
    // Events
    event CreditLineSet(
        address indexed restaurant,
        address indexed supplier,
        uint256 limitUsd6,
        bytes32 termsHash,
        uint64 timestamp
    );
    
    event InvoiceCreated(
        bytes16 indexed invoiceId,
        address indexed supplier,
        address indexed restaurant,
        uint256 amountUsd6,
        uint64 dueDate,
        uint64 timestamp
    );
    
    event InvoiceSettled(
        bytes16 indexed invoiceId,
        uint256 amountPaidUsd6,
        bytes32 paymentTxHash,
        uint64 timestamp
    );
    
    event SupplierVerified(address indexed supplier, bool isVerified, uint64 timestamp);
    
    modifier onlyGovernance() {
        if (!governance[msg.sender] && owner() != msg.sender) {
            revert NileLinkLibs.Unauthorized();
        }
        _;
    }
    
    modifier onlyVerifiedSupplier() {
        if (!verifiedSuppliers[msg.sender]) {
            revert NileLinkLibs.Unauthorized();
        }
        _;
    }
    
    modifier onlyValidInvoice(bytes16 invoiceId) {
        if (invoices[invoiceId].supplier == address(0)) {
            revert NileLinkLibs.OrderNotFound();
        }
        _;
    }
    
    constructor(address _usdc) {
        usdc = IERC20(_usdc);
    }
    
    /// @notice Set credit line for a restaurant-supplier relationship
    /// @param restaurant Restaurant address
    /// @param supplier Supplier address
    /// @param limitUsd6 Credit limit in USD with 6 decimals
    /// @param termsHash Hash of credit terms (COD/Net-30/etc stored off-chain)
    function setCreditLine(
        address restaurant,
        address supplier,
        uint256 limitUsd6,
        bytes32 termsHash
    ) external onlyGovernance whenNotPaused {
        NileLinkLibs.validateAddress(restaurant);
        NileLinkLibs.validateAddress(supplier);
        NileLinkLibs.validateAmount(limitUsd6);
        
        CreditLine storage creditLine = creditLines[restaurant][supplier];
        creditLine.restaurant = restaurant;
        creditLine.supplier = supplier;
        creditLine.limitUsd6 = limitUsd6;
        creditLine.updatedAt = uint64(block.timestamp);
        creditLine.termsHash = termsHash;
        creditLine.isActive = true;
        
        // Calculate terms expiration based on terms type
        uint64 expirationDays = _getTermsExpirationDays(termsHash);
        creditLine.termsExpiration = uint64(block.timestamp) + (expirationDays * 1 days);
        
        // Update supplier info
        SupplierInfo storage supplierData = supplierInfo[supplier];
        supplierData.totalCreditExtended += limitUsd6;
        
        emit CreditLineSet(restaurant, supplier, limitUsd6, termsHash, uint64(block.timestamp));
    }
    
    /// @notice Create invoice and extend credit
    /// @param restaurant Restaurant address
    /// @param invoiceId Unique invoice identifier (UUIDv4 as bytes16)
    /// @param invoiceAmountUsd6 Invoice amount in USD with 6 decimals
    /// @param dueDate Invoice due date (timestamp)
    /// @param termsHash Hash of invoice terms
    function useCredit(
        address restaurant,
        bytes16 invoiceId,
        uint256 invoiceAmountUsd6,
        uint64 dueDate,
        bytes32 termsHash
    ) external onlyVerifiedSupplier whenNotPaused {
        NileLinkLibs.validateAddress(restaurant);
        NileLinkLibs.validateAmount(invoiceAmountUsd6);
        
        CreditLine storage creditLine = creditLines[restaurant][msg.sender];
        
        // Validate credit line
        if (!creditLine.isActive) {
            revert NileLinkLibs.Unauthorized();
        }
        
        // Check credit availability
        uint256 availableCredit = creditLine.limitUsd6 - creditLine.usedUsd6;
        if (invoiceAmountUsd6 > availableCredit) {
            revert NileLinkLibs.InvalidAmount();
        }
        
        // Ensure invoice doesn't already exist
        if (invoices[invoiceId].supplier != address(0)) {
            revert NileLinkLibs.AlreadyProcessed();
        }
        
        // Create invoice record
        invoices[invoiceId] = Invoice({
            invoiceId: invoiceId,
            supplier: msg.sender,
            restaurant: restaurant,
            amountUsd6: invoiceAmountUsd6,
            paidAmountUsd6: 0,
            issuedAt: uint64(block.timestamp),
            dueDate: dueDate,
            paidAt: 0,
            termsHash: termsHash,
            status: InvoiceStatus.PENDING
        });
        
        // Update credit line usage
        creditLine.usedUsd6 += invoiceAmountUsd6;
        creditLine.updatedAt = uint64(block.timestamp);
        
        // Update supplier info
        SupplierInfo storage supplierData = supplierInfo[msg.sender];
        supplierData.totalOutstanding += invoiceAmountUsd6;
        
        emit InvoiceCreated(
            invoiceId,
            msg.sender,
            restaurant,
            invoiceAmountUsd6,
            dueDate,
            uint64(block.timestamp)
        );
    }
    
    /// @notice Settle/repay an invoice
    /// @param invoiceId Invoice identifier
    /// @param paymentAmountUsd6 Payment amount in USD with 6 decimals
    /// @param paymentTxHash Hash of payment transaction
    function repay(
        bytes16 invoiceId,
        uint256 paymentAmountUsd6,
        bytes32 paymentTxHash
    ) external nonReentrant onlyValidInvoice(invoiceId) whenNotPaused {
        Invoice storage invoice = invoices[invoiceId];
        
        // Validate payment conditions
        if (paymentAmountUsd6 == 0 || paymentAmountUsd6 > invoice.amountUsd6) {
            revert NileLinkLibs.InvalidAmount();
        }
        
        // Transfer USDC from restaurant to supplier
        usdc.safeTransferFrom(msg.sender, invoice.supplier, paymentAmountUsd6);
        
        // Update invoice status
        invoice.paidAmountUsd6 += paymentAmountUsd6;
        
        if (invoice.paidAmountUsd6 >= invoice.amountUsd6) {
            invoice.status = InvoiceStatus.PAID;
            invoice.paidAt = uint64(block.timestamp);
        } else {
            invoice.status = InvoiceStatus.PARTIAL;
        }
        
        // Update credit line
        CreditLine storage creditLine = creditLines[invoice.restaurant][invoice.supplier];
        creditLine.usedUsd6 -= paymentAmountUsd6;
        creditLine.updatedAt = uint64(block.timestamp);
        
        // Update supplier info
        SupplierInfo storage supplierData = supplierInfo[invoice.supplier];
        supplierData.totalOutstanding -= paymentAmountUsd6;
        supplierData.totalPaid += paymentAmountUsd6;
        
        emit InvoiceSettled(
            invoiceId,
            paymentAmountUsd6,
            paymentTxHash,
            uint64(block.timestamp)
        );
    }
    
    /// @notice Get credit line information
    /// @param restaurant Restaurant address
    /// @param supplier Supplier address
    /// @return creditLine Credit line data
    function getCreditLine(
        address restaurant,
        address supplier
    ) external view returns (NileLinkTypes.CreditLine memory creditLine) {
        CreditLine storage line = creditLines[restaurant][supplier];
        return NileLinkTypes.CreditLine({
            restaurant: line.restaurant,
            supplier: line.supplier,
            limitUsd6: line.limitUsd6,
            usedUsd6: line.usedUsd6,
            updatedAt: line.updatedAt,
            termsHash: line.termsHash
        });
    }
    
    /// @notice Get invoice details
    /// @param invoiceId Invoice identifier
    /// @return invoice Invoice data structure
    function getInvoice(bytes16 invoiceId) external view onlyValidInvoice(invoiceId) returns (Invoice memory invoice) {
        return invoices[invoiceId];
    }
    
    /// @notice Get supplier information
    /// @param supplier Supplier address
    /// @return info Supplier info data
    function getSupplierInfo(address supplier) external view returns (SupplierInfo memory info) {
        return supplierInfo[supplier];
    }
    
    /// @notice Check available credit for restaurant-supplier pair
    /// @param restaurant Restaurant address
    /// @param supplier Supplier address
    /// @return available Available credit amount
    /// @return dueDate Credit line expiration
    function getAvailableCredit(
        address restaurant,
        address supplier
    ) external view returns (uint256 available, uint64 dueDate) {
        CreditLine storage creditLine = creditLines[restaurant][supplier];
        available = creditLine.limitUsd6 - creditLine.usedUsd6;
        dueDate = creditLine.termsExpiration;
    }
    
    /// @notice Get overdue invoices for a supplier
    /// @param supplier Supplier address
    /// @return overdueIds Array of overdue invoice IDs
    function getOverdueInvoices(address supplier) external view returns (bytes16[] memory overdueIds) {
        // This is a simplified implementation
        // In production, you'd want indexed storage or events-based querying
        return new bytes16[](0);
    }
    
    /// @notice Mark invoice as disputed
    /// @param invoiceId Invoice identifier
    /// @param reasonHash Hash of dispute reason
    function disputeInvoice(bytes16 invoiceId, bytes32 reasonHash) external onlyValidInvoice(invoiceId) {
        Invoice storage invoice = invoices[invoiceId];
        
        // Only restaurant or supplier can dispute
        require(
            msg.sender == invoice.restaurant || msg.sender == invoice.supplier,
            "Unauthorized"
        );
        
        invoice.status = InvoiceStatus.DISPUTED;
    }
    
    /// @notice Verify or unverify a supplier
    /// @param supplier Supplier address
    /// @param isVerified Whether supplier is verified
    function verifySupplier(address supplier, bool isVerified) external onlyGovernance {
        NileLinkLibs.validateAddress(supplier);
        verifiedSuppliers[supplier] = isVerified;
        supplierInfo[supplier].isVerified = isVerified;
        supplierInfo[supplier].registeredAt = uint64(block.timestamp);
        
        emit SupplierVerified(supplier, isVerified, uint64(block.timestamp));
    }
    
    /// @notice Get terms expiration days based on terms hash
    /// @param termsHash Terms hash
    /// @return expirationDays Expiration in days
    function _getTermsExpirationDays(bytes32 termsHash) internal pure returns (uint64 expirationDays) {
        // Map common terms to expiration periods
        // In production, this would decode the actual terms from the hash
        if (termsHash == keccak256("COD") || termsHash == keccak256("Cash on Delivery")) {
            return 0; // Due immediately
        } else if (termsHash == keccak256("Net-15") || termsHash == keccak256("Net15")) {
            return 15;
        } else if (termsHash == keccak256("Net-30") || termsHash == keccak256("Net30")) {
            return 30;
        } else if (termsHash == keccak256("Net-60") || termsHash == keccak256("Net60")) {
            return 60;
        } else if (termsHash == keccak256("Net-90") || termsHash == keccak256("Net90")) {
            return 90;
        }
        
        // Default to 30 days
        return 30;
    }
    
    /// @notice Add or remove governance address
    /// @param account Account to modify
    /// @param isGovernance Whether to add or remove
    function setGovernance(address account, bool isGovernance) external onlyOwner {
        NileLinkLibs.validateAddress(account);
        governance[account] = isGovernance;
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