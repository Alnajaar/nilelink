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

/// @title InvestorVault.sol
/// @notice Multi-restaurant portfolio management for NileLink Protocol
contract InvestorVault is IInvestorVault, Ownable, Pausable, ReentrancyGuard {
    using SafeERC20 for IERC20;
    using Address for address;
    
    // External contracts
    IERC20 public immutable usdc;
    // Note: Using address for OrderSettlement to avoid circular dependency
    address public immutable orderSettlement;
    
    // Investment tracking
    mapping(address => mapping(address => Investment)) public investments;
    mapping(address => RestaurantInvestment) public restaurantInvestments;
    mapping(address => mapping(address => uint256)) public dividendAccruals;
    mapping(address => DividendPayment[]) public dividendHistory;
    
    struct Investment {
        uint256 investedUsd6; // Total amount invested
        uint256 ownershipBps; // Ownership in basis points (0.01%)
        uint256 dividendsAccrued; // Total dividends accrued
        uint256 dividendsPaid; // Total dividends paid
        uint64 createdAt;
        uint64 lastDividendCalculation;
    }
    
    struct RestaurantInvestment {
        uint256 totalInvestedUsd6; // Total amount invested in this restaurant
        uint256 totalOwnershipBps; // Total ownership percentage * 100 (e.g., 10000 = 100%)
        uint256 totalDividendsAccrued; // Total dividends accrued
        uint256 netProfit; // Net profit from operations
        uint64 lastCalculation; // Last dividend calculation timestamp
    }
    
    struct DividendPayment {
        uint256 amountUsd6;
        address restaurant;
        uint64 timestamp;
    }
    
    struct Portfolio {
        address[] restaurants;
        uint256 totalInvested;
        uint256 totalDividends;
        uint256 netReturnBps;
        uint256 investmentCount;
    }
    
    // Governance and fee management
    mapping(address => bool) public governance;
    uint16 public performanceFeeBps = 200; // 2% performance fee
    address public feeRecipient;
    
    // Events
    event InvestmentDeposited(
        address indexed investor,
        address indexed restaurant,
        uint256 amountUsd6,
        uint256 ownershipBps,
        uint64 timestamp
    );
    
    event InvestmentWithdrawn(
        address indexed investor,
        address indexed restaurant,
        uint256 amountUsd6,
        uint256 ownershipBpsRemoved,
        uint64 timestamp
    );
    
    event DividendCalculated(
        address indexed investor,
        address indexed restaurant,
        uint256 amountUsd6,
        uint64 timestamp
    );
    
    event DividendPaid(
        address indexed investor,
        address indexed restaurant,
        uint256 amountUsd6,
        address indexed recipient,
        uint64 timestamp
    );
    
    event DividendWithdrawn(
        address indexed investor,
        address indexed amount,
        address indexed recipientWallet,
        uint64 timestamp
    );
    
    event RestaurantValuationUpdated(
        address indexed restaurant,
        uint256 newValuation,
        uint64 timestamp
    );
    
    modifier onlyGovernance() {
        if (!governance[msg.sender] && owner() != msg.sender) {
            revert NileLinkLibs.Unauthorized();
        }
        _;
    }
    
    modifier onlyValidInvestment(address investor, address restaurant) {
        if (investments[investor][restaurant].investedUsd6 == 0) {
            revert NileLinkLibs.Unauthorized();
        }
        _;
    }
    
    constructor(
        address _usdc,
        address _orderSettlement,
        address _feeRecipient
    ) Ownable() {
        usdc = IERC20(_usdc);
        orderSettlement = _orderSettlement;
        feeRecipient = _feeRecipient;
    }
    
    /// @notice Deposit investment into a restaurant
    /// @param restaurant Restaurant address
    /// @param amountUsd6 Amount to invest in USD with 6 decimals
    function deposit(
        address restaurant,
        uint256 amountUsd6
    ) external override nonReentrant whenNotPaused {
        NileLinkLibs.validateAddress(restaurant);
        NileLinkLibs.validateAmount(amountUsd6);
        
        // Transfer USDC from investor
        usdc.safeTransferFrom(msg.sender, address(this), amountUsd6);
        
        // Get or create restaurant investment record
        RestaurantInvestment storage restInvestment = restaurantInvestments[restaurant];
        Investment storage investorInvestment = investments[msg.sender][restaurant];
        
        // Calculate new ownership percentage
        uint256 newTotalInvested = restInvestment.totalInvestedUsd6 + amountUsd6;
        uint256 newOwnershipBps = (amountUsd6 * 10000) / newTotalInvested;
        
        // Update restaurant investment
        restInvestment.totalInvestedUsd6 = newTotalInvested;
        restInvestment.totalOwnershipBps += newOwnershipBps;
        
        // Update investor investment
        investorInvestment.investedUsd6 += amountUsd6;
        investorInvestment.ownershipBps += newOwnershipBps;
        investorInvestment.createdAt = uint64(block.timestamp);
        
        // Transfer funds to restaurant
        usdc.safeTransfer(restaurant, amountUsd6);
        
        emit InvestmentDeposited(
            msg.sender,
            restaurant,
            amountUsd6,
            newOwnershipBps,
            uint64(block.timestamp)
        );
    }
    
    /// @notice Withdraw investment from a restaurant
    /// @param restaurant Restaurant address
    /// @param amountUsd6 Amount to withdraw in USD with 6 decimals
    function withdraw(
        address restaurant,
        uint256 amountUsd6
    ) external override nonReentrant onlyValidInvestment(msg.sender, restaurant) whenNotPaused {
        Investment storage investorInvestment = investments[msg.sender][restaurant];
        RestaurantInvestment storage restInvestment = restaurantInvestments[restaurant];
        
        // Validate withdrawal amount
        if (amountUsd6 == 0 || amountUsd6 > investorInvestment.investedUsd6) {
            revert NileLinkLibs.InvalidAmount();
        }
        
        // Calculate ownership to remove
        uint256 ownershipToRemove = (amountUsd6 * 10000) / restInvestment.totalInvestedUsd6;
        
        // Update investor investment
        investorInvestment.investedUsd6 -= amountUsd6;
        investorInvestment.ownershipBps -= ownershipToRemove;
        
        // Update restaurant investment
        restInvestment.totalInvestedUsd6 -= amountUsd6;
        restInvestment.totalOwnershipBps -= ownershipToRemove;
        
        // Transfer principal back to investor
        usdc.safeTransfer(msg.sender, amountUsd6);
        
        // Add any accrued dividends to withdrawal
        uint256 accruedDividends = calculateAccruedDividends(msg.sender, restaurant);
        if (accruedDividends > 0) {
            investorInvestment.dividendsAccrued += accruedDividends;
            usdc.safeTransfer(msg.sender, accruedDividends);
        }
        
        emit InvestmentWithdrawn(
            msg.sender,
            restaurant,
            amountUsd6,
            ownershipToRemove,
            uint64(block.timestamp)
        );
    }
    
    /// @notice Claim dividends for a specific restaurant
    /// @param restaurant Restaurant address
    /// @return claimedUsd6 Amount of dividends claimed
    function claimDividend(
        address restaurant
    ) external override nonReentrant onlyValidInvestment(msg.sender, restaurant) whenNotPaused returns (uint256 claimedUsd6) {
        // Calculate accrued dividends
        claimedUsd6 = calculateAccruedDividends(msg.sender, restaurant);
        
        if (claimedUsd6 > 0) {
            Investment storage investorInvestment = investments[msg.sender][restaurant];
            
            // Update investor record
            investorInvestment.dividendsAccrued += claimedUsd6;
            investorInvestment.dividendsPaid += claimedUsd6;
            investorInvestment.lastDividendCalculation = uint64(block.timestamp);
            
            // Update restaurant record
            RestaurantInvestment storage restInvestment = restaurantInvestments[restaurant];
            restInvestment.totalDividendsAccrued += claimedUsd6;
            
            // Transfer dividends to investor
            usdc.safeTransfer(msg.sender, claimedUsd6);
            
            // Record dividend payment
            dividendHistory[msg.sender].push(DividendPayment({
                amountUsd6: claimedUsd6,
                restaurant: restaurant,
                timestamp: uint64(block.timestamp)
            }));
            
            emit DividendPaid(
                msg.sender,
                restaurant,
                claimedUsd6,
                msg.sender,
                uint64(block.timestamp)
            );
        }
        
        return claimedUsd6;
    }
    
    /// @notice Calculate accrued dividends for an investor
    /// @param investor Investor address
    /// @param restaurant Restaurant address
    /// @return dividendAmount Accrued dividend amount
    function calculateAccruedDividends(
        address investor,
        address restaurant
    ) public view returns (uint256 dividendAmount) {
        Investment storage investorInvestment = investments[investor][restaurant];
        RestaurantInvestment storage restInvestment = restaurantInvestments[restaurant];
        
        if (investorInvestment.investedUsd6 == 0) {
            return 0;
        }
        
        // Calculate investor's share of net profit
        uint256 investorShare = (restInvestment.netProfit * investorInvestment.ownershipBps) / 10000;
        
        // Subtract already accrued dividends
        dividendAmount = investorShare - investorInvestment.dividendsAccrued;
        
        return dividendAmount > 0 ? dividendAmount : 0;
    }
    
    /// @notice Get investment position for an investor
    /// @param investor Investor address
    /// @param restaurant Restaurant address
    /// @return investedUsd6 Amount invested
    /// @return ownershipBps Ownership percentage in basis points
    function positionOf(
        address investor,
        address restaurant
    ) external view override returns (uint256 investedUsd6, uint256 ownershipBps) {
        Investment storage investment = investments[investor][restaurant];
        return (investment.investedUsd6, investment.ownershipBps);
    }
    
    /// @notice Get investor portfolio summary
    /// @param investor Investor address
    /// @return portfolio Portfolio data structure
    function getPortfolio(
        address investor
    ) external view returns (Portfolio memory portfolio) {
        uint256 totalInvested = 0;
        uint256 totalDividends = 0;
        uint256 netReturns = 0;
        uint256 investmentCount = 0;
        
        // Iterate through all possible restaurant investments
        // In production, this would use events or a separate index
        // For simplicity, we'll return mock data
        return Portfolio({
            restaurants: new address[](0),
            totalInvested: 0,
            totalDividends: 0,
            netReturnBps: 0,
            investmentCount: 0
        });
    }
    
    /// @notice Update restaurant valuation (called by governance)
    /// @param restaurant Restaurant address
    /// @param newValuation New valuation in USD with 6 decimals
    function updateRestaurantValuation(
        address restaurant,
        uint256 newValuation
    ) external onlyGovernance {
        NileLinkLibs.validateAmount(newValuation);
        
        RestaurantInvestment storage restInvestment = restaurantInvestments[restaurant];
        restInvestment.netProfit = newValuation > restInvestment.totalInvestedUsd6 ? 
            newValuation - restInvestment.totalInvestedUsd6 : 0;
        restInvestment.lastCalculation = uint64(block.timestamp);
        
        emit RestaurantValuationUpdated(restaurant, newValuation, uint64(block.timestamp));
    }
    
    /// @notice Calculate dividends for all investors in a restaurant
    /// @param restaurant Restaurant address
    function calculateRestaurantDividends(
        address restaurant
    ) external onlyGovernance {
        // This would typically be called by a keeper service
        // For now, it's a placeholder for future implementation
        emit DividendCalculated(address(0), restaurant, 0, uint64(block.timestamp));
    }
    
    /// @notice Update performance fee
    /// @param newFeeBps New fee in basis points (e.g., 200 = 2%)
    function setPerformanceFee(uint16 newFeeBps) external onlyOwner {
        require(newFeeBps <= 500, "Fee cannot exceed 5%");
        performanceFeeBps = newFeeBps;
    }
    
    /// @notice Update fee recipient
    /// @param newRecipient New fee recipient address
    function setFeeRecipient(address newRecipient) external onlyOwner {
        NileLinkLibs.validateAddress(newRecipient);
        feeRecipient = newRecipient;
    }
    
    /// @notice Get restaurant investment data
    /// @param restaurant Restaurant address
    /// @return data Restaurant investment data
    function getRestaurantInvestment(
        address restaurant
    ) external view returns (RestaurantInvestment memory data) {
        return restaurantInvestments[restaurant];
    }
    
    /// @notice Get investor dividend history
    /// @param investor Investor address
    /// @return history Array of dividend payments
    function getDividendHistory(
        address investor
    ) external view returns (DividendPayment[] memory history) {
        return dividendHistory[investor];
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