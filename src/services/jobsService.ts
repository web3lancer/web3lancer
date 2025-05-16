import BaseService from './baseService';
import { AppwriteService, ID, Query } from './appwriteService';
import { EnvConfig } from '@/config/environment';
import { JobPosting, JobProposal, JobContract, ContractMilestone, UserReview } from '@/types/jobs';

/**
 * JobsService - Handles job-related operations
 * 
 * This service manages all operations related to job postings, proposals,
 * contracts, milestones, and reviews.
 */
class JobsService extends BaseService {
  constructor(
    protected appwrite: AppwriteService,
    protected config: EnvConfig
  ) {
    super(appwrite, config);
  }

  // Job Postings
  async createJobPosting(data: Omit<JobPosting, '$id' | '$createdAt' | '$updatedAt'>): Promise<JobPosting> {
    return this.handleRequest(
      async () => {
        return await this.appwrite.createDocument<JobPosting>(
          this.config.jobs.databaseId,
          this.config.jobs.jobPostingsCollectionId,
          ID.unique(),
          data
        );
      },
      'createJobPosting'
    );
  }

  async getJobPosting(jobId: string): Promise<JobPosting | null> {
    return this.handleRequest(
      async () => {
        return await this.appwrite.getDocument<JobPosting>(
          this.config.jobs.databaseId,
          this.config.jobs.jobPostingsCollectionId,
          jobId
        );
      },
      'getJobPosting'
    );
  }

  async listJobPostings(queries: string[] = []): Promise<JobPosting[]> {
    return this.handleRequest(
      async () => {
        return await this.appwrite.listDocuments<JobPosting>(
          this.config.jobs.databaseId,
          this.config.jobs.jobPostingsCollectionId,
          queries
        );
      },
      'listJobPostings'
    );
  }

  async updateJobPosting(jobId: string, data: Partial<JobPosting>): Promise<JobPosting> {
    return this.handleRequest(
      async () => {
        return await this.appwrite.updateDocument<JobPosting>(
          this.config.jobs.databaseId,
          this.config.jobs.jobPostingsCollectionId,
          jobId,
          data
        );
      },
      'updateJobPosting'
    );
  }

  async deleteJobPosting(jobId: string): Promise<void> {
    return this.handleRequest(
      async () => {
        await this.appwrite.deleteDocument(
          this.config.jobs.databaseId,
          this.config.jobs.jobPostingsCollectionId,
          jobId
        );
      },
      'deleteJobPosting'
    );
  }

  // Job Proposals
  async createJobProposal(data: Omit<JobProposal, '$id' | '$createdAt' | '$updatedAt'>): Promise<JobProposal> {
    return this.handleRequest(
      async () => {
        return await this.appwrite.createDocument<JobProposal>(
          this.config.jobs.databaseId,
          this.config.jobs.jobProposalsCollectionId,
          ID.unique(),
          data
        );
      },
      'createJobProposal'
    );
  }

  async getJobProposal(proposalId: string): Promise<JobProposal | null> {
    return this.handleRequest(
      async () => {
        return await this.appwrite.getDocument<JobProposal>(
          this.config.jobs.databaseId,
          this.config.jobs.jobProposalsCollectionId,
          proposalId
        );
      },
      'getJobProposal'
    );
  }

  async listJobProposals(queries: string[] = []): Promise<JobProposal[]> {
    return this.handleRequest(
      async () => {
        return await this.appwrite.listDocuments<JobProposal>(
          this.config.jobs.databaseId,
          this.config.jobs.jobProposalsCollectionId,
          queries
        );
      },
      'listJobProposals'
    );
  }

  async updateJobProposal(proposalId: string, data: Partial<JobProposal>): Promise<JobProposal> {
    return this.handleRequest(
      async () => {
        return await this.appwrite.updateDocument<JobProposal>(
          this.config.jobs.databaseId,
          this.config.jobs.jobProposalsCollectionId,
          proposalId,
          data
        );
      },
      'updateJobProposal'
    );
  }

  async deleteJobProposal(proposalId: string): Promise<void> {
    return this.handleRequest(
      async () => {
        await this.appwrite.deleteDocument(
          this.config.jobs.databaseId,
          this.config.jobs.jobProposalsCollectionId,
          proposalId
        );
      },
      'deleteJobProposal'
    );
  }

  // Job Contracts
  async createJobContract(data: Omit<JobContract, '$id' | '$createdAt' | '$updatedAt'>): Promise<JobContract> {
    return this.handleRequest(
      async () => {
        return await this.appwrite.createDocument<JobContract>(
          this.config.jobs.databaseId,
          this.config.jobs.jobContractsCollectionId,
          ID.unique(),
          data
        );
      },
      'createJobContract'
    );
  }

  async getJobContract(contractId: string): Promise<JobContract | null> {
    return this.handleRequest(
      async () => {
        return await this.appwrite.getDocument<JobContract>(
          this.config.jobs.databaseId,
          this.config.jobs.jobContractsCollectionId,
          contractId
        );
      },
      'getJobContract'
    );
  }

  async listJobContracts(queries: string[] = []): Promise<JobContract[]> {
    return this.handleRequest(
      async () => {
        return await this.appwrite.listDocuments<JobContract>(
          this.config.jobs.databaseId,
          this.config.jobs.jobContractsCollectionId,
          queries
        );
      },
      'listJobContracts'
    );
  }

  async updateJobContract(contractId: string, data: Partial<JobContract>): Promise<JobContract> {
    return this.handleRequest(
      async () => {
        return await this.appwrite.updateDocument<JobContract>(
          this.config.jobs.databaseId,
          this.config.jobs.jobContractsCollectionId,
          contractId,
          data
        );
      },
      'updateJobContract'
    );
  }

  // Contract Milestones
  async createContractMilestone(data: Omit<ContractMilestone, '$id' | '$createdAt' | '$updatedAt'>): Promise<ContractMilestone> {
    return this.handleRequest(
      async () => {
        return await this.appwrite.createDocument<ContractMilestone>(
          this.config.jobs.databaseId,
          this.config.jobs.milestonesCollectionId,
          ID.unique(),
          data
        );
      },
      'createContractMilestone'
    );
  }

  async getContractMilestone(milestoneId: string): Promise<ContractMilestone | null> {
    return this.handleRequest(
      async () => {
        return await this.appwrite.getDocument<ContractMilestone>(
          this.config.jobs.databaseId,
          this.config.jobs.milestonesCollectionId,
          milestoneId
        );
      },
      'getContractMilestone'
    );
  }

  async listContractMilestones(contractId: string): Promise<ContractMilestone[]> {
    return this.handleRequest(
      async () => {
        return await this.appwrite.listDocuments<ContractMilestone>(
          this.config.jobs.databaseId,
          this.config.jobs.milestonesCollectionId,
          [Query.equal('contractId', contractId)]
        );
      },
      'listContractMilestones'
    );
  }

  async updateContractMilestone(milestoneId: string, data: Partial<ContractMilestone>): Promise<ContractMilestone> {
    return this.handleRequest(
      async () => {
        return await this.appwrite.updateDocument<ContractMilestone>(
          this.config.jobs.databaseId,
          this.config.jobs.milestonesCollectionId,
          milestoneId,
          data
        );
      },
      'updateContractMilestone'
    );
  }

  // User Reviews
  async createUserReview(data: Omit<UserReview, '$id' | '$createdAt' | '$updatedAt'>): Promise<UserReview> {
    return this.handleRequest(
      async () => {
        return await this.appwrite.createDocument<UserReview>(
          this.config.jobs.databaseId,
          this.config.jobs.reviewsCollectionId,
          ID.unique(),
          data
        );
      },
      'createUserReview'
    );
  }

  async getUserReview(reviewId: string): Promise<UserReview | null> {
    return this.handleRequest(
      async () => {
        return await this.appwrite.getDocument<UserReview>(
          this.config.jobs.databaseId,
          this.config.jobs.reviewsCollectionId,
          reviewId
        );
      },
      'getUserReview'
    );
  }

  async listUserReviews(queries: string[] = []): Promise<UserReview[]> {
    return this.handleRequest(
      async () => {
        return await this.appwrite.listDocuments<UserReview>(
          this.config.jobs.databaseId,
          this.config.jobs.reviewsCollectionId,
          queries
        );
      },
      'listUserReviews'
    );
  }

  // File Handling for Jobs
  async uploadJobAttachment(file: File, jobId: string, profileId: string): Promise<string> {
    return this.handleRequest(
      async () => {
        const result = await this.appwrite.uploadFile(
          this.config.storage.jobAttachmentsBucketId,
          ID.unique(),
          file,
          [`job:${jobId}`, `user:${profileId}`] // Permissions for job owner and the uploader
        );
        
        return result.$id;
      },
      'uploadJobAttachment'
    );
  }

  getJobAttachmentUrl(fileId: string): string {
    return this.appwrite.getFilePreview(
      this.config.storage.jobAttachmentsBucketId,
      fileId
    );
  }

  async deleteJobAttachment(fileId: string): Promise<void> {
    return this.handleRequest(
      async () => {
        await this.appwrite.deleteFile(
          this.config.storage.jobAttachmentsBucketId,
          fileId
        );
      },
      'deleteJobAttachment'
    );
  }
}

export default JobsService;