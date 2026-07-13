const app = getApp();

Page({
  data: {
    webviewUrl: ''
  },

  onLoad(query) {
    this.initSession();
  },

  initSession() {
    const baseUrl = app.globalData.webviewBaseUrl;
    
    // Step 1: Request M-Pesa Native Authorization Code
    my.getAuthCode({
      scopes: 'auth_base',
      success: (authRes) => {
        const authCode = authRes.authCode;
        console.log('Successfully retrieved authCode:', authCode);

        // Step 2: Exchange authCode for JWT token from M-Clinic backend
        my.request({
          url: 'http://localhost:3001/auth/mpesa-miniapp/login', // Adjust backend URL in production
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          data: {
            authCode: authCode
          },
          dataType: 'json',
          success: (loginRes) => {
            if (loginRes.data && loginRes.data.access_token) {
              const token = loginRes.data.access_token;
              console.log('Login successful. Session token received.');
              // Redirect straight to dashboard inside webview with auth token
              this.setData({
                webviewUrl: `${baseUrl}/dashboard?platform=mpesa&token=${token}`
              });
            } else {
              // Fallback: load dashboard with authCode parameter
              this.setData({
                webviewUrl: `${baseUrl}/dashboard?platform=mpesa&authCode=${authCode}`
              });
            }
          },
          fail: (err) => {
            console.warn('Backend OAuth exchange failed. Loading webview in standard fallback mode:', err);
            this.setData({
              webviewUrl: `${baseUrl}/dashboard?platform=mpesa`
            });
          }
        });
      },
      fail: (err) => {
        console.error('getAuthCode failed:', err);
        // Fallback: load webview without session (user logs in manually)
        this.setData({
          webviewUrl: `${baseUrl}/dashboard?platform=mpesa`
        });
      }
    });
  },

  // Handles messages sent from Next.js H5 app (inside the webview)
  onMessage(e) {
    console.log('Message received from Webview:', e);
    const data = e.detail;

    if (data && data.action === 'pay') {
      const { invoiceId, amount, invoiceNumber } = data;
      
      my.showLoading({
        content: 'Initiating M-Pesa Payment...'
      });

      // Request transaction order from backend
      my.request({
        url: 'http://localhost:3001/financial/mpesa/stk-push', // Adjust backend endpoint
        method: 'POST',
        data: {
          invoiceId: invoiceId,
          amount: amount
        },
        dataType: 'json',
        success: (res) => {
          my.hideLoading();
          
          // In a production setup, Safaricom Daraja returns an order/trade number.
          // The host Mini Program calls my.tradePay to trigger the native M-Pesa PIN overlay.
          const tradeNo = res.data && res.data.checkoutRequestId;
          if (tradeNo) {
            my.tradePay({
              tradeNO: tradeNo,
              success: (payRes) => {
                my.showToast({
                  type: 'success',
                  content: 'Payment processed successfully!'
                });
              },
              fail: (payErr) => {
                // If native tradePay fails or is unsupported in sandbox, report error
                my.showToast({
                  type: 'fail',
                  content: 'M-Pesa payment failed or cancelled.'
                });
              }
            });
          } else {
            my.showToast({
              type: 'success',
              content: 'STK push sent. Please confirm on your phone.'
            });
          }
        },
        fail: (err) => {
          my.hideLoading();
          my.alert({
            title: 'Payment Error',
            content: 'Could not connect to payment gateway. Please try again.'
          });
        }
      });
    }
  }
});
