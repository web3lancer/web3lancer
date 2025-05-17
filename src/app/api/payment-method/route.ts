import { NextRequest, NextResponse } from 'next/server';
import { databases, ID, Query } from '@/app/appwrite';
import {
  FINANCE_DATABASE_ID,
  USER_WALLETS_COLLECTION_ID,
  PLATFORM_TRANSACTIONS_COLLECTION_ID,
  USER_PAYMENT_METHODS_COLLECTION_ID,
  ESCROW_TRANSACTIONS_COLLECTION_ID
} from '@/lib/env';

// Get environment variables
// const {
//   financeDatabase,
//   userPaymentMethodsCollection,
const financeDatabase = FINANCE_DATABASE_ID;
const userWalletsCollection = USER_WALLETS_COLLECTION_ID;
const platformTransactionsCollection = PLATFORM_TRANSACTIONS_COLLECTION_ID;
const userPaymentMethodsCollection = USER_PAYMENT_METHODS_COLLECTION_ID;
const escrowTransactionsCollection = ESCROW_TRANSACTIONS_COLLECTION_ID;

// Helper function to get user ID from session
// In a real implementation, replace with your auth mechanism
async function getUserId() {
  // Mock user ID for demonstration
  return "current-user-id";
}

// GET - Fetch payment methods for the authenticated user
export async function GET(request: NextRequest) {
  try {
    // Get user ID from auth
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get URL parameters
    const searchParams = request.nextUrl.searchParams;
    const paymentMethodId = searchParams.get('id');
    
    // If ID is provided, fetch specific payment method
    if (paymentMethodId) {
      const paymentMethod = await databases.getDocument(
        financeDatabase,
        userPaymentMethodsCollection,
        paymentMethodId
      );
      
      // Verify ownership
      if (paymentMethod.userId !== userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }
      
      return NextResponse.json(paymentMethod);
    }
    
    // Fetch all payment methods for user
    const paymentMethods = await databases.listDocuments(
      financeDatabase,
      userPaymentMethodsCollection,
      [
        Query.equal("userId", userId)
      ]
    );
    
    return NextResponse.json(paymentMethods.documents);
    
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    return NextResponse.json({ error: 'Failed to fetch payment methods' }, { status: 500 });
  }
}

// POST - Create a new payment method
export async function POST(request: NextRequest) {
  try {
    // Get user ID from auth
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    
    // Validate required fields
    if (!data.type || !data.name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // If setting as default, unset any existing default
    if (data.isDefault) {
      const existingDefaults = await databases.listDocuments(
        financeDatabase,
        userPaymentMethodsCollection,
        [
          Query.equal("userId", userId),
          Query.equal("isDefault", true)
        ]
      );
      
      // Update existing defaults to non-default
      for (const method of existingDefaults.documents) {
        await databases.updateDocument(
          financeDatabase,
          userPaymentMethodsCollection,
          method.$id,
          { isDefault: false }
        );
      }
    }
    
    // Create new payment method
    const paymentMethod = await databases.createDocument(
      financeDatabase,
      userPaymentMethodsCollection,
      ID.unique(),
      {
        userId,
        type: data.type,
        name: data.name,
        details: data.details || {},
        isDefault: data.isDefault || false,
        isActive: true,
        createdAt: new Date().toISOString()
      }
    );
    
    return NextResponse.json(paymentMethod);
    
  } catch (error) {
    console.error('Error creating payment method:', error);
    return NextResponse.json({ error: 'Failed to create payment method' }, { status: 500 });
  }
}

// PUT - Update an existing payment method
export async function PUT(request: NextRequest) {
  try {
    // Get user ID from auth
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get URL parameters
    const searchParams = request.nextUrl.searchParams;
    const paymentMethodId = searchParams.get('id');
    
    if (!paymentMethodId) {
      return NextResponse.json({ error: 'Payment method ID is required' }, { status: 400 });
    }
    
    // Get existing payment method
    const existingMethod = await databases.getDocument(
      financeDatabase,
      userPaymentMethodsCollection,
      paymentMethodId
    );
    
    // Verify ownership
    if (existingMethod.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    const data = await request.json();
    
    // If setting as default, unset any existing default
    if (data.isDefault) {
      const existingDefaults = await databases.listDocuments(
        financeDatabase,
        userPaymentMethodsCollection,
        [
          Query.equal("userId", userId),
          Query.equal("isDefault", true),
          Query.notEqual("$id", paymentMethodId)
        ]
      );
      
      // Update existing defaults to non-default
      for (const method of existingDefaults.documents) {
        await databases.updateDocument(
          financeDatabase,
          userPaymentMethodsCollection,
          method.$id,
          { isDefault: false }
        );
      }
    }
    
    // Update payment method
    const updatedMethod = await databases.updateDocument(
      financeDatabase,
      userPaymentMethodsCollection,
      paymentMethodId,
      {
        ...(data.name && { name: data.name }),
        ...(data.type && { type: data.type }),
        ...(data.details && { details: data.details }),
        ...(data.isDefault !== undefined && { isDefault: data.isDefault }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        updatedAt: new Date().toISOString()
      }
    );
    
    return NextResponse.json(updatedMethod);
    
  } catch (error) {
    console.error('Error updating payment method:', error);
    return NextResponse.json({ error: 'Failed to update payment method' }, { status: 500 });
  }
}

// DELETE - Delete a payment method
export async function DELETE(request: NextRequest) {
  try {
    // Get user ID from auth
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get URL parameters
    const searchParams = request.nextUrl.searchParams;
    const paymentMethodId = searchParams.get('id');
    
    if (!paymentMethodId) {
      return NextResponse.json({ error: 'Payment method ID is required' }, { status: 400 });
    }
    
    // Get existing payment method
    const existingMethod = await databases.getDocument(
      financeDatabase,
      userPaymentMethodsCollection,
      paymentMethodId
    );
    
    // Verify ownership
    if (existingMethod.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    // Prevent deleting default payment method
    if (existingMethod.isDefault) {
      return NextResponse.json({ 
        error: 'Cannot delete default payment method. Please set another method as default first.' 
      }, { status: 400 });
    }
    
    // Delete payment method
    await databases.deleteDocument(
      financeDatabase,
      userPaymentMethodsCollection,
      paymentMethodId
    );
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Error deleting payment method:', error);
    return NextResponse.json({ error: 'Failed to delete payment method' }, { status: 500 });
  }
}