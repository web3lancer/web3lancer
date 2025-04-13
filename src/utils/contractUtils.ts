/**
 * Centralized configuration for Web3Lancer smart contracts across different chains.
 * Uses environment variables (NEXT_PUBLIC_...) for addresses and URLs where possible.
 */

// Ensure environment variables are prefixed with NEXT_PUBLIC_ to be available client-side in Next.js
// Provide sensible defaults or placeholders if environment variables are not set.

export const WEB3LANCER_CONTRACTS = {
  ETHEREUM: {
    // Address for the NFT minting contract used in MintNFT component (tokens/page.tsx)
    // Replace placeholder "0x..." with the actual deployed contract address or ensure the env var is set.
    ADDRESS: process.env.NEXT_PUBLIC_ETH_NFT_CONTRACT_ADDRESS || "0x...",
    // Add other Ethereum contract details as needed (e.g., ABI, RPC URL if not handled by wallet provider)
  },
  STELLAR: {
    // Contract ID used in tokens/page.tsx for displaying Stellar contract info
    // Replace placeholder "C..." with the actual deployed contract ID or ensure the env var is set.
    CONTRACT_ID: process.env.NEXT_PUBLIC_STELLAR_CONTRACT_ID || "C...",
    // Base explorer URL used in tokens/page.tsx. Appends the contract ID.
    EXPLORER_URL: process.env.NEXT_PUBLIC_STELLAR_EXPLORER_URL || "https://stellar.expert/explorer/public/contract/", // Example, adjust if needed
    // Add other Stellar contract details as needed (e.g., network passphrase)
  },
  XION: {
    // Main contract address used in xionContractUtils.ts and tokens/page.tsx
    // Address from xion-backend.md
    CONTRACT_ID: process.env.NEXT_PUBLIC_XION_CONTRACT_ID || "xion1zmfzcrhl50044neqzdxcf4aa8dec9h04yvfqqamyxme0v2xwdwpsetfsz0",
    // Treasury contract address from xion-backend.md (also used in xion.md AbstraxionProvider config)
    TREASURY_CONTRACT_ID: process.env.NEXT_PUBLIC_XION_TREASURY_CONTRACT_ID || "xion1tgklnqvs58zpfpetphqxulkx8c380hqvdjppu34tqte5kldj23msed7pau",
    // RPC URL from xion.md and xion-backend-integration.md
    RPC_URL: process.env.NEXT_PUBLIC_XION_RPC_URL || "https://rpc.xion-testnet-2.burnt.com/",
    // REST URL from xion.md
    REST_URL: process.env.NEXT_PUBLIC_XION_REST_URL || "https://api.xion-testnet-2.burnt.com/",
    // Chain ID from xion-backend-integration.md
    CHAIN_ID: process.env.NEXT_PUBLIC_XION_CHAIN_ID || "xion-testnet-2",
    // Add other XION contract details as needed (e.g., specific function signatures if not handled elsewhere)
  },
  // Add configurations for other chains if the application expands (e.g., Polygon, Arbitrum, Base)
  // Example:
  // POLYGON: {
  //   SOME_CONTRACT_ADDRESS: process.env.NEXT_PUBLIC_POLYGON_CONTRACT_ADDRESS || "0x...",
  //   RPC_URL: process.env.NEXT_PUBLIC_POLYGON_RPC_URL || "https://polygon-rpc.com",
  // },
};

/**
 * Gets the full Stellar explorer URL for a given contract ID.
 * @param contractId The Stellar contract ID.
 * @returns The full URL to view the contract on the explorer.
 */
export const getStellarContractExplorerUrl = (contractId: string): string => {
  const baseUrl = WEB3LANCER_CONTRACTS.STELLAR.EXPLORER_URL;
  // Ensure the base URL ends with a slash before appending the contract ID
  const separator = baseUrl.endsWith('/') ? '' : '/';
  return `${baseUrl}${separator}${contractId}`;
};

/**
 * Gets the configured XION RPC URL.
 * @returns The XION RPC URL.
 */
export const getXionRpcUrl = (): string => {
  return WEB3LANCER_CONTRACTS.XION.RPC_URL;
};

/**
 * Gets the configured XION REST URL.
 * @returns The XION REST URL.
 */
export const getXionRestUrl = (): string => {
  return WEB3LANCER_CONTRACTS.XION.REST_URL;
};

/**
 * Gets the configured XION Chain ID.
 * @returns The XION Chain ID.
 */
export const getXionChainId = (): string => {
  return WEB3LANCER_CONTRACTS.XION.CHAIN_ID;
};

// Type guard to check if a chain configuration exists
export type SupportedChain = keyof typeof WEB3LANCER_CONTRACTS;

export function isSupportedChain(chain: string): chain is SupportedChain {
  return chain in WEB3LANCER_CONTRACTS;
}
