// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "./core/RestaurantRegistry.sol";
import "./core/OrderSettlement.sol";
import "./core/CurrencyExchange.sol";
import "./core/DisputeResolution.sol";
import "./core/FraudDetection.sol";
import "./core/InvestorVault.sol";
import "./core/SupplierCredit.sol";
import "./core/DeliveryCoordinator.sol";
import "./core/ProofOfDelivery.sol";
import "./core/SupplierRegistry.sol";
import "./core/SupplyChain.sol";
import "./core/BridgeCoordinator.sol";
import "./core/Marketplace.sol";
import "./security/AISecurityOrchestrator.sol";
import "./libraries/NileLinkLibs.sol";
import "./interfaces/SmartContract_Interfaces.sol";

/// @title NileLinkProtocol.sol
/// @notice Main orchestrator contract for the NileLink Protocol
/// @dev This contract coordinates all the core components and provides a unified interface
contract NileLinkProtocol is Ownable, Pausable, ReentrancyGuard {
    using SafeERC20 for IERC20;
    using Address for address;

    // Core protocol components
    RestaurantRegistry public restaurantRegistry;
    OrderSettlement public orderSettlement;
    CurrencyExchange public currencyExchange;
    DisputeResolution public disputeResolution;
    FraudDetection public fraudDetection;
    InvestorVault public investorVault;
    SupplierCredit public supplierCredit;
    DeliveryCoordinator public deliveryCoordinator;
    ProofOfDelivery public proofOfDelivery;
    SupplierRegistry public supplierRegistry;
    SupplyChain public supplyChain;
    BridgeCoordinator public bridgeCoordinator;
    Marketplace public marketplace;
    AISecurityOrchestrator public securityOrchestrator;

    // Protocol configuration
    IERC20 public immutable usdc;
    address public feeRecipient;
    uint16 public protocolFeeBps = 50; // 0.5%

    // Governance
    mapping(address => bool) public governance;
    mapping(address => bool) public authorizedCallers;

    // Events
    event ProtocolInitialized(
        address restaurantRegistry,
        address orderSettlement,
        address currencyExchange,
        address disputeResolution,
        address fraudDetection,
        address investorVault,
        address supplierCredit,
        address deliveryCoordinator,
        address proofOfDelivery,
        address supplierRegistry,
        address supplyChain,
        address bridgeCoordinator,
        address marketplace,
        uint64 timestamp
    );

    event GovernanceUpdated(address indexed account, bool isGovernance);

    event AuthorizedCallerUpdated(address indexed caller, bool isAuthorized);

    event ProtocolFeeUpdated(
        uint16 oldFeeBps,
        uint16 newFeeBps,
        uint64 timestamp
    );

    modifier onlyGovernance() {
        if (!governance[msg.sender] && owner() != msg.sender) {
            revert NileLinkLibs.Unauthorized();
        }
        _;
    }

    modifier onlyAuthorized() {
        if (
            !authorizedCallers[msg.sender] &&
            !governance[msg.sender] &&
            owner() != msg.sender
        ) {
            revert NileLinkLibs.Unauthorized();
        }
        _;
    }

    constructor(address _usdc, address _feeRecipient) Ownable(msg.sender) {
        usdc = IERC20(_usdc);
        feeRecipient = _feeRecipient;

        // Initialize remaining contracts to address(0) - set later via setters
        restaurantRegistry = RestaurantRegistry(address(0));
        orderSettlement = OrderSettlement(address(0));
        currencyExchange = CurrencyExchange(address(0));
        disputeResolution = DisputeResolution(address(0));
        fraudDetection = FraudDetection(address(0));
        investorVault = InvestorVault(address(0));
        supplierCredit = SupplierCredit(address(0));
        deliveryCoordinator = DeliveryCoordinator(address(0));
        proofOfDelivery = ProofOfDelivery(address(0));
        supplierRegistry = SupplierRegistry(address(0));
        supplyChain = SupplyChain(address(0));
        bridgeCoordinator = BridgeCoordinator(address(0));
        marketplace = Marketplace(address(0));
        // Emit partial initialization (core components only)
        emit ProtocolInitialized(
            address(restaurantRegistry),
            address(orderSettlement),
            address(currencyExchange),
            address(disputeResolution),
            address(fraudDetection),
            address(0), // investorVault
            address(0), // supplierCredit
            address(0), // deliveryCoordinator
            address(0), // proofOfDelivery
            address(0), // supplierRegistry
            address(0), // supplyChain
            address(0), // bridgeCoordinator
            address(0), // marketplace
            uint64(block.timestamp)
        );
    }

    function setCoreContracts(
        address _restaurantRegistry,
        address _orderSettlement,
        address _currencyExchange,
        address _disputeResolution,
        address _fraudDetection
    ) external onlyOwner {
        restaurantRegistry = RestaurantRegistry(_restaurantRegistry);
        orderSettlement = OrderSettlement(_orderSettlement);
        currencyExchange = CurrencyExchange(_currencyExchange);
        disputeResolution = DisputeResolution(_disputeResolution);
        fraudDetection = FraudDetection(_fraudDetection);

        if (address(orderSettlement) != address(0)) {
            orderSettlement.setProtocolFee(protocolFeeBps);
        }
    }

    function setSecondaryContracts(
        address _investorVault,
        address _supplierCredit,
        address _deliveryCoordinator,
        address _proofOfDelivery,
        address _supplierRegistry,
        address _supplyChain,
        address _bridgeCoordinator,
        address _marketplace
    ) external onlyOwner {
        investorVault = InvestorVault(_investorVault);
        supplierCredit = SupplierCredit(_supplierCredit);
        deliveryCoordinator = DeliveryCoordinator(_deliveryCoordinator);
        proofOfDelivery = ProofOfDelivery(_proofOfDelivery);
        supplierRegistry = SupplierRegistry(_supplierRegistry);
        supplyChain = SupplyChain(_supplyChain);
        bridgeCoordinator = BridgeCoordinator(_bridgeCoordinator);
        marketplace = Marketplace(_marketplace);
    }

    /// @notice Create a complete order flow (convenience function)
    /// @param orderId Unique order identifier
    /// @param restaurant Restaurant address
    /// @param customer Customer address
    /// @param amountUsd6 Order amount in USD with 6 decimals
    /// @param method Payment method
    function createAndPayOrder(
        bytes16 orderId,
        address restaurant,
        address customer,
        uint256 amountUsd6,
        NileLinkTypes.PaymentMethod method
    )
        external
        onlyAuthorized
        nonReentrant
        whenNotPaused
        returns (bool success)
    {
        // Create payment intent
        orderSettlement.createPaymentIntent(
            orderId,
            restaurant,
            customer,
            amountUsd6,
            method
        );

        // Process payment
        try orderSettlement.pay(orderId, amountUsd6) {
            return true;
        } catch {
            return false;
        }
    }

    /// @notice Batch process multiple orders (for high throughput scenarios)
    /// @param orderIds Array of order identifiers
    /// @param restaurants Array of restaurant addresses
    /// @param customers Array of customer addresses
    /// @param amountsUs6 Array of amounts in USD with 6 decimals
    /// @param methods Array of payment methods
    function batchCreateOrders(
        bytes16[] calldata orderIds,
        address[] calldata restaurants,
        address[] calldata customers,
        uint256[] calldata amountsUs6,
        NileLinkTypes.PaymentMethod[] calldata methods
    ) external onlyAuthorized nonReentrant whenNotPaused {
        require(
            orderIds.length == restaurants.length &&
                restaurants.length == customers.length &&
                customers.length == amountsUs6.length &&
                amountsUs6.length == methods.length,
            "Array length mismatch"
        );

        for (uint256 i = 0; i < orderIds.length; i++) {
            try
                this.createAndPayOrder(
                    orderIds[i],
                    restaurants[i],
                    customers[i],
                    amountsUs6[i],
                    methods[i]
                )
            {
                // Continue processing even if individual orders fail
            } catch {
                // Log failure but continue batch processing
                fraudDetection.flagAnomaly(
                    bytes32(uint256(uint160(restaurants[i]))),
                    keccak256(bytes("BATCH_ORDER_FAILED")),
                    5,
                    keccak256(bytes("Individual order in batch failed"))
                );
            }
        }
    }

    /// @notice Get comprehensive protocol statistics
    /// @return stats Protocol statistics structure
    function getProtocolStats()
        external
        view
        returns (ProtocolStats memory stats)
    {
        return
            ProtocolStats({
                totalRestaurants: restaurantRegistry.totalRestaurants(),
                totalOrders: orderSettlement.totalOrders(),
                totalVolumeUsd6: orderSettlement.totalVolumeUsd6(),
                activeDisputes: disputeResolution.activeDisputes(),
                totalInvestmentsUsd6: investorVault.totalInvestmentsUsd6(),
                protocolFeesCollectedUsd6: usdc.balanceOf(feeRecipient) // Approximation or track in OrderSettlement
            });
    }

    /// @notice Set the security orchestrator
    /// @param _securityOrchestrator New orchestrator address
    function setSecurityOrchestrator(
        address _securityOrchestrator
    ) external onlyGovernance {
        NileLinkLibs.validateAddress(_securityOrchestrator);
        securityOrchestrator = AISecurityOrchestrator(_securityOrchestrator);
    }

    /// @notice Emergency pause all protocol components
    function emergencyPause() external onlyGovernance {
        _pause();

        // Pause all core contracts
        restaurantRegistry.pause();
        orderSettlement.pause();
        currencyExchange.pause();
        disputeResolution.pause();
        fraudDetection.pause();
        investorVault.pause();
        supplierCredit.pause();
        deliveryCoordinator.pause();
        proofOfDelivery.emergencyPause();
        supplierRegistry.emergencyPause();
        supplyChain.emergencyPause();
        bridgeCoordinator.emergencyPause();
        marketplace.pause();
    }

    /// @notice Emergency unpause all protocol components
    function emergencyUnpause() external onlyOwner {
        _unpause();

        // Unpause all core contracts
        restaurantRegistry.unpause();
        orderSettlement.unpause();
        currencyExchange.unpause();
        disputeResolution.unpause();
        fraudDetection.unpause();
        investorVault.unpause();
        supplierCredit.unpause();
        deliveryCoordinator.unpause();
        proofOfDelivery.emergencyUnpause();
        supplierRegistry.emergencyUnpause();
        supplyChain.emergencyUnpause();
        bridgeCoordinator.emergencyUnpause();
        marketplace.unpause();
    }

    /// @notice Update protocol fee (affects OrderSettlement)
    /// @param newFeeBps New fee in basis points
    function updateProtocolFee(uint16 newFeeBps) external onlyOwner {
        require(newFeeBps <= 100, "Fee cannot exceed 1%");
        uint16 oldFeeBps = protocolFeeBps;
        protocolFeeBps = newFeeBps;

        // Update in OrderSettlement
        orderSettlement.setProtocolFee(newFeeBps);

        emit ProtocolFeeUpdated(oldFeeBps, newFeeBps, uint64(block.timestamp));
    }

    /// @notice Update fee recipient
    /// @param newRecipient New fee recipient address
    function updateFeeRecipient(address newRecipient) external onlyOwner {
        NileLinkLibs.validateAddress(newRecipient);
        feeRecipient = newRecipient;

        // Update in all relevant contracts
        orderSettlement.setFeeRecipient(newRecipient);
        investorVault.setFeeRecipient(newRecipient);
    }

    /// @notice Add or remove governance address
    /// @param account Account to modify
    /// @param isGovernance Whether to add or remove
    function setGovernance(
        address account,
        bool isGovernance
    ) external onlyOwner {
        NileLinkLibs.validateAddress(account);
        governance[account] = isGovernance;

        // Propagate to sub-contracts
        restaurantRegistry.setGovernance(account, isGovernance);
        disputeResolution.setGovernance(account, isGovernance);
        fraudDetection.setGovernance(account, isGovernance);
        investorVault.setGovernance(account, isGovernance);
        supplierCredit.setGovernance(account, isGovernance);

        emit GovernanceUpdated(account, isGovernance);
    }

    /// @notice Set Chainlink oracle for a currency (via CurrencyExchange)
    /// @param currency The currency code
    /// @param oracle Oracle address
    function setOracle(bytes3 currency, address oracle) external onlyOwner {
        currencyExchange.setOracle(currency, oracle);
        restaurantRegistry.setOracle(currency, oracle);
    }

    /// @notice Add or remove authorized caller
    /// @param caller Caller to modify
    /// @param isAuthorized Whether to add or remove
    function setAuthorizedCaller(
        address caller,
        bool isAuthorized
    ) external onlyGovernance {
        NileLinkLibs.validateAddress(caller);
        authorizedCallers[caller] = isAuthorized;
        emit AuthorizedCallerUpdated(caller, isAuthorized);
    }

    /// @notice Get contract addresses
    /// @return addresses Contract address structure
    function getContractAddresses()
        external
        view
        returns (ContractAddresses memory addresses)
    {
        return
            ContractAddresses({
                restaurantRegistry: address(restaurantRegistry),
                orderSettlement: address(orderSettlement),
                currencyExchange: address(currencyExchange),
                disputeResolution: address(disputeResolution),
                fraudDetection: address(fraudDetection),
                investorVault: address(investorVault),
                supplierCredit: address(supplierCredit),
                deliveryCoordinator: address(deliveryCoordinator),
                proofOfDelivery: address(proofOfDelivery),
                usdc: address(usdc),
                feeRecipient: feeRecipient
            });
    }

    /// @notice Emergency withdrawal of protocol funds
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
}

/// @notice Protocol statistics structure
struct ProtocolStats {
    uint256 totalRestaurants;
    uint256 totalOrders;
    uint256 totalVolumeUsd6;
    uint256 activeDisputes;
    uint256 totalInvestmentsUsd6;
    uint256 protocolFeesCollectedUsd6;
}

/// @notice Contract addresses structure
struct ContractAddresses {
    address restaurantRegistry;
    address orderSettlement;
    address currencyExchange;
    address disputeResolution;
    address fraudDetection;
    address investorVault;
    address supplierCredit;
    address deliveryCoordinator;
    address proofOfDelivery;
    address usdc;
    address feeRecipient;
}
