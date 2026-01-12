# Payment Gateway Integration Guide

MClinic supports **3 payment gateways** out of the box:
- ✅ **M-Pesa** - Mobile money payments (Kenya)
- ✅ **PayPal** - Global payments
- ✅ **Stripe** - Credit/Debit cards (Visa, Mastercard, etc.)

All payment gateways are configured through a **unified admin interface** with dynamic settings.

---

## Quick Setup

### 1. Seed Payment Settings
Run this command to create all payment gateway settings in your database:

```bash
curl -X POST http://localhost:3001/seeding/settings
```

### 2. Access Payment Settings
Navigate to: **Dashboard > Finance & Billing > Payment Gateways**

Or go directly to: `http://localhost:3000/dashboard/admin/settings/payments`

---

## M-Pesa Integration

### Prerequisites
- Safaricom Daraja API account ([Get Started](https://developer.safaricom.co.ke/))
- Consumer Key & Consumer Secret
- Shortcode (Business or Till Number)
- Lipa Na M-Pesa Online Passkey
- Public callback URL

### Setup Steps
1. Click on **"M-Pesa"** card in Payment Settings
2. Toggle **Enable** switch
3. Click **"Configure M-Pesa Settings"**
4. Choose **Sandbox** or **Production** environment
5. Enter credentials for the selected environment
6. Save settings

### Testing
1. Go to the **"General & Test"** tab
2. Enter a Kenyan phone number (254XXXXXXXXX)
3. Click **"Trigger Test STK Push"**
4. Check your phone for the M-Pesa prompt

---

## PayPal Integration

### Prerequisites
- PayPal Business account ([Sign Up](https://www.paypal.com/business))
- PayPal Developer account ([Get API Credentials](https://developer.paypal.com/))
- Client ID & Client Secret (Sandbox and/or Live)

### Setup Steps
1. Click on **"PayPal"** card in Payment Settings
2. Toggle **Enable** switch
3. Select **Sandbox** or **Live** environment
4. Enter your PayPal credentials:
   - **Sandbox**: Use your sandbox Client ID and Secret for testing
   - **Live**: Use your live Client ID and Secret for production
5. Click **"Save All Settings"**

### Get PayPal Credentials
1. Go to [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/)
2. Navigate to **Apps & Credentials**
3. Create a new app or use an existing one
4. Copy the **Client ID** and **Secret**

---

## Stripe Integration (Visa, Mastercard, etc.)

### Prerequisites
- Stripe account ([Sign Up](https://stripe.com))
- Publishable Key & Secret Key (Test and/or Live)
- Webhook Secret (optional, for advanced features)

### Setup Steps
1. Click on **"Stripe"** card in Payment Settings
2. Toggle **Enable** switch
3. Select **Test Mode** or **Live Mode** environment
4. Enter your Stripe credentials:
   - **Publishable Key**: `pk_test_...` or `pk_live_...`
   - **Secret Key**: `sk_test_...` or `sk_live_...`
   - **Webhook Secret** (optional): `whsec_...`
5. Click **"Save All Settings"**

### Get Stripe Credentials
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Navigate to **Developers > API Keys**
3. Copy your **Publishable key** and **Secret key**
4. For webhooks (optional):
   - Go to **Developers > Webhooks**
   - Add endpoint: `https://yourdomain.com/stripe/webhook`
   - Copy the **Signing secret**

---

## Payment Method Priority

When multiple payment gateways are enabled, the system will show them in this order during checkout:

1. **M-Pesa** (if in Kenya and enabled)
2. **Stripe** (cards - if enabled)
3. **PayPal** (if enabled)

Users can choose their preferred payment method at checkout.

---

## Backend Implementation

### Dependencies
Install required packages:

```bash
npm install stripe @paypal/checkout-server-sdk
```

### Environment Variables (Fallback)
While the system uses database settings, you can also set environment variables as fallback:

```env
# M-Pesa
MPESA_ENV=sandbox
MPESA_SANDBOX_CONSUMER_KEY=your_key
MPESA_SANDBOX_CONSUMER_SECRET=your_secret
MPESA_SANDBOX_SHORTCODE=174379
MPESA_SANDBOX_PASSKEY=your_passkey
MPESA_SANDBOX_CALLBACK_URL=https://yourdomain.com/mpesa/callback

# PayPal
PAYPAL_ENV=sandbox
PAYPAL_SANDBOX_CLIENT_ID=your_client_id
PAYPAL_SANDBOX_CLIENT_SECRET=your_client_secret

# Stripe
STRIPE_ENV=test
STRIPE_TEST_PUBLISHABLE_KEY=pk_test_...
STRIPE_TEST_SECRET_KEY=sk_test_...
```

---

## Security Best Practices

1. **Never commit API keys** to version control
2. **Use environment-specific credentials** (Sandbox for testing, Live for production)
3. **Enable webhooks** for real-time payment status updates
4. **Validate all transactions** on the backend
5. **Use HTTPS** for all payment-related endpoints
6. **Store credentials encrypted** in the database (currently using bcrypt for sensitive fields)

---

## Switching Between Environments

### Sandbox/Test → Production/Live

1. Go to **Payment Settings**
2. Click on the payment gateway you want to update
3. Toggle the environment switch (e.g., **Sandbox → Live**)
4. Enter your production credentials
5. Save settings

**The change takes effect immediately** - no need to restart the server!

---

## Troubleshooting

### M-Pesa
- **STK Push not received**: Check if callback URL is publicly accessible
- **Invalid credentials**: Verify Consumer Key, Secret, and Passkey
- **Transaction timeout**: Check Safaricom API status

### PayPal
- **Payment fails**: Ensure Client ID and Secret are correct
- **Sandbox not working**: Verify you're using sandbox credentials with sandbox environment

### Stripe
- **Card declined**: Use Stripe test cards in test mode ([Test Cards](https://stripe.com/docs/testing))
- **Webhook errors**: Check webhook secret and endpoint URL

---

## Adding More Payment Gateways

To add a new payment gateway:

1. **Add settings to seeding**:
   ```typescript
   // apps/api/src/seeding/seeding.service.ts
   { key: 'PAYMENT_NEWGATEWAY_ENABLED', value: 'false', ... },
   { key: 'NEWGATEWAY_API_KEY', value: '', ... },
   ```

2. **Create service**:
   ```typescript
   // apps/api/src/newgateway/newgateway.service.ts
   async processPayment() { ... }
   ```

3. **Add to payment settings page**:
   ```tsx
   // apps/web/src/app/dashboard/admin/settings/payments/page.tsx
   // Add new card in the grid
   ```

4. **Integrate in checkout flow**:
   ```typescript
   // apps/api/src/financial/financial.service.ts
   if (isEnabled('newgateway')) { ... }
   ```

---

## Support

For issues or questions:
- Email: info@mclinic.co.ke
- Phone: 0700448448

---

**Last Updated**: January 2026
