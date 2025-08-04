import { http, createConfig } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';
import { QueryClient } from '@tanstack/react-query';
import { Chain } from 'wagmi/chains';

// Etherlink Mainnet and Testnet definitions
export const etherlinkMainnet: Chain = {
  id: 42793,
  name: 'Etherlink Mainnet',
  network: 'etherlink',
  nativeCurrency: {
    name: 'Tezos',
    symbol: 'XTZ',
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ['https://node.mainnet.etherlink.com'] },
    public: { http: ['https://node.mainnet.etherlink.com'] },
  },
  blockExplorers: {
    default: { name: 'Etherlink Explorer', url: 'https://explorer.etherlink.com' },
  },
  testnet: false,
};

export const etherlinkTestnet: Chain = {
  id: 128123,
  name: 'Etherlink Testnet',
  // network: 'etherlink-testnet',
  nativeCurrency: {
    name: 'Tezos',
    symbol: 'XTZ',
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ['https://node.ghostnet.etherlink.com'] },
    public: { http: ['https://node.ghostnet.etherlink.com'] },
  },
  blockExplorers: {
    default: { name: 'Etherlink Testnet Explorer', url: 'https://testnet.explorer.etherlink.com/' },
  },
  testnet: true,
};

// Define chains supported by the application
const supportedChains = [mainnet, sepolia, etherlinkMainnet, etherlinkTestnet] as const;

export const wagmiConfig = createConfig({
  chains: supportedChains,
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [etherlinkMainnet.id]: http('https://node.mainnet.etherlink.com'),
    [etherlinkTestnet.id]: http('https://node.ghostnet.etherlink.com'),
  },
  // Optional: Add connectors if needed beyond the default Injected (MetaMask)
  // connectors: [],
});

// Create a TanStack Query client
export const queryClient = new QueryClient();

// Type helper for supported chain IDs
export type SupportedChainId = (typeof supportedChains)[number]['id'];
