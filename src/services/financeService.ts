import BaseService from './baseService';
import { AppwriteService, ID, Query } from './appwriteService';
import { EnvConfig } from '@/config/environment';
import { UserWallet, PaymentMethod, PlatformTransaction, EscrowTransaction } from '@/types/finance';

/**
 * FinanceService - Handles all financial operations
 * 
 * This service manages wallets, transactions, payment methods, and escrow
 * operations for the platform.
 */
class FinanceService extends BaseService {
  constructor(
    protected appwrite: AppwriteService,
    protected config: EnvConfig
  ) {
    super(appwrite, config);
  }

  // User Wallets
  async createWallet(data: Omit<UserWallet, '$id' | '$createdAt' | '$updatedAt'>): Promise<UserWallet> {
    return this.handleRequest(
      async () => {
        return await this.appwrite.createDocument<UserWallet>(
          this.config.finance.databaseId,
          this.config.finance.walletsCollectionId,
          ID.unique(),
          data
        );
      },
      'createWallet'
    );
  }

  async getWallet(walletId: string): Promise<UserWallet | null> {
    return this.handleRequest(
      async () => {
        return await this.appwrite.getDocument<UserWallet>(
          this.config.finance.databaseId,
          this.config.finance.walletsCollectionId,
          walletId
        );
      },
      'getWallet'
    );
  }

  async getWalletByUserId(userId: string): Promise<UserWallet | null> {
    return this.handleRequest(
      async () => {
        const wallets = await this.appwrite.listDocuments<UserWallet>(
          this.config.finance.databaseId,
          this.config.finance.walletsCollectionId,
          [Query.equal('userId', userId)]
        );
        
        return wallets.length > 0 ? wallets[0] : null;
      },
      'getWalletByUserId'
    );
  }

  async updateWalletBalance(walletId: string, newBalance: number): Promise<UserWallet> {
    return this.handleRequest(
      async () => {
        return await this.appwrite.updateDocument<UserWallet>(
          this.config.finance.databaseId,
          this.config.finance.walletsCollectionId,
          walletId,
          { balance: newBalance }
        );
      },
      'updateWalletBalance'
    );
  }

  // Payment Methods
  async addPaymentMethod(data: Omit<PaymentMethod, '$id' | '$createdAt' | '$updatedAt'>): Promise<PaymentMethod> {
    return this.handleRequest(
      async () => {
        return await this.appwrite.createDocument<PaymentMethod>(
          this.config.finance.databaseId,
          this.config.finance.paymentMethodsCollectionId,
          ID.unique(),
          data
        );
      },
      'addPaymentMethod'
    );
  }

  async getPaymentMethod(paymentMethodId: string): Promise<PaymentMethod | null> {
    return this.handleRequest(
      async () => {
        return await this.appwrite.getDocument<PaymentMethod>(
          this.config.finance.databaseId,
          this.config.finance.paymentMethodsCollectionId,
          paymentMethodId
        );
      },
      'getPaymentMethod'
    );
  }

  async listUserPaymentMethods(userId: string): Promise<PaymentMethod[]> {
    return this.handleRequest(
      async () => {
        return await this.appwrite.listDocuments<PaymentMethod>(
          this.config.finance.databaseId,
          this.config.finance.paymentMethodsCollectionId,
          [Query.equal('userId', userId)]
        );
      },
      'listUserPaymentMethods'
    );
  }

  async updatePaymentMethod(paymentMethodId: string, data: Partial<PaymentMethod>): Promise<PaymentMethod> {
    return this.handleRequest(
      async () => {
        return await this.appwrite.updateDocument<PaymentMethod>(
          this.config.finance.databaseId,
          this.config.finance.paymentMethodsCollectionId,
          paymentMethodId,
          data
        );
      },
      'updatePaymentMethod'
    );
  }

  async deletePaymentMethod(paymentMethodId: string): Promise<void> {
    return this.handleRequest(
      async () => {
        await this.appwrite.deleteDocument(
          this.config.finance.databaseId,
          this.config.finance.paymentMethodsCollectionId,
          paymentMethodId
        );
      },
      'deletePaymentMethod'
    );
  }

  // Platform Transactions
  async createTransaction(data: Omit<PlatformTransaction, '$id' | '$createdAt' | '$updatedAt'>): Promise<PlatformTransaction> {
    return this.handleRequest(
      async () => {
        return await this.appwrite.createDocument<PlatformTransaction>(
          this.config.finance.databaseId,
          this.config.finance.transactionsCollectionId,
          ID.unique(),
          data
        );
      },
      'createTransaction'
    );
  }

  async getTransaction(transactionId: string): Promise<PlatformTransaction | null> {
    return this.handleRequest(
      async () => {
        return await this.appwrite.getDocument<PlatformTransaction>(
          this.config.finance.databaseId,
          this.config.finance.transactionsCollectionId,
          transactionId
        );
      },
      'getTransaction'
    );
  }

  async listUserTransactions(userId: string, limit: number = 20): Promise<PlatformTransaction[]> {
    return this.handleRequest(
      async () => {
        return await this.appwrite.listDocuments<PlatformTransaction>(
          this.config.finance.databaseId,
          this.config.finance.transactionsCollectionId,
          [
            Query.equal('userId', userId),
            Query.orderDesc('$createdAt'),
            Query.limit(limit)
          ]
        );
      },
      'listUserTransactions'
    );
  }

  async updateTransactionStatus(transactionId: string, status: string, processorResponse?: any): Promise<PlatformTransaction> {
    return this.handleRequest(
      async () => {
        const updateData: Partial<PlatformTransaction> = { 
          status,
          completedAt: ['completed', 'success', 'succeeded'].includes(status) ? new Date().toISOString() : undefined,
          failedAt: ['failed', 'error', 'rejected'].includes(status) ? new Date().toISOString() : undefined,
        };
        
        if (processorResponse) {
          updateData.processorResponse = processorResponse;
        }
        
        return await this.appwrite.updateDocument<PlatformTransaction>(
          this.config.finance.databaseId,
          this.config.finance.transactionsCollectionId,
          transactionId,
          updateData
        );
      },
      'updateTransactionStatus'
    );
  }

  // Escrow Transactions
  async createEscrowTransaction(data: Omit<EscrowTransaction, '$id' | '$createdAt' | '$updatedAt'>): Promise<EscrowTransaction> {
    return this.handleRequest(
      async () => {
        return await this.appwrite.createDocument<EscrowTransaction>(
          this.config.finance.databaseId,
          this.config.finance.escrowTransactionsCollectionId,
          ID.unique(),
          data
        );
      },
      'createEscrowTransaction'
    );
  }

  async getEscrowTransaction(escrowId: string): Promise<EscrowTransaction | null> {
    return this.handleRequest(
      async () => {
        return await this.appwrite.getDocument<EscrowTransaction>(
          this.config.finance.databaseId,
          this.config.finance.escrowTransactionsCollectionId,
          escrowId
        );
      },
      'getEscrowTransaction'
    );
  }

  async listEscrowTransactions(queries: string[] = []): Promise<EscrowTransaction[]> {
    return this.handleRequest(
      async () => {
        return await this.appwrite.listDocuments<EscrowTransaction>(
          this.config.finance.databaseId,
          this.config.finance.escrowTransactionsCollectionId,
          queries
        );
      },
      'listEscrowTransactions'
    );
  }

  async updateEscrowStatus(escrowId: string, status: string, releasedToWalletId?: string): Promise<EscrowTransaction> {
    return this.handleRequest(
      async () => {
        const updateData: Partial<EscrowTransaction> = { 
          status,
          releasedAt: status === 'released' ? new Date().toISOString() : undefined,
        };
        
        if (releasedToWalletId && status === 'released') {
          updateData.releasedToWalletId = releasedToWalletId;
        }
        
        return await this.appwrite.updateDocument<EscrowTransaction>(
          this.config.finance.databaseId,
          this.config.finance.escrowTransactionsCollectionId,
          escrowId,
          updateData
        );
      },
      'updateEscrowStatus'
    );
  }

  // Financial Operations
  async depositToWallet(walletId: string, amount: number, method: string, description?: string): Promise<PlatformTransaction> {
    return this.handleRequest(
      async () => {
        // First, get the current wallet
        const wallet = await this.getWallet(walletId);
        
        if (!wallet) {
          throw new Error(`Wallet with ID ${walletId} not found`);
        }
        
        // Create the transaction record
        const transaction = await this.createTransaction({
          userId: wallet.userId,
          walletId: wallet.$id,
          type: 'deposit',
          method,
          amount,
          currency: wallet.currency,
          description: description || `Deposit to wallet via ${method}`,
          status: 'pending'
        });
        
        // In a real implementation, you would process the deposit with a payment provider here
        // For now, we'll simulate success
        const updatedTransaction = await this.updateTransactionStatus(
          transaction.$id, 
          'completed'
        );
        
        // Update wallet balance
        await this.updateWalletBalance(
          walletId, 
          wallet.balance + amount
        );
        
        return updatedTransaction;
      },
      'depositToWallet'
    );
  }

  async withdrawFromWallet(walletId: string, amount: number, method: string, destination: string, description?: string): Promise<PlatformTransaction> {
    return this.handleRequest(
      async () => {
        // First, get the current wallet
        const wallet = await this.getWallet(walletId);
        
        if (!wallet) {
          throw new Error(`Wallet with ID ${walletId} not found`);
        }
        
        // Ensure sufficient balance
        if (wallet.balance < amount) {
          throw new Error(`Insufficient funds: available ${wallet.balance}, requested ${amount}`);
        }
        
        // Create the transaction record
        const transaction = await this.createTransaction({
          userId: wallet.userId,
          walletId: wallet.$id,
          type: 'withdrawal',
          method,
          amount,
          currency: wallet.currency,
          description: description || `Withdrawal from wallet via ${method}`,
          status: 'pending',
          destination
        });
        
        // In a real implementation, you would process the withdrawal with a payment provider here
        // For now, we'll simulate success
        const updatedTransaction = await this.updateTransactionStatus(
          transaction.$id, 
          'completed'
        );
        
        // Update wallet balance
        await this.updateWalletBalance(
          walletId, 
          wallet.balance - amount
        );
        
        return updatedTransaction;
      },
      'withdrawFromWallet'
    );
  }

  async createEscrow(
    fromWalletId: string, 
    amount: number, 
    purpose: string, 
    relatedId: string, 
    relatedType: string
  ): Promise<EscrowTransaction> {
    return this.handleRequest(
      async () => {
        // Get the source wallet
        const wallet = await this.getWallet(fromWalletId);
        
        if (!wallet) {
          throw new Error(`Wallet with ID ${fromWalletId} not found`);
        }
        
        // Ensure sufficient balance
        if (wallet.balance < amount) {
          throw new Error(`Insufficient funds: available ${wallet.balance}, requested ${amount}`);
        }
        
        // Create transaction to move funds to escrow
        const transaction = await this.createTransaction({
          userId: wallet.userId,
          walletId: wallet.$id,
          type: 'escrow_funding',
          method: 'platform_wallet',
          amount,
          currency: wallet.currency,
          description: `Funds moved to escrow for ${purpose}`,
          status: 'pending',
          relatedId,
          relatedType
        });
        
        // Create escrow record
        const escrow = await this.createEscrowTransaction({
          sourceWalletId: wallet.$id,
          sourceUserId: wallet.userId,
          amount,
          currency: wallet.currency,
          purpose,
          status: 'pending',
          relatedId,
          relatedType
        });
        
        // Update transaction with escrow ID
        await this.appwrite.updateDocument<PlatformTransaction>(
          this.config.finance.databaseId,
          this.config.finance.transactionsCollectionId,
          transaction.$id,
          { escrowId: escrow.$id }
        );
        
        // Update escrow with transaction ID
        await this.appwrite.updateDocument<EscrowTransaction>(
          this.config.finance.databaseId,
          this.config.finance.escrowTransactionsCollectionId,
          escrow.$id,
          { transactionId: transaction.$id }
        );
        
        // Complete the transaction (in real impl this would be after confirmation)
        await this.updateTransactionStatus(transaction.$id, 'completed');
        
        // Update the escrow status
        await this.updateEscrowStatus(escrow.$id, 'funded');
        
        // Update wallet balance
        await this.updateWalletBalance(fromWalletId, wallet.balance - amount);
        
        // Return the updated escrow
        return await this.getEscrowTransaction(escrow.$id) as EscrowTransaction;
      },
      'createEscrow'
    );
  }

  async releaseEscrow(escrowId: string, toWalletId: string): Promise<EscrowTransaction> {
    return this.handleRequest(
      async () => {
        // Get the escrow record
        const escrow = await this.getEscrowTransaction(escrowId);
        
        if (!escrow) {
          throw new Error(`Escrow with ID ${escrowId} not found`);
        }
        
        if (escrow.status !== 'funded') {
          throw new Error(`Escrow must be in 'funded' status to release, current status: ${escrow.status}`);
        }
        
        // Get the destination wallet
        const toWallet = await this.getWallet(toWalletId);
        
        if (!toWallet) {
          throw new Error(`Destination wallet with ID ${toWalletId} not found`);
        }
        
        // Create transaction for escrow release
        const transaction = await this.createTransaction({
          userId: toWallet.userId,
          walletId: toWallet.$id,
          type: 'escrow_release',
          method: 'platform_wallet',
          amount: escrow.amount,
          currency: escrow.currency,
          description: `Funds released from escrow: ${escrow.purpose}`,
          status: 'pending',
          relatedId: escrow.relatedId,
          relatedType: escrow.relatedType,
          escrowId: escrow.$id
        });
        
        // Complete the transaction
        await this.updateTransactionStatus(transaction.$id, 'completed');
        
        // Update the escrow record
        await this.updateEscrowStatus(escrowId, 'released', toWalletId);
        
        // Update destination wallet balance
        await this.updateWalletBalance(toWalletId, toWallet.balance + escrow.amount);
        
        // Return the updated escrow
        return await this.getEscrowTransaction(escrowId) as EscrowTransaction;
      },
      'releaseEscrow'
    );
  }

  async formatCurrency(amount: number, currency: string = 'USD'): Promise<string> {
    try {
      // Use Intl.NumberFormat for consistent currency formatting
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(amount);
    } catch (error) {
      console.error('Error formatting currency:', error);
      // Fallback to basic formatting if Intl is not available
      return `${currency} ${amount.toFixed(2)}`;
    }
  }
}

export default FinanceService;