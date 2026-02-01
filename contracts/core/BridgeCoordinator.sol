// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./interfaces/IBridgeProvider.sol";
import "../libraries/NileLinkLibs.sol";

/// @title BridgeCoordinator.sol
/// @notice Multi-chain bridge coordinator for NileLink Protocol
/// @dev Orchestrates cross-chain transfers and messaging
contract BridgeCoordinator is Ownable, Pausable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // Supported bridge providers
    enum BridgeProvider {
        LAYERZERO,
        CONNEXT,
        POLYGON_BRIDGE,
        ARBITRUM_BRIDGE,
        OPTIMISM_BRIDGE
    }

    // Bridge transaction status
    enum BridgeStatus {
        INITIATED,
        IN_TRANSIT,
        COMPLETED,
        FAILED,
        REFUNDED
    }

    // Bridge transaction structure
    struct BridgeTx {
        bytes32 txId;
        address initiator;
        address recipient;
        uint256 sourceChainId;
        uint256 targetChainId;
        address sourceToken;
        address targetToken;
        uint256 amount;
        BridgeProvider provider;
        BridgeStatus status;
        bytes32 sourceTxHash;
        bytes32 targetTxHash;
        uint256 feeAmount;
        bytes extraData;
        uint64 initiatedAt;
        uint64 completedAt;
        uint64 deadline;
    }

    // Chain configuration
    struct ChainConfig {
        uint256 chainId;
        string name;
        bool isActive;
        uint256 maxTransferAmount;
        uint256 minTransferAmount;
        uint256 baseFee;
        address wrappedNativeToken;
        bool supportsNative;
    }

    // Bridge provider configuration
    struct ProviderConfig {
        BridgeProvider provider;
        address providerContract;
        bool isActive;
        uint256 feeMultiplier; // Basis points
        uint256 maxGasLimit;
        mapping(uint256 => bool) supportedChains;
    }

    // State variables
    mapping(bytes32 => BridgeTx) public bridgeTxs;
    mapping(uint256 => ChainConfig) public chainConfigs;
    mapping(BridgeProvider => ProviderConfig) public providerConfigs;

    // Bridge provider interfaces
    mapping(BridgeProvider => IBridgeProvider) public bridgeProviders;

    // Configuration
    uint256 public defaultDeadline = 1 hours;
    uint256 public maxBridgeFee = 5000000; // 5 USDC (6 decimals)
    address public feeRecipient;
    address public usdc;

    // Counters and stats
    uint256 public totalBridged;
    uint256 public activeBridges;
    mapping(uint256 => uint256) public chainVolume; // Volume per chain

    // Events
    event BridgeInitiated(
        bytes32 indexed txId,
        address indexed initiator,
        uint256 sourceChainId,
        uint256 targetChainId,
        uint256 amount,
        BridgeProvider provider
    );

    event BridgeCompleted(
        bytes32 indexed txId,
        bytes32 indexed targetTxHash,
        uint256 completedAt
    );

    event BridgeFailed(bytes32 indexed txId, string reason, uint256 failedAt);

    event ChainAdded(uint256 indexed chainId, string name, bool supportsNative);

    event ProviderUpdated(
        BridgeProvider indexed provider,
        address contractAddress,
        bool isActive
    );

    // Modifiers
    modifier validChain(uint256 chainId) {
        require(chainConfigs[chainId].isActive, "Chain not supported");
        _;
    }

    modifier validProvider(BridgeProvider provider) {
        require(providerConfigs[provider].isActive, "Provider not active");
        _;
    }

    modifier validAmount(uint256 chainId, uint256 amount) {
        ChainConfig memory config = chainConfigs[chainId];
        require(amount >= config.minTransferAmount, "Amount too small");
        require(amount <= config.maxTransferAmount, "Amount too large");
        _;
    }

    constructor(address _usdc, address _feeRecipient) Ownable(msg.sender) {
        NileLinkLibs.validateAddress(_usdc);
        NileLinkLibs.validateAddress(_feeRecipient);

        usdc = _usdc;
        feeRecipient = _feeRecipient;

        // Initialize Ethereum mainnet
        _addChain(
            1,
            "Ethereum",
            true,
            1000000000000,
            1000000,
            1000000,
            address(0)
        ); // 1M-1T USDC

        // Initialize Polygon
        _addChain(
            137,
            "Polygon",
            true,
            1000000000000,
            1000000,
            500000,
            address(0)
        ); // Lower fees on Polygon

        // Initialize Arbitrum
        _addChain(
            42161,
            "Arbitrum",
            false,
            1000000000000,
            1000000,
            300000,
            address(0)
        );

        // Initialize Optimism
        _addChain(
            10,
            "Optimism",
            false,
            1000000000000,
            1000000,
            300000,
            address(0)
        );
    }

    /// @notice Bridge tokens to another chain
    /// @param targetChainId Destination chain ID
    /// @param recipient Recipient address on target chain
    /// @param token Token to bridge (address(0) for native)
    /// @param amount Amount to bridge
    /// @param provider Preferred bridge provider
    /// @param extraData Additional data for the bridge
    function bridgeTokens(
        uint256 targetChainId,
        address recipient,
        address token,
        uint256 amount,
        BridgeProvider provider,
        bytes calldata extraData
    )
        external
        payable
        whenNotPaused
        nonReentrant
        validChain(targetChainId)
        validProvider(provider)
        validAmount(targetChainId, amount)
        returns (bytes32 txId)
    {
        require(recipient != address(0), "Invalid recipient");
        require(amount > 0, "Invalid amount");

        // Generate transaction ID
        txId = keccak256(
            abi.encodePacked(
                msg.sender,
                targetChainId,
                recipient,
                token,
                amount,
                block.timestamp,
                block.number
            )
        );

        // Check if bridge provider supports the target chain
        require(
            providerConfigs[provider].supportedChains[targetChainId],
            "Provider doesn't support target chain"
        );

        // Calculate bridge fee
        uint256 bridgeFee = _calculateBridgeFee(
            provider,
            amount,
            targetChainId
        );

        // Validate payment
        if (token == address(0)) {
            // Native token transfer
            require(
                msg.value >= amount + bridgeFee,
                "Insufficient native payment"
            );
        } else {
            // ERC20 transfer
            require(msg.value >= bridgeFee, "Insufficient fee payment");
            IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
        }

        // Transfer fee to recipient
        if (bridgeFee > 0) {
            payable(feeRecipient).transfer(bridgeFee);
        }

        // Create bridge transaction record
        bridgeTxs[txId] = BridgeTx({
            txId: txId,
            initiator: msg.sender,
            recipient: recipient,
            sourceChainId: block.chainid,
            targetChainId: targetChainId,
            sourceToken: token,
            targetToken: _getTargetToken(token, targetChainId),
            amount: amount,
            provider: provider,
            status: BridgeStatus.INITIATED,
            sourceTxHash: bytes32(0),
            targetTxHash: bytes32(0),
            feeAmount: bridgeFee,
            extraData: extraData,
            initiatedAt: uint64(block.timestamp),
            completedAt: 0,
            deadline: uint64(block.timestamp + defaultDeadline)
        });

        totalBridged += amount;
        activeBridges++;
        chainVolume[targetChainId] += amount;

        emit BridgeInitiated(
            txId,
            msg.sender,
            block.chainid,
            targetChainId,
            amount,
            provider
        );

        // Execute the bridge
        _executeBridge(txId);

        return txId;
    }

    /// @notice Complete a bridge transaction (called by bridge provider)
    /// @param txId Bridge transaction ID
    /// @param targetTxHash Transaction hash on target chain
    function completeBridge(
        bytes32 txId,
        bytes32 targetTxHash
    ) external whenNotPaused {
        BridgeTx storage bTx = bridgeTxs[txId];
        require(bTx.initiatedAt > 0, "Transaction not found");
        require(
            bTx.status == BridgeStatus.INITIATED ||
                bTx.status == BridgeStatus.IN_TRANSIT,
            "Invalid status"
        );
        require(
            msg.sender == address(bridgeProviders[bTx.provider]),
            "Unauthorized provider"
        );

        bTx.status = BridgeStatus.COMPLETED;
        bTx.targetTxHash = targetTxHash;
        bTx.completedAt = uint64(block.timestamp);

        activeBridges--;

        emit BridgeCompleted(txId, targetTxHash, bTx.completedAt);
    }

    /// @notice Fail a bridge transaction
    /// @param txId Bridge transaction ID
    /// @param reason Failure reason
    function failBridge(bytes32 txId, string calldata reason) external {
        BridgeTx storage bTx = bridgeTxs[txId];
        require(bTx.initiatedAt > 0, "Transaction not found");
        require(
            msg.sender == address(bridgeProviders[bTx.provider]) ||
                msg.sender == owner(),
            "Unauthorized"
        );

        bTx.status = BridgeStatus.FAILED;

        // Attempt refund if within deadline
        if (block.timestamp <= bTx.deadline) {
            _refundBridge(bTx);
        }

        activeBridges--;

        emit BridgeFailed(txId, reason, uint64(block.timestamp));
    }

    /// @notice Get bridge transaction details
    /// @param txId Bridge transaction ID
    function getBridgeTx(
        bytes32 txId
    )
        external
        view
        returns (
            address initiator,
            address recipient,
            uint256 sourceChainId,
            uint256 targetChainId,
            uint256 amount,
            BridgeProvider provider,
            BridgeStatus status,
            uint64 initiatedAt,
            uint64 completedAt
        )
    {
        BridgeTx storage bTx = bridgeTxs[txId];
        return (
            bTx.initiator,
            bTx.recipient,
            bTx.sourceChainId,
            bTx.targetChainId,
            bTx.amount,
            bTx.provider,
            bTx.status,
            bTx.initiatedAt,
            bTx.completedAt
        );
    }

    /// @notice Get supported chains
    function getSupportedChains()
        external
        view
        returns (uint256[] memory chainIds)
    {
        uint256 count = 0;
        uint256[] memory tempChains = new uint256[](10); // Reasonable max

        for (uint256 i = 1; i <= 42161; i++) {
            // Check common chain IDs
            if (chainConfigs[i].isActive) {
                tempChains[count] = i;
                count++;
            }
        }

        chainIds = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            chainIds[i] = tempChains[i];
        }

        return chainIds;
    }

    /// @notice Check if a bridge route is available
    /// @param sourceChainId Source chain ID
    /// @param targetChainId Target chain ID
    /// @param provider Bridge provider
    function isBridgeAvailable(
        uint256 sourceChainId,
        uint256 targetChainId,
        BridgeProvider provider
    ) external view returns (bool) {
        return
            chainConfigs[sourceChainId].isActive &&
            chainConfigs[targetChainId].isActive &&
            providerConfigs[provider].isActive &&
            providerConfigs[provider].supportedChains[targetChainId];
    }

    // Admin functions

    /// @notice Add a supported chain
    /// @param chainId Chain ID
    /// @param name Chain name
    /// @param supportsNative Whether chain supports native token bridging
    /// @param maxTransfer Maximum transfer amount
    /// @param minTransfer Minimum transfer amount
    /// @param baseFee Base bridge fee
    /// @param wrappedNative Wrapped native token address
    function addChain(
        uint256 chainId,
        string calldata name,
        bool supportsNative,
        uint256 maxTransfer,
        uint256 minTransfer,
        uint256 baseFee,
        address wrappedNative
    ) external onlyOwner {
        _addChain(
            chainId,
            name,
            supportsNative,
            maxTransfer,
            minTransfer,
            baseFee,
            wrappedNative
        );
    }

    /// @notice Configure bridge provider
    /// @param provider Bridge provider enum
    /// @param contractAddress Provider contract address
    /// @param isActive Whether provider is active
    /// @param feeMultiplier Fee multiplier in basis points
    /// @param supportedChains Array of supported chain IDs
    function configureProvider(
        BridgeProvider provider,
        address contractAddress,
        bool isActive,
        uint256 feeMultiplier,
        uint256[] calldata supportedChains
    ) external onlyOwner {
        NileLinkLibs.validateAddress(contractAddress);

        ProviderConfig storage config = providerConfigs[provider];
        config.provider = provider;
        config.providerContract = contractAddress;
        config.isActive = isActive;
        config.feeMultiplier = feeMultiplier;

        // Update supported chains
        for (uint256 i = 0; i < supportedChains.length; i++) {
            config.supportedChains[supportedChains[i]] = true;
        }

        // Set bridge provider interface
        bridgeProviders[provider] = IBridgeProvider(contractAddress);

        emit ProviderUpdated(provider, contractAddress, isActive);
    }

    /// @notice Update bridge parameters
    function updateBridgeParams(
        uint256 _defaultDeadline,
        uint256 _maxBridgeFee,
        address _feeRecipient
    ) external onlyOwner {
        defaultDeadline = _defaultDeadline;
        maxBridgeFee = _maxBridgeFee;

        if (_feeRecipient != address(0)) {
            feeRecipient = _feeRecipient;
        }
    }

    /// @notice Emergency pause all bridging
    function emergencyPause() external onlyOwner {
        _pause();
    }

    /// @notice Emergency unpause bridging
    function emergencyUnpause() external onlyOwner {
        _unpause();
    }

    // Internal functions

    /// @dev Add a supported chain
    function _addChain(
        uint256 chainId,
        string memory name,
        bool supportsNative,
        uint256 maxTransfer,
        uint256 minTransfer,
        uint256 baseFee,
        address wrappedNative
    ) internal {
        chainConfigs[chainId] = ChainConfig({
            chainId: chainId,
            name: name,
            isActive: true,
            maxTransferAmount: maxTransfer,
            minTransferAmount: minTransfer,
            baseFee: baseFee,
            wrappedNativeToken: wrappedNative,
            supportsNative: supportsNative
        });

        emit ChainAdded(chainId, name, supportsNative);
    }

    /// @dev Calculate bridge fee
    function _calculateBridgeFee(
        BridgeProvider provider,
        uint256 amount,
        uint256 targetChainId
    ) internal view returns (uint256) {
        ChainConfig memory chainConfig = chainConfigs[targetChainId];
        ProviderConfig storage providerConfig = providerConfigs[provider];

        uint256 baseFee = chainConfig.baseFee;
        uint256 multiplierFee = (amount * providerConfig.feeMultiplier) / 10000; // Convert basis points

        uint256 totalFee = baseFee + multiplierFee;
        return totalFee > maxBridgeFee ? maxBridgeFee : totalFee;
    }

    /// @dev Get target token address for cross-chain transfer
    function _getTargetToken(
        address sourceToken,
        uint256 targetChainId
    ) internal view returns (address) {
        if (sourceToken == address(0)) {
            // Native token - return wrapped version on target chain
            return chainConfigs[targetChainId].wrappedNativeToken;
        }

        // For now, assume same token address (would need token registry in production)
        return sourceToken;
    }

    /// @dev Execute the bridge through provider
    function _executeBridge(bytes32 txId) internal {
        BridgeTx storage bTx = bridgeTxs[txId];
        IBridgeProvider provider = bridgeProviders[bTx.provider];

        try
            provider.bridgeTokens(
                bTx.targetChainId,
                bTx.recipient,
                bTx.targetToken,
                bTx.amount,
                bTx.extraData
            )
        returns (bytes32 bridgeTxHash) {
            bTx.status = BridgeStatus.IN_TRANSIT;
            bTx.sourceTxHash = bridgeTxHash;
        } catch {
            bTx.status = BridgeStatus.FAILED;
            activeBridges--;

            emit BridgeFailed(
                txId,
                "Bridge execution failed",
                uint64(block.timestamp)
            );
        }
    }

    /// @dev Refund failed bridge transaction
    function _refundBridge(BridgeTx storage bTx) internal {
        if (bTx.sourceToken == address(0)) {
            // Refund native tokens
            payable(bTx.initiator).transfer(bTx.amount);
        } else {
            // Refund ERC20 tokens
            IERC20(bTx.sourceToken).safeTransfer(bTx.initiator, bTx.amount);
        }

        bTx.status = BridgeStatus.REFUNDED;
    }

    /// @notice Emergency withdrawal of stuck funds
    function emergencyWithdraw(
        address token,
        address to,
        uint256 amount
    ) external onlyOwner {
        if (token == address(0)) {
            payable(to).transfer(amount);
        } else {
            IERC20(token).safeTransfer(to, amount);
        }
    }
}
