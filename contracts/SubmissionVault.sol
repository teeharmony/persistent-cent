// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title SubmissionVault
 * @notice Fee collection vault for the PCENT ecosystem.
 *         Hunters pay submission fees in USD0.
 *         Fees are deposited into the PCENTVault as backing.
 *         
 *         HOW THE CIRCULAR BACKING WORKS:
 *         
 *         ┌─────────────────────────────────────────────────────┐
 *         │                                                     │
 *         │   USD0                                              │
 *         │    │                                                │
 *         │    ├── User pays submission fee in USD0             │
 *         │    │    → SubmissionVault collects                  │
 *         │    │    → Deposited into PCENTVault                 │
 *         │    │    → PCENTVault holds USD0 as BACKING          │
 *         │    │    → Backing visible on-chain, verifiable      │
 *         │    │                                                │
 *         │    └── Stakers earn yield from vault growth         │
 *         │                                                     │
 *         │   Transparency: Anyone can query PCENTVault.total-  │
 *         │   Assets() to see the USD0 backing at any time.     │
 *         │                                                     │
 *         └─────────────────────────────────────────────────────┘
 *         
 *         Terms: Fee is non-refundable. Hunter consents before
 *         submission. This is a transparent fee-for-service model.
 */
contract SubmissionVault is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 public usd0;
    address public vault; // PCENTVault address

    uint256 public feeAmount;
    uint256 public totalFeesCollected;
    uint256 public totalSubmissions;

    /// @notice submissionId => Submission data
    mapping(uint256 => Submission) public submissions;

    struct Submission {
        address hunter;
        uint256 amount;
        uint256 timestamp;
        bool forwarded; // whether fee was deposited into vault
    }

    event FeePaid(address indexed hunter, uint256 amount, uint256 submissionId);
    event FeeForwarded(uint256 submissionId, uint256 vaultShares);
    event FeeAmountUpdated(uint256 oldFee, uint256 newFee);
    event VaultUpdated(address indexed oldVault, address indexed newVault);

    constructor(address _usd0, uint256 _feeAmount) Ownable(msg.sender) {
        require(_usd0 != address(0), "Invalid USD0 address");
        usd0 = IERC20(_usd0);
        feeAmount = _feeAmount;
    }

    /// @notice Set the PCENTVault address (after deployment)
    function setVault(address _vault) external onlyOwner {
        require(_vault != address(0), "Invalid vault");
        emit VaultUpdated(vault, _vault);
        vault = _vault;
    }

    /// @notice Update submission fee
    function setFeeAmount(uint256 _newFee) external onlyOwner {
        require(_newFee > 0, "Fee must be > 0");
        emit FeeAmountUpdated(feeAmount, _newFee);
        feeAmount = _newFee;
    }

    /// @notice Hunter pays submission fee in USD0
    function payFee(uint256 submissionId) external nonReentrant {
        require(feeAmount > 0, "Fee not set");
        require(submissions[submissionId].hunter == address(0), "Already paid");

        usd0.safeTransferFrom(msg.sender, address(this), feeAmount);

        submissions[submissionId] = Submission({
            hunter: msg.sender,
            amount: feeAmount,
            timestamp: block.timestamp,
            forwarded: false
        });

        totalFeesCollected += feeAmount;
        totalSubmissions++;

        emit FeePaid(msg.sender, feeAmount, submissionId);
    }

    /// @notice Forward collected fees to the PCENTVault as backing
    function forwardToVault(uint256 submissionId) external onlyOwner {
        require(vault != address(0), "Vault not set");
        Submission storage sub = submissions[submissionId];
        require(sub.hunter != address(0), "Submission not found");
        require(!sub.forwarded, "Already forwarded");

        sub.forwarded = true;

        // Approve vault to pull USD0
        usd0.safeApprove(vault, 0);
        usd0.safeApprove(vault, sub.amount);

        // Deposit into vault — this is where the backing happens
        (bool success, ) = vault.call(
            abi.encodeWithSignature("deposit(uint256)", sub.amount)
        );
        require(success, "Vault deposit failed");

        emit FeeForwarded(submissionId, sub.amount);
    }

    /// @notice Forward all pending fees to vault
    function forwardAll(uint256 _limit) external onlyOwner {
        require(vault != address(0), "Vault not set");
        uint256 forwarded = 0;
        uint256 balance = usd0.balanceOf(address(this));

        if (balance > 0) {
            usd0.safeApprove(vault, 0);
            usd0.safeApprove(vault, balance);
            (bool success, ) = vault.call(
                abi.encodeWithSignature("deposit(uint256)", balance)
            );
            require(success, "Vault deposit failed");
        }
    }

    /// @notice Emergency withdraw USD0 (only if vault not set)
    function emergencyWithdraw(address _to) external onlyOwner {
        require(vault == address(0), "Vault is set, use forward");
        uint256 balance = usd0.balanceOf(address(this));
        if (balance > 0) {
            usd0.safeTransfer(_to, balance);
        }
    }

    /// @notice View vault backing
    function getBacking() external view returns (uint256 usd0Balance, uint256 vaultShares) {
        usd0Balance = usd0.balanceOf(address(this));
        if (vault != address(0)) {
            (bool success, bytes memory data) = vault.staticcall(
                abi.encodeWithSignature("totalAssets()")
            );
            if (success) {
                vaultShares = abi.decode(data, (uint256));
            }
        }
    }
}
