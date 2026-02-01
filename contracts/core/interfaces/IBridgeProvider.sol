// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title IBridgeProvider.sol
/// @notice Interface for cross-chain bridge providers
/// @dev Standard interface for different bridge protocols (LayerZero, Connext, etc.)
interface IBridgeProvider {
    /// @notice Bridge tokens to another chain
    /// @param targetChainId Destination chain ID
    /// @param recipient Recipient address on target chain
    /// @param token Token address on target chain
    /// @param amount Amount to bridge
    /// @param extraData Additional bridge-specific data
    /// @return bridgeTxHash Transaction hash on source chain
    function bridgeTokens(
        uint256 targetChainId,
        address recipient,
        address token,
        uint256 amount,
        bytes calldata extraData
    ) external payable returns (bytes32 bridgeTxHash);

    /// @notice Estimate bridge fee for a transfer
    /// @param targetChainId Destination chain ID
    /// @param amount Amount to bridge
    /// @return fee Estimated fee in native tokens
    function estimateFee(
        uint256 targetChainId,
        uint256 amount
    ) external view returns (uint256 fee);

    /// @notice Check if a chain is supported
    /// @param chainId Chain ID to check
    /// @return supported Whether the chain is supported
    function isChainSupported(uint256 chainId) external view returns (bool supported);

    /// @notice Get bridge provider name
    /// @return name Provider name
    function getProviderName() external pure returns (string memory name);

    /// @notice Get supported tokens for a chain
    /// @param chainId Chain ID
    /// @return tokens Array of supported token addresses
    function getSupportedTokens(uint256 chainId) external view returns (address[] memory tokens);

    /// @notice Get bridge limits for a chain
    /// @param chainId Chain ID
    /// @return minAmount Minimum transfer amount
    /// @return maxAmount Maximum transfer amount
    function getBridgeLimits(uint256 chainId)
        external
        view
        returns (uint256 minAmount, uint256 maxAmount);

    /// @notice Get bridge status for a transaction
    /// @param bridgeTxHash Bridge transaction hash
    /// @return status Bridge status (0=pending, 1=completed, 2=failed)
    /// @return targetTxHash Target chain transaction hash (if completed)
    function getBridgeStatus(bytes32 bridgeTxHash)
        external
        view
        returns (uint8 status, bytes32 targetTxHash);

    // Events that bridge providers should emit
    event TokensBridged(
        bytes32 indexed bridgeTxHash,
        address indexed sender,
        address indexed recipient,
        uint256 sourceChainId,
        uint256 targetChainId,
        address token,
        uint256 amount,
        uint256 fee
    );

    event BridgeCompleted(
        bytes32 indexed bridgeTxHash,
        bytes32 indexed targetTxHash,
        uint256 completedAt
    );

    event BridgeFailed(
        bytes32 indexed bridgeTxHash,
        string reason,
        uint256 failedAt
    );
}