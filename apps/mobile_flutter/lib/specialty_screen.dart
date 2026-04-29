import 'package:flutter/material.dart';
import 'booking_confirmed_screen.dart';

class SpecialtyScreen extends StatelessWidget {
  const SpecialtyScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF7F9FB),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.menu, color: Color(0xFF191C1E)),
          onPressed: () {},
        ),
        title: const Text(
          'Healthcare Excellence',
          style: TextStyle(
            color: Color(0xFF191C1E),
            fontSize: 18,
            fontWeight: FontWeight.bold,
            letterSpacing: 1.2,
          ),
        ),
        actions: [
          const Padding(
            padding: EdgeInsets.only(right: 16.0),
            child: CircleAvatar(
              radius: 16,
              backgroundImage: NetworkImage('https://lh3.googleusercontent.com/aida-public/AB6AXuB1g37tOFNxZxin9DmKUEeUwqjC3GQOG9YjfTaWD8hND7fbFdi8_7dFSr79A_U7cD5wlUUo5vSzPalE6NUtJaxFjaRWOxGQn9HCi9r9j5psOeB3ZQLITjhw9povTy6DG05_3XtFXXyU0btnvHAEXmbAY0ry_ltlQDQ48qTSYHn5IZ4F4VNmJ8NfTlz94W_FV57sCET-dPobcqEarjVsA0QFaB8EcRseR46ap0V5HH9bgJqiw7Ka59dSimJsqlmHSxf76L02wcK23qI'),
            ),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Select Specialty',
              style: TextStyle(fontSize: 32, fontWeight: FontWeight.w600, color: Color(0xFF081621)),
            ),
            const SizedBox(height: 8),
            const Text(
              'Find the right medical expert for your needs. Choose from our network of world-class specialists.',
              style: TextStyle(fontSize: 16, color: Color(0xFF43474B)),
            ),
            const SizedBox(height: 32),
            TextField(
              decoration: InputDecoration(
                prefixIcon: const Icon(Icons.search, color: Color(0xFF74777C)),
                hintText: 'Search symptoms or specialties...',
                filled: true,
                fillColor: Colors.white,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: Color(0xFFC4C7CB)),
                ),
              ),
            ),
            const SizedBox(height: 24),
            
            // Featured Card
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: const Color(0xFF1D2B36),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFF081621)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Icon(Icons.medical_services, color: Color(0xFF65FF90), size: 48),
                  const SizedBox(height: 16),
                  const Text(
                    'General Physician',
                    style: TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.w600),
                  ),
                  const SizedBox(height: 4),
                  const Text(
                    'Primary care, routine check-ups, and holistic health management for all ages.',
                    style: TextStyle(color: Color(0xFF8492A0), fontSize: 14),
                  ),
                  const SizedBox(height: 24),
                  Row(
                    children: const [
                      Text('Book Now', style: TextStyle(color: Color(0xFF65FF90), fontWeight: FontWeight.bold)),
                      Icon(Icons.chevron_right, color: Color(0xFF65FF90), size: 18),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            GridView.count(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              crossAxisCount: 1,
              childAspectRatio: 2.5,
              mainAxisSpacing: 16,
              children: [
                _buildSpecialtyCard('Cardiology', 'Heart health, diagnostics, and vascular care.', Icons.favorite, const Color(0xFFECEEF0)),
                _buildSpecialtyCard('Pediatrics', 'Specialized healthcare for infants and children.', Icons.child_care, const Color(0xFFECEEF0)),
                _buildSpecialtyCard('Dermatology', 'Expert care for skin, hair, and nail health.', Icons.face, const Color(0xFFECEEF0)),
                _buildSpecialtyCard('Neurology', 'Advanced care for brain and nervous system.', Icons.psychology, const Color(0xFFECEEF0)),
              ],
            ),
            
            const SizedBox(height: 48),
            Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                TextButton(
                  onPressed: () {},
                  child: const Text('Cancel Selection', style: TextStyle(color: Color(0xFF081621))),
                ),
                const SizedBox(width: 16),
                ElevatedButton.icon(
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (context) => const BookingConfirmedScreen()),
                    );
                  },
                  icon: const Icon(Icons.arrow_forward, color: Colors.white, size: 18),
                  label: const Text('Continue', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF006D31),
                    padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSpecialtyCard(String name, String desc, IconData icon, Color iconBg) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFC4C7CB)),
      ),
      child: Row(
        children: [
          Container(
            width: 64,
            height: 64,
            decoration: BoxDecoration(
              color: iconBg,
              shape: BoxShape.circle,
            ),
            child: Icon(icon, color: const Color(0xFF081621), size: 32),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(name, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w600, color: Color(0xFF081621))),
                const SizedBox(height: 2),
                Text(desc, style: const TextStyle(fontSize: 12, color: Color(0xFF43474B))),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
