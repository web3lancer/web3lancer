import { KeyManager, KeyManagerPlugins, KeyType } from "@stellar/wallet-sdk";
import { TransactionBuilder } from "@stellar/stellar-sdk";

// Interface for the wallet store state
interface WalletStoreState {
  keyId: string;
  publicKey: string;
  devInfo?: {
    secretKey: string;
  };
}

// Function to create a wallet store
function createWalletStore() {
  // Initialize state from localStorage or with default values
  const getInitialState = (): WalletStoreState => {
    if (typeof window !== 'undefined') {
      const storedData = localStorage.getItem('web3lancer:walletStore');
      if (storedData) {
        return JSON.parse(storedData);
      }
    }
    return { keyId: "", publicKey: "" };
  };

  // Store the current state
  let state = getInitialState();
  
  // Subscribe function for reactivity (similar to Svelte's store)
  const subscribers = new Set<(state: WalletStoreState) => void>();

  // Update state and notify subscribers
  const setState = (newState: WalletStoreState) => {
    state = newState;
    if (typeof window !== 'undefined') {
      localStorage.setItem('web3lancer:walletStore', JSON.stringify(state));
    }
    subscribers.forEach(callback => callback(state));
  };

  return {
    // Subscribe to state changes
    subscribe: (callback: (state: WalletStoreState) => void) => {
      subscribers.add(callback);
      callback(state); // Call immediately with current value
      
      // Return unsubscribe function
      return () => {
        subscribers.delete(callback);
      };
    },

    // Get current state
    getState: () => state,

    // Register a user by storing their encrypted keypair
    register: async ({ 
      publicKey, 
      secretKey, 
      pincode 
    }: { 
      publicKey: string; 
      secretKey: string; 
      pincode: string 
    }) => {
      try {
        // Get KeyManager to interact with stored keypairs
        const keyManager = setupKeyManager();

        // Store the key in local storage
        const keyMetadata = await keyManager.storeKey({
          key: {
            type: KeyType.plaintextKey,
            publicKey,
            privateKey: secretKey,
          },
          password: pincode,
          encrypterName: KeyManagerPlugins.ScryptEncrypter.name,
        });

        // Update the wallet store state
        setState({
          keyId: keyMetadata.id,
          publicKey,
          // Dev info - not for production use
          devInfo: {
            secretKey,
          },
        });
      } catch (err) {
        console.error("Error saving key", err);
        throw new Error(`Failed to register wallet: ${err instanceof Error ? err.message : String(err)}`);
      }
    },

    // Confirm the pincode is correct
    confirmCorrectPincode: async ({
      pincode,
      firstPincode = "",
      signup = false,
    }: {
      pincode: string;
      firstPincode?: string;
      signup?: boolean;
    }) => {
      // For signup, just compare pincodes
      if (signup) {
        if (pincode !== firstPincode) {
          throw new Error("Pincode mismatch");
        }
        return;
      }

      // For existing wallet, try to load the key with the pincode
      try {
        const keyManager = setupKeyManager();
        const { keyId } = state;
        await keyManager.loadKey(keyId, pincode);
      } catch (err) {
        throw new Error("Invalid pincode");
      }
    },

    // Sign a transaction
    sign: async ({ 
      transactionXDR, 
      network, 
      pincode 
    }: { 
      transactionXDR: string; 
      network: string; 
      pincode: string 
    }) => {
      try {
        const keyManager = setupKeyManager();
        const signedTransaction = await keyManager.signTransaction({
          transaction: TransactionBuilder.fromXDR(transactionXDR, network),
          id: state.keyId,
          password: pincode,
        });
        return signedTransaction;
      } catch (err) {
        console.error("Error signing transaction", err);
        throw new Error(`Failed to sign transaction: ${err instanceof Error ? err.message : String(err)}`);
      }
    },

    // Clear wallet data (for logout)
    clear: () => {
      setState({ keyId: "", publicKey: "" });
    }
  };
}

// Configure a KeyManager for use with stored keypairs
const setupKeyManager = () => {
  // Create a new KeyStore
  const localKeyStore = new KeyManagerPlugins.LocalStorageKeyStore();

  // Configure it with a prefix
  localKeyStore.configure({
    prefix: "web3lancer",
    storage: typeof window !== 'undefined' ? localStorage : null,
  });

  // Create a KeyManager that uses the KeyStore
  const keyManager = new KeyManager({
    keyStore: localKeyStore,
  });

  // Register the scrypt encrypter
  keyManager.registerEncrypter(KeyManagerPlugins.ScryptEncrypter);

  return keyManager;
};

// Export the wallet store
export const walletStore = createWalletStore();
