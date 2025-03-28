import { http, createConfig } from 'wagmi';
import { mainnet, base, arbitrum, optimism, polygon } from 'wagmi/chains';
import { injected, metaMask, walletConnect, coinbaseWallet } from 'wagmi/connectors';

// Replace with your WalletConnect Project ID
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID';

// Create a list of supported chains
const chains = [mainnet, base, polygon, optimism, arbitrum];

// Create wagmi config with better configuration for wallet detection
export const config = createConfig({
  chains,
  // Enable auto-detection of wallets by using injected connector first
  connectors: [
    // Injected connector will detect ALL browser wallets (MetaMask, Brave, OKX, custom wallets, etc.)
    injected({
      shimDisconnect: true,
      // This ensures we detect any injected wallet, even if it's not in our predefined list
      getProvider: () => typeof window !== 'undefined' ? window.ethereum : undefined,
    }),
    
    // Also add specific wallet connectors for better UX with popular wallets
    metaMask({ shimDisconnect: true }),
    
    // WalletConnect as fallback for mobile users or those without browser extensions
    walletConnect({ 
      projectId,
      showQrModal: true,
      metadata: {
        name: 'Web3Lancer',
        description: 'Decentralized Freelancing Platform',
        url: 'https://web3lancer.com',
        icons: ['https://web3lancer.com/logo.png']
      }
    }),
    
    // Coinbase Wallet for Coinbase users
    coinbaseWallet({
      appName: 'Web3Lancer',
      appLogoUrl: 'https://web3lancer.com/logo.png'
    }),
  ],
  
  // Configure transports for all chains
  transports: {
    [mainnet.id]: http(),
    [base.id]: http(),
    [polygon.id]: http(),
    [optimism.id]: http(),
    [arbitrum.id]: http(),
  },
});

// Add human-readable chain names
export const chainNames = {
  [mainnet.id]: 'Ethereum',
  [base.id]: 'Base',
  [polygon.id]: 'Polygon',
  [optimism.id]: 'Optimism',
  [arbitrum.id]: 'Arbitrum',
};

// Add explorer URLs
export const blockExplorers = {
  [mainnet.id]: 'https://etherscan.io',
  [base.id]: 'https://basescan.org',
  [polygon.id]: 'https://polygonscan.com',
  [optimism.id]: 'https://optimistic.etherscan.io',
  [arbitrum.id]: 'https://arbiscan.io',
};
