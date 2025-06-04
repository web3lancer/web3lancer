export interface GraphiteReputation {
  score: number; // 0-5 scale
  level: string; // 'New', 'Fair', 'Good', 'Very Good', 'Excellent'
  isActivated: boolean;
  kycLevel: number; // 0-5 scale
  lastUpdated: string;
}

export interface TrustScore {
  score: number;
  level: string;
  isVerified: boolean;
  compliance: {
    activated: boolean;
    kycLevel: number;
  };
}

export interface ComplianceCheck {
  canAccessPremium: boolean;
  canPostJobs: boolean;
  canReceivePayments: boolean;
  minimumTrustMet: boolean;
  kycVerified: boolean;
}

export interface KYCRequest {
  uuid: string;
  level: number;
  status: 'pending' | 'approved' | 'rejected';
  fee: string;
  submittedAt: string;
}

export interface GraphiteConfig {
  nodeUrl: string;
  privateKey?: string;
  filterLevel?: number;
}

export type ReputationLevel = 'New' | 'Poor' | 'Fair' | 'Good' | 'Very Good' | 'Excellent';

export interface ReputationBadgeProps {
  score: number;
  level: string;
  isVerified: boolean;
  kycLevel: number;
  size?: 'small' | 'medium';
  showDetails?: boolean;
}
