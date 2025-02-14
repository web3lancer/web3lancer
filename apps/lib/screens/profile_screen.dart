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
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Wallet Addresses',
            style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 16),
          ..._walletAddresses.map((address) => Text(address)),
          const SizedBox(height: 16),
          ElevatedButton(
            onPressed: () {
              _showAddWalletDialog();
            },
            child: const Text('Add Wallet Address'),
          ),
          const SizedBox(height: 24),
          const Text(
            'Settings',
            style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
          ),
          // TODO: Add settings options
        ],
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
