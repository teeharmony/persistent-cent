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
    bool public liquidityAdded;
    mapping(address => uint256) public contributions;
    bytes32 public whitelistMerkleRoot;

    /// @notice DEX router address for liquidity creation (Uniswap V2 compatible)
    address public dexRouter;
    /// @notice The paired token for liquidity (typically WETH or USD0)
    address public pairedToken;

    event PresalePurchased(address indexed buyer, uint256 amount, uint256 ethContributed);
    event PresaleFinalized(uint256 totalRaised, uint256 tokensSold);
    event LiquidityAdded(uint256 ethAmount, uint256 tokenAmount, address router);
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
    }

    modifier onlyDuringPresale() {
        require(block.timestamp >= presaleStart, "Presale not started");
        require(block.timestamp <= presaleEnd, "Presale ended");
        require(!presaleFinalized, "Presale already finalized");
        _;
    }

    /// @notice Configure DEX router for liquidity after presale
    function setDexRouter(address _router, address _pairedToken) external onlyOwner {
        require(_router != address(0), "Invalid router");
        require(_pairedToken != address(0), "Invalid paired token");
        dexRouter = _router;
        pairedToken = _pairedToken;
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
        uint256 presaleRemaining = PRESALE_SUPPLY - (totalRaised * presaleRate);
        require(tokens <= presaleRemaining, "Insufficient presale supply");
        contributions[msg.sender] += msg.value;
        totalRaised += msg.value;
        _transfer(address(this), msg.sender, tokens);
        emit PresalePurchased(msg.sender, tokens, msg.value);
    }

    function finalizePresale() external onlyOwner {
        require(!presaleFinalized, "Already finalized");
        require(block.timestamp > presaleEnd || totalRaised >= hardCap, "Presale not complete");
        presaleFinalized = true;

        uint256 tokensSold = totalRaised * presaleRate;
        uint256 unsoldTokens = PRESALE_SUPPLY > tokensSold ? PRESALE_SUPPLY - tokensSold : 0;

        // Burn unsold presale tokens
        if (unsoldTokens > 0) _burn(address(this), unsoldTokens);

        // Transfer allocations — contract must have sufficient balance
        // After presale + burn, remaining = MAX_SUPPLY - tokensSold - unsoldTokens - 500M(already sent)
        // = 100B - tokensSold - (30B - tokensSold) = 70B exactly
        _transfer(address(this), owner(), TEAM_SUPPLY);
        _transfer(address(this), owner(), MARKETING_SUPPLY);
        _transfer(address(this), owner(), ECOSYSTEM_SUPPLY);
        _transfer(address(this), owner(), LIQUIDITY_SUPPLY);

        emit PresaleFinalized(totalRaised, tokensSold);
    }

    /// @notice Create liquidity on the configured DEX router
    ///         Requires prior approval of PCENT + paired token to router
    function addLiquidity(uint256 _tokenAmount, uint256 _pairedAmount) external onlyOwner {
        require(presaleFinalized, "Presale must be finalized first");
        require(!liquidityAdded, "Liquidity already added");
        require(dexRouter != address(0), "DEX router not set");
        require(_tokenAmount > 0 && _pairedAmount > 0, "Amounts must be > 0");
        require(balanceOf(address(this)) >= _tokenAmount, "Insufficient PCENT balance");

        // Approve router and add liquidity
        _approve(address(this), dexRouter, _tokenAmount);

        (bool success, ) = dexRouter.call(
            abi.encodeWithSignature(
                "addLiquidity(address,address,uint256,uint256,uint256,uint256,address,uint256)",
                address(this),       // token0 (PCENT)
                pairedToken,         // token1 (WETH/USD0)
                _tokenAmount,        // amount token0 desired
                _pairedAmount,       // amount token1 desired
                0,                   // amount token0 min
                0,                   // amount token1 min
                owner(),             // to
                block.timestamp + 15 // deadline
            )
        );
        require(success, "Liquidity add failed");
        liquidityAdded = true;

        emit LiquidityAdded(_pairedAmount, _tokenAmount, dexRouter);
    }

    function withdrawRaisedETH() external onlyOwner {
        require(presaleFinalized, "Presale must be finalized");
        uint256 balance = address(this).balance;
        require(balance > 0, "No ETH to withdraw");
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "ETH transfer failed");
    }

    receive() external payable {
        revert("Use buyPresale() to contribute");
    }
}
