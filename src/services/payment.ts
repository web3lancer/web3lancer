import { API_ENDPOINTS } from '@/lib/env';

/**
 * PhotonLancerr Payment Integration
 * 
 * This service provides methods to interact with the PhotonLancerr payment processing backend.
 */

// Types for payment processing
export interface PaymentRequest {
  amount: number;
  currency: string;
  method: string;
  description?: string;
}

export interface PaymentResponse {
  transaction_id: string;
  status: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Check if the payment API is available
 */
export async function checkPaymentApiHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_ENDPOINTS.PAYMENT.BASE_URL}${API_ENDPOINTS.PAYMENT.HEALTH}`);
    const data = await response.json();
    return data.success === true;
  } catch (error) {
    console.error('Payment API health check failed:', error);
    return false;
  }
}

/**
 * Process a payment using PhotonLancerr
 */
export async function processPayment(
  payment: PaymentRequest
): Promise<ApiResponse<PaymentResponse>> {
  try {
    const response = await fetch(
      `${API_ENDPOINTS.PAYMENT.BASE_URL}${API_ENDPOINTS.PAYMENT.PAYMENTS}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payment),
      }
    );
    
    return await response.json();
  } catch (error) {
    console.error('Payment processing failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown payment processing error',
    };
  }
}

/**
 * Get available payment plugins
 */
export async function getPaymentPlugins(): Promise<ApiResponse<Array<{name: string, version: string}>>> {
  try {
    const response = await fetch(
      `${API_ENDPOINTS.PAYMENT.BASE_URL}${API_ENDPOINTS.PAYMENT.PLUGINS}`
    );
    
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch payment plugins:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error fetching payment plugins',
    };
  }
}
