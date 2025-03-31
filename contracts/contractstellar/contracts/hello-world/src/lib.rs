#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, vec, Env, String, Vec, Map, Address, BytesN};

#[contract]
pub struct Contract;

// Define data structures for Web3Lancer
#[contracttype]
pub enum DataKey {
    Projects(BytesN<32>),
    ProjectCounter,
    UserProjects(Address),
    ProjectMilestones(BytesN<32>),
}

#[contracttype]
pub struct Project {
    id: BytesN<32>,
    client: Address,
    freelancer: Address,
    total_payment: i128,
    title: String,
    description: String,
    status: ProjectStatus,
    created_at: u64,
}

#[contracttype]
pub enum ProjectStatus {
    Created,
    InProgress,
    Completed,
    Cancelled,
}

#[contracttype]
pub struct Milestone {
    id: u32,
    description: String,
    amount: i128,
    completed: bool,
    approved: bool,
}

#[contractimpl]
impl Contract {
    // Create a new project with milestones
    pub fn create_project(
        env: Env,
        client: Address,
        freelancer: Address,
        total_payment: i128,
        title: String,
        description: String,
        milestone_descriptions: Vec<String>,
        milestone_amounts: Vec<i128>,
    ) -> BytesN<32> {
        // Require client authorization
        client.require_auth();
        
        // Validate milestone amounts sum to total payment
        let mut sum = 0;
        for i in 0..milestone_amounts.len() {
            sum += milestone_amounts.get(i).unwrap();
        }
        assert_eq!(sum, total_payment, "Milestone amounts must sum to total payment");
        
        // Generate project ID
        let counter: u32 = env.storage().instance().get(&DataKey::ProjectCounter).unwrap_or(0);
        let next_counter = counter + 1;
        env.storage().instance().set(&DataKey::ProjectCounter, &next_counter);
        
        let id_seed = env.crypto().sha256(&(client.clone(), freelancer.clone(), next_counter).into_val(&env));
        
        // Create project
        let project = Project {
            id: id_seed.clone(),
            client: client.clone(),
            freelancer: freelancer.clone(),
            total_payment,
            title,
            description,
            status: ProjectStatus::Created,
            created_at: env.ledger().timestamp(),
        };
        
        // Store project
        env.storage().persistent().set(&DataKey::Projects(id_seed.clone()), &project);
        
        // Create and store milestones
        let mut milestones = Vec::new(&env);
        for i in 0..milestone_descriptions.len() {
            let milestone = Milestone {
                id: i as u32,
                description: milestone_descriptions.get(i).unwrap(),
                amount: milestone_amounts.get(i).unwrap(),
                completed: false,
                approved: false,
            };
            milestones.push_back(milestone);
        }
        
        // Store milestones for this project
        env.storage().persistent().set(&DataKey::ProjectMilestones(id_seed.clone()), &milestones);
        
        // Add to user's projects
        self.add_project_to_user(&env, &client, &id_seed);
        self.add_project_to_user(&env, &freelancer, &id_seed);
        
        // Return the project ID
        id_seed
    }
    
    // Helper to add project to a user's list
    fn add_project_to_user(
        &self,
        env: &Env,
        user: &Address,
        project_id: &BytesN<32>,
    ) {
        let mut user_projects: Vec<BytesN<32>> = env.storage().persistent().get(&DataKey::UserProjects(user.clone())).unwrap_or(Vec::new(env));
        user_projects.push_back(project_id.clone());
        env.storage().persistent().set(&DataKey::UserProjects(user.clone()), &user_projects);
    }
    
    // Start project (change status to InProgress)
    pub fn start_project(
        env: Env,
        client: Address,
        project_id: BytesN<32>,
    ) -> bool {
        // Require client authorization
        client.require_auth();
        
        // Get project
        let mut project: Project = env.storage().persistent().get(&DataKey::Projects(project_id.clone())).unwrap();
        
        // Verify client
        assert_eq!(project.client, client, "Only the client can start the project");
        
        // Update status
        project.status = ProjectStatus::InProgress;
        
        // Save project
        env.storage().persistent().set(&DataKey::Projects(project_id), &project);
        
        true
    }
    
    // Mark milestone as completed (by freelancer)
    pub fn complete_milestone(
        env: Env,
        freelancer: Address,
        project_id: BytesN<32>,
        milestone_id: u32,
    ) -> bool {
        // Require freelancer authorization
        freelancer.require_auth();
        
        // Get project
        let project: Project = env.storage().persistent().get(&DataKey::Projects(project_id.clone())).unwrap();
        
        // Verify freelancer
        assert_eq!(project.freelancer, freelancer, "Only the assigned freelancer can complete milestones");
        assert_eq!(project.status, ProjectStatus::InProgress, "Project must be in progress");
        
        // Get milestones
        let mut milestones: Vec<Milestone> = env.storage().persistent().get(&DataKey::ProjectMilestones(project_id.clone())).unwrap();
        
        // Find and update milestone
        let mut milestone = milestones.get(milestone_id as u32).unwrap();
        assert!(!milestone.completed, "Milestone already completed");
        
        milestone.completed = true;
        milestones.set(milestone_id as u32, milestone);
        
        // Store updated milestones
        env.storage().persistent().set(&DataKey::ProjectMilestones(project_id), &milestones);
        
        true
    }
    
    // Approve and release milestone payment (by client)
    pub fn approve_milestone(
        env: Env,
        client: Address,
        project_id: BytesN<32>,
        milestone_id: u32,
    ) -> bool {
        // Require client authorization
        client.require_auth();
        
        // Get project
        let mut project: Project = env.storage().persistent().get(&DataKey::Projects(project_id.clone())).unwrap();
        
        // Verify client
        assert_eq!(project.client, client, "Only the client can approve milestones");
        
        // Get milestones
        let mut milestones: Vec<Milestone> = env.storage().persistent().get(&DataKey::ProjectMilestones(project_id.clone())).unwrap();
        
        // Find and update milestone
        let mut milestone = milestones.get(milestone_id as u32).unwrap();
        assert!(milestone.completed, "Milestone must be completed before approval");
        assert!(!milestone.approved, "Milestone already approved");
        
        milestone.approved = true;
        milestones.set(milestone_id as u32, milestone);
        
        // Store updated milestones
        env.storage().persistent().set(&DataKey::ProjectMilestones(project_id.clone()), &milestones);
        
        // Check if all milestones are approved
        let all_approved = milestones.iter().all(|m| m.approved);
        if all_approved {
            project.status = ProjectStatus::Completed;
            env.storage().persistent().set(&DataKey::Projects(project_id), &project);
        }
        
        true
    }
    
    // Get project details
    pub fn get_project(
        env: Env,
        project_id: BytesN<32>,
    ) -> Project {
        env.storage().persistent().get(&DataKey::Projects(project_id)).unwrap()
    }
    
    // Get project milestones
    pub fn get_milestones(
        env: Env,
        project_id: BytesN<32>,
    ) -> Vec<Milestone> {
        env.storage().persistent().get(&DataKey::ProjectMilestones(project_id)).unwrap()
    }
    
    // Get projects for a user
    pub fn get_user_projects(
        env: Env,
        user: Address,
    ) -> Vec<Project> {
        let project_ids: Vec<BytesN<32>> = env.storage().persistent().get(&DataKey::UserProjects(user.clone())).unwrap_or(Vec::new(&env));
        
        let mut projects = Vec::new(&env);
        for id in project_ids.iter() {
            let project: Project = env.storage().persistent().get(&DataKey::Projects(id)).unwrap();
            projects.push_back(project);
        }
        
        projects
    }
}

mod test;
