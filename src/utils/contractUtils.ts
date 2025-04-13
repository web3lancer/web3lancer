/**
 * Contract utility functions and constants
 */

// Common ERC-20 ABI
export const ERC20_ABI = [
  {
    constant: true,
    inputs: [],
    name: "name",
    outputs: [{ name: "", type: "string" }],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [],
    name: "symbol",
    outputs: [{ name: "", type: "string" }],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [],
    name: "decimals",
    outputs: [{ name: "", type: "uint8" }],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [{ name: "owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      { name: "to", type: "address" },
      { name: "value", type: "uint256" }
    ],
    name: "transfer",
    outputs: [{ name: "", type: "bool" }],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: true,
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" }
    ],
    name: "allowance",
    outputs: [{ name: "", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      { name: "spender", type: "address" },
      { name: "value", type: "uint256" }
    ],
    name: "approve",
    outputs: [{ name: "", type: "bool" }],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  }
];

// Common ERC-721 ABI
export const ERC721_ABI = [
  {
    constant: true,
    inputs: [{ name: "tokenId", type: "uint256" }],
    name: "ownerOf",
    outputs: [{ name: "", type: "address" }],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      { name: "from", type: "address" },
      { name: "to", type: "address" },
      { name: "tokenId", type: "uint256" }
    ],
    name: "transferFrom",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      { name: "to", type: "address" },
      { name: "tokenId", type: "uint256" }
    ],
    name: "mint",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  }
];

/**
 * Read data from a contract
 */
export async function readContract({ 
  contractAddress, 
  abi, 
  functionName, 
  args = [] 
}: { 
  contractAddress: string; 
  abi: any[]; 
  functionName: string; 
  args?: any[]; 
}) {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('Ethereum provider not available');
  }

  try {
    // Find the function in the ABI
    const abiItem = abi.find(item => item.name === functionName);
    if (!abiItem) {
      throw new Error(`Function ${functionName} not found in ABI`);
    }

    // This is a simplified implementation - in production, use ethers.js or web3.js
    const result = await window.ethereum.request({
      method: 'eth_call',
      params: [
        {
          to: contractAddress,
          data: encodeFunction(abiItem, args)
        },
        'latest'
      ]
    });

    // Decode the result (simplified - in production use proper ABI decoding)
    return result;
  } catch (error) {
    console.error('Error reading from contract:', error);
    throw error;
  }
}

// Simplified function encoding (in production use ethers.js or web3.js)
function encodeFunction(abiItem: any, args: any[]) {
  // This is a placeholder - in a real implementation you'd use proper ABI encoding
  const functionSignature = `${abiItem.name}(${abiItem.inputs.map((i: any) => i.type).join(',')})`;
  const functionHash = `0x${functionSignature.slice(0, 10).padEnd(10, '0')}`;
  return functionHash;
}

// Define contract addresses and ABIs here

// Example for Stellar (adjust based on your actual setup)
const STELLAR_CONTRACT_ID = process.env.NEXT_PUBLIC_STELLAR_CONTRACT_ID || "CD...YOUR_STELLAR_CONTRACT_ID...XYZ";

// Xion Contract Addresses
const XION_CONTRACT_ADDRESS = "xion1zmfzcrhl50044neqzdxcf4aa8dec9h04yvfqqamyxme0v2xwdwpsetfsz0";
const XION_TREASURY_ADDRESS = "xion1tgklnqvs58zpfpetphqxulkx8c380hqvdjppu34tqte5kldj23msed7pau";

export const WEB3LANCER_CONTRACTS = {
  STELLAR: {
    CONTRACT_ID: STELLAR_CONTRACT_ID,
    // Add ABI or relevant details if needed
  },
  // Add Xion contract details
  XION: {
    CONTRACT_ID: XION_CONTRACT_ADDRESS,
    TREASURY_ID: XION_TREASURY_ADDRESS,
    RPC_URL: "https://rpc.xion-testnet-2.burnt.com/",
    REST_URL: "https://api.xion-testnet-2.burnt.com/"
  },
  // Add other chains/contracts as needed
};

// Function to get contract details by chain name
export const getContractDetails = (chain: 'STELLAR' | 'XION') => {
  return WEB3LANCER_CONTRACTS[chain];
};

// You might add functions here to interact with contracts using libraries
// like stellar-sdk or cosmwasm clients, initialized with the addresses above.
