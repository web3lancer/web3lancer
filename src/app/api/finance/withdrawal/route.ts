import { NextRequest, NextResponse } from 'next/server';
import { databases, ID } from '@/app/appwrite';
import FinanceEnv from '@/lib/finance/financeEnv';
import { calculatePlatformFee } from '@/utils/financeUtils';
import { getSession } from '@/utils/auth';

// Get environment variables
const {
  financeDatabase,
  userWalletsCollection,
  platformTransactionsCollection,
  userPaymentMethodsCollection
} = FinanceEnv.getAll();

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
    if (!data.walletId || !data.amount || data.amount <= 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
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

    // Verify payment method belongs to user if provided
    if (data.paymentMethodId) {
      try {
        const paymentMethod = await databases.getDocument(
          financeDatabase,
          userPaymentMethodsCollection,
          data.paymentMethodId
        );
        
        if (paymentMethod.userId !== userId) {
          return NextResponse.json({ error: 'Unauthorized access to payment method' }, { status: 403 });
        }
      } catch (error) {
        return NextResponse.json({ error: 'Invalid payment method' }, { status: 400 });
      }
    }

    // Calculate any applicable fees (if needed)
    const fees = calculatePlatformFee(data.amount, 0.025); // 2.5% fee example
    const netAmount = data.amount - fees;

    // Create transaction record
    const transaction = await databases.createDocument(
      financeDatabase,
      platformTransactionsCollection,
      ID.unique(),
      {
        userId,
        walletId: data.walletId,
        paymentMethodId: data.paymentMethodId || null,
        amount: data.amount,
        netAmount,
        fees,
        currency: wallet.currency,
        type: 'withdrawal',
        status: 'processing',
        description: data.description || 'Wallet withdrawal',
        createdAt: new Date().toISOString()
      }
    );

    // In a real application, you would now:
    // 1. Integrate with a payment processor for actual funds movement
    // 2. Set up a webhook to update the transaction status when payment completes
    // 3. Only update the wallet balance when withdrawal is confirmed
    
    // For demo/prototype purposes, we'll update the wallet balance immediately
    const updatedWallet = await databases.updateDocument(
      financeDatabase,
      userWalletsCollection,
      data.walletId,
      {
        balance: wallet.balance - data.amount,
        updatedAt: new Date().toISOString()
      }
    );

    // Update transaction to completed for demo purposes
    await databases.updateDocument(
      financeDatabase,
      platformTransactionsCollection,
      transaction.$id,
      {
        status: 'completed',
        completedAt: new Date().toISOString()
      }
    );

    return NextResponse.json({ 
      message: 'Withdrawal initiated',
      transaction: {
        id: transaction.$id,
        amount: data.amount,
        fees,
        netAmount,
        status: 'completed'
      },
      wallet: {
        id: updatedWallet.$id,
        balance: updatedWallet.balance
      }
    });

  } catch (error) {
    console.error('Withdrawal error:', error);
    return NextResponse.json({ error: 'Failed to process withdrawal' }, { status: 500 });
  }
}