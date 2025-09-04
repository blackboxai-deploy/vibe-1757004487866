'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { PaymentTransaction } from '@/types/payment';
import { getStatusInfo, formatCurrency } from '@/lib/payment-utils';

interface PhonePePaymentStatusProps {
  transactionId: string;
  initialTransaction?: PaymentTransaction;
}

interface PhonePeStatusResponse {
  success: boolean;
  transaction: PaymentTransaction;
  message: string;
  phonePeData?: {
    merchantTransactionId: string;
    transactionId: string;
    amount: number;
    state: string;
    responseCode: string;
    paymentInstrument?: {
      type: string;
      upiTransactionId?: string;
    };
  };
  warning?: string;
}

export default function PhonePePaymentStatus({ transactionId, initialTransaction }: PhonePePaymentStatusProps) {
  const router = useRouter();
  const [transaction, setTransaction] = useState<PaymentTransaction | null>(initialTransaction || null);
  const [phonePeData, setPhonePeData] = useState<any>(null);
  const [warning, setWarning] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [pollingCount, setPollingCount] = useState(0);

  // Poll for payment status updates
  useEffect(() => {
    if (!transactionId) return;

    const pollStatus = async () => {
      if (pollingCount >= 60) { // Stop polling after 60 attempts (5 minutes)
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(`/api/phonepe/status/${transactionId}`);
        const result: PhonePeStatusResponse = await response.json();

        if (result.success && result.transaction) {
          setTransaction(result.transaction);
          setPhonePeData(result.phonePeData || null);
          setWarning(result.warning || '');
          
          // Stop polling if payment is completed or failed
          if (result.transaction.status === 'success' || 
              result.transaction.status === 'failed' || 
              result.transaction.status === 'expired') {
            return;
          }
        } else {
          setError(result.message || 'Failed to fetch status');
        }
      } catch (err) {
        console.error('Status polling error:', err);
        setError('Network error while checking status');
      } finally {
        setIsLoading(false);
        setPollingCount(prev => prev + 1);
      }
    };

    // Initial status check
    if (!initialTransaction) {
      pollStatus();
    }

    // Set up polling interval
    const interval = setInterval(pollStatus, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, [transactionId, initialTransaction, pollingCount]);

  const getProgressValue = () => {
    if (!transaction) return 0;
    switch (transaction.status) {
      case 'initiated': return 25;
      case 'pending': return 50;
      case 'success': return 100;
      case 'failed': return 100;
      case 'expired': return 100;
      default: return 0;
    }
  };

  const statusInfo = transaction ? getStatusInfo(transaction.status) : null;

  if (error && !transaction) {
    return (
      <div className="max-w-2xl mx-auto">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="mt-4 text-center">
          <Button onClick={() => router.push('/')}>
            Back to Payment
          </Button>
        </div>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading transaction details...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Status Card */}
      <Card>
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">Pe</span>
            </div>
            <Badge variant="outline" className="border-purple-200 text-purple-700">
              LIVE PhonePe
            </Badge>
          </div>
          <CardTitle className="text-2xl font-bold">
            Payment {statusInfo?.text}
          </CardTitle>
          <CardDescription>{statusInfo?.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Progress</span>
              <span>{getProgressValue()}%</span>
            </div>
            <Progress value={getProgressValue()} className="h-2" />
          </div>

          {/* Status Badge */}
          <div className="text-center">
            <Badge 
              className={`${statusInfo?.color} text-white text-lg px-4 py-2`}
            >
              {statusInfo?.text}
            </Badge>
          </div>

          {/* Amount */}
          <div className="text-center">
            <p className="text-3xl font-bold text-gray-900">
              {formatCurrency(transaction.amount)}
            </p>
            <p className="text-gray-600">Payment Amount</p>
          </div>

          {/* Warning Alert */}
          {warning && (
            <Alert className="border-amber-200 bg-amber-50">
              <AlertDescription className="text-amber-800">
                <strong>Note:</strong> {warning}
              </AlertDescription>
            </Alert>
          )}

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Loading Indicator */}
          {isLoading && transaction.status === 'pending' && (
            <div className="text-center text-sm text-gray-600">
              <div className="inline-flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                <span>Checking with PhonePe...</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transaction Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Transaction Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Transaction ID</p>
              <p className="font-mono text-xs bg-gray-100 p-2 rounded break-all">
                {transaction.id}
              </p>
            </div>
            <div>
              <p className="text-gray-600">UPI ID</p>
              <p className="font-medium">{transaction.upiId}</p>
            </div>
            <div>
              <p className="text-gray-600">Amount</p>
              <p className="font-medium">{formatCurrency(transaction.amount)}</p>
            </div>
            <div>
              <p className="text-gray-600">Created</p>
              <p className="font-medium">
                {new Date(transaction.createdAt).toLocaleString()}
              </p>
            </div>
          </div>

          {transaction.description && (
            <>
              <Separator />
              <div>
                <p className="text-gray-600 text-sm">Description</p>
                <p className="font-medium">{transaction.description}</p>
              </div>
            </>
          )}

          {/* PhonePe API Data */}
          {phonePeData && (
            <>
              <Separator />
              <div>
                <p className="text-gray-600 text-sm mb-2">PhonePe API Response</p>
                <div className="bg-purple-50 p-3 rounded-lg text-xs space-y-1">
                  <p><strong>PhonePe Transaction ID:</strong> {phonePeData.transactionId}</p>
                  <p><strong>State:</strong> {phonePeData.state}</p>
                  <p><strong>Response Code:</strong> {phonePeData.responseCode}</p>
                  {phonePeData.paymentInstrument?.upiTransactionId && (
                    <p><strong>UPI Transaction ID:</strong> {phonePeData.paymentInstrument.upiTransactionId}</p>
                  )}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="text-center space-x-4">
        <Button 
          variant="outline" 
          onClick={() => router.push('/')}
        >
          New Payment
        </Button>
        {transaction.status === 'success' && (
          <Button className="bg-green-600 hover:bg-green-700">
            Download Receipt
          </Button>
        )}
      </div>
    </div>
  );
}