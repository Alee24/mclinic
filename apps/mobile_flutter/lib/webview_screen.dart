import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:webview_flutter_android/webview_flutter_android.dart';
import 'package:webview_flutter_wkwebview/webview_flutter_wkwebview.dart';
import 'package:permission_handler/permission_handler.dart';

class WebViewScreen extends StatefulWidget {
  const WebViewScreen({super.key});

  @override
  State<WebViewScreen> createState() => _WebViewScreenState();
}

class _WebViewScreenState extends State<WebViewScreen> {
  late final WebViewController _controller;
  bool _isLoading = true;
  double _progress = 0;

  @override
  void initState() {
    super.initState();
    _initController();
    _requestPermissions();
  }

  Future<void> _requestPermissions() async {
    // Request precise location permissions for Android 12+
    Map<Permission, PermissionStatus> statuses = await [
      Permission.location,
      Permission.locationWhenInUse,
      Permission.camera,
      Permission.microphone,
    ].request();
    
    debugPrint('Permissions Status: $statuses');
  }

  void _initController() {
    late final PlatformWebViewControllerCreationParams params;
    if (WebViewPlatform.instance is WebKitWebViewPlatform) {
      params = WebKitWebViewControllerCreationParams(
        allowsInlineMediaPlayback: true,
      );
    } else {
      params = const PlatformWebViewControllerCreationParams();
    }

    final WebViewController controller = WebViewController.fromPlatformCreationParams(params);

    controller
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setUserAgent("Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36")
      ..setBackgroundColor(const Color(0x00000000))
      ..setNavigationDelegate(
        NavigationDelegate(
          onProgress: (int progress) {
            setState(() {
              _progress = progress / 100;
            });
          },
          onPageStarted: (String url) {
            setState(() => _isLoading = true);
          },
          onPageFinished: (String url) {
            setState(() => _isLoading = false);
          },
          onWebResourceError: (WebResourceError error) {
            debugPrint('WebView Error: ${error.description}');
          },
          onNavigationRequest: (NavigationRequest request) {
            return NavigationDecision.navigate;
          },
        ),
      )
      ..loadRequest(Uri.parse('https://portal.mclinic.co.ke/dashboard'));

    // Android Specific Geolocation Support
    if (controller.platform is AndroidWebViewController) {
      final androidController = controller.platform as AndroidWebViewController;
      AndroidWebViewController.enableDebugging(true);
      androidController.setMediaPlaybackRequiresUserGesture(false);
      
      // Critical for GPS and Camera support within the WebView
      androidController.setOnPlatformPermissionRequest((request) async {
        debugPrint('WebView Permission Request for: ${request.types}');
        
        // Ensure app has permissions before granting to WebView
        bool isLocationRequest = request.types.any((t) => t.toString().contains('geolocation'));
        if (isLocationRequest) {
          final status = await Permission.location.status;
          if (!status.isGranted) {
            await Permission.location.request();
          }
        }
        
        request.grant();
      });

      // Explicitly handle HTML5 Geolocation API requests
      androidController.setGeolocationPermissionsPromptCallbacks(
          onShowPrompt: (GeolocationPermissionsRequestParams request) async {
        debugPrint('Geolocation requested by ${request.origin}');
        return const GeolocationPermissionsResponse(allow: true, retain: true);
      });
    }

    _controller = controller;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new, color: Colors.black, size: 20),
          onPressed: () async {
            if (await _controller.canGoBack()) {
              await _controller.goBack();
            } else {
              if (mounted) Navigator.pop(context);
            }
          },
        ),
        title: Image.network(
          'https://mclinic.co.ke/wp-content/uploads/2025/04/M-Clinic-Logo.png',
          height: 30,
          errorBuilder: (_, __, ___) => const Text(
            'M-CLINIC',
            style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold, fontSize: 16),
          ),
        ),
        centerTitle: true,
        actions: [
          IconButton(
            icon: Icon(
              Icons.refresh,
              color: _isLoading ? Colors.grey : Colors.green,
            ),
            onPressed: _isLoading ? null : () => _controller.reload(),
          ),
        ],
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(2),
          child: _isLoading
              ? LinearProgressIndicator(
                  value: _progress > 0 ? _progress : null,
                  backgroundColor: Colors.transparent,
                  color: const Color(0xFF16A34A),
                  minHeight: 2,
                )
              : const SizedBox(height: 2),
        ),
      ),
      body: SafeArea(
        child: Stack(
          children: [
            WebViewWidget(controller: _controller),
            if (_isLoading && _progress == 0)
              const Center(
                child: CircularProgressIndicator(
                  color: Color(0xFF16A34A),
                ),
              ),
          ],
        ),
      ),
    );
  }
}
