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

// Chain-related configurations

// Map of chain IDs to readable names
export const chainNames: Record<number, string> = {
  1: 'Ethereum',
  10: 'Optimism',
  137: 'Polygon',
  8453: 'Base',
  42161: 'Arbitrum',
  // Add more chains as needed
};

// Map of chain IDs to block explorer URLs
export const blockExplorers: Record<number, string> = {
  1: 'https://etherscan.io',
  10: 'https://optimistic.etherscan.io',
  137: 'https://polygonscan.com',
  8453: 'https://basescan.org',
  42161: 'https://arbiscan.io',
  // Add more explorers as needed
};
