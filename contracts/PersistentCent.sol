// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract PersistentCent is ERC20, Ownable, ReentrancyGuard {
    uint256 public constant MAX_SUPPLY = 100_000_000_000 * 10**18;
    uint256 public constant PRESALE_SUPPLY = 30_000_000_000 * 10**18;
    uint256 public constant LIQUIDITY_SUPPLY = 20_000_000_000 * 10**18;
    uint256 public constant TEAM_SUPPLY = 15_000_000_000 * 10**18;
    uint256 public constant MARKETING_SUPPLY = 15_000_000_000 * 10**18;
    uint256 public constant ECOSYSTEM_SUPPLY = 20_000_000_000 * 10**18;

    uint256 public presaleStart;
    uint256 public presaleEnd;
    uint256 public presaleRate;
    uint256 public minPurchase;
    uint256 public maxPurchase;
    uint256 public softCap;
    uint256 public hardCap;
    uint256 public totalRaised;
    bool public presaleFinalized;
    bool public liquidityLocked;
    mapping(address => uint256) public contributions;
    bytes32 public whitelistMerkleRoot;

    event PresalePurchased(address indexed buyer, uint256 amount, uint256 ethContributed);
    event PresaleFinalized(uint256 totalRaised, uint256 tokensSold);
    event LiquidityAdded(uint256 ethAmount, uint256 tokenAmount);
    event WhitelistUpdated(bytes32 newMerkleRoot);

    constructor(
        address _initialOwner,
        uint256 _presaleStart,
        uint256 _presaleEnd,
        uint256 _presaleRate,
        uint256 _minPurchase,
        uint256 _maxPurchase,
        uint256 _softCap,
        uint256 _hardCap
    ) ERC20("Persistent Cent", "PCENT") Ownable(_initialOwner) {
        require(_presaleStart < _presaleEnd, "Invalid presale period");
        require(_presaleRate > 0, "Invalid rate");
        require(_softCap <= _hardCap, "Soft cap exceeds hard cap");
        presaleStart = _presaleStart;
        presaleEnd = _presaleEnd;
        presaleRate = _presaleRate;
        minPurchase = _minPurchase;
        maxPurchase = _maxPurchase;
        softCap = _softCap;
        hardCap = _hardCap;
        _mint(address(this), MAX_SUPPLY);
        _transfer(address(this), _initialOwner, 500_000_000 * 10**18);
    }

    modifier onlyDuringPresale() {
        require(block.timestamp >= presaleStart, "Presale not started");
        require(block.timestamp <= presaleEnd, "Presale ended");
        require(!presaleFinalized, "Presale already finalized");
        _;
    }

    function setWhitelistMerkleRoot(bytes32 _merkleRoot) external onlyOwner {
        whitelistMerkleRoot = _merkleRoot;
        emit WhitelistUpdated(_merkleRoot);
    }

    function isWhitelisted(address _user, bytes32[] calldata _merkleProof) public view returns (bool) {
        if (whitelistMerkleRoot == bytes32(0)) return true;
        bytes32 leaf = keccak256(abi.encodePacked(_user));
        return MerkleProof.verify(_merkleProof, whitelistMerkleRoot, leaf);
    }

    function buyPresale(bytes32[] calldata _merkleProof) external payable onlyDuringPresale nonReentrant {
        require(isWhitelisted(msg.sender, _merkleProof), "Not whitelisted");
        require(msg.value >= minPurchase, "Below minimum purchase");
        require(contributions[msg.sender] + msg.value <= maxPurchase, "Exceeds max purchase");
        require(totalRaised + msg.value <= hardCap, "Hard cap reached");
        uint256 tokens = msg.value * presaleRate;
        require(balanceOf(address(this)) >= tokens, "Insufficient presale supply");
        contributions[msg.sender] += msg.value;
        totalRaised += msg.value;
        _transfer(address(this), msg.sender, tokens);
        emit PresalePurchased(msg.sender, tokens, msg.value);
    }

    function finalizePresale() external onlyOwner {
        require(!presaleFinalized, "Already finalized");
        require(block.timestamp > presaleEnd || totalRaised >= hardCap, "Presale not complete");
        presaleFinalized = true;
        uint256 unsoldTokens = balanceOf(address(this)) - totalRaised * presaleRate;
        _transfer(address(this), owner(), TEAM_SUPPLY);
        _transfer(address(this), owner(), MARKETING_SUPPLY);
        _transfer(address(this), owner(), ECOSYSTEM_SUPPLY);
        _transfer(address(this), owner(), LIQUIDITY_SUPPLY);
        if (unsoldTokens > 0) _burn(address(this), unsoldTokens);
        emit PresaleFinalized(totalRaised, totalRaised * presaleRate);
    }

    function addLiquidity() external payable onlyOwner {
        require(presaleFinalized, "Presale must be finalized first");
        require(!liquidityLocked, "Liquidity already added");
        require(msg.value > 0, "Must send ETH");
        liquidityLocked = true;
        emit LiquidityAdded(msg.value, LIQUIDITY_SUPPLY);
    }

    function withdrawRaisedETH() external onlyOwner {
        require(presaleFinalized, "Presale must be finalized");
        require(address(this).balance > 0, "No ETH to withdraw");
        (bool success, ) = payable(owner()).call{value: address(this).balance}("");
        require(success, "ETH transfer failed");
    }

    receive() external payable {
        revert("Use buyPresale() to contribute");
    }
}
