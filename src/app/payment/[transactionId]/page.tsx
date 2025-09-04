import { notFound } from 'next/navigation';
import PaymentStatus from '@/components/PaymentStatus';
import { transactionStore } from '@/lib/transaction-store';

interface PaymentPageProps {
  params: Promise<{
    transactionId: string;
  }>;
}

export default async function PaymentPage({ params }: PaymentPageProps) {
  const { transactionId } = await params;
  
  // Validate transaction ID format
  if (!transactionId || typeof transactionId !== 'string') {
    notFound();
  }

  // Try to get initial transaction data (server-side)
  const initialTransaction = transactionStore.getTransaction(transactionId);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Payment Status
            </h1>
            <p className="text-gray-600">
              Track your UPI payment progress
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <PaymentStatus 
          transactionId={transactionId}
          initialTransaction={initialTransaction || undefined}
        />
      </div>

      {/* Footer */}
      <footer className="bg-gray-50 border-t mt-16">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="text-center text-gray-600">
            <p className="text-sm">
              Need help? Contact our support team for assistance.
            </p>
            <p className="text-xs mt-2">
              Transaction ID: {transactionId}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}