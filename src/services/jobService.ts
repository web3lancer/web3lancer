import { AppwriteService, ID, Query } from '@/services/appwriteService';
import { EnvService } from '@/services/envService';
import { Job, Proposal, Contract, Milestone, Review } from '@/types/job';

/**
 * Job Service for managing job listings, proposals, contracts, milestones, and reviews
 * Follows best practices from Cross-Cutting Concerns section
 */
class JobService {
  private databaseId: string;
  private jobsCollectionId: string;
  private proposalsCollectionId: string;
  private contractsCollectionId: string;
  private milestonesCollectionId: string;
  private reviewsCollectionId: string;
  private jobAttachmentsBucketId: string;
  
  constructor(
    private appwrite: AppwriteService,
    private env: EnvService<'jobs'>
  ) {
    this.databaseId = this.env.databaseId;
    this.jobsCollectionId = this.env.get('collectionJobPostings');
    this.proposalsCollectionId = this.env.get('collectionJobProposals');
    this.contractsCollectionId = this.env.get('collectionJobContracts');
    this.milestonesCollectionId = this.env.get('collectionContractMilestones');
    this.reviewsCollectionId = this.env.get('collectionUserReviews');
    this.jobAttachmentsBucketId = this.env.get('bucketJobAttachments');
  }

  // Jobs
  async createJob(data: Omit<Job, '$id' | '$createdAt' | '$updatedAt'>): Promise<Job> {
    return this.appwrite.createDocument<Job>(
      this.databaseId,
      this.jobsCollectionId,
      ID.unique(),
      {
        ...data,
        status: 'open',
        proposalsCount: 0,
        viewsCount: 0,
        bookmarksCount: 0,
        isPublic: true
      }
    );
  }

  async getJob(jobId: string): Promise<Job | null> {
    return this.appwrite.getDocument<Job>(
      this.databaseId,
      this.jobsCollectionId,
      jobId
    );
  }

  async updateJob(jobId: string, data: Partial<Job>): Promise<Job> {
    return this.appwrite.updateDocument<Job>(
      this.databaseId,
      this.jobsCollectionId,
      jobId,
      data
    );
  }

  async deleteJob(jobId: string): Promise<void> {
    return this.appwrite.deleteDocument(
      this.databaseId,
      this.jobsCollectionId,
      jobId
    );
  }

  async listJobs(queries: string[] = []): Promise<Job[]> {
    return this.appwrite.listDocuments<Job>(
      this.databaseId,
      this.jobsCollectionId,
      queries
    );
  }

  async incrementJobViewCount(jobId: string): Promise<Job> {
    const job = await this.getJob(jobId);
    if (!job) throw new Error('Job not found');
    
    return this.updateJob(jobId, {
      viewsCount: (job.viewsCount || 0) + 1
    });
  }

  // Proposals
  async createProposal(data: Omit<Proposal, '$id' | '$createdAt' | '$updatedAt'>): Promise<Proposal> {
    const proposal = await this.appwrite.createDocument<Proposal>(
      this.databaseId,
      this.proposalsCollectionId,
      ID.unique(),
      {
        ...data,
        status: 'pending'
      }
    );
    
    // Increment proposals count on the job
    const job = await this.getJob(data.jobId);
    if (job) {
      await this.updateJob(data.jobId, {
        proposalsCount: (job.proposalsCount || 0) + 1
      });
    }
    
    return proposal;
  }

  async getProposal(proposalId: string): Promise<Proposal | null> {
    return this.appwrite.getDocument<Proposal>(
      this.databaseId,
      this.proposalsCollectionId,
      proposalId
    );
  }

  async updateProposal(proposalId: string, data: Partial<Proposal>): Promise<Proposal> {
    return this.appwrite.updateDocument<Proposal>(
      this.databaseId,
      this.proposalsCollectionId,
      proposalId,
      data
    );
  }

  async deleteProposal(proposalId: string): Promise<void> {
    const proposal = await this.getProposal(proposalId);
    if (!proposal) throw new Error('Proposal not found');
    
    await this.appwrite.deleteDocument(
      this.databaseId,
      this.proposalsCollectionId,
      proposalId
    );
    
    // Decrement proposals count on the job
    const job = await this.getJob(proposal.jobId);
    if (job && job.proposalsCount && job.proposalsCount > 0) {
      await this.updateJob(proposal.jobId, {
        proposalsCount: job.proposalsCount - 1
      });
    }
  }

  async listProposals(queries: string[] = []): Promise<Proposal[]> {
    return this.appwrite.listDocuments<Proposal>(
      this.databaseId,
      this.proposalsCollectionId,
      queries
    );
  }

  async getProposalsByJob(jobId: string): Promise<Proposal[]> {
    return this.listProposals([Query.equal('jobId', jobId)]);
  }

  async getProposalsByFreelancer(freelancerId: string): Promise<Proposal[]> {
    return this.listProposals([Query.equal('freelancerId', freelancerId)]);
  }

  // Contracts
  async createContract(data: Omit<Contract, '$id' | '$createdAt' | '$updatedAt'>): Promise<Contract> {
    return this.appwrite.createDocument<Contract>(
      this.databaseId,
      this.contractsCollectionId,
      ID.unique(),
      {
        ...data,
        status: 'pending_funding'
      }
    );
  }

  async getContract(contractId: string): Promise<Contract | null> {
    return this.appwrite.getDocument<Contract>(
      this.databaseId,
      this.contractsCollectionId,
      contractId
    );
  }

  async updateContract(contractId: string, data: Partial<Contract>): Promise<Contract> {
    return this.appwrite.updateDocument<Contract>(
      this.databaseId,
      this.contractsCollectionId,
      contractId,
      data
    );
  }

  async listContracts(queries: string[] = []): Promise<Contract[]> {
    return this.appwrite.listDocuments<Contract>(
      this.databaseId,
      this.contractsCollectionId,
      queries
    );
  }

  async getContractsByFreelancer(freelancerId: string): Promise<Contract[]> {
    return this.listContracts([Query.equal('freelancerId', freelancerId)]);
  }

  async getContractsByClient(clientId: string): Promise<Contract[]> {
    return this.listContracts([Query.equal('clientId', clientId)]);
  }

  // Milestones
  async createMilestone(data: Omit<Milestone, '$id' | '$createdAt' | '$updatedAt'>): Promise<Milestone> {
    return this.appwrite.createDocument<Milestone>(
      this.databaseId,
      this.milestonesCollectionId,
      ID.unique(),
      {
        ...data,
        status: 'pending'
      }
    );
  }

  async getMilestone(milestoneId: string): Promise<Milestone | null> {
    return this.appwrite.getDocument<Milestone>(
      this.databaseId,
      this.milestonesCollectionId,
      milestoneId
    );
  }

  async updateMilestone(milestoneId: string, data: Partial<Milestone>): Promise<Milestone> {
    return this.appwrite.updateDocument<Milestone>(
      this.databaseId,
      this.milestonesCollectionId,
      milestoneId,
      data
    );
  }

  async listMilestones(queries: string[] = []): Promise<Milestone[]> {
    return this.appwrite.listDocuments<Milestone>(
      this.databaseId,
      this.milestonesCollectionId,
      queries
    );
  }

  async getMilestonesByContract(contractId: string): Promise<Milestone[]> {
    return this.listMilestones([
      Query.equal('contractId', contractId),
      Query.orderAsc('order')
    ]);
  }

  // Reviews
  async createReview(data: Omit<Review, '$id' | '$createdAt' | '$updatedAt'>): Promise<Review> {
    return this.appwrite.createDocument<Review>(
      this.databaseId,
      this.reviewsCollectionId,
      ID.unique(),
      data
    );
  }

  async getReview(reviewId: string): Promise<Review | null> {
    return this.appwrite.getDocument<Review>(
      this.databaseId,
      this.reviewsCollectionId,
      reviewId
    );
  }

  async getReviewByContract(contractId: string, reviewerType: 'client' | 'freelancer'): Promise<Review | null> {
    const reviews = await this.listReviews([
      Query.equal('contractId', contractId),
      Query.equal('reviewerType', reviewerType)
    ]);
    
    return reviews.length > 0 ? reviews[0] : null;
  }

  async listReviews(queries: string[] = []): Promise<Review[]> {
    return this.appwrite.listDocuments<Review>(
      this.databaseId,
      this.reviewsCollectionId,
      queries
    );
  }

  async getReviewsByUser(userId: string, asReviewer = true): Promise<Review[]> {
    const field = asReviewer ? 'reviewerId' : 'revieweeId';
    return this.listReviews([Query.equal(field, userId)]);
  }

  // File methods
  async uploadJobAttachment(file: File): Promise<string> {
    return this.appwrite.uploadFile(this.jobAttachmentsBucketId, file);
  }

  async getJobAttachmentUrl(fileId: string): Promise<URL> {
    return this.appwrite.getFileView(this.jobAttachmentsBucketId, fileId);
  }

  async deleteJobAttachment(fileId: string): Promise<void> {
    return this.appwrite.deleteFile(this.jobAttachmentsBucketId, fileId);
  }
}

export default JobService;