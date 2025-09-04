import { NextRequest, NextResponse } from 'next/server';
import { paymentRequestSchema, generateTransactionId } from '@/lib/payment-utils';
import { transactionStore } from '@/lib/transaction-store';
import { initiatePhonePePayment } from '@/lib/phonepe-api';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validationResult = paymentRequestSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid request data',
          errors: validationResult.error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
        },
        { status: 400 }
      );
    }

    const { upiId, amount, description } = validationResult.data;

    // Generate unique transaction ID
    const transactionId = generateTransactionId();

    try {
      // Create transaction record first
      const transaction = transactionStore.createTransaction(
        transactionId,
        upiId.toLowerCase().trim(),
        amount,
        description
      );

      // Initiate payment with PhonePe
      const phonePeResponse = await initiatePhonePePayment({
        merchantTransactionId: transactionId,
        amount: amount,
        merchantUserId: `USER_${Date.now()}`,
        upiId: upiId.toLowerCase().trim(),
        description: description,
      });

      if (phonePeResponse.success) {
        // Update transaction status to pending
        transactionStore.updateTransactionStatus(transactionId, 'pending');

        return NextResponse.json({
          success: true,
          message: 'PhonePe payment request initiated successfully',
          transactionId: transaction.id,
          data: {
            transaction,
            phonepeData: phonePeResponse.data,
          },
        });
      } else {
        // PhonePe API returned error
        transactionStore.updateTransactionStatus(transactionId, 'failed');
        
        return NextResponse.json(
          {
            success: false,
            message: `PhonePe Error: ${phonePeResponse.message}`,
            code: phonePeResponse.code,
          },
          { status: 400 }
        );
      }

    } catch (phonePeError: any) {
      // Handle PhonePe API errors
      console.error('PhonePe API Error:', phonePeError);
      
      // Update transaction status to failed
      if (transactionId) {
        transactionStore.updateTransactionStatus(transactionId, 'failed');
      }

      if (phonePeError.message?.includes('credentials not configured')) {
        return NextResponse.json(
          {
            success: false,
            message: 'PhonePe integration not configured. Please provide merchant credentials.',
            error: 'CREDENTIALS_MISSING',
          },
          { status: 501 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          message: `PhonePe integration error: ${phonePeError.message}`,
          error: 'PHONEPE_API_ERROR',
        },
        { status: 502 }
      );
    }

  } catch (error) {
    console.error('Payment initiation error:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error. Please try again.',
      },
      { status: 500 }
    );
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    { success: false, message: 'Method not allowed' },
    { status: 405 }
  );
}