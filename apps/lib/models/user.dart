class UserWallet {
  final String address;
  final String blockchainType;
  final bool isVerified;

  UserWallet({
    required this.address,
    required this.blockchainType,
    this.isVerified = false,
  });

  Map<String, dynamic> toJson() {
    return {
      'address': address,
      'blockchainType': blockchainType,
      'isVerified': isVerified,
    };
  }

  factory UserWallet.fromJson(Map<String, dynamic> json) {
    return UserWallet(
      address: json['address'],
      blockchainType: json['blockchainType'],
      isVerified: json['isVerified'] ?? false,
    );
  }
}

class UserReview {
  final String id;
  final String reviewerId;
  final String reviewerName;
  final double rating;
  final String comment;
  final DateTime createdAt;

  UserReview({
    required this.id,
    required this.reviewerId,
    required this.reviewerName,
    required this.rating,
    required this.comment,
    required this.createdAt,
  });

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'reviewerId': reviewerId,
      'reviewerName': reviewerName,
      'rating': rating,
      'comment': comment,
      'createdAt': createdAt.toIso8601String(),
    };
  }

  factory UserReview.fromJson(Map<String, dynamic> json) {
    return UserReview(
      id: json['id'],
      reviewerId: json['reviewerId'],
      reviewerName: json['reviewerName'],
      rating: json['rating'].toDouble(),
      comment: json['comment'],
      createdAt: DateTime.parse(json['createdAt']),
    );
  }
}

class User {
  final String id;
  final String name;
  final String email;
  final String profileImageUrl;
  final String bio;
  final List<String> skills;
  final List<UserWallet> wallets;
  final List<UserReview> reviews;
  final int completedProjects;
  final int ongoingProjects;
  final int reputation;
  final double averageRating;
  final DateTime createdAt;
  final DateTime lastActive;
  final bool isOnline;
  final bool isVerified;
  final bool kycVerified;

  User({
    required this.id,
    required this.name,
    required this.email,
    this.profileImageUrl = '',
    this.bio = '',
    this.skills = const [],
    this.wallets = const [],
    this.reviews = const [],
    this.completedProjects = 0,
    this.ongoingProjects = 0,
    this.reputation = 0,
    this.averageRating = 0.0,
    required this.createdAt,
    required this.lastActive,
    this.isOnline = false,
    this.isVerified = false,
    this.kycVerified = false,
  });

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'email': email,
      'profileImageUrl': profileImageUrl,
      'bio': bio,
      'skills': skills,
      'wallets': wallets.map((wallet) => wallet.toJson()).toList(),
      'reviews': reviews.map((review) => review.toJson()).toList(),
      'completedProjects': completedProjects,
      'ongoingProjects': ongoingProjects,
      'reputation': reputation,
      'averageRating': averageRating,
      'createdAt': createdAt.toIso8601String(),
      'lastActive': lastActive.toIso8601String(),
      'isOnline': isOnline,
      'isVerified': isVerified,
      'kycVerified': kycVerified,
    };
  }

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'],
      name: json['name'],
      email: json['email'],
      profileImageUrl: json['profileImageUrl'] ?? '',
      bio: json['bio'] ?? '',
      skills: List<String>.from(json['skills'] ?? []),
      wallets:
          (json['wallets'] as List?)
              ?.map((wallet) => UserWallet.fromJson(wallet))
              .toList() ??
          [],
      reviews:
          (json['reviews'] as List?)
              ?.map((review) => UserReview.fromJson(review))
              .toList() ??
          [],
      completedProjects: json['completedProjects'] ?? 0,
      ongoingProjects: json['ongoingProjects'] ?? 0,
      reputation: json['reputation'] ?? 0,
      averageRating: json['averageRating']?.toDouble() ?? 0.0,
      createdAt: DateTime.parse(json['createdAt']),
      lastActive: DateTime.parse(json['lastActive']),
      isOnline: json['isOnline'] ?? false,
      isVerified: json['isVerified'] ?? false,
      kycVerified: json['kycVerified'] ?? false,
    );
  }

  String get reputationLevel {
    if (reputation >= 500) return 'Master';
    if (reputation >= 200) return 'Expert';
    if (reputation >= 100) return 'Advanced';
    if (reputation >= 50) return 'Intermediate';
    if (reputation >= 10) return 'Beginner';
    return 'New';
  }

  int get requiredWitnesses {
    // New users require more witnesses, experienced users require fewer
    if (reputation >= 200) return 3; // Minimum witnesses for experts
    if (reputation >= 100) return 4;
    if (reputation >= 50) return 5;
    return 7; // Maximum witnesses for new users
  }
}
