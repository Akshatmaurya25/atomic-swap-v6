import { Wallet } from '@rainbow-me/rainbowkit';

export const keplrWallet = (): Wallet => ({
  id: 'keplr',
  name: 'Keplr',
  iconUrl: 'https://wallet.keplr.app/icon.png',
  iconBackground: '#fff',
  installed: typeof window !== 'undefined' && !!window.keplr,
  downloadUrls: {
    browserExtension: 'https://chrome.google.com/webstore/detail/keplr/dmkamcknogkgcdfhhbddcghachkejeap',
    chrome: 'https://chrome.google.com/webstore/detail/keplr/dmkamcknogkgcdfhhbddcghachkejeap',
    firefox: 'https://addons.mozilla.org/en-US/firefox/addon/keplr/',
  },
  createConnector: () => {
    const connector = {
      id: 'keplr',
      name: 'Keplr',
      type: 'injected' as const,
      async connect() {
        if (typeof window === 'undefined' || !window.keplr) {
          throw new Error('Keplr extension not found');
        }

        try {
          // Enable Keplr
          await window.keplr.enable('cosmoshub-4');
          const offlineSigner = window.getOfflineSigner('cosmoshub-4');
          const accounts = await offlineSigner.getAccounts();
          
          if (accounts.length === 0) {
            throw new Error('No accounts found');
          }

          return {
            account: accounts[0].address as `0x${string}`,
            chain: { id: 1, unsupported: false },
          };
        } catch (error) {
          throw new Error(`Failed to connect to Keplr: ${error}`);
        }
      },
      async disconnect() {
        // Keplr doesn't have a disconnect method
        return;
      },
      async getAccount() {
        if (typeof window === 'undefined' || !window.keplr) {
          throw new Error('Keplr extension not found');
        }

        const offlineSigner = window.getOfflineSigner('cosmoshub-4');
        const accounts = await offlineSigner.getAccounts();
        return accounts[0]?.address as `0x${string}` || null;
      },
      async getChainId() {
        return 1; // Default to mainnet
      },
      async isAuthorized() {
        try {
          if (typeof window === 'undefined' || !window.keplr) {
            return false;
          }
          
          const offlineSigner = window.getOfflineSigner('cosmoshub-4');
          const accounts = await offlineSigner.getAccounts();
          return accounts.length > 0;
        } catch {
          return false;
        }
      },
      on: () => {},
      removeListener: () => {},
    };

    return connector as any;
  },
});

// Extend Window interface for Keplr
declare global {
  interface Window {
    keplr: any;
    getOfflineSigner: any;
  }
}