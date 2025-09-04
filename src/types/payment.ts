export interface PaymentTransaction {
  id: string;
  upiId: string;
  amount: number;
  status: PaymentStatus;
  createdAt: Date;
  updatedAt: Date;
  description?: string;
  merchantName: string;
}

export type PaymentStatus = 
  | 'initiated' 
  | 'pending' 
  | 'success' 
  | 'failed' 
  | 'expired';

export interface PaymentRequest {
  upiId: string;
  amount: number;
  description?: string;
}

export interface PaymentResponse {
  success: boolean;
  transactionId?: string;
  message: string;
  data?: PaymentTransaction;
}

export interface PaymentStatusResponse {
  success: boolean;
  transaction?: PaymentTransaction;
  message: string;
}