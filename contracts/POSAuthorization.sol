// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * POS Authorization Contract
 * Manages authorized POS devices
 * Prevents unauthorized terminals from processing orders
 */
contract POSAuthorization {
    struct DeviceInfo {
        string deviceId; // Unique device identifier
        bool active; // Authorization status
        uint256 authorizedAt; // Timestamp of authorization
        address authorizedBy; // Admin who authorized
    }

    mapping(address => DeviceInfo) public devices;
    mapping(address => bool) public admins;
    address public superAdmin;

    event DeviceAuthorized(
        address indexed deviceWallet,
        string deviceId,
        address indexed authorizedBy
    );
    event DeviceDeactivated(
        address indexed deviceWallet,
        address indexed deactivatedBy
    );
    event AdminAdded(address indexed admin, address indexed addedBy);
    event AdminRemoved(address indexed admin, address indexed removedBy);

    modifier onlySuperAdmin() {
        require(msg.sender == superAdmin, "Only super admin");
        _;
    }

    modifier onlyAdmin() {
        require(admins[msg.sender] || msg.sender == superAdmin, "Only admin");
        _;
    }

    constructor() {
        superAdmin = msg.sender;
        admins[msg.sender] = true;
    }

    /**
     * Authorize a POS device
     */
    function authorizeDevice(
        address deviceWallet,
        string memory deviceId
    ) public onlyAdmin {
        require(deviceWallet != address(0), "Invalid wallet");
        require(bytes(deviceId).length > 0, "Invalid device ID");

        devices[deviceWallet] = DeviceInfo({
            deviceId: deviceId,
            active: true,
            authorizedAt: block.timestamp,
            authorizedBy: msg.sender
        });

        emit DeviceAuthorized(deviceWallet, deviceId, msg.sender);
    }

    /**
     * Deactivate a POS device
     */
    function deactivateDevice(address deviceWallet) public onlyAdmin {
        require(devices[deviceWallet].active, "Device not active");

        devices[deviceWallet].active = false;

        emit DeviceDeactivated(deviceWallet, msg.sender);
    }

    /**
     * Check if device is authorized
     * POS calls this before processing orders
     */
    function isAuthorized(address deviceWallet) public view returns (bool) {
        return devices[deviceWallet].active;
    }

    /**
     * Get device info
     */
    function getDeviceInfo(
        address deviceWallet
    )
        public
        view
        returns (
            string memory deviceId,
            bool active,
            uint256 authorizedAt,
            address authorizedBy
        )
    {
        DeviceInfo memory info = devices[deviceWallet];
        return (
            info.deviceId,
            info.active,
            info.authorizedAt,
            info.authorizedBy
        );
    }

    /**
     * Add admin
     */
    function addAdmin(address admin) public onlySuperAdmin {
        require(admin != address(0), "Invalid address");
        admins[admin] = true;
        emit AdminAdded(admin, msg.sender);
    }

    /**
     * Remove admin
     */
    function removeAdmin(address admin) public onlySuperAdmin {
        admins[admin] = false;
        emit AdminRemoved(admin, msg.sender);
    }

    /**
     * Change super admin
     */
    function changeSuperAdmin(address newAdmin) public onlySuperAdmin {
        require(newAdmin != address(0), "Invalid address");
        superAdmin = newAdmin;
        admins[newAdmin] = true;
    }
}
