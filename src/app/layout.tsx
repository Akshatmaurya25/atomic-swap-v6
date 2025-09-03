import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Web3Provider } from "@/providers/Web3Provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Yellow Network Arbitrage Bot - Professional Cross-Chain Trading Platform",
  description: "Advanced arbitrage bot platform for Yellow Network with cross-chain atomic swaps, real-time analytics, and automated trading strategies.",
  keywords: ["Yellow Network", "Arbitrage", "Cross-chain", "DeFi", "Trading Bot", "Atomic Swaps"],
  authors: [{ name: "Yellow Network Team" }],
  openGraph: {
    title: "Yellow Network Arbitrage Bot",
    description: "Professional cross-chain arbitrage trading platform",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-900 text-white`}
      >
        <Web3Provider>
          {children}
        </Web3Provider>
      </body>
    </html>
  );
}
