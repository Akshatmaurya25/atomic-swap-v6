import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { 
  sepolia,
  polygonMumbai,
  optimismSepolia,
  arbitrumSepolia,
  baseSepolia,
  mainnet,
  polygon,
  arbitrum,
  optimism,
  base
} from 'wagmi/chains';
// import { injected, walletConnect, coinbaseWallet } from 'wagmi/connectors';

// Define chains based on environment
const isTestnet = process.env.NEXT_PUBLIC_NETWORK === 'testnet';

const chains = isTestnet 
  ? [sepolia, polygonMumbai, optimismSepolia, arbitrumSepolia, baseSepolia] as const
  : [mainnet, polygon, arbitrum, optimism, base] as const;

export const config = getDefaultConfig({
  appName: 'Yellow Network Arbitrage Bot',
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || 'your-project-id',
  chains,
  ssr: true,
});