import { ID, Query } from "appwrite";
import { databases, storage } from "@/app/api";
import { Contract, Milestone, Review, Profile } from "@/types";

// Import constants
import {
  PROJECT_DATABASE_ID,
  PROJECTS_COLLECTION_ID,
  JOB_CONTRACTS_COLLECTION_ID,
  CONTRACT_MILESTONES_COLLECTION_ID,
  USER_REVIEWS_COLLECTION_ID
} from "@/lib/env";

class ContractService {
  // Create a new contract
  async createContract(contractData: Partial<Contract>): Promise<Contract | null> {
    try {
      const newContract = await databases.createDocument(
        PROJECT_DATABASE_ID,
        JOB_CONTRACTS_COLLECTION_ID,
        ID.unique(),
        {
          // Set default values for required fields
          title: contractData.title || "Untitled Contract",
          description: contractData.description || "",
          terms: contractData.terms || "",
          budget: contractData.budget || 0,
          status: contractData.status || "draft",
          createdAt: new Date().toISOString(),
          // Include all other fields from contractData
          ...contractData
        }
      );
      return newContract as unknown as Contract;
    } catch (error) {
      console.error("Error creating contract:", error);
      return null;
    }
  }

  // Get contract by ID
  async getContract(contractId: string): Promise<Contract | null> {
    try {
      const contract = await databases.getDocument(
        PROJECT_DATABASE_ID,
        JOB_CONTRACTS_COLLECTION_ID,
        contractId
      );
      return contract as unknown as Contract;
    } catch (error) {
      console.error("Error fetching contract:", error);
      return null;
    }
  }

  // Get contracts by client ID
  async getContractsByClientId(clientId: string): Promise<Contract[]> {
    try {
      const contracts = await databases.listDocuments(
        PROJECT_DATABASE_ID,
        JOB_CONTRACTS_COLLECTION_ID,
        [Query.equal("clientId", clientId)]
      );

      return contracts.documents as unknown as Contract[];
    } catch (error) {
      console.error("Error fetching contracts by clientId:", error);
      return [];
    }
  }

  // Get contracts by freelancer ID
  async getContractsByFreelancerId(freelancerId: string): Promise<Contract[]> {
    try {
      const contracts = await databases.listDocuments(
        PROJECT_DATABASE_ID,
        JOB_CONTRACTS_COLLECTION_ID,
        [Query.equal("freelancerId", freelancerId)]
      );

      return contracts.documents as unknown as Contract[];
    } catch (error) {
      console.error("Error fetching contracts by freelancerId:", error);
      return [];
    }
  }

  // Update contract
  async updateContract(contractId: string, contractData: Partial<Contract>): Promise<Contract | null> {
    try {
      const updatedContract = await databases.updateDocument(
        PROJECT_DATABASE_ID,
        JOB_CONTRACTS_COLLECTION_ID,
        contractId,
        {
          ...contractData,
          updatedAt: new Date().toISOString()
        }
      );
      return updatedContract as unknown as Contract;
    } catch (error) {
      console.error("Error updating contract:", error);
      return null;
    }
  }

  // Update contract status
  async updateContractStatus(contractId: string, status: Contract['status']): Promise<Contract | null> {
    try {
      const updatedContract = await databases.updateDocument(
        PROJECT_DATABASE_ID,
        JOB_CONTRACTS_COLLECTION_ID,
        contractId,
        {
          status,
          updatedAt: new Date().toISOString()
        }
      );
      return updatedContract as unknown as Contract;
    } catch (error) {
      console.error("Error updating contract status:", error);
      return null;
    }
  }

  // Delete contract (typically only for drafts)
  async deleteContract(contractId: string): Promise<boolean> {
    try {
      await databases.deleteDocument(
        PROJECT_DATABASE_ID,
        JOB_CONTRACTS_COLLECTION_ID,
        contractId
      );
      return true;
    } catch (error) {
      console.error("Error deleting contract:", error);
      return false;
    }
  }

  // --- Milestone Management ---

  // Create a milestone
  async createMilestone(milestoneData: Partial<Milestone>): Promise<Milestone | null> {
    try {
      const newMilestone = await databases.createDocument(
        PROJECT_DATABASE_ID,
        CONTRACT_MILESTONES_COLLECTION_ID,
        ID.unique(),
        {
          // Set default values for required fields
          title: milestoneData.title || "Unnamed Milestone",
          description: milestoneData.description || "",
          amount: milestoneData.amount || 0,
          status: milestoneData.status || "pending",
          createdAt: new Date().toISOString(),
          // Include all other fields from milestoneData
          ...milestoneData
        }
      );
      return newMilestone as unknown as Milestone;
    } catch (error) {
      console.error("Error creating milestone:", error);
      return null;
    }
  }

  // Get milestone by ID
  async getMilestone(milestoneId: string): Promise<Milestone | null> {
    try {
      const milestone = await databases.getDocument(
        PROJECT_DATABASE_ID,
        CONTRACT_MILESTONES_COLLECTION_ID,
        milestoneId
      );
      return milestone as unknown as Milestone;
    } catch (error) {
      console.error("Error fetching milestone:", error);
      return null;
    }
  }

  // Get milestones by contract ID
  async getMilestonesByContractId(contractId: string): Promise<Milestone[]> {
    try {
      const milestones = await databases.listDocuments(
        PROJECT_DATABASE_ID,
        CONTRACT_MILESTONES_COLLECTION_ID,
        [Query.equal("contractId", contractId)]
      );

      return milestones.documents as unknown as Milestone[];
    } catch (error) {
      console.error("Error fetching milestones by contractId:", error);
      return [];
    }
  }

  // Update milestone
  async updateMilestone(milestoneId: string, milestoneData: Partial<Milestone>): Promise<Milestone | null> {
    try {
      const updatedMilestone = await databases.updateDocument(
        PROJECT_DATABASE_ID,
        CONTRACT_MILESTONES_COLLECTION_ID,
        milestoneId,
        {
          ...milestoneData,
          updatedAt: new Date().toISOString()
        }
      );
      return updatedMilestone as unknown as Milestone;
    } catch (error) {
      console.error("Error updating milestone:", error);
      return null;
    }
  }

  // Update milestone status
  async updateMilestoneStatus(milestoneId: string, status: Milestone['status']): Promise<Milestone | null> {
    try {
      const updatedMilestone = await databases.updateDocument(
        PROJECT_DATABASE_ID,
        CONTRACT_MILESTONES_COLLECTION_ID,
        milestoneId,
        {
          status,
          updatedAt: new Date().toISOString()
        }
      );
      return updatedMilestone as unknown as Milestone;
    } catch (error) {
      console.error("Error updating milestone status:", error);
      return null;
    }
  }

  // Delete milestone
  async deleteMilestone(milestoneId: string): Promise<boolean> {
    try {
      await databases.deleteDocument(
        PROJECT_DATABASE_ID,
        CONTRACT_MILESTONES_COLLECTION_ID,
        milestoneId
      );
      return true;
    } catch (error) {
      console.error("Error deleting milestone:", error);
      return false;
    }
  }

  // --- Reviews Management ---

  // Create a review
  async createReview(reviewData: Partial<Review>): Promise<Review | null> {
    try {
      const newReview = await databases.createDocument(
        PROJECT_DATABASE_ID,
        USER_REVIEWS_COLLECTION_ID,
        ID.unique(),
        {
          // Set default values and required fields
          rating: reviewData.rating || 0,
          comment: reviewData.comment || "",
          isAnonymous: reviewData.isAnonymous || false,
          createdAt: new Date().toISOString(),
          // Include all other fields from reviewData
          ...reviewData
        }
      );
      return newReview as unknown as Review;
    } catch (error) {
      console.error("Error creating review:", error);
      return null;
    }
  }

  // Get review by ID
  async getReview(reviewId: string): Promise<Review | null> {
    try {
      const review = await databases.getDocument(
        PROJECT_DATABASE_ID,
        USER_REVIEWS_COLLECTION_ID,
        reviewId
      );
      return review as unknown as Review;
    } catch (error) {
      console.error("Error fetching review:", error);
      return null;
    }
  }

  // Get reviews by contract ID
  async getReviewsByContractId(contractId: string): Promise<Review[]> {
    try {
      const reviews = await databases.listDocuments(
        PROJECT_DATABASE_ID,
        USER_REVIEWS_COLLECTION_ID,
        [Query.equal("contractId", contractId)]
      );

      return reviews.documents as unknown as Review[];
    } catch (error) {
      console.error("Error fetching reviews by contractId:", error);
      return [];
    }
  }

  // Get reviews by reviewer ID
  async getReviewsByReviewerId(reviewerId: string): Promise<Review[]> {
    try {
      const reviews = await databases.listDocuments(
        PROJECT_DATABASE_ID,
        USER_REVIEWS_COLLECTION_ID,
        [Query.equal("reviewerId", reviewerId)]
      );

      return reviews.documents as unknown as Review[];
    } catch (error) {
      console.error("Error fetching reviews by reviewerId:", error);
      return [];
    }
  }

  // Get reviews for a profile (as the reviewee)
  async getReviewsForProfile(profileId: string): Promise<Review[]> {
    try {
      const reviews = await databases.listDocuments(
        PROJECT_DATABASE_ID,
        USER_REVIEWS_COLLECTION_ID,
        [Query.equal("revieweeId", profileId)]
      );

      return reviews.documents as unknown as Review[];
    } catch (error) {
      console.error("Error fetching reviews for profile:", error);
      return [];
    }
  }

  // Update review
  async updateReview(reviewId: string, reviewData: Partial<Review>): Promise<Review | null> {
    try {
      const updatedReview = await databases.updateDocument(
        PROJECT_DATABASE_ID,
        USER_REVIEWS_COLLECTION_ID,
        reviewId,
        {
          ...reviewData,
          updatedAt: new Date().toISOString()
        }
      );
      return updatedReview as unknown as Review;
    } catch (error) {
      console.error("Error updating review:", error);
      return null;
    }
  }

  // Delete review
  async deleteReview(reviewId: string): Promise<boolean> {
    try {
      await databases.deleteDocument(
        PROJECT_DATABASE_ID,
        USER_REVIEWS_COLLECTION_ID,
        reviewId
      );
      return true;
    } catch (error) {
      console.error("Error deleting review:", error);
      return false;
    }
  }
}

// Export single instance
const contractService = new ContractService();
export default contractService;