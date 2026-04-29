import 'package:flutter/material.dart';

class BookingConfirmedScreen extends StatelessWidget {
  const BookingConfirmedScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF7F9FB),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 48),
          child: Column(
            children: [
              // Success Icon
              Container(
                width: 96,
                height: 96,
                decoration: BoxDecoration(
                  color: const Color(0xFF5EFC8D),
                  shape: BoxShape.circle,
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.05),
                      blurRadius: 4,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: const Icon(Icons.check_circle, color: Color(0xFF007233), size: 48),
              ),
              const SizedBox(height: 24),
              const Text(
                'Appointment Confirmed',
                style: TextStyle(fontSize: 32, fontWeight: FontWeight.bold, color: Color(0xFF081621), letterSpacing: -0.5),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 8),
              const Text(
                'Your appointment has been successfully scheduled. A confirmation email and calendar invite have been sent.',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 16, color: Color(0xFF43474B), height: 1.5),
              ),
              const SizedBox(height: 48),

              // Summary Card
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: const Color(0xFFC4C7CB)),
                ),
                child: Column(
                  children: [
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Container(
                          width: 64,
                          height: 64,
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(8),
                            image: const DecorationImage(
                              image: NetworkImage('https://lh3.googleusercontent.com/aida-public/AB6AXuAfw1Rl2rVXsj3j5JgXiymiPTA9iImbse0PQE_0gM54TZgS_E9CKWX3gwPIKubYpCeQJTe1sZX3md0pgkGeMMXd9hZgvSbYK89cE4VyBHl18vXlNEXqtxTQ8OU-kij9ckJbOq9pnymT8J911q-Vs8eCDXNentdD3djYLC-aFnsZmvPotBd8JMOx-FnQyZeFpVXGe0zJWZJW53YJjyl_1MeE-g18gHn3Aq9OfKEPewbTxHuxicbuZVg4PrtNCDwUj5krFbkqPw2cRqo'),
                              fit: BoxFit.cover,
                            ),
                          ),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: const [
                              Text('PRACTITIONER', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF43474B), letterSpacing: 1.5)),
                              SizedBox(height: 4),
                              Text('Dr. Jonathan Aris', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Color(0xFF081621))),
                              SizedBox(height: 2),
                              Text('Senior Cardiologist', style: TextStyle(fontSize: 14, color: Color(0xFF43474B))),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 24),
                    const Divider(color: Color(0xFFE6E8EA)),
                    const SizedBox(height: 24),
                    Row(
                      children: [
                        _buildInfoItem(Icons.calendar_today, 'Date', 'Tuesday, Oct 24'),
                        const SizedBox(width: 24),
                        _buildInfoItem(Icons.schedule, 'Time', '10:30 AM'),
                      ],
                    ),
                    const SizedBox(height: 24),
                    _buildInfoItem(Icons.location_on, 'Location', 'Central Medical Plaza, Suite 402'),
                  ],
                ),
              ),
              const SizedBox(height: 48),

              // Actions
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: () {},
                  icon: const Icon(Icons.event_available, color: Colors.white),
                  label: const Text('Add to Calendar', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF081621),
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              SizedBox(
                width: double.infinity,
                child: OutlinedButton.icon(
                  onPressed: () {
                    Navigator.popUntil(context, (route) => route.isFirst);
                  },
                  icon: const Icon(Icons.home, color: Color(0xFF081621)),
                  label: const Text('Back to Home', style: TextStyle(color: Color(0xFF081621), fontWeight: FontWeight.bold)),
                  style: OutlinedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    side: const BorderSide(color: Color(0xFFC4C7CB)),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildInfoItem(IconData icon, String label, String value) {
    return Expanded(
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: const Color(0xFFECEEF0),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(icon, color: const Color(0xFF081621), size: 20),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label, style: const TextStyle(fontSize: 10, color: Color(0xFF43474B))),
                const SizedBox(height: 2),
                Text(value, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Color(0xFF081621))),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
