// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * Supplier Commission Contract
 * Stores commission rules for each supplier
 * POS reads these values to calculate splits (no trust needed)
 */
contract SupplierCommission {
    struct CommissionRule {
        uint8 percentage; // e.g., 5 for 5%
        uint256 fixedFee; // In wei (for fixed-fee model)
        bool isPercentage; // true = percentage, false = fixed
        bool active; // Commission rule active status
    }

    mapping(address => CommissionRule) public supplierRules;
    address public superAdmin;

    event CommissionUpdated(
        address indexed supplier,
        uint8 percentage,
        uint256 fixedFee,
        bool isPercentage
    );
    event SuperAdminChanged(address indexed oldAdmin, address indexed newAdmin);

    modifier onlySuperAdmin() {
        require(msg.sender == superAdmin, "Only super admin");
        _;
    }

    constructor() {
        superAdmin = msg.sender;
    }

    /**
     * Get commission for a supplier order
     * POS calls this to calculate splits
     */
    function getCommission(
        address supplier,
        uint256 orderAmount
    ) public view returns (uint256) {
        CommissionRule memory rule = supplierRules[supplier];

        if (!rule.active) return 0;

        if (rule.isPercentage) {
            return (orderAmount * rule.percentage) / 100;
        }

        return rule.fixedFee;
    }

    /**
     * Update commission rule for a supplier
     * Only super admin can call
     */
    function updateRule(
        address supplier,
        uint8 percentage,
        uint256 fixedFee,
        bool isPercentage
    ) public onlySuperAdmin {
        require(percentage <= 100, "Invalid percentage");

        supplierRules[supplier] = CommissionRule({
            percentage: percentage,
            fixedFee: fixedFee,
            isPercentage: isPercentage,
            active: true
        });

        emit CommissionUpdated(supplier, percentage, fixedFee, isPercentage);
    }

    /**
     * Deactivate a supplier's commission rule
     */
    function deactivateRule(address supplier) public onlySuperAdmin {
        supplierRules[supplier].active = false;
    }

    /**
     * Change super admin
     */
    function changeSuperAdmin(address newAdmin) public onlySuperAdmin {
        require(newAdmin != address(0), "Invalid address");
        emit SuperAdminChanged(superAdmin, newAdmin);
        superAdmin = newAdmin;
    }
}
