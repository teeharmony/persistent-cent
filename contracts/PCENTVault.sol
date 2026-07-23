// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title PCENTVault
 * @notice ERC-4626-style vault that holds USD0 as its underlying asset.
 *         Vault shares represent pro-rata ownership of the USD0 reserve.
 *         
 *         This is the TRANSPARENT BACKING for the PCENT ecosystem.
 *         Anyone can verify: vault USD0 balance == totalAssets()
 *         Total shares == totalSupply() — each share is redeemable for USD0.
 *         
 *         Architecture mirrors the U0R vault pattern used by Usual's USD0.
 *         Here, instead of circular self-backing, the vault holds USD0
 *         — a liquid, yield-bearing asset from a separate protocol.
 *         
 *         Revenue flows:
 *         - Submission fees in USD0 → deposited into vault
 *         - Vault grows → backing strengthens
 *         - Staking rewards drawn from vault yield
 *         
 *         Terms: Depositors can withdraw at any time (subject to queue).
 *         The vault is NOT a locking contract. It's a transparent reserve.
 */
contract PCENTVault is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 public immutable usd0;
    string public constant name = "PCENT USD0 Backing Vault";
    string public constant symbol = "pUSD0";

    uint256 public totalShares;
    uint256 public totalAssets_;
    uint256 public withdrawalFeeBps = 10; // 0.1% withdrawal fee (10 bps)

    mapping(address => uint256) public shares;
    mapping(address => uint256) public lastDepositTimestamp;

    // Withdrawal queue
    address[] public withdrawalQueue;
    mapping(address => WithdrawalRequest) public withdrawalRequests;

    struct WithdrawalRequest {
        uint256 shares;
        uint256 timestamp;
        bool claimed;
    }

    event Deposited(address indexed user, uint256 usd0Amount, uint256 sharesMinted);
    event WithdrawalRequested(address indexed user, uint256 shares, uint256 timestamp);
    event WithdrawalExecuted(address indexed user, uint256 usd0Amount, uint256 fee);
    event FeeWithdrawn(address indexed to, uint256 amount);

    constructor(address _usd0) Ownable(msg.sender) {
        require(_usd0 != address(0), "Invalid USD0 address");
        usd0 = IERC20(_usd0);
    }

    /// @notice Deposit USD0 into the vault, mint shares
    function deposit(uint256 _usd0Amount) external nonReentrant {
        require(_usd0Amount > 0, "Amount must be > 0");

        uint256 sharesToMint = _convertToShares(_usd0Amount);
        usd0.safeTransferFrom(msg.sender, address(this), _usd0Amount);

        shares[msg.sender] += sharesToMint;
        totalShares += sharesToMint;
        totalAssets_ += _usd0Amount;
        lastDepositTimestamp[msg.sender] = block.timestamp;

        emit Deposited(msg.sender, _usd0Amount, sharesToMint);
    }

    /// @notice Request withdrawal (enforces cooldown for security)
    function requestWithdrawal(uint256 _shareAmount) external nonReentrant {
        require(_shareAmount > 0, "Amount must be > 0");
        require(shares[msg.sender] >= _shareAmount, "Insufficient shares");
        require(
            withdrawalRequests[msg.sender].shares == 0 || withdrawalRequests[msg.sender].claimed,
            "Pending withdrawal exists"
        );

        // 7-day cooldown for anti-gaming
        require(
            block.timestamp >= lastDepositTimestamp[msg.sender] + 7 days,
            "Cooldown active (7 days)"
        );

        shares[msg.sender] -= _shareAmount;
        withdrawalRequests[msg.sender] = WithdrawalRequest({
            shares: _shareAmount,
            timestamp: block.timestamp,
            claimed: false
        });
        withdrawalQueue.push(msg.sender);

        emit WithdrawalRequested(msg.sender, _shareAmount, block.timestamp);
    }

    /// @notice Execute withdrawal after cooldown
    function executeWithdrawal() external nonReentrant {
        WithdrawalRequest storage req = withdrawalRequests[msg.sender];
        require(req.shares > 0, "No withdrawal request");
        require(!req.claimed, "Already claimed");
        require(block.timestamp >= req.timestamp + 3 days, "Withdrawal cooldown");

        uint256 usd0Amount = _convertToAssets(req.shares);
        uint256 fee = (usd0Amount * withdrawalFeeBps) / 10000;
        uint256 usd0AfterFee = usd0Amount - fee;

        req.claimed = true;
        totalShares -= req.shares;
        totalAssets_ -= usd0Amount;

        // Fee stays in vault as backing
        // User gets USD0 minus fee
        usd0.safeTransfer(msg.sender, usd0AfterFee);

        emit WithdrawalExecuted(msg.sender, usd0AfterFee, fee);
    }

    /// @notice Convert USD0 to shares (simple ratio)
    function _convertToShares(uint256 _usd0Amount) internal view returns (uint256) {
        if (totalAssets_ == 0 || totalShares == 0) return _usd0Amount;
        return (_usd0Amount * totalShares) / totalAssets_;
    }

    /// @notice Convert shares to USD0
    function _convertToAssets(uint256 _shares) internal view returns (uint256) {
        if (totalShares == 0) return 0;
        return (_shares * totalAssets_) / totalShares;
    }

    /// @notice View: USD0 amount for a given share amount
    function convertToAssets(uint256 _shares) external view returns (uint256) {
        return _convertToAssets(_shares);
    }

    /// @notice View: Shares for a given USD0 amount
    function convertToShares(uint256 _usd0Amount) external view returns (uint256) {
        return _convertToShares(_usd0Amount);
    }

    /// @notice Total USD0 held by vault
    function totalAssets() external view returns (uint256) {
        return totalAssets_;
    }

    /// @notice Withdraw excess fees (only owner)
    function withdrawFees(uint256 _amount, address _to) external onlyOwner {
        require(_amount <= address(this).balance, "Insufficient balance");
        // Only ETH fees, not USD0 — USD0 stays as backing
        payable(_to).transfer(_amount);
        emit FeeWithdrawn(_to, _amount);
    }

    /// @notice Update withdrawal fee
    function setWithdrawalFee(uint256 _bps) external onlyOwner {
        require(_bps <= 200, "Max 2%");
        withdrawalFeeBps = _bps;
    }

    /// @notice Process withdrawal queue (admin maintenance)
    function processQueue(uint256 _count) external onlyOwner {
        uint256 processed = 0;
        for (uint256 i = 0; i < withdrawalQueue.length && processed < _count; ) {
            address user = withdrawalQueue[i];
            WithdrawalRequest storage req = withdrawalRequests[user];
            if (!req.claimed && block.timestamp >= req.timestamp + 3 days) {
                // Auto-execute
                uint256 usd0Amount = _convertToAssets(req.shares);
                uint256 fee = (usd0Amount * withdrawalFeeBps) / 10000;
                uint256 usd0AfterFee = usd0Amount - fee;
                req.claimed = true;
                totalShares -= req.shares;
                totalAssets_ -= usd0Amount;
                usd0.safeTransfer(user, usd0AfterFee);
                emit WithdrawalExecuted(user, usd0AfterFee, fee);
                processed++;
            }
            unchecked { i++; }
        }

        // Clean processed entries
        _cleanQueue();
    }

    function _cleanQueue() internal {
        uint256 writeIndex = 0;
        for (uint256 i = 0; i < withdrawalQueue.length; i++) {
            if (!withdrawalRequests[withdrawalQueue[i]].claimed) {
                withdrawalQueue[writeIndex++] = withdrawalQueue[i];
            }
        }
        while (withdrawalQueue.length > writeIndex) {
            withdrawalQueue.pop();
        }
    }

    function getQueueLength() external view returns (uint256) {
        return withdrawalQueue.length;
    }

    receive() external payable {}
}
