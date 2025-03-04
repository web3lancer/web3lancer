enum EscrowStatus { pending, active, completed, disputed, released, cancelled }

extension EscrowStatusExtension on EscrowStatus {
  String get name {
    switch (this) {
      case EscrowStatus.pending:
        return 'Pending';
      case EscrowStatus.active:
        return 'Active';
      case EscrowStatus.completed:
        return 'Completed';
      case EscrowStatus.disputed:
        return 'Disputed';
      case EscrowStatus.released:
        return 'Released';
      case EscrowStatus.cancelled:
        return 'Cancelled';
    }
  }
}

class Escrow {
  final String id;
  final String projectId;
  final String milestoneId;
  final String clientId;
  final String freelancerId;
  final String tokenType;
  final double amount;
  final List<String> witnessIds;
  final List<String> witnessApprovals;
  final String milestoneDescription;
  final DateTime deadline;
  final EscrowStatus status;
  final DateTime createdAt;
  final String? transactionHash;
  final String? escrowSmartContractAddress;
  final String? disputeReason;
  final DateTime? disputedAt;
  final String? releaseTransactionHash;
  final DateTime? releasedAt;

  Escrow({
    required this.id,
    required this.projectId,
    required this.milestoneId,
    required this.clientId,
    required this.freelancerId,
    required this.tokenType,
    required this.amount,
    required this.witnessIds,
    this.witnessApprovals = const [],
    required this.milestoneDescription,
    required this.deadline,
    this.status = EscrowStatus.pending,
    required this.createdAt,
    this.transactionHash,
    this.escrowSmartContractAddress,
    this.disputeReason,
    this.disputedAt,
    this.releaseTransactionHash,
    this.releasedAt,
  });

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'projectId': projectId,
      'milestoneId': milestoneId,
      'clientId': clientId,
      'freelancerId': freelancerId,
      'tokenType': tokenType,
      'amount': amount,
      'witnessIds': witnessIds,
      'witnessApprovals': witnessApprovals,
      'milestoneDescription': milestoneDescription,
      'deadline': deadline.toIso8601String(),
      'status': status.index,
      'createdAt': createdAt.toIso8601String(),
      'transactionHash': transactionHash,
      'escrowSmartContractAddress': escrowSmartContractAddress,
      'disputeReason': disputeReason,
      'disputedAt': disputedAt?.toIso8601String(),
      'releaseTransactionHash': releaseTransactionHash,
      'releasedAt': releasedAt?.toIso8601String(),
    };
  }

  factory Escrow.fromJson(Map<String, dynamic> json) {
    return Escrow(
      id: json['id'],
      projectId: json['projectId'],
      milestoneId: json['milestoneId'],
      clientId: json['clientId'],
      freelancerId: json['freelancerId'],
      tokenType: json['tokenType'],
      amount: json['amount'].toDouble(),
      witnessIds: List<String>.from(json['witnessIds'] ?? []),
      witnessApprovals: List<String>.from(json['witnessApprovals'] ?? []),
      milestoneDescription: json['milestoneDescription'],
      deadline: DateTime.parse(json['deadline']),
      status: EscrowStatus.values[json['status']],
      createdAt: DateTime.parse(json['createdAt']),
      transactionHash: json['transactionHash'],
      escrowSmartContractAddress: json['escrowSmartContractAddress'],
      disputeReason: json['disputeReason'],
      disputedAt:
          json['disputedAt'] != null
              ? DateTime.parse(json['disputedAt'])
              : null,
      releaseTransactionHash: json['releaseTransactionHash'],
      releasedAt:
          json['releasedAt'] != null
              ? DateTime.parse(json['releasedAt'])
              : null,
    );
  }

  bool get isApproved {
    // At least 2/3 of witnesses need to approve
    final requiredApprovals = (witnessIds.length * 2 / 3).ceil();
    return witnessApprovals.length >= requiredApprovals;
  }

  double get approvalPercentage {
    if (witnessIds.isEmpty) return 0;
    return witnessApprovals.length / witnessIds.length * 100;
  }
}
