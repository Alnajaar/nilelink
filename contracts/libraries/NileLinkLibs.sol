// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/Address.sol";

/// @title NileLinkLibs.sol
/// @notice Shared libraries and utilities for NileLink Protocol
library NileLinkLibs {
    /// @dev Custom error types for gas efficiency
    error InvalidAddress();
    error InvalidAmount();
    error InvalidRate();
    error RateLimitExceeded();
    error RestaurantNotActive();
    error OrderNotFound();
    error DisputeNotFound();
    error Unauthorized();
    error DeadlineExceeded();
    error AlreadyProcessed();

    /// @dev Constants
    uint256 constant MAX_RATE_LIMIT = 100000 * 10**6; // $100K with 6 decimals
    uint256 constant MIN_RATE_LIMIT = 100 * 10**6; // $100 with 6 decimals
    uint16 constant PROTOCOL_FEE_BPS = 50; // 0.5%
    uint64 constant DISPUTE_DEADLINE = 3 days;
    uint64 constant MAX_RATE_HISTORY = 30 days;

    /// @dev Utility functions
    function validateRateLimit(uint256 limit) internal pure {
        if (limit < MIN_RATE_LIMIT || limit > MAX_RATE_LIMIT) {
            revert InvalidAmount();
        }
    }

    function validateRate(uint256 rate) internal pure {
        if (rate == 0 || rate > 10**12) { // Reasonable bounds for currency rates
            revert InvalidRate();
        }
    }

    function validateAddress(address addr) internal pure {
        if (addr == address(0)) {
            revert InvalidAddress();
        }
    }

    function validateAmount(uint256 amount) internal pure {
        if (amount == 0) {
            revert InvalidAmount();
        }
    }
}