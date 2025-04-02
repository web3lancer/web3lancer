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

// Create a simple store implementation
class StellarWalletStore {
  private state: WalletState = {
    publicKey: null,
    hasSecret: false
  };

  private listeners: ((state: WalletState) => void)[] = [];

  constructor() {
    // Try to load public key from localStorage
    this.loadFromStorage();
  }

  private loadFromStorage() {
    if (typeof window !== 'undefined') {
      try {
        const storedPublicKey = localStorage.getItem('stellar_wallet_public_key');
        const hasStoredSecret = localStorage.getItem('stellar_wallet_has_secret') === 'true';
        
        if (storedPublicKey) {
          this.state = {
            publicKey: storedPublicKey,
            hasSecret: hasStoredSecret
          };
        }
      } catch (error) {
        console.error('Failed to load wallet from storage:', error);
      }
    }
  }

  private saveToStorage() {
    if (typeof window !== 'undefined') {
      try {
        if (this.state.publicKey) {
          localStorage.setItem('stellar_wallet_public_key', this.state.publicKey);
          localStorage.setItem('stellar_wallet_has_secret', this.state.hasSecret.toString());
        } else {
          localStorage.removeItem('stellar_wallet_public_key');
          localStorage.removeItem('stellar_wallet_has_secret');
          localStorage.removeItem('stellar_wallet_encrypted');
        }
      } catch (error) {
        console.error('Failed to save wallet to storage:', error);
      }
    }
  }

  private notifyListeners() {
    for (const listener of this.listeners) {
      listener(this.state);
    }
  }

  async register({ publicKey, secretKey, pincode }: { 
    publicKey: string; 
    secretKey: string; 
    pincode: string;
  }) {
    try {
      // In a real app, encrypt secretKey with pincode before storing
      const encrypted = await this.encryptSecret(secretKey, pincode);
      
      // Store in localStorage (in a real app, use more secure methods)
      localStorage.setItem('stellarWallet_publicKey', publicKey);
      localStorage.setItem('stellarWallet_secretEncrypted', encrypted);
      
      // Update state
      this.state = { publicKey, hasSecret: true };
      this.saveToStorage();
      this.notifyListeners();
      
      return true;
    } catch (error) {
      console.error('Error registering wallet:', error);
      throw error;
    }
  }

  async sign({ 
    transactionXDR, 
    network, 
    pincode 
  }: { 
    transactionXDR: string; 
    network: string; 
    pincode: string;
  }) {
    // Implementation would decrypt secret and sign transaction
    // This is just a stub for now
    throw new Error('Sign method not implemented');
  }

  clear() {
    // Clear stored wallet data
    localStorage.removeItem('stellarWallet_publicKey');
    localStorage.removeItem('stellarWallet_secretEncrypted');
    
    // Reset state
    this.state = { publicKey: null, hasSecret: false };
    this.saveToStorage();
    this.notifyListeners();
  }

  private async encryptSecret(secret: string, pincode: string): Promise<string> {
    // This is a stub - in a real app, implement proper encryption
    // Never store secrets unencrypted in localStorage
    return `encrypted_${secret}_${pincode}`;
  }

  subscribe(listener: (state: WalletState) => void): () => void {
    this.listeners.push(listener);
    
    // Immediately notify with current state
    listener(this.state);
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }
}

export const walletStore = new StellarWalletStore();
