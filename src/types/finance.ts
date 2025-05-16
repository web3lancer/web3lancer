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

// Finance related types
export interface UserWallet {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  userId: string; // UserProfile.$id of wallet owner
  balance: number;
  currency: string; // Default: 'USD'
  onChainAddresses?: { [network: string]: string }; // Maps network to address
  availableBalance?: number; // Balance that is available for withdrawal (not in escrow)
  pendingBalance?: number; // Balance not yet settled
  status: 'active' | 'suspended' | 'closed';
  lastActivityAt?: string; // ISO Date string
  isVerified: boolean; // True if wallet has passed KYC
}

export interface PaymentMethod {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  userId: string; // UserProfile.$id of payment method owner
  type: 'credit_card' | 'bank_account' | 'crypto' | 'paypal' | 'other';
  status: 'pending' | 'active' | 'expired' | 'disabled';
  isDefault: boolean;
  details: {
    // For credit cards
    cardLast4?: string;
    cardType?: string;
    expiryMonth?: string;
    expiryYear?: string;
    cardholderName?: string;
    
    // For bank accounts
    accountLast4?: string;
    bankName?: string;
    accountType?: string;
    routingNumber?: string;
    
    // For crypto
    walletAddress?: string;
    network?: string;
    
    // For PayPal
    email?: string;
  };
  billingAddress?: {
    line1: string;
    line2?: string;
    city: string;
    state?: string;
    postalCode: string;
    country: string;
  };
  processorToken?: string; // Token from payment processor
  processorId?: string; // ID from payment processor
  metadata?: { [key: string]: any }; // Additional payment processor metadata
}

export interface PlatformTransaction {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  userId: string; // UserProfile.$id of transaction owner
  walletId: string; // UserWallet.$id
  type: 'deposit' | 'withdrawal' | 'payment' | 'refund' | 'fee' | 'escrow_funding' | 'escrow_release';
  method: 'credit_card' | 'bank_account' | 'crypto' | 'paypal' | 'platform_wallet' | 'other';
  amount: number;
  currency: string;
  description: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'reversed';
  paymentMethodId?: string; // PaymentMethod.$id if applicable
  destination?: string; // For withdrawals, external destination
  source?: string; // For deposits, external source
  relatedId?: string; // ID of related entity (job, contract, etc.)
  relatedType?: string; // Type of related entity
  escrowId?: string; // EscrowTransaction.$id if applicable
  processorId?: string; // ID from payment processor
  processorResponse?: any; // Raw response from payment processor
  initiatedAt?: string; // ISO Date string
  completedAt?: string; // ISO Date string
  failedAt?: string; // ISO Date string
  reversedAt?: string; // ISO Date string
  fees?: {
    amount: number;
    currency: string;
    description: string;
  }[];
  metadata?: { [key: string]: any }; // Additional payment processor metadata
}

export interface EscrowTransaction {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  sourceWalletId: string; // UserWallet.$id of the funding wallet
  sourceUserId: string; // UserProfile.$id of the funding user
  amount: number;
  currency: string;
  purpose: string; // Description of what this escrow is for
  status: 'pending' | 'funded' | 'released' | 'refunded' | 'disputed';
  relatedId: string; // JobContract.$id or JobMilestone.$id
  relatedType: string; // 'contract' or 'milestone'
  transactionId?: string; // PlatformTransaction.$id that funded this escrow
  releaseTransactionId?: string; // PlatformTransaction.$id when released
  releasedToWalletId?: string; // UserWallet.$id where funds were released to
  releasedAt?: string; // ISO Date string
  refundedAt?: string; // ISO Date string
  disputeId?: string; // Dispute.$id if disputed
  terms?: string; // Terms of the escrow
  expiresAt?: string; // ISO Date string for automatic release
  metadata?: { [key: string]: any }; // Additional metadata
}