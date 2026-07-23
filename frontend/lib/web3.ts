import { BrowserProvider, Contract, JsonRpcSigner } from "ethers";
import { CONTRACT_ADDRESS, PRESALE_ABI, CHAIN_ID } from "./contracts";

export interface EthereumProvider {
  isMetaMask?: boolean;
  chainId?: string;
  selectedAddress?: string;
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on?: (event: string, handler: (...args: unknown[]) => void) => void;
  removeListener?: (event: string, handler: (...args: unknown[]) => void) => void;
}

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

export function getProvider(): BrowserProvider | null {
  if (typeof window === "undefined" || !window.ethereum) return null;
  return new BrowserProvider(window.ethereum);
}

export async function getSigner(): Promise<JsonRpcSigner | null> {
  const provider = getProvider();
  if (!provider) return null;
  try {
    return await provider.getSigner();
  } catch {
    return null;
  }
}

export async function getContract(): Promise<Contract | null> {
  const signer = await getSigner();
  if (!signer) return null;
  return new Contract(CONTRACT_ADDRESS, PRESALE_ABI, signer);
}

export async function getReadOnlyContract(): Promise<Contract | null> {
  const provider = getProvider();
  if (!provider) return null;
  return new Contract(CONTRACT_ADDRESS, PRESALE_ABI, provider);
}

export async function connectWallet(): Promise<string | null> {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("MetaMask is not installed");
  }

  const accounts = await window.ethereum.request({
    method: "eth_requestAccounts",
  });

  const account = (accounts as string[])[0];
  if (!account) throw new Error("No accounts found");

  // Switch to correct chain
  const currentChainId = await window.ethereum.request({ method: "eth_chainId" });
  const targetChainId = `0x${CHAIN_ID.toString(16)}`;

  if (currentChainId !== targetChainId) {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: targetChainId }],
      });
    } catch (switchError: unknown) {
      // Chain not added — add it
      const err = switchError as { code?: number };
      if (err.code === 4902) {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: targetChainId,
              chainName: CHAIN_ID === 31337 ? "Hardhat Local" : "Ethereum Mainnet",
              rpcUrls: [CHAIN_ID === 31337 ? "http://127.0.0.1:8545" : "https://mainnet.infura.io/v3/"],
              nativeCurrency: {
                name: "ETH",
                symbol: "ETH",
                decimals: 18,
              },
            },
          ],
        });
      } else {
        throw switchError;
      }
    }
  }

  return account;
}

export function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
