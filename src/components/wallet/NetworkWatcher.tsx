import { useEffect } from 'react';
import { useMetaMask } from '@/hooks/useMetaMask';

export function NetworkWatcher() {
  const { chainId } = useMetaMask();
  
  useEffect(() => {
    // When chainId changes, we can perform any necessary actions
    if (chainId) {
      console.log("Chain ID changed:", chainId);
      
      // Convert hex chainId to number if needed
      const numericChainId = chainId.startsWith('0x') 
        ? parseInt(chainId, 16) 
        : Number(chainId);
      
      // Additional network-specific logic could go here
    }
  }, [chainId]);
  
  // This component doesn't render anything
  return null;
}
