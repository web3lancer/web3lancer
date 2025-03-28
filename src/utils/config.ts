import { http, createConfig } from 'wagmi';
import { mainnet, base, arbitrum, optimism, polygon } from 'wagmi/chains';
import { injected, metaMask, safe, walletConnect, coinbaseWallet } from 'wagmi/connectors';

// Replace with your WalletConnect Project ID
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID';

// Create wagmi config with all required connectors
export const config = createConfig({
  chains: [mainnet, base, polygon, optimism, arbitrum],
  connectors: [
    injected({ shimDisconnect: true }),
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
    metaMask({ shimDisconnect: true }),
    coinbaseWallet({
      appName: 'Web3Lancer',
      appLogoUrl: 'https://web3lancer.com/logo.png'
    }),
    safe()
  ],
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
