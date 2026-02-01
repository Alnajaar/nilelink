// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title LoyaltyToken
 * @notice ERC-20 token for NileLink loyalty program
 * @dev Implements ERC20 with role-based access for loyalty rewards
 */
contract LoyaltyToken is ERC20, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant GOVERNANCE_ROLE = keccak256("GOVERNANCE_ROLE");

    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10 ** 18; // 1 billion tokens
    uint256 public constant INITIAL_REWARD_RATE = 100 * 10 ** 18; // 100 tokens per transaction

    bool public paused;

    struct VestingSchedule {
        uint256 totalAmount;
        uint256 releasedAmount;
        uint256 startTime;
        uint256 duration;
        bool revocable;
    }

    mapping(address => VestingSchedule) public vestingSchedules;
    mapping(address => uint256) public lastRewardClaim;

    event TokensMinted(address indexed to, uint256 amount, string reason);
    event RewardClaimed(address indexed user, uint256 amount);
    event VestingScheduleCreated(
        address indexed beneficiary,
        uint256 amount,
        uint256 duration
    );
    event VestingRevoked(address indexed beneficiary, uint256 amount);
    event Paused(address account);
    event Unpaused(address account);

    /**
     * @notice Constructor initializes the loyalty token
     */
    constructor() ERC20("NileLink Loyalty", "NLL") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
        _grantRole(GOVERNANCE_ROLE, msg.sender);
    }

    /**
     * @notice Mint tokens for loyalty rewards
     * @param to Recipient address
     * @param amount Amount to mint
     * @param reason Reason for minting
     */
    function mintReward(
        address to,
        uint256 amount,
        string calldata reason
    ) external onlyRole(MINTER_ROLE) {
        require(totalSupply() + amount <= MAX_SUPPLY, "Exceeds max supply");
        _mint(to, amount);
        emit TokensMinted(to, amount, reason);
    }

    /**
     * @notice Claim periodic loyalty rewards
     */
    function claimReward() external {
        require(
            lastRewardClaim[msg.sender] + 1 days <= block.timestamp,
            "Claim too early"
        );

        uint256 rewardAmount = INITIAL_REWARD_RATE;
        require(
            totalSupply() + rewardAmount <= MAX_SUPPLY,
            "Exceeds max supply"
        );

        lastRewardClaim[msg.sender] = block.timestamp;
        _mint(msg.sender, rewardAmount);

        emit RewardClaimed(msg.sender, rewardAmount);
    }

    /**
     * @notice Create a vesting schedule for team/suppliers
     * @param beneficiary Address to receive vested tokens
     * @param amount Total amount to vest
     * @param duration Vesting duration in seconds
     * @param revocable Whether the vesting can be revoked
     */
    function createVestingSchedule(
        address beneficiary,
        uint256 amount,
        uint256 duration,
        bool revocable
    ) external onlyRole(GOVERNANCE_ROLE) {
        require(
            vestingSchedules[beneficiary].totalAmount == 0,
            "Vesting already exists"
        );
        require(totalSupply() + amount <= MAX_SUPPLY, "Exceeds max supply");

        vestingSchedules[beneficiary] = VestingSchedule({
            totalAmount: amount,
            releasedAmount: 0,
            startTime: block.timestamp,
            duration: duration,
            revocable: revocable
        });

        emit VestingScheduleCreated(beneficiary, amount, duration);
    }

    /**
     * @notice Release vested tokens
     */
    function releaseVestedTokens() external {
        VestingSchedule storage schedule = vestingSchedules[msg.sender];
        require(schedule.totalAmount > 0, "No vesting schedule");

        uint256 vestedAmount = _calculateVestedAmount(schedule);
        uint256 releasableAmount = vestedAmount - schedule.releasedAmount;

        require(releasableAmount > 0, "No tokens to release");

        schedule.releasedAmount += releasableAmount;
        _mint(msg.sender, releasableAmount);
    }

    /**
     * @notice Revoke vesting schedule (if revocable)
     * @param beneficiary Address whose vesting to revoke
     */
    function revokeVesting(
        address beneficiary
    ) external onlyRole(GOVERNANCE_ROLE) {
        VestingSchedule storage schedule = vestingSchedules[beneficiary];
        require(schedule.revocable, "Vesting not revocable");
        require(
            schedule.totalAmount > schedule.releasedAmount,
            "All tokens released"
        );

        uint256 unreleasedAmount = schedule.totalAmount -
            schedule.releasedAmount;

        // Reset vesting schedule
        schedule.totalAmount = schedule.releasedAmount;

        emit VestingRevoked(beneficiary, unreleasedAmount);
    }

    /**
     * @notice Get vested amount for an address
     * @param beneficiary Address to check
     * @return Vested amount available for release
     */
    function getVestedAmount(
        address beneficiary
    ) external view returns (uint256) {
        VestingSchedule storage schedule = vestingSchedules[beneficiary];
        if (schedule.totalAmount == 0) return 0;

        uint256 vestedAmount = _calculateVestedAmount(schedule);
        return vestedAmount - schedule.releasedAmount;
    }

    /**
     * @notice Pause token transfers in emergency
     */
    function pause() external onlyRole(PAUSER_ROLE) {
        paused = true;
        emit Paused(msg.sender);
    }

    /**
     * @notice Unpause token transfers
     */
    function unpause() external onlyRole(PAUSER_ROLE) {
        paused = false;
        emit Unpaused(msg.sender);
    }

    /**
     * @dev Calculate vested amount based on time elapsed
     */
    function _calculateVestedAmount(
        VestingSchedule memory schedule
    ) internal view returns (uint256) {
        if (block.timestamp < schedule.startTime) return 0;
        if (block.timestamp >= schedule.startTime + schedule.duration) {
            return schedule.totalAmount;
        }

        uint256 timeElapsed = block.timestamp - schedule.startTime;
        return (schedule.totalAmount * timeElapsed) / schedule.duration;
    }

    /**
     * @dev Hook that is called before any transfer of tokens
     */
    function _update(
        address from,
        address to,
        uint256 amount
    ) internal virtual override {
        require(!paused, "ERC20Pausable: token transfer while paused");
        super._update(from, to, amount);
    }
}
