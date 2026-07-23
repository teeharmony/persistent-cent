# PCENT — Persistent Cent

A token ecosystem backed by transparent USD0 reserves, using the circular vault architecture pioneered by protocols like Usual's USD0.

## Architecture

```
                    ┌───────────────────────────────┐
                    │         USD0 (ERC20)           │
                    │   0x73A15FeD60Bf67631dC6cd7Bc │
                    │   5B6e8da8190aCF5              │
                    └───────────┬───────────────────┘
                                │
                    ┌───────────▼───────────────────┐
                    │      PCENTVault (pUSD0)        │
                    │  ERC-4626-style USD0 vault     │
                    │  Users deposit USD0 → get shares│
                    │  Shares = transparent backing   │
                    │  totalAssets() always visible   │
                    └───────────┬───────────────────┘
                                │
          ┌─────────────────────┼─────────────────────┐
          │                     │                     │
          ▼                     ▼                     ▼
   ┌────────────┐    ┌──────────────┐    ┌────────────────┐
   │ PCENT Token │    │ PCENTStaking │    │ SubmissionVault│
   │ ERC20      │    │ Stake PCENT  │    │ Fees in USD0   │
   │ Presale    │◄───┤ Earn rewards │◄───┤ → forwarded to │
   │ Max 100B   │    │ ~3.65% APY   │    │ PCENTVault     │
   └────────────┘    └──────────────┘    └────────────────┘
```

### Circular Backing Pattern

```
Revenue Flow:
  User pays fee (USD0)
    → SubmissionVault collects
    → Forwarded to PCENTVault
    → PCENTVault.totalAssets() ↑
    → Backing strengthens
    → Staking rewards sustainable

Transparency:
  vault.totalAssets()    = USD0 held in reserve
  vault.totalShares()    = shares outstanding  
  vault.convertToAssets() = USD0 per share
  Anyone can verify on-chain.
```

## Contracts

| Contract | Address | Description |
|----------|---------|-------------|
| **PersistentCent** | — | ERC20 token with presale mechanism. Max supply 100B PCENT. |
| **PCENTStaking** | — | Stake PCENT, earn rewards. Backed by vault revenue. Min 1M PCENT. |
| **PCENTVault** | — | USD0 backing vault. Deposit USD0 → get pUSD0 shares. 7-day cooldown. |
| **SubmissionVault** | — | Fee collection. Fees in USD0 → forwarded to PCENTVault as backing. |

## USD0 Backing

USD0 is a stablecoin from the Usual Labs protocol:
- **Token:** `0x73A15FeD60Bf67631dC6cd7Bc5B6e8da8190aCF5`
- **Website:** https://usual.money
- **Backing:** Real-world assets (RWA)

The PCENTVault holds USD0 as its reserve asset. Every USD0 deposited into the vault is visible on-chain. This is the same vault pattern used by U0R in the Usual ecosystem — except here the backing is fully transparent and verifiable.

## Deploy

```bash
# Install
npm install

# Configure .env with your PRIVATE_KEY and RPC_URL
cp .env.example .env

# Deploy
npx hardhat run contracts/deploy_all.js --network ethereum

# Verify
npx hardhat verify --network ethereum <PCENT_ADDRESS> <args...>
npx hardhat verify --network ethereum <STAKING_ADDRESS> <PCENT_ADDRESS>
npx hardhat verify --network ethereum <VAULT_ADDRESS> <USD0_ADDRESS>
npx hardhat verify --network ethereum <SUBMISSION_VAULT_ADDRESS> <USD0_ADDRESS> <FEE>
```

## License

MIT
