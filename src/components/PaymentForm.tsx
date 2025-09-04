'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { isValidUpiId, formatCurrency } from '@/lib/payment-utils';

interface PaymentFormProps {
  onPaymentInitiated?: (transactionId: string) => void;
}

export default function PaymentForm({ onPaymentInitiated }: PaymentFormProps) {
  const [upiId, setUpiId] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [upiIdError, setUpiIdError] = useState('');
  const [amountError, setAmountError] = useState('');
  
  const router = useRouter();

  // Validate UPI ID on change
  const handleUpiIdChange = (value: string) => {
    setUpiId(value);
    setUpiIdError('');
    
    if (value && !isValidUpiId(value)) {
      setUpiIdError('Invalid UPI ID format. Use: username@bank (e.g., user@paytm)');
    }
  };

  // Validate amount on change
  const handleAmountChange = (value: string) => {
    setAmount(value);
    setAmountError('');
    
    const numAmount = parseFloat(value);
    if (value && (isNaN(numAmount) || numAmount < 1 || numAmount > 50000)) {
      setAmountError('Amount must be between ₹1 and ₹50,000');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate inputs
      if (!isValidUpiId(upiId)) {
        setUpiIdError('Invalid UPI ID format');
        setLoading(false);
        return;
      }

      const numAmount = parseFloat(amount);
      if (isNaN(numAmount) || numAmount < 1 || numAmount > 50000) {
        setAmountError('Invalid amount');
        setLoading(false);
        return;
      }

      // Call payment initiation API
      const response = await fetch('/api/payment/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          upiId: upiId.toLowerCase().trim(),
          amount: numAmount,
          description: description.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (data.success && data.transactionId) {
        // Redirect to payment status page
        router.push(`/payment/${data.transactionId}`);
        onPaymentInitiated?.(data.transactionId);
      } else {
        setError(data.message || 'Failed to initiate payment');
      }
    } catch (err) {
      console.error('Payment initiation error:', err);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = upiId && amount && !upiIdError && !amountError;

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
          <span className="text-2xl font-bold text-white">₹</span>
        </div>
        <CardTitle className="text-2xl font-bold text-gray-900">UPI Payment</CardTitle>
        <CardDescription className="text-gray-600">
          Enter your UPI ID to make a secure payment
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertDescription className="text-red-700">{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="upiId" className="text-sm font-medium text-gray-700">
              UPI ID *
            </Label>
            <Input
              id="upiId"
              type="text"
              placeholder="yourname@paytm"
              value={upiId}
              onChange={(e) => handleUpiIdChange(e.target.value)}
              className={`${upiIdError ? 'border-red-300 focus:border-red-500' : ''}`}
              disabled={loading}
            />
            {upiIdError && (
              <p className="text-sm text-red-600">{upiIdError}</p>
            )}
            <p className="text-xs text-gray-500">
              Supported: @paytm, @phonepe, @ybl, @okhdfcbank, @okicici, @oksbi
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount" className="text-sm font-medium text-gray-700">
              Amount (₹) *
            </Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="1"
              max="50000"
              placeholder="100.00"
              value={amount}
              onChange={(e) => handleAmountChange(e.target.value)}
              className={`${amountError ? 'border-red-300 focus:border-red-500' : ''}`}
              disabled={loading}
            />
            {amountError && (
              <p className="text-sm text-red-600">{amountError}</p>
            )}
            {amount && !amountError && (
              <p className="text-sm text-green-600">
                Amount: {formatCurrency(parseFloat(amount) || 0)}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium text-gray-700">
              Description (Optional)
            </Label>
            <Input
              id="description"
              type="text"
              placeholder="Payment for goods/services"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={100}
              disabled={loading}
            />
            <p className="text-xs text-gray-500">
              {description.length}/100 characters
            </p>
          </div>
        </CardContent>

        <CardFooter>
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3"
            disabled={!isFormValid || loading}
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Initiating Payment...</span>
              </div>
            ) : (
              `Pay ${amount ? formatCurrency(parseFloat(amount)) : '₹0.00'}`
            )}
          </Button>
        </CardFooter>
      </form>

      <div className="px-6 pb-6">
        <div className="text-xs text-gray-500 text-center space-y-1">
          <p>🔒 Secure payment powered by UPI</p>
          <p>💳 No card details required</p>
        </div>
      </div>
    </Card>
  );
}