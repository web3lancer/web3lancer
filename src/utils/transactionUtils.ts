/**
 * Transaction utilities for Web3Lancer
 */

/**
 * Parse ether value to wei (as a hex string)
 * @param value Ether value as a string or number
 * @returns Hex string of wei value
 */
export function parseEther(value: string | number): string {
  const etherValue = typeof value === 'string' ? value : value.toString();
  
  // Convert ether to wei (1 ether = 10^18 wei)
  const weiValue = BigInt(Math.floor(parseFloat(etherValue) * 10**18));
  
  // Convert to hex string with '0x' prefix
  return `0x${weiValue.toString(16)}`;
}

/**
 * Format wei value to ether
 * @param weiValue Wei value as a hex string or BigInt
 * @returns Ether value as a string
 */
export function formatEther(weiValue: string | bigint): string {
  // Convert hex string to BigInt if needed
  const wei = typeof weiValue === 'string' 
    ? BigInt(weiValue.startsWith('0x') ? weiValue : `0x${weiValue}`)
    : weiValue;
    
  // Convert wei to ether (1 ether = 10^18 wei)
  return (Number(wei) / 10**18).toString();
}

/**
 * Wait for transaction receipt
 * @param provider Ethereum provider
 * @param hash Transaction hash
 * @param confirmations Number of confirmations to wait for (default: 1)
 * @returns Transaction receipt
 */
export async function waitForTransaction(
  provider: any,
  hash: string,
  confirmations: number = 1
): Promise<any> {
  return new Promise((resolve, reject) => {
    const checkReceipt = async () => {
      try {
        const receipt = await provider.request({
          method: 'eth_getTransactionReceipt',
          params: [hash],
        });
        
        if (receipt && receipt.blockNumber) {
          // Get current block number
          const currentBlock = await provider.request({
            method: 'eth_blockNumber',
            params: [],
          });
          
          // Check confirmations
          const confs = BigInt(currentBlock) - BigInt(receipt.blockNumber) + BigInt(1);
          if (confs >= BigInt(confirmations)) {
            resolve(receipt);
            return;
          }
        }
        
        // Check again after 2 seconds
        setTimeout(checkReceipt, 2000);
      } catch (err) {
        reject(err);
      }
    };
    
    // Start checking
    checkReceipt();
  });
}

/**
 * Get transaction by hash
 * @param provider Ethereum provider
 * @param hash Transaction hash
 * @returns Transaction details
 */
export async function getTransaction(provider: any, hash: string): Promise<any> {
  return await provider.request({
    method: 'eth_getTransactionByHash',
    params: [hash],
  });
}

/**
 * Record transaction in the database
 * @param userId User ID
 * @param txHash Transaction hash
 * @param fromAddress From address
 * @param toAddress To address
 * @param value Transaction value in wei
 * @param chainId Chain ID
 */
export async function recordTransaction(
  userId: string,
  txHash: string,
  fromAddress: string,
  toAddress: string,
  value: string,
  chainId: string
): Promise<void> {
  // Implementation would depend on how transactions are recorded in the database
  // This could call an API endpoint or use the recordCryptoTransaction function
  console.log('Recording transaction in database', {
    userId,
    txHash,
    fromAddress,
    toAddress,
    value,
    chainId
  });
  
  // Example implementation (you would implement this based on your backend)
  // await recordCryptoTransaction(
  //   generateTransactionId(),
  //   userId, 
  //   txHash,
  //   fromAddress,
  //   toAddress,
  //   chainId,
  //   'pending'
  // );
}
