import { Keypair, Transaction, Networks } from '@stellar/stellar-sdk';
import CryptoJS from 'crypto-js';

// Local storage key for encrypted wallet data
const STORAGE_KEY = 'stellar_wallet';

// WalletStore state interface
interface WalletState {
  publicKey: string | null;
  hasSecret: boolean;
}

// Registration parameters interface
interface RegisterParams {
  publicKey: string;
  secretKey: string;
  pincode: string;
}

// Signing parameters interface
interface SignParams {
  transactionXDR: string;
  network: string;
  pincode: string;
}

/**
 * Creates a wallet store to manage a Stellar wallet
 */
class WalletStore {
  private state: WalletState = {
    publicKey: null,
    hasSecret: false
  };
  private listeners: Array<(state: WalletState) => void> = [];

  constructor() {
    this.loadFromStorage();
  }

  /**
   * Load wallet data from local storage
   */
  private loadFromStorage() {
    if (typeof window === 'undefined') return;
    
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        this.state = {
          publicKey: parsed.publicKey,
          hasSecret: !!parsed.encryptedSecret
        };
        this.notifyListeners();
      } catch (err) {
        console.error('Failed to parse wallet data from storage:', err);
      }
    }
  }

  /**
   * Save wallet data to local storage
   */
  private saveToStorage(publicKey: string, encryptedSecret: string) {
    if (typeof window === 'undefined') return;
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      publicKey,
      encryptedSecret
    }));
    
    this.state = {
      publicKey,
      hasSecret: true
    };
    
    this.notifyListeners();
  }

  /**
   * Encrypt secret key with pincode
   */
  private encryptSecret(secretKey: string, pincode: string): string {
    return CryptoJS.AES.encrypt(secretKey, pincode).toString();
  }

  /**
   * Decrypt secret key with pincode
   */
  private decryptSecret(encryptedSecret: string, pincode: string): string {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedSecret, pincode);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      throw new Error('Incorrect pincode');
    }
  }

  /**
   * Notify all listeners of state changes
   */
  private notifyListeners() {
    for (const listener of this.listeners) {
      listener(this.state);
    }
  }

  /**
   * Subscribe to state changes
   */
  subscribe(listener: (state: WalletState) => void) {
    this.listeners.push(listener);
    // Immediately notify the new listener of current state
    listener(this.state);
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  /**
   * Register a new wallet
   */
  async register({ publicKey, secretKey, pincode }: RegisterParams): Promise<void> {
    const encryptedSecret = this.encryptSecret(secretKey, pincode);
    this.saveToStorage(publicKey, encryptedSecret);
  }

  /**
   * Sign a transaction using the stored keypair
   */
  async sign({ transactionXDR, network, pincode }: SignParams): Promise<Transaction> {
    if (typeof window === 'undefined') {
      throw new Error('Cannot access storage in server environment');
    }
    
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (!savedData) {
      throw new Error('No wallet found');
    }
    
    try {
      const { publicKey, encryptedSecret } = JSON.parse(savedData);
      
      if (!publicKey || !encryptedSecret) {
        throw new Error('Invalid wallet data');
      }
      
      // Decrypt the secret key
      const secretKey = this.decryptSecret(encryptedSecret, pincode);
      
      // Create keypair from secret
      const keypair = Keypair.fromSecret(secretKey);
      
      // Deserialize and sign the transaction
      const transaction = new Transaction(transactionXDR, network);
      transaction.sign(keypair);
      
      return transaction;
    } catch (error: any) {
      if (error.message === 'Incorrect pincode') {
        throw new Error('Incorrect pincode');
      }
      throw new Error(`Failed to sign transaction: ${error.message}`);
    }
  }

  /**
   * Clear wallet data from storage
   */
  clear() {
    if (typeof window === 'undefined') return;
    
    localStorage.removeItem(STORAGE_KEY);
    this.state = {
      publicKey: null,
      hasSecret: false
    };
    this.notifyListeners();
  }

  /**
   * Get current wallet state
   */
  getState(): WalletState {
    return { ...this.state };
  }
}

// Create a singleton instance
export const walletStore = new WalletStore();
