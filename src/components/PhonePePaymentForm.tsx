'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { isValidUpiId, formatCurrency } from '@/lib/payment-utils';

export default function PhonePePaymentForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    upiId: '',
    amount: '',
    description: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [usePhonePe, setUsePhonePe] = useState(true);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate UPI ID
    if (!formData.upiId.trim()) {
      newErrors.upiId = 'UPI ID is required';
    } else if (!isValidUpiId(formData.upiId)) {
      newErrors.upiId = 'Please enter a valid UPI ID (e.g., user@paytm)';
    }

    // Validate amount
    const amount = parseFloat(formData.amount);
    if (!formData.amount.trim()) {
      newErrors.amount = 'Amount is required';
    } else if (isNaN(amount)) {
      newErrors.amount = 'Please enter a valid amount';
    } else if (amount < 1) {
      newErrors.amount = 'Amount must be at least ₹1';
    } else if (amount > 50000) {
      newErrors.amount = 'Amount cannot exceed ₹50,000';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Choose API endpoint based on integration type
      const endpoint = usePhonePe ? '/api/phonepe/initiate' : '/api/payment/initiate';
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          upiId: formData.upiId.trim(),
          amount: parseFloat(formData.amount),
          description: formData.description.trim() || undefined,
        }),
      });

      const result = await response.json();

      if (result.success && result.transactionId) {
        if (usePhonePe) {
          router.push(`/payment/phonepe/${result.transactionId}`);
        } else {
          router.push(`/payment/${result.transactionId}`);
        }
      } else {
        setErrors({ submit: result.message || 'Failed to initiate payment' });
      }
    } catch (error) {
      setErrors({ submit: 'Network error. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold text-white">Pe</span>
          </div>
          {usePhonePe && (
            <Badge variant="default" className="bg-purple-600">
              LIVE PhonePe
            </Badge>
          )}
        </div>
        <CardTitle className="text-2xl font-bold">
          {usePhonePe ? 'PhonePe Live Payment' : 'UPI Payment Simulation'}
        </CardTitle>
        <CardDescription>
          {usePhonePe 
            ? 'Real payments via PhonePe API integration'
            : 'Test UPI payment flow with simulation'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Integration Toggle */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg mb-6">
          <div className="space-y-1">
            <Label htmlFor="integration-mode" className="text-sm font-medium">
              PhonePe Live Integration
            </Label>
            <p className="text-xs text-gray-600">
              {usePhonePe ? 'Real payments (requires API keys)' : 'Simulation mode'}
            </p>
          </div>
          <Switch
            id="integration-mode"
            checked={usePhonePe}
            onCheckedChange={setUsePhonePe}
          />
        </div>

        {/* PhonePe API Status */}
        {usePhonePe && (
          <Alert className="mb-4 border-amber-200 bg-amber-50">
            <AlertDescription className="text-amber-800">
              <strong>Live Mode:</strong> Requires PhonePe merchant credentials in environment variables
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* UPI ID Input */}
          <div className="space-y-2">
            <Label htmlFor="upiId">UPI ID</Label>
            <Input
              id="upiId"
              type="text"
              placeholder="yourname@paytm"
              value={formData.upiId}
              onChange={(e) => handleInputChange('upiId', e.target.value)}
              className={errors.upiId ? 'border-red-500' : ''}
              disabled={isLoading}
            />
            {errors.upiId && (
              <p className="text-sm text-red-500">{errors.upiId}</p>
            )}
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (₹)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="100.00"
              step="0.01"
              min="1"
              max="50000"
              value={formData.amount}
              onChange={(e) => handleInputChange('amount', e.target.value)}
              className={errors.amount ? 'border-red-500' : ''}
              disabled={isLoading}
            />
            {errors.amount && (
              <p className="text-sm text-red-500">{errors.amount}</p>
            )}
            {formData.amount && !errors.amount && (
              <p className="text-sm text-gray-600">
                Amount: {formatCurrency(parseFloat(formData.amount) || 0)}
              </p>
            )}
          </div>

          {/* Description Input */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Input
              id="description"
              type="text"
              placeholder="Payment for goods/services"
              maxLength={100}
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              disabled={isLoading}
            />
          </div>

          {/* Error Alert */}
          {errors.submit && (
            <Alert variant="destructive">
              <AlertDescription>{errors.submit}</AlertDescription>
            </Alert>
          )}

          {/* Submit Button */}
          <Button 
            type="submit" 
            className={`w-full ${usePhonePe ? 'bg-purple-600 hover:bg-purple-700' : 'bg-blue-600 hover:bg-blue-700'}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <span className="mr-2">⏳</span>
                Processing...
              </span>
            ) : (
              <>
                {usePhonePe ? '🔴 Pay with PhonePe Live' : '🧪 Test Payment'}
              </>
            )}
          </Button>
        </form>

        {/* Integration Info */}
        <div className="mt-6 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Integration Status:</strong>
          </p>
          <ul className="text-xs text-blue-700 mt-1 space-y-1">
            <li>• {usePhonePe ? 'PhonePe Live API' : 'Simulation Mode'}</li>
            <li>• UPI Collect Request</li>
            <li>• Real-time Status Updates</li>
            <li>• Webhook Integration {usePhonePe ? '✅' : '⏸️'}</li>
          </ul>
        </div>

        {/* Environment Setup Guide */}
        {usePhonePe && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-700 font-medium mb-2">Required Environment Variables:</p>
            <div className="text-xs text-gray-600 space-y-1 font-mono">
              <p>PHONEPE_MERCHANT_ID=your_merchant_id</p>
              <p>PHONEPE_SALT_KEY=your_salt_key</p>
              <p>PHONEPE_SALT_INDEX=1</p>
              <p>PHONEPE_PRODUCTION=false</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}