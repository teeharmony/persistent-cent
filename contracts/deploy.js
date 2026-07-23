const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const presaleStart = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
  const presaleEnd = presaleStart + 14 * 24 * 3600; // 14 days
  const presaleRate = 100000; // 100,000 PCENT per ETH
  const minPurchase = hre.ethers.parseEther("0.01");
  const maxPurchase = hre.ethers.parseEther("10");
  const softCap = hre.ethers.parseEther("50"); // 50 ETH
  const hardCap = hre.ethers.parseEther("500"); // 500 ETH

  const PersistentCent = await hre.ethers.getContractFactory("PersistentCent");
  const token = await PersistentCent.deploy(
    deployer.address,
    presaleStart,
    presaleEnd,
    presaleRate,
    minPurchase,
    maxPurchase,
    softCap,
    hardCap
  );

  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();

  console.log("PersistentCent deployed to:", tokenAddress);
  console.log("Presale starts:", new Date(presaleStart * 1000).toISOString());
  console.log("Presale ends:", new Date(presaleEnd * 1000).toISOString());
  console.log("Rate:", presaleRate, "PCENT per ETH");
  console.log("Soft cap:", hre.ethers.formatEther(softCap), "ETH");
  console.log("Hard cap:", hre.ethers.formatEther(hardCap), "ETH");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
