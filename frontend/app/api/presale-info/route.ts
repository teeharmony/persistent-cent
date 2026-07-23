import { NextResponse } from "next/server";
import { CONTRACT_ADDRESS, PRESALE_ABI } from "@/lib/contracts";
import { ethers } from "ethers";

export async function GET() {
  try {
    // If no contract address is configured, return placeholder data
    if (!CONTRACT_ADDRESS || CONTRACT_ADDRESS === "0x...") {
      return NextResponse.json({
        configured: false,
        message: "Contract not yet deployed. Check back soon.",
      });
    }

    // Connect to provider (use public RPC or env-configured one)
    const provider = new ethers.JsonRpcProvider(
      process.env.RPC_URL || "http://127.0.0.1:8545"
    );

    const contract = new ethers.Contract(CONTRACT_ADDRESS, PRESALE_ABI, provider);

    const [
      presaleStart,
      presaleEnd,
      presaleRate,
      minPurchase,
      maxPurchase,
      softCap,
      hardCap,
      totalRaised,
      presaleFinalized,
    ] = await Promise.all([
      contract.presaleStart(),
      contract.presaleEnd(),
      contract.presaleRate(),
      contract.minPurchase(),
      contract.maxPurchase(),
      contract.softCap(),
      contract.hardCap(),
      contract.totalRaised(),
      contract.presaleFinalized(),
    ]);

    const now = Math.floor(Date.now() / 1000);
    let status: "upcoming" | "active" | "ended" | "finalized";

    if (presaleFinalized) {
      status = "finalized";
    } else if (now < Number(presaleStart)) {
      status = "upcoming";
    } else if (now <= Number(presaleEnd)) {
      status = "active";
    } else {
      status = "ended";
    }

    return NextResponse.json({
      configured: true,
      status,
      presaleStart: Number(presaleStart),
      presaleEnd: Number(presaleEnd),
      presaleRate: Number(presaleRate),
      minPurchase: ethers.formatEther(minPurchase),
      maxPurchase: ethers.formatEther(maxPurchase),
      softCap: ethers.formatEther(softCap),
      hardCap: ethers.formatEther(hardCap),
      totalRaised: ethers.formatEther(totalRaised),
      presaleFinalized,
    });
  } catch (error) {
    console.error("Presale info error:", error);
    return NextResponse.json(
      {
        configured: false,
        error: "Failed to fetch presale info",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
