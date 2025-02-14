import 'package:flutter/material.dart';
import '../utils/theme.dart';
import 'profile_screen.dart'; // Added import for ProfileScreen

class SettingsScreen extends StatelessWidget {
  const SettingsScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Settings'),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(50),
          child: Center(
            child: TextButton.icon(
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const ProfileScreen()),
                );
              },
              icon: const Icon(Icons.edit, color: Colors.white),
              label: const Text(
                'Edit Profile',
                style: TextStyle(color: Colors.white),
              ),
            ),
          ),
        ),
      ),
      body: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 16),
            Card(
              elevation: 4,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
              child: Column(
                children: [
                  ListTile(
                    leading: const Icon(Icons.store),
                    title: const Text('My stores'),
                    trailing: Chip(
                      label: Text('2'),
                      backgroundColor: Theme.of(context).primaryColorLight,
                    ),
                    onTap: () {
                      // TODO: Navigate to My stores
                    },
                  ),
                  const Divider(),
                  ListTile(
                    leading: const Icon(Icons.support),
                    title: const Text('Support'),
                    onTap: () {
                      // TODO: Navigate to Support
                    },
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),
            Card(
              elevation: 4,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
              child: Column(
                children: [
                  SwitchListTile(
                    secondary: const Icon(Icons.notifications),
                    title: const Text('Push notifications'),
                    value: true,
                    onChanged: (bool value) {
                      // TODO: Handle push notifications toggle
                    },
                  ),
                  const Divider(),
                  SwitchListTile(
                    secondary: const Icon(Icons.face),
                    title: const Text('Face ID'),
                    value: true,
                    onChanged: (bool value) {
                      // TODO: Handle Face ID toggle
                    },
                  ),
                  const Divider(),
                  SwitchListTile(
                    secondary: const Icon(Icons.lock),
                    title: const Text('PIN Code'),
                    value: true,
                    onChanged: (bool value) {
                      // TODO: Handle PIN Code toggle
                    },
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),
            Center(
              child: ElevatedButton(
                onPressed: () {
                  // TODO: Handle logout
                },
                child: const Text('Logout'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
