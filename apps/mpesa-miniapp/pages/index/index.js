const app = getApp();

Page({
  data: {
    webviewUrl: '',
    isLoading: true,
    isError: false
  },

  onLoad(query) {
    this.initSession();
  },

  onRetry() {
    this.setData({
      isLoading: true,
      isError: false
    });
    this.initSession();
  },

  getApiBaseUrl() {
    return (app.globalData && app.globalData.apiBaseUrl) 
      ? app.globalData.apiBaseUrl 
      : 'https://api.mclinic.co.ke';
  },

  getWebviewBaseUrl() {
    return (app.globalData && app.globalData.webviewBaseUrl) 
      ? app.globalData.webviewBaseUrl 
      : 'https://portal.mclinic.co.ke';
  },

  initSession() {
    const webviewBaseUrl = this.getWebviewBaseUrl();
    const apiBaseUrl = this.getApiBaseUrl();

    // Request M-Pesa Native Authorization Code from Safaricom JSBridge
    my.getAuthCode({
      scopes: 'auth_base',
      success: (authRes) => {
        const authCode = authRes.authCode;
        console.log('Successfully retrieved M-Pesa authCode:', authCode);

        // Exchange authCode for JWT token from M-Clinic backend
        my.request({
          url: `${apiBaseUrl}/auth/mpesa-miniapp/login`,
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
              console.log('M-Pesa SSO login successful. Access token received.');
              this.setData({
                webviewUrl: `${webviewBaseUrl}/dashboard?platform=mpesa&token=${encodeURIComponent(token)}`,
                isLoading: false,
                isError: false
              });
            } else {
              console.warn('SSO token missing in response. Loading fallback webview session.');
              this.setData({
                webviewUrl: `${webviewBaseUrl}/dashboard?platform=mpesa&authCode=${encodeURIComponent(authCode)}`,
                isLoading: false,
                isError: false
              });
            }
          },
          fail: (err) => {
            console.warn('Backend OAuth exchange request failed. Fallback to webview platform mode:', err);
            this.setData({
              webviewUrl: `${webviewBaseUrl}/dashboard?platform=mpesa`,
              isLoading: false,
              isError: false
            });
          }
        });
      },
      fail: (err) => {
        console.error('my.getAuthCode failed or unsupported:', err);
        // Fallback: direct webview load without session parameters
        this.setData({
          webviewUrl: `${webviewBaseUrl}/dashboard?platform=mpesa`,
          isLoading: false,
          isError: false
        });
      }
    });
  },

  onWebviewLoad(e) {
    console.log('Webview loaded successfully:', e);
    this.setData({ isLoading: false });
  },

  onWebviewError(e) {
    console.error('Webview loading error:', e);
    this.setData({
      isLoading: false,
      isError: true
    });
  },

  // Handles messages sent from Next.js H5 app inside the webview via postMessage
  onMessage(e) {
    console.log('JSBridge message received from H5 Webview:', e);
    const data = e.detail || (e.data && e.data[0]);

    if (!data || !data.action) return;

    const apiBaseUrl = this.getApiBaseUrl();

    switch (data.action) {
      case 'pay': {
        const { invoiceId, amount, phoneNumber, invoiceNumber } = data;
        
        my.showLoading({
          content: 'Initiating M-Pesa Payment...'
        });

        my.request({
          url: `${apiBaseUrl}/financial/mpesa/stk-push`,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          data: {
            invoiceId: invoiceId,
            amount: amount,
            phone: phoneNumber
          },
          dataType: 'json',
          success: (res) => {
            my.hideLoading();
            const tradeNo = res.data && (res.data.checkoutRequestId || res.data.tradeNo);
            
            if (tradeNo && typeof my.tradePay === 'function') {
              my.tradePay({
                tradeNO: tradeNo,
                success: (payRes) => {
                  my.showToast({
                    type: 'success',
                    content: 'Payment completed successfully!'
                  });
                },
                fail: (payErr) => {
                  my.showToast({
                    type: 'fail',
                    content: 'M-Pesa payment failed or was cancelled.'
                  });
                }
              });
            } else {
              my.showToast({
                type: 'success',
                content: 'STK push sent. Please enter PIN on your phone.'
              });
            }
          },
          fail: (err) => {
            my.hideLoading();
            my.alert({
              title: 'Payment Gateway Error',
              content: 'Could not connect to M-Pesa payment service. Please try again.'
            });
          }
        });
        break;
      }

      case 'toast': {
        my.showToast({
          type: data.type || 'none',
          content: data.content || '',
          duration: data.duration || 2000
        });
        break;
      }

      case 'alert': {
        my.alert({
          title: data.title || 'Notice',
          content: data.content || '',
          buttonText: data.buttonText || 'OK'
        });
        break;
      }

      case 'navigate': {
        if (data.url) {
          my.navigateTo({
            url: data.url,
            fail: () => {
              my.redirectTo({ url: data.url });
            }
          });
        }
        break;
      }

      case 'setStorage': {
        if (data.key) {
          my.setStorage({
            key: data.key,
            data: data.value
          });
        }
        break;
      }

      case 'share': {
        if (typeof my.showSharePanel === 'function') {
          my.showSharePanel();
        } else {
          my.showToast({
            content: 'Share options opened',
            type: 'none'
          });
        }
        break;
      }

      default:
        console.log('Unhandled JSBridge action:', data.action);
    }
  }
});
