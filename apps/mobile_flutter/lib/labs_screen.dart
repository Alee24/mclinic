import 'package:flutter/material.dart';

class LabsScreen extends StatelessWidget {
  const LabsScreen({super.key});

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
              backgroundImage: NetworkImage('https://lh3.googleusercontent.com/aida-public/AB6AXuCbHZurUmk7MkM79AqyqJ7ROGJFomXHgpQKu6cR0drnVac0-WUhcbjmZgiEcQPIyszsPw806eAio1ySxNUpYJ10b5bwMXvIa7Z1Ru23suA2rUgQj4a9EH8DMeFwb95zCh5BZWcX22e0enT_9pW5eoq3xMuIPreY8EV83Zz4M-3vrBJbSyEm5A8R1akZowasYCXRgUQPNf5JtDvk3fDfzKY8OKWygrnAzTfNqZKG3GAf7zhk90Ga9rLkinwhgcM91PVma-eC7j00A5M'),
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
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: const Color(0xFF1D2B36),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Laboratory Services',
                    style: TextStyle(color: Colors.white, fontSize: 28, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'Book certified clinical tests with ease. Choose between home collection or lab visit.',
                    style: TextStyle(color: Colors.white70, fontSize: 16),
                  ),
                  const SizedBox(height: 24),
                  Row(
                    children: [
                      Expanded(
                        child: ElevatedButton.icon(
                          onPressed: () {},
                          icon: const Icon(Icons.home_work, size: 18),
                          label: const Text('Home Collection'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF006D31),
                            foregroundColor: Colors.white,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 32),

            // Search Bar
            TextField(
              decoration: InputDecoration(
                prefixIcon: const Icon(Icons.search, color: Color(0xFF74777C)),
                hintText: 'Search tests, packages...',
                filled: true,
                fillColor: Colors.white,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(30),
                  borderSide: const BorderSide(color: Color(0xFFE0E3E5)),
                ),
              ),
            ),
            const SizedBox(height: 32),

            // Health Packages
            const Text(
              'Comprehensive Health Packages',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.w600, color: Color(0xFF081621)),
            ),
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(20),
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
                    children: [
                      const Text(
                        'Essential Body Checkup',
                        style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Color(0xFF081621)),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: const Color(0xFFFFDAD6),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: const Text('BEST VALUE', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF93000A))),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'Includes 60+ parameters covering Heart, Kidney, Liver, and Vital Vitamins.',
                    style: TextStyle(fontSize: 14, color: Color(0xFF43474B)),
                  ),
                  const SizedBox(height: 16),
                  const Text('• CBC & Lipid Profile', style: TextStyle(fontSize: 14, color: Color(0xFF1D2B36))),
                  const Text('• Vitamin D & B12', style: TextStyle(fontSize: 14, color: Color(0xFF1D2B36))),
                  const Text('• Blood Sugar & HbA1c', style: TextStyle(fontSize: 14, color: Color(0xFF1D2B36))),
                  const SizedBox(height: 24),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('\$129.00', style: TextStyle(fontSize: 24, fontWeight: FontWeight.w900, color: Color(0xFF081621))),
                      ElevatedButton(
                        onPressed: () {},
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF081621),
                          foregroundColor: Colors.white,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                        ),
                        child: const Text('Book Now'),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 32),

            // Individual Tests
            const Text(
              'Common Individual Tests',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.w600, color: Color(0xFF081621)),
            ),
            const SizedBox(height: 16),
            ListView(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              children: [
                _buildTestItem('Full Blood Count', '\$35', Icons.bloodtype, Colors.blue),
                _buildTestItem('Lipid Profile', '\$45', Icons.favorite, Colors.green),
                _buildTestItem('COVID-19 RT-PCR', '\$60', Icons.coronavirus, Colors.red),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTestItem(String name, String price, IconData icon, Color color) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFE0E3E5)),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: color.withOpacity(0.1),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(icon, color: color),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Color(0xFF081621))),
                    Text(price, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Color(0xFF081621))),
                  ],
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    TextButton(onPressed: () {}, child: const Text('Visit Lab', style: TextStyle(fontSize: 12))),
                    const SizedBox(width: 8),
                    ElevatedButton(
                      onPressed: () {},
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF081621),
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 0),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(4)),
                      ),
                      child: const Text('Home Visit', style: TextStyle(fontSize: 12)),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
