# Safaricom M-Pesa Super App Mini Program Shell

This directory contains the native Mini Program shell files that host the M-Clinic web application within the Safaricom M-Pesa Super App. It uses a `<web-view>` container to embed the Next.js frontend while leveraging M-Pesa native JSBridge APIs for authentication and payments.

## Features Included
1. **Single Sign-On (SSO):** Automatically queries `my.getAuthCode` on load, exchanges it with the M-Clinic API for a JWT token, and passes it securely to log the user in instantly.
2. **Native Payments:** Intercepts payment requests from the H5 application and invokes `my.tradePay` to trigger the native M-Pesa PIN prompt overlay inside the Super App.
3. **Immersive UI:** Prompts the Next.js web application to hide sidebars, headers, and quick-nav components to match native app standards.

---

## How to Load and Test

### 1. Download Safaricom Mini Program Studio
1. Log in to the [Safaricom Developer Portal / Mini Program Console](https://developer.safaricom.co.ke/).
2. Download and install the **Mini Program Studio IDE** for your operating system.

### 2. Import the Project
1. Open Mini Program Studio.
2. Select **Open Project** and navigate to this folder: `apps/mpesa-miniapp/`.
3. Choose **M-Pesa / Alipay Mini Program** template options if prompted.

### 3. Configure the Base URL
- Open `apps/mpesa-miniapp/app.js` and edit the `webviewBaseUrl` in the `globalData` object:
  ```javascript
  globalData: {
    webviewBaseUrl: 'https://yourdomain.com' // Set this to your live or tunnel URL (e.g. Ngrok)
  }
  ```

---

## Production Configurations (Whitelisting)

Before uploading the Mini Program for review, you must configure the following in the Safaricom Developer Console:

### 1. Whitelist the H5 Domain
To ensure the `<web-view>` renders correctly and doesn't get blocked:
1. Go to the Developer Dashboard > **Settings** > **H5 Domain Whitelist**.
2. Add your website domain (e.g., `https://yourdomain.com`).

### 2. Whitelist Server API Domain
To allow network requests (`my.request`) to function:
1. Go to **Settings** > **Request Domain Whitelist**.
2. Add your NestJS API server endpoint (e.g., `https://api.yourdomain.com` or `http://localhost:3001` for testing).

---

## Debugging inside the Simulator
- Use the built-in **Simulator** panel in Mini Program Studio to see how the app looks on a simulated mobile device.
- Use the **Console** and **Network** tabs under the Debugger to trace logs for `my.getAuthCode`, SSO requests, and payments.
