import { Networks, Server, Transaction, Asset } from '@stellar/stellar-sdk';

// Create a Stellar server instance for the testnet
const server = new Server('https://horizon-testnet.stellar.org');

/**
 * Fund an account using Friendbot (Testnet only)
 * @param publicKey The public key to fund
 */
export async function fundWithFriendbot(publicKey: string): Promise<void> {
  console.log(`Requesting Friendbot funding for ${publicKey}`);
  try {
    await server.friendbot(publicKey).call();
    console.log(`Successfully funded account ${publicKey}`);
  } catch (error) {
    console.error('Error funding account with Friendbot:', error);
    throw new Error('Failed to fund account with Friendbot');
  }
}

/**
 * Get account balance
 * @param publicKey The public key to check
 */
export async function getAccountBalance(publicKey: string): Promise<Array<{asset: string, balance: string}>> {
  try {
    const account = await server.loadAccount(publicKey);
    return account.balances.map((balance: any) => ({
      asset: balance.asset_type === 'native' ? 'XLM' : `${balance.asset_code}:${balance.asset_issuer}`,
      balance: balance.balance
    }));
  } catch (error) {
    console.error('Error loading account:', error);
    return [];
  }
}

/**
 * Check if an account exists on the Stellar network
 * @param publicKey The public key to check
 */
export async function accountExists(publicKey: string): Promise<boolean> {
  try {
    await server.loadAccount(publicKey);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Submit a signed transaction to the Stellar network
 * @param signedTransaction The signed transaction to submit
 */
export async function submit(signedTransaction: Transaction): Promise<any> {
  try {
    const transactionResult = await server.submitTransaction(signedTransaction);
    console.log(`Transaction successful: ${transactionResult.hash}`);
    return transactionResult;
  } catch (error: any) {
    console.error('Transaction submission error:', error);
    
    // Extract more detailed error information if available
    let errorMessage = 'Failed to submit transaction';
    if (error.response && error.response.data && error.response.data.extras) {
      const resultCodes = error.response.data.extras.result_codes;
      errorMessage = `Transaction failed: ${resultCodes.transaction}, operations: ${resultCodes.operations?.join(', ')}`;
    }
    
    throw new Error(errorMessage);
  }
}

/**
 * Get the server instance
 */
export function getServer(): Server {
  return server;
}

/**
 * Get the network
 */
export function getNetwork(): string {
  return Networks.TESTNET;
}

/**
 * Fetch account details from Stellar network
 * @param publicKey The public key of the account to fetch
 */
export async function fetchAccount(publicKey: string): Promise<any> {
  try {
    return await server.loadAccount(publicKey);
  } catch (error: any) {
    // If the error is that the account doesn't exist, we want to properly handle that case
    if (error.response && error.response.status === 404) {
      const notFoundError = new Error('Account not found');
      (notFoundError as any).status = 404;
      throw notFoundError;
    }
    throw error;
  }
}

/**
 * Fetch account balances specifically
 * @param publicKey The public key of the account
 */
export async function fetchAccountBalances(publicKey: string): Promise<any[]> {
  try {
    const account = await server.loadAccount(publicKey);
    return account.balances;
  } catch (error) {
    console.error('Error fetching account balances:', error);
    return [];
  }
}

/**
 * Find available paths for strict send payments
 * @param sourceAsset The asset to send
 * @param sourceAmount The amount to send
 * @param destinationPublicKey The destination account
 */
export async function findStrictSendPaths({ 
  sourceAsset, 
  sourceAmount, 
  destinationPublicKey 
}: { 
  sourceAsset: string; 
  sourceAmount: string; 
  destinationPublicKey: string;
}): Promise<any[]> {
  try {
    let sendAsset;
    
    if (sourceAsset === 'native') {
      sendAsset = Asset.native();
    } else {
      const [code, issuer] = sourceAsset.split(':');
      sendAsset = new Asset(code, issuer);
    }

    const pathsResponse = await server
      .strictSendPaths(sendAsset, sourceAmount, destinationPublicKey)
      .call();
    
    return pathsResponse.records;
  } catch (error) {
    console.error('Error finding strict send paths:', error);
    return [];
  }
}

/**
 * Find available paths for strict receive payments
 * @param sourcePublicKey The source account
 * @param destinationAsset The asset to receive
 * @param destinationAmount The amount to receive
 */
export async function findStrictReceivePaths({ 
  sourcePublicKey, 
  destinationAsset, 
  destinationAmount 
}: { 
  sourcePublicKey: string; 
  destinationAsset: string; 
  destinationAmount: string; 
}): Promise<any[]> {
  try {
    let destAsset;
    
    if (destinationAsset === 'native') {
      destAsset = Asset.native();
    } else {
      const [code, issuer] = destinationAsset.split(':');
      destAsset = new Asset(code, issuer);
    }

    const pathsResponse = await server
      .strictReceivePaths(sourcePublicKey, destAsset, destinationAmount)
      .call();
    
    return pathsResponse.records;
  } catch (error) {
    console.error('Error finding strict receive paths:', error);
    return [];
  }
}
