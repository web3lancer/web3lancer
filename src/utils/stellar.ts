// src/utils/stellar.ts
import { Keypair, Server, TransactionBuilder, Networks, Operation, Asset, BASE_FEE } from 'stellar-sdk';

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
export async function sendPayment(senderKeypair: Keypair, destinationPublicKey: string, amount: string) {
  try {
    const sender = await server.loadAccount(senderKeypair.publicKey());
    
    const transaction = new TransactionBuilder(sender, {
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
    
    transaction.sign(senderKeypair);
    
    const result = await server.submitTransaction(transaction);
    return result;
  } catch (error) {
    console.error('Error sending payment:', error);
    throw error;
  }
}

/**
 * Create a Stellar token (asset)
 * @param issuerKeypair - The issuer's keypair
 * @param distributorPublicKey - The distributor's public key
 * @param assetCode - The code for the asset (e.g., "USD")
 * @param limit - The limit of tokens to create
 */
export async function createToken(
  issuerKeypair: Keypair,
  distributorPublicKey: string,
  assetCode: string,
  limit: string
) {
  try {
    const distributor = await server.loadAccount(distributorPublicKey);
    
    const transaction = new TransactionBuilder(distributor, {
      fee: BASE_FEE,
      networkPassphrase: Networks.TESTNET
    })
      .addOperation(
        Operation.changeTrust({
          asset: new Asset(assetCode, issuerKeypair.publicKey()),
          limit: limit
        })
      )
      .setTimeout(30)
      .build();
    
    transaction.sign(issuerKeypair);
    
    const result = await server.submitTransaction(transaction);
    return result;
  } catch (error) {
    console.error('Error creating token:', error);
    throw error;
  }
}

/**
 * Check XLM balance
 * @param publicKey - The public key to check
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