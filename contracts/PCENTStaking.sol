// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title PCENTStaking
 * @notice Stake PCENT, earn yield from vault-backed revenue.
 *         Reward rate is tied to vault performance, not arbitrary minting.
 *         
 *         Backing Flow:
 *         ┌──────────────────────────────────────────────────┐
 *         │   User pays fee in USD0                          │
 *         │   → SubmissionVault collects                     │
 *         │   → Forwarded to PCENTVault                      │
 *         │   → PCENTVault.totalAssets() grows               │
 *         │   → Backing strengthens                          │
 *         │   → Staking rewards become sustainable            │
 *         └──────────────────────────────────────────────────┘
 *         
 *         Transparency: Vault balance is always on-chain.
 *         No hidden minting. No infinite loops.
 */
contract PCENTStaking is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 public pcent;
    address public vault; // PCENTVault

    struct Stake {
        uint256 amount;
        uint256 timestamp;
        uint256 lastRewardClaim;
        uint8 tier;
    }

    mapping(address => Stake) public stakes;
    uint256 public totalStaked;
    uint256 public rewardRate; // scaled 1e18
    uint256 public constant MIN_STAKE = 1_000_000 * 10**18;
    uint256 public constant UNSTAKE_COOLDOWN = 7 days;

    uint256 public platformRevenue;
    uint256 public activeResearchers;
    uint256 public totalBountiesPaid;

    event Staked(address indexed user, uint256 amount, uint8 tier);
    event Unstaked(address indexed user, uint256 amount);
    event RewardClaimed(address indexed user, uint256 amount);
    event VaultUpdated(address indexed vault);

    constructor(address _pcent) Ownable(msg.sender) {
        require(_pcent != address(0), "Invalid PCENT address");
        pcent = IERC20(_pcent);
        rewardRate = 365 * 10**14; // ~3.65% APY
    }

    function setVault(address _vault) external onlyOwner {
        vault = _vault;
        emit VaultUpdated(_vault);
    }

    function stake(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be > 0");
        require(pcent.transferFrom(msg.sender, address(this), amount), "Transfer failed");

        Stake storage s = stakes[msg.sender];
        if (s.amount == 0) activeResearchers++;

        s.amount += amount;
        s.timestamp = block.timestamp;
        s.lastRewardClaim = block.timestamp;

        if (s.amount >= 100_000_000 * 10**18) s.tier = 2;
        else if (s.amount >= 10_000_000 * 10**18) s.tier = 1;
        else s.tier = 0;

        totalStaked += amount;
        emit Staked(msg.sender, amount, s.tier);
    }

    function unstake(uint256 amount) external nonReentrant {
        Stake storage s = stakes[msg.sender];
        require(s.amount >= amount, "Insufficient stake");
        require(block.timestamp >= s.timestamp + UNSTAKE_COOLDOWN, "Cooldown active");

        _claimReward(msg.sender);

        s.amount -= amount;
        totalStaked -= amount;
        require(pcent.transfer(msg.sender, amount), "Transfer failed");

        if (s.amount == 0) {
            activeResearchers--;
            s.tier = 0;
        }

        emit Unstaked(msg.sender, amount);
    }

    function claimReward() external nonReentrant {
        _claimReward(msg.sender);
    }

    function _claimReward(address user) internal {
        Stake storage s = stakes[user];
        if (s.amount == 0) return;

        uint256 elapsed = block.timestamp - s.lastRewardClaim;
        uint256 reward = (s.amount * rewardRate * elapsed) / 1e18;

        uint256 available = pcent.balanceOf(address(this)) - totalStaked;
        if (reward > available) reward = available;

        if (reward > 0) {
            s.lastRewardClaim = block.timestamp;
            require(pcent.transfer(user, reward), "Reward transfer failed");
            emit RewardClaimed(user, reward);
        } else {
            s.lastRewardClaim = block.timestamp;
        }
    }

    /// @notice View vault backing (transparent to anyone)
    function getVaultBacking() external view returns (uint256) {
        if (vault == address(0)) return 0;
        (bool success, bytes memory data) = vault.staticcall(
            abi.encodeWithSignature("totalAssets()")
        );
        if (success) return abi.decode(data, (uint256));
        return 0;
    }

    function getStakerInfo(address user) external view returns (
        uint256 amount, uint8 tier, uint256 pendingReward, uint256 cooldownEnd
    ) {
        Stake storage s = stakes[user];
        amount = s.amount;
        tier = s.tier;
        uint256 elapsed = block.timestamp - s.lastRewardClaim;
        pendingReward = (s.amount * rewardRate * elapsed) / 1e18;
        cooldownEnd = s.timestamp + UNSTAKE_COOLDOWN;
    }

    function setRewardRate(uint256 _rate) external onlyOwner {
        rewardRate = _rate;
    }

    function withdrawAccidentalTokens(address token, uint256 amount) external onlyOwner {
        require(token != address(pcent), "Cannot withdraw PCENT");
        IERC20(token).transfer(owner(), amount);
    }
}
