import { Horizon, ServerApi } from '@stellar/stellar-sdk';

// Placeholder: Replace with your actual Horizon server URL
const HORIZON_URL = 'https://horizon-testnet.stellar.org'; // Use testnet or mainnet as appropriate
const server = new Horizon.Server(HORIZON_URL);

/**
 * Fetches the balances for a given Stellar account ID.
 * 
 * Returns an array of balance objects or null on error.
 */
export const getAccountBalance = async (accountId: string): Promise<Array<{asset: string, balance: string}> | null> => {
  console.log(`Fetching balance for account: ${accountId}`);
  if (!accountId) {
    console.error('Account ID is required to fetch balance.');
    return null;
  }

  try {
    const account: ServerApi.AccountRecord = await server.loadAccount(accountId);
    const balances = account.balances.map(balance => {
      let asset: string;
      if (balance.asset_type === 'native') {
        asset = 'XLM';
      } else {
        // Format for non-native assets (e.g., "USDC:GAD...")
        asset = `${balance.asset_code}:${balance.asset_issuer}`;
      }
      return {
        asset: asset,
        balance: balance.balance
      };
    });
    
    console.log(`Balances found:`, balances);
    return balances;

  } catch (error) {
    console.error('Error fetching account balance from Horizon:', error);
    // Handle specific errors (e.g., account not found) if necessary
    if (error instanceof Error && error.message.includes('404')) {
        console.warn(`Account ${accountId} not found on the network.`);
        return []; // Return empty array if account not found
    }
    return null; // Indicate an error occurred
  }
};

// Add other Horizon query functions as needed
// e.g., fetch transactions, fetch account details, etc.
