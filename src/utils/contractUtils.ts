import { useMetaMask } from '@/hooks/useMetaMask';

// Standard ERC-20 ABI for common token functions
export const ERC20_ABI = [
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "owner", type: "address" }],
    outputs: [{ name: "balance", type: "uint256" }],
  },
  {
    name: "transfer",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "success", type: "bool" }],
  },
  {
    name: "symbol",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "symbol", type: "string" }],
  },
  {
    name: "decimals",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "decimals", type: "uint8" }],
  },
];

// Standard ERC-721 (NFT) ABI for common functions
export const ERC721_ABI = [
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "owner", type: "address" }],
    outputs: [{ name: "balance", type: "uint256" }],
  },
  {
    name: "ownerOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [{ name: "owner", type: "address" }],
  },
  {
    name: "mint",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [],
  },
  {
    name: "transferFrom",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "from", type: "address" },
      { name: "to", type: "address" },
      { name: "tokenId", type: "uint256" },
    ],
    outputs: [],
  },
];

// Web3Lancer Contract Details
export const WEB3LANCER_CONTRACTS = {
  // From README.md
  STELLAR: {
    CONTRACT_ID: "CDFJTPECWESQLM4NCVBD3VQZ2VMOL7LOK6EEJHTJ3MM4OFNNNJORB5HN",
    NETWORK: "testnet",
    EXPLORER_URL: "https://stellar.expert/explorer/testnet/contract/CDFJTPECWESQLM4NCVBD3VQZ2VMOL7LOK6EEJHTJ3MM4OFNNNJORB5HN"
  },
  // Example EVM contract address - replace with actual when deployed
  ETHEREUM: {
    ADDRESS: "0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2",
    NETWORK_ID: 1, // Mainnet
  }
};

/**
 * Read data from a contract using MetaMask provider
 * @param contractAddress The contract address
 * @param abi ABI array or specific function ABI
 * @param functionName Name of the function to call
 * @param args Arguments to pass to the function
 * @returns Promise with the result
 */
export async function readContract({
  contractAddress,
  abi,
  functionName,
  args = [],
}: {
  contractAddress: string;
  abi: any[];
  functionName: string;
  args?: any[];
}) {
  try {
    if (typeof window === 'undefined' || !window.ethereum) {
      throw new Error('MetaMask not available');
    }

    // Create the call data
    const abiItem = Array.isArray(abi) ? 
      abi.find(item => item.name === functionName) : 
      abi;
      
    if (!abiItem) {
      throw new Error(`Function ${functionName} not found in ABI`);
    }

    // Encode the function call
    const provider = window.ethereum;
    
    // Format the data for the eth_call
    const data = {
      to: contractAddress,
      data: encodeFunction(abiItem, args),
    };
    
    // Make the call
    const result = await provider.request({
      method: 'eth_call',
      params: [data, 'latest'],
    });
    
    // Decode the result
    return decodeResult(result, abiItem.outputs);
  } catch (error) {
    console.error('Error reading contract:', error);
    throw error;
  }
}

/**
 * Simple function to encode contract calls
 * Note: This is a simplified version - in production use ethers.js or viem
 */
function encodeFunction(abiItem: any, args: any[]) {
  // This is a simplified placeholder - in a real app, use a proper ABI encoder
  // return ethers.utils.encodeFunctionData(abiItem, args);
  
  // Simple implementation for demo purposes
  const functionSignature = `${abiItem.name}(${abiItem.inputs.map((i: any) => i.type).join(',')})`;
  const functionHash = `0x${functionSignature.slice(0, 10).padEnd(10, '0')}`;
  
  // In a real implementation, we would encode the args properly
  return functionHash;
}

/**
 * Simple function to decode contract results
 * Note: This is a simplified version - in production use ethers.js or viem
 */
function decodeResult(hexData: string, outputs: any[]) {
  // This is a simplified placeholder - in a real app, use a proper ABI decoder
  // return ethers.utils.defaultAbiCoder.decode(outputs.map(o => o.type), hexData);
  
  // Simple implementation for demo purposes
  if (!hexData || hexData === '0x') {
    return null;
  }
  
  // For the sake of this example, just return the hex data
  return hexData;
}
