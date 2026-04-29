import 'package:flutter/material.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  bool isPatient = true;
  bool usePassword = true;
  bool showPassword = false;
  bool otpSent = false;
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  final TextEditingController _mobileController = TextEditingController();
  final TextEditingController _otpController = TextEditingController();

  @override
  Widget build(BuildContext context) {
    final primaryColor = isPatient ? const Color(0xFF16A34A) : const Color(0xFF2563EB);
    
    return Scaffold(
      backgroundColor: const Color(0xFFF7F9FB),
      body: SingleChildScrollView(
        child: Column(
          children: [
            // Header Section
            Container(
              width: double.infinity,
              padding: const EdgeInsets.fromLTRB(24, 80, 24, 40),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: isPatient 
                    ? [const Color(0xFF16A34A), const Color(0xFF15803D)]
                    : [const Color(0xFF2563EB), const Color(0xFF1D4ED8)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: const BorderRadius.vertical(bottom: Radius.circular(40)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        width: 48,
                        height: 48,
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Center(
                          child: Text(
                            'M',
                            style: TextStyle(
                              color: primaryColor,
                              fontSize: 24,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
                      const Text(
                        'M-Clinic',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 24,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 32),
                  const Text(
                    'Welcome Back',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 32,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    isPatient 
                      ? 'Sign in to access your health records and book appointments'
                      : 'Sign in to access your provider dashboard and manage patients',
                    style: TextStyle(
                      color: Colors.white.withOpacity(0.9),
                      fontSize: 16,
                    ),
                  ),
                ],
              ),
            ),

            Padding(
              padding: const EdgeInsets.all(24.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Sign In',
                    style: TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF1D2B36),
                    ),
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'Choose your account type to continue',
                    style: TextStyle(color: Color(0xFF74777C), fontSize: 14),
                  ),
                  const SizedBox(height: 24),

                  // User Type Toggle
                  Row(
                    children: [
                      Expanded(
                        child: _buildTypeCard(
                          'Patient', 
                          Icons.person_outline, 
                          isPatient, 
                          () => setState(() => isPatient = true)
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: _buildTypeCard(
                          'Provider', 
                          Icons.medical_services_outlined, 
                          !isPatient, 
                          () => setState(() => isPatient = false)
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 32),

                  // Login Method Toggle
                  Center(
                    child: Container(
                      padding: const EdgeInsets.all(4),
                      decoration: BoxDecoration(
                        color: const Color(0xFFECEEF0),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          _buildMethodButton('Password', usePassword, () => setState(() => usePassword = true)),
                          _buildMethodButton('One-Time PIN', !usePassword, () => setState(() => usePassword = false)),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 32),

                  // Form Fields
                  if (usePassword) ...[
                    _buildLabel('EMAIL ADDRESS'),
                    _buildTextField(
                      controller: _emailController,
                      hint: isPatient ? 'patient@example.com' : 'doctor@mclinic.com',
                      icon: Icons.email_outlined,
                    ),
                    const SizedBox(height: 20),
                    _buildLabel('PASSWORD'),
                    _buildTextField(
                      controller: _passwordController,
                      hint: 'Enter your password',
                      icon: Icons.lock_outline,
                      isPassword: true,
                      showPassword: showPassword,
                      onTogglePassword: () => setState(() => showPassword = !showPassword),
                    ),
                  ] else ...[
                    _buildLabel('MOBILE NUMBER'),
                    _buildTextField(
                      controller: _mobileController,
                      hint: 'e.g. 0712345678',
                      icon: Icons.phone_android_outlined,
                      keyboardType: TextInputType.phone,
                    ),
                    if (otpSent) ...[
                      const SizedBox(height: 20),
                      _buildLabel('ENTER OTP'),
                      _buildTextField(
                        controller: _otpController,
                        hint: '••••••',
                        icon: Icons.pin_outlined,
                        keyboardType: TextInputType.number,
                        textAlign: TextAlign.center,
                        letterSpacing: 8.0,
                      ),
                      const SizedBox(height: 8),
                      Center(child: Text('OTP sent to ${_mobileController.text}', style: const TextStyle(color: Color(0xFF16A34A), fontSize: 12))),
                    ],
                  ],

                  const SizedBox(height: 16),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      if (usePassword)
                        Row(
                          children: [
                            Checkbox(value: true, onChanged: (v) {}, activeColor: primaryColor),
                            const Text('Remember me', style: TextStyle(fontSize: 14, color: Color(0xFF43474B))),
                          ],
                        )
                      else
                        const SizedBox(),
                      TextButton(
                        onPressed: () {},
                        child: Text(
                          'Forgot Password?',
                          style: TextStyle(color: primaryColor, fontWeight: FontWeight.bold),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 32),

                  // Submit Button
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: () {
                        if (!usePassword && !otpSent) {
                          setState(() => otpSent = true);
                        } else {
                          // Handle login
                          Navigator.pushReplacementNamed(context, '/main');
                        }
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: primaryColor,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 18),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                        elevation: 4,
                        shadowColor: primaryColor.withOpacity(0.4),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(
                            usePassword 
                              ? 'Sign In as ${isPatient ? 'Patient' : 'Provider'}'
                              : (otpSent ? 'Verify & Login' : 'Send One-Time PIN'),
                            style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                          ),
                          const SizedBox(width: 8),
                          const Icon(Icons.arrow_forward, size: 20),
                        ],
                      ),
                    ),
                  ),

                  const SizedBox(height: 40),
                  const Divider(),
                  const SizedBox(height: 24),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      TextButton(
                        onPressed: () => Navigator.pushNamed(context, '/register_patient'),
                        child: const Text('Register as Patient', style: TextStyle(color: Color(0xFF74777C), fontSize: 12, fontWeight: FontWeight.bold)),
                      ),
                      const SizedBox(width: 24),
                      TextButton(
                        onPressed: () {},
                        child: const Text('Register as Medic', style: TextStyle(color: Color(0xFF74777C), fontSize: 12, fontWeight: FontWeight.bold)),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  Center(
                    child: TextButton.icon(
                      onPressed: () {},
                      icon: const Icon(Icons.help_outline, size: 16, color: Color(0xFF74777C)),
                      label: const Text('Need Help? Contact Support', style: TextStyle(color: Color(0xFF74777C), fontSize: 14)),
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

  Widget _buildTypeCard(String title, IconData icon, bool selected, VoidCallback onTap) {
    final color = title == 'Patient' ? const Color(0xFF16A34A) : const Color(0xFF2563EB);
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: selected ? color.withOpacity(0.05) : Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: selected ? color : const Color(0xFFE0E3E5),
            width: 2,
          ),
        ),
        child: Column(
          children: [
            Container(
              width: 56,
              height: 56,
              decoration: BoxDecoration(
                color: selected ? color : const Color(0xFFF7F9FB),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Icon(icon, color: selected ? Colors.white : const Color(0xFF74777C), size: 28),
            ),
            const SizedBox(height: 12),
            Text(
              title,
              style: TextStyle(
                fontWeight: FontWeight.bold,
                color: selected ? color : const Color(0xFF1D2B36),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMethodButton(String title, bool selected, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          color: selected ? Colors.white : Colors.transparent,
          borderRadius: BorderRadius.circular(8),
          boxShadow: selected ? [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 4, offset: const Offset(0, 2))] : null,
        ),
        child: Text(
          title,
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.bold,
            color: selected ? const Color(0xFF1D2B36) : const Color(0xFF74777C),
          ),
        ),
      ),
    );
  }

  Widget _buildLabel(String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8.0),
      child: Text(
        text,
        style: const TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.bold,
          color: Color(0xFF74777C),
          letterSpacing: 1.2,
        ),
      ),
    );
  }

  Widget _buildTextField({
    required TextEditingController controller,
    required String hint,
    required IconData icon,
    bool isPassword = false,
    bool showPassword = false,
    VoidCallback? onTogglePassword,
    TextInputType keyboardType = TextInputType.text,
    TextAlign textAlign = TextAlign.start,
    double? letterSpacing,
  }) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE0E3E5), width: 2),
      ),
      child: TextField(
        controller: controller,
        obscureText: isPassword && !showPassword,
        keyboardType: keyboardType,
        textAlign: textAlign,
        style: TextStyle(letterSpacing: letterSpacing, fontWeight: FontWeight.w500),
        decoration: InputDecoration(
          hintText: hint,
          prefixIcon: Icon(icon, color: const Color(0xFF74777C)),
          suffixIcon: isPassword 
            ? IconButton(
                icon: Icon(showPassword ? Icons.visibility_off_outlined : Icons.visibility_outlined, color: const Color(0xFF74777C)),
                onPressed: onTogglePassword,
              )
            : null,
          border: InputBorder.none,
          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
        ),
      ),
    );
  }
}
