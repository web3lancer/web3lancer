import { Client, Account, Databases, Storage, Functions, ID, Query, Avatars } from 'appwrite';
import type * as AppwriteTypes from '@/types/appwrite.d';

// Use NEXT_PUBLIC_ envs for all IDs
const client = new Client();
client
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);

const account = new Account(client);
const databases = new Databases(client);
const storage = new Storage(client);
const functions = new Functions(client);
const avatars = new Avatars(client);

export { client, account, databases, storage, functions, avatars, ID, Query };

// --- Utility: DB/Collection/Bucket IDs ---
export const DB = {
  JOBS: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_JOBS_ID!,
  PROFILES: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_PROFILES_ID!,
  SOCIAL: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_SOCIAL_ID!,
  FINANCE: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_FINANCE_ID!,
  CONTENT: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_CONTENT_ID!,
  GOVERNANCE: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_GOVERNANCE_ID!,
  ACTIVITY: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ACTIVITY_ID!,
  CORE: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_CORE_ID!,
};

export const COL = {
  JOBS: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_JOB_POSTINGS_ID!,
  PROPOSALS: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_JOB_PROPOSALS_ID!,
  CONTRACTS: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_JOB_CONTRACTS_ID!,
  MILESTONES: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_CONTRACT_MILESTONES_ID!,
  REVIEWS: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_USER_REVIEWS_ID!,
  PROFILES: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_USER_PROFILES_ID!,
  PROFILE_VERIFICATIONS: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_PROFILE_VERIFICATIONS_ID!,
  CONNECTIONS: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_USER_CONNECTIONS_ID!,
  MESSAGES: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_DIRECT_MESSAGES_ID!,
  GROUP_CHATS: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_GROUP_CHATS_ID!,
  GROUP_MESSAGES: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_GROUP_CHAT_MESSAGES_ID!,
  FEEDS: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_USER_POSTS_ID!, // If you have a feeds collection, update accordingly
  WALLETS: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_USER_WALLETS_ID!,
  TRANSACTIONS: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_PLATFORM_TRANSACTIONS_ID!,
  PAYMENT_METHODS: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_USER_PAYMENT_METHODS_ID!,
  ESCROW_TRANSACTIONS: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ESCROW_TRANSACTIONS_ID!,
  POSTS: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_USER_POSTS_ID!,
  POST_INTERACTIONS: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_POST_INTERACTIONS_ID!,
  PORTFOLIOS: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_USER_PORTFOLIOS_ID!,
  ARTICLES: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_USER_ARTICLES_ID!,
  BOOKMARKS: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_USER_BOOKMARKS_ID!,
  DISPUTES: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_CONTRACT_DISPUTES_ID!,
  VOTES: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_DISPUTE_VOTES_ID!,
  PLATFORM_PROPOSALS: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_PLATFORM_PROPOSALS_ID!,
  NOTIFICATIONS: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_USER_NOTIFICATIONS_ID!,
  AUDIT_LOGS: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_AUDIT_LOGS_ID!,
  SKILLS: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_APP_SKILLS_ID!,
  CATEGORIES: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_APP_CATEGORIES_ID!,
  PLATFORM_SETTINGS: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_PLATFORM_SETTINGS_ID!,
};

export const BUCKET = {
  PROFILE_PICTURES: process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID!, // profile-pictures
  JOB_ATTACHMENTS: process.env.NEXT_PUBLIC_APPWRITE_BUCKET_JOB_ATTACHMENTS_ID!,
  PROJECT_DOCUMENTS: process.env.NEXT_PUBLIC_APPWRITE_BUCKET_PROJECT_DOCUMENTS_ID!,
  PROJECT_MEDIA: process.env.NEXT_PUBLIC_APPWRITE_BUCKET_PROJECT_MEDIA_ID!,
  MESSAGE_ATTACHMENTS: process.env.NEXT_PUBLIC_APPWRITE_BUCKET_MESSAGE_ATTACHMENTS_ID!,
  MISC: process.env.NEXT_PUBLIC_APPWRITE_BUCKET_MISCELLANEOUS_ID!,
  PROFILE_AVATARS: process.env.NEXT_PUBLIC_APPWRITE_BUCKET_PROFILE_AVATARS_ID!,
  COVER_IMAGES: process.env.NEXT_PUBLIC_APPWRITE_BUCKET_COVER_IMAGES_ID!,
  VERIFICATION_DOCUMENTS: process.env.NEXT_PUBLIC_APPWRITE_BUCKET_VERIFICATION_DOCUMENTS_PRIVATE_ID!,
};

// --- Account/Auth ---
export async function getCurrentAccount() {
  return account.get();
}
export async function updateAccountPrefs(prefs: Record<string, any>) {
  return account.updatePrefs(prefs);
}
export async function logoutCurrentSession() {
  return account.deleteSession('current');
}

// --- Profiles ---
export async function getProfile(userId: string): Promise<AppwriteTypes.Profiles | null> {
  try {
    return await databases.getDocument<AppwriteTypes.Profiles>(DB.PROFILES, COL.PROFILES, userId);
  } catch {
    return null;
  }
}
export async function updateProfile(userId: string, data: Partial<AppwriteTypes.Profiles>) {
  return databases.updateDocument<AppwriteTypes.Profiles>(DB.PROFILES, COL.PROFILES, userId, data);
}
export async function listProfiles(queries: any[] = []) {
  return databases.listDocuments<AppwriteTypes.Profiles>(DB.PROFILES, COL.PROFILES, queries);
}

// --- Projects (Profiles as Projects) ---
export async function createProject(data: Partial<AppwriteTypes.Profiles>) {
  return databases.createDocument<AppwriteTypes.Profiles>(
    DB.PROFILES,
    COL.PROFILES,
    ID.unique(),
    data
  );
}

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

// --- Posts ---
export async function createPost(data: Partial<AppwriteTypes.Posts>) {
  return databases.createDocument<AppwriteTypes.Posts>(DB.CONTENT, COL.POSTS, ID.unique(), data);
}
export async function getPost(postId: string) {
  return databases.getDocument<AppwriteTypes.Posts>(DB.CONTENT, COL.POSTS, postId);
}
export async function updatePost(postId: string, data: Partial<AppwriteTypes.Posts>) {
  return databases.updateDocument<AppwriteTypes.Posts>(DB.CONTENT, COL.POSTS, postId, data);
}
export async function listPosts(queries: any[] = []) {
  return databases.listDocuments<AppwriteTypes.Posts>(DB.CONTENT, COL.POSTS, queries);
}

// --- Post Interactions ---
export async function createPostInteraction(data: Partial<AppwriteTypes.PostInteractions>) {
  return databases.createDocument<AppwriteTypes.PostInteractions>(DB.CONTENT, COL.POST_INTERACTIONS, ID.unique(), data);
}
export async function listPostInteractions(queries: any[] = []) {
  return databases.listDocuments<AppwriteTypes.PostInteractions>(DB.CONTENT, COL.POST_INTERACTIONS, queries);
}

// --- Bookmarks ---
export async function createBookmark(data: Partial<AppwriteTypes.Bookmarks>) {
  return databases.createDocument<AppwriteTypes.Bookmarks>(DB.CONTENT, COL.BOOKMARKS, ID.unique(), data);
}
export async function listBookmarks(queries: any[] = []) {
  return databases.listDocuments<AppwriteTypes.Bookmarks>(DB.CONTENT, COL.BOOKMARKS, queries);
}

// --- Portfolios ---
export async function createPortfolio(data: Partial<AppwriteTypes.Portfolios>) {
  return databases.createDocument<AppwriteTypes.Portfolios>(DB.CONTENT, COL.PORTFOLIOS, ID.unique(), data);
}
export async function listPortfolios(queries: any[] = []) {
  return databases.listDocuments<AppwriteTypes.Portfolios>(DB.CONTENT, COL.PORTFOLIOS, queries);
}

// --- Articles ---
export async function createArticle(data: Partial<AppwriteTypes.Articles>) {
  return databases.createDocument<AppwriteTypes.Articles>(DB.CONTENT, COL.ARTICLES, ID.unique(), data);
}
export async function listArticles(queries: any[] = []) {
  return databases.listDocuments<AppwriteTypes.Articles>(DB.CONTENT, COL.ARTICLES, queries);
}

// --- Connections ---
export async function createConnection(data: Partial<AppwriteTypes.Connections>) {
  return databases.createDocument<AppwriteTypes.Connections>(DB.SOCIAL, COL.CONNECTIONS, ID.unique(), data);
}
export async function listConnections(queries: any[] = []) {
  return databases.listDocuments<AppwriteTypes.Connections>(DB.SOCIAL, COL.CONNECTIONS, queries);
}

// --- Messages ---
export async function createMessage(data: Partial<AppwriteTypes.Messages>) {
  return databases.createDocument<AppwriteTypes.Messages>(DB.SOCIAL, COL.MESSAGES, ID.unique(), data);
}
export async function listMessages(queries: any[] = []) {
  return databases.listDocuments<AppwriteTypes.Messages>(DB.SOCIAL, COL.MESSAGES, queries);
}

// --- Group Chats ---
export async function createGroupChat(data: Partial<AppwriteTypes.GroupChats>) {
  return databases.createDocument<AppwriteTypes.GroupChats>(DB.SOCIAL, COL.GROUP_CHATS, ID.unique(), data);
}
export async function listGroupChats(queries: any[] = []) {
  return databases.listDocuments<AppwriteTypes.GroupChats>(DB.SOCIAL, COL.GROUP_CHATS, queries);
}

// --- Group Messages ---
export async function createGroupMessage(data: Partial<AppwriteTypes.GroupMessages>) {
  return databases.createDocument<AppwriteTypes.GroupMessages>(DB.SOCIAL, COL.GROUP_MESSAGES, ID.unique(), data);
}
export async function listGroupMessages(queries: any[] = []) {
  return databases.listDocuments<AppwriteTypes.GroupMessages>(DB.SOCIAL, COL.GROUP_MESSAGES, queries);
}

// --- Wallets ---
export async function createWallet(data: Partial<AppwriteTypes.Wallets>) {
  return databases.createDocument<AppwriteTypes.Wallets>(DB.FINANCE, COL.WALLETS, ID.unique(), data);
}
export async function listWallets(queries: any[] = []) {
  return databases.listDocuments<AppwriteTypes.Wallets>(DB.FINANCE, COL.WALLETS, queries);
}

// --- Transactions ---
export async function createTransaction(data: Partial<AppwriteTypes.Transactions>) {
  return databases.createDocument<AppwriteTypes.Transactions>(DB.FINANCE, COL.TRANSACTIONS, ID.unique(), data);
}
export async function listTransactions(queries: any[] = []) {
  return databases.listDocuments<AppwriteTypes.Transactions>(DB.FINANCE, COL.TRANSACTIONS, queries);
}

// --- Payment Methods ---
export async function createPaymentMethod(data: Partial<AppwriteTypes.PaymentMethods>) {
  return databases.createDocument<AppwriteTypes.PaymentMethods>(DB.FINANCE, COL.PAYMENT_METHODS, ID.unique(), data);
}
export async function listPaymentMethods(queries: any[] = []) {
  return databases.listDocuments<AppwriteTypes.PaymentMethods>(DB.FINANCE, COL.PAYMENT_METHODS, queries);
}

// --- Escrow Transactions ---
export async function createEscrowTransaction(data: Partial<AppwriteTypes.EscrowTransactions>) {
  return databases.createDocument<AppwriteTypes.EscrowTransactions>(DB.FINANCE, COL.ESCROW_TRANSACTIONS, ID.unique(), data);
}
export async function listEscrowTransactions(queries: any[] = []) {
  return databases.listDocuments<AppwriteTypes.EscrowTransactions>(DB.FINANCE, COL.ESCROW_TRANSACTIONS, queries);
}

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

// --- Notifications ---
export async function createNotification(data: Partial<AppwriteTypes.Notifications>) {
  return databases.createDocument<AppwriteTypes.Notifications>(DB.ACTIVITY, COL.NOTIFICATIONS, ID.unique(), data);
}
export async function listNotifications(queries: any[] = []) {
  return databases.listDocuments<AppwriteTypes.Notifications>(DB.ACTIVITY, COL.NOTIFICATIONS, queries);
}

// --- Audit Logs ---
export async function createAuditLog(data: Partial<AppwriteTypes.AuditLogs>) {
  return databases.createDocument<AppwriteTypes.AuditLogs>(DB.ACTIVITY, COL.AUDIT_LOGS, ID.unique(), data);
}
export async function listAuditLogs(queries: any[] = []) {
  return databases.listDocuments<AppwriteTypes.AuditLogs>(DB.ACTIVITY, COL.AUDIT_LOGS, queries);
}

// --- Skills ---
export async function createSkill(data: Partial<AppwriteTypes.Skills>) {
  return databases.createDocument<AppwriteTypes.Skills>(DB.CORE, COL.SKILLS, ID.unique(), data);
}
export async function listSkills(queries: any[] = []) {
  return databases.listDocuments<AppwriteTypes.Skills>(DB.CORE, COL.SKILLS, queries);
}

// --- Categories ---
export async function createCategory(data: Partial<AppwriteTypes.Categories>) {
  return databases.createDocument<AppwriteTypes.Categories>(DB.CORE, COL.CATEGORIES, ID.unique(), data);
}
export async function listCategories(queries: any[] = []) {
  return databases.listDocuments<AppwriteTypes.Categories>(DB.CORE, COL.CATEGORIES, queries);
}

// --- Platform Settings ---
export async function updatePlatformSetting(settingKey: string, data: Partial<AppwriteTypes.PlatformSettings>) {
  return databases.updateDocument<AppwriteTypes.PlatformSettings>(DB.CORE, COL.PLATFORM_SETTINGS, settingKey, data);
}
export async function listPlatformSettings(queries: any[] = []) {
  return databases.listDocuments<AppwriteTypes.PlatformSettings>(DB.CORE, COL.PLATFORM_SETTINGS, queries);
}

// --- Storage helpers ---
export function getFilePreviewUrl(bucketId: string, fileId: string) {
  return storage.getFilePreview(bucketId, fileId).toString();
}
export function getFileViewUrl(bucketId: string, fileId: string) {
  return storage.getFileView(bucketId, fileId).toString();
}
export function getAvatarUrl(userId: string) {
  return avatars.getInitials(userId).toString();
}

// ...add more helpers as needed for your app context...