// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title EmergencyPause
 * @notice System-wide emergency pause controller for NileLink Protocol
 * @dev Provides emergency stop functionality across all protocol components
 */
contract EmergencyPause is Ownable, ReentrancyGuard {
    // Emergency pause states
    enum PauseLevel {
        NONE, // Normal operation
        MINOR, // Minor issues - some features restricted
        MAJOR, // Major issues - most transactions blocked
        CRITICAL, // Critical issues - only emergency functions allowed
        COMPLETE // Complete shutdown - no operations allowed
    }

    // Current pause level
    PauseLevel public currentPauseLevel;

    // Pause reasons and metadata
    struct PauseEvent {
        PauseLevel level;
        string reason;
        address triggeredBy;
        uint256 timestamp;
        uint256 expectedResolutionTime;
    }

    // Pause history
    PauseEvent[] public pauseHistory;
    mapping(bytes32 => bool) public pausedContracts;
    mapping(address => bool) public emergencyOperators;

    // Authorized contract addresses that can be paused
    address[] public pausableContracts;

    // Events
    event EmergencyPaused(
        PauseLevel level,
        string reason,
        address triggeredBy,
        uint256 timestamp
    );

    event EmergencyUnpaused(address triggeredBy, uint256 timestamp);

    event ContractAddedToPauseList(address contractAddress, uint256 timestamp);

    event EmergencyOperatorAdded(address operator, uint256 timestamp);

    // Modifiers
    modifier onlyEmergencyOperator() {
        require(
            emergencyOperators[msg.sender] || owner() == msg.sender,
            "Not authorized emergency operator"
        );
        _;
    }

    modifier notInCompleteShutdown() {
        require(
            currentPauseLevel != PauseLevel.COMPLETE,
            "System in complete shutdown"
        );
        _;
    }

    /**
     * @notice Initialize emergency pause system
     */
    constructor() Ownable(msg.sender) {
        currentPauseLevel = PauseLevel.NONE;
        emergencyOperators[msg.sender] = true;
    }

    /**
     * @notice Emergency pause the entire system
     * @param level Severity level of the emergency
     * @param reason Detailed reason for the pause
     * @param expectedResolutionTime Expected time to resolve (timestamp)
     */
    function emergencyPause(
        PauseLevel level,
        string calldata reason,
        uint256 expectedResolutionTime
    ) external onlyEmergencyOperator nonReentrant {
        require(
            uint8(level) > uint8(currentPauseLevel),
            "Cannot reduce pause level with emergencyPause"
        );
        require(uint8(level) >= 1 && uint8(level) <= 4, "Invalid pause level");

        currentPauseLevel = level;

        PauseEvent memory pauseEvent = PauseEvent({
            level: level,
            reason: reason,
            triggeredBy: msg.sender,
            timestamp: block.timestamp,
            expectedResolutionTime: expectedResolutionTime
        });

        pauseHistory.push(pauseEvent);

        // Pause all registered contracts if level is CRITICAL or COMPLETE
        if (level >= PauseLevel.CRITICAL) {
            _pauseAllContracts();
        }

        emit EmergencyPaused(level, reason, msg.sender, block.timestamp);
    }

    /**
     * @notice Gradually reduce pause level
     * @param newLevel New pause level (must be lower than current)
     * @param reason Reason for reducing pause level
     */
    function reducePauseLevel(
        PauseLevel newLevel,
        string calldata reason
    ) external onlyEmergencyOperator nonReentrant {
        require(
            uint8(newLevel) < uint8(currentPauseLevel),
            "Cannot increase pause level with reducePauseLevel"
        );

        PauseLevel oldLevel = currentPauseLevel;
        currentPauseLevel = newLevel;

        // Unpause contracts if moving from CRITICAL/COMPLETE to lower level
        if (oldLevel >= PauseLevel.CRITICAL && newLevel < PauseLevel.CRITICAL) {
            _unpauseAllContracts();
        }

        PauseEvent memory pauseEvent = PauseEvent({
            level: newLevel,
            reason: reason,
            triggeredBy: msg.sender,
            timestamp: block.timestamp,
            expectedResolutionTime: 0
        });

        pauseHistory.push(pauseEvent);

        emit EmergencyPaused(newLevel, reason, msg.sender, block.timestamp);
    }

    /**
     * @notice Complete emergency unpause - return to normal operation
     */
    function emergencyUnpause() external onlyEmergencyOperator nonReentrant {
        require(currentPauseLevel != PauseLevel.NONE, "System not paused");

        currentPauseLevel = PauseLevel.NONE;

        // Unpause all contracts
        _unpauseAllContracts();

        emit EmergencyUnpaused(msg.sender, block.timestamp);
    }

    /**
     * @notice Check if system is paused at or above a certain level
     * @param minLevel Minimum pause level to check
     * @return isPaused Whether system is paused at or above the level
     */
    function isPausedAtLevel(PauseLevel minLevel) external view returns (bool) {
        return uint8(currentPauseLevel) >= uint8(minLevel);
    }

    /**
     * @notice Get current system status
     */
    function getSystemStatus()
        external
        view
        returns (
            PauseLevel pauseLevel,
            string memory statusDescription,
            uint256 lastPauseTime,
            uint256 expectedResolutionTime,
            bool isFullyOperational
        )
    {
        PauseEvent memory lastEvent = pauseHistory.length > 0
            ? pauseHistory[pauseHistory.length - 1]
            : PauseEvent({
                level: PauseLevel.NONE,
                reason: "",
                triggeredBy: address(0),
                timestamp: 0,
                expectedResolutionTime: 0
            });

        string memory description;
        if (currentPauseLevel == PauseLevel.NONE) {
            description = "System fully operational";
        } else if (currentPauseLevel == PauseLevel.MINOR) {
            description = "Minor issues - some features restricted";
        } else if (currentPauseLevel == PauseLevel.MAJOR) {
            description = "Major issues - most transactions blocked";
        } else if (currentPauseLevel == PauseLevel.CRITICAL) {
            description = "Critical issues - emergency operations only";
        } else {
            description = "Complete shutdown - no operations allowed";
        }

        return (
            currentPauseLevel,
            description,
            lastEvent.timestamp,
            lastEvent.expectedResolutionTime,
            currentPauseLevel == PauseLevel.NONE
        );
    }

    /**
     * @notice Add contract to pause list
     * @param contractAddress Address of contract that can be paused
     */
    function addPausableContract(address contractAddress) external onlyOwner {
        require(contractAddress != address(0), "Invalid contract address");

        // Check if already in list
        for (uint256 i = 0; i < pausableContracts.length; i++) {
            if (pausableContracts[i] == contractAddress) {
                return;
            }
        }

        pausableContracts.push(contractAddress);

        emit ContractAddedToPauseList(contractAddress, block.timestamp);
    }

    /**
     * @notice Remove contract from pause list
     * @param contractAddress Address to remove
     */
    function removePausableContract(
        address contractAddress
    ) external onlyOwner {
        for (uint256 i = 0; i < pausableContracts.length; i++) {
            if (pausableContracts[i] == contractAddress) {
                pausableContracts[i] = pausableContracts[
                    pausableContracts.length - 1
                ];
                pausableContracts.pop();
                break;
            }
        }
    }

    /**
     * @notice Add emergency operator
     * @param operator Address to add as emergency operator
     */
    function addEmergencyOperator(address operator) external onlyOwner {
        require(operator != address(0), "Invalid operator address");
        emergencyOperators[operator] = true;

        emit EmergencyOperatorAdded(operator, block.timestamp);
    }

    /**
     * @notice Remove emergency operator
     * @param operator Address to remove
     */
    function removeEmergencyOperator(address operator) external onlyOwner {
        emergencyOperators[operator] = false;
    }

    /**
     * @notice Get pause history
     * @param index Index in pause history array
     */
    function getPauseEvent(
        uint256 index
    ) external view returns (PauseEvent memory) {
        require(index < pauseHistory.length, "Index out of bounds");
        return pauseHistory[index];
    }

    /**
     * @notice Get total number of pause events
     */
    function getPauseHistoryLength() external view returns (uint256) {
        return pauseHistory.length;
    }

    /**
     * @notice Get all pausable contracts
     */
    function getPausableContracts() external view returns (address[] memory) {
        return pausableContracts;
    }

    // Internal functions

    /**
     * @dev Pause all registered contracts
     */
    function _pauseAllContracts() internal {
        for (uint256 i = 0; i < pausableContracts.length; i++) {
            address contractAddr = pausableContracts[i];
            pausedContracts[keccak256(abi.encodePacked(contractAddr))] = true;

            // Call pause function on contract (if it exists)
            // This assumes contracts have a standard pause() function
            _callContractPauseFunction(contractAddr, true);
        }
    }

    /**
     * @dev Unpause all registered contracts
     */
    function _unpauseAllContracts() internal {
        for (uint256 i = 0; i < pausableContracts.length; i++) {
            address contractAddr = pausableContracts[i];
            pausedContracts[keccak256(abi.encodePacked(contractAddr))] = false;

            // Call unpause function on contract (if it exists)
            _callContractPauseFunction(contractAddr, false);
        }
    }

    /**
     * @dev Call pause/unpause function on external contract
     * @param contractAddr Contract address
     * @param shouldPause True to pause, false to unpause
     */
    function _callContractPauseFunction(
        address contractAddr,
        bool shouldPause
    ) internal {
        // Low-level call to avoid revert if function doesn't exist
        bytes memory callData = shouldPause
            ? abi.encodeWithSignature("emergencyPause()")
            : abi.encodeWithSignature("emergencyUnpause()");

        (bool success, ) = contractAddr.call(callData);
        // Silently ignore if call fails (contract might not have the function)
        success; // Suppress unused variable warning
    }
}
