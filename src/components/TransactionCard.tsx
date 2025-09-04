'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PaymentTransaction } from '@/types/payment';
import { formatCurrency, getStatusInfo } from '@/lib/payment-utils';

interface TransactionCardProps {
  transaction: PaymentTransaction;
  onClick?: () => void;
}

export default function TransactionCard({ transaction, onClick }: TransactionCardProps) {
  const statusInfo = getStatusInfo(transaction.status);

  return (
    <Card 
      className={`cursor-pointer transition-all hover:shadow-md ${
        onClick ? 'hover:scale-[1.02]' : ''
      }`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 truncate">
              {transaction.description || 'Payment Transaction'}
            </h3>
            <p className="text-sm text-gray-600 truncate">
              To: {transaction.upiId}
            </p>
          </div>
          <Badge className={`${statusInfo.color} text-white ml-2`}>
            {statusInfo.text}
          </Badge>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-lg font-bold text-gray-900">
            {formatCurrency(transaction.amount)}
          </span>
          <span className="text-xs text-gray-500">
            {new Date(transaction.createdAt).toLocaleString('en-IN', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>
        
        <div className="mt-2 text-xs text-gray-500">
          ID: {transaction.id}
        </div>
      </CardContent>
    </Card>
  );
}