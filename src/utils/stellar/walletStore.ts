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
    this.listeners.forEach(listener => listener(this.state));
  }

  async register(params: RegisterParams): Promise<void> {
    try {
      // In a real implementation, this would encrypt the secret key
      // For demo purposes, we're just storing that we have a secret
      if (typeof window !== 'undefined') {
        // Store encrypted key (simplified implementation)
        const encrypted = btoa(params.secretKey + ':' + params.pincode);
        localStorage.setItem('stellar_wallet_encrypted', encrypted);
      }

      this.state = {
        publicKey: params.publicKey,
        hasSecret: true
      };

      this.saveToStorage();
      this.notifyListeners();
    } catch (error) {
      console.error('Failed to register wallet:', error);
      throw error;
    }
  }

  async sign(params: SignParams): Promise<string> {
    try {
      // In a real implementation, this would decrypt and use the secret key
      // For demo purposes, we just return the XDR
      if (!this.state.hasSecret) {
        throw new Error('No secret key available for signing');
      }

      // Simulate signing (in a real app, you would decrypt and use the secret key)
      // Return the same XDR to indicate "signing" happened
      return params.transactionXDR;
    } catch (error) {
      console.error('Failed to sign transaction:', error);
      throw error;
    }
  }

  clear(): void {
    this.state = {
      publicKey: null,
      hasSecret: false
    };
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('stellar_wallet_public_key');
      localStorage.removeItem('stellar_wallet_has_secret');
      localStorage.removeItem('stellar_wallet_encrypted');
    }
    
    this.notifyListeners();
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
