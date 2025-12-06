# Razorpay Integration Setup Guide

## Issues Fixed

1. ✅ **Installed Razorpay SDK**: Added `razorpay` package to dependencies
2. ✅ **Removed duplicate API file**: Deleted the old `create-razorpay-order.js` file
3. ✅ **Fixed API route**: Switched from SDK to direct API calls (more reliable)
4. ✅ **Fixed JSON parsing error**: Resolved "Unexpected token '<'" error
5. ✅ **Improved error handling**: Added better error messages and validation
6. ✅ **Enhanced frontend integration**: Added modal dismiss handling

## Setup Instructions

### 1. Get Razorpay Credentials

1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Sign up/Login to your account
3. Go to **Settings** → **API Keys**
4. Generate **Test Keys** (for development) or **Live Keys** (for production)
5. Copy your **Key ID** and **Key Secret**

### 2. Configure Environment Variables

Create a `.env.local` file in your project root with:

```env
# Razorpay Configuration
RAZORPAY_KEY_ID=rzp_test_your_key_id_here
RAZORPAY_KEY_SECRET=your_key_secret_here

# Public key for frontend (same as KEY_ID)
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_your_key_id_here
```

**Important**: Replace `rzp_test_your_key_id_here` and `your_key_secret_here` with your actual Razorpay credentials.

### 3. Test the Integration

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Go to your checkout page
3. Fill in the form details
4. Click "Pay with Razorpay"
5. Use Razorpay test cards for testing:
   - **Card Number**: 4111 1111 1111 1111
   - **Expiry**: Any future date
   - **CVV**: Any 3 digits
   - **Name**: Any name

### 4. Test Cards for Development

| Card Number | CVV | Expiry | Result |
|-------------|-----|--------|---------|
| 4111 1111 1111 1111 | Any | Any future date | Success |
| 5555 5555 5555 4444 | Any | Any future date | Success |
| 4000 0000 0000 0002 | Any | Any future date | Declined |

## Troubleshooting

### Common Issues:

1. **"Missing Razorpay credentials" error**
   - Check if `.env.local` file exists
   - Verify environment variable names are correct
   - Restart your development server after adding env vars

2. **"Invalid amount" error**
   - Amount must be in paise (multiply by 100)
   - Minimum amount is 100 paise (₹1)

3. **Payment modal not opening**
   - Check browser console for JavaScript errors
   - Ensure Razorpay script is loading properly
   - Verify `NEXT_PUBLIC_RAZORPAY_KEY_ID` is set

4. **API route not found**
   - Ensure you're using the correct API endpoint: `/api/create-razorpay-order`
   - Check that the route file is in the correct location: `src/app/api/create-razorpay-order/route.ts`

### Debug Steps:

1. Check browser console for errors
2. Check server console for API errors
3. Test environment variables: Visit `http://localhost:3000/api/debug-env`
4. Test API directly: Run `node test-api.js` (after starting dev server)
5. Verify environment variables are loaded:
   ```javascript
   console.log(process.env.RAZORPAY_KEY_ID) // Should not be undefined
   ```

### Common Error: "Unexpected token '<', "<!DOCTYPE "... is not valid JSON"

This error means your API is returning HTML instead of JSON. This usually happens when:
- The API route is not found (404 error page)
- There's a server error (500 error page)
- Environment variables are missing

**Solution**: The API route has been fixed to use direct Razorpay API calls instead of the SDK, which is more reliable.

## Production Deployment

For production:

1. Use **Live Keys** instead of test keys
2. Update your environment variables in your hosting platform
3. Ensure your domain is added to Razorpay dashboard
4. Test with real payment methods

## Security Notes

- Never commit `.env.local` to version control
- Use environment variables for all sensitive data
- Validate all payment data on the server side
- Implement proper error handling and logging
