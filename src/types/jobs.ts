// filepath: /home/nathfavour/Documents/code/web3lancer/web3lancer/src/types/jobs.ts

// Corresponds to JobsDB/job_postings
export interface JobPosting {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  clientId: string; // Profile.$id of the client
  title: string;
  description: string;
  jobType: 'fixed-price' | 'hourly' | 'milestone-based';
  budgetMin?: number;
  budgetMax?: number;
  currency: string; // e.g., 'USD', 'ETH'
  skillsRequired: string[]; // Array of Skill.$id from CoreDB
  experienceLevel: 'entry' | 'intermediate' | 'expert';
  duration?: string; // e.g., '1-3 months', 'ongoing'
  tags?: string[];
  attachmentsFileIds?: string[]; // Storage File IDs from job_attachments bucket
  status: 'open' | 'in-progress' | 'completed' | 'cancelled' | 'pending_approval';
  proposalsCount?: number; // Denormalized
  isFeatured?: boolean;
  locationPreference?: 'remote' | 'on-site' | 'hybrid';
  timezonePreference?: string[]; // For remote jobs
  deadline?: string; // ISO Datetime for applications
  visibility: 'public' | 'invite-only';
  category: string; // Category.$id from CoreDB
  bookmarksCount?: number; // Denormalized
}

// Corresponds to JobsDB/job_proposals
export interface JobProposal {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  jobId: string; // JobPosting.$id
  freelancerId: string; // Profile.$id of the freelancer
  coverLetter: string;
  proposedRate?: number; // For hourly or if different from job budget
  proposedTimeline?: string; // e.g. "2 weeks"
  attachmentsFileIds?: string[]; // Storage File IDs
  status: 'pending' | 'shortlisted' | 'accepted' | 'rejected' | 'withdrawn' | 'archived';
  clientFeedback?: string; // If rejected
  isFeaturedByFreelancer?: boolean;
}

// Corresponds to JobsDB/job_contracts
export interface JobContract {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  jobId: string; // JobPosting.$id
  proposalId: string; // JobProposal.$id
  clientId: string; // Profile.$id
  freelancerId: string; // Profile.$id
  terms: string; // Agreed terms, can be from job + proposal
  totalAmount?: number; // For fixed-price or milestone-based
  hourlyRate?: number; // For hourly
  currency: string;
  contractType: 'fixed-price' | 'hourly' | 'milestone-based'; // From JobPosting.jobType
  startDate?: string; // ISO Datetime
  endDate?: string; // ISO Datetime (expected or actual)
  status: 'pending_start' | 'active' | 'paused' | 'completed' | 'terminated' | 'disputed';
  escrowStatus?: 'unfunded' | 'funded' | 'partially_funded' | 'released' | 'refunded';
  terminationReason?: string;
  completionDate?: string; // ISO Datetime
}

// Corresponds to JobsDB/contract_milestones
export interface ContractMilestone {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  contractId: string; // JobContract.$id
  description: string;
  amount: number;
  dueDate?: string; // ISO Datetime
  status: 'pending' | 'in_progress' | 'submitted_for_approval' | 'approved' | 'rejected' | 'paid';
  freelancerNotes?: string;
  clientFeedback?: string;
  deliverableFileIds?: string[]; // Storage File IDs
  approvalDate?: string; // ISO Datetime
  paymentDate?: string; // ISO Datetime
}

// Corresponds to JobsDB/user_reviews
export interface UserReview {
  $id: string;
  $createdAt: string;
  // $updatedAt might not be relevant if reviews are immutable
  contractId: string; // JobContract.$id (Unique constraint often applied here)
  reviewerId: string; // Profile.$id of the person writing the review
  revieweeId: string; // Profile.$id of the person being reviewed
  rating: 1 | 2 | 3 | 4 | 5;
  comment?: string;
  reviewType: 'client_review' | 'freelancer_review';
  isAnonymous?: boolean; // If the reviewer chose to be anonymous
  // Optional: specific aspects if detailed feedback is desired
  // communicationRating?: 1 | 2 | 3 | 4 | 5;
  // qualityOfWorkRating?: 1 | 2 | 3 | 4 | 5;
  // timelinessRating?: 1 | 2 | 3 | 4 | 5;
}
