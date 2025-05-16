// filepath: /home/nathfavour/Documents/code/web3lancer/web3lancer/src/types/jobs.ts

// Corresponds to JobsDB/job_postings
export interface JobPosting {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  title: string;
  description: string;
  clientId: string; // UserProfile.$id of job poster
  category: string;
  subCategory?: string;
  skills: string[];
  budget: {
    min?: number;
    max?: number;
    fixed?: number;
    hourly?: number;
    currency: string;
  };
  duration?: {
    type: 'hourly' | 'fixed' | 'ongoing';
    estimateHours?: number;
    estimateDays?: number;
  };
  status: 'draft' | 'active' | 'filled' | 'completed' | 'canceled' | 'expired';
  visibility: 'public' | 'private' | 'invite_only';
  location?: {
    type: 'remote' | 'onsite' | 'hybrid';
    country?: string;
    city?: string;
  };
  experience: 'entry' | 'intermediate' | 'expert';
  attachmentFileIds?: string[]; // Storage File IDs
  invitedFreelancerIds?: string[]; // UserProfile.$id array (if visibility is 'invite_only')
  applicantCount: number;
  viewCount: number;
  deadline?: string; // ISO Date string
  startDate?: string; // ISO Date string
  contractTerms?: string;
  escrowRequired?: boolean;
  isPriority?: boolean; // Featured/promoted job
  expiresAt?: string; // ISO Date string
}

// Corresponds to JobsDB/job_proposals
export interface JobProposal {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  jobId: string; // JobPosting.$id
  freelancerId: string; // UserProfile.$id
  coverLetter: string;
  bid: {
    amount: number;
    currency: string;
    type: 'hourly' | 'fixed' | 'milestone';
  };
  estimatedDuration?: {
    hours?: number;
    days?: number;
  };
  milestones?: {
    title: string;
    description: string;
    amount: number;
    dueDate?: string; // ISO Date string
  }[];
  status: 'draft' | 'submitted' | 'under_review' | 'accepted' | 'rejected' | 'withdrawn';
  attachmentFileIds?: string[]; // Storage File IDs
  questions?: {
    question: string;
    answer: string;
  }[];
  clientFeedback?: string;
  screeningAnswers?: {
    question: string;
    answer: string;
  }[];
  isHidden?: boolean; // For deleted proposals that need to be preserved in DB
}

// Corresponds to JobsDB/job_contracts
export interface JobContract {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  jobId: string; // JobPosting.$id
  proposalId?: string; // JobProposal.$id (if contract created from proposal)
  clientId: string; // UserProfile.$id
  freelancerId: string; // UserProfile.$id
  title: string;
  description: string;
  terms: string;
  type: 'fixed' | 'hourly' | 'milestone';
  status: 'draft' | 'pending' | 'active' | 'completed' | 'canceled' | 'disputed';
  startDate: string; // ISO Date string
  endDate?: string; // ISO Date string
  paymentDetails: {
    currency: string;
    amount?: number; // For fixed price contracts
    hourlyRate?: number; // For hourly contracts
    maxHours?: number; // For hourly contracts
    escrowId?: string; // ID of escrow transaction
  };
  attachmentFileIds?: string[]; // Storage File IDs
  milestoneIds?: string[]; // Array of ContractMilestone.$id
  clientSignedAt?: string; // ISO Date string
  freelancerSignedAt?: string; // ISO Date string
  completedAt?: string; // ISO Date string
  canceledAt?: string; // ISO Date string
  cancelReason?: string;
  feedback?: {
    clientToFreelancer?: string;
    freelancerToClient?: string;
  };
  reviews?: {
    clientReviewId?: string; // UserReview.$id
    freelancerReviewId?: string; // UserReview.$id
  };
  // New fields for tracking
  lastUpdatedById: string; // UserProfile.$id of the user who last updated the contract
  activityLog?: {
    timestamp: string; // ISO Date string
    userId: string; // UserProfile.$id
    action: string;
    details?: string;
  }[];
}

// Corresponds to JobsDB/contract_milestones
export interface ContractMilestone {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  contractId: string; // JobContract.$id
  title: string;
  description: string;
  amount: number;
  currency: string;
  dueDate?: string; // ISO Date string
  status: 'pending' | 'in_progress' | 'submitted' | 'rejected' | 'approved' | 'paid';
  submissionMessage?: string;
  submissionFileIds?: string[]; // Storage File IDs
  submittedAt?: string; // ISO Date string
  approvedAt?: string; // ISO Date string
  rejectionReason?: string;
  paymentId?: string; // PlatformTransaction.$id
  escrowId?: string; // EscrowTransaction.$id
  feedbackMessage?: string;
}

// Corresponds to JobsDB/user_reviews
export interface UserReview {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  contractId: string; // JobContract.$id
  reviewerId: string; // UserProfile.$id of the person giving the review
  revieweeId: string; // UserProfile.$id of the person receiving the review
  rating: number; // 1-5 stars
  review: string;
  private?: boolean; // If true, the review is private and only visible to the reviewee
  categories?: {
    // These can be different for client->freelancer vs freelancer->client
    category: string; // e.g., "Communication", "Quality", "Expertise"
    rating: number; // 1-5 stars
  }[];
  isRecommended?: boolean;
  response?: {
    text: string;
    createdAt: string; // ISO Date string
  };
}
