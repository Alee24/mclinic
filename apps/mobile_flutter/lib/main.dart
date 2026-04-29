import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'splash_screen.dart';
import 'webview_screen.dart';
import 'setup_guide_screen.dart';
import 'package:permission_handler/permission_handler.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Request all permissions at startup
  await [
    Permission.camera,
    Permission.location,
    Permission.locationAlways,
    Permission.contacts,
    Permission.sensors,
    Permission.activityRecognition,
  ].request();

  runApp(
    const ProviderScope(
      child: MyApp(),
    ),
  );
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'M-Clinic',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFF006D31)),
        useMaterial3: true,
        fontFamily: 'Public Sans',
      ),
      initialRoute: '/splash',
      routes: {
        '/splash': (context) => const SplashScreen(),
        '/setup_guide': (context) => const SetupGuideScreen(),
        '/webview': (context) => const WebViewScreen(),
      },
    );
  }
}
