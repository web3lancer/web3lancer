import { databases, ID } from './client';
import { DB, COL } from './constants';
import type * as AppwriteTypes from '@/types/appwrite.d';

// --- Wallets ---
export async function createWallet(data: Partial<AppwriteTypes.Wallets>) {
  return databases.createDocument<AppwriteTypes.Wallets>(DB.FINANCE, COL.WALLETS, ID.unique(), data);
}
export async function listWallets(queries: any[] = []) {
  return databases.listDocuments<AppwriteTypes.Wallets>(DB.FINANCE, COL.WALLETS, queries);
}

// --- Transactions ---
export async function createTransaction(data: Partial<AppwriteTypes.Transactions>) {
  return databases.createDocument<AppwriteTypes.Transactions>(DB.FINANCE, COL.TRANSACTIONS, ID.unique(), data);
}
export async function listTransactions(queries: any[] = []) {
  return databases.listDocuments<AppwriteTypes.Transactions>(DB.FINANCE, COL.TRANSACTIONS, queries);
}

// --- Payment Methods ---
export async function createPaymentMethod(data: Partial<AppwriteTypes.PaymentMethods>) {
  return databases.createDocument<AppwriteTypes.PaymentMethods>(DB.FINANCE, COL.PAYMENT_METHODS, ID.unique(), data);
}
export async function listPaymentMethods(queries: any[] = []) {
  return databases.listDocuments<AppwriteTypes.PaymentMethods>(DB.FINANCE, COL.PAYMENT_METHODS, queries);
}

// --- Escrow Transactions ---
export async function createEscrowTransaction(data: Partial<AppwriteTypes.EscrowTransactions>) {
  return databases.createDocument<AppwriteTypes.EscrowTransactions>(DB.FINANCE, COL.ESCROW_TRANSACTIONS, ID.unique(), data);
}
export async function listEscrowTransactions(queries: any[] = []) {
  return databases.listDocuments<AppwriteTypes.EscrowTransactions>(DB.FINANCE, COL.ESCROW_TRANSACTIONS, queries);
}
