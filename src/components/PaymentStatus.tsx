'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { PaymentTransaction } from '@/types/payment';
import { formatCurrency, getStatusInfo } from '@/lib/payment-utils';

interface PaymentStatusProps {
  transactionId: string;
  initialTransaction?: PaymentTransaction;
}

export default function PaymentStatus({ transactionId, initialTransaction }: PaymentStatusProps) {
  const [transaction, setTransaction] = useState<PaymentTransaction | null>(initialTransaction || null);
  const [loading, setLoading] = useState(!initialTransaction);
  const [error, setError] = useState('');
  const [polling, setPolling] = useState(true);
  
  const router = useRouter();

  // Fetch transaction status
  const fetchTransactionStatus = async () => {
    try {
      const response = await fetch(`/api/payment/status/${transactionId}`);
      const data = await response.json();

      if (data.success && data.transaction) {
        setTransaction(data.transaction);
        setError('');
        
        // Stop polling if payment is completed or failed
        if (['success', 'failed', 'expired'].includes(data.transaction.status)) {
          setPolling(false);
        }
      } else {
        setError(data.message || 'Transaction not found');
        setPolling(false);
      }
    } catch (err) {
      console.error('Status fetch error:', err);
      setError('Failed to fetch payment status');
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch and polling setup
  useEffect(() => {
    if (!initialTransaction) {
      fetchTransactionStatus();
    }

    // Set up polling for status updates
    let interval: ReturnType<typeof setInterval>;
    
    if (polling && transaction?.status && ['initiated', 'pending'].includes(transaction.status)) {
      interval = setInterval(() => {
        fetchTransactionStatus();
      }, 3000); // Poll every 3 seconds
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [transactionId, polling, transaction?.status]);

  const handleNewPayment = () => {
    router.push('/');
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      initiated: '🔄',
      pending: '⏳',
      success: '✅',
      failed: '❌',
      expired: '⏰',
    };
    return icons[status as keyof typeof icons] || '❓';
  };

  const getStatusAnimation = (status: string) => {
    if (status === 'pending' || status === 'initiated') {
      return 'animate-pulse';
    }
    return '';
  };

  if (loading) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="flex items-center justify-center py-8">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="text-gray-600">Loading payment status...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !transaction) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="flex flex-col items-center py-8 space-y-4">
          <div className="text-6xl">❌</div>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900">Transaction Not Found</h3>
            <p className="text-gray-600 mt-2">{error}</p>
          </div>
          <Button onClick={handleNewPayment} className="bg-blue-600 hover:bg-blue-700">
            Start New Payment
          </Button>
        </CardContent>
      </Card>
    );
  }

  const statusInfo = getStatusInfo(transaction.status);

  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      {/* Status Card */}
      <Card>
        <CardHeader className="text-center">
          <div className={`text-6xl mb-4 ${getStatusAnimation(transaction.status)}`}>
            {getStatusIcon(transaction.status)}
          </div>
          <CardTitle className="text-xl font-bold text-gray-900">
            Payment {statusInfo.text}
          </CardTitle>
          <p className="text-gray-600">{statusInfo.description}</p>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex justify-center">
            <Badge 
              className={`${statusInfo.color} text-white px-4 py-2 text-sm font-medium`}
            >
              {statusInfo.text.toUpperCase()}
            </Badge>
          </div>

          <Separator />

          {/* Transaction Details */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Amount</span>
              <span className="font-semibold text-lg text-gray-900">
                {formatCurrency(transaction.amount)}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-600">To UPI ID</span>
              <span className="font-medium text-gray-900 break-all">
                {transaction.upiId}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-600">Transaction ID</span>
              <span className="font-mono text-sm text-gray-700 break-all">
                {transaction.id}
              </span>
            </div>

            {transaction.description && (
              <div className="flex justify-between items-start">
                <span className="text-gray-600">Description</span>
                <span className="font-medium text-gray-900 text-right max-w-[200px]">
                  {transaction.description}
                </span>
              </div>
            )}

            <div className="flex justify-between items-center">
              <span className="text-gray-600">Merchant</span>
              <span className="font-medium text-gray-900">
                {transaction.merchantName}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-600">Created At</span>
              <span className="text-sm text-gray-700">
                {new Date(transaction.createdAt).toLocaleString('en-IN', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>

            {transaction.updatedAt !== transaction.createdAt && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Updated At</span>
                <span className="text-sm text-gray-700">
                  {new Date(transaction.updatedAt).toLocaleString('en-IN', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            )}
          </div>

          <Separator />

          {/* Status-specific messages and actions */}
          {transaction.status === 'pending' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <span className="animate-pulse">🔄</span> Please check your UPI app and approve the payment request.
              </p>
            </div>
          )}

          {transaction.status === 'success' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-800">
                ✅ Payment completed successfully! Thank you for your payment.
              </p>
            </div>
          )}

          {transaction.status === 'failed' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">
                ❌ Payment failed. Please try again or contact support if the problem persists.
              </p>
            </div>
          )}

          {transaction.status === 'expired' && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-sm text-gray-800">
                ⏰ Payment request expired. Please initiate a new payment.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col space-y-2">
        {['success', 'failed', 'expired'].includes(transaction.status) && (
          <Button 
            onClick={handleNewPayment}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            Make Another Payment
          </Button>
        )}
        
        {['initiated', 'pending'].includes(transaction.status) && (
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">
              Auto-refreshing every 3 seconds...
            </p>
            <Button 
              onClick={fetchTransactionStatus}
              variant="outline"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Refreshing...' : 'Refresh Status'}
            </Button>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="text-center text-xs text-gray-500 space-y-1">
        <p>🔒 This is a demo payment system</p>
        <p>💡 No real money is processed</p>
      </div>
    </div>
  );
}