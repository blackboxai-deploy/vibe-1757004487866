import { NextRequest, NextResponse } from 'next/server';
import { transactionStore } from '@/lib/transaction-store';
import { verifyPhonePeWebhookSignature, mapPhonePeStatus } from '@/lib/phonepe-api';

// PhonePe webhook callback handler
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    
    // Get the X-VERIFY header for signature verification
    const signature = request.headers.get('X-VERIFY');
    
    if (!signature) {
      console.error('Missing X-VERIFY header in PhonePe callback');
      return NextResponse.json(
        { success: false, message: 'Missing signature' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    if (!verifyPhonePeWebhookSignature(body, signature)) {
      console.error('Invalid PhonePe webhook signature');
      return NextResponse.json(
        { success: false, message: 'Invalid signature' },
        { status: 401 }
      );
    }

    // Parse the webhook payload
    let webhookData;
    try {
      const parsedBody = JSON.parse(body);
      
      // PhonePe sends base64 encoded response
      if (parsedBody.response) {
        const decodedResponse = Buffer.from(parsedBody.response, 'base64').toString('utf-8');
        webhookData = JSON.parse(decodedResponse);
      } else {
        webhookData = parsedBody;
      }
    } catch (parseError) {
      console.error('Failed to parse PhonePe webhook payload:', parseError);
      return NextResponse.json(
        { success: false, message: 'Invalid payload format' },
        { status: 400 }
      );
    }

    // Extract transaction information
    const { merchantTransactionId, transactionId, amount, state, responseCode } = webhookData;

    if (!merchantTransactionId) {
      console.error('Missing merchantTransactionId in webhook');
      return NextResponse.json(
        { success: false, message: 'Missing transaction ID' },
        { status: 400 }
      );
    }

    // Get transaction from store
    const transaction = transactionStore.getTransaction(merchantTransactionId);
    
    if (!transaction) {
      console.error(`Transaction not found: ${merchantTransactionId}`);
      return NextResponse.json(
        { success: false, message: 'Transaction not found' },
        { status: 404 }
      );
    }

    // Map PhonePe status to internal status
    const internalStatus = mapPhonePeStatus(state);
    
    // Update transaction status
    transactionStore.updateTransactionStatus(merchantTransactionId, internalStatus);

    console.log(`PhonePe webhook: Transaction ${merchantTransactionId} updated to ${internalStatus}`, {
      transactionId,
      amount,
      state,
      responseCode,
    });

    // Return success response to PhonePe
    return NextResponse.json({
      success: true,
      message: 'Webhook processed successfully',
    });

  } catch (error) {
    console.error('PhonePe webhook processing error:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'Webhook processing failed',
      },
      { status: 500 }
    );
  }
}

// Handle webhook verification (GET request)
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'PhonePe webhook endpoint is active',
    timestamp: new Date().toISOString(),
  });
}