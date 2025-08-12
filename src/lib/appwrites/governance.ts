import {
  databases,
  ID,
} from '@/lib/appwrites/client';
import {
  COL,
  DB,
} from '@/lib/appwrites/constants';
import type * as AppwriteTypes from '@/types/appwrite.d';

// --- Disputes ---
export async function createDispute(data: Partial<AppwriteTypes.Disputes>) {
  return databases.createDocument<AppwriteTypes.Disputes>(DB.GOVERNANCE, COL.DISPUTES, ID.unique(), data);
}
export async function listDisputes(queries: any[] = []) {
  return databases.listDocuments<AppwriteTypes.Disputes>(DB.GOVERNANCE, COL.DISPUTES, queries);
}

// --- Votes ---
export async function createVote(data: Partial<AppwriteTypes.Votes>) {
  return databases.createDocument<AppwriteTypes.Votes>(DB.GOVERNANCE, COL.VOTES, ID.unique(), data);
}
export async function listVotes(queries: any[] = []) {
  return databases.listDocuments<AppwriteTypes.Votes>(DB.GOVERNANCE, COL.VOTES, queries);
}

// --- Platform Proposals ---
export async function createPlatformProposal(data: Partial<AppwriteTypes.PlatformProposals>) {
  return databases.createDocument<AppwriteTypes.PlatformProposals>(DB.GOVERNANCE, COL.PLATFORM_PROPOSALS, ID.unique(), data);
}
export async function listPlatformProposals(queries: any[] = []) {
  return databases.listDocuments<AppwriteTypes.PlatformProposals>(DB.GOVERNANCE, COL.PLATFORM_PROPOSALS, queries);
}
