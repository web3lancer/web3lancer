import 'package:flutter/material.dart';
import '../utils/theme.dart';

class ProjectsScreen extends StatelessWidget {
  const ProjectsScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final projects = [
      {
        'title': 'DApp Development',
        'description':
            'Develop a decentralized application for supply chain management.',
        'status': 'In Progress',
        'dueDate': '2024-07-15'
      },
      {
        'title': 'Smart Contract Audit',
        'description': 'Audit a smart contract for security vulnerabilities.',
        'status': 'Completed',
        'dueDate': '2024-06-20'
      },
      {
        'title': 'Web3 Integration',
        'description': 'Integrate a website with Web3 technologies.',
        'status': 'Pending',
        'dueDate': '2024-08-01'
      },
    ];

    return Scaffold(
      body: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Projects',
              style: Theme.of(context).textTheme.displayMedium,
            ),
            const SizedBox(height: 24),
            Expanded(
              child: ListView.builder(
                itemCount: projects.length,
                itemBuilder: (context, index) {
                  final project = projects[index];
                  return Card(
                    elevation: 4,
                    margin: const EdgeInsets.only(bottom: 16),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Container(
                      decoration: AppTheme.glassEffect,
                      child: Padding(
                        padding: const EdgeInsets.all(16),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              project['title'] as String,
                              style: Theme.of(context).textTheme.titleLarge,
                            ),
                            const SizedBox(height: 8),
                            Text(
                              project['description'] as String,
                              style: TextStyle(color: Colors.grey[600]),
                            ),
                            const SizedBox(height: 16),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text('Status: ${project['status']}'),
                                Text('Due Date: ${project['dueDate']}'),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}
