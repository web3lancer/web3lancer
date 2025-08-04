import { databases, ID } from './client';
import { DB, COL } from './constants';
import type * as AppwriteTypes from '@/types/appwrite.d';

// --- Jobs ---
export async function createJob(data: Partial<AppwriteTypes.Jobs>) {
  return databases.createDocument<AppwriteTypes.Jobs>(DB.JOBS, COL.JOBS, ID.unique(), data);
}
export async function getJob(jobId: string) {
  return databases.getDocument<AppwriteTypes.Jobs>(DB.JOBS, COL.JOBS, jobId);
}
export async function updateJob(jobId: string, data: Partial<AppwriteTypes.Jobs>) {
  return databases.updateDocument<AppwriteTypes.Jobs>(DB.JOBS, COL.JOBS, jobId, data);
}
export async function listJobs(queries: any[] = []) {
  return databases.listDocuments<AppwriteTypes.Jobs>(DB.JOBS, COL.JOBS, queries);
}

// --- Proposals ---
export async function createProposal(data: Partial<AppwriteTypes.Proposals>) {
  return databases.createDocument<AppwriteTypes.Proposals>(DB.JOBS, COL.PROPOSALS, ID.unique(), data);
}
export async function getProposal(proposalId: string) {
  return databases.getDocument<AppwriteTypes.Proposals>(DB.JOBS, COL.PROPOSALS, proposalId);
}
export async function updateProposal(proposalId: string, data: Partial<AppwriteTypes.Proposals>) {
  return databases.updateDocument<AppwriteTypes.Proposals>(DB.JOBS, COL.PROPOSALS, proposalId, data);
}
export async function listProposals(queries: any[] = []) {
  return databases.listDocuments<AppwriteTypes.Proposals>(DB.JOBS, COL.PROPOSALS, queries);
}

// --- Contracts ---
export async function createContract(data: Partial<AppwriteTypes.Contracts>) {
  return databases.createDocument<AppwriteTypes.Contracts>(DB.JOBS, COL.CONTRACTS, ID.unique(), data);
}
export async function getContract(contractId: string) {
  return databases.getDocument<AppwriteTypes.Contracts>(DB.JOBS, COL.CONTRACTS, contractId);
}
export async function updateContract(contractId: string, data: Partial<AppwriteTypes.Contracts>) {
  return databases.updateDocument<AppwriteTypes.Contracts>(DB.JOBS, COL.CONTRACTS, contractId, data);
}
export async function listContracts(queries: any[] = []) {
  return databases.listDocuments<AppwriteTypes.Contracts>(DB.JOBS, COL.CONTRACTS, queries);
}

// --- Milestones ---
export async function createMilestone(data: Partial<AppwriteTypes.Milestones>) {
  return databases.createDocument<AppwriteTypes.Milestones>(DB.JOBS, COL.MILESTONES, ID.unique(), data);
}
export async function getMilestone(milestoneId: string) {
  return databases.getDocument<AppwriteTypes.Milestones>(DB.JOBS, COL.MILESTONES, milestoneId);
}
export async function updateMilestone(milestoneId: string, data: Partial<AppwriteTypes.Milestones>) {
  return databases.updateDocument<AppwriteTypes.Milestones>(DB.JOBS, COL.MILESTONES, milestoneId, data);
}
export async function listMilestones(queries: any[] = []) {
  return databases.listDocuments<AppwriteTypes.Milestones>(DB.JOBS, COL.MILESTONES, queries);
}

// --- Reviews ---
export async function createReview(data: Partial<AppwriteTypes.Reviews>) {
  return databases.createDocument<AppwriteTypes.Reviews>(DB.JOBS, COL.REVIEWS, ID.unique(), data);
}
export async function listReviews(queries: any[] = []) {
  return databases.listDocuments<AppwriteTypes.Reviews>(DB.JOBS, COL.REVIEWS, queries);
}
