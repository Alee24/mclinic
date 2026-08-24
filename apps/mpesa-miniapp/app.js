App({
  onLaunch(options) {
    console.log('M-Clinic Mini Program launched', options);
  },
  onShow(options) {
    console.log('M-Clinic Mini Program showing', options);
  },
  onHide() {
    console.log('M-Clinic Mini Program hidden');
  },
  onError(error) {
    console.error('M-Clinic Mini Program error occurred:', error);
  },
  globalData: {
    // Configurable webview H5 endpoint
    webviewBaseUrl: 'https://portal.mclinic.co.ke',
    // Configurable backend NestJS API endpoint
    apiBaseUrl: 'https://api.mclinic.co.ke'
  }
});

