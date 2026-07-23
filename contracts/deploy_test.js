const hre = require("hardhat");

/**
 * PCENT — Test Deployment (Sepolia)
 * Uses past timestamps so presale can be finalized immediately.
 */
async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  const bal = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Balance:", hre.ethers.formatEther(bal), "ETH");

  const STAKING_REWARDS = hre.ethers.parseEther("500000000");
  const USD0_ADDRESS = "0x73A15FeD60Bf67631dC6cd7Bc5B6e8da8190aCF5";
  const SUBMISSION_FEE = hre.ethers.parseEther("10");

  // Past timestamps — presale already ended
  const now = Math.floor(Date.now() / 1000);
  const PRESALE_START = now - 7 * 24 * 3600; // 7 days ago
  const PRESALE_END = now - 3600;              // 1 hour ago
  const PRESALE_RATE = 100_000;
  const MIN_PURCHASE = hre.ethers.parseEther("0.01");
  const MAX_PURCHASE = hre.ethers.parseEther("10");
  const SOFT_CAP = hre.ethers.parseEther("50");
  const HARD_CAP = hre.ethers.parseEther("500");

  // Deploy token
  console.log("\n[1/5] Deploying PersistentCent...");
  const PersistentCent = await hre.ethers.getContractFactory("PersistentCent");
  const token = await PersistentCent.deploy(
    deployer.address, PRESALE_START, PRESALE_END, PRESALE_RATE,
    MIN_PURCHASE, MAX_PURCHASE, SOFT_CAP, HARD_CAP
  );
  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();
  console.log("  PCENT:", tokenAddress);

  // Deploy staking
  console.log("\n[2/5] Deploying PCENTStaking...");
  const PCENTStaking = await hre.ethers.getContractFactory("PCENTStaking");
  const staking = await PCENTStaking.deploy(tokenAddress);
  await staking.waitForDeployment();
  const stakingAddress = await staking.getAddress();
  console.log("  Staking:", stakingAddress);

  // Deploy vault
  console.log("\n[3/5] Deploying PCENTVault...");
  const PCENTVault = await hre.ethers.getContractFactory("PCENTVault");
  const vault = await PCENTVault.deploy(USD0_ADDRESS);
  await vault.waitForDeployment();
  const vaultAddress = await vault.getAddress();
  console.log("  Vault:", vaultAddress);

  // Deploy submission vault
  console.log("\n[4/5] Deploying SubmissionVault...");
  const SubmissionVault = await hre.ethers.getContractFactory("SubmissionVault");
  const submissionVault = await SubmissionVault.deploy(USD0_ADDRESS, SUBMISSION_FEE);
  await submissionVault.waitForDeployment();
  const subVaultAddress = await submissionVault.getAddress();
  console.log("  SubmissionVault:", subVaultAddress);

  // Finalize presale (presale already ended)
  console.log("\n[5/5] Finalizing and configuring...");
  const finalizeTx = await token.finalizePresale();
  await finalizeTx.wait();
  console.log("  Presale finalized");

  // Fund staking
  await (await token.transfer(stakingAddress, STAKING_REWARDS)).wait();
  console.log("  Staking funded: 500M PCENT");

  // Configure vaults
  await (await staking.setVault(vaultAddress)).wait();
  console.log("  Vault set in staking");
  await (await submissionVault.setVault(vaultAddress)).wait();
  console.log("  Vault set in submission vault");

  // ─── Verify ──────────────────────────────────────────
  console.log("\n╔══════════════════════════════════════╗");
  console.log("║       DEPLOYMENT COMPLETE            ║");
  console.log("╠══════════════════════════════════════╣");
  console.log("║  PCENT:         ", tokenAddress);
  console.log("║  Staking:       ", stakingAddress);
  console.log("║  Vault (USD0):  ", vaultAddress);
  console.log("║  Submission:    ", subVaultAddress);
  console.log("║  USD0:          ", USD0_ADDRESS);
  console.log("╠══════════════════════════════════════╣");
  console.log("║  Owner bal: ", hre.ethers.formatEther(await token.balanceOf(deployer.address)), "PCENT");
  console.log("║  Stake bal: ", hre.ethers.formatEther(await token.balanceOf(stakingAddress)), "PCENT");
  console.log("║  Contract:  ", hre.ethers.formatEther(await token.balanceOf(tokenAddress)), "PCENT");
  console.log("╚══════════════════════════════════════╝");
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
