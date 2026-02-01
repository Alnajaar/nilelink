// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "../libraries/NileLinkLibs.sol";
import "../security/interfaces/IAIOracle.sol";

/// @title SupplierRegistry.sol
/// @notice Decentralized supplier registration and verification for NileLink
/// @dev Manages supplier onboarding, KYC, reputation, and compliance
contract SupplierRegistry is Ownable, Pausable, ReentrancyGuard {
    using Address for address;

    // Supplier data structures
    struct Supplier {
        address supplierAddress;
        string businessName;
        string contactName;
        string email;
        string phone;
        string businessType; // manufacturer, distributor, wholesaler, etc.
        string industry;
        bytes2 country; // ISO-3166 alpha-2
        bytes3 localCurrency; // ISO-4217 alpha-3
        SupplierStatus status;
        uint8 reputationScore; // 0-100
        uint64 registeredAt;
        uint64 lastVerifiedAt;
        uint64 lastActiveAt;
        bytes32 metadataCid; // IPFS CID for detailed supplier info
        bytes32 documentsCid; // IPFS CID for KYC documents
        address verifier; // Address that verified this supplier
        mapping(bytes3 => uint256) creditLimits; // Credit limits per currency
    }

    struct VerificationRequest {
        bytes16 requestId;
        address supplier;
        address requester; // Restaurant requesting verification
        VerificationType requestType;
        bytes32 documentsHash; // Hash of submitted documents
        VerificationStatus status;
        uint64 submittedAt;
        uint64 processedAt;
        address processedBy;
        string notes;
        uint256 feeAmount; // Verification fee in native tokens
    }

    // Enums
    enum SupplierStatus {
        PENDING_VERIFICATION,
        ACTIVE,
        SUSPENDED,
        BLACKLISTED,
        INACTIVE
    }

    enum VerificationType {
        BASIC_KYC,
        ENHANCED_DUE_DILIGENCE,
        COMPLIANCE_CHECK,
        CREDIT_ASSESSMENT,
        PRODUCT_CERTIFICATION
    }

    enum VerificationStatus {
        PENDING,
        UNDER_REVIEW,
        APPROVED,
        REJECTED,
        REQUIRES_MORE_INFO
    }

    // State variables
    mapping(address => Supplier) public suppliers;
    mapping(bytes16 => VerificationRequest) public verificationRequests;
    mapping(address => bytes16[]) public supplierRequests;

    // Configuration
    uint256 public verificationFee = 1000000; // 1 USDC (6 decimals)
    uint256 public minReputationScore = 50; // Minimum score to be active
    uint256 public maxVerificationAge = 365 days; // Verification expires after 1 year
    address public feeRecipient;

    // Counters
    uint256 public totalSuppliers;
    uint256 public activeSuppliers;
    bytes16 public nextRequestId = bytes16(uint128(1));

    // Authorized verifiers
    mapping(address => bool) public authorizedVerifiers;

    // AI Oracle for automatic verification
    IAIOracle public aiOracle;

    // Events
    event AISupplierVerificationRequested(
        address indexed supplier,
        bytes32 indexed threatId
    );
    event SupplierRegistered(
        address indexed supplier,
        string businessName,
        bytes2 country,
        uint64 timestamp
    );

    event SupplierVerified(
        address indexed supplier,
        address indexed verifier,
        uint8 reputationScore,
        uint64 timestamp
    );

    event VerificationRequested(
        bytes16 indexed requestId,
        address indexed supplier,
        address indexed requester,
        VerificationType requestType,
        uint64 timestamp
    );

    event VerificationProcessed(
        bytes16 indexed requestId,
        VerificationStatus status,
        address indexed processedBy,
        uint64 timestamp
    );

    event SupplierStatusChanged(
        address indexed supplier,
        SupplierStatus oldStatus,
        SupplierStatus newStatus,
        uint64 timestamp
    );

    event CreditLimitUpdated(
        address indexed supplier,
        bytes3 indexed currency,
        uint256 oldLimit,
        uint256 newLimit,
        uint64 timestamp
    );

    // Modifiers
    modifier onlyAuthorizedVerifier() {
        require(
            authorizedVerifiers[msg.sender] || owner() == msg.sender,
            "Not authorized verifier"
        );
        _;
    }

    modifier supplierExists(address supplier) {
        require(
            suppliers[supplier].registeredAt > 0,
            "Supplier not registered"
        );
        _;
    }

    // Constructor
    constructor(address _feeRecipient) Ownable(msg.sender) {
        NileLinkLibs.validateAddress(_feeRecipient);
        feeRecipient = _feeRecipient;
        authorizedVerifiers[msg.sender] = true; // Owner is always a verifier
    }

    /// @notice Register a new supplier
    /// @param businessName Business/legal name
    /// @param contactName Contact person name
    /// @param email Contact email
    /// @param phone Contact phone
    /// @param businessType Type of business
    /// @param industry Industry sector
    /// @param country Country code (ISO-3166 alpha-2)
    /// @param localCurrency Local currency code (ISO-4217 alpha-3)
    /// @param metadataCid IPFS CID for supplier metadata
    function registerSupplier(
        string calldata businessName,
        string calldata contactName,
        string calldata email,
        string calldata phone,
        string calldata businessType,
        string calldata industry,
        bytes2 country,
        bytes3 localCurrency,
        bytes32 metadataCid
    ) external whenNotPaused {
        require(
            suppliers[msg.sender].registeredAt == 0,
            "Supplier already registered"
        );
        require(bytes(businessName).length > 0, "Business name required");
        require(bytes(email).length > 0, "Email required");
        require(country != bytes2(0), "Country required");
        require(localCurrency != bytes3(0), "Local currency required");

        Supplier storage supplier = suppliers[msg.sender];
        supplier.supplierAddress = msg.sender;
        supplier.businessName = businessName;
        supplier.contactName = contactName;
        supplier.email = email;
        supplier.phone = phone;
        supplier.businessType = businessType;
        supplier.industry = industry;
        supplier.country = country;
        supplier.localCurrency = localCurrency;
        supplier.status = SupplierStatus.PENDING_VERIFICATION;
        supplier.reputationScore = 50; // Start with neutral score
        supplier.registeredAt = uint64(block.timestamp);
        supplier.lastVerifiedAt = 0;
        supplier.lastActiveAt = uint64(block.timestamp);
        supplier.metadataCid = metadataCid;
        supplier.documentsCid = bytes32(0);
        supplier.verifier = address(0);

        totalSuppliers++;
        emit SupplierRegistered(
            msg.sender,
            businessName,
            country,
            uint64(block.timestamp)
        );
    }

    /// @notice Update supplier information
    /// @param contactName New contact name
    /// @param email New email
    /// @param phone New phone
    /// @param metadataCid New metadata CID
    function updateSupplierInfo(
        string calldata contactName,
        string calldata email,
        string calldata phone,
        bytes32 metadataCid
    ) external supplierExists(msg.sender) whenNotPaused {
        Supplier storage supplier = suppliers[msg.sender];
        require(
            supplier.status != SupplierStatus.BLACKLISTED,
            "Supplier blacklisted"
        );

        supplier.contactName = contactName;
        supplier.email = email;
        supplier.phone = phone;
        supplier.metadataCid = metadataCid;
        supplier.lastActiveAt = uint64(block.timestamp);
    }

    /// @notice Request supplier verification
    /// @param supplier Supplier address to verify
    /// @param requestType Type of verification requested
    /// @param documentsHash Hash of submitted KYC documents
    /// @param notes Additional notes
    function requestVerification(
        address supplier,
        VerificationType requestType,
        bytes32 documentsHash,
        string calldata notes
    ) external payable whenNotPaused returns (bytes16 requestId) {
        require(msg.value >= verificationFee, "Insufficient verification fee");

        requestId = nextRequestId;
        nextRequestId = bytes16(uint128(uint128(nextRequestId) + 1));

        verificationRequests[requestId] = VerificationRequest({
            requestId: requestId,
            supplier: supplier,
            requester: msg.sender,
            requestType: requestType,
            documentsHash: documentsHash,
            status: VerificationStatus.PENDING,
            submittedAt: uint64(block.timestamp),
            processedAt: 0,
            processedBy: address(0),
            notes: notes,
            feeAmount: verificationFee
        });

        supplierRequests[supplier].push(requestId);

        // Transfer fee to fee recipient
        payable(feeRecipient).transfer(msg.value);

        emit VerificationRequested(
            requestId,
            supplier,
            msg.sender,
            requestType,
            uint64(block.timestamp)
        );

        return requestId;
    }

    /// @notice Process verification request (verifiers only)
    /// @param requestId Request to process
    /// @param approve Whether to approve the request
    /// @param reputationScore Reputation score to assign (0-100)
    /// @param notes Processing notes
    function processVerification(
        bytes16 requestId,
        bool approve,
        uint8 reputationScore,
        string calldata notes
    ) external onlyAuthorizedVerifier whenNotPaused {
        VerificationRequest storage request = verificationRequests[requestId];
        require(request.submittedAt > 0, "Request not found");
        require(
            request.status == VerificationStatus.PENDING,
            "Request already processed"
        );

        request.processedAt = uint64(block.timestamp);
        request.processedBy = msg.sender;
        request.notes = notes;

        Supplier storage supplier = suppliers[request.supplier];

        if (approve) {
            request.status = VerificationStatus.APPROVED;

            // Update supplier verification status
            supplier.status = SupplierStatus.ACTIVE;
            supplier.reputationScore = reputationScore;
            supplier.lastVerifiedAt = uint64(block.timestamp);
            supplier.verifier = msg.sender;
            supplier.documentsCid = request.documentsHash;

            // Update active supplier count
            if (supplier.status != SupplierStatus.ACTIVE) {
                activeSuppliers++;
            }

            emit SupplierVerified(
                request.supplier,
                msg.sender,
                reputationScore,
                uint64(block.timestamp)
            );
        } else {
            request.status = VerificationStatus.REJECTED;
        }

        emit VerificationProcessed(
            requestId,
            request.status,
            msg.sender,
            uint64(block.timestamp)
        );
    }

    /// @notice Update supplier reputation score
    /// @param supplier Supplier address
    /// @param newScore New reputation score (0-100)
    /// @param reason Reason for score change
    function updateReputationScore(
        address supplier,
        uint8 newScore,
        string calldata reason
    ) external onlyAuthorizedVerifier supplierExists(supplier) whenNotPaused {
        require(newScore <= 100, "Score must be 0-100");

        Supplier storage supplierData = suppliers[supplier];
        uint8 oldScore = supplierData.reputationScore;

        supplierData.reputationScore = newScore;
        supplierData.lastActiveAt = uint64(block.timestamp);

        // Auto-suspend if reputation drops too low
        if (
            newScore < minReputationScore &&
            supplierData.status == SupplierStatus.ACTIVE
        ) {
            supplierData.status = SupplierStatus.SUSPENDED;
            activeSuppliers--;

            emit SupplierStatusChanged(
                supplier,
                SupplierStatus.ACTIVE,
                SupplierStatus.SUSPENDED,
                uint64(block.timestamp)
            );
        }

        // Emit event for reputation change
        emit SupplierVerified(
            supplier,
            msg.sender,
            newScore,
            uint64(block.timestamp)
        );
    }

    /// @notice Set credit limit for supplier
    /// @param supplier Supplier address
    /// @param currency Currency code
    /// @param limit Credit limit amount
    function setCreditLimit(
        address supplier,
        bytes3 currency,
        uint256 limit
    ) external onlyAuthorizedVerifier supplierExists(supplier) whenNotPaused {
        uint256 oldLimit = suppliers[supplier].creditLimits[currency];
        suppliers[supplier].creditLimits[currency] = limit;

        emit CreditLimitUpdated(
            supplier,
            currency,
            oldLimit,
            limit,
            uint64(block.timestamp)
        );
    }

    /// @notice Get supplier credit limit
    /// @param supplier Supplier address
    /// @param currency Currency code
    function getCreditLimit(
        address supplier,
        bytes3 currency
    ) external view returns (uint256) {
        return suppliers[supplier].creditLimits[currency];
    }

    /// @notice Get supplier details
    /// @param supplier Supplier address
    function getSupplier(
        address supplier
    )
        external
        view
        returns (
            string memory businessName,
            string memory contactName,
            string memory email,
            bytes2 country,
            bytes3 localCurrency,
            SupplierStatus status,
            uint8 reputationScore,
            uint64 registeredAt,
            uint64 lastVerifiedAt,
            bytes32 metadataCid,
            bytes32 documentsCid
        )
    {
        Supplier storage s = suppliers[supplier];
        return (
            s.businessName,
            s.contactName,
            s.email,
            s.country,
            s.localCurrency,
            s.status,
            s.reputationScore,
            s.registeredAt,
            s.lastVerifiedAt,
            s.metadataCid,
            s.documentsCid
        );
    }

    /// @notice Get verification request details
    /// @param requestId Request ID
    function getVerificationRequest(
        bytes16 requestId
    )
        external
        view
        returns (
            address supplier,
            address requester,
            VerificationType requestType,
            VerificationStatus status,
            uint64 submittedAt,
            uint64 processedAt,
            string memory notes
        )
    {
        VerificationRequest storage req = verificationRequests[requestId];
        return (
            req.supplier,
            req.requester,
            req.requestType,
            req.status,
            req.submittedAt,
            req.processedAt,
            req.notes
        );
    }

    /// @notice Get all verification requests for a supplier
    /// @param supplier Supplier address
    function getSupplierRequests(
        address supplier
    ) external view returns (bytes16[] memory) {
        return supplierRequests[supplier];
    }

    /// @notice Check if supplier is active and reputable
    /// @param supplier Supplier address
    function isSupplierActive(address supplier) external view returns (bool) {
        Supplier storage s = suppliers[supplier];
        return
            s.registeredAt > 0 &&
            s.status == SupplierStatus.ACTIVE &&
            s.reputationScore >= minReputationScore;
    }

    /// @notice Check if supplier verification is current (not expired)
    /// @param supplier Supplier address
    function isVerificationCurrent(
        address supplier
    ) external view returns (bool) {
        Supplier storage s = suppliers[supplier];
        return
            s.lastVerifiedAt > 0 &&
            block.timestamp - s.lastVerifiedAt <= maxVerificationAge;
    }

    // Admin functions

    /// @notice Add or remove authorized verifier
    /// @param verifier Verifier address
    /// @param authorized Whether to authorize
    function setVerifierAuthorization(
        address verifier,
        bool authorized
    ) external onlyOwner {
        authorizedVerifiers[verifier] = authorized;
    }

    /// @notice Update configuration parameters
    /// @param _verificationFee New verification fee
    /// @param _minReputationScore New minimum reputation score
    /// @param _maxVerificationAge New max verification age
    /// @param _feeRecipient New fee recipient
    function updateConfig(
        uint256 _verificationFee,
        uint256 _minReputationScore,
        uint256 _maxVerificationAge,
        address _feeRecipient
    ) external onlyOwner {
        verificationFee = _verificationFee;
        minReputationScore = _minReputationScore;
        maxVerificationAge = _maxVerificationAge;

        if (_feeRecipient != address(0)) {
            feeRecipient = _feeRecipient;
        }
    }

    /// @notice Set the AI Oracle for automated verification
    function setAIOracle(address _aiOracle) external onlyOwner {
        aiOracle = IAIOracle(_aiOracle);
    }

    /// @notice Trigger AI-powered automated verification for a supplier
    /// @param supplier Supplier address to verify
    /// @param metadataCid CID containing business documents and profile
    function verifySupplierWithAI(
        address supplier,
        bytes32 metadataCid
    ) external supplierExists(supplier) whenNotPaused {
        require(address(aiOracle) != address(0), "AI Oracle not set");

        (bool isThreat, uint256 confidence, string memory analysis) = aiOracle
            .analyzeThreat(
                supplier,
                keccak256("SUPPLIER_VERIFICATION"),
                abi.encodePacked(metadataCid),
                0
            );

        if (!isThreat && confidence > 8000) {
            // Auto-approve if AI is confident and sees no threat
            Supplier storage s = suppliers[supplier];
            s.status = SupplierStatus.ACTIVE;
            s.reputationScore = uint8(confidence / 100);
            s.lastVerifiedAt = uint64(block.timestamp);
            s.verifier = address(aiOracle);

            emit SupplierVerified(
                supplier,
                address(aiOracle),
                s.reputationScore,
                uint64(block.timestamp)
            );
        } else {
            // Mark for manual review if AI detected threat or is not confident
            emit AISupplierVerificationRequested(
                supplier,
                keccak256(abi.encodePacked(analysis))
            );
        }
    }

    /// @notice Manually change supplier status (admin only)
    /// @param supplier Supplier address
    /// @param newStatus New status
    function changeSupplierStatus(
        address supplier,
        SupplierStatus newStatus
    ) external onlyOwner supplierExists(supplier) {
        SupplierStatus oldStatus = suppliers[supplier].status;
        suppliers[supplier].status = newStatus;

        // Update active supplier count
        if (
            oldStatus == SupplierStatus.ACTIVE &&
            newStatus != SupplierStatus.ACTIVE
        ) {
            activeSuppliers--;
        } else if (
            oldStatus != SupplierStatus.ACTIVE &&
            newStatus == SupplierStatus.ACTIVE
        ) {
            activeSuppliers++;
        }

        emit SupplierStatusChanged(
            supplier,
            oldStatus,
            newStatus,
            uint64(block.timestamp)
        );
    }

    // Emergency functions

    /// @notice Emergency pause all registry operations
    function emergencyPause() external onlyOwner {
        _pause();
    }

    /// @notice Emergency unpause all registry operations
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
