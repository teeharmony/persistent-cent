# PCENT — Persistent Cent

> USD0-backed token ecosystem with transparent vault reserves, staking, and circular fee backing.

PCENT is an Ethereum token whose ecosystem is backed by verifiable USD0 reserves held in a dedicated vault. Users stake PCENT to earn rewards, participate in governance, and access platform services. Submission fees are paid in USD0 and forwarded to the vault, creating a sustainable, transparent backing model — similar to the vault architecture used by Usual's USD0 + U0R.

## Why This Exists

Most token projects rely on hidden treasuries, opaque emissions, or infinite minting. PCENT does none of that:

- **Every dollar of backing is on-chain.** The PCENTVault holds USD0. Anyone can call `totalAssets()` and verify the reserves.
- **Revenue flows into the vault.** Submission fees in USD0 are deposited directly. The vault grows transparently.
- **Staking rewards come from real revenue.** No inflationary token printing. Rewards are funded by vault growth and platform activity.
- **No circular self-backing.** The vault holds USD0 — a liquid, yield-bearing stablecoin from the Usual protocol, backed by real-world assets. Not PCENT tokens pretending to be backing.

## Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                          USD0 (ERC20)                            │
│                   0x73A15FeD60Bf67631dC6cd7Bc5B6e8da8190aCF5    │
│              Stablecoin backed by real-world assets              │
└────────────────────────────┬─────────────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│                      PCENTVault (pUSD0)                           │
│                                                                  │
│     ERC-4626-style vault holding USD0 as reserve asset.          │
│     totalAssets()   → USD0 held in reserve                       │
│     totalShares()   → Shares outstanding                         │
│     convertToAssets() → USD0 per share                           │
│                                                                  │
│     Depositors get pUSD0 shares representing their share         │
│     of the vault. Redeemable for USD0 (subject to queue).        │
│                                                                  │
│     This is the BACKING. Call totalAssets() anytime.             │
└──────┬─────────────────────────────────────────────────┬─────────┘
       │                                                 │
       ▼                                                 ▼
┌──────────────────┐                        ┌──────────────────────┐
│  PCENTStaking     │                        │   SubmissionVault    │
│                   │                        │                      │
│  Stake PCENT      │                        │  Users pay fees in   │
│  Earn rewards     │◄───────────────────────│  USD0 → forwarded    │
│  from vault       │                        │  to PCENTVault       │
│  revenue          │                        │  as backing          │
│  Min: 1M PCENT    │                        │                      │
│  APY: ~3.65%      │                        │  Non-refundable.     │
└──────────────────┘                        │  Hunter consents.    │
                                            └──────────────────────┘
       ▲
       │
       ▼
┌──────────────────────────────────────────────────────────────────┐
│                      PCENT Token (ERC20)                          │
│                                                                  │
│     Max Supply: 100,000,000,000 PCENT                             │
│     Presale:    30,000,000,000 PCENT (30%)                        │
│     Liquidity:  20,000,000,000 PCENT (20%)                        │
│     Team:       15,000,000,000 PCENT (15%) [locked]               │
│     Marketing:  15,000,000,000 PCENT (15%)                        │
│     Ecosystem:  20,000,000,000 PCENT (20%)                        │
│                                                                  │
│     Presale: ETH → PCENT at fixed rate. Whitelist via Merkle.    │
│     Soft cap, hard cap, max/min per wallet enforced.             │
└──────────────────────────────────────────────────────────────────┘
```

## The Backing Flow (Step by Step)

```
1. User submits to platform
2. User pays fee in USD0 → SubmissionVault
3. SubmissionVault forwards USD0 → PCENTVault
4. PCENTVault.totalAssets() increases
5. Backing is visible to anyone on-chain
6. Stakers earn from vault-backed revenue
```

This is the same pattern used by Usual's U0R vault — but with USD0 as the reserve asset, not self-referential token backing. Every step is transparent and verifiable.

## Contracts

| Contract | Description | Key Function |
|----------|-------------|-------------|
| **PersistentCent.sol** | ERC20 token with presale mechanism. Whitelisted presale, soft/hard cap, supply- capped. | `buyPresale()` → receive PCENT |
| **PCENTStaking.sol** | Stake PCENT, earn rewards. Tiers based on stake amount. 7-day unstake cooldown. | `stake()`, `unstake()`, `claimReward()` |
| **PCENTVault.sol** | USD0 reserve vault. Deposit USD0, get pUSD0 shares. 7-day deposit cooldown, 3-day withdrawal queue. | `deposit()`, `requestWithdrawal()`, `executeWithdrawal()` |
| **SubmissionVault.sol** | Fee collector. Fees in USD0 → forwarded to PCENTVault as backing. Owner-configurable fee amount. | `payFee()`, `forwardToVault()` |

## Transparency

Anyone can verify the backing at any time:

```solidity
// PCENTVault contract
vault.totalAssets()    // Total USD0 held in reserve
vault.totalShares()    // Total shares outstanding
vault.convertToAssets(shares) // USD0 value of your shares

// PCENTStaking contract  
staking.getVaultBacking()  // USD0 backing the staking rewards
```

No hidden minting. No infinite loops. No opaque treasury. The reserves are on-chain and verifiable by anyone.

## Deploy

```bash
# Prerequisites
npm install
cp .env.example .env  # Add your PRIVATE_KEY and RPC_URL

# Deploy to Ethereum mainnet
npx hardhat run contracts/deploy_all.js --network mainnet

# Verify on Etherscan
npx hardhat verify --network mainnet <PCENT_ADDRESS> <args>
npx hardhat verify --network mainnet <STAKING_ADDRESS> <PCENT_ADDRESS>
npx hardhat verify --network mainnet <VAULT_ADDRESS> <USD0_ADDRESS>
npx hardhat verify --network mainnet <SUBMISSION_VAULT_ADDRESS> <USD0_ADDRESS> <FEE>
```

## Frontend

A Next.js web app is included in `frontend/` with:
- Presale widget (connect wallet, buy PCENT, view contribution)
- Staking dashboard (stake, unstake, claim rewards)
- Vault stats (total backing, APY, active stakers, bandwidth)
- Real-time data via Web3 provider
- MongoDB backend for email subscriptions

```bash
cd frontend
npm install
npm run dev
```

## USD0

USD0 is the stablecoin powering the PCENT backing system:
- **Contract:** `0x73A15FeD60Bf67631dC6cd7Bc5B6e8da8190aCF5`
- **Protocol:** Usual Labs
- **Backing:** Real-world assets (RWA)
- **Transparency:** Verifiable on-chain reserves via the Usual protocol

## Audit

Contracts in this repository have been audited as part of the PCENT security review. See the `audits/` directory for reports.

## License

MIT

---

*Built on Ethereum. Backed by USD0. Transparent by design.*
