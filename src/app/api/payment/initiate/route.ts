import { NextRequest, NextResponse } from 'next/server';
import { paymentRequestSchema, generateTransactionId, getNextStatus } from '@/lib/payment-utils';
import { transactionStore } from '@/lib/transaction-store';
import { PaymentStatus } from '@/types/payment';

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

    // Create transaction record
    const transaction = transactionStore.createTransaction(
      transactionId,
      upiId.toLowerCase().trim(),
      amount,
      description
    );

    // Simulate UPI collect request processing
    // In a real implementation, this would integrate with UPI APIs
    setTimeout(() => {
      // Simulate status progression from 'initiated' -> 'pending'
      transactionStore.updateTransactionStatus(transactionId, 'pending');
      
      // Simulate final status after random delay (3-10 seconds)
      setTimeout(() => {
        const finalStatus = getNextStatus('pending') as 'success' | 'failed';
        transactionStore.updateTransactionStatus(transactionId, finalStatus);
      }, Math.random() * 7000 + 3000); // 3-10 second delay
      
    }, 1000); // Initial 1 second delay to move to pending

    return NextResponse.json({
      success: true,
      message: 'Payment request initiated successfully',
      transactionId: transaction.id,
      data: transaction,
    });

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

export async function PUT() {
  return NextResponse.json(
    { success: false, message: 'Method not allowed' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { success: false, message: 'Method not allowed' },
    { status: 405 }
  );
}