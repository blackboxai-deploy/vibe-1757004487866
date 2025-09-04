import { notFound } from 'next/navigation';
import PhonePePaymentStatus from '@/components/PhonePePaymentStatus';
import { transactionStore } from '@/lib/transaction-store';

interface PhonePePaymentPageProps {
  params: Promise<{
    transactionId: string;
  }>;
}

export default async function PhonePePaymentPage({ params }: PhonePePaymentPageProps) {
  const { transactionId } = await params;
  
  // Validate transaction ID format
  if (!transactionId || typeof transactionId !== 'string') {
    notFound();
  }

  // Try to get initial transaction data (server-side)
  const initialTransaction = transactionStore.getTransaction(transactionId);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">Pe</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">
                PhonePe Payment Status
              </h1>
            </div>
            <p className="text-gray-600">
              Live payment tracking via PhonePe API
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <PhonePePaymentStatus 
          transactionId={transactionId}
          initialTransaction={initialTransaction || undefined}
        />
      </div>

      {/* Footer */}
      <footer className="bg-gray-50 border-t mt-16">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="text-center text-gray-600">
            <p className="text-sm">
              Powered by PhonePe API • Real-time payment processing
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