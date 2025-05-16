import { AppwriteService, ID, Query } from './appwriteService';
import { EnvService } from './envService';
import { Wallet, Transaction, PaymentMethod, EscrowTransaction } from '@/types/finance';

/**
 * Finance Service for managing wallets, transactions, payment methods, and escrow
 * Follows best practices from Cross-Cutting Concerns section
 */
class FinanceService {
  private databaseId: string;
  private walletsCollectionId: string;
  private transactionsCollectionId: string;
  private paymentMethodsCollectionId: string;
  private escrowTransactionsCollectionId: string;
  
  constructor(
    private appwrite: AppwriteService,
    private env: EnvService<'finance'>
  ) {
    this.databaseId = this.env.databaseId;
    this.walletsCollectionId = this.env.get('collectionUserWallets');
    this.transactionsCollectionId = this.env.get('collectionPlatformTransactions');
    this.paymentMethodsCollectionId = this.env.get('collectionUserPaymentMethods');
    this.escrowTransactionsCollectionId = this.env.get('collectionEscrowTransactions');
  }

  // Wallets
  async createWallet(data: Omit<Wallet, '$id' | '$createdAt' | '$updatedAt'>): Promise<Wallet> {
    return this.appwrite.createDocument<Wallet>(
      this.databaseId,
      this.walletsCollectionId,
      ID.unique(),
      {
        ...data,
        isVerified: false,
        isPrimary: false
      }
    );
  }

  async getWallet(walletId: string): Promise<Wallet | null> {
    return this.appwrite.getDocument<Wallet>(
      this.databaseId,
      this.walletsCollectionId,
      walletId
    );
  }

  async updateWallet(walletId: string, data: Partial<Wallet>): Promise<Wallet> {
    return this.appwrite.updateDocument<Wallet>(
      this.databaseId,
      this.walletsCollectionId,
      walletId,
      data
    );
  }

  async deleteWallet(walletId: string): Promise<void> {
    return this.appwrite.deleteDocument(
      this.databaseId,
      this.walletsCollectionId,
      walletId
    );
  }

  async listWallets(queries: string[] = []): Promise<Wallet[]> {
    return this.appwrite.listDocuments<Wallet>(
      this.databaseId,
      this.walletsCollectionId,
      queries
    );
  }

  async getWalletsByProfile(profileId: string): Promise<Wallet[]> {
    return this.listWallets([Query.equal('profileId', profileId)]);
  }

  async getPrimaryWallet(profileId: string): Promise<Wallet | null> {
    const wallets = await this.listWallets([
      Query.equal('profileId', profileId),
      Query.equal('isPrimary', true)
    ]);
    
    return wallets.length > 0 ? wallets[0] : null;
  }

  async setWalletAsPrimary(walletId: string): Promise<void> {
    const wallet = await this.getWallet(walletId);
    if (!wallet) throw new Error('Wallet not found');
    
    // First, unset the primary flag on all wallets for this profile
    const wallets = await this.getWalletsByProfile(wallet.profileId);
    for (const w of wallets) {
      if (w.isPrimary && w.$id !== walletId) {
        await this.updateWallet(w.$id, { isPrimary: false });
      }
    }
    
    // Then set this wallet as primary
    await this.updateWallet(walletId, { isPrimary: true });
  }

  // Transactions
  async createTransaction(data: Omit<Transaction, '$id' | '$createdAt' | '$updatedAt'>): Promise<Transaction> {
    return this.appwrite.createDocument<Transaction>(
      this.databaseId,
      this.transactionsCollectionId,
      ID.unique(),
      {
        ...data,
        status: 'pending'
      }
    );
  }

  async getTransaction(transactionId: string): Promise<Transaction | null> {
    return this.appwrite.getDocument<Transaction>(
      this.databaseId,
      this.transactionsCollectionId,
      transactionId
    );
  }

  async updateTransaction(transactionId: string, data: Partial<Transaction>): Promise<Transaction> {
    return this.appwrite.updateDocument<Transaction>(
      this.databaseId,
      this.transactionsCollectionId,
      transactionId,
      data
    );
  }

  async listTransactions(queries: string[] = []): Promise<Transaction[]> {
    return this.appwrite.listDocuments<Transaction>(
      this.databaseId,
      this.transactionsCollectionId,
      queries
    );
  }

  async getTransactionsByProfile(profileId: string, limit = 10, offset = 0): Promise<Transaction[]> {
    return this.listTransactions([
      Query.equal('profileId', profileId),
      Query.orderDesc('$createdAt'),
      Query.limit(limit),
      Query.offset(offset)
    ]);
  }

  // Payment Methods
  async createPaymentMethod(data: Omit<PaymentMethod, '$id' | '$createdAt' | '$updatedAt'>): Promise<PaymentMethod> {
    return this.appwrite.createDocument<PaymentMethod>(
      this.databaseId,
      this.paymentMethodsCollectionId,
      ID.unique(),
      {
        ...data,
        isVerified: false,
        isDefault: false
      }
    );
  }

  async getPaymentMethod(paymentMethodId: string): Promise<PaymentMethod | null> {
    return this.appwrite.getDocument<PaymentMethod>(
      this.databaseId,
      this.paymentMethodsCollectionId,
      paymentMethodId
    );
  }

  async updatePaymentMethod(paymentMethodId: string, data: Partial<PaymentMethod>): Promise<PaymentMethod> {
    return this.appwrite.updateDocument<PaymentMethod>(
      this.databaseId,
      this.paymentMethodsCollectionId,
      paymentMethodId,
      data
    );
  }

  async deletePaymentMethod(paymentMethodId: string): Promise<void> {
    return this.appwrite.deleteDocument(
      this.databaseId,
      this.paymentMethodsCollectionId,
      paymentMethodId
    );
  }

  async listPaymentMethods(queries: string[] = []): Promise<PaymentMethod[]> {
    return this.appwrite.listDocuments<PaymentMethod>(
      this.databaseId,
      this.paymentMethodsCollectionId,
      queries
    );
  }

  async getPaymentMethodsByProfile(profileId: string): Promise<PaymentMethod[]> {
    return this.listPaymentMethods([Query.equal('profileId', profileId)]);
  }

  async setPaymentMethodAsDefault(paymentMethodId: string): Promise<void> {
    const paymentMethod = await this.getPaymentMethod(paymentMethodId);
    if (!paymentMethod) throw new Error('Payment method not found');
    
    // First, unset the default flag on all payment methods for this profile
    const paymentMethods = await this.getPaymentMethodsByProfile(paymentMethod.profileId);
    for (const pm of paymentMethods) {
      if (pm.isDefault && pm.$id !== paymentMethodId) {
        await this.updatePaymentMethod(pm.$id, { isDefault: false });
      }
    }
    
    // Then set this payment method as default
    await this.updatePaymentMethod(paymentMethodId, { isDefault: true });
  }

  // Escrow Transactions
  async createEscrowTransaction(data: Omit<EscrowTransaction, '$id' | '$createdAt' | '$updatedAt'>): Promise<EscrowTransaction> {
    return this.appwrite.createDocument<EscrowTransaction>(
      this.databaseId,
      this.escrowTransactionsCollectionId,
      ID.unique(),
      {
        ...data,
        status: 'pending'
      }
    );
  }

  async getEscrowTransaction(escrowTransactionId: string): Promise<EscrowTransaction | null> {
    return this.appwrite.getDocument<EscrowTransaction>(
      this.databaseId,
      this.escrowTransactionsCollectionId,
      escrowTransactionId
    );
  }

  async updateEscrowTransaction(escrowTransactionId: string, data: Partial<EscrowTransaction>): Promise<EscrowTransaction> {
    return this.appwrite.updateDocument<EscrowTransaction>(
      this.databaseId,
      this.escrowTransactionsCollectionId,
      escrowTransactionId,
      data
    );
  }

  async listEscrowTransactions(queries: string[] = []): Promise<EscrowTransaction[]> {
    return this.appwrite.listDocuments<EscrowTransaction>(
      this.databaseId,
      this.escrowTransactionsCollectionId,
      queries
    );
  }

  async getEscrowTransactionsByContract(contractId: string): Promise<EscrowTransaction[]> {
    return this.listEscrowTransactions([Query.equal('contractId', contractId)]);
  }
}

export default FinanceService;