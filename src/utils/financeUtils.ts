/**
 * Utility functions for formatting financial data
 */

/**
 * Format a currency amount with the appropriate symbol
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  
  return formatter.format(amount);
}

/**
 * Format a transaction date
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
 * Get user-friendly text for transaction type
 */
export function getTransactionTypeText(type: string): string {
  const typeMap: Record<string, string> = {
    'deposit': 'Deposit',
    'withdrawal': 'Withdrawal',
    'payment': 'Payment',
    'refund': 'Refund',
    'fee': 'Fee',
    'escrow': 'Escrow',
    'release': 'Release'
  };
  
  return typeMap[type] || type.charAt(0).toUpperCase() + type.slice(1);
}

/**
 * Get CSS classes for transaction status
 */
export function getTransactionStatusClasses(
  status: string
): { bgColor: string; textColor: string; text: string } {
  switch (status) {
    case 'pending':
      return {
        bgColor: 'bg-yellow-100',
        textColor: 'text-yellow-800',
        text: 'Pending'
      };
    case 'completed':
      return {
        bgColor: 'bg-green-100',
        textColor: 'text-green-800',
        text: 'Completed'
      };
    case 'failed':
      return {
        bgColor: 'bg-red-100',
        textColor: 'text-red-800',
        text: 'Failed'
      };
    case 'cancelled':
      return {
        bgColor: 'bg-gray-100',
        textColor: 'text-gray-800',
        text: 'Cancelled'
      };
    default:
      return {
        bgColor: 'bg-gray-100',
        textColor: 'text-gray-800',
        text: status.charAt(0).toUpperCase() + status.slice(1)
      };
  }
}

/**
 * Determine if a transaction should be displayed as credit (positive amount)
 */
export function isTransactionCredit(type: string): boolean {
  const creditTypes = ['deposit', 'refund', 'release'];
  return creditTypes.includes(type);
}

/**
 * Format a wallet balance with currency symbol
 */
export function formatBalance(balance: number, currency: string = 'USD'): string {
  return formatCurrency(balance, currency);
}

/**
 * Format date to a readable string
 * @param dateString - ISO date string
 * @param includeTime - Whether to include time in the output
 * @returns Formatted date string
 */
export const formatDate = (dateString?: string, includeTime = false): string => {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    ...(includeTime && { hour: '2-digit', minute: '2-digit' })
  };
  
  return date.toLocaleDateString('en-US', options);
};

/**
 * Calculate platform fee based on amount and rate
 * @param amount - The transaction amount
 * @param feeRate - The fee rate (default: 0.05 = 5%)
 * @returns The calculated fee
 */
export const calculatePlatformFee = (amount: number, feeRate = 0.05): number => {
  return amount * feeRate;
};
