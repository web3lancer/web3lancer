import { useState, useEffect } from 'react';
import { useMetaMask } from './useMetaMask';
import { readContract, ERC20_ABI, ERC721_ABI } from '@/utils/contractUtils';

interface UseReadContractProps {
  address: string;
  abi: any[];
  functionName: string;
  args?: any[];
  enabled?: boolean;
}

interface UseWriteContractResult {
  writeContract: (params: {
    address: string;
    abi: any[];
    functionName: string;
    args?: any[];
    value?: string;
  }) => Promise<string>;
  data: string | null;
  error: Error | null;
  isPending: boolean;
}

/**
 * Hook to read data from a contract
 */
export function useReadContract({
  address,
  abi,
  functionName,
  args = [],
  enabled = true
}: UseReadContractProps) {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  
  const { isConnected, chainId } = useMetaMask();

  useEffect(() => {
    if (!enabled || !isConnected || !address) {
      return;
    }

    async function fetchData() {
      setIsLoading(true);
      setIsError(false);
      setError(null);
      
      try {
        const result = await readContract({
          contractAddress: address,
          abi,
          functionName,
          args,
        });
        
        setData(result);
      } catch (err) {
        setIsError(true);
        setError(err instanceof Error ? err : new Error('Unknown error'));
        console.error('Error reading contract:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [address, functionName, enabled, isConnected, chainId, JSON.stringify(args)]);

  return {
    data,
    isError,
    isLoading,
    error
  };
}

/**
 * Hook to write data to a contract
 */
export function useWriteContract(): UseWriteContractResult {
  const [data, setData] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isPending, setIsPending] = useState<boolean>(false);
  
  const { account, sendTransaction, provider } = useMetaMask();

  const writeContract = async ({
    address,
    abi,
    functionName,
    args = [],
    value = '0x0'
  }: {
    address: string;
    abi: any[];
    functionName: string;
    args?: any[];
    value?: string;
  }): Promise<string> => {
    if (!provider || !account) {
      throw new Error('MetaMask not connected');
    }

    setIsPending(true);
    setError(null);
    
    try {
      // Find the function in the ABI
      const abiItem = abi.find(item => item.name === functionName);
      if (!abiItem) {
        throw new Error(`Function ${functionName} not found in ABI`);
      }
      
      // Encode the function call
      // In a real implementation, use a proper ABI encoder like ethers.js
      const functionSignature = `${abiItem.name}(${abiItem.inputs.map((i: any) => i.type).join(',')})`;
      const functionHash = `0x${functionSignature.slice(0, 10).padEnd(10, '0')}`;
      
      // Create the transaction
      const txHash = await sendTransaction({
        to: address,
        value,
        data: functionHash // This should be properly encoded in production
      });
      
      setData(txHash);
      return txHash;
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Unknown error');
      setError(errorObj);
      throw errorObj;
    } finally {
      setIsPending(false);
    }
  };

  return {
    writeContract,
    data,
    error,
    isPending
  };
}

/**
 * Hook to wait for a transaction receipt
 */
export function useWaitForTransactionReceipt({ hash }: { hash: string | null }) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [receipt, setReceipt] = useState<any | null>(null);
  const [error, setError] = useState<Error | null>(null);
  
  const { provider } = useMetaMask();

  useEffect(() => {
    if (!hash || !provider) return;

    let mounted = true;
    setIsLoading(true);
    
    const checkReceipt = async () => {
      try {
        const txReceipt = await provider.request({
          method: 'eth_getTransactionReceipt',
          params: [hash],
        });
        
        if (txReceipt && txReceipt.blockNumber && mounted) {
          setReceipt(txReceipt);
          setIsSuccess(true);
          setIsLoading(false);
        } else if (mounted) {
          // Check again after a delay
          setTimeout(checkReceipt, 3000);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err : new Error('Failed to get transaction receipt'));
          setIsLoading(false);
        }
      }
    };
    
    checkReceipt();
    
    return () => {
      mounted = false;
    };
  }, [hash, provider]);

  return {
    isLoading,
    isSuccess,
    receipt,
    error
  };
}

/**
 * Hook to get ERC-20 token balance
 */
export function useTokenBalance(tokenAddress: string, walletAddress: string | null) {
  const { data, isLoading, isError, error } = useReadContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: [walletAddress || '0x0000000000000000000000000000000000000000'],
    enabled: !!walletAddress
  });
  
  return {
    balance: data,
    isLoading,
    isError,
    error
  };
}

/**
 * Hook to check if an address owns an NFT
 */
export function useNFTOwnership(contractAddress: string, tokenId: number, walletAddress: string | null) {
  const { data, isLoading, isError, error } = useReadContract({
    address: contractAddress,
    abi: ERC721_ABI,
    functionName: 'ownerOf',
    args: [tokenId],
    enabled: !!walletAddress
  });
  
  const isOwner = data && walletAddress && data.toLowerCase() === walletAddress.toLowerCase();
  
  return {
    owner: data,
    isOwner,
    isLoading,
    isError,
    error
  };
}
