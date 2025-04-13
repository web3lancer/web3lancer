import { http, createConfig } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';
import { QueryClient } from '@tanstack/react-query';

// Define chains supported by the application
const supportedChains = [mainnet, sepolia] as const; // Add other chains as needed

export const wagmiConfig = createConfig({
  chains: supportedChains,
  transports: {
    // Configure HTTP transport for each chain
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    // Add transports for other chains if necessary
  },
  // Optional: Add connectors if needed beyond the default Injected (MetaMask)
  // connectors: [],
});

// Create a TanStack Query client
export const queryClient = new QueryClient();

// Type helper for supported chain IDs
export type SupportedChainId = (typeof supportedChains)[number]['id'];
