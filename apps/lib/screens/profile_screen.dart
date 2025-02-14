import 'package:flutter/material.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({Key? key}) : super(key: key);

  @override
  _ProfileScreenState createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  bool _isLoggedIn = false; // Placeholder for login status
  List<String> _walletAddresses = [];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Profile'),
        actions: [
          if (_isLoggedIn)
            TextButton(
              onPressed: () {
                // TODO: Handle logout
                setState(() {
                  _isLoggedIn = false; // Placeholder
                });
              },
              child: const Text(
                'Logout',
                style: TextStyle(color: Colors.white),
              ),
            ),
        ],
      ),
      body: _isLoggedIn ? _buildProfileView() : _buildAuthView(),
    );
  }

  Widget _buildAuthView() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Text('Please sign in or sign up to continue.'),
          ElevatedButton(
            onPressed: () {
              // TODO: Implement sign-in logic
              setState(() {
                _isLoggedIn = true; // Placeholder
              });
            },
            child: const Text('Sign In'),
          ),
          ElevatedButton(
            onPressed: () {
              // TODO: Implement sign-up logic
              setState(() {
                _isLoggedIn = true; // Placeholder
              });
            },
            child: const Text('Sign Up'),
          ),
        ],
      ),
    );
  }

  Widget _buildProfileView() {
    return SingleChildScrollView(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(
              child: Column(
                children: [
                  Stack(
                    alignment: Alignment.center,
                    children: [
                      const CircleAvatar(
                        radius: 50,
                        backgroundImage: AssetImage(
                            'assets/profile_placeholder.png'), // Placeholder image
                      ),
                      Positioned(
                        bottom: 0,
                        right: 4,
                        child: GestureDetector(
                          onTap: () {
                            // TODO: Trigger profile edit action
                          },
                          child: Container(
                            padding: const EdgeInsets.all(4),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              shape: BoxShape.circle,
                            ),
                            child: const Icon(
                              Icons.edit,
                              size: 16,
                              color: Colors.black,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  const Text(
                    'Ryan Schnetzer',
                    style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                  ),
                  const Text(
                    'ryansc@acme.co',
                    style: TextStyle(color: Colors.grey),
                  ),
                  const SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: () {
                      // TODO: Navigate to edit profile
                    },
                    child: const Text('Edit profile'),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),
            const Text(
              'Content',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            Card(
              elevation: 4,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
              child: Column(
                children: [
                  ListTile(
                    leading: const Icon(Icons.favorite),
                    title: const Text('Favorites'),
                    onTap: () {
                      // TODO: Navigate to Favorites
                    },
                  ),
                  const Divider(),
                  ListTile(
                    leading: const Icon(Icons.download),
                    title: const Text('Downloads'),
                    onTap: () {
                      // TODO: Navigate to Downloads
                    },
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),
            const Text(
              'Preferences',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            Card(
              elevation: 4,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
              child: Column(
                children: [
                  ListTile(
                    leading: const Icon(Icons.language),
                    title: const Text('Language'),
                    trailing: const Text('English'),
                    onTap: () {
                      // TODO: Navigate to Language settings
                    },
                  ),
                  const Divider(),
                  ListTile(
                    leading: const Icon(Icons.notifications),
                    title: const Text('Notifications'),
                    trailing: const Text('Enabled'),
                    onTap: () {
                      // TODO: Navigate to Notifications settings
                    },
                  ),
                  const Divider(),
                  ListTile(
                    leading: const Icon(Icons.color_lens),
                    title: const Text('Theme'),
                    trailing: const Text('Light'),
                    onTap: () {
                      // TODO: Navigate to Theme settings
                    },
                  ),
                  const Divider(),
                  SwitchListTile(
                    secondary: const Icon(Icons.play_circle_outline),
                    title: const Text('Background play'),
                    value: true,
                    onChanged: (bool value) {
                      // TODO: Handle Background play toggle
                    },
                  ),
                  const Divider(),
                  SwitchListTile(
                    secondary: const Icon(Icons.wifi),
                    title: const Text('Download via WiFi only'),
                    value: false,
                    onChanged: (bool value) {
                      // TODO: Handle Download via WiFi only toggle
                    },
                  ),
                  const Divider(),
                  SwitchListTile(
                    secondary: const Icon(Icons.autorenew),
                    title: const Text('Autoplay'),
                    value: true,
                    onChanged: (bool value) {
                      // TODO: Handle Autoplay toggle
                    },
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showAddWalletDialog() {
    String newWalletAddress = '';
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: const Text('Add Wallet Address'),
          content: TextField(
            onChanged: (value) {
              newWalletAddress = value;
            },
            decoration: const InputDecoration(hintText: 'Enter wallet address'),
          ),
          actions: [
            TextButton(
              child: const Text('Cancel'),
              onPressed: () {
                Navigator.of(context).pop();
              },
            ),
            TextButton(
              child: const Text('Add'),
              onPressed: () {
                setState(() {
                  _walletAddresses.add(newWalletAddress);
                });
                Navigator.of(context).pop();
              },
            ),
          ],
        );
      },
    );
  }
}
