import 'package:flutter/material.dart';
import 'home_dashboard.dart';
import 'pharmacy_screen.dart';
import 'specialty_screen.dart';
import 'labs_screen.dart';
import 'emergency_screen.dart';

class MainScreen extends StatefulWidget {
  const MainScreen({super.key});

  @override
  State<MainScreen> createState() => _MainScreenState();
}

class _MainScreenState extends State<MainScreen> {
  int _currentIndex = 0;

  final List<Widget> _screens = [
    const HomeDashboard(),
    const SpecialtyScreen(),
    const PharmacyScreen(),
    const LabsScreen(),
    const EmergencyScreen(),
  ];


  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _screens[_currentIndex],
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          border: Border(top: BorderSide(color: Colors.grey.shade200)),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 10,
              offset: const Offset(0, -2),
            ),
          ],
        ),
        child: BottomNavigationBar(
          type: BottomNavigationBarType.fixed,
          currentIndex: _currentIndex,
          selectedItemColor: const Color(0xFF1D2B36),
          unselectedItemColor: Colors.grey,
          onTap: (index) {
            setState(() {
              _currentIndex = index;
            });
          },
          items: const [
            BottomNavigationBarItem(icon: Icon(Icons.home), label: 'Home'),
            BottomNavigationBarItem(icon: Icon(Icons.calendar_today), label: 'Booking'),
            BottomNavigationBarItem(icon: Icon(Icons.medical_services), label: 'Pharmacy'),
            BottomNavigationBarItem(icon: Icon(Icons.biotech), label: 'Labs'),
            BottomNavigationBarItem(icon: Icon(Icons.emergency), label: 'Emergency'),
          ],
        ),
      ),
    );
  }
}
