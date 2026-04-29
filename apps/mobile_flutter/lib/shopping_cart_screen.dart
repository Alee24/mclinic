import 'package:flutter/material.dart';
import 'payment_selection_screen.dart';

class ShoppingCartScreen extends StatelessWidget {
  const ShoppingCartScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF7F9FB),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Color(0xFF191C1E)),
          onPressed: () => Navigator.pop(context),
        ),
        title: const Text(
          'Checkout',
          style: TextStyle(color: Color(0xFF191C1E), fontWeight: FontWeight.bold),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.help_outline, color: Color(0xFF191C1E)),
            onPressed: () {},
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Your Cart (2)',
              style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Color(0xFF081621)),
            ),
            const SizedBox(height: 24),

            // Cart Items
            _buildCartItem(
              'PHARMACY',
              'Advanced Ibuprofen 200mg',
              'Pack of 50 Liquid Gels',
              '\$12.50',
              'https://lh3.googleusercontent.com/aida-public/AB6AXuBCIpOJLsWaf_sL3D_yWvADncov8pYBvCs-WQq3o6e_h1JR0XeLphrUOh70YxwCsp2E5AzQ3_L90k49FDy4yTDHMgI2aEMV3SlhLe4Bx7UimKyrz1UtgM8XoDSxvzJE3OAM2po5Wbq1Cl1UABtokiu5pxAeq0dpF4aZ6uElEij1_hFZRYjRiQiv2b07SapfiyUyQdqOF25gWUdOtkHj7Wu4bc7J82vo9IhzYQOfrzJ0TipqH8ZX0bVE0PhU3QfiDws01K0uHOsmSyQ',
            ),
            _buildCartItem(
              'LABS',
              'Essential Body Checkup',
              '24 Blood Parameters Included',
              '\$129.00',
              'https://lh3.googleusercontent.com/aida-public/AB6AXuDNc5F8FHyzPhvTGG0PIJVEIF65h6_Shs_XmztmNU_7Ai5m9S3hm1Bhs1Ev2EYkg48dZgMZRttk9xavibA5gsYX97LHPGl2KdzWRbAq6wIt9ddfdOXeTThfUwibmabNxiZg-XL5bkvwOb3bMz-bPA9xgsQAlmA7JM0kUzF1OPkjA_rFxg7zEGkDvXrWRy1jOdSYwMAep7rc5bcU3CX8rtkxw2EAwFEPuzBan_u0FjLTSI8xUClE0lK0E6RxJUARubnB6SGItAaHTtk',
              isUrgent: true,
            ),

            const SizedBox(height: 32),

            // Promo Card
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: const Color(0xFF1D2B36),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Stack(
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: const [
                      Text('Member Rewards', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
                      SizedBox(height: 8),
                      Text(
                        'You are saving \$15.00 today with your Silver Membership benefits.',
                        style: TextStyle(color: Colors.white70, fontSize: 14),
                      ),
                    ],
                  ),
                  const Positioned(
                    right: -10,
                    bottom: -10,
                    child: Icon(Icons.medical_services, color: Colors.white10, size: 80),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 32),

            // Summary
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFFC4C7CB)),
              ),
              child: Column(
                children: [
                  _buildSummaryRow('Subtotal', '\$141.50'),
                  const SizedBox(height: 12),
                  _buildSummaryRow('Shipping', 'Free', isGreen: true),
                  const SizedBox(height: 12),
                  _buildSummaryRow('Tax Estimate', '\$0.00'),
                  const SizedBox(height: 16),
                  const Divider(),
                  const SizedBox(height: 16),
                  _buildSummaryRow('Total', '\$141.50', isBold: true),
                  const SizedBox(height: 32),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton.icon(
                      onPressed: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(builder: (context) => const PaymentSelectionScreen()),
                        );
                      },
                      icon: const Icon(Icons.arrow_forward, color: Colors.white),
                      label: const Text('Proceed to Checkout', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF081621),
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                      ),
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

  Widget _buildCartItem(String category, String title, String subtitle, String price, String img, {bool isUrgent = false}) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFC4C7CB)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 80,
            height: 80,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(8),
              image: DecorationImage(image: NetworkImage(img), fit: BoxFit.cover),
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Text(category, style: const TextStyle(color: Color(0xFF006D31), fontSize: 10, fontWeight: FontWeight.bold)),
                    if (isUrgent) ...[
                      const SizedBox(width: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 2),
                        decoration: BoxDecoration(color: const Color(0xFFFFDAD6), borderRadius: BorderRadius.circular(4)),
                        child: const Text('URGENT', style: TextStyle(fontSize: 8, fontWeight: FontWeight.bold, color: Color(0xFF93000A))),
                      ),
                    ],
                  ],
                ),
                const SizedBox(height: 4),
                Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Color(0xFF081621))),
                Text(subtitle, style: const TextStyle(color: Color(0xFF43474B), fontSize: 12)),
                const SizedBox(height: 12),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(price, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: Color(0xFF081621))),
                    Row(
                      children: [
                        IconButton(icon: const Icon(Icons.remove_circle_outline, size: 20), onPressed: () {}),
                        const Text('1', style: TextStyle(fontWeight: FontWeight.bold)),
                        IconButton(icon: const Icon(Icons.add_circle_outline, size: 20), onPressed: () {}),
                      ],
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

  Widget _buildSummaryRow(String label, String value, {bool isGreen = false, bool isBold = false}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: TextStyle(fontSize: isBold ? 18 : 14, fontWeight: isBold ? FontWeight.bold : FontWeight.normal)),
        Text(
          value,
          style: TextStyle(
            fontSize: isBold ? 18 : 14,
            fontWeight: FontWeight.bold,
            color: isGreen ? const Color(0xFF006D31) : const Color(0xFF081621),
          ),
        ),
      ],
    );
  }
}
