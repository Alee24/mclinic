import 'package:flutter/material.dart';

class RegisterPatientScreen extends StatefulWidget {
  const RegisterPatientScreen({super.key});

  @override
  State<RegisterPatientScreen> createState() => _RegisterPatientScreenState();
}

class _RegisterPatientScreenState extends State<RegisterPatientScreen> {
  final _formKey = GlobalKey<FormState>();
  bool locationAcquired = false;
  bool loadingLocation = false;
  bool termsAccepted = false;
  bool isSubmitting = false;

  final TextEditingController _fnameController = TextEditingController();
  final TextEditingController _lnameController = TextEditingController();
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _mobileController = TextEditingController();
  final TextEditingController _idController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF7F9FB),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Color(0xFF191C1E)),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: SingleChildScrollView(
        child: Column(
          children: [
            // Header
            Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Create Account',
                    style: TextStyle(
                      fontSize: 32,
                      fontWeight: FontWeight.w900,
                      color: Color(0xFF1D2B36),
                    ),
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'Fill in your basic details to get started',
                    style: TextStyle(color: Color(0xFF74777C), fontSize: 16),
                  ),
                ],
              ),
            ),

            Padding(
              padding: const EdgeInsets.all(24.0),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Names
                    Row(
                      children: [
                        Expanded(
                          child: _buildField(
                            label: 'FIRST NAME',
                            controller: _fnameController,
                            hint: 'John',
                            icon: Icons.person_outline,
                          ),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: _buildField(
                            label: 'LAST NAME',
                            controller: _lnameController,
                            hint: 'Doe',
                            icon: Icons.person_outline,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 20),

                    // Email
                    _buildField(
                      label: 'EMAIL ADDRESS',
                      controller: _emailController,
                      hint: 'john@example.com',
                      icon: Icons.email_outlined,
                      keyboardType: TextInputType.emailAddress,
                    ),
                    const SizedBox(height: 20),

                    // Phone & ID
                    Row(
                      children: [
                        Expanded(
                          child: _buildField(
                            label: 'MOBILE NUMBER',
                            controller: _mobileController,
                            hint: '0712345678',
                            icon: Icons.phone_android_outlined,
                            keyboardType: TextInputType.phone,
                          ),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: _buildField(
                            label: 'ID NUMBER',
                            controller: _idController,
                            hint: '12345678',
                            icon: Icons.badge_outlined,
                            keyboardType: TextInputType.number,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 32),

                    // GPS Location
                    Container(
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        color: const Color(0xFFF0F7FF),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: const Color(0xFFCCE4FF), width: 2),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Row(
                            children: [
                              Icon(Icons.location_on_outlined, color: Color(0xFF2563EB), size: 20),
                              SizedBox(width: 8),
                              Text(
                                'GPS LOCATION (REQUIRED)',
                                style: TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.bold,
                                  color: Color(0xFF2563EB),
                                  letterSpacing: 1.2,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 12),
                          const Text(
                            'We need your location to connect you with nearby healthcare providers and ensure fast service delivery.',
                            style: TextStyle(fontSize: 13, color: Color(0xFF3B82F6)),
                          ),
                          const SizedBox(height: 20),
                          SizedBox(
                            width: double.infinity,
                            child: ElevatedButton.icon(
                              onPressed: () async {
                                setState(() => loadingLocation = true);
                                await Future.delayed(const Duration(seconds: 2));
                                setState(() {
                                  loadingLocation = false;
                                  locationAcquired = true;
                                });
                              },
                              icon: loadingLocation 
                                ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                                : Icon(locationAcquired ? Icons.check_circle : Icons.navigation),
                              label: Text(
                                loadingLocation 
                                  ? 'Getting Location...' 
                                  : (locationAcquired ? 'Location Acquired' : 'Enable GPS Location')
                              ),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: locationAcquired ? const Color(0xFF16A34A) : const Color(0xFF2563EB),
                                foregroundColor: Colors.white,
                                padding: const EdgeInsets.symmetric(vertical: 16),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                elevation: 0,
                              ),
                            ),
                          ),
                          if (locationAcquired) ...[
                            const SizedBox(height: 12),
                            const Row(
                              children: [
                                Icon(Icons.check_circle, color: Color(0xFF16A34A), size: 14),
                                SizedBox(width: 4),
                                Text('Coordinates: -1.2921, 36.8219', style: TextStyle(color: Color(0xFF16A34A), fontSize: 12)),
                              ],
                            ),
                          ],
                        ],
                      ),
                    ),
                    const SizedBox(height: 32),

                    // Password
                    _buildField(
                      label: 'PASSWORD',
                      controller: _passwordController,
                      hint: 'Minimum 6 characters',
                      icon: Icons.lock_outline,
                      isPassword: true,
                    ),
                    const SizedBox(height: 24),

                    // Terms
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Checkbox(
                          value: termsAccepted, 
                          onChanged: (v) => setState(() => termsAccepted = v!),
                          activeColor: const Color(0xFF16A34A),
                        ),
                        Expanded(
                          child: Padding(
                            padding: const EdgeInsets.only(top: 12.0),
                            child: RichText(
                              text: const TextSpan(
                                text: 'I agree to the ',
                                style: TextStyle(color: Color(0xFF43474B), fontSize: 14),
                                children: [
                                  TextSpan(text: 'Terms and Conditions', style: TextStyle(color: Color(0xFF16A34A), fontWeight: FontWeight.bold)),
                                  TextSpan(text: ' and '),
                                  TextSpan(text: 'Privacy Policy', style: TextStyle(color: Color(0xFF16A34A), fontWeight: FontWeight.bold)),
                                ],
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 32),

                    // Submit
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        onPressed: (!termsAccepted || !locationAcquired || isSubmitting) 
                          ? null 
                          : () {
                              setState(() => isSubmitting = true);
                              Future.delayed(const Duration(seconds: 2), () {
                                Navigator.pushReplacementNamed(context, '/main');
                              });
                            },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF16A34A),
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 20),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                          disabledBackgroundColor: const Color(0xFFE0E3E5),
                        ),
                        child: isSubmitting 
                          ? const CircularProgressIndicator(color: Colors.white)
                          : const Text('Create Account', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                      ),
                    ),

                    const SizedBox(height: 32),
                    Center(
                      child: TextButton(
                        onPressed: () => Navigator.pop(context),
                        child: RichText(
                          text: const TextSpan(
                            text: 'Already have an account? ',
                            style: TextStyle(color: Color(0xFF74777C)),
                            children: [
                              TextSpan(text: 'Log In', style: TextStyle(color: Color(0xFF16A34A), fontWeight: FontWeight.bold)),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildField({
    required String label,
    required TextEditingController controller,
    required String hint,
    required IconData icon,
    bool isPassword = false,
    TextInputType keyboardType = TextInputType.text,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.bold,
            color: Color(0xFF74777C),
            letterSpacing: 1.2,
          ),
        ),
        const SizedBox(height: 8),
        Container(
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: const Color(0xFFE0E3E5), width: 2),
          ),
          child: TextField(
            controller: controller,
            obscureText: isPassword,
            keyboardType: keyboardType,
            decoration: InputDecoration(
              hintText: hint,
              prefixIcon: Icon(icon, color: const Color(0xFF74777C)),
              border: InputBorder.none,
              contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
            ),
          ),
        ),
      ],
    );
  }
}
