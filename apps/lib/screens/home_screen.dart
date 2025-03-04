import 'package:flutter/material.dart';
import 'dart:ui';
import '../widgets/header.dart';
import '../widgets/bottom_nav.dart';
import '../utils/theme.dart';
import '../services/api_service.dart';
import 'dashboard_screen.dart';
import 'projects_screen.dart';
import 'wallet_screen.dart';
import 'profile_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  _HomeScreenState createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final ApiService apiService = ApiService();
  int _selectedIndex = 0;

  static const List<Widget> _screens = <Widget>[
    DashboardScreen(),
    ProjectsScreen(),
    WalletScreen(),
    ProfileScreen(),
  ];

  void _onItemTapped(int index) {
    setState(() {
      _selectedIndex = index;
    });
  }

  @override
  Widget build(BuildContext context) {
    final isDesktop = MediaQuery.of(context).size.width >= 800;
    return isDesktop
        ? Scaffold(
          appBar: const Header(),
          body: Row(
            children: [
              NavigationRail(
                selectedIndex: _selectedIndex,
                onDestinationSelected: _onItemTapped,
                labelType: NavigationRailLabelType.all,
                destinations: const [
                  NavigationRailDestination(
                    icon: Icon(Icons.dashboard_outlined),
                    label: Text('Dashboard'),
                  ),
                  NavigationRailDestination(
                    icon: Icon(Icons.work_outline),
                    label: Text('Projects'),
                  ),
                  NavigationRailDestination(
                    icon: Icon(Icons.account_balance_wallet_outlined),
                    label: Text('Wallet'),
                  ),
                  NavigationRailDestination(
                    icon: Icon(Icons.person_outline),
                    label: Text('Profile'),
                  ),
                ],
              ),
              Expanded(child: _screens[_selectedIndex]),
            ],
          ),
        )
        : Scaffold(
          appBar: const Header(),
          body: _screens[_selectedIndex],
          bottomNavigationBar: BottomNav(
            currentIndex: _selectedIndex,
            onTap: _onItemTapped,
          ),
        );
  }
}
