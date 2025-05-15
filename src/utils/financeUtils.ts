/**
 * Utility functions for formatting financial data
 */

/**
 * Format a currency amount with the appropriate currency symbol
 */
export function formatCurrency(amount: number, currency: string): string {
  switch (currency) {
    case 'USD':
      return `$${amount.toFixed(2)}`;
    case 'EUR':
      return `€${amount.toFixed(2)}`;
    case 'GBP':
      return `£${amount.toFixed(2)}`;
    case 'JPY':
      return `¥${amount.toFixed(0)}`;
    case 'BTC':
      return `₿${amount.toFixed(8)}`;
    case 'ETH':
      return `Ξ${amount.toFixed(6)}`;
    case 'SOL':
      return `◎${amount.toFixed(4)}`;
    case 'USDT':
    case 'USDC':
      return `$${amount.toFixed(2)}`;
    default:
      return `${amount} ${currency}`;
  }
}

/**
 * Format a date string to a readable format
 */
export function formatTransactionDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Get user-friendly text for transaction types
 */
export function getTransactionTypeText(type: string): string {
  switch (type) {
    case 'deposit':
      return 'Deposit';
    case 'withdrawal':
      return 'Withdrawal';
    case 'payment':
      return 'Payment';
    case 'refund':
      return 'Refund';
    case 'fee':
      return 'Platform Fee';
    case 'escrow':
      return 'Escrow Funding';
    case 'release':
      return 'Escrow Release';
    default:
      return type.charAt(0).toUpperCase() + type.slice(1);
  }
}

/**
 * Get color classes for transaction status
 */
export function getTransactionStatusClasses(status: string): { text: string, bgColor: string, textColor: string } {
  switch (status) {
    case 'pending':
      return { 
        text: 'Pending',
        bgColor: 'bg-yellow-100',
        textColor: 'text-yellow-800'
      };
    case 'completed':
      return { 
        text: 'Completed',
        bgColor: 'bg-green-100',
        textColor: 'text-green-800'
      };
    case 'failed':
      return { 
        text: 'Failed',
        bgColor: 'bg-red-100',
        textColor: 'text-red-800'
      };
    case 'cancelled':
      return { 
        text: 'Cancelled',
        bgColor: 'bg-gray-100',
        textColor: 'text-gray-800'
      };
    default:
      return { 
        text: status.charAt(0).toUpperCase() + status.slice(1),
        bgColor: 'bg-gray-100',
        textColor: 'text-gray-800'
      };
  }
}

/**
 * Determine if a transaction type is a credit (positive) or debit (negative)
 */
export function isTransactionCredit(type: string): boolean {
  return ['deposit', 'refund', 'release'].includes(type);
}