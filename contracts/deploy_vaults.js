const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with:", deployer.address);

  const PCENT_ADDR = process.env.PCENT_ADDRESS || "0x7d116aEe138Cc9D160C489B56d2746aE16bf0FC8";
  const JRTS_ADDR = process.env.JRTS_ADDRESS || "0x8Df1b23fEDB106ab67cC06A64601Fd45Bfe16Ad2";

  // Deploy PCENT vault
  const Vault = await hre.ethers.getContractFactory("SubmissionVault");
  
  // $20 worth of tokens at ~$0.000001 per token... using 1000 tokens as fee for now
  const FEE = hre.ethers.parseEther("1000"); // 1000 PCENT = ~$20 hypothetical
  
  const pcentVault = await Vault.deploy(PCENT_ADDR, "PCENT", FEE);
  await pcentVault.waitForDeployment();
  const pvAddr = await pcentVault.getAddress();
  console.log("PCENT Vault:", pvAddr);

  const jrtsVault = await Vault.deploy(JRTS_ADDR, "JRTS", FEE);
  await jrtsVault.waitForDeployment();
  const jvAddr = await jrtsVault.getAddress();
  console.log("JRTS Vault: ", jvAddr);

  console.log("\n=== Vaults Deployed ===");
  console.log("PCENT vault:", pvAddr);
  console.log("JRTS vault:", jvAddr);
  console.log("Fee:", hre.ethers.formatEther(FEE), "tokens");
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
