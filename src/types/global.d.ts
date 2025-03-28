// TypeScript declarations for wallet interfaces
interface EthereumProvider {
  isMetaMask?: boolean;
  isBraveWallet?: boolean;
  isOKXWallet?: boolean;
  isPhantom?: boolean;
  isCoinbaseWallet?: boolean;
  providers?: EthereumProvider[];
  request?: (request: { method: string; params?: any[] }) => Promise<any>;
  on?: (event: string, callback: (...args: any[]) => void) => void;
  removeListener?: (event: string, callback: (...args: any[]) => void) => void;
  selectedAddress?: string;
  chainId?: string;
}

// Extend Window interface
interface Window {
  ethereum?: EthereumProvider;
}
