import crypto from 'crypto';
import { getPhonePeCredentials, getPhonePeBaseUrl, PHONEPE_CONFIG } from './phonepe-config';

// PhonePe API Types
export interface PhonePePaymentRequest {
  merchantTransactionId: string;
  amount: number;
  merchantUserId: string;
  upiId: string;
  description?: string;
}

export interface PhonePePaymentResponse {
  success: boolean;
  code: string;
  message: string;
  data?: {
    merchantTransactionId: string;
    transactionId: string;
    instrumentResponse?: {
      type: string;
      redirectInfo?: {
        url: string;
        method: string;
      };
      intentInfo?: {
        url: string;
      };
    };
  };
}

export interface PhonePeStatusResponse {
  success: boolean;
  code: string;
  message: string;
  data?: {
    merchantTransactionId: string;
    transactionId: string;
    amount: number;
    state: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
    responseCode: string;
    paymentInstrument?: {
      type: string;
      upiTransactionId?: string;
    };
  };
}

// Generate X-VERIFY header for PhonePe API authentication
export function generatePhonePeChecksum(payload: string, endpoint: string): string {
  const credentials = getPhonePeCredentials();
  const saltKey = credentials.saltKey;
  const saltIndex = credentials.saltIndex;
  
  // Create checksum: BASE64(SHA256(payload + endpoint + saltKey)) + ### + saltIndex
  const stringToHash = payload + endpoint + saltKey;
  const hash = crypto.createHash('sha256').update(stringToHash).digest('base64');
  return `${hash}###${saltIndex}`;
}

// Initiate UPI payment with PhonePe
export async function initiatePhonePePayment(paymentData: PhonePePaymentRequest): Promise<PhonePePaymentResponse> {
  const credentials = getPhonePeCredentials();
  
  if (!credentials.merchantId || !credentials.saltKey) {
    throw new Error('PhonePe credentials not configured. Please provide PHONEPE_MERCHANT_ID and PHONEPE_SALT_KEY.');
  }

  const baseUrl = getPhonePeBaseUrl(credentials.isProduction);
  const endpoint = PHONEPE_CONFIG.ENDPOINTS.INITIATE_PAYMENT;
  
  // Prepare payload
  const payload = {
    merchantId: credentials.merchantId,
    merchantTransactionId: paymentData.merchantTransactionId,
    merchantUserId: paymentData.merchantUserId,
    amount: paymentData.amount * 100, // Convert to paise
    redirectUrl: PHONEPE_CONFIG.REDIRECT_URL,
    redirectMode: 'REDIRECT',
    callbackUrl: PHONEPE_CONFIG.CALLBACK_URL,
    paymentInstrument: {
      type: 'UPI_COLLECT',
      vpa: paymentData.upiId, // Virtual Payment Address (UPI ID)
    },
  };

  const payloadString = JSON.stringify(payload);
  const base64Payload = Buffer.from(payloadString).toString('base64');
  
  // Generate checksum
  const checksum = generatePhonePeChecksum(base64Payload, endpoint);
  
  try {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-VERIFY': checksum,
        'X-MERCHANT-ID': credentials.merchantId,
      },
      body: JSON.stringify({
        request: base64Payload,
      }),
    });

    const result: PhonePePaymentResponse = await response.json();
    
    if (!response.ok) {
      throw new Error(`PhonePe API error: ${result.message || 'Unknown error'}`);
    }

    return result;
  } catch (error) {
    console.error('PhonePe payment initiation error:', error);
    throw error;
  }
}

// Check payment status with PhonePe
export async function checkPhonePePaymentStatus(merchantTransactionId: string): Promise<PhonePeStatusResponse> {
  const credentials = getPhonePeCredentials();
  
  if (!credentials.merchantId || !credentials.saltKey) {
    throw new Error('PhonePe credentials not configured. Please provide PHONEPE_MERCHANT_ID and PHONEPE_SALT_KEY.');
  }

  const baseUrl = getPhonePeBaseUrl(credentials.isProduction);
  const endpoint = `${PHONEPE_CONFIG.ENDPOINTS.CHECK_STATUS}/${credentials.merchantId}/${merchantTransactionId}`;
  
  // Generate checksum for status check
  const checksum = generatePhonePeChecksum('', endpoint);
  
  try {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-VERIFY': checksum,
        'X-MERCHANT-ID': credentials.merchantId,
      },
    });

    const result: PhonePeStatusResponse = await response.json();
    
    if (!response.ok) {
      throw new Error(`PhonePe API error: ${result.message || 'Unknown error'}`);
    }

    return result;
  } catch (error) {
    console.error('PhonePe status check error:', error);
    throw error;
  }
}

// Map PhonePe status to our internal status
export function mapPhonePeStatus(phonePeState: string): 'initiated' | 'pending' | 'success' | 'failed' | 'expired' {
  switch (phonePeState) {
    case 'PENDING':
      return 'pending';
    case 'COMPLETED':
      return 'success';
    case 'FAILED':
    case 'CANCELLED':
      return 'failed';
    default:
      return 'failed';
  }
}

// Verify webhook signature
export function verifyPhonePeWebhookSignature(payload: string, signature: string): boolean {
  const credentials = getPhonePeCredentials();
  const saltKey = credentials.saltKey;
  
  try {
    // Decode the signature
    const [hash, saltIndex] = signature.split('###');
    
    if (saltIndex !== credentials.saltIndex) {
      return false;
    }
    
    // Generate expected hash
    const stringToHash = payload + saltKey;
    const expectedHash = crypto.createHash('sha256').update(stringToHash).digest('base64');
    
    return hash === expectedHash;
  } catch {
    return false;
  }
}