import 'package:flutter/material.dart';
import 'shopping_cart_screen.dart';

class PharmacyScreen extends StatelessWidget {
  const PharmacyScreen({super.key});

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
              backgroundImage: NetworkImage('https://lh3.googleusercontent.com/aida-public/AB6AXuCuAWVaEjfMTgzBcvO-gr0NlHdwFeU_3Z8CS2FG4WWGtx4uyKigBoaNOflxoue7HEhZdQwcEDG-mvLtiPDIv25HqPBbKsZDgorbTyUFbdUFsHzvyt9qWsLNm8yfRk3Y8hfs6pzx5s7S8ef6W9yxVOmSM6IQHtmWoCoAPOIMks0Afk4bWSc08nuAXUj1ee9XKpeK6TTyaiecWE54nhYj5z35f_XkPSMMsCPlA5OmtjQZXLciPifUqXLCFvXUhIFquQITqITUzlb2p4U'),
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
            // Search Section
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.grey.shade100),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Find your medication',
                    style: TextStyle(fontSize: 24, fontWeight: FontWeight.w600, color: Color(0xFF081621)),
                  ),
                  const SizedBox(height: 4),
                  const Text(
                    'Search thousands of products with doorstep delivery.',
                    style: TextStyle(fontSize: 16, color: Color(0xFF43474B)),
                  ),
                  const SizedBox(height: 16),
                  TextField(
                    decoration: InputDecoration(
                      prefixIcon: const Icon(Icons.search, color: Color(0xFF74777C)),
                      hintText: 'Search medicines, health products...',
                      filled: true,
                      fillColor: const Color(0xFFF2F4F6),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(8),
                        borderSide: BorderSide.none,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Upload Prescription
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: const Color(0xFF5EFC8D), // Secondary container color
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.green.withOpacity(0.1)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Icon(Icons.description, color: Color(0xFF007233), size: 40),
                  const SizedBox(height: 12),
                  const Text(
                    'Upload Prescription',
                    style: TextStyle(fontSize: 24, fontWeight: FontWeight.w600, color: Color(0xFF00210A)),
                  ),
                  const SizedBox(height: 4),
                  const Text(
                    'Order prescription-only medicines securely in seconds.',
                    style: TextStyle(fontSize: 14, color: Color(0xFF005323)),
                  ),
                  const SizedBox(height: 20),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton.icon(
                      onPressed: () {},
                      icon: const Icon(Icons.upload_file, color: Colors.white),
                      label: const Text('UPLOAD NOW', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, letterSpacing: 1.2)),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF006D31),
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 32),

            // Categories
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Shop by Category',
                  style: TextStyle(fontSize: 20, fontWeight: FontWeight.w600, color: Color(0xFF081621)),
                ),
                TextButton.icon(
                  onPressed: () {},
                  icon: const Icon(Icons.arrow_forward, size: 16, color: Color(0xFF006D31)),
                  label: const Text('View All', style: TextStyle(color: Color(0xFF006D31), fontWeight: FontWeight.w600)),
                ),
              ],
            ),
            const SizedBox(height: 16),
            GridView.count(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              crossAxisCount: 3,
              crossAxisSpacing: 12,
              mainAxisSpacing: 12,
              childAspectRatio: 0.9,
              children: [
                _buildCategoryCard('Pain Relief', Icons.medication, const Color(0xFFFFDAD6), const Color(0xFF93000A)),
                _buildCategoryCard('Vitamins', Icons.health_and_safety, const Color(0xFFD5E4F3), const Color(0xFF0F1D28)),
                _buildCategoryCard('Chronic Care', Icons.monitor_heart, const Color(0xFF65FF90), const Color(0xFF00210A)),
                _buildCategoryCard('Skin Care', Icons.face_5, const Color(0xFFFFDADB), const Color(0xFF40000F)),
                _buildCategoryCard('Baby Care', Icons.child_care, const Color(0xFFECEEF0), const Color(0xFF191C1E)),
                _buildCategoryCard('First Aid', Icons.medical_services, const Color(0xFFFFDAD6), const Color(0xFF93000A)),
              ],
            ),
            const SizedBox(height: 32),

            // Featured Products
            const Text(
              'Featured Products',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.w600, color: Color(0xFF081621)),
            ),
            const SizedBox(height: 16),
            GridView.count(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              crossAxisCount: 2,
              crossAxisSpacing: 16,
              mainAxisSpacing: 16,
              childAspectRatio: 0.7,
              children: [
                _buildProductCard(
                  'Advanced Ibuprofen',
                  '200mg, 24 count',
                  '\$12.50',
                  'https://lh3.googleusercontent.com/aida-public/AB6AXuA8I9Da3dDgNnL11qNz47tlVP-9MNH-O9WGhdYb5Nb34TGFbbtJcgAagXq1h85iAvPL4QFQKCxwhPV2Wv6IJDflFvTjckdpvDiGvoEjtSpmoknnEpjYBJ_4BiTq-enk9wQMpAHkuI-KfdSoLSrhmTwqniGOZNJMw1KQqs6ATPeC2pSUNGBYSHI9csjGPfjMCcLlqTNWA_P_xWSt2HSUBJNH6V6r97G4mHh1UoJEXuodr2bkZxLj8wkgImMLeIKogeiC_EnRpdBppJI',
                  'IN STOCK',
                ),
                _buildProductCard(
                  'Metformin HCl',
                  '500mg, 30 tablets',
                  '\$45.00',
                  'https://lh3.googleusercontent.com/aida-public/AB6AXuCOJxaM-QJYvLAx-KcUliy5eKa0ELUBEpXsmJo3tWSHeVT3E3c3URpZci6x_3GsozQnveoye4Tr7Zy68BuDfNq0uJUcoWBz-rBoh-Ro4CEmEs50oVS3K9mTJyyC0tWv4igrTzODisTGUEOdEljsLzZ0KYI-TKekMDTHIHOdnZa2itM0p3XQN1NNk1JKDCrpH-a0BHepNQBg_nq2BDhus7ct15496hH10IgwFreftnTRhsIHd3l59zJ4i2Gpjvg1jUyfiEffJIBW86I',
                  'PRESCRIPTION',
                  isPrescription: true,
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCategoryCard(String label, IconData icon, Color bgColor, Color iconColor) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey.shade100),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: bgColor,
              shape: BoxShape.circle,
            ),
            child: Icon(icon, color: iconColor),
          ),
          const SizedBox(height: 8),
          Text(label, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13, color: Color(0xFF081621))),
        ],
      ),
    );
  }

  Widget _buildProductCard(String name, String desc, String price, String imageUrl, String tag, {bool isPrescription = false}) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey.shade100),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            child: Stack(
              children: [
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(16),
                  color: const Color(0xFFF7F9FB),
                  child: Image.network(imageUrl, fit: BoxFit.contain),
                ),
                Positioned(
                  top: 8,
                  right: 8,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 4),
                    decoration: BoxDecoration(
                      color: isPrescription ? const Color(0xFFFFDAD6) : const Color(0xFF5EFC8D),
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Text(
                      tag,
                      style: TextStyle(
                        fontSize: 8,
                        fontWeight: FontWeight.bold,
                        color: isPrescription ? const Color(0xFF93000A) : const Color(0xFF007233),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(name, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14, color: Color(0xFF081621))),
                const SizedBox(height: 2),
                Text(desc, style: const TextStyle(fontSize: 11, color: Color(0xFF43474B))),
                const SizedBox(height: 12),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(price, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: Color(0xFF081621))),
                    Container(
                      padding: const EdgeInsets.all(6),
                      decoration: BoxDecoration(
                        color: const Color(0xFF1D2B36),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Icon(isPrescription ? Icons.description : Icons.add_shopping_cart, color: Colors.white, size: 18),
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
