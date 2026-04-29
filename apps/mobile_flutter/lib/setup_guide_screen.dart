import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:url_launcher/url_launcher.dart';

class SetupGuideScreen extends StatefulWidget {
  const SetupGuideScreen({super.key});

  @override
  State<SetupGuideScreen> createState() => _SetupGuideScreenState();
}

class _SetupGuideScreenState extends State<SetupGuideScreen> {
  bool _accepted = false;

  Future<void> _launchURL(String url) async {
    final Uri uri = Uri.parse(url);
    if (!await launchUrl(uri, mode: LaunchMode.externalApplication)) {
      throw Exception('Could not launch $url');
    }
  }

  Future<void> _finishSetup() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('onboarding_complete', true);
    if (mounted) {
      Navigator.pushReplacementNamed(context, '/webview');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 40.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Image.network(
                    'https://mclinic.co.ke/wp-content/uploads/2025/04/M-Clinic-Logo.png',
                    height: 40,
                  ),
                  const SizedBox(width: 12),
                  const Text(
                    'Quick Setup',
                    style: TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF1D2B36),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 32),
              const Text(
                'Welcome to Mclinic',
                style: TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.w900,
                  color: Color(0xFF16A34A),
                ),
              ),
              const SizedBox(height: 12),
              const Text(
                'Please review our essential policies before you begin using the app.',
                style: TextStyle(fontSize: 16, color: Color(0xFF74777C)),
              ),
              const SizedBox(height: 40),

              // Policy Section
              _buildPolicyItem(
                'Terms of Use',
                'By using Mclinic, you agree to our standard terms of service for medical platform access.',
                'https://portal.mclinic.co.ke/terms-and-conditions',
                Icons.description_outlined,
              ),
              const SizedBox(height: 24),
              _buildPolicyItem(
                'Data Protection',
                'We value your privacy. You can request data deletion at any time through your settings.',
                'https://portal.mclinic.co.ke/dashboard/settings/data-deletion',
                Icons.security_outlined,
              ),

              const Spacer(),

              // Acceptance Section
              Row(
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  Checkbox(
                    value: _accepted,
                    onChanged: (v) => setState(() => _accepted = v!),
                    activeColor: const Color(0xFF16A34A),
                  ),
                  const Expanded(
                    child: Text(
                      'I have read and agree to the Terms of Use and Data Privacy Policy.',
                      style: TextStyle(fontSize: 14, color: Color(0xFF43474B)),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 24),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: _accepted ? _finishSetup : null,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF16A34A),
                    foregroundColor: Colors.white,
                    disabledBackgroundColor: const Color(0xFFE0E3E5),
                    padding: const EdgeInsets.symmetric(vertical: 18),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                    elevation: 0,
                  ),
                  child: const Text(
                    'Get Started',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildPolicyItem(String title, String desc, String url, IconData icon) {
    return InkWell(
      onTap: () => _launchURL(url),
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          border: Border.all(color: const Color(0xFFE0E3E5)),
          borderRadius: BorderRadius.circular(16),
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(icon, color: const Color(0xFF16A34A), size: 28),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF1D2B36),
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    desc,
                    style: const TextStyle(fontSize: 13, color: Color(0xFF74777C)),
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'Tap to view full document',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF16A34A),
                      decoration: TextDecoration.underline,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
