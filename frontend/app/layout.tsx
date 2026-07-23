import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";
import { WalletProvider } from "./components/WalletProvider";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Persistent Cent | The People's Token",
  description:
    "Persistent Cent (PCENT) — A community-driven token with transparent presale, locked liquidity, and a vision for decentralized finance accessible to everyone.",
  keywords: ["Persistent Cent", "PCENT", "crypto", "token", "presale", "DeFi", "Ethereum"],
  openGraph: {
    title: "Persistent Cent — The People's Token",
    description: "Join the presale for PCENT — transparent, fair, and community-first.",
    type: "website",
    locale: "en_US",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={inter.className}>
        <WalletProvider>
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: "#1e3a8a",
                color: "#fff",
                borderRadius: "12px",
              },
            }}
          />
        </WalletProvider>
      </body>
    </html>
  );
}
