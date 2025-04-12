use cosmwasm_schema::QueryResponses;
use cosmwasm_std::{Timestamp, Uint128};
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};

use crate::state::{ProjectStatus, ProposalStatus, MilestoneStatus};

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct InstantiateMsg {
    pub platform_fee_percent: u64, // in basis points (e.g., 250 = 2.5%)
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
#[serde(rename_all = "snake_case")]
pub enum ExecuteMsg {
    CreateProject {
        title: String,
        description: String,
        deadline: u64, // Seconds from current time
    },
    SubmitProposal {
        project_id: u64,
        description: String,
        price: Uint128,
        timeline_in_days: u64,
    },
    AcceptProposal {
        project_id: u64,
        proposal_id: u64,
    },
    CreateMilestone {
        project_id: u64,
        description: String,
        amount: Uint128,
    },
    SubmitMilestone {
        project_id: u64,
        milestone_id: u64,
    },
    ApproveMilestone {
        project_id: u64,
        milestone_id: u64,
    },
    CreateDispute {
        project_id: u64,
        reason: String,
    },
    VoteOnDispute {
        project_id: u64,
        vote_for_client: bool,
    },
    SubmitReview {
        project_id: u64,
        rating: u8,  // 1-5
        comment: String,
    },
    UpdatePlatformFee {
        new_fee_percent: u64,
    },
    CancelProject {
        project_id: u64,
    },
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema, QueryResponses)]
#[serde(rename_all = "snake_case")]
pub enum QueryMsg {
    #[returns(ProjectResponse)]
    GetProject { project_id: u64 },
    
    #[returns(ProposalResponse)]
    GetProposal { proposal_id: u64 },
    
    #[returns(MilestoneResponse)]
    GetMilestone { milestone_id: u64 },
    
    #[returns(DisputeResponse)]
    GetDispute { project_id: u64 },
    
    #[returns(Vec<u64>)]
    GetUserProjects { user: String },
    
    #[returns(Vec<u64>)]
    GetProjectProposals { project_id: u64 },
    
    #[returns(Vec<u64>)]
    GetProjectMilestones { project_id: u64 },
    
    #[returns(UserRatingResponse)]
    GetUserRating { user: String },
    
    #[returns(ConfigResponse)]
    GetConfig {},
    
    #[returns(ProjectsResponse)]
    ListProjects { 
        start_after: Option<u64>,
        limit: Option<u32>,
    },
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct ProjectResponse {
    pub id: u64,
    pub client: String,
    pub title: String,
    pub description: String,
    pub budget: Uint128,
    pub deadline: Timestamp,
    pub status: ProjectStatus,
    pub freelancer: Option<String>,
    pub created_at: Timestamp,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct ProjectsResponse {
    pub projects: Vec<ProjectResponse>,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct ProposalResponse {
    pub id: u64,
    pub project_id: u64,
    pub freelancer: String,
    pub description: String,
    pub price: Uint128,
    pub timeline_in_days: u64,
    pub status: ProposalStatus,
    pub created_at: Timestamp,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct MilestoneResponse {
    pub id: u64,
    pub project_id: u64,
    pub description: String,
    pub amount: Uint128,
    pub status: MilestoneStatus,
    pub created_at: Timestamp,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct DisputeResponse {
    pub id: u64,
    pub project_id: u64,
    pub initiator: String,
    pub reason: String,
    pub votes_for_client: Uint128,
    pub votes_for_freelancer: Uint128,
    pub resolved: bool,
    pub created_at: Timestamp,
    pub voters: Vec<String>,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct UserRatingResponse {
    pub user: String,
    pub rating: Uint128,
    pub count: u64,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct ConfigResponse {
    pub owner: String,
    pub platform_fee_percent: u64,
}