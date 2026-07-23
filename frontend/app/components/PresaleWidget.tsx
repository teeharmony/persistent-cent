"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useWallet } from "./WalletProvider";
import { getContract } from "@/lib/web3";
import { ethers } from "ethers";
import toast from "react-hot-toast";

interface PresaleState {
  status: "upcoming" | "active" | "ended" | "finalized";
  presaleStart: number;
  presaleEnd: number;
  presaleRate: number;
  totalRaised: string;
  softCap: string;
  hardCap: string;
  minPurchase: string;
  maxPurchase: string;
}

export default function PresaleWidget() {
  const { account, isCorrectChain } = useWallet();
  const [presale, setPresale] = useState<PresaleState | null>(null);
  const [ethAmount, setEthAmount] = useState("0.1");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [countdown, setCountdown] = useState("");

  const fetchPresaleInfo = useCallback(async () => {
    try {
      const res = await fetch("/api/presale-info");
      const data = await res.json();
      if (data.configured) {
        setPresale(data);
      }
    } catch (err) {
      console.error("Failed to fetch presale info:", err);
    } finally {
      setIsFetching(false);
    }
  }, []);

  useEffect(() => {
    fetchPresaleInfo();
    const interval = setInterval(fetchPresaleInfo, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [fetchPresaleInfo]);

  // Countdown timer
  useEffect(() => {
    if (!presale) return;

    const target =
      presale.status === "upcoming"
        ? presale.presaleStart
        : presale.presaleEnd;

    const update = () => {
      const now = Math.floor(Date.now() / 1000);
      const diff = target - now;

      if (diff <= 0) {
        setCountdown(presale.status === "upcoming" ? "Starting..." : "Ended");
        fetchPresaleInfo();
        return;
      }

      const d = Math.floor(diff / 86400);
      const h = Math.floor((diff % 86400) / 3600);
      const m = Math.floor((diff % 3600) / 60);
      const s = diff % 60;

      if (d > 0) {
        setCountdown(`${d}d ${h}h ${m}m ${s}s`);
      } else {
        setCountdown(`${h}h ${m}m ${s}s`);
      }
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [presale, fetchPresaleInfo]);

  const handleBuy = async () => {
    if (!account) {
      toast.error("Connect your wallet first");
      return;
    }

    if (!isCorrectChain) {
      toast.error("Switch to the correct network");
      return;
    }

    if (!presale || presale.status !== "active") {
      toast.error("Presale is not active");
      return;
    }

    const value = parseFloat(ethAmount);
    if (isNaN(value) || value <= 0) {
      toast.error("Enter a valid ETH amount");
      return;
    }

    if (value < parseFloat(presale.minPurchase)) {
      toast.error(`Minimum purchase is ${presale.minPurchase} ETH`);
      return;
    }

    if (value > parseFloat(presale.maxPurchase)) {
      toast.error(`Maximum purchase is ${presale.maxPurchase} ETH`);
      return;
    }

    setIsLoading(true);
    try {
      const contract = await getContract();
      if (!contract) throw new Error("Could not get contract");

      const tx = await contract.buyPresale([], {
        value: ethers.parseEther(ethAmount),
      });

      toast.loading("Transaction pending...");
      await tx.wait();
      toast.dismiss();
      toast.success(`Purchased PCENT successfully!`);

      fetchPresaleInfo();
    } catch (error: unknown) {
      const msg =
        error instanceof Error
          ? error.message.includes("rejected")
            ? "Transaction rejected"
            : error.message
          : "Transaction failed";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <section id="presale" className="py-24 px-6">
        <div className="max-w-lg mx-auto text-center">
          <div className="animate-pulse bg-white/10 rounded-2xl h-96" />
        </div>
      </section>
    );
  }

  const raisedPercent = presale
    ? (parseFloat(presale.totalRaised) / parseFloat(presale.hardCap)) * 100
    : 0;

  return (
    <section id="presale" className="py-24 px-6">
      <div className="max-w-lg mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-br from-blue-900/50 via-slate-900/50 to-purple-900/50 backdrop-blur-sm border border-blue-500/20 rounded-3xl p-8 shadow-2xl shadow-blue-500/10"
        >
          <h3 className="text-2xl font-bold text-white text-center mb-2">
            PCENT Presale
          </h3>

          {presale && (
            <div className="text-center mb-6">
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  presale.status === "active"
                    ? "bg-green-500/20 text-green-400"
                    : presale.status === "upcoming"
                    ? "bg-blue-500/20 text-blue-400"
                    : "bg-slate-500/20 text-slate-400"
                }`}
              >
                {presale.status === "active"
                  ? "🟢 Live"
                  : presale.status === "upcoming"
                  ? "🔵 Upcoming"
                  : presale.status === "finalized"
                  ? "✅ Finalized"
                  : "🔴 Ended"}
              </span>
            </div>
          )}

          {countdown && presale?.status !== "finalized" && (
            <div className="text-center mb-6">
              <div className="text-3xl font-mono font-bold text-white">
                {countdown}
              </div>
              <div className="text-sm text-slate-400">
                {presale?.status === "upcoming"
                  ? "until presale starts"
                  : "until presale ends"}
              </div>
            </div>
          )}

          {/* Progress bar */}
          {presale && (
            <div className="mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-400">
                  {presale.totalRaised} ETH raised
                </span>
                <span className="text-slate-400">
                  of {presale.hardCap} ETH
                </span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(raisedPercent, 100)}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                />
              </div>
            </div>
          )}

          {/* Buy form */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-2">
                ETH Amount
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={ethAmount}
                  onChange={(e) => setEthAmount(e.target.value)}
                  min="0.01"
                  step="0.01"
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-xl text-white text-lg font-mono focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="0.1"
                  disabled={
                    !presale || presale.status !== "active" || isLoading
                  }
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">
                  ETH
                </span>
              </div>
            </div>

            {presale && (
              <div className="flex justify-between text-sm text-slate-400">
                <span>
                  Min: {presale.minPurchase} ETH
                </span>
                <span>
                  Max: {presale.maxPurchase} ETH
                </span>
              </div>
            )}

            {presale && presale.status === "active" && (
              <div className="text-center text-sm text-slate-400">
                You will receive{" "}
                <span className="text-white font-mono">
                  {(
                    parseFloat(ethAmount || "0") *
                    (presale?.presaleRate || 0)
                  ).toLocaleString()}
                </span>{" "}
                PCENT
              </div>
            )}

            <button
              onClick={handleBuy}
              disabled={
                !account ||
                !presale ||
                presale.status !== "active" ||
                isLoading ||
                !isCorrectChain
              }
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:from-slate-700 disabled:to-slate-700 text-white rounded-xl font-bold text-lg transition-all duration-200 shadow-lg shadow-blue-600/25 disabled:shadow-none disabled:cursor-not-allowed"
            >
              {isLoading
                ? "Processing..."
                : !account
                ? "Connect Wallet"
                : !isCorrectChain
                ? "Switch Network"
                : presale?.status === "active"
                ? "Buy PCENT"
                : presale?.status === "upcoming"
                ? "Presale Not Started"
                : presale?.status === "finalized"
                ? "Presale Complete"
                : "Presale Ended"}
            </button>
          </div>

          {!presale && (
            <div className="text-center text-slate-400 mt-4">
              Presale information coming soon. Stay tuned!
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
