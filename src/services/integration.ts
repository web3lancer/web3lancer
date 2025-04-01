import { ID } from 'appwrite';
import { databases } from '@/utils/api';
import { APPWRITE_CONFIG } from '@/lib/env';
import { processPayment, PaymentRequest } from '@/services/payment';
import { recordCryptoTransaction } from '@/services/cryptoService';

/**
 * Integration service between Appwrite and PhotonLancerr
 * 
 * This service handles operations that require both systems to work together,
 * such as processing a payment and then recording it in the Appwrite database.
 */

/**
 * Process a payment and record it in the Appwrite database
 */
export async function processAndRecordPayment(
  userId: string,
  amount: number,
  currency: string,
  method: string,
  description?: string
): Promise<{ success: boolean; transactionId?: string; error?: string }> {
  try {
    // Step 1: Process the payment via PhotonLancerr
    const paymentRequest: PaymentRequest = {
      amount,
      currency,
      method,
      description
    };
    
    const paymentResult = await processPayment(paymentRequest);
    
    if (!paymentResult.success || !paymentResult.data) {
      throw new Error(paymentResult.error || 'Payment processing failed');
    }

    // Generate a unique transaction ID
    const transactionId = ID.unique();

    // Step 2: Record the transaction in Appwrite
    await databases.createDocument(
      APPWRITE_CONFIG.DATABASES.TRANSACTIONS,
      APPWRITE_CONFIG.COLLECTIONS.TRANSACTIONS,
      ID.unique(),
      {
        userId,
        amount,
        type: method,
        createdAt: new Date().toISOString(),
        status: paymentResult.data.status,
        transactionId: paymentResult.data.transaction_id || transactionId,
      }
    );
    
    // Step 3: If this is a crypto payment, record additional details
    if (method.includes('crypto')) {
      // For crypto transactions, we need to add more details
      // This would use the crypto specific data from the payment result
      if (paymentResult.data.crypto_details) {
        const { txHash, fromAddress, toAddress, value, network } = paymentResult.data.crypto_details;
        
        await recordCryptoTransaction(
          userId,
          txHash,
          fromAddress,
          toAddress,
          value.toString(),
          network
        );
      }
    }
    
    // Step 4: Create a notification about the transaction
    await databases.createDocument(
      APPWRITE_CONFIG.DATABASES.NOTIFICATIONS,
      APPWRITE_CONFIG.COLLECTIONS.NOTIFICATIONS,
      ID.unique(),
      {
        userId,
        message: `Your payment of ${amount} ${currency} was processed successfully.`,
        createdAt: new Date().toISOString(),
        type: 'payment',
        notificationId: ID.unique(),
        read: false,
      }
    );
    
    return {
      success: true,
      transactionId: paymentResult.data.transaction_id || transactionId
    };
  } catch (error) {
    console.error('Error in processAndRecordPayment:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error processing payment'
    };
  }
}

/**
 * Add funds to a user's account
 */
export async function addFunds(
  userId: string,
  amount: number,
  currency: string,
  paymentMethod: string
): Promise<{ success: boolean; transactionId?: string; error?: string }> {
  return processAndRecordPayment(
    userId,
    amount,
    currency,
    paymentMethod,
    'Add funds to account'
  );
}

/**
 * Process payment for a job
 */
export async function processJobPayment(
  userId: string,
  jobId: string,
  amount: number,
  currency: string
): Promise<{ success: boolean; transactionId?: string; error?: string }> {
  return processAndRecordPayment(
    userId,
    amount,
    currency,
    'job_payment',
    `Payment for job ${jobId}`
  );
}

/**
 * Process payment for a service or product
 */
export async function processServicePayment(
  userId: string,
  serviceId: string,
  amount: number,
  currency: string
): Promise<{ success: boolean; transactionId?: string; error?: string }> {
  return processAndRecordPayment(
    userId,
    amount,
    currency,
    'service_payment',
    `Payment for service ${serviceId}`
  );
}
