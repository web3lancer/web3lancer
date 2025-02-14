import 'package:flutter/material.dart';
import 'package:curved_navigation_bar/curved_navigation_bar.dart';
import 'dart:ui';
import '../widgets/header.dart';
import '../utils/theme.dart';
import '../services/api_service.dart';
import 'dashboard_screen.dart';
import 'package:apps/screens/projects_screen.dart';
import 'settings_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  _HomeScreenState createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final ApiService apiService = ApiService();
  int _selectedIndex = 0;
  final GlobalKey<CurvedNavigationBarState> _bottomNavigationKey = GlobalKey();

  static const List<Widget> _screens = <Widget>[
    DashboardScreen(),
    ProjectsScreen(),
    SettingsScreen(),
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
                    NavigationRailDestination(
                        icon: Icon(Icons.settings_outlined),
                        label: Text('Settings')),
                  ],
                ),
                Expanded(child: _screens[_selectedIndex]),
              ],
            ),
          )
        : Scaffold(
            appBar: const Header(),
            body: _screens[_selectedIndex],
            bottomNavigationBar: CurvedNavigationBar(
              key: _bottomNavigationKey,
              index: 0,
              items: const <Widget>[
                Icon(Icons.dashboard_outlined, size: 30),
                Icon(Icons.work_outline, size: 30),
                Icon(Icons.settings_outlined, size: 30),
              ],
              color: Colors.white,
              buttonBackgroundColor: Colors.white,
              backgroundColor: Theme.of(context).primaryColor,
              animationCurve: Curves.easeInOut,
              animationDuration: const Duration(milliseconds: 600),
              onTap: (index) {
                setState(() {
                  _selectedIndex = index;
                });
              },
              letIndexChange: (index) => true,
            ),
          );
  }
}
