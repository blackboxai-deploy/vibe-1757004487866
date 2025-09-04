# PhonePe UPI Payment Integration

This application now supports **LIVE PhonePe API integration** alongside the simulation mode, allowing you to process real UPI payments through PhonePe's secure gateway.

## 🚀 Features

### Live PhonePe Integration
- ✅ **Real UPI Collect Requests** via PhonePe API
- ✅ **Real-time Payment Status** tracking
- ✅ **Webhook Integration** for instant updates
- ✅ **Secure Authentication** with merchant credentials
- ✅ **Production & Sandbox** environment support

### Simulation Mode
- ✅ **Test Payment Flow** without real money
- ✅ **Status Progression Simulation**
- ✅ **Development & Demo** purposes

## 🔧 Setup Instructions

### 1. Get PhonePe Merchant Credentials

To use live PhonePe integration, you need:

1. **Register as PhonePe Merchant:**
   - Visit [PhonePe Business](https://business.phonepe.com/)
   - Complete merchant onboarding
   - Get approved for UPI payment gateway

2. **Get API Credentials:**
   - Login to PhonePe Merchant Dashboard
   - Navigate to API section
   - Copy your credentials:
     - `Merchant ID`
     - `Salt Key` 
     - `Salt Index` (usually 1)

### 2. Environment Configuration

1. **Copy the template:**
   ```bash
   cp .env.local.template .env.local
   ```

2. **Add your PhonePe credentials:**
   ```bash
   # .env.local
   PHONEPE_MERCHANT_ID=your_actual_merchant_id
   PHONEPE_SALT_KEY=your_actual_salt_key
   PHONEPE_SALT_INDEX=1
   PHONEPE_PRODUCTION=false  # Set to true for production
   NEXT_PUBLIC_BASE_URL=https://yourdomain.com  # Your domain
   ```

3. **Restart the application:**
   ```bash
   npm run build
   npm start
   ```

## 📱 How to Use

### Testing Live PhonePe Integration

1. **Enable PhonePe Mode:**
   - Toggle the "PhonePe Live Integration" switch on the payment form
   - The form will show "🔴 LIVE PhonePe" indicator

2. **Make a Test Payment:**
   - Enter a valid UPI ID (e.g., `yourphone@ybl`)
   - Enter amount (₹1 - ₹50,000)
   - Click "🔴 Pay with PhonePe Live"

3. **Track Payment Status:**
   - Real-time updates from PhonePe API
   - Webhook notifications for instant status changes
   - PhonePe transaction ID and response details

### Using Simulation Mode

1. **Disable PhonePe Mode:**
   - Turn off the "PhonePe Live Integration" switch
   - The form will show "🧪 Test Payment" mode

2. **Test Payment Flow:**
   - Same UPI form interface
   - Simulated payment progression
   - No real money involved

## 🔗 API Endpoints

### PhonePe Live Integration
- `POST /api/phonepe/initiate` - Initiate real PhonePe payment
- `GET /api/phonepe/status/[id]` - Check live payment status
- `POST /api/phonepe/callback` - Webhook for real-time updates

### Simulation Mode
- `POST /api/payment/initiate` - Initiate simulated payment
- `GET /api/payment/status/[id]` - Check simulated status

## 🔒 Security Features

- **Secure Checksums:** PhonePe API authentication with SHA256
- **Webhook Verification:** Signature validation for callbacks
- **Environment Protection:** Credentials stored securely
- **Input Validation:** Comprehensive UPI ID and amount validation

## 🚨 Important Notes

### For Live Testing:
1. **Use Real UPI IDs** - Test with actual UPI addresses
2. **Small Amounts** - Start with ₹1-10 for testing
3. **Sandbox First** - Test in PhonePe sandbox before production
4. **Monitor Webhooks** - Check `/api/phonepe/callback` for updates

### For Production:
1. **Set PHONEPE_PRODUCTION=true**
2. **Use Production Credentials**
3. **Configure Proper Domain** in NEXT_PUBLIC_BASE_URL
4. **Setup SSL/HTTPS** for webhook security

## 📊 Testing Results

The application has been tested with:
- ✅ **API Integration** - Proper error handling for missing credentials
- ✅ **Validation** - UPI ID and amount validation working
- ✅ **Mode Switching** - Seamless toggle between live and simulation
- ✅ **Status Tracking** - Real-time polling and webhook support
- ✅ **Error Handling** - Graceful fallback when PhonePe API unavailable

## 🆘 Troubleshooting

### Common Issues:

1. **"Credentials Missing" Error:**
   - Check `.env.local` file exists
   - Verify all PhonePe credentials are set
   - Restart the application

2. **PhonePe API Errors:**
   - Verify merchant ID is correct
   - Check salt key matches dashboard
   - Ensure UPI ID format is valid

3. **Webhook Not Working:**
   - Check NEXT_PUBLIC_BASE_URL is accessible
   - Verify webhook URL in PhonePe dashboard
   - Ensure SSL certificate is valid (production)

## 📧 Support

For PhonePe API issues:
- Contact PhonePe Merchant Support
- Check PhonePe Developer Documentation
- Review API response codes and messages

The application provides detailed error messages and fallback mechanisms to ensure a smooth payment experience.