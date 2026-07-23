export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x...";

export const PRESALE_ABI = [
  // ERC20
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) returns (bool)",

  // Presale
  "function presaleStart() view returns (uint256)",
  "function presaleEnd() view returns (uint256)",
  "function presaleRate() view returns (uint256)",
  "function minPurchase() view returns (uint256)",
  "function maxPurchase() view returns (uint256)",
  "function softCap() view returns (uint256)",
  "function hardCap() view returns (uint256)",
  "function totalRaised() view returns (uint256)",
  "function contributions(address) view returns (uint256)",
  "function presaleFinalized() view returns (bool)",
  "function isWhitelisted(address, bytes32[]) view returns (bool)",
  "function buyPresale(bytes32[] calldata _merkleProof) payable",
  "function MAX_SUPPLY() view returns (uint256)",
  "function PRESALE_SUPPLY() view returns (uint256)",

  // Events
  "event PresalePurchased(address indexed buyer, uint256 amount, uint256 ethContributed)",
  "event PresaleFinalized(uint256 totalRaised, uint256 tokensSold)",
];

export const CHAIN_ID = process.env.NEXT_PUBLIC_CHAIN_ID
  ? parseInt(process.env.NEXT_PUBLIC_CHAIN_ID)
  : 31337;
