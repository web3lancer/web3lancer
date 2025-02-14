import 'package:flutter/material.dart';
import 'dart:ui';
import '../utils/theme.dart';

class Sidebar extends StatelessWidget {
  const Sidebar({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Theme.of(context).primaryColor.withOpacity(0.85),
      ),
      child: ClipRRect(
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
          child: Drawer(
            backgroundColor: Colors.transparent,
            elevation: 0,
            child: Column(
              children: [
                const SizedBox(height: kToolbarHeight + 16),
                Expanded(
                  child: ListView(
                    padding: EdgeInsets.zero,
                    children: [
                      _buildMenuItem(
                        context: context,
                        icon: Icons.dashboard_outlined,
                        title: 'Dashboard',
                        isActive: true,
                      ),
                      _buildMenuItem(
                        context: context,
                        icon: Icons.work_outline,
                        title: 'Projects',
                      ),
                      _buildMenuItem(
                        context: context,
                        icon: Icons.event_note_outlined,
                        title: 'Planning',
                      ),
                      _buildMenuItem(
                        context: context,
                        icon: Icons.calendar_today_outlined,
                        title: 'Calendar',
                      ),
                      _buildMenuItem(
                        context: context,
                        icon: Icons.store_outlined,
                        title: 'Marketplace',
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildMenuItem({
    required BuildContext context,
    required IconData icon,
    required String title,
    bool isActive = false,
  }) {
    return TweenAnimationBuilder<double>(
      duration: const Duration(milliseconds: 200),
      tween: Tween<double>(begin: 0, end: 1),
      builder: (context, value, child) {
        return Transform.translate(
          offset: Offset(value * 0, 0),
          child: child,
        );
      },
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(12),
          color: isActive ? Colors.white.withOpacity(0.1) : Colors.transparent,
        ),
        child: ListTile(
          leading: Icon(
            icon,
            color: Colors.white.withOpacity(isActive ? 1 : 0.7),
          ),
          title: Text(
            title,
            style: TextStyle(
              color: Colors.white.withOpacity(isActive ? 1 : 0.7),
              fontWeight: isActive ? FontWeight.w600 : FontWeight.normal,
            ),
          ),
          onTap: () {
            // Handle navigation
          },
          contentPadding: const EdgeInsets.symmetric(
            horizontal: 16,
            vertical: 4,
          ),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
        ),
      ),
    );
  }
}
