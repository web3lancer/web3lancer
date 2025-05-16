import { NextRequest, NextResponse } from 'next/server';
import { databases, ID } from '@/app/appwrite';
import {
  FINANCE_DATABASE_ID,
  USER_WALLETS_COLLECTION_ID,
  PLATFORM_TRANSACTIONS_COLLECTION_ID,
  USER_PAYMENT_METHODS_COLLECTION_ID,
  ESCROW_TRANSACTIONS_COLLECTION_ID
} from '@/lib/env';
import { calculatePlatformFee } from '@/utils/financeUtils';
import { getSession } from '@/utils/auth';

// Get environment variables
const {
  financeDatabase,
  userWalletsCollection,
  platformTransactionsCollection,
  escrowTransactionsCollection
const financeDatabase = FINANCE_DATABASE_ID;
const userWalletsCollection = USER_WALLETS_COLLECTION_ID;
const platformTransactionsCollection = PLATFORM_TRANSACTIONS_COLLECTION_ID;
const userPaymentMethodsCollection = USER_PAYMENT_METHODS_COLLECTION_ID;
const escrowTransactionsCollection = ESCROW_TRANSACTIONS_COLLECTION_ID;

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const data = await request.json();
    
    // Validate required fields
    if (!data.walletId || !data.amount || data.amount <= 0 || !data.contractId) {
      return NextResponse.json({ 
        error: 'Missing required fields. Required: walletId, amount, contractId'
      }, { status: 400 });
    }

    // Get wallet
    const wallet = await databases.getDocument(
      financeDatabase,
      userWalletsCollection,
      data.walletId
    );

    // Verify wallet belongs to the user
    if (wallet.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized access to wallet' }, { status: 403 });
    }

    // Check if wallet has sufficient balance
    if (wallet.balance < data.amount) {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
    }

    // Calculate platform fee
    const platformFee = calculatePlatformFee(data.amount, 0.05); // 5% platform fee
    const escrowAmount = data.amount - platformFee;

    // 1. Create platform fee transaction
    const feeTransaction = await databases.createDocument(
      financeDatabase,
      platformTransactionsCollection,
      ID.unique(),
      {
        userId,
        walletId: data.walletId,
        amount: platformFee,
        currency: wallet.currency,
        type: 'fee',
        status: 'completed',
        description: `Platform fee for contract #${data.contractId}${data.milestoneId ? ` milestone #${data.milestoneId}` : ''}`,
        createdAt: new Date().toISOString(),
        completedAt: new Date().toISOString()
      }
    );

    // 2. Create escrow transaction record
    const escrowTransaction = await databases.createDocument(
      financeDatabase,
      escrowTransactionsCollection,
      ID.unique(),
      {
        userId, // Client who funded the escrow
        contractId: data.contractId,
        milestoneId: data.milestoneId || null,
        amount: escrowAmount,
        platformFee,
        totalAmount: data.amount,
        currency: wallet.currency,
        status: 'funded',
        createdAt: new Date().toISOString()
      }
    );

    // 3. Create escrow funding transaction
    const escrowFundingTransaction = await databases.createDocument(
      financeDatabase,
      platformTransactionsCollection,
      ID.unique(),
      {
        userId,
        walletId: data.walletId,
        amount: escrowAmount,
        currency: wallet.currency,
        type: 'escrow',
        status: 'completed',
        escrowId: escrowTransaction.$id,
        contractId: data.contractId,
        milestoneId: data.milestoneId || null,
        description: `Escrow funding for contract #${data.contractId}${data.milestoneId ? ` milestone #${data.milestoneId}` : ''}`,
        createdAt: new Date().toISOString(),
        completedAt: new Date().toISOString()
      }
    );

    // 4. Update wallet balance
    const updatedWallet = await databases.updateDocument(
      financeDatabase,
      userWalletsCollection,
      data.walletId,
      {
        balance: wallet.balance - data.amount,
        updatedAt: new Date().toISOString()
      }
    );

    return NextResponse.json({ 
      message: 'Escrow funded successfully',
      escrow: {
        id: escrowTransaction.$id,
        amount: escrowAmount,
        platformFee,
        totalAmount: data.amount,
        status: 'funded'
      },
      wallet: {
        id: updatedWallet.$id,
        balance: updatedWallet.balance
      }
    });

  } catch (error) {
    console.error('Escrow funding error:', error);
    return NextResponse.json({ error: 'Failed to fund escrow' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // Verify authentication
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const data = await request.json();
    
    // Validate required fields
    if (!data.escrowId || !data.action || !['release', 'refund', 'dispute'].includes(data.action)) {
      return NextResponse.json({ 
        error: 'Missing or invalid fields. Required: escrowId, action (release/refund/dispute)'
      }, { status: 400 });
    }

    // Get escrow transaction
    const escrow = await databases.getDocument(
      financeDatabase,
      escrowTransactionsCollection,
      data.escrowId
    );

    // Only allow if escrow is in 'funded' state
    if (escrow.status !== 'funded') {
      return NextResponse.json({ 
        error: `Cannot ${data.action} escrow in ${escrow.status} state`
      }, { status: 400 });
    }

    // Handle different actions
    switch (data.action) {
      case 'release':
        // In a real implementation:
        // 1. Verify the user is authorized to release funds (e.g., client who funded or admin)
        // 2. Verify the contract/milestone is in appropriate state
        // 3. Transfer funds to freelancer's wallet
        
        // Mark escrow as released
        await databases.updateDocument(
          financeDatabase,
          escrowTransactionsCollection,
          data.escrowId,
          {
            status: 'released',
            releasedAt: new Date().toISOString(),
            releasedBy: userId
          }
        );
        
        return NextResponse.json({ 
          message: 'Escrow released successfully',
          escrow: {
            id: data.escrowId,
            status: 'released'
          }
        });

      case 'refund':
        // In a real implementation:
        // 1. Verify the user is authorized for refund (e.g., case of mutual agreement or admin)
        // 2. Transfer funds back to client's wallet
        
        // Mark escrow as refunded
        await databases.updateDocument(
          financeDatabase,
          escrowTransactionsCollection,
          data.escrowId,
          {
            status: 'refunded',
            refundedAt: new Date().toISOString(),
            refundedBy: userId
          }
        );
        
        return NextResponse.json({ 
          message: 'Escrow refunded successfully',
          escrow: {
            id: data.escrowId,
            status: 'refunded'
          }
        });

      case 'dispute':
        // In a real implementation:
        // 1. Create dispute record
        // 2. Possibly freeze funds until dispute resolution
        
        // Mark escrow as disputed
        await databases.updateDocument(
          financeDatabase,
          escrowTransactionsCollection,
          data.escrowId,
          {
            status: 'disputed',
            disputedAt: new Date().toISOString(),
            disputedBy: userId
          }
        );
        
        return NextResponse.json({ 
          message: 'Escrow disputed successfully',
          escrow: {
            id: data.escrowId,
            status: 'disputed'
          }
        });
        
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

  } catch (error) {
    console.error('Escrow action error:', error);
    return NextResponse.json({ error: 'Failed to process escrow action' }, { status: 500 });
  }
}