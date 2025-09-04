import PaymentForm from '@/components/PaymentForm';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              UPI Payment Portal
            </h1>
            <p className="text-gray-600">
              Secure and instant payments using UPI
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Payment Form */}
          <div className="order-2 lg:order-1">
            <PaymentForm />
          </div>

          {/* Features and Information */}
          <div className="order-1 lg:order-2 space-y-8">
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Why Choose UPI?
              </h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-green-600 text-lg">⚡</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Instant Transfer</h3>
                    <p className="text-sm text-gray-600">Money transfers happen in real-time, 24x7</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 text-lg">🔒</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Secure & Safe</h3>
                    <p className="text-sm text-gray-600">Bank-grade security with multi-factor authentication</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-purple-600 text-lg">📱</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Easy to Use</h3>
                    <p className="text-sm text-gray-600">Just enter your UPI ID and confirm payment</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-yellow-600 text-lg">💰</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">No Extra Charges</h3>
                    <p className="text-sm text-gray-600">Free transactions with no hidden fees</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Supported UPI Apps
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">PT</span>
                  </div>
                  <span className="text-sm font-medium">Paytm</span>
                </div>
                
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">PE</span>
                  </div>
                  <span className="text-sm font-medium">PhonePe</span>
                </div>

                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">GP</span>
                  </div>
                  <span className="text-sm font-medium">Google Pay</span>
                </div>

                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">BK</span>
                  </div>
                  <span className="text-sm font-medium">Bank Apps</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-2">Demo Payment System</h2>
              <p className="text-blue-100 text-sm">
                This is a demonstration of UPI payment integration. 
                No real money will be processed during transactions.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-50 border-t mt-16">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center text-gray-600">
            <p className="text-sm">
              © 2024 UPI Payment Portal. This is a demo application.
            </p>
            <p className="text-xs mt-2">
              Built with Next.js, TypeScript, and Tailwind CSS
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}