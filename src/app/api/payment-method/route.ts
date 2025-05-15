import { NextRequest, NextResponse } from "next/server";
import { addPaymentMethod, getUserPaymentMethods, updatePaymentMethod, deletePaymentMethod, setDefaultPaymentMethod } from "@/services/financeService";
import { getProfileByUserId } from "@/utils/profile";
import { validateSession } from "@/utils/auth";

export async function GET(req: NextRequest) {
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

    // Get payment methods for the user's profile
    const paymentMethods = await getUserPaymentMethods(userProfile.$id);
    
    return NextResponse.json({ paymentMethods });
  } catch (error) {
    console.error("Error getting payment methods:", error);
    return NextResponse.json({ error: "Failed to get payment methods" }, { status: 500 });
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
    const { paymentType, details, isDefault } = await req.json();
    
    // Validate inputs
    if (!paymentType || !['card', 'bank_account', 'paypal', 'crypto'].includes(paymentType)) {
      return NextResponse.json({ error: "Valid payment type is required" }, { status: 400 });
    }
    
    if (!details) {
      return NextResponse.json({ error: "Payment details are required" }, { status: 400 });
    }

    // Create payment method
    const paymentMethod = await addPaymentMethod(
      userProfile.$id, 
      paymentType as 'card' | 'bank_account' | 'paypal' | 'crypto',
      details,
      !!isDefault
    );
    
    return NextResponse.json({ paymentMethod }, { status: 201 });
  } catch (error) {
    console.error("Error creating payment method:", error);
    return NextResponse.json({ error: "Failed to create payment method" }, { status: 500 });
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
    const { paymentMethodId, isDefault, details } = await req.json();
    
    // Validate inputs
    if (!paymentMethodId) {
      return NextResponse.json({ error: "Payment method ID is required" }, { status: 400 });
    }

    // Update payment method
    const updateData: any = {};
    if (details !== undefined) updateData.details = details;
    if (isDefault !== undefined) {
      if (isDefault) {
        // Set as default payment method
        await setDefaultPaymentMethod(userProfile.$id, paymentMethodId);
      } else {
        updateData.isDefault = false;
      }
    }

    const updatedPaymentMethod = await updatePaymentMethod(paymentMethodId, updateData);
    
    return NextResponse.json({ paymentMethod: updatedPaymentMethod });
  } catch (error) {
    console.error("Error updating payment method:", error);
    return NextResponse.json({ error: "Failed to update payment method" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    // Get user session
    const session = await validateSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get payment method ID from URL params
    const url = new URL(req.url);
    const searchParams = new URLSearchParams(url.search);
    const paymentMethodId = searchParams.get('paymentMethodId');
    
    if (!paymentMethodId) {
      return NextResponse.json({ error: "Payment method ID is required" }, { status: 400 });
    }

    // Delete payment method
    await deletePaymentMethod(paymentMethodId);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting payment method:", error);
    return NextResponse.json({ error: "Failed to delete payment method" }, { status: 500 });
  }
}