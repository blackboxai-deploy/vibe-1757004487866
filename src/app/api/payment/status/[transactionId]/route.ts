import { NextRequest, NextResponse } from 'next/server';
import { transactionStore } from '@/lib/transaction-store';

export async function GET(
  request: NextRequest
) {
  try {
    // Extract transactionId from URL
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const transactionId = pathParts[pathParts.length - 1];

    // Validate transaction ID
    if (!transactionId || typeof transactionId !== 'string') {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid transaction ID',
        },
        { status: 400 }
      );
    }

    // Get transaction from store
    const transaction = transactionStore.getTransaction(transactionId);

    if (!transaction) {
      return NextResponse.json(
        {
          success: false,
          message: 'Transaction not found',
        },
        { status: 404 }
      );
    }

    // Check for expired transactions and update if needed
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    if (
      (transaction.status === 'initiated' || transaction.status === 'pending') &&
      transaction.createdAt < tenMinutesAgo
    ) {
      transactionStore.updateTransactionStatus(transactionId, 'expired');
      transaction.status = 'expired';
    }

    return NextResponse.json({
      success: true,
      transaction,
      message: 'Transaction status retrieved successfully',
    });

  } catch (error) {
    console.error('Status check error:', error);
    
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
export async function POST() {
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