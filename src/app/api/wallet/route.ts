import { NextRequest, NextResponse } from "next/server";
import getUserWallets from "@/services/financeService";
import createUserWallet from "@/services/financeService";
import updateWallet from "@/services/financeService";
import deleteWallet from "@/services/financeService";``
import setPrimaryWallet from "@/services/financeService";``

import { validateSession } from "@/utils/api";

import getProfileByUserId from '@/services/profileService';
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
    // const userProfile = await getProfileByUserId(userId);
    const userProfile = await profileService.getProfileByUserId(userId);
    if (!userProfile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Get wallets for the user's profile
    const wallets = await getUserWallets(userProfile.$id);
    
    return NextResponse.json({ wallets });
  } catch (error) {
    console.error("Error getting wallets:", error);
    return NextResponse.json({ error: "Failed to get wallets" }, { status: 500 });
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
    const { walletAddress, walletType, isPrimary, nickname } = await req.json();
    
    // Validate inputs
    if (!walletAddress) {
      return NextResponse.json({ error: "Wallet address is required" }, { status: 400 });
    }
    
    if (!walletType || !['ethereum', 'solana', 'xion', 'internal'].includes(walletType)) {
      return NextResponse.json({ error: "Valid wallet type is required" }, { status: 400 });
    }

    // Create wallet
    const wallet = new createUserWallet(userProfile.$id,
      walletAddress,
      walletType as 'ethereum' | 'solana' | 'xion' | 'internal',
      !!isPrimary,
      nickname);
    
    return NextResponse.json({ wallet }, { status: 201 });
  } catch (error) {
    console.error("Error creating wallet:", error);
    return NextResponse.json({ error: "Failed to create wallet" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
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
    const { walletId, nickname, isPrimary } = await req.json();
    
    // Validate inputs
    if (!walletId) {
      return NextResponse.json({ error: "Wallet ID is required" }, { status: 400 });
    }

    // Update wallet
    const updateData: any = {};
    if (nickname !== undefined) updateData.nickname = nickname;
    if (isPrimary !== undefined) {
      if (isPrimary) {
        // Set as primary wallet
        await setPrimaryWallet(userProfile.$id, walletId);
      } else {
        updateData.isPrimary = false;
      }
    }

    const updatedWallet = await updateWallet(walletId, updateData);
    
    return NextResponse.json({ wallet: updatedWallet });
  } catch (error) {
    console.error("Error updating wallet:", error);
    return NextResponse.json({ error: "Failed to update wallet" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    // Get user session
    const session = await validateSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get wallet ID from URL params
    const url = new URL(req.url);
    const searchParams = new URLSearchParams(url.search);
    const walletId = searchParams.get('walletId');
    
    if (!walletId) {
      return NextResponse.json({ error: "Wallet ID is required" }, { status: 400 });
    }

    // Delete wallet
    await deleteWallet(walletId);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting wallet:", error);
    return NextResponse.json({ error: "Failed to delete wallet" }, { status: 500 });
  }
}