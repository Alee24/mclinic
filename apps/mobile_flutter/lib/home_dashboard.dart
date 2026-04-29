import 'package:flutter/material.dart';

class HomeDashboard extends StatelessWidget {
  const HomeDashboard({super.key});

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
              backgroundImage: NetworkImage('https://lh3.googleusercontent.com/aida-public/AB6AXuDSlkxs0DGwwohkj1cSPwiZ3xImbtLHFiHiXMC5RkIQdjG1_oDK6l5rDyesBPBPwKcsTN6uIvhyNvDDUnsybv8Zaza6ttHHpGmY3Lw7I7GW_es1sjisKv8U7JCK7bMNelGmv0wPRcu5bFiGrdgDqMcyYLox3TCZBx5J5p6GzEPRlUq7FKfACXg5fnAnTdYlHi3Bwsilmnrn_BI-YskdRX7hfMZz1IvxeD3qoQZylvNrl7UJwyVosfS7oJspim3NejG5dj5shUfaVy4'),
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
            // Hero Section
            Row(
              crossAxisAlignment: CrossAxisAlignment.end,
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: const [
                      Text(
                        'Hello, Alex Johnson',
                        style: TextStyle(
                          fontSize: 28,
                          fontWeight: FontWeight.w700,
                          color: Color(0xFF081621),
                        ),
                      ),
                      SizedBox(height: 4),
                      Text(
                        'Stay on top of your health journey today.',
                        style: TextStyle(
                          fontSize: 16,
                          color: Color(0xFF43474B),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 16),
                ElevatedButton.icon(
                  onPressed: () {},
                  icon: const Icon(Icons.emergency, color: Colors.white),
                  label: const Text('Emergency SOS', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFFC2003F),
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 32),

            // Quick Access Grid
            Row(
              children: [
                Expanded(
                  flex: 2,
                  child: Container(
                    height: 180,
                    padding: const EdgeInsets.all(24),
                    decoration: BoxDecoration(
                      color: const Color(0xFF1D2B36),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Icon(Icons.medical_services, color: Colors.white, size: 32),
                        const Spacer(),
                        const Text(
                          'Book a Doctor',
                          style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w600),
                        ),
                        const SizedBox(height: 4),
                        const Text(
                          'In-person visits at top clinics',
                          style: TextStyle(color: Colors.white70, fontSize: 14),
                        ),
                        const SizedBox(height: 12),
                        ElevatedButton(
                          onPressed: () {},
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.white,
                            foregroundColor: const Color(0xFF1D2B36),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                          ),
                          child: const Text('Schedule Now', style: TextStyle(fontWeight: FontWeight.bold)),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            GridView.count(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              crossAxisCount: 2,
              crossAxisSpacing: 16,
              mainAxisSpacing: 16,
              childAspectRatio: 1.5,
              children: [
                _buildActionCard('Virtual Consult', 'Connect in 10 mins', Icons.video_camera_front, const Color(0xFF006D31)),
                _buildActionCard('Order Medicine', 'Fast home delivery', Icons.medication, const Color(0xFFFF4F6E)),
                _buildActionCard('Book Lab Test', 'Home sample pickup', Icons.biotech, const Color(0xFF00609C)),
                _buildActionCard('Ambulance', 'Rapid response', Icons.airport_shuttle, const Color(0xFFBA1A1A)),
              ],
            ),
            const SizedBox(height: 32),

            // Upcoming Appointments
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Upcoming Appointments',
                  style: TextStyle(fontSize: 20, fontWeight: FontWeight.w600, color: Color(0xFF081621)),
                ),
                TextButton(
                  onPressed: () {},
                  child: const Text('View all', style: TextStyle(color: Color(0xFF006D31), fontWeight: FontWeight.w600)),
                ),
              ],
            ),
            const SizedBox(height: 16),
            _buildAppointmentCard('24', 'Oct', 'Dr. Sarah Miller', 'Cardiologist • 10:30 AM', Icons.video_camera_front),
            const SizedBox(height: 12),
            _buildAppointmentCard('28', 'Oct', 'General Health Checkup', 'Unity Care Hospital • 09:15 AM', Icons.location_on),
          ],
        ),
      ),
      bottomNavigationBar: BottomNavigationBar(
        type: BottomNavigationBarType.fixed,
        selectedItemColor: const Color(0xFF1D2B36),
        unselectedItemColor: Colors.grey,
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.home), label: 'Home'),
          BottomNavigationBarItem(icon: Icon(Icons.calendar_today), label: 'Booking'),
          BottomNavigationBarItem(icon: Icon(Icons.medical_services), label: 'Pharmacy'),
          BottomNavigationBarItem(icon: Icon(Icons.biotech), label: 'Labs'),
          BottomNavigationBarItem(icon: Icon(Icons.emergency), label: 'Emergency'),
        ],
      ),
    );
  }

  Widget _buildActionCard(String title, String subtitle, IconData icon, Color iconColor) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Icon(icon, color: iconColor, size: 32),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(title, style: const TextStyle(fontWeight: FontWeight.w600, color: Color(0xFF081621), fontSize: 14)),
              Text(subtitle, style: const TextStyle(color: Color(0xFF43474B), fontSize: 12)),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildAppointmentCard(String day, String month, String title, String subtitle, IconData actionIcon) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey.shade200),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.02),
            blurRadius: 4,
            offset: const Offset(0, 2),
          )
        ],
      ),
      child: Row(
        children: [
          Container(
            width: 60,
            height: 60,
            decoration: BoxDecoration(
              color: const Color(0xFFF2F4F6),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(day, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Color(0xFF081621))),
                Text(month.toUpperCase(), style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Color(0xFF081621))),
              ],
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: Color(0xFF081621))),
                const SizedBox(height: 4),
                Text(subtitle, style: const TextStyle(fontSize: 14, color: Color(0xFF43474B))),
              ],
            ),
          ),
          IconButton(
            onPressed: () {},
            icon: Icon(actionIcon, color: Colors.grey.shade600),
            style: IconButton.styleFrom(backgroundColor: Colors.grey.shade50),
          ),
        ],
      ),
    );
  }
}
