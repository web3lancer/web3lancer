import 'package:flutter/material.dart';
import '../utils/theme.dart';

class Header extends StatelessWidget implements PreferredSizeWidget {
  const Header({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return AppBar(
      title: Row(
        children: [
          ClipRRect(
            borderRadius: BorderRadius.circular(4),
            child: Image.asset(
              'assets/web3lancer.jpg',
              width: 40,
              height: 40,
              fit: BoxFit.cover,
            ),
          ),
          const SizedBox(width: 10),
          const Text('Web3Lancer'),
        ],
      ),
      actions: [
        TextButton(
          onPressed: () {
            // Handle sign in
          },
          child: const Text(
            'Sign In',
            style: TextStyle(color: Colors.white),
          ),
        ),
        IconButton(
          icon: const Icon(Icons.account_circle),
          onPressed: () {
            // Handle profile
          },
        ),
      ],
      backgroundColor: AppTheme.lightTheme.primaryColor,
    );
  }

  @override
  Size get preferredSize => const Size.fromHeight(kToolbarHeight);
}
