import 'package:flutter/material.dart';
import 'home_dashboard.dart';

class PaymentSelectionScreen extends StatelessWidget {
  const PaymentSelectionScreen({super.key});

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
              'Payment Method Selection',
              style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Color(0xFF081621)),
            ),
            const SizedBox(height: 8),
            const Text(
              'Choose your preferred method for clinical service payment.',
              style: TextStyle(fontSize: 16, color: Color(0xFF43474B)),
            ),
            const SizedBox(height: 32),

            // Insurance
            _buildPaymentOption(
              'Insurance',
              'Aetna • Policy ending in ****892',
              Icons.health_and_safety,
              const Color(0xFF5EFC8D),
              isSelected: false,
            ),
            const SizedBox(height: 16),

            // Credit Card
            _buildPaymentOption(
              'Credit Card',
              'Visa • Ending in 4242',
              Icons.credit_card,
              const Color(0xFF1D2B36),
              isSelected: true,
            ),
            const SizedBox(height: 16),

            // Apple Pay
            _buildPaymentOption(
              'Apple Pay',
              'Express clinical checkout',
              Icons.contactless,
              const Color(0xFFECEEF0),
              isSelected: false,
            ),

            const SizedBox(height: 48),
            const Divider(),
            const SizedBox(height: 24),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: const [
                Text('Lab Consultation & Shipping', style: TextStyle(color: Color(0xFF43474B), fontSize: 16)),
                Text('\$142.50', style: TextStyle(color: Color(0xFF081621), fontSize: 18, fontWeight: FontWeight.bold)),
              ],
            ),
            const SizedBox(height: 32),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () {
                  _showSuccessDialog(context);
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF081621),
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                child: const Text('Pay \$142.50', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPaymentOption(String title, String subtitle, IconData icon, Color iconBg, {bool isSelected = false}) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: isSelected ? const Color(0xFF081621) : const Color(0xFFC4C7CB), width: isSelected ? 2 : 1),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(color: iconBg, shape: BoxShape.circle),
            child: Icon(icon, color: isSelected ? Colors.white : const Color(0xFF081621), size: 24),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                Text(subtitle, style: const TextStyle(color: Color(0xFF43474B), fontSize: 12)),
              ],
            ),
          ),
          Container(
            width: 24,
            height: 24,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              border: Border.all(color: isSelected ? const Color(0xFF081621) : const Color(0xFFC4C7CB), width: 2),
            ),
            child: isSelected
                ? Center(child: Container(width: 12, height: 12, decoration: const BoxDecoration(color: Color(0xFF081621), shape: BoxShape.circle)))
                : null,
          ),
        ],
      ),
    );
  }

  void _showSuccessDialog(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => Container(
        height: MediaQuery.of(context).size.height * 0.85,
        decoration: const BoxDecoration(
          color: Color(0xFFF7F9FB),
          borderRadius: BorderRadius.vertical(top: Radius.circular(32)),
        ),
        padding: const EdgeInsets.all(24),
        child: Column(
          children: [
            const SizedBox(height: 12),
            Container(width: 40, height: 4, decoration: BoxDecoration(color: Colors.grey[300], borderRadius: BorderRadius.circular(2))),
            const SizedBox(height: 48),
            Container(
              width: 80,
              height: 80,
              decoration: const BoxDecoration(color: Color(0xFF006D31), shape: BoxShape.circle),
              child: const Icon(Icons.check, color: Colors.white, size: 48),
            ),
            const SizedBox(height: 24),
            const Text(
              'Order Placed Successfully!',
              style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold, color: Color(0xFF081621)),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            const Text(
              'Your medical request has been processed and sent to our laboratory network.',
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 16, color: Color(0xFF43474B)),
            ),
            const SizedBox(height: 48),
            Row(
              children: [
                _buildInfoCard('Order ID', '#CC-9921'),
                const SizedBox(width: 16),
                _buildInfoCard('Visit Date', 'Oct 24, 2023'),
              ],
            ),
            const SizedBox(height: 32),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFFC4C7CB)),
              ),
              child: Row(
                children: [
                  Container(
                    width: 80,
                    height: 80,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(8),
                      image: const DecorationImage(
                        image: NetworkImage('https://lh3.googleusercontent.com/aida-public/AB6AXuAE6MP_VLOi19Iin-HZIQG-Fka2h3WDnh6QL89g12tQATNJezenQRFfEXEhTx28hxL9IXU_PKZpl7lBlkcjbt0je07USMSfMC4pCTcQG3Wir9xKwmWaJbXzAY-eanVyPpORfP8Zj-d9HK-Q_YgBLZ8aIEikFURG-gJQ7xD0YqJXK1vZ6YyqvclVxH9pYDFJsKHN2qKBF8Wp2E87ie2Ld2SStOVdRDqboN9aEUDrzG64zD5MtBXQe7tfdORYPiiRgB9VKYDHGjOwzfU'),
                        fit: BoxFit.cover,
                      ),
                    ),
                  ),
                  const SizedBox(width: 16),
                  const Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Next Steps', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                        SizedBox(height: 4),
                        Text(
                          'Our lab technician will arrive at your address between 08:00 AM and 10:00 AM.',
                          style: TextStyle(fontSize: 12, color: Color(0xFF43474B)),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const Spacer(),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () {
                  Navigator.popUntil(context, (route) => route.isFirst);
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF081621),
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(30)),
                ),
                child: const Text('Back to Home', style: TextStyle(fontWeight: FontWeight.bold)),
              ),
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoCard(String label, String value) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: const Color(0xFFECEEF0),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label, style: const TextStyle(fontSize: 12, color: Color(0xFF43474B))),
            const SizedBox(height: 4),
            Text(value, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
          ],
        ),
      ),
    );
  }
}
