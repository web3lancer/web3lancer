import { databases, ID, storage } from '@/utils/api';
import {
  FINANCE_DATABASE_ID,
  USER_WALLETS_COLLECTION_ID,
  PLATFORM_TRANSACTIONS_COLLECTION_ID,
  USER_PAYMENT_METHODS_COLLECTION_ID,
  ESCROW_TRANSACTIONS_COLLECTION_ID
} from '@/lib/env';

/**
 * Finance Service
 * 
 * This service handles operations related to wallets, transactions, payment methods,
 * and escrow within the FinanceDB.
 */

// User Wallets

/**
 * Create a new wallet for a user
 */
export async function createUserWallet(
  profileId: string, 
  walletAddress: string, 
  walletType: 'ethereum' | 'solana' | 'xion' | 'internal', 
  isPrimary: boolean = false,
  nickname?: string
) {
  try {
    const wallet = await databases.createDocument(
      FINANCE_DATABASE_ID,
      USER_WALLETS_COLLECTION_ID,
      ID.unique(),
      {
        profileId,
        walletAddress,
        walletType,
        isPrimary,
        nickname: nickname || `${walletType.charAt(0).toUpperCase() + walletType.slice(1)} Wallet`,
        createdAt: new Date().toISOString(),
        lastVerifiedAt: null,
        isVerified: false
      }
    );
    
    return wallet;
  } catch (error) {
    console.error('Error creating wallet:', error);
    throw new Error(`Failed to create wallet: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get user wallets
 */
export async function getUserWallets(profileId: string) {
  try {
    const response = await databases.listDocuments(
      FINANCE_DATABASE_ID,
      USER_WALLETS_COLLECTION_ID,
      [databases.Query.equal('profileId', profileId)]
    );
    
    return response.documents;
  } catch (error) {
    console.error('Error getting user wallets:', error);
    throw new Error(`Failed to get user wallets: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Update wallet details
 */
export async function updateWallet(walletId: string, data: {
  nickname?: string;
  isPrimary?: boolean;
  isVerified?: boolean;
  lastVerifiedAt?: string;
}) {
  try {
    const updatedWallet = await databases.updateDocument(
      FINANCE_DATABASE_ID,
      USER_WALLETS_COLLECTION_ID,
      walletId,
      {
        ...data,
        updatedAt: new Date().toISOString()
      }
    );
    
    return updatedWallet;
  } catch (error) {
    console.error('Error updating wallet:', error);
    throw new Error(`Failed to update wallet: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Delete wallet
 */
export async function deleteWallet(walletId: string) {
  try {
    await databases.deleteDocument(
      FINANCE_DATABASE_ID,
      USER_WALLETS_COLLECTION_ID,
      walletId
    );
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting wallet:', error);
    throw new Error(`Failed to delete wallet: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Set wallet as primary
 */
export async function setPrimaryWallet(profileId: string, walletId: string) {
  try {
    // First, set all user wallets to non-primary
    const wallets = await getUserWallets(profileId);
    
    for (const wallet of wallets) {
      if (wallet.$id !== walletId && wallet.isPrimary) {
        await updateWallet(wallet.$id, { isPrimary: false });
      }
    }
    
    // Then set the selected wallet as primary
    await updateWallet(walletId, { isPrimary: true });
    
    return { success: true };
  } catch (error) {
    console.error('Error setting primary wallet:', error);
    throw new Error(`Failed to set primary wallet: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Verify wallet ownership through signature
 */
export async function verifyWalletOwnership(walletId: string, signature: string, message: string) {
  try {
    // In a real implementation, this would verify the signature cryptographically
    // For now, we'll just mark it as verified
    
    await updateWallet(walletId, { 
      isVerified: true,
      lastVerifiedAt: new Date().toISOString()
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error verifying wallet ownership:', error);
    throw new Error(`Failed to verify wallet ownership: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Platform Transactions

/**
 * Create a platform transaction
 */
export async function createTransaction(
  profileId: string,
  type: 'deposit' | 'withdrawal' | 'fee' | 'escrow_funding' | 'escrow_release' | 'escrow_refund',
  amount: number,
  currency: string,
  description: string,
  relatedEntityId?: string, // e.g., contractId for escrow
  walletId?: string
) {
  try {
    const transaction = await databases.createDocument(
      FINANCE_DATABASE_ID,
      PLATFORM_TRANSACTIONS_COLLECTION_ID,
      ID.unique(),
      {
        profileId,
        transactionType: type,
        amount,
        currency,
        description,
        status: 'pending',
        relatedEntityId: relatedEntityId || null,
        walletId: walletId || null,
        createdAt: new Date().toISOString(),
        completedAt: null
      }
    );
    
    return transaction;
  } catch (error) {
    console.error('Error creating transaction:', error);
    throw new Error(`Failed to create transaction: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get user transactions
 */
export async function getUserTransactions(profileId: string, limit: number = 20, offset: number = 0) {
  try {
    const response = await databases.listDocuments(
      FINANCE_DATABASE_ID,
      PLATFORM_TRANSACTIONS_COLLECTION_ID,
      [
        databases.Query.equal('profileId', profileId),
        databases.Query.orderDesc('createdAt'),
        databases.Query.limit(limit),
        databases.Query.offset(offset)
      ]
    );
    
    return response.documents;
  } catch (error) {
    console.error('Error getting user transactions:', error);
    throw new Error(`Failed to get user transactions: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Update transaction status
 */
export async function updateTransactionStatus(
  transactionId: string,
  status: 'pending' | 'completed' | 'failed' | 'cancelled',
  txHash?: string
) {
  try {
    const updatedData: any = {
      status,
      updatedAt: new Date().toISOString()
    };
    
    if (status === 'completed') {
      updatedData.completedAt = new Date().toISOString();
    }
    
    if (txHash) {
      updatedData.txHash = txHash;
    }
    
    const updatedTransaction = await databases.updateDocument(
      FINANCE_DATABASE_ID,
      PLATFORM_TRANSACTIONS_COLLECTION_ID,
      transactionId,
      updatedData
    );
    
    return updatedTransaction;
  } catch (error) {
    console.error('Error updating transaction status:', error);
    throw new Error(`Failed to update transaction status: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// User Payment Methods

/**
 * Add a payment method for a user
 */
export async function addPaymentMethod(
  profileId: string,
  paymentType: 'card' | 'bank_account' | 'paypal' | 'crypto',
  details: any,
  isDefault: boolean = false
) {
  try {
    // Store sensitive details securely (in a real app, would tokenize through a payment provider)
    const paymentMethod = await databases.createDocument(
      FINANCE_DATABASE_ID,
      USER_PAYMENT_METHODS_COLLECTION_ID,
      ID.unique(),
      {
        profileId,
        paymentType,
        details: JSON.stringify(details),
        isDefault,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    );
    
    return paymentMethod;
  } catch (error) {
    console.error('Error adding payment method:', error);
    throw new Error(`Failed to add payment method: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get user payment methods
 */
export async function getUserPaymentMethods(profileId: string) {
  try {
    const response = await databases.listDocuments(
      FINANCE_DATABASE_ID,
      USER_PAYMENT_METHODS_COLLECTION_ID,
      [databases.Query.equal('profileId', profileId)]
    );
    
    // Parse JSON details
    return response.documents.map(doc => ({
      ...doc,
      details: JSON.parse(doc.details || '{}')
    }));
  } catch (error) {
    console.error('Error getting user payment methods:', error);
    throw new Error(`Failed to get user payment methods: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Update payment method details
 */
export async function updatePaymentMethod(paymentMethodId: string, data: {
  isDefault?: boolean;
  details?: any;
}) {
  try {
    const updatedData: any = {
      updatedAt: new Date().toISOString()
    };
    
    if (data.isDefault !== undefined) {
      updatedData.isDefault = data.isDefault;
    }
    
    if (data.details) {
      updatedData.details = JSON.stringify(data.details);
    }
    
    const updatedPaymentMethod = await databases.updateDocument(
      FINANCE_DATABASE_ID,
      USER_PAYMENT_METHODS_COLLECTION_ID,
      paymentMethodId,
      updatedData
    );
    
    return {
      ...updatedPaymentMethod,
      details: JSON.parse(updatedPaymentMethod.details || '{}')
    };
  } catch (error) {
    console.error('Error updating payment method:', error);
    throw new Error(`Failed to update payment method: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Delete payment method
 */
export async function deletePaymentMethod(paymentMethodId: string) {
  try {
    await databases.deleteDocument(
      FINANCE_DATABASE_ID,
      USER_PAYMENT_METHODS_COLLECTION_ID,
      paymentMethodId
    );
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting payment method:', error);
    throw new Error(`Failed to delete payment method: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Set payment method as default
 */
export async function setDefaultPaymentMethod(profileId: string, paymentMethodId: string) {
  try {
    // First, set all user payment methods to non-default
    const paymentMethods = await getUserPaymentMethods(profileId);
    
    for (const method of paymentMethods) {
      if (method.$id !== paymentMethodId && method.isDefault) {
        await updatePaymentMethod(method.$id, { isDefault: false });
      }
    }
    
    // Then set the selected payment method as default
    await updatePaymentMethod(paymentMethodId, { isDefault: true });
    
    return { success: true };
  } catch (error) {
    console.error('Error setting default payment method:', error);
    throw new Error(`Failed to set default payment method: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Escrow Transactions

/**
 * Create an escrow transaction
 */
export async function createEscrowTransaction(
  contractId: string,
  amount: number,
  currency: string,
  fundedByProfileId: string,
  receiverProfileId: string,
  milestoneId?: string
) {
  try {
    const escrowTransaction = await databases.createDocument(
      FINANCE_DATABASE_ID,
      ESCROW_TRANSACTIONS_COLLECTION_ID,
      ID.unique(),
      {
        contractId,
        milestoneId: milestoneId || null,
        amount,
        currency,
        fundedByProfileId,
        receiverProfileId,
        status: 'funded',
        createdAt: new Date().toISOString(),
        releasedAt: null,
        refundedAt: null
      }
    );
    
    // Create a platform transaction to record the funding
    await createTransaction(
      fundedByProfileId,
      'escrow_funding',
      amount,
      currency,
      `Escrow funding for contract #${contractId}${milestoneId ? ` milestone #${milestoneId}` : ''}`,
      contractId
    );
    
    return escrowTransaction;
  } catch (error) {
    console.error('Error creating escrow transaction:', error);
    throw new Error(`Failed to create escrow transaction: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Release escrow funds
 */
export async function releaseEscrowFunds(escrowTransactionId: string) {
  try {
    const escrowTx = await databases.getDocument(
      FINANCE_DATABASE_ID,
      ESCROW_TRANSACTIONS_COLLECTION_ID,
      escrowTransactionId
    );
    
    // Update escrow transaction
    const updatedEscrow = await databases.updateDocument(
      FINANCE_DATABASE_ID,
      ESCROW_TRANSACTIONS_COLLECTION_ID,
      escrowTransactionId,
      {
        status: 'released',
        releasedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    );
    
    // Create a platform transaction to record the release
    await createTransaction(
      escrowTx.receiverProfileId,
      'escrow_release',
      escrowTx.amount,
      escrowTx.currency,
      `Escrow release for contract #${escrowTx.contractId}${escrowTx.milestoneId ? ` milestone #${escrowTx.milestoneId}` : ''}`,
      escrowTx.contractId
    );
    
    return updatedEscrow;
  } catch (error) {
    console.error('Error releasing escrow funds:', error);
    throw new Error(`Failed to release escrow funds: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Refund escrow funds
 */
export async function refundEscrowFunds(escrowTransactionId: string) {
  try {
    const escrowTx = await databases.getDocument(
      FINANCE_DATABASE_ID,
      ESCROW_TRANSACTIONS_COLLECTION_ID,
      escrowTransactionId
    );
    
    // Update escrow transaction
    const updatedEscrow = await databases.updateDocument(
      FINANCE_DATABASE_ID,
      ESCROW_TRANSACTIONS_COLLECTION_ID,
      escrowTransactionId,
      {
        status: 'refunded',
        refundedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    );
    
    // Create a platform transaction to record the refund
    await createTransaction(
      escrowTx.fundedByProfileId,
      'escrow_refund',
      escrowTx.amount,
      escrowTx.currency,
      `Escrow refund for contract #${escrowTx.contractId}${escrowTx.milestoneId ? ` milestone #${escrowTx.milestoneId}` : ''}`,
      escrowTx.contractId
    );
    
    return updatedEscrow;
  } catch (error) {
    console.error('Error refunding escrow funds:', error);
    throw new Error(`Failed to refund escrow funds: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get escrow transactions for a contract
 */
export async function getContractEscrowTransactions(contractId: string) {
  try {
    const response = await databases.listDocuments(
      FINANCE_DATABASE_ID,
      ESCROW_TRANSACTIONS_COLLECTION_ID,
      [databases.Query.equal('contractId', contractId)]
    );
    
    return response.documents;
  } catch (error) {
    console.error('Error getting contract escrow transactions:', error);
    throw new Error(`Failed to get contract escrow transactions: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get escrow transaction by milestone
 */
export async function getMilestoneEscrowTransaction(milestoneId: string) {
  try {
    const response = await databases.listDocuments(
      FINANCE_DATABASE_ID,
      ESCROW_TRANSACTIONS_COLLECTION_ID,
      [databases.Query.equal('milestoneId', milestoneId)]
    );
    
    return response.documents.length > 0 ? response.documents[0] : null;
  } catch (error) {
    console.error('Error getting milestone escrow transaction:', error);
    throw new Error(`Failed to get milestone escrow transaction: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}