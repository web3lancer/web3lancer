import { NextRequest, NextResponse } from "next/server";
import { 
  createEscrowTransaction, 
  releaseEscrowFunds, 
  refundEscrowFunds, 
  getContractEscrowTransactions,
  getMilestoneEscrowTransaction 
} from "@/services/financeService";
import { validateSession } from "@/utils/api";

import getProfileByUserId from '@/services/profileService';

export async function GET(req: NextRequest) {
  try {
    // Get user session
    const session = await validateSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get parameters from query
    const url = new URL(req.url);
    const contractId = url.searchParams.get('contractId');
    const milestoneId = url.searchParams.get('milestoneId');
    
    if (!contractId && !milestoneId) {
      return NextResponse.json({ error: "Either contractId or milestoneId is required" }, { status: 400 });
    }

    let transactions;
    
    if (milestoneId) {
      // Get escrow transaction for a specific milestone
      const transaction = await getMilestoneEscrowTransaction(milestoneId);
      transactions = transaction ? [transaction] : [];
    } else if (contractId) {
      // Get all escrow transactions for a contract
      transactions = await getContractEscrowTransactions(contractId);
    }
    
    return NextResponse.json({ transactions });
  } catch (error) {
    console.error("Error getting escrow transactions:", error);
    return NextResponse.json({ error: "Failed to get escrow transactions" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    // Get user session
    const session = await validateSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.userId;
    
    // Get user profile
    const userProfile = await getProfileByUserId(userId);
    if (!userProfile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Get request body
    const { contractId, amount, currency, receiverProfileId, milestoneId } = await req.json();
    
    // Validate inputs
    if (!contractId) {
      return NextResponse.json({ error: "Contract ID is required" }, { status: 400 });
    }
    
    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Valid amount is required" }, { status: 400 });
    }
    
    if (!currency) {
      return NextResponse.json({ error: "Currency is required" }, { status: 400 });
    }
    
    if (!receiverProfileId) {
      return NextResponse.json({ error: "Receiver profile ID is required" }, { status: 400 });
    }

    // Create escrow transaction
    const escrowTransaction = await createEscrowTransaction(
      contractId,
      amount,
      currency,
      userProfile.$id, // Funder is the current user
      receiverProfileId,
      milestoneId
    );
    
    return NextResponse.json({ escrowTransaction }, { status: 201 });
  } catch (error) {
    console.error("Error creating escrow transaction:", error);
    return NextResponse.json({ error: "Failed to create escrow transaction" }, { status: 500 });
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
    const { escrowTransactionId, action } = await req.json();
    
    // Validate inputs
    if (!escrowTransactionId) {
      return NextResponse.json({ error: "Escrow transaction ID is required" }, { status: 400 });
    }
    
    if (!action || !['release', 'refund'].includes(action)) {
      return NextResponse.json({ error: "Valid action (release or refund) is required" }, { status: 400 });
    }

    let updatedEscrow;
    
    if (action === 'release') {
      // Release funds to receiver
      updatedEscrow = await releaseEscrowFunds(escrowTransactionId);
    } else if (action === 'refund') {
      // Refund funds to funder
      updatedEscrow = await refundEscrowFunds(escrowTransactionId);
    }
    
    return NextResponse.json({ escrowTransaction: updatedEscrow });
  } catch (error) {
    console.error("Error updating escrow transaction:", error);
    return NextResponse.json({ error: "Failed to update escrow transaction" }, { status: 500 });
  }
}