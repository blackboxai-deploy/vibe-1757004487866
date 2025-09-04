import { z } from 'zod';

// UPI ID validation schema
export const upiIdSchema = z
  .string()
  .min(1, 'UPI ID is required')
  .regex(
    /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+$/,
    'Invalid UPI ID format. Use format: username@bank'
  )
  .refine((upiId) => {
    // Common UPI handles validation
    const validHandles = [
      'paytm', 'phonepe', 'gpay', 'ybl', 'okhdfcbank', 'okicici', 
      'oksbi', 'okaxis', 'upi', 'ibl', 'axl', 'pingpay', 'fbl', 'pnb'
    ];
    const handle = upiId.split('@')[1]?.toLowerCase();
    return validHandles.some(validHandle => handle?.includes(validHandle));
  }, 'Invalid UPI provider. Please use a valid UPI ID');

// Amount validation schema
export const amountSchema = z
  .number()
  .min(1, 'Amount must be at least ₹1')
  .max(50000, 'Amount cannot exceed ₹50,000')
  .multipleOf(0.01, 'Amount can have maximum 2 decimal places');

// Payment request validation schema
export const paymentRequestSchema = z.object({
  upiId: upiIdSchema,
  amount: amountSchema,
  description: z.string().max(100).optional(),
});

// Generate unique transaction ID
export function generateTransactionId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return `TXN${timestamp}${random}`.toUpperCase();
}

// Format currency for Indian Rupee
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(amount);
}

// Get status display information
export function getStatusInfo(status: string) {
  const statusMap = {
    initiated: { color: 'bg-blue-500', text: 'Initiated', description: 'Payment request created' },
    pending: { color: 'bg-yellow-500', text: 'Pending', description: 'Waiting for user confirmation' },
    success: { color: 'bg-green-500', text: 'Success', description: 'Payment completed successfully' },
    failed: { color: 'bg-red-500', text: 'Failed', description: 'Payment was declined or failed' },
    expired: { color: 'bg-gray-500', text: 'Expired', description: 'Payment request has expired' },
  };
  
  return statusMap[status as keyof typeof statusMap] || statusMap.failed;
}

// Validate UPI ID format (client-side helper)
export function isValidUpiId(upiId: string): boolean {
  try {
    upiIdSchema.parse(upiId);
    return true;
  } catch {
    return false;
  }
}

// Simulate payment status transition
export function getNextStatus(currentStatus: string): string {
  const transitions = {
    initiated: 'pending',
    pending: Math.random() > 0.3 ? 'success' : 'failed', // 70% success rate
    success: 'success',
    failed: 'failed',
    expired: 'expired',
  };
  
  return transitions[currentStatus as keyof typeof transitions] || 'failed';
}