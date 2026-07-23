# PCENT — Persistent Cent

> USD0-backed token ecosystem template with transparent vault reserves, staking, and circular fee backing.

**Status:** Reference implementation / template. Not a live project.  
**Use at your own risk.** This code is provided as-is for educational purposes.

PCENT is an Ethereum token template whose ecosystem is backed by verifiable USD0 reserves held in a dedicated vault. The architecture mirrors the circular vault pattern used by protocols like Usual's USD0 + U0R.

## Architecture

```
                    ┌───────────────────────────────┐
                    │         USD0 (ERC20)           │
                    └───────────┬───────────────────┘
                                │
                    ┌───────────▼───────────────────┐
                    │      PCENTVault (pUSD0)        │
                    │  ERC-4626-style USD0 vault     │
                    │  totalAssets() always visible  │
                    └───────────┬───────────────────┘
                                │
          ┌─────────────────────┼─────────────────────┐
          │                     │                     │
          ▼                     ▼                     ▼
   ┌────────────┐    ┌──────────────┐    ┌────────────────┐
   │ PCENT Token │    │ PCENTStaking │    │ SubmissionVault│
   │ ERC20      │    │ Stake PCENT  │    │ Fees in USD0   │
   │ Max 100B   │    │ ~3.65% APY   │    │ → forwarded to │
   └────────────┘    └──────────────┘    │ PCENTVault     │
                                          └────────────────┘
```

## Contracts

| Contract | Sepolia Address | Description |
|----------|----------------|-------------|
| **PersistentCent** | `0xC1D67Ab97c39d1acdaBaC704721cD94b9bB9F5D8` | ERC20 token with presale |
| **PCENTStaking** | `0xFFF4F4e42c6e755F5F1fA7b1aea2e2A121616EEe` | Stake PCENT, earn rewards |
| **PCENTVault** | `0x78a51da464EF129d0A04947E19a96CEFBe5b98cD` | USD0 backing vault |
| **SubmissionVault** | `0x9bBDA09E754B3303C6a18A23dF582C1DC6ED9791` | Fee collector → vault |

## Deploy

```bash
npm install
cp .env.example .env
npx hardhat run contracts/deploy_test.js --network sepolia
npx hardhat run contracts/deploy_all.js --network mainnet
```

## License

MIT
