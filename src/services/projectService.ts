import { ID, Query } from "appwrite";
import { databases, storage } from "@/app/api";
import { Project, Proposal } from "@/types";

// Import constants
import {
  PROJECT_DATABASE_ID,
  PROJECTS_COLLECTION_ID,
  PROPOSALS_COLLECTION_ID,
  PROJECT_ATTACHMENTS_BUCKET_ID
} from "@/lib/env";

class ProjectService {
  // Create a new project
  async createProject(projectData: Partial<Project>): Promise<Project | null> {
    try {
      const newProject = await databases.createDocument(
        PROJECT_DATABASE_ID,
        PROJECTS_COLLECTION_ID,
        ID.unique(),
        {
          // Set default values for required fields
          title: projectData.title || "Untitled Project",
          description: projectData.description || "",
          skills: projectData.skills || [],
          budget: projectData.budget || { min: 0, max: 0, currency: "USD" },
          status: projectData.status || "draft",
          visibility: projectData.visibility || "public",
          createdAt: new Date().toISOString(),
          // Include all other fields from projectData
          ...projectData
        }
      );
      return newProject as unknown as Project;
    } catch (error) {
      console.error("Error creating project:", error);
      return null;
    }
  }

  // Get project by ID
  async getProject(projectId: string): Promise<Project | null> {
    try {
      const project = await databases.getDocument(
        PROJECT_DATABASE_ID,
        PROJECTS_COLLECTION_ID,
        projectId
      );
      return project as unknown as Project;
    } catch (error) {
      console.error("Error fetching project:", error);
      return null;
    }
  }

  // Get projects by client ID
  async getProjectsByClientId(clientId: string): Promise<Project[]> {
    try {
      const projects = await databases.listDocuments(
        PROJECT_DATABASE_ID,
        PROJECTS_COLLECTION_ID,
        [Query.equal("clientId", clientId)]
      );

      return projects.documents as unknown as Project[];
    } catch (error) {
      console.error("Error fetching projects by clientId:", error);
      return [];
    }
  }

  // Update project
  async updateProject(projectId: string, projectData: Partial<Project>): Promise<Project | null> {
    try {
      const updatedProject = await databases.updateDocument(
        PROJECT_DATABASE_ID,
        PROJECTS_COLLECTION_ID,
        projectId,
        {
          ...projectData,
          updatedAt: new Date().toISOString()
        }
      );
      return updatedProject as unknown as Project;
    } catch (error) {
      console.error("Error updating project:", error);
      return null;
    }
  }

  // Delete project
  async deleteProject(projectId: string): Promise<boolean> {
    try {
      await databases.deleteDocument(
        PROJECT_DATABASE_ID,
        PROJECTS_COLLECTION_ID,
        projectId
      );
      return true;
    } catch (error) {
      console.error("Error deleting project:", error);
      return false;
    }
  }

  // Upload project attachment
  async uploadProjectAttachment(projectId: string, file: File): Promise<string | null> {
    try {
      const uploadedFile = await storage.createFile(
        PROJECT_ATTACHMENTS_BUCKET_ID,
        ID.unique(),
        file
      );

      // Get the current project
      const project = await this.getProject(projectId);
      
      if (project) {
        // Update project attachments
        const attachments = project.attachments || [];
        await this.updateProject(projectId, {
          attachments: [...attachments, uploadedFile.$id]
        });
      }

      return uploadedFile.$id;
    } catch (error) {
      console.error("Error uploading project attachment:", error);
      return null;
    }
  }

  // Get project attachment URL
  getProjectAttachmentUrl(fileId: string): string {
    return storage.getFileView(PROJECT_ATTACHMENTS_BUCKET_ID, fileId);
  }

  // Delete project attachment
  async deleteProjectAttachment(projectId: string, fileId: string): Promise<boolean> {
    try {
      // Delete file from storage
      await storage.deleteFile(PROJECT_ATTACHMENTS_BUCKET_ID, fileId);

      // Get the current project
      const project = await this.getProject(projectId);
      
      if (project && project.attachments) {
        // Update project attachments
        const updatedAttachments = project.attachments.filter(id => id !== fileId);
        await this.updateProject(projectId, {
          attachments: updatedAttachments
        });
      }

      return true;
    } catch (error) {
      console.error("Error deleting project attachment:", error);
      return false;
    }
  }

  // Submit a proposal for a project
  async submitProposal(proposalData: Partial<Proposal>): Promise<Proposal | null> {
    try {
      const newProposal = await databases.createDocument(
        PROJECT_DATABASE_ID,
        PROPOSALS_COLLECTION_ID,
        ID.unique(),
        {
          // Set default values
          status: "pending",
          createdAt: new Date().toISOString(),
          // Include all other fields from proposalData
          ...proposalData
        }
      );
      return newProposal as unknown as Proposal;
    } catch (error) {
      console.error("Error submitting proposal:", error);
      return null;
    }
  }

  // Get proposals for a project
  async getProjectProposals(projectId: string): Promise<Proposal[]> {
    try {
      const proposals = await databases.listDocuments(
        PROJECT_DATABASE_ID,
        PROPOSALS_COLLECTION_ID,
        [Query.equal("projectId", projectId)]
      );

      return proposals.documents as unknown as Proposal[];
    } catch (error) {
      console.error("Error fetching project proposals:", error);
      return [];
    }
  }

  // Get proposal by ID
  async getProposal(proposalId: string): Promise<Proposal | null> {
    try {
      const proposal = await databases.getDocument(
        PROJECT_DATABASE_ID,
        PROPOSALS_COLLECTION_ID,
        proposalId
      );
      return proposal as unknown as Proposal;
    } catch (error) {
      console.error("Error fetching proposal:", error);
      return null;
    }
  }

  // Get proposals by freelancer ID
  async getProposalsByFreelancerId(freelancerId: string): Promise<Proposal[]> {
    try {
      const proposals = await databases.listDocuments(
        PROJECT_DATABASE_ID,
        PROPOSALS_COLLECTION_ID,
        [Query.equal("freelancerId", freelancerId)]
      );

      return proposals.documents as unknown as Proposal[];
    } catch (error) {
      console.error("Error fetching proposals by freelancerId:", error);
      return [];
    }
  }

  // Update proposal status
  async updateProposalStatus(proposalId: string, status: Proposal['status']): Promise<Proposal | null> {
    try {
      const updatedProposal = await databases.updateDocument(
        PROJECT_DATABASE_ID,
        PROPOSALS_COLLECTION_ID,
        proposalId,
        {
          status,
          updatedAt: new Date().toISOString()
        }
      );
      return updatedProposal as unknown as Proposal;
    } catch (error) {
      console.error("Error updating proposal status:", error);
      return null;
    }
  }

  // Search projects
  async searchProjects(searchParams: {
    query?: string;
    skills?: string[];
    minBudget?: number;
    maxBudget?: number;
    category?: string;
    page?: number;
    limit?: number;
  }): Promise<{ projects: Project[]; total: number }> {
    try {
      const { 
        query = '', 
        skills = [], 
        minBudget, 
        maxBudget, 
        category,
        page = 1, 
        limit = 10 
      } = searchParams;

      const queries: string[] = [
        Query.equal("status", "open"),
        Query.equal("visibility", "public"),
        Query.limit(limit),
        Query.offset((page - 1) * limit)
      ];

      if (query) {
        queries.push(Query.search("title", query));
      }

      if (category) {
        queries.push(Query.equal("category", category));
      }

      // Fetch projects based on query
      const response = await databases.listDocuments(
        PROJECT_DATABASE_ID,
        PROJECTS_COLLECTION_ID,
        queries
      );

      // Additional filtering for budget and skills
      let filteredProjects = response.documents as unknown as Project[];

      if (minBudget !== undefined) {
        filteredProjects = filteredProjects.filter(
          project => project.budget.max >= minBudget
        );
      }

      if (maxBudget !== undefined) {
        filteredProjects = filteredProjects.filter(
          project => project.budget.min <= maxBudget
        );
      }

      if (skills.length > 0) {
        filteredProjects = filteredProjects.filter(project => 
          project.skills.some(skill => skills.includes(skill))
        );
      }

      return {
        projects: filteredProjects,
        total: response.total
      };
    } catch (error) {
      console.error("Error searching projects:", error);
      return { projects: [], total: 0 };
    }
  }
}

// Export single instance
const projectService = new ProjectService();
export default projectService;