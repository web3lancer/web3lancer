import { Networks, Server } from '@stellar/stellar-sdk';

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
