import 'package:flutter/material.dart';

class EmergencyScreen extends StatelessWidget {
  const EmergencyScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF7F9FB),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        titleSpacing: 16,
        title: Row(
          children: [
            const CircleAvatar(
              radius: 20,
              backgroundColor: Color(0xFFE0E3E5),
              backgroundImage: NetworkImage('https://lh3.googleusercontent.com/aida-public/AB6AXuAVzJ47cLQcseXQhak6cO4RKPhoq0Q0xcR3ia1tb1VlKBqoHrSdvxTeI7WQWmmFt1vryDQQzvnzSpagg4GXMXbziJ7meoNohK5RHsICyEC_GpWBJhegkNJbDAX4azYa0MZHZSoLjMTPUsvo45WoOpE7gTb6qHZ-W3CwvRi6d3mA2NXZDmRWnCiGALoo9ADHZCsnKWQMox6jERFTE6Uc8XpGS0vU_-hU0Sa4-dCgmyPbdEpiJF0eB9uNxWqYNflis5LNlsuyCYOTwfw'),
            ),
            const SizedBox(width: 12),
            const Text(
              'CareConnect',
              style: TextStyle(
                color: Color(0xFF1D2B36),
                fontSize: 20,
                fontWeight: FontWeight.w900,
                letterSpacing: -0.5,
              ),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_none, color: Color(0xFF191C1E)),
            onPressed: () {},
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Emergency Action
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFFE0E3E5)),
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFFC2003F).withOpacity(0.1),
                    blurRadius: 20,
                    offset: const Offset(0, 10),
                  ),
                ],
              ),
              child: Column(
                children: [
                  const Text(
                    'Immediate Assistance Needed?',
                    style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Color(0xFF081621)),
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'Our dispatchers are available 24/7. Your location is automatically transmitted.',
                    textAlign: TextAlign.center,
                    style: TextStyle(fontSize: 16, color: Color(0xFF43474B)),
                  ),
                  const SizedBox(height: 24),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton.icon(
                      onPressed: () {},
                      icon: const Icon(Icons.emergency, color: Colors.white),
                      label: const Text('Request Emergency Ambulance', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFFC2003F),
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 48),

            // Subscription Plans
            const Center(
              child: Text(
                'Ambulance Subscription Plans',
                style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Color(0xFF081621)),
              ),
            ),
            const SizedBox(height: 8),
            const Center(
              child: Text(
                'Choose the coverage that fits your lifestyle.',
                style: TextStyle(fontSize: 16, color: Color(0xFF43474B)),
              ),
            ),
            const SizedBox(height: 32),

            // Family Plan (Featured)
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: const Color(0xFF1D2B36),
                borderRadius: BorderRadius.circular(12),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.1),
                    blurRadius: 10,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: const Color(0xFF006D31),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: const Text('MOST POPULAR', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.white)),
                      ),
                      const Icon(Icons.family_restroom, color: Colors.white, size: 32),
                    ],
                  ),
                  const SizedBox(height: 16),
                  const Text('Family Plan', style: TextStyle(color: Colors.white70, fontSize: 14)),
                  const SizedBox(height: 8),
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.baseline,
                    textBaseline: TextBaseline.alphabetic,
                    children: const [
                      Text('\$29', style: TextStyle(color: Colors.white, fontSize: 40, fontWeight: FontWeight.bold)),
                      Text('/month', style: TextStyle(color: Colors.white54, fontSize: 16)),
                    ],
                  ),
                  const SizedBox(height: 24),
                  _buildBenefitItem(Icons.check_circle, 'Up to 5 Family Members', Colors.white70),
                  _buildBenefitItem(Icons.check_circle, 'Unlimited Dispatches', Colors.white70),
                  _buildBenefitItem(Icons.check_circle, 'Real-time Tracking', Colors.white70),
                  const SizedBox(height: 24),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: () {},
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF006D31),
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                      ),
                      child: const Text('Start Family Plan'),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Individual Plan
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFFE0E3E5)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: const [
                      Text('Individual Plan', style: TextStyle(color: Color(0xFF43474B), fontSize: 14, fontWeight: FontWeight.bold)),
                      Icon(Icons.person, color: Color(0xFF081621), size: 32),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.baseline,
                    textBaseline: TextBaseline.alphabetic,
                    children: const [
                      Text('\$12', style: TextStyle(color: Color(0xFF081621), fontSize: 32, fontWeight: FontWeight.bold)),
                      Text('/month', style: TextStyle(color: Color(0xFF43474B), fontSize: 14)),
                    ],
                  ),
                  const SizedBox(height: 24),
                  _buildBenefitItem(Icons.check_circle, 'Unlimited Dispatches', Color(0xFF43474B)),
                  _buildBenefitItem(Icons.check_circle, 'Priority Queue', Color(0xFF43474B)),
                  const SizedBox(height: 24),
                  SizedBox(
                    width: double.infinity,
                    child: OutlinedButton(
                      onPressed: () {},
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        side: const BorderSide(color: Color(0xFF081621)),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                      ),
                      child: const Text('Select Individual', style: TextStyle(color: Color(0xFF081621))),
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

  Widget _buildBenefitItem(IconData icon, String text, Color color) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        children: [
          Icon(icon, color: const Color(0xFF006D31), size: 18),
          const SizedBox(width: 12),
          Text(text, style: TextStyle(color: color, fontSize: 14)),
        ],
      ),
    );
  }
}
