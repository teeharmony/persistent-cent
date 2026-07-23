"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { BrowserProvider, JsonRpcSigner } from "ethers";
import toast from "react-hot-toast";

interface WalletContextType {
  account: string | null;
  provider: BrowserProvider | null;
  signer: JsonRpcSigner | null;
  isConnecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  isCorrectChain: boolean;
}

const WalletContext = createContext<WalletContextType>({
  account: null,
  provider: null,
  signer: null,
  isConnecting: false,
  connect: async () => {},
  disconnect: () => {},
  isCorrectChain: false,
});

export function useWallet() {
  return useContext(WalletContext);
}

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [signer, setSigner] = useState<JsonRpcSigner | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isCorrectChain, setIsCorrectChain] = useState(false);

  const checkChain = useCallback(async (ethereum: any) => {
    if (!ethereum) return;
    try {
      const chainId = await ethereum.request({ method: "eth_chainId" });
      const targetChainId = process.env.NEXT_PUBLIC_CHAIN_ID
        ? `0x${parseInt(process.env.NEXT_PUBLIC_CHAIN_ID).toString(16)}`
        : "0x7a69"; // 31337
      setIsCorrectChain(chainId === targetChainId);
    } catch {
      setIsCorrectChain(false);
    }
  }, []);

  const connect = useCallback(async () => {
    if (typeof window === "undefined" || !window.ethereum) {
      toast.error("Please install MetaMask to participate in the presale");
      return;
    }

    setIsConnecting(true);
    try {
      const bp = new BrowserProvider(window.ethereum);
      const accs = await bp.send("eth_requestAccounts", []);
      const s = await bp.getSigner();

      setProvider(bp);
      setSigner(s);
      setAccount(accs[0]);
      await checkChain(window.ethereum);

      toast.success("Wallet connected!");
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Failed to connect wallet";
      toast.error(msg);
    } finally {
      setIsConnecting(false);
    }
  }, [checkChain]);

  const disconnect = useCallback(() => {
    setAccount(null);
    setProvider(null);
    setSigner(null);
    setIsCorrectChain(false);
  }, []);

  // Auto-connect on mount if already connected
  useEffect(() => {
    if (typeof window !== "undefined" && window.ethereum) {
      window.ethereum.request({ method: "eth_accounts" }).then((accounts: unknown) => {
        const accs = accounts as string[];
        if (accs.length > 0) {
          connect();
        }
      });

      // Listen for account changes
      window.ethereum.on?.("accountsChanged", (accounts: unknown) => {
        const accs = accounts as string[];
        if (accs.length === 0) {
          disconnect();
        } else {
          connect();
        }
      });

      // Listen for chain changes
      window.ethereum.on?.("chainChanged", () => {
        checkChain(window.ethereum);
      });
    }

    return () => {
      if (typeof window !== "undefined" && window.ethereum) {
        window.ethereum.removeListener?.("accountsChanged", () => {});
        window.ethereum.removeListener?.("chainChanged", () => {});
      }
    };
  }, [connect, disconnect, checkChain]);

  return (
    <WalletContext.Provider
      value={{
        account,
        provider,
        signer,
        isConnecting,
        connect,
        disconnect,
        isCorrectChain,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}
