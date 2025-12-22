// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title MockUSDC.sol
/// @notice Mock USDC token for testing purposes
/// @dev This is a simple ERC20 implementation for local testing
contract MockUSDC is ERC20, Ownable {
    uint8 private constant DECIMALS = 6;
    
    constructor(
        string memory _name,
        string memory _symbol,
        uint8 _decimals
    ) ERC20(_name, _symbol) {
        require(_decimals == DECIMALS, "Invalid decimals for USDC");
        _mint(msg.sender, 1000000 * 10**DECIMALS); // 1M tokens initially
    }
    
    /// @notice Mint new tokens (owner only)
    /// @param to Address to mint tokens to
    /// @param amount Amount to mint
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
    
    /// @notice Burn tokens
    /// @param amount Amount to burn
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }
    
    /// @notice Override decimals for USDC compatibility
    /// @return 6 USDC has 6 decimal places
    function decimals() public pure override returns (uint8) {
        return DECIMALS;
    }
}