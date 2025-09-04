import { NextRequest, NextResponse } from 'next/server';
import { transactionStore } from '@/lib/transaction-store';
import { checkPhonePePaymentStatus, mapPhonePeStatus } from '@/lib/phonepe-api';

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ transactionId: string }> }
) {
  try {
    const { transactionId } = await context.params;

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

    try {
      // Check status with PhonePe API
      const phonePeStatus = await checkPhonePePaymentStatus(transactionId);

      if (phonePeStatus.success && phonePeStatus.data) {
        // Map PhonePe status to our internal status
        const internalStatus = mapPhonePeStatus(phonePeStatus.data.state);
        
        // Update transaction status if it has changed
        if (transaction.status !== internalStatus) {
          transactionStore.updateTransactionStatus(transactionId, internalStatus);
          transaction.status = internalStatus;
        }

        return NextResponse.json({
          success: true,
          transaction: {
            ...transaction,
            phonePeData: phonePeStatus.data,
          },
          message: 'Transaction status retrieved from PhonePe successfully',
        });
      } else {
        // PhonePe API returned error or no data
        console.warn('PhonePe status check failed:', phonePeStatus.message);
        
        // Fallback to local status with expiration check
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
          message: 'Transaction status retrieved locally (PhonePe API unavailable)',
          warning: phonePeStatus.message,
        });
      }

    } catch (phonePeError: any) {
      console.error('PhonePe status check error:', phonePeError);
      
      // Fallback to local status checking
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
        message: 'Transaction status retrieved locally (PhonePe API error)',
        warning: phonePeError.message,
      });
    }

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