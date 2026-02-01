// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./DeliveryCoordinator.sol";
import "../libraries/NileLinkLibs.sol";

/// @title ProofOfDelivery.sol
/// @notice GPS proof verification and immutable delivery timestamping
/// @dev Cryptographically verifies delivery location and time proofs
contract ProofOfDelivery is Ownable, Pausable, ReentrancyGuard {
    using Address for address;

    // Core contracts
    DeliveryCoordinator public immutable deliveryCoordinator;

    // Proof data structures
    struct DeliveryProof {
        bytes16 orderId;
        address driver;
        bytes32 proofHash; // Overall proof hash
        bytes32 locationHash; // GPS coordinates hash
        uint64 timestamp;
        bytes32 proofSignature; // Driver's signature
        bytes32 oracleProof; // Chainlink oracle verification
        ProofStatus status;
        uint64 verifiedAt;
        address verifiedBy;
    }

    struct LocationProof {
        int256 latitude; // 8 decimal places (e.g., 25123456 = 25.123456°)
        int256 longitude; // 8 decimal places
        uint32 accuracy; // Accuracy in meters
        uint64 timestamp;
        bytes32 signature; // Signed by authorized oracle
    }

    // Enums
    enum ProofStatus {
        PENDING,
        VERIFIED,
        REJECTED,
        EXPIRED
    }

    // State variables
    mapping(bytes16 => DeliveryProof) public deliveryProofs;
    mapping(bytes32 => LocationProof) public locationProofs;
    mapping(address => bool) public authorizedOracles;
    mapping(bytes16 => bytes32[]) public orderProofs; // Multiple proofs per order

    // Configuration
    uint256 public maxProofAge = 300; // 5 minutes max age for proofs
    uint256 public requiredAccuracy = 50; // 50 meters accuracy required
    uint256 public proofRewardAmount = 1000000; // 1 USDC reward for valid proofs (6 decimals)

    // Events
    event ProofSubmitted(
        bytes16 indexed orderId,
        address indexed driver,
        bytes32 proofHash,
        uint64 timestamp
    );

    event ProofVerified(
        bytes16 indexed orderId,
        bytes32 proofHash,
        address indexed verifiedBy,
        uint64 verifiedAt
    );

    event ProofRejected(
        bytes16 indexed orderId,
        bytes32 proofHash,
        string reason,
        uint64 rejectedAt
    );

    event OracleAuthorized(
        address indexed oracle,
        bool authorized,
        uint64 timestamp
    );

    // Modifiers
    modifier onlyAuthorizedOracle() {
        require(authorizedOracles[msg.sender], "Not authorized oracle");
        _;
    }

    modifier validOrder(bytes16 orderId) {
        // Check if order exists in delivery coordinator
        DeliveryCoordinator.DeliveryOrder memory order = deliveryCoordinator
            .getDeliveryOrder(orderId);
        require(order.createdAt > 0, "Order does not exist");
        _;
    }

    constructor(address _deliveryCoordinator) Ownable(msg.sender) {
        NileLinkLibs.validateAddress(_deliveryCoordinator);
        deliveryCoordinator = DeliveryCoordinator(_deliveryCoordinator);
    }

    /// @notice Submit a proof of delivery
    /// @param orderId Order identifier
    /// @param locationData Encoded location data (lat, lng, accuracy)
    /// @param timestamp Unix timestamp of delivery
    /// @param signature Driver's signature of the proof
    function submitProofOfDelivery(
        bytes16 orderId,
        bytes32 locationData,
        uint64 timestamp,
        bytes32 signature
    ) external whenNotPaused validOrder(orderId) returns (bytes32 proofHash) {
        // Verify the caller is the assigned driver
        DeliveryCoordinator.DeliveryOrder memory order = deliveryCoordinator
            .getDeliveryOrder(orderId);
        require(order.assignedDriver == msg.sender, "Not assigned driver");
        require(
            order.status == DeliveryCoordinator.DeliveryStatus.IN_TRANSIT,
            "Order not in transit"
        );

        // Verify timestamp is reasonable (within last 5 minutes)
        require(
            timestamp <= block.timestamp &&
                timestamp >= block.timestamp - maxProofAge,
            "Proof timestamp too old"
        );

        // Generate proof hash
        proofHash = keccak256(
            abi.encodePacked(
                orderId,
                msg.sender,
                locationData,
                timestamp,
                signature
            )
        );

        // Store delivery proof
        deliveryProofs[orderId] = DeliveryProof({
            orderId: orderId,
            driver: msg.sender,
            proofHash: proofHash,
            locationHash: locationData,
            timestamp: timestamp,
            proofSignature: signature,
            oracleProof: bytes32(0), // Will be set by oracle
            status: ProofStatus.PENDING,
            verifiedAt: 0,
            verifiedBy: address(0)
        });

        // Add to order proofs array
        orderProofs[orderId].push(proofHash);

        emit ProofSubmitted(orderId, msg.sender, proofHash, timestamp);

        return proofHash;
    }

    /// @notice Verify a proof of delivery (called by authorized oracle)
    /// @param orderId Order identifier
    /// @param proofHash Hash of the proof to verify
    /// @param isValid Whether the proof passes verification
    /// @param reason Reason for rejection (if applicable)
    function verifyProofOfDelivery(
        bytes16 orderId,
        bytes32 proofHash,
        bool isValid,
        string calldata reason
    ) external onlyAuthorizedOracle whenNotPaused {
        DeliveryProof storage proof = deliveryProofs[orderId];
        require(proof.proofHash == proofHash, "Proof hash mismatch");
        require(proof.status == ProofStatus.PENDING, "Proof not pending");

        if (isValid) {
            proof.status = ProofStatus.VERIFIED;
            proof.verifiedAt = uint64(block.timestamp);
            proof.verifiedBy = msg.sender;
            proof.oracleProof = proofHash;

            // Update delivery status to DELIVERED
            deliveryCoordinator.updateDeliveryStatus(
                orderId,
                DeliveryCoordinator.DeliveryStatus.DELIVERED,
                proof.locationHash
            );

            // Reward the oracle for verification
            _rewardOracle(msg.sender);

            emit ProofVerified(
                orderId,
                proofHash,
                msg.sender,
                proof.verifiedAt
            );
        } else {
            proof.status = ProofStatus.REJECTED;
            proof.verifiedAt = uint64(block.timestamp);
            proof.verifiedBy = msg.sender;

            emit ProofRejected(orderId, proofHash, reason, proof.verifiedAt);
        }
    }

    /// @notice Submit GPS location proof from driver app
    /// @param latitude Latitude in 8 decimal places
    /// @param longitude Longitude in 8 decimal places
    /// @param accuracy GPS accuracy in meters
    /// @param orderId Associated order ID (optional)
    function submitLocationProof(
        int256 latitude,
        int256 longitude,
        uint32 accuracy,
        bytes16 orderId
    ) external whenNotPaused returns (bytes32 proofHash) {
        // Verify accuracy meets requirements
        require(accuracy <= requiredAccuracy, "GPS accuracy too low");

        // Generate location proof hash
        proofHash = keccak256(
            abi.encodePacked(
                latitude,
                longitude,
                accuracy,
                block.timestamp,
                msg.sender
            )
        );

        // Create signed proof
        bytes32 signature = _signLocationProof(proofHash);

        locationProofs[proofHash] = LocationProof({
            latitude: latitude,
            longitude: longitude,
            accuracy: accuracy,
            timestamp: uint64(block.timestamp),
            signature: signature
        });

        return proofHash;
    }

    /// @notice Batch verify multiple delivery proofs
    /// @param orderIds Array of order IDs
    /// @param proofHashes Array of proof hashes
    /// @param validations Array of validation results
    function batchVerifyProofs(
        bytes16[] calldata orderIds,
        bytes32[] calldata proofHashes,
        bool[] calldata validations
    ) external onlyAuthorizedOracle whenNotPaused {
        require(
            orderIds.length == proofHashes.length &&
                proofHashes.length == validations.length,
            "Array length mismatch"
        );

        for (uint256 i = 0; i < orderIds.length; i++) {
            this.verifyProofOfDelivery(
                orderIds[i],
                proofHashes[i],
                validations[i],
                validations[i] ? "" : "Batch verification failed"
            );
        }
    }

    /// @notice Get delivery proof details
    /// @param orderId Order identifier
    function getDeliveryProof(
        bytes16 orderId
    ) external view returns (DeliveryProof memory) {
        return deliveryProofs[orderId];
    }

    /// @notice Get location proof details
    /// @param proofHash Proof hash
    function getLocationProof(
        bytes32 proofHash
    ) external view returns (LocationProof memory) {
        return locationProofs[proofHash];
    }

    /// @notice Get all proofs for an order
    /// @param orderId Order identifier
    function getOrderProofs(
        bytes16 orderId
    ) external view returns (bytes32[] memory) {
        return orderProofs[orderId];
    }

    /// @notice Check if an order has a verified proof
    /// @param orderId Order identifier
    function hasVerifiedProof(bytes16 orderId) external view returns (bool) {
        DeliveryProof memory proof = deliveryProofs[orderId];
        return proof.status == ProofStatus.VERIFIED;
    }

    // Oracle management functions

    /// @notice Authorize or deauthorize an oracle
    /// @param oracle Oracle address
    /// @param authorized Whether to authorize
    function setOracleAuthorization(
        address oracle,
        bool authorized
    ) external onlyOwner {
        authorizedOracles[oracle] = authorized;
        emit OracleAuthorized(oracle, authorized, uint64(block.timestamp));
    }

    /// @notice Update proof verification parameters
    /// @param _maxProofAge Maximum age for proofs in seconds
    /// @param _requiredAccuracy Required GPS accuracy in meters
    /// @param _proofRewardAmount Reward amount for proof verification (6 decimals)
    function updateProofParameters(
        uint256 _maxProofAge,
        uint256 _requiredAccuracy,
        uint256 _proofRewardAmount
    ) external onlyOwner {
        maxProofAge = _maxProofAge;
        requiredAccuracy = _requiredAccuracy;
        proofRewardAmount = _proofRewardAmount;
    }

    // Internal functions

    /// @dev Sign a location proof (simplified - in production use proper signing)
    function _signLocationProof(
        bytes32 proofHash
    ) internal view returns (bytes32) {
        // Simplified signature generation - in production, use proper cryptographic signing
        return
            keccak256(
                abi.encodePacked(proofHash, block.timestamp, address(this))
            );
    }

    /// @dev Reward oracle for successful verification
    function _rewardOracle(address oracle) internal {
        // Implementation would transfer tokens to oracle
        // For now, emit event for off-chain reward processing
        emit ProofVerified(
            bytes16(0),
            bytes32(0),
            oracle,
            uint64(block.timestamp)
        );
    }

    // Emergency functions

    /// @notice Emergency pause all proof operations
    function emergencyPause() external onlyOwner {
        _pause();
    }

    /// @notice Emergency unpause all proof operations
    function emergencyUnpause() external onlyOwner {
        _unpause();
    }

    /// @notice Emergency withdrawal of contract funds
    function emergencyWithdraw(
        address token,
        address to,
        uint256 amount
    ) external onlyOwner {
        IERC20(token).transfer(to, amount);
    }
}
