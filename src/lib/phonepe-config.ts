// PhonePe API Configuration
export const PHONEPE_CONFIG = {
  // Production URLs
  PROD_BASE_URL: 'https://api.phonepe.com/apis/hermes',
  
  // Sandbox URLs (for testing)
  SANDBOX_BASE_URL: 'https://api-preprod.phonepe.com/apis/pg-sandbox',
  
  // API Endpoints
  ENDPOINTS: {
    INITIATE_PAYMENT: '/pg/v1/pay',
    CHECK_STATUS: '/pg/v1/status',
    REFUND: '/pg/v1/refund',
  },
  
  // Default configuration
  MERCHANT_USER_ID: 'MUID123',
  CALLBACK_URL: process.env.NEXT_PUBLIC_BASE_URL ? 
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/phonepe/callback` : 
    'http://localhost:3000/api/phonepe/callback',
  REDIRECT_URL: process.env.NEXT_PUBLIC_BASE_URL ? 
    `${process.env.NEXT_PUBLIC_BASE_URL}/payment/success` : 
    'http://localhost:3000/payment/success',
  
  // Payment methods
  PAYMENT_INSTRUMENTS: [
    {
      type: 'UPI_COLLECT',
      targetApp: 'phonepe',
    },
  ],
};

// Environment variables (will be provided by user)
export const getPhonePeCredentials = () => {
  return {
    merchantId: process.env.PHONEPE_MERCHANT_ID || '',
    saltKey: process.env.PHONEPE_SALT_KEY || '',
    saltIndex: process.env.PHONEPE_SALT_INDEX || '1',
    isProduction: process.env.NODE_ENV === 'production' && process.env.PHONEPE_PRODUCTION === 'true',
  };
};

// Get base URL based on environment
export const getPhonePeBaseUrl = (isProduction: boolean = false) => {
  return isProduction ? PHONEPE_CONFIG.PROD_BASE_URL : PHONEPE_CONFIG.SANDBOX_BASE_URL;
};