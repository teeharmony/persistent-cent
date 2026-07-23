"use client";

import { motion } from "framer-motion";
import ConnectButton from "./ConnectButton";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-transparent to-purple-900/20" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-300 text-sm mb-8">
            <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
            Presale Now Live
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Persistent{" "}
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Cent
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-slate-300 mb-4 max-w-2xl mx-auto">
            The People&apos;s Token
          </p>

          <p className="text-lg text-slate-400 mb-10 max-w-2xl mx-auto">
            A community-driven token built on transparency, locked liquidity, and
            fair distribution. Join the revolution in decentralized finance.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <ConnectButton />
            <a
              href="#presale"
              className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-all duration-200 border border-white/20"
            >
              Buy PCENT
            </a>
          </div>

          <div className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">100B</div>
              <div className="text-sm text-slate-400">Total Supply</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">30%</div>
              <div className="text-sm text-slate-400">Presale</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">Locked</div>
              <div className="text-sm text-slate-400">Liquidity</div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <svg
          className="w-6 h-6 text-slate-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      </motion.div>
    </section>
  );
}
