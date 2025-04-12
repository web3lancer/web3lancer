use cosmwasm_std::{Addr, Timestamp, Uint128};
use cw_storage_plus::{Item, Map};
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct Config {
    pub owner: Addr,
    pub platform_fee_percent: u64, // in basis points (e.g., 250 = 2.5%)
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
#[serde(rename_all = "snake_case")]
pub enum ProjectStatus {
    Open,
    InProgress,
    UnderReview,
    Disputed,
    Completed,
    Cancelled,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
#[serde(rename_all = "snake_case")]
pub enum ProposalStatus {
    Pending,
    Accepted,
    Rejected,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
#[serde(rename_all = "snake_case")]
pub enum MilestoneStatus {
    Pending,
    InProgress,
    Submitted,
    Approved,
    Rejected,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct Project {
    pub id: u64,
    pub client: Addr,
    pub title: String,
    pub description: String,
    pub budget: Uint128,
    pub deadline: Timestamp,
    pub status: ProjectStatus,
    pub freelancer: Option<Addr>,
    pub created_at: Timestamp,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct Proposal {
    pub id: u64,
    pub project_id: u64,
    pub freelancer: Addr,
    pub description: String,
    pub price: Uint128,
    pub timeline_in_days: u64,
    pub status: ProposalStatus,
    pub created_at: Timestamp,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct Milestone {
    pub id: u64,
    pub project_id: u64,
    pub description: String,
    pub amount: Uint128,
    pub status: MilestoneStatus,
    pub created_at: Timestamp,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct Dispute {
    pub id: u64,
    pub project_id: u64,
    pub initiator: Addr,
    pub reason: String,
    pub votes_for_client: Uint128,
    pub votes_for_freelancer: Uint128,
    pub resolved: bool,
    pub created_at: Timestamp,
    pub voters: Vec<Addr>,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct Review {
    pub id: u64,
    pub project_id: u64,
    pub reviewer: Addr,
    pub reviewee: Addr,
    pub rating: u8, // 1-5
    pub comment: String,
    pub created_at: Timestamp,
}

// Define storage items
pub const CONFIG: Item<Config> = Item::new("config");
pub const PROJECTS: Map<u64, Project> = Map::new("projects");
pub const PROPOSALS: Map<u64, Proposal> = Map::new("proposals");
pub const MILESTONES: Map<u64, Milestone> = Map::new("milestones");
pub const DISPUTES: Map<u64, Dispute> = Map::new("disputes");
pub const REVIEWS: Map<u64, Review> = Map::new("reviews");
pub const USER_PROJECTS: Map<&Addr, Vec<u64>> = Map::new("user_projects");
pub const USER_RATINGS: Map<&Addr, (Uint128, u64)> = Map::new("user_ratings"); // (total_rating, count)
pub const VOTING_POWER: Map<&Addr, Uint128> = Map::new("voting_power");
pub const NEXT_ID: Item<u64> = Item::new("next_id");
pub const PROJECT_PROPOSALS: Map<u64, Vec<u64>> = Map::new("project_proposals");
pub const PROJECT_MILESTONES: Map<u64, Vec<u64>> = Map::new("project_milestones");
pub const HAS_VOTED: Map<(u64, &Addr), bool> = Map::new("has_voted");