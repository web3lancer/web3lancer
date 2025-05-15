// Wallet type for managing user wallets
export interface Wallet {
  $id: string;
  userId: string;
  type: 'fiat' | 'crypto';
  currency: string;
  address?: string; // For crypto wallets
  network?: string; // For crypto wallets
  balance: number;
  isDefault: boolean;
  isActive: boolean;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt?: string;
}

// Transaction type for financial transactions
export interface Transaction {
  $id: string;
  userId: string;
  walletId: string;
  amount: number;
  currency: string;
  type: 'deposit' | 'withdrawal' | 'payment' | 'refund' | 'fee' | 'escrow' | 'release';
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  reference?: string;
  description?: string;
  paymentMethodId?: string;
  contractId?: string;
  milestoneId?: string;
  metadata?: Record<string, any>;
  txHash?: string; // For blockchain transactions
  createdAt: string;
  updatedAt?: string;
  completedAt?: string;
}

// Payment method type
export interface PaymentMethod {
  $id: string;
  userId: string;
  type: 'card' | 'bank_account' | 'crypto_wallet' | 'paypal';
  name: string;
  isDefault: boolean;
  isActive: boolean;
  details: {
    last4?: string;
    brand?: string;
    expiryMonth?: string;
    expiryYear?: string;
    bankName?: string;
    accountType?: string;
    walletAddress?: string;
    email?: string;
  };
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt?: string;
}

// Escrow transaction type
export interface EscrowTransaction {
  $id: string;
  contractId: string;
  milestoneId: string;
  fromWalletId: string;
  toWalletId?: string;
  amount: number;
  currency: string;
  status: 'pending' | 'funded' | 'released' | 'refunded' | 'disputed';
  platformFee?: number;
  txHash?: string; // For on-chain escrow
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt?: string;
  completedAt?: string;
}