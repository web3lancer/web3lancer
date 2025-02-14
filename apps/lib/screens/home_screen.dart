import 'package:flutter/material.dart';
import '../widgets/header.dart';
import '../widgets/sidebar.dart';
import '../utils/theme.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const Header(),
      drawer: const Sidebar(),
      body: const Center(
        child: Text('Hello Web3Lancer!'),
      ),
      backgroundColor: AppTheme.lightTheme.backgroundColor,
    );
  }
}
