# PersistentCent + Staking — Full Deployment Record
# Deployed: 2026-07-09 (Local) / 2026-07-15 (Sepolia)

## Local Hardhat (http://127.0.0.1:8545, Chain ID: 31337)

### PersistentCent (PCENT)
- **Address:** `0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9`
- **Supply:** 100,000,000,000 PCENT (99.5B in contract, 500M sent to owner)
- **Presale:** Starts +1hr, 14 days, 100K PCENT/ETH, 50-500 ETH caps

### PCENTStaking
- **Address:** `0x5FC8d32690cc91D4c39d9d3abcBD16989F875707`
- **Funded with:** 500,000,000 PCENT for staking rewards
- **Min stake:** 1,000,000 PCENT
- **Cooldown:** 7 days
- **APY:** ~3.65%

---

## Sepolia Testnet (Chain ID: 11155111)
# Deployed: 2026-07-15

### PersistentCent (PCENT)
- **Address:** `0x7d116aEe138Cc9D160C489B56d2746aE16bf0FC8`
- **Supply:** 100,000,000,000 PCENT (99.5B in contract, 500M sent to owner)
- **Deployer:** `0xf5d250241443A6e381C03e0D2dF935B93E440D56`

### PCENTStaking
- **Address:** `0x9F889e0e4A96f1BED2A9D0D317370a61b143e42a`
- **Funded with:** 500,000,000 PCENT for staking rewards
- **Min stake:** 1,000,000 PCENT
- **Cooldown:** 7 days
- **APY:** ~3.65%

### Tiers
| Tier | Min Stake | Color | Benefits |
|------|-----------|-------|----------|
| BASE | 1M PCENT | Gray | Standard access |
| PREMIUM | 10M PCENT | Cyan | Priority review + 5% bonus |
| ELITE | 100M PCENT | Purple | Instant payout + 10% bonus + private programs |

### How Fuel & Bandwidth Works
```
Researcher submits → chooses PCENT payout (+10%)
Program pays listing fee in PCENT → collected by staking contract
Researchers stake PCENT → earn rewards from platform revenue
Bandwidth dashboard tracks: staked, revenue, researchers, bounties, tx volume
```

### Platform Addresses (index.php)
Updated in persistent-bugbounty/public_html/index.php

### To deploy to mainnet/testnet
```bash
export PRIVATE_KEY=your_key
export MAINNET_RPC_URL=your_rpc
npx hardhat run contracts/deploy_all.js --network mainnet
# Then update the two addresses in index.php
```
