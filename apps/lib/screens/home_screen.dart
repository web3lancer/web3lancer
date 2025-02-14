import 'package:flutter/material.dart';
import 'dart:ui';
import '../widgets/header.dart';
import '../utils/theme.dart';
import '../services/api_service.dart';
import 'dashboard_screen.dart';
import 'package:apps/screens/projects_screen.dart';

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
    // Add other screens here
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
                        label: Text('Dashboard')),
                    NavigationRailDestination(
                        icon: Icon(Icons.work_outline),
                        label: Text('Projects')),
                    // Add other destinations here
                  ],
                ),
                Expanded(child: _screens[_selectedIndex]),
              ],
            ),
          )
        : Scaffold(
            appBar: const Header(),
            body: _screens[_selectedIndex],
            bottomNavigationBar: BottomNavigationBar(
              items: const <BottomNavigationBarItem>[
                BottomNavigationBarItem(
                  icon: Icon(Icons.dashboard_outlined),
                  label: 'Dashboard',
                ),
                BottomNavigationBarItem(
                  icon: Icon(Icons.work_outline),
                  label: 'Projects',
                ),
                // Add other items here
              ],
              currentIndex: _selectedIndex,
              selectedItemColor: Theme.of(context).primaryColor,
              onTap: _onItemTapped,
            ),
          );
  }
}
