const hre = require("hardhat");

/**
 * PCENT — Persistent Cent
 * Circular USD0 Backing Architecture
 * 
 * Deploy Order:
 * 1. PersistentCent (PCENT token + presale)
 * 2. PCENTStaking (staking + rewards)
 * 3. PCENTVault (USD0 backing vault)
 * 4. SubmissionVault (fee collection → vault)
 * 
 * Post-deploy:
 * - Fund staking contract with PCENT rewards
 * - Configure vault in SubmissionVault
 * - Verify contracts on block explorer
 */

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  // ─── Config ─────────────────────────────────────────────
  const PRESALE_START = Math.floor(Date.now() / 1000) + 3600; // 1hr
  const PRESALE_END = PRESALE_START + 14 * 24 * 3600; // 14 days
  const PRESALE_RATE = 100_000; // 1 ETH = 100,000 PCENT
  const MIN_PURCHASE = hre.ethers.parseEther("0.01");
  const MAX_PURCHASE = hre.ethers.parseEther("10");
  const SOFT_CAP = hre.ethers.parseEther("50");
  const HARD_CAP = hre.ethers.parseEther("500");
  const REWARD_POOL = hre.ethers.parseEther("500000000"); // 500M PCENT

  // USD0 mainnet address (Ethereum)
  const USD0_ADDRESS = "0x73A15FeD60Bf67631dC6cd7Bc5B6e8da8190aCF5";
  const SUBMISSION_FEE = hre.ethers.parseEther("10"); // 10 USD0

  // ─── Step 1: Deploy PCENT Token ──────────────────────
  console.log("\n[1/4] Deploying PersistentCent...");
  const PersistentCent = await hre.ethers.getContractFactory("PersistentCent");
  const token = await PersistentCent.deploy(
    deployer.address,
    PRESALE_START,
    PRESALE_END,
    PRESALE_RATE,
    MIN_PURCHASE,
    MAX_PURCHASE,
    SOFT_CAP,
    HARD_CAP
  );
  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();
  console.log("  PCENT:", tokenAddress);

  // Transfer reward pool to deployer for staking
  const tx1 = await token.transfer(deployer.address, REWARD_POOL);
  await tx1.wait();
  console.log("  Rewards pool: 500M PCENT → deployer");

  // ─── Step 2: Deploy Staking ───────────────────────────
  console.log("\n[2/4] Deploying PCENTStaking...");
  const PCENTStaking = await hre.ethers.getContractFactory("PCENTStaking");
  const staking = await PCENTStaking.deploy(tokenAddress);
  await staking.waitForDeployment();
  const stakingAddress = await staking.getAddress();
  console.log("  Staking:", stakingAddress);

  // Fund staking
  const tx2 = await token.transfer(stakingAddress, REWARD_POOL);
  await tx2.wait();
  console.log("  Funded: 500M PCENT → staking");

  // ─── Step 3: Deploy Vault ─────────────────────────────
  console.log("\n[3/4] Deploying PCENTVault...");
  const PCENTVault = await hre.ethers.getContractFactory("PCENTVault");
  const vault = await PCENTVault.deploy(USD0_ADDRESS);
  await vault.waitForDeployment();
  const vaultAddress = await vault.getAddress();
  console.log("  Vault:", vaultAddress);

  // ─── Step 4: Deploy SubmissionVault ────────────────────
  console.log("\n[4/4] Deploying SubmissionVault...");
  const SubmissionVault = await hre.ethers.getContractFactory("SubmissionVault");
  const submissionVault = await SubmissionVault.deploy(USD0_ADDRESS, SUBMISSION_FEE);
  await submissionVault.waitForDeployment();
  const subVaultAddress = await submissionVault.getAddress();
  console.log("  SubmissionVault:", subVaultAddress);

  // Configure vault in submission vault
  const tx3 = await submissionVault.setVault(vaultAddress);
  await tx3.wait();
  console.log("  Vault configured in SubmissionVault");

  // Configure vault in staking
  const tx4 = await staking.setVault(vaultAddress);
  await tx4.wait();
  console.log("  Vault configured in Staking");

  // ─── Summary ─────────────────────────────────────────
  console.log("\n╔══════════════════════════════════════╗");
  console.log("║       DEPLOYMENT COMPLETE            ║");
  console.log("╠══════════════════════════════════════╣");
  console.log("║  PCENT:         ", tokenAddress);
  console.log("║  Staking:       ", stakingAddress);
  console.log("║  Vault (USD0):  ", vaultAddress);
  console.log("║  Submission:    ", subVaultAddress);
  console.log("║  USD0:          ", USD0_ADDRESS);
  console.log("╠══════════════════════════════════════╣");
  console.log("║  Min stake: 1M PCENT                 ║");
  console.log("║  APY:       ~3.65%                    ║");
  console.log("║  Fee:       5% on submissions         ║");
  console.log("║  Backing:   USD0 → PCENTVault         ║");
  console.log("╚══════════════════════════════════════╝");

  // Verify
  const stakingBal = await token.balanceOf(stakingAddress);
  console.log("\nStaking rewards:", hre.ethers.formatEther(stakingBal), "PCENT");
  console.log("Vault backing: ", await vault.totalAssets(), "USD0");
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
