// src/utils/stellar.ts
import { Keypair, Server, TransactionBuilder, Networks, Operation, Asset, BASE_FEE } from '@stellar/stellar-sdk';

// Use SDF's public Stellar Testnet endpoints
const TESTNET_HORIZON_URL = 'https://horizon-testnet.stellar.org';
const TESTNET_RPC_URL = 'https://soroban-testnet.stellar.org';

// Set up the Stellar server connection
const server = new Server(TESTNET_HORIZON_URL);

/**
 * Generate a new Stellar keypair
 */
export function generateKeypair() {
  return Keypair.random();
}

/**
 * Retrieve account details from Stellar network
 * @param publicKey - The public key of the account
 */
export async function getAccount(publicKey: string) {
  try {
    return await server.loadAccount(publicKey);
  } catch (error) {
    console.error('Error loading account:', error);
    throw error;
  }
}

/**
 * Fund a testnet account using Friendbot
 * @param publicKey - The public key to fund
 */
export async function fundTestnetAccount(publicKey: string) {
  try {
    const response = await fetch(`https://friendbot.stellar.org?addr=${publicKey}`);
    const responseJson = await response.json();
    return responseJson;
  } catch (error) {
    console.error('Error funding account:', error);
    throw error;
  }
}

/**
 * Send XLM payment on testnet
 * @param senderKeypair - The sender's keypair
 * @param destinationPublicKey - The recipient's public key
 * @param amount - Amount of XLM to send
 */
export async function sendXLM(
  senderKeypair: Keypair,
  destinationPublicKey: string,
  amount: string
) {
  try {
    // Load the sender's account
    const sourceAccount = await server.loadAccount(senderKeypair.publicKey());

    // Create a payment transaction
    const transaction = new TransactionBuilder(sourceAccount, {
      fee: BASE_FEE,
      networkPassphrase: Networks.TESTNET
    })
      .addOperation(
        Operation.payment({
          destination: destinationPublicKey,
          asset: Asset.native(), // XLM
          amount: amount
        })
      )
      .setTimeout(30)
      .build();

    // Sign the transaction
    transaction.sign(senderKeypair);

    // Submit the transaction to the Stellar network
    const result = await server.submitTransaction(transaction);
    return result;
  } catch (error) {
    console.error('Error sending XLM:', error);
    throw error;
  }
}

/**
 * Check account balance
 * @param publicKey - The public key of the account
 */
export async function checkBalance(publicKey: string) {
  try {
    const account = await server.loadAccount(publicKey);
    return account.balances;
  } catch (error) {
    console.error('Error checking balance:', error);
    throw error;
  }
}

/**
 * Create a trustline for a custom asset
 * @param userKeypair - The user's keypair
 * @param assetCode - The asset code
 * @param issuerPublicKey - The asset issuer's public key
 */
export async function createTrustline(
  userKeypair: Keypair,
  assetCode: string,
  issuerPublicKey: string
) {
  try {
    const account = await server.loadAccount(userKeypair.publicKey());
    
    const transaction = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: Networks.TESTNET
    })
      .addOperation(
        Operation.changeTrust({
          asset: new Asset(assetCode, issuerPublicKey)
        })
      )
      .setTimeout(30)
      .build();

    transaction.sign(userKeypair);
    
    const result = await server.submitTransaction(transaction);
    return result;
  } catch (error) {
    console.error('Error creating trustline:', error);
    throw error;
  }
}

/**
 * Get transaction history for an account
 * @param publicKey - The public key of the account
 */
export async function getTransactionHistory(publicKey: string) {
  try {
    const transactions = await server.transactions()
      .forAccount(publicKey)
      .order('desc')
      .limit(10)
      .call();
    
    return transactions.records;
  } catch (error) {
    console.error('Error fetching transaction history:', error);
    throw error;
  }
}