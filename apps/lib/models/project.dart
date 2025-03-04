import 'package:flutter/material.dart';
import 'user.dart';

enum ProjectStatus {
  open,
  inProgress,
  underReview,
  completed,
  cancelled,
  disputed,
}

extension ProjectStatusExtension on ProjectStatus {
  String get name {
    switch (this) {
      case ProjectStatus.open:
        return 'Open';
      case ProjectStatus.inProgress:
        return 'In Progress';
      case ProjectStatus.underReview:
        return 'Under Review';
      case ProjectStatus.completed:
        return 'Completed';
      case ProjectStatus.cancelled:
        return 'Cancelled';
      case ProjectStatus.disputed:
        return 'Disputed';
    }
  }

  Color get color {
    switch (this) {
      case ProjectStatus.open:
        return Colors.blue;
      case ProjectStatus.inProgress:
        return Colors.orange;
      case ProjectStatus.underReview:
        return Colors.purple;
      case ProjectStatus.completed:
        return Colors.green;
      case ProjectStatus.cancelled:
        return Colors.red;
      case ProjectStatus.disputed:
        return Colors.deepOrange;
    }
  }
}

class Milestone {
  final String id;
  final String title;
  final String description;
  final double amount;
  final String tokenType;
  final DateTime deadline;
  final bool isCompleted;
  final bool isPaid;
  final String? escrowId;
  final DateTime createdAt;

  Milestone({
    required this.id,
    required this.title,
    required this.description,
    required this.amount,
    required this.tokenType,
    required this.deadline,
    this.isCompleted = false,
    this.isPaid = false,
    this.escrowId,
    required this.createdAt,
  });

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'amount': amount,
      'tokenType': tokenType,
      'deadline': deadline.toIso8601String(),
      'isCompleted': isCompleted,
      'isPaid': isPaid,
      'escrowId': escrowId,
      'createdAt': createdAt.toIso8601String(),
    };
  }

  factory Milestone.fromJson(Map<String, dynamic> json) {
    return Milestone(
      id: json['id'],
      title: json['title'],
      description: json['description'],
      amount: json['amount'].toDouble(),
      tokenType: json['tokenType'],
      deadline: DateTime.parse(json['deadline']),
      isCompleted: json['isCompleted'] ?? false,
      isPaid: json['isPaid'] ?? false,
      escrowId: json['escrowId'],
      createdAt: DateTime.parse(json['createdAt']),
    );
  }
}

class Proposal {
  final String id;
  final String projectId;
  final User freelancer;
  final String coverLetter;
  final double bidAmount;
  final String tokenType;
  final int estimatedDays;
  final bool isAccepted;
  final List<Milestone> milestones;
  final DateTime createdAt;

  Proposal({
    required this.id,
    required this.projectId,
    required this.freelancer,
    required this.coverLetter,
    required this.bidAmount,
    required this.tokenType,
    required this.estimatedDays,
    this.isAccepted = false,
    this.milestones = const [],
    required this.createdAt,
  });

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'projectId': projectId,
      'freelancerId': freelancer.id,
      'coverLetter': coverLetter,
      'bidAmount': bidAmount,
      'tokenType': tokenType,
      'estimatedDays': estimatedDays,
      'isAccepted': isAccepted,
      'milestones': milestones.map((m) => m.toJson()).toList(),
      'createdAt': createdAt.toIso8601String(),
    };
  }

  factory Proposal.fromJson(Map<String, dynamic> json, User freelancer) {
    return Proposal(
      id: json['id'],
      projectId: json['projectId'],
      freelancer: freelancer,
      coverLetter: json['coverLetter'],
      bidAmount: json['bidAmount'].toDouble(),
      tokenType: json['tokenType'],
      estimatedDays: json['estimatedDays'],
      isAccepted: json['isAccepted'] ?? false,
      milestones:
          (json['milestones'] as List?)
              ?.map((m) => Milestone.fromJson(m))
              .toList() ??
          [],
      createdAt: DateTime.parse(json['createdAt']),
    );
  }
}

class Project {
  final String id;
  final String title;
  final String description;
  final List<String> skills;
  final String category;
  final User client;
  final double budget;
  final String tokenType;
  final DateTime deadline;
  final ProjectStatus status;
  final int requiredWitnesses;
  final List<Proposal> proposals;
  final String? acceptedProposalId;
  final List<Milestone> milestones;
  final DateTime createdAt;

  Project({
    required this.id,
    required this.title,
    required this.description,
    required this.skills,
    required this.category,
    required this.client,
    required this.budget,
    required this.tokenType,
    required this.deadline,
    this.status = ProjectStatus.open,
    this.requiredWitnesses = 3,
    this.proposals = const [],
    this.acceptedProposalId,
    this.milestones = const [],
    required this.createdAt,
  });

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'skills': skills,
      'category': category,
      'clientId': client.id,
      'budget': budget,
      'tokenType': tokenType,
      'deadline': deadline.toIso8601String(),
      'status': status.index,
      'requiredWitnesses': requiredWitnesses,
      'acceptedProposalId': acceptedProposalId,
      'milestones': milestones.map((m) => m.toJson()).toList(),
      'createdAt': createdAt.toIso8601String(),
    };
  }

  factory Project.fromJson(
    Map<String, dynamic> json,
    User client,
    List<Proposal> proposals,
  ) {
    return Project(
      id: json['id'],
      title: json['title'],
      description: json['description'],
      skills: List<String>.from(json['skills']),
      category: json['category'],
      client: client,
      budget: json['budget'].toDouble(),
      tokenType: json['tokenType'],
      deadline: DateTime.parse(json['deadline']),
      status: ProjectStatus.values[json['status']],
      requiredWitnesses: json['requiredWitnesses'] ?? 3,
      proposals: proposals,
      acceptedProposalId: json['acceptedProposalId'],
      milestones:
          (json['milestones'] as List?)
              ?.map((m) => Milestone.fromJson(m))
              .toList() ??
          [],
      createdAt: DateTime.parse(json['createdAt']),
    );
  }

  bool get isCompleted => status == ProjectStatus.completed;
  bool get isDisputed => status == ProjectStatus.disputed;
  bool get isActive =>
      status == ProjectStatus.inProgress || status == ProjectStatus.underReview;
  bool get canBid => status == ProjectStatus.open;

  double get completionPercentage {
    if (milestones.isEmpty) return 0;
    final completedMilestones = milestones.where((m) => m.isCompleted).length;
    return completedMilestones / milestones.length * 100;
  }
}
