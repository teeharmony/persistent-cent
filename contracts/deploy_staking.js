const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  // PCENT token address (must be deployed first)
  const PCENT_ADDRESS = process.env.PCENT_ADDRESS || "";
  if (!PCENT_ADDRESS) {
    console.error("ERROR: Set PCENT_ADDRESS env var to the deployed PersistentCent token address.");
    console.error("  Example: PCENT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3 npx hardhat run contracts/deploy_staking.js --network localhost");
    process.exit(1);
  }
  console.log("PCENT token address:", PCENT_ADDRESS);

  const PCENTStaking = await hre.ethers.getContractFactory("PCENTStaking");
  const staking = await PCENTStaking.deploy(PCENT_ADDRESS);
  await staking.waitForDeployment();

  const stakingAddress = await staking.getAddress();
  console.log("PCENTStaking deployed to:", stakingAddress);

  // Verify
  const bw = await staking.getBandwidth();
  console.log("\n=== Staking Contract Ready ===");
  console.log("Staking address:", stakingAddress);
  console.log("PCENT address:  ", PCENT_ADDRESS);
  console.log("Initial bandwidth:", {
    totalStaked: bw.staked.toString(),
    platformRevenue: bw.revenue.toString(),
    activeResearchers: Number(bw.researchers),
    bountiesPaid: Number(bw.bounties),
  });
  console.log("Reward rate:", (await staking.rewardRate()).toString());
  console.log("Min stake:", hre.ethers.formatEther(await staking.MIN_STAKE()), "PCENT");
  console.log("Unstake cooldown:", (await staking.UNSTAKE_COOLDOWN()).toString(), "seconds");

  console.log("\n=== Next Steps ===");
  console.log("1. Update PCENTStaking address in bug bounty platform index.php");
  console.log("2. Transfer PCENT tokens to staking contract for rewards");
  console.log("3. Set listing fees via collectFee() for each program");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
