import { NextRequest, NextResponse } from "next/server";
import getUserTransactions from "@/services/financeService";
import updateTransactionStatus from "@/services/financeService";
// import getProfileByUserId from '@/services/profileService';

import { validateSession } from "@/utils/api";

import ProfileService from "@/services/profileService";
import { AppwriteService } from "@/services/appwriteService";
import { envConfig } from "@/config/environment";

const appwriteService = new AppwriteService(envConfig);
const profileService = new ProfileService(appwriteService, envConfig);

export async function GET(req: NextRequest) {
  try {
    // Get user session
    const session = await validateSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.userId;
    
    // Get user profile
    const userProfile = profileService.getProfileByUserId(userId);
    if (!userProfile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Get pagination parameters
    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    // Get transactions for the user's profile
    const transactions = await getUserTransactions(userProfile.$id, limit, offset);
    
    return NextResponse.json({ transactions });
  } catch (error) {
    console.error("Error getting transactions:", error);
    return NextResponse.json({ error: "Failed to get transactions" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    // Get user session
    const session = await validateSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get request body
    const { transactionId, status, txHash } = await req.json();
    
    // Validate inputs
    if (!transactionId) {
      return NextResponse.json({ error: "Transaction ID is required" }, { status: 400 });
    }
    
    if (!status || !['pending', 'completed', 'failed', 'cancelled'].includes(status)) {
      return NextResponse.json({ error: "Valid status is required" }, { status: 400 });
    }

    // Update transaction status
    const updatedTransaction = await updateTransactionStatus(
      transactionId, 
      status as 'pending' | 'completed' | 'failed' | 'cancelled',
      txHash
    );
    
    return NextResponse.json({ transaction: updatedTransaction });
  } catch (error) {
    console.error("Error updating transaction:", error);
    return NextResponse.json({ error: "Failed to update transaction" }, { status: 500 });
  }
}