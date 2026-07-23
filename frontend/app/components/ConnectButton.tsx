"use client";

import { useWallet } from "./WalletProvider";
import { truncateAddress } from "@/lib/web3";

export default function ConnectButton() {
  const { account, isConnecting, connect, disconnect, isCorrectChain } = useWallet();

  if (account && !isCorrectChain) {
    return (
      <button
        onClick={connect}
        className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium text-sm transition-all duration-200 shadow-lg shadow-red-600/25"
      >
        Wrong Network
      </button>
    );
  }

  if (account) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-4 py-2 bg-blue-900/50 border border-blue-700/50 rounded-lg">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-sm text-blue-200 font-mono">
            {truncateAddress(account)}
          </span>
        </div>
        <button
          onClick={disconnect}
          className="px-3 py-2 text-sm text-slate-400 hover:text-white transition-colors"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={connect}
      disabled={isConnecting}
      className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-lg font-medium text-sm transition-all duration-200 shadow-lg shadow-blue-600/25 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isConnecting ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          Connecting...
        </span>
      ) : (
        "Connect Wallet"
      )}
    </button>
  );
}
