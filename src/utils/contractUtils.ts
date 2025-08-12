
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

// Sui Network Configuration
export const SUI_CONFIG = {
  PACKAGE_ID: '0x1338a3eb832f3d71f34f9f0ac2637367228219a591e68ee46add2192e547c881',
  TESTNET: {
    USER_PROFILE_REGISTRY: '0x39e0aaf986265e1c2657232a597555c8632014239cfcad3496912edcd38203cf',
    PROJECT_REGISTRY: '0x4e9112b5dce9a53cefa48a039b66308bf8554ad982715215bce12436b1d7a17b',
    REPUTATION_REGISTRY: '0xe00f9e6b48f1a2079c320e8017112ae3caa698aee06e0d08534e719cdd5e8c2e',
    MESSAGING_REGISTRY: '0x04c4c65442c14df15ab1a27ffc0d8ac2ff74a77764871d68802c38cf5bd6636d',
  },
  MAINNET: {
    USER_PROFILE_REGISTRY: '',
    PROJECT_REGISTRY: '',
    REPUTATION_REGISTRY: '',
    MESSAGING_REGISTRY: '',
  }
};

// Contract constants mirroring the Move contracts
export const CONTRACT_CONSTANTS = {
  // Project Status
  PROJECT_STATUS: {
    OPEN: 0,
    ACTIVE: 1,
    COMPLETED: 2,
    CANCELLED: 3,
    DISPUTED: 4,
  },
  
  // Milestone Status
  MILESTONE_STATUS: {
    PENDING: 0,
    IN_PROGRESS: 1,
    SUBMITTED: 2,
    APPROVED: 3,
    DISPUTED: 4,
  },
  
  // Message Types
  MESSAGE_TYPE: {
    TEXT: 0,
    FILE: 1,
    PROJECT_UPDATE: 2,
    SYSTEM: 3,
  },
  
  // Notification Types
  NOTIFICATION_TYPE: {
    MESSAGE: 0,
    PROJECT: 1,
    PAYMENT: 2,
    REVIEW: 3,
    SYSTEM: 4,
  },
};

// Helper functions for contract interactions
export const contractUtils = {
  // Convert string to bytes array for Move contracts
  stringToBytes: (str: string): number[] => {
    return Array.from(new TextEncoder().encode(str));
  },
  
  // Convert timestamp to Move-compatible format
  timestampToMove: (date: Date): number => {
    return date.getTime();
  },
  
  // Parse Move object content
  parseMoveObject: (objectData: any) => {
    try {
      if (objectData?.content?.fields) {
        return objectData.content.fields;
      }
      return null;
    } catch (error) {
      console.error('Error parsing Move object:', error);
      return null;
    }
  },
  
  // Format SUI amount (convert from MIST to SUI)
  formatSuiAmount: (amount: number): number => {
    return amount / 1_000_000_000; // Convert MIST to SUI
  },
  
  // Convert SUI to MIST for contract calls
  suiToMist: (suiAmount: number): number => {
    return Math.floor(suiAmount * 1_000_000_000);
  },
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

// Standard ERC20 ABI subset
export const ERC20_ABI = [
  // Read-Only Functions
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function totalSupply() view returns (uint256)",

  // Authenticated Functions
  "function approve(address spender, uint256 amount) returns (bool)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) returns (bool)",

  // Events
  "event Approval(address indexed owner, address indexed spender, uint256 value)",
  "event Transfer(address indexed from, address indexed to, uint256 value)",
];

// Standard ERC721 ABI subset
export const ERC721_ABI = [
  // Read-Only Functions
  "function balanceOf(address owner) view returns (uint256)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function symbol() view returns (string)",
  "function name() view returns (string)",
  "function tokenURI(uint256 tokenId) view returns (string)",

  // Authenticated Functions
  "function approve(address to, uint256 tokenId)",
  "function safeTransferFrom(address from, address to, uint256 tokenId)",
  "function safeTransferFrom(address from, address to, uint256 tokenId, bytes data)",
  "function setApprovalForAll(address operator, bool approved)",
  "function transferFrom(address from, address to, uint256 tokenId)",
  "function mint(uint256 tokenId)", // Common non-standard mint function

  // Events
  "event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId)",
  "event ApprovalForAll(address indexed owner, address indexed operator, bool approved)",
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
];
