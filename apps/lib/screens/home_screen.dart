import 'package:flutter/material.dart';
import '../widgets/header.dart';
import '../widgets/sidebar.dart';
import '../utils/theme.dart';
import '../services/api_service.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  _HomeScreenState createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final ApiService apiService = ApiService();
  List<Map<String, dynamic>> jobs = [];

  @override
  void initState() {
    super.initState();
    fetchJobs();
  }

  Future<void> fetchJobs() async {
    try {
      final response = await apiService.databases.listDocuments(
        databaseId: '67aed8360001b6dd8cb3',
        collectionId: 'jobs',
      );
      setState(() {
        jobs = List<Map<String, dynamic>>.from(response.documents);
      });
    } catch (e) {
      print('Error fetching jobs: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const Header(),
      drawer: const Sidebar(),
      body: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Latest Jobs',
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 20),
            Expanded(
              child: ListView.builder(
                itemCount: jobs.length,
                itemBuilder: (context, index) {
                  final job = jobs[index];
                  return Card(
                    child: ListTile(
                      title: Text(job['title']),
                      subtitle: Text(job['description']),
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
      backgroundColor: AppTheme.lightTheme.colorScheme.surface,
    );
  }
}
