// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract PCENTVault is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 public immutable usd0;
    string public constant name = "PCENT USD0 Backing Vault";
    string public constant symbol = "pUSD0";

    uint256 public totalShares;
    uint256 public totalAssets_;
    uint256 public withdrawalFeeBps = 10;

    mapping(address => uint256) public shares;
    mapping(address => uint256) public lastDepositTimestamp;

    /// @notice Withdrawal queue — tracks index per user to avoid O(n) scans
    mapping(address => WithdrawalRequest) public withdrawalRequests;
    address[] public withdrawalQueue;
    mapping(address => uint256) public queueIndex; // position in queue + 1 (0 = not in queue)

    struct WithdrawalRequest {
        uint256 shares;
        uint256 timestamp;
        bool claimed;
    }

    event Deposited(address indexed user, uint256 usd0Amount, uint256 sharesMinted);
    event WithdrawalRequested(address indexed user, uint256 shares, uint256 timestamp);
    event WithdrawalExecuted(address indexed user, uint256 usd0Amount, uint256 fee);
    event Usd0Withdrawn(address indexed to, uint256 amount);

    constructor(address _usd0) Ownable(msg.sender) {
        require(_usd0 != address(0), "Invalid USD0 address");
        usd0 = IERC20(_usd0);
    }

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

    function requestWithdrawal(uint256 _shareAmount) external nonReentrant {
        require(_shareAmount > 0, "Amount must be > 0");
        require(shares[msg.sender] >= _shareAmount, "Insufficient shares");
        require(
            withdrawalRequests[msg.sender].shares == 0 || withdrawalRequests[msg.sender].claimed,
            "Pending withdrawal exists"
        );
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

        // Track queue position for O(1) removal
        if (queueIndex[msg.sender] == 0) {
            withdrawalQueue.push(msg.sender);
            queueIndex[msg.sender] = withdrawalQueue.length; // 1-indexed
        }

        emit WithdrawalRequested(msg.sender, _shareAmount, block.timestamp);
    }

    function executeWithdrawal() external nonReentrant {
        WithdrawalRequest storage req = withdrawalRequests[msg.sender];
        require(req.shares > 0, "No withdrawal request");
        require(!req.claimed, "Already claimed");
        require(block.timestamp >= req.timestamp + 3 days, "Withdrawal cooldown");

        uint256 usd0Amount = _convertToAssets(req.shares);
        uint256 fee = (usd0Amount * withdrawalFeeBps) / 10000;
        uint256 usd0AfterFee = usd0Amount - fee;

        req.claimed = true;
        _removeFromQueue(msg.sender);
        totalShares -= req.shares;
        totalAssets_ -= usd0Amount;

        usd0.safeTransfer(msg.sender, usd0AfterFee);
        emit WithdrawalExecuted(msg.sender, usd0AfterFee, fee);
    }

    /// @notice Remove user from queue via swap-pop pattern (O(1))
    function _removeFromQueue(address _user) internal {
        uint256 idx = queueIndex[_user];
        if (idx == 0) return;
        uint256 lastIdx = withdrawalQueue.length - 1;
        if (idx - 1 != lastIdx) {
            address lastUser = withdrawalQueue[lastIdx];
            withdrawalQueue[idx - 1] = lastUser;
            queueIndex[lastUser] = idx;
        }
        withdrawalQueue.pop();
        delete queueIndex[_user];
    }

    function _convertToShares(uint256 _usd0Amount) internal view returns (uint256) {
        if (totalAssets_ == 0 || totalShares == 0) return _usd0Amount;
        return (_usd0Amount * totalShares) / totalAssets_;
    }

    function _convertToAssets(uint256 _shares) internal view returns (uint256) {
        if (totalShares == 0) return 0;
        return (_shares * totalAssets_) / totalShares;
    }

    function convertToAssets(uint256 _shares) external view returns (uint256) {
        return _convertToAssets(_shares);
    }

    function convertToShares(uint256 _usd0Amount) external view returns (uint256) {
        return _convertToShares(_usd0Amount);
    }

    function totalAssets() external view returns (uint256) {
        return totalAssets_;
    }

    /// @notice Withdraw actual USD0 fees (not ETH). Use for treasury management.
    function withdrawUsd0(uint256 _amount, address _to) external onlyOwner {
        require(_to != address(0), "Invalid recipient");
        require(_amount > 0, "Amount must be > 0");
        require(_amount <= totalAssets_, "Insufficient vault reserves");
        totalAssets_ -= _amount;
        usd0.safeTransfer(_to, _amount);
        emit Usd0Withdrawn(_to, _amount);
    }

    function setWithdrawalFee(uint256 _bps) external onlyOwner {
        require(_bps <= 200, "Max 2%");
        withdrawalFeeBps = _bps;
    }

    function processQueue(uint256 _count) external onlyOwner {
        uint256 processed = 0;
        for (uint256 i = 0; i < withdrawalQueue.length && processed < _count; ) {
            address user = withdrawalQueue[i];
            WithdrawalRequest storage req = withdrawalRequests[user];
            if (!req.claimed && block.timestamp >= req.timestamp + 3 days) {
                uint256 usd0Amount = _convertToAssets(req.shares);
                uint256 fee = (usd0Amount * withdrawalFeeBps) / 10000;
                uint256 usd0AfterFee = usd0Amount - fee;
                req.claimed = true;
                _removeFromQueue(user);
                totalShares -= req.shares;
                totalAssets_ -= usd0Amount;
                usd0.safeTransfer(user, usd0AfterFee);
                emit WithdrawalExecuted(user, usd0AfterFee, fee);
                processed++;
            } else {
                unchecked { i++; }
            }
        }
    }

    function getQueueLength() external view returns (uint256) {
        return withdrawalQueue.length;
    }

    receive() external payable {}
}
