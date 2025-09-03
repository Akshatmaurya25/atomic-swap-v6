'use client';

import '@rainbow-me/rainbowkit/styles.css';
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { config } from '@/config/wagmi';
import { AuthProvider } from './AuthProvider';
import { ReactNode } from 'react';

const queryClient = new QueryClient();

interface Web3ProviderProps {
  children: ReactNode;
}

export function Web3Provider({ children }: Web3ProviderProps) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <RainbowKitProvider
            theme={darkTheme({
              accentColor: '#FFEB3B', // Yellow accent color for Yellow Network theme
              accentColorForeground: 'black',
              borderRadius: 'medium',
            })}
            showRecentTransactions={true}
            appInfo={{
              appName: 'Yellow Network Arbitrage Bot',
              learnMoreUrl: 'https://yellownetwork.io',
            }}
          >
            {children}
          </RainbowKitProvider>
        </AuthProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}