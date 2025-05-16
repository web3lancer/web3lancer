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

// Corresponds to FinanceDB/user_wallets
export interface UserWallet {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  profileId: string; // Profile.$id of the wallet owner
  address: string; // Wallet address
  chain: string; // e.g., 'ETH', 'BTC', 'SOL', 'XLM' (Stellar)
  nickname?: string; // User-defined name for the wallet
  isPrimary: boolean; // Is this the user's primary wallet for this chain/platform?
  balance?: string; // Optional: Denormalized balance, use with caution, source of truth is blockchain/internal ledger
  lastVerifiedAt?: string; // ISO Datetime of last ownership verification
  provider?: string; // e.g., 'MetaMask', 'Ledger', 'platform_internal'
}

// Corresponds to FinanceDB/platform_transactions
export interface PlatformTransaction {
  $id: string; // Appwrite document ID or custom transaction ID
  $createdAt: string;
  // $updatedAt for status changes
  $updatedAt: string; 
  profileId?: string; // Profile.$id of the user involved (if applicable)
  relatedEntityId?: string; // e.g., Contract.$id, Job.$id, WithdrawalRequest.$id
  relatedEntityType?: 'contract_payment' | 'service_fee' | 'deposit' | 'withdrawal' | 'escrow_funding' | 'escrow_release' | 'refund';
  type: 'credit' | 'debit';
  amount: number;
  currency: string; // e.g., 'USD_PLATFORM_CREDIT', 'ETH', 'USDC'
  description: string; // Detailed description of the transaction
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'reversed';
  onChainTxHash?: string; // If related to an on-chain transaction
  feeAmount?: number; // Platform fee associated with this transaction
  feeCurrency?: string;
  metadata?: Record<string, any>; // Additional details
  completedAt?: string; // ISO Datetime
}

// Corresponds to FinanceDB/user_payment_methods
export interface UserPaymentMethod {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  profileId: string; // Profile.$id of the owner
  paymentMethodType: 'card' | 'bank_account' | 'crypto_wallet_external'; // Add others as needed
  details: Record<string, any>; // Tokenized info, last4 digits for cards, wallet address for crypto, etc.
  isDefault: boolean;
  status: 'active' | 'expired' | 'revoked' | 'pending_verification';
  expiryDate?: string; // For cards
  billingAddressId?: string; // Link to a stored address if needed
}

// Corresponds to FinanceDB/escrow_transactions
export interface EscrowTransaction {
  $id: string;
  $createdAt: string;
  // $updatedAt for status changes
  $updatedAt: string; 
  contractId: string; // References Contracts.$id from JobsDB
  milestoneId?: string; // Optional: References ContractMilestones.$id if for a specific milestone
  type: 'fund' | 'release' | 'refund' | 'dispute_hold' | 'dispute_release';
  amount: number;
  currency: string;
  status: 'pending' | 'confirmed' | 'released' | 'refunded' | 'failed';
  payerId: string; // Profile.$id of the one funding (usually client)
  payeeId?: string; // Profile.$id of the one receiving (usually freelancer, set on release)
  onChainTxHashFund?: string; // On-chain hash for funding action
  onChainTxHashRelease?: string; // On-chain hash for release/refund action
  notes?: string;
  processedAt?: string; // ISO Datetime when transaction reached final state
}