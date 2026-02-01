// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../core/interfaces/IBridgeProvider.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MockBridgeProvider is IBridgeProvider, Ownable {
    string public providerName;
    mapping(uint256 => bool) public supportedChains;
    mapping(address => bool) public supportedTokens;

    constructor(string memory _name) Ownable(msg.sender) {
        providerName = _name;
    }

    function bridgeTokens(
        uint256 targetChainId,
        address recipient,
        address token,
        uint256 amount,
        bytes calldata /* extraData */
    ) external payable override returns (bytes32 bridgeTxHash) {
        require(supportedChains[targetChainId], "Chain not supported");

        bridgeTxHash = keccak256(
            abi.encodePacked(
                msg.sender,
                targetChainId,
                recipient,
                token,
                amount,
                block.timestamp
            )
        );

        emit TokensBridged(
            bridgeTxHash,
            msg.sender,
            recipient,
            block.chainid,
            targetChainId,
            token,
            amount,
            msg.value
        );

        return bridgeTxHash;
    }

    function estimateFee(
        uint256 /* targetChainId */,
        uint256 /* amount */
    ) external pure override returns (uint256 fee) {
        return 0.01 ether;
    }

    function isChainSupported(
        uint256 chainId
    ) external view override returns (bool supported) {
        return supportedChains[chainId];
    }

    function getProviderName()
        external
        pure
        override
        returns (string memory name)
    {
        return "MockBridgeProvider";
    }

    function getSupportedTokens(
        uint256 /* chainId */
    ) external view override returns (address[] memory tokens) {
        tokens = new address[](1);
        tokens[0] = address(0); // Native only for mock
        return tokens;
    }

    function getBridgeLimits(
        uint256 /* chainId */
    ) external pure override returns (uint256 minAmount, uint256 maxAmount) {
        return (1000, 1000000000000);
    }

    function getBridgeStatus(
        bytes32 bridgeTxHash
    ) external pure override returns (uint8 status, bytes32 targetTxHash) {
        return (1, bridgeTxHash); // Always completed in mock
    }

    // Admin functions
    function setChainSupport(
        uint256 chainId,
        bool supported
    ) external onlyOwner {
        supportedChains[chainId] = supported;
    }
}
