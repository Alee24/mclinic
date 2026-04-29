import 'package:flutter/material.dart';

class RecordsScreen extends StatelessWidget {
  const RecordsScreen({super.key});

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
              backgroundImage: NetworkImage('https://lh3.googleusercontent.com/aida-public/AB6AXuBh4xZqEhx99dwM3P0amNEnbq65j2rPVSmMzW54xAAGHNoGJ5d-vXxm5izVeF42OJEqgwKJC-lUBPVfjyDODVEMhJIVMNkzFZj7C0TGiTe1BiX1rJpv8uRi5J2iWa18tuRXN8XZy0MhG-hG5wnYC7BtShp9U7_5U09FCPAjVgDFAhjQLFfYQsYP1Mw01O0uKQPaQqZ58HtPDJ3O9jkghl44u9uYFweuuEDK2RoaszfkVQt4ihkK88FF9Kbh99-TOkr25Ybd9eF_M'),
            ),
            const SizedBox(width: 12),
            const Text(
              'Medic Dashboard',
              style: TextStyle(
                color: Color(0xFF1D2B36),
                fontSize: 20,
                fontWeight: FontWeight.bold,
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
            const Text(
              'Patient Records',
              style: TextStyle(fontSize: 32, fontWeight: FontWeight.bold, color: Color(0xFF081621)),
            ),
            const SizedBox(height: 8),
            const Text(
              'Manage and access patient health history.',
              style: TextStyle(fontSize: 16, color: Color(0xFF43474B)),
            ),
            const SizedBox(height: 24),
            TextField(
              decoration: InputDecoration(
                prefixIcon: const Icon(Icons.search, color: Color(0xFF74777C)),
                hintText: 'Search patients...',
                filled: true,
                fillColor: Colors.white,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: Color(0xFFC4C7CB)),
                ),
              ),
            ),
            const SizedBox(height: 32),

            const Text(
              'Recent Files',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Color(0xFF081621)),
            ),
            const SizedBox(height: 16),
            _buildFileItem('Blood_Test_Results.pdf', '2 hours ago • Sarah Miller', Icons.picture_as_pdf, Colors.red),
            _buildFileItem('X-Ray_Chest_Scan.img', '5 hours ago • James Wilson', Icons.image, Colors.green),
            _buildFileItem('Prescription_Refill.docx', 'Yesterday • Elena Rodriguez', Icons.description, Colors.blue),

            const SizedBox(height: 32),
            const Text(
              'Active Patients',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Color(0xFF081621)),
            ),
            const SizedBox(height: 16),
            _buildPatientCard('Sarah Miller', '#MED-92841', '68', 'Stable', 'Oct 24, 2023', 'Cardiology', 'https://lh3.googleusercontent.com/aida-public/AB6AXuCLF3JK019arZPPjcT_LPIzMzl4XDwm3Mnu0d7AmWTT0_Te5qyr-t3tHdylxgTaivrEJZC_lLRElo0DxbP18JxfePe7fQLKsnaDlWUtUttIKXN1pu8FMnQaJhBTbtwHQhsbQUkhPCr9dV9Xz625eoI21EURweeWkC8Y_Fg2_e5K0zRJ4g5xBcD1euQTLRwrC0L1d03j4T4MHzjHQjfsy4_drOcfFBa9s9QSnEbOFDmUq-ECaQ9hhG_GwCuHOrU_RBllNOh-Sg-U49M'),
            _buildPatientCard('James Wilson', '#MED-11023', '45', 'Urgent', 'Oct 26, 2023', 'Pulmonology', 'https://lh3.googleusercontent.com/aida-public/AB6AXuAKHcvu7OqCAuws3BIIqnXqlAGEiMXaA6wcRBrlp5HunXQADEwvRdVyCY3sPs0ArfT7vk8jjDBeEDxkA8TfNGta23zkHrIIabz6_nmbn3T7ykrAIE7Oe2F7jxUtqMry8IghYt70n3VMoD5tqIzvlrxaAdUtxSgBPqhFDkS3TGg13D6oxpvfAlOe6g3Y7z3mOV0wf3XhWBkH7xCPEuHmVmN04RDXgj5BaI4ERoL1eI1tvg3uihKGaavHT7rXatdoQ5HCcnh7PD_Qzzo'),
          ],
        ),
      ),
    );
  }

  Widget _buildFileItem(String name, String meta, IconData icon, Color color) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFC4C7CB)),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(color: color.withOpacity(0.1), borderRadius: BorderRadius.circular(8)),
            child: Icon(icon, color: color, size: 24),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                Text(meta, style: const TextStyle(color: Color(0xFF43474B), fontSize: 12)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPatientCard(String name, String id, String age, String status, String lastVisit, String dept, String img) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFC4C7CB)),
      ),
      child: Column(
        children: [
          Row(
            children: [
              CircleAvatar(radius: 24, backgroundImage: NetworkImage(img)),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
                    Text('ID: $id • Age: $age', style: const TextStyle(color: Color(0xFF43474B), fontSize: 12)),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: status == 'Urgent' ? const Color(0xFFFFDAD6) : const Color(0xFFD5E4F3),
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Text(status, style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: status == 'Urgent' ? const Color(0xFF93000A) : const Color(0xFF0F1D28))),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  const Icon(Icons.calendar_today, size: 14, color: Color(0xFF43474B)),
                  const SizedBox(width: 4),
                  Text(lastVisit, style: const TextStyle(fontSize: 12, color: Color(0xFF43474B))),
                ],
              ),
              Row(
                children: [
                  const Icon(Icons.medical_services, size: 14, color: Color(0xFF43474B)),
                  const SizedBox(width: 4),
                  Text(dept, style: const TextStyle(fontSize: 12, color: Color(0xFF43474B))),
                ],
              ),
            ],
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: OutlinedButton(
                  onPressed: () {},
                  style: OutlinedButton.styleFrom(shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8))),
                  child: const Text('Files'),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: ElevatedButton(
                  onPressed: () {},
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF081621),
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  ),
                  child: const Text('View Detail'),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
