import { ID, Query } from "appwrite";
import { databases, storage } from "@/app/api";
import { Wallet, Transaction, PaymentMethod, EscrowTransaction } from "@/types";
import FinanceEnv from "@/lib/financeEnv";

// Get the environment variables
const {
  financeDatabase: FINANCE_DATABASE_ID,
  userWalletsCollection: USER_WALLETS_COLLECTION_ID,
  platformTransactionsCollection: PLATFORM_TRANSACTIONS_COLLECTION_ID,
  userPaymentMethodsCollection: USER_PAYMENT_METHODS_COLLECTION_ID,
  escrowTransactionsCollection: ESCROW_TRANSACTIONS_COLLECTION_ID
} = FinanceEnv.getAll();

class FinanceService {
  // --- Wallet Management ---

  // Create a user wallet
  async createWallet(walletData: Partial<Wallet>): Promise<Wallet | null> {
    try {
      const newWallet = await databases.createDocument(
        FINANCE_DATABASE_ID,
        USER_WALLETS_COLLECTION_ID,
        ID.unique(),
        {
          // Set default values for required fields
          balance: walletData.balance || 0,
          currency: walletData.currency || 'USD',
          isDefault: walletData.isDefault || false,
          createdAt: new Date().toISOString(),
          // Include all other fields from walletData
          ...walletData
        }
      );
      return newWallet as unknown as Wallet;
    } catch (error) {
      console.error("Error creating wallet:", error);
      return null;
    }
  }

  // Get wallet by ID
  async getWallet(walletId: string): Promise<Wallet | null> {
    try {
      const wallet = await databases.getDocument(
        FINANCE_DATABASE_ID,
        USER_WALLETS_COLLECTION_ID,
        walletId
      );
      return wallet as unknown as Wallet;
    } catch (error) {
      console.error("Error fetching wallet:", error);
      return null;
    }
  }

  // Get wallets by user ID
  async getWalletsByUserId(userId: string): Promise<Wallet[]> {
    try {
      const wallets = await databases.listDocuments(
        FINANCE_DATABASE_ID,
        USER_WALLETS_COLLECTION_ID,
        [Query.equal("userId", userId)]
      );

      return wallets.documents as unknown as Wallet[];
    } catch (error) {
      console.error("Error fetching wallets by userId:", error);
      return [];
    }
  }

  // Get default wallet for a user
  async getDefaultWallet(userId: string): Promise<Wallet | null> {
    try {
      const wallets = await databases.listDocuments(
        FINANCE_DATABASE_ID,
        USER_WALLETS_COLLECTION_ID,
        [
          Query.equal("userId", userId),
          Query.equal("isDefault", true)
        ]
      );

      if (wallets.documents.length > 0) {
        return wallets.documents[0] as unknown as Wallet;
      }
      
      return null;
    } catch (error) {
      console.error("Error fetching default wallet:", error);
      return null;
    }
  }

  // Update wallet
  async updateWallet(walletId: string, walletData: Partial<Wallet>): Promise<Wallet | null> {
    try {
      const updatedWallet = await databases.updateDocument(
        FINANCE_DATABASE_ID,
        USER_WALLETS_COLLECTION_ID,
        walletId,
        {
          ...walletData,
          updatedAt: new Date().toISOString()
        }
      );
      return updatedWallet as unknown as Wallet;
    } catch (error) {
      console.error("Error updating wallet:", error);
      return null;
    }
  }

  // Delete wallet
  async deleteWallet(walletId: string): Promise<boolean> {
    try {
      await databases.deleteDocument(
        FINANCE_DATABASE_ID,
        USER_WALLETS_COLLECTION_ID,
        walletId
      );
      return true;
    } catch (error) {
      console.error("Error deleting wallet:", error);
      return false;
    }
  }

  // --- Transaction Management ---

  // Record a new transaction
  async createTransaction(transactionData: Partial<Transaction>): Promise<Transaction | null> {
    try {
      const newTransaction = await databases.createDocument(
        FINANCE_DATABASE_ID,
        PLATFORM_TRANSACTIONS_COLLECTION_ID,
        ID.unique(),
        {
          // Set default values for required fields
          amount: transactionData.amount || 0,
          currency: transactionData.currency || 'USD',
          type: transactionData.type || 'deposit',
          status: transactionData.status || 'pending',
          createdAt: new Date().toISOString(),
          // Include all other fields from transactionData
          ...transactionData
        }
      );
      return newTransaction as unknown as Transaction;
    } catch (error) {
      console.error("Error creating transaction:", error);
      return null;
    }
  }

  // Get transaction by ID
  async getTransaction(transactionId: string): Promise<Transaction | null> {
    try {
      const transaction = await databases.getDocument(
        FINANCE_DATABASE_ID,
        PLATFORM_TRANSACTIONS_COLLECTION_ID,
        transactionId
      );
      return transaction as unknown as Transaction;
    } catch (error) {
      console.error("Error fetching transaction:", error);
      return null;
    }
  }

  // Get transactions by user ID
  async getTransactionsByUserId(userId: string, limit: number = 20, offset: number = 0): Promise<Transaction[]> {
    try {
      const transactions = await databases.listDocuments(
        FINANCE_DATABASE_ID,
        PLATFORM_TRANSACTIONS_COLLECTION_ID,
        [
          Query.equal("userId", userId),
          Query.orderDesc("createdAt"),
          Query.limit(limit),
          Query.offset(offset)
        ]
      );

      return transactions.documents as unknown as Transaction[];
    } catch (error) {
      console.error("Error fetching transactions by userId:", error);
      return [];
    }
  }

  // Update transaction status
  async updateTransactionStatus(transactionId: string, status: Transaction['status']): Promise<Transaction | null> {
    try {
      const updatedTransaction = await databases.updateDocument(
        FINANCE_DATABASE_ID,
        PLATFORM_TRANSACTIONS_COLLECTION_ID,
        transactionId,
        {
          status,
          updatedAt: new Date().toISOString()
        }
      );
      return updatedTransaction as unknown as Transaction;
    } catch (error) {
      console.error("Error updating transaction status:", error);
      return null;
    }
  }

  // --- Payment Method Management ---

  // Add a payment method
  async addPaymentMethod(paymentMethodData: Partial<PaymentMethod>): Promise<PaymentMethod | null> {
    try {
      const newPaymentMethod = await databases.createDocument(
        FINANCE_DATABASE_ID,
        USER_PAYMENT_METHODS_COLLECTION_ID,
        ID.unique(),
        {
          // Set default values for required fields
          type: paymentMethodData.type || 'card',
          isDefault: paymentMethodData.isDefault || false,
          createdAt: new Date().toISOString(),
          // Include all other fields from paymentMethodData
          ...paymentMethodData
        }
      );
      return newPaymentMethod as unknown as PaymentMethod;
    } catch (error) {
      console.error("Error adding payment method:", error);
      return null;
    }
  }

  // Get payment method by ID
  async getPaymentMethod(paymentMethodId: string): Promise<PaymentMethod | null> {
    try {
      const paymentMethod = await databases.getDocument(
        FINANCE_DATABASE_ID,
        USER_PAYMENT_METHODS_COLLECTION_ID,
        paymentMethodId
      );
      return paymentMethod as unknown as PaymentMethod;
    } catch (error) {
      console.error("Error fetching payment method:", error);
      return null;
    }
  }

  // Get payment methods by user ID
  async getPaymentMethodsByUserId(userId: string): Promise<PaymentMethod[]> {
    try {
      const paymentMethods = await databases.listDocuments(
        FINANCE_DATABASE_ID,
        USER_PAYMENT_METHODS_COLLECTION_ID,
        [Query.equal("userId", userId)]
      );

      return paymentMethods.documents as unknown as PaymentMethod[];
    } catch (error) {
      console.error("Error fetching payment methods by userId:", error);
      return [];
    }
  }

  // Get default payment method for a user
  async getDefaultPaymentMethod(userId: string): Promise<PaymentMethod | null> {
    try {
      const paymentMethods = await databases.listDocuments(
        FINANCE_DATABASE_ID,
        USER_PAYMENT_METHODS_COLLECTION_ID,
        [
          Query.equal("userId", userId),
          Query.equal("isDefault", true)
        ]
      );

      if (paymentMethods.documents.length > 0) {
        return paymentMethods.documents[0] as unknown as PaymentMethod;
      }
      
      return null;
    } catch (error) {
      console.error("Error fetching default payment method:", error);
      return null;
    }
  }

  // Update payment method
  async updatePaymentMethod(paymentMethodId: string, paymentMethodData: Partial<PaymentMethod>): Promise<PaymentMethod | null> {
    try {
      const updatedPaymentMethod = await databases.updateDocument(
        FINANCE_DATABASE_ID,
        USER_PAYMENT_METHODS_COLLECTION_ID,
        paymentMethodId,
        {
          ...paymentMethodData,
          updatedAt: new Date().toISOString()
        }
      );
      return updatedPaymentMethod as unknown as PaymentMethod;
    } catch (error) {
      console.error("Error updating payment method:", error);
      return null;
    }
  }

  // Delete payment method
  async deletePaymentMethod(paymentMethodId: string): Promise<boolean> {
    try {
      await databases.deleteDocument(
        FINANCE_DATABASE_ID,
        USER_PAYMENT_METHODS_COLLECTION_ID,
        paymentMethodId
      );
      return true;
    } catch (error) {
      console.error("Error deleting payment method:", error);
      return false;
    }
  }

  // --- Escrow Management ---

  // Create escrow transaction
  async createEscrowTransaction(escrowData: Partial<EscrowTransaction>): Promise<EscrowTransaction | null> {
    try {
      const newEscrow = await databases.createDocument(
        FINANCE_DATABASE_ID,
        ESCROW_TRANSACTIONS_COLLECTION_ID,
        ID.unique(),
        {
          // Set default values for required fields
          amount: escrowData.amount || 0,
          currency: escrowData.currency || 'USD',
          status: escrowData.status || 'pending',
          createdAt: new Date().toISOString(),
          // Include all other fields from escrowData
          ...escrowData
        }
      );
      return newEscrow as unknown as EscrowTransaction;
    } catch (error) {
      console.error("Error creating escrow transaction:", error);
      return null;
    }
  }

  // Get escrow transaction by ID
  async getEscrowTransaction(escrowId: string): Promise<EscrowTransaction | null> {
    try {
      const escrow = await databases.getDocument(
        FINANCE_DATABASE_ID,
        ESCROW_TRANSACTIONS_COLLECTION_ID,
        escrowId
      );
      return escrow as unknown as EscrowTransaction;
    } catch (error) {
      console.error("Error fetching escrow transaction:", error);
      return null;
    }
  }

  // Get escrow transactions by milestone ID
  async getEscrowByMilestoneId(milestoneId: string): Promise<EscrowTransaction | null> {
    try {
      const escrows = await databases.listDocuments(
        FINANCE_DATABASE_ID,
        ESCROW_TRANSACTIONS_COLLECTION_ID,
        [Query.equal("milestoneId", milestoneId)]
      );

      if (escrows.documents.length > 0) {
        return escrows.documents[0] as unknown as EscrowTransaction;
      }
      
      return null;
    } catch (error) {
      console.error("Error fetching escrow by milestoneId:", error);
      return null;
    }
  }

  // Get escrow transactions by contract ID
  async getEscrowsByContractId(contractId: string): Promise<EscrowTransaction[]> {
    try {
      const escrows = await databases.listDocuments(
        FINANCE_DATABASE_ID,
        ESCROW_TRANSACTIONS_COLLECTION_ID,
        [Query.equal("contractId", contractId)]
      );

      return escrows.documents as unknown as EscrowTransaction[];
    } catch (error) {
      console.error("Error fetching escrows by contractId:", error);
      return [];
    }
  }

  // Update escrow transaction status
  async updateEscrowStatus(escrowId: string, status: EscrowTransaction['status']): Promise<EscrowTransaction | null> {
    try {
      const updatedEscrow = await databases.updateDocument(
        FINANCE_DATABASE_ID,
        ESCROW_TRANSACTIONS_COLLECTION_ID,
        escrowId,
        {
          status,
          updatedAt: new Date().toISOString()
        }
      );
      return updatedEscrow as unknown as EscrowTransaction;
    } catch (error) {
      console.error("Error updating escrow status:", error);
      return null;
    }
  }
}

// Export single instance
const financeService = new FinanceService();
export default financeService;