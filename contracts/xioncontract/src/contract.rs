#[cfg(not(feature = "library"))]
use cosmwasm_std::entry_point;
use cosmwasm_std::{to_json_binary, Binary, Deps, DepsMut, Env, MessageInfo, Response, StdResult, Uint128, Order, Event};
use std::ops::Bound;
use cw2::set_contract_version;

use crate::error::ContractError;
use crate::msg::{ExecuteMsg, InstantiateMsg, QueryMsg, ProjectResponse, ProjectsResponse, ProposalResponse, MilestoneResponse, DisputeResponse, UserRatingResponse, ConfigResponse};
use crate::state::{Config, Project, Proposal, Milestone, Dispute, Review, ProjectStatus, ProposalStatus, MilestoneStatus, CONFIG, PROJECTS, PROPOSALS, MILESTONES, DISPUTES, REVIEWS, USER_PROJECTS, USER_RATINGS, VOTING_POWER, PROJECT_PROPOSALS, PROJECT_MILESTONES, HAS_VOTED, NEXT_ID};

// version info for migration info
const CONTRACT_NAME: &str = "crates.io:web3lancer";
const CONTRACT_VERSION: &str = env!("CARGO_PKG_VERSION");

#[cfg_attr(not(feature = "library"), entry_point)]
pub fn instantiate(
    deps: DepsMut,
    _env: Env,
    info: MessageInfo,
    msg: InstantiateMsg,
) -> Result<Response, ContractError> {
    // Validate platform fee (should not exceed 10%)
    if msg.platform_fee_percent > 1000 {
        return Err(ContractError::InvalidFee {});
    }

    // Initialize config
    let config = Config {
        owner: info.sender.clone(),
        platform_fee_percent: msg.platform_fee_percent,
    };
    CONFIG.save(deps.storage, &config)?;
    
    // Initialize counter for IDs
    NEXT_ID.save(deps.storage, &1u64)?;
    
    set_contract_version(deps.storage, CONTRACT_NAME, CONTRACT_VERSION)?;
    
    Ok(Response::new()
        .add_attribute("method", "instantiate")
        .add_attribute("owner", info.sender)
        .add_attribute("platform_fee_percent", msg.platform_fee_percent.to_string()))
}

#[cfg_attr(not(feature = "library"), entry_point)]
pub fn execute(
    deps: DepsMut,
    env: Env,
    info: MessageInfo,
    msg: ExecuteMsg,
) -> Result<Response, ContractError> {
    match msg {
        ExecuteMsg::CreateProject { title, description, deadline } => {
            execute_create_project(deps, env, info, title, description, deadline)
        },
        ExecuteMsg::SubmitProposal { project_id, description, price, timeline_in_days } => {
            execute_submit_proposal(deps, env, info, project_id, description, price, timeline_in_days)
        },
        ExecuteMsg::AcceptProposal { project_id, proposal_id } => {
            execute_accept_proposal(deps, env, info, project_id, proposal_id)
        },
        ExecuteMsg::CreateMilestone { project_id, description, amount } => {
            execute_create_milestone(deps, env, info, project_id, description, amount)
        },
        ExecuteMsg::SubmitMilestone { project_id, milestone_id } => {
            execute_submit_milestone(deps, env, info, project_id, milestone_id)
        },
        ExecuteMsg::ApproveMilestone { project_id, milestone_id } => {
            execute_approve_milestone(deps, env, info, project_id, milestone_id)
        },
        ExecuteMsg::CreateDispute { project_id, reason } => {
            execute_create_dispute(deps, env, info, project_id, reason)
        },
        ExecuteMsg::VoteOnDispute { project_id, vote_for_client } => {
            execute_vote_on_dispute(deps, env, info, project_id, vote_for_client)
        },
        ExecuteMsg::SubmitReview { project_id, rating, comment } => {
            execute_submit_review(deps, env, info, project_id, rating, comment)
        },
        ExecuteMsg::UpdatePlatformFee { new_fee_percent } => {
            execute_update_platform_fee(deps, env, info, new_fee_percent)
        },
        ExecuteMsg::CancelProject { project_id } => {
            execute_cancel_project(deps, env, info, project_id)
        },
    }
}

pub fn execute_create_project(
    deps: DepsMut, 
    env: Env, 
    info: MessageInfo, 
    title: String, 
    description: String, 
    deadline: u64
) -> Result<Response, ContractError> {
    // Validations
    if title.is_empty() {
        return Err(ContractError::EmptyTitle {});
    }
    if description.is_empty() {
        return Err(ContractError::EmptyDescription {});
    }
    
    let deadline_time = env.block.time.plus_seconds(deadline);
    
    // Ensure funds are sent for the project budget
    let funds = info.funds.iter().fold(Uint128::zero(), |sum, coin| {
        if coin.denom == "uxion" { // Using uxion as the native token
            sum + coin.amount
        } else {
            sum
        }
    });
    
    if funds.is_zero() {
        return Err(ContractError::InsufficientFunds {});
    }

    // Get next ID
    let id = NEXT_ID.load(deps.storage)?;
    NEXT_ID.save(deps.storage, &(id + 1))?;

    // Create new project
    let project = Project {
        id,
        client: info.sender.clone(),
        title,
        description,
        budget: funds,
        deadline: deadline_time,
        status: ProjectStatus::Open,
        freelancer: None,
        created_at: env.block.time,
    };
    PROJECTS.save(deps.storage, id, &project)?;

    // Add project to client's list
    let mut user_projects = USER_PROJECTS
        .may_load(deps.storage, &info.sender)?
        .unwrap_or_default();
    user_projects.push(id);
    USER_PROJECTS.save(deps.storage, &info.sender, &user_projects)?;

    // Initialize empty vectors for proposals and milestones
    PROJECT_PROPOSALS.save(deps.storage, id, &Vec::<u64>::new())?;
    PROJECT_MILESTONES.save(deps.storage, id, &Vec::<u64>::new())?;

    let event = Event::new("web3lancer-project-created")
        .add_attribute("project_id", id.to_string())
        .add_attribute("client", info.sender.to_string())
        .add_attribute("budget", funds.to_string());

    Ok(Response::new()
        .add_event(event)
        .add_attribute("method", "create_project")
        .add_attribute("project_id", id.to_string())
        .add_attribute("client", info.sender.to_string())
        .add_attribute("budget", funds.to_string()))
}

pub fn execute_submit_proposal(
    deps: DepsMut,
    env: Env,
    info: MessageInfo,
    project_id: u64,
    description: String,
    price: Uint128,
    timeline_in_days: u64,
) -> Result<Response, ContractError> {
    // Load project
    let project = PROJECTS.load(deps.storage, project_id)?;

    // Validations
    if project.status != ProjectStatus::Open {
        return Err(ContractError::ProjectNotOpen {});
    }
    
    if project.client == info.sender {
        return Err(ContractError::Unauthorized {});
    }
    
    if price > project.budget {
        return Err(ContractError::ExceedsBudget {});
    }
    
    if description.is_empty() {
        return Err(ContractError::EmptyDescription {});
    }

    // Get next ID
    let id = NEXT_ID.load(deps.storage)?;
    NEXT_ID.save(deps.storage, &(id + 1))?;

    // Create new proposal
    let proposal = Proposal {
        id,
        project_id,
        freelancer: info.sender.clone(),
        description,
        price,
        timeline_in_days,
        status: ProposalStatus::Pending,
        created_at: env.block.time,
    };
    PROPOSALS.save(deps.storage, id, &proposal)?;

    // Add proposal to project's list
    let mut project_proposals = PROJECT_PROPOSALS.load(deps.storage, project_id)?;
    project_proposals.push(id);
    PROJECT_PROPOSALS.save(deps.storage, project_id, &project_proposals)?;

    let event = Event::new("web3lancer-proposal-submitted")
        .add_attribute("proposal_id", id.to_string())
        .add_attribute("project_id", project_id.to_string())
        .add_attribute("freelancer", info.sender.to_string());

    Ok(Response::new()
        .add_event(event)
        .add_attribute("method", "submit_proposal")
        .add_attribute("proposal_id", id.to_string())
        .add_attribute("project_id", project_id.to_string())
        .add_attribute("freelancer", info.sender.to_string()))
}

pub fn execute_accept_proposal(
    deps: DepsMut,
    _env: Env,
    info: MessageInfo,
    project_id: u64,
    proposal_id: u64,
) -> Result<Response, ContractError> {
    // Load project
    let mut project = PROJECTS.load(deps.storage, project_id)?;

    // Validate caller is project client
    if project.client != info.sender {
        return Err(ContractError::Unauthorized {});
    }

    // Validate project is open
    if project.status != ProjectStatus::Open {
        return Err(ContractError::ProjectNotOpen {});
    }

    // Load proposal
    let mut proposal = PROPOSALS.load(deps.storage, proposal_id)?;

    // Validate proposal is for this project
    if proposal.project_id != project_id {
        return Err(ContractError::InvalidProposal {});
    }

    // Validate proposal is pending
    if proposal.status != ProposalStatus::Pending {
        return Err(ContractError::ProposalNotPending {});
    }

    // Accept proposal and update project
    proposal.status = ProposalStatus::Accepted;
    PROPOSALS.save(deps.storage, proposal_id, &proposal)?;

    project.status = ProjectStatus::InProgress;
    project.freelancer = Some(proposal.freelancer.clone());
    PROJECTS.save(deps.storage, project_id, &project)?;

    // Add project to freelancer's list
    let mut freelancer_projects = USER_PROJECTS
        .may_load(deps.storage, &proposal.freelancer)?
        .unwrap_or_default();
    freelancer_projects.push(project_id);
    USER_PROJECTS.save(deps.storage, &proposal.freelancer, &freelancer_projects)?;

    // Reject all other proposals
    let project_proposals = PROJECT_PROPOSALS.load(deps.storage, project_id)?;
    for other_proposal_id in project_proposals {
        if other_proposal_id != proposal_id {
            if let Ok(mut other_proposal) = PROPOSALS.load(deps.storage, other_proposal_id) {
                if other_proposal.status == ProposalStatus::Pending {
                    other_proposal.status = ProposalStatus::Rejected;
                    PROPOSALS.save(deps.storage, other_proposal_id, &other_proposal)?;
                }
            }
        }
    }

    let event = Event::new("web3lancer-proposal-accepted")
        .add_attribute("proposal_id", proposal_id.to_string())
        .add_attribute("project_id", project_id.to_string())
        .add_attribute("freelancer", proposal.freelancer.to_string());

    Ok(Response::new()
        .add_event(event)
        .add_attribute("method", "accept_proposal")
        .add_attribute("proposal_id", proposal_id.to_string())
        .add_attribute("project_id", project_id.to_string())
        .add_attribute("freelancer", proposal.freelancer.to_string()))
}

// More execute functions to be implemented below...
pub fn execute_create_milestone(
    deps: DepsMut,
    env: Env,
    info: MessageInfo,
    project_id: u64,
    description: String,
    amount: Uint128,
) -> Result<Response, ContractError> {
    // Load project
    let project = PROJECTS.load(deps.storage, project_id)?;

    // Validate caller is project client
    if project.client != info.sender {
        return Err(ContractError::Unauthorized {});
    }

    // Validate project is in progress
    if project.status != ProjectStatus::InProgress {
        return Err(ContractError::ProjectNotInProgress {});
    }

    if description.is_empty() {
        return Err(ContractError::EmptyDescription {});
    }

    if amount.is_zero() {
        return Err(ContractError::InvalidAmount {});
    }

    // Check total milestone amounts don't exceed budget
    let project_milestones = PROJECT_MILESTONES.load(deps.storage, project_id)?;
    let mut total_milestone_amount = amount;
    
    for milestone_id in &project_milestones {
        let milestone = MILESTONES.load(deps.storage, *milestone_id)?;
        total_milestone_amount += milestone.amount;
    }
    
    if total_milestone_amount > project.budget {
        return Err(ContractError::ExceedsBudget {});
    }

    // Get next ID
    let id = NEXT_ID.load(deps.storage)?;
    NEXT_ID.save(deps.storage, &(id + 1))?;

    // Create new milestone
    let milestone = Milestone {
        id,
        project_id,
        description,
        amount,
        status: MilestoneStatus::Pending,
        created_at: env.block.time,
    };
    MILESTONES.save(deps.storage, id, &milestone)?;

    // Add milestone to project's list
    let mut project_milestones = PROJECT_MILESTONES.load(deps.storage, project_id)?;
    project_milestones.push(id);
    PROJECT_MILESTONES.save(deps.storage, project_id, &project_milestones)?;

    let event = Event::new("web3lancer-milestone-created")
        .add_attribute("milestone_id", id.to_string())
        .add_attribute("project_id", project_id.to_string())
        .add_attribute("amount", amount.to_string());

    Ok(Response::new()
        .add_event(event)
        .add_attribute("method", "create_milestone")
        .add_attribute("milestone_id", id.to_string())
        .add_attribute("project_id", project_id.to_string()))
}

pub fn execute_submit_milestone(
    deps: DepsMut,
    _env: Env,
    info: MessageInfo,
    project_id: u64,
    milestone_id: u64,
) -> Result<Response, ContractError> {
    // Load project
    let project = PROJECTS.load(deps.storage, project_id)?;

    // Validate freelancer is calling
    if project.freelancer != Some(info.sender.clone()) {
        return Err(ContractError::Unauthorized {});
    }

    // Validate project is in progress
    if project.status != ProjectStatus::InProgress {
        return Err(ContractError::ProjectNotInProgress {});
    }

    // Load milestone
    let mut milestone = MILESTONES.load(deps.storage, milestone_id)?;

    // Validate milestone belongs to project
    if milestone.project_id != project_id {
        return Err(ContractError::InvalidMilestone {});
    }

    // Validate milestone status
    if milestone.status != MilestoneStatus::Pending && milestone.status != MilestoneStatus::Rejected {
        return Err(ContractError::InvalidMilestoneStatus {});
    }

    // Update milestone status
    milestone.status = MilestoneStatus::Submitted;
    MILESTONES.save(deps.storage, milestone_id, &milestone)?;

    let event = Event::new("web3lancer-milestone-submitted")
        .add_attribute("milestone_id", milestone_id.to_string())
        .add_attribute("project_id", project_id.to_string());

    Ok(Response::new()
        .add_event(event)
        .add_attribute("method", "submit_milestone")
        .add_attribute("milestone_id", milestone_id.to_string())
        .add_attribute("project_id", project_id.to_string()))
}

pub fn execute_approve_milestone(
    deps: DepsMut,
    env: Env,
    info: MessageInfo,
    project_id: u64,
    milestone_id: u64,
) -> Result<Response, ContractError> {
    // Load project
    let mut project = PROJECTS.load(deps.storage, project_id)?;

    // Validate client is calling
    if project.client != info.sender {
        return Err(ContractError::Unauthorized {});
    }

    // Validate project is in progress
    if project.status != ProjectStatus::InProgress {
        return Err(ContractError::ProjectNotInProgress {});
    }

    // Load milestone
    let mut milestone = MILESTONES.load(deps.storage, milestone_id)?;

    // Validate milestone belongs to project
    if milestone.project_id != project_id {
        return Err(ContractError::InvalidMilestone {});
    }

    // Validate milestone status
    if milestone.status != MilestoneStatus::Submitted {
        return Err(ContractError::MilestoneNotSubmitted {});
    }

    // Update milestone status
    milestone.status = MilestoneStatus::Approved;
    MILESTONES.save(deps.storage, milestone_id, &milestone)?;

    // Check if all milestones are completed
    let project_milestones = PROJECT_MILESTONES.load(deps.storage, project_id)?;
    let mut all_completed = true;
    
    for &mid in &project_milestones {
        let m = MILESTONES.load(deps.storage, mid)?;
        if m.status != MilestoneStatus::Approved {
            all_completed = false;
            break;
        }
    }

    // If all milestones are completed, mark project as completed
    if all_completed && !project_milestones.is_empty() {
        project.status = ProjectStatus::Completed;
        PROJECTS.save(deps.storage, project_id, &project)?;
    }

    let event = Event::new("web3lancer-milestone-approved")
        .add_attribute("milestone_id", milestone_id.to_string())
        .add_attribute("project_id", project_id.to_string());

    Ok(Response::new()
        .add_event(event)
        .add_attribute("method", "approve_milestone")
        .add_attribute("milestone_id", milestone_id.to_string())
        .add_attribute("project_id", project_id.to_string()))
}

pub fn execute_create_dispute(
    deps: DepsMut,
    env: Env,
    info: MessageInfo,
    project_id: u64,
    reason: String,
) -> Result<Response, ContractError> {
    // Load project
    let mut project = PROJECTS.load(deps.storage, project_id)?;

    // Validate caller is either client or freelancer
    let is_client = project.client == info.sender;
    let is_freelancer = project.freelancer == Some(info.sender.clone());
    
    if !is_client && !is_freelancer {
        return Err(ContractError::Unauthorized {});
    }

    // Validate project is in progress
    if project.status != ProjectStatus::InProgress {
        return Err(ContractError::ProjectNotInProgress {});
    }

    if reason.is_empty() {
        return Err(ContractError::EmptyReason {});
    }

    // Create dispute with project_id as its ID
    let dispute = Dispute {
        id: project_id,
        project_id,
        initiator: info.sender.clone(),
        reason,
        votes_for_client: Uint128::zero(),
        votes_for_freelancer: Uint128::zero(),
        resolved: false,
        created_at: env.block.time,
        voters: Vec::new(),
    };
    
    DISPUTES.save(deps.storage, project_id, &dispute)?;

    // Update project status
    project.status = ProjectStatus::Disputed;
    PROJECTS.save(deps.storage, project_id, &project)?;

    let event = Event::new("web3lancer-dispute-created")
        .add_attribute("dispute_id", project_id.to_string())
        .add_attribute("project_id", project_id.to_string())
        .add_attribute("initiator", info.sender.to_string());

    Ok(Response::new()
        .add_event(event)
        .add_attribute("method", "create_dispute")
        .add_attribute("dispute_id", project_id.to_string())
        .add_attribute("project_id", project_id.to_string())
        .add_attribute("initiator", info.sender.to_string()))
}

pub fn execute_vote_on_dispute(
    deps: DepsMut,
    _env: Env,
    info: MessageInfo,
    project_id: u64,
    vote_for_client: bool,
) -> Result<Response, ContractError> {
    // Load project
    let project = PROJECTS.load(deps.storage, project_id)?;

    // Validate project is disputed
    if project.status != ProjectStatus::Disputed {
        return Err(ContractError::ProjectNotDisputed {});
    }

    // Validate voter is not client or freelancer
    if project.client == info.sender || project.freelancer == Some(info.sender.clone()) {
        return Err(ContractError::Unauthorized {});
    }

    // Load dispute
    let mut dispute = DISPUTES.load(deps.storage, project_id)?;

    // Validate dispute is not resolved
    if dispute.resolved {
        return Err(ContractError::DisputeResolved {});
    }

    // Check if user has already voted
    if HAS_VOTED.may_load(deps.storage, (project_id, &info.sender))?.unwrap_or(false) {
        return Err(ContractError::AlreadyVoted {});
    }

    // Calculate voting power based on user reputation
    let power = VOTING_POWER
        .may_load(deps.storage, &info.sender)?
        .unwrap_or_else(|| Uint128::from(1u128)); // Default voting power is 1

    // Record the vote
    if vote_for_client {
        dispute.votes_for_client += power;
    } else {
        dispute.votes_for_freelancer += power;
    }

    HAS_VOTED.save(deps.storage, (project_id, &info.sender), &true)?;
    dispute.voters.push(info.sender.clone());
    
    let mut response = Response::new()
        .add_attribute("method", "vote_on_dispute")
        .add_attribute("project_id", project_id.to_string())
        .add_attribute("voter", info.sender.to_string())
        .add_attribute("vote_for_client", vote_for_client.to_string());

    // Check if dispute can be resolved (require minimum 3 voters)
    if dispute.voters.len() >= 3 {
        // Determine winner
        if dispute.votes_for_client > dispute.votes_for_freelancer {
            response = resolve_dispute(&mut deps, project_id, true, response)?;
        } else if dispute.votes_for_freelancer > dispute.votes_for_client {
            response = resolve_dispute(&mut deps, project_id, false, response)?;
        }
        // If tie, continue voting
    }

    // Save updated dispute
    DISPUTES.save(deps.storage, project_id, &dispute)?;

    Ok(response)
}

fn resolve_dispute(
    deps: &mut DepsMut,
    project_id: u64,
    client_wins: bool,
    mut response: Response,
) -> Result<Response, ContractError> {
    // Load project
    let mut project = PROJECTS.load(deps.storage, project_id)?;
    
    // Load dispute
    let mut dispute = DISPUTES.load(deps.storage, project_id)?;
    
    dispute.resolved = true;
    DISPUTES.save(deps.storage, project_id, &dispute)?;
    
    let winner = if client_wins {
        project.client.to_string()
    } else {
        project.freelancer.clone().map(|addr| addr.to_string()).unwrap_or_else(|| "".to_string())
    };
    
    if client_wins {
        project.status = ProjectStatus::Cancelled;
    } else {
        project.status = ProjectStatus::InProgress;
    }
    
    PROJECTS.save(deps.storage, project_id, &project)?;
    
    let event = Event::new("web3lancer-dispute-resolved")
        .add_attribute("dispute_id", project_id.to_string())
        .add_attribute("project_id", project_id.to_string())
        .add_attribute("winner", winner.clone());
        
    response = response
        .add_event(event)
        .add_attribute("dispute_resolved", "true")
        .add_attribute("winner", winner);
        
    Ok(response)
}

pub fn execute_submit_review(
    deps: DepsMut,
    env: Env,
    info: MessageInfo,
    project_id: u64,
    rating: u8,
    comment: String,
) -> Result<Response, ContractError> {
    // Load project
    let project = PROJECTS.load(deps.storage, project_id)?;

    // Validate project is completed
    if project.status != ProjectStatus::Completed {
        return Err(ContractError::ProjectNotCompleted {});
    }

    // Validate caller is either client or freelancer
    let is_client = project.client == info.sender;
    let is_freelancer = project.freelancer == Some(info.sender.clone());
    
    if !is_client && !is_freelancer {
        return Err(ContractError::Unauthorized {});
    }

    // Validate rating
    if rating < 1 || rating > 5 {
        return Err(ContractError::InvalidRating {});
    }

    // Determine reviewee
    let reviewee = if is_client {
        project.freelancer.clone().unwrap()
    } else {
        project.client.clone()
    };

    // Get next ID
    let id = NEXT_ID.load(deps.storage)?;
    NEXT_ID.save(deps.storage, &(id + 1))?;

    // Create new review
    let review = Review {
        id,
        project_id,
        reviewer: info.sender.clone(),
        reviewee: reviewee.clone(),
        rating,
        comment,
        created_at: env.block.time,
    };
    
    REVIEWS.save(deps.storage, id, &review)?;

    // Update user rating
    let (total_rating, count) = USER_RATINGS
        .may_load(deps.storage, &reviewee)?
        .unwrap_or((Uint128::zero(), 0u64));
        
    let new_count = count + 1;
    let new_total = total_rating + Uint128::from(rating as u128);
    
    USER_RATINGS.save(deps.storage, &reviewee, &(new_total, new_count))?;
    
    // Update voting power based on rating
    let avg_rating = new_total.checked_div(Uint128::from(new_count)).unwrap_or(Uint128::zero());
    VOTING_POWER.save(deps.storage, &reviewee, &avg_rating)?;

    let event = Event::new("web3lancer-review-submitted")
        .add_attribute("review_id", id.to_string())
        .add_attribute("project_id", project_id.to_string())
        .add_attribute("reviewer", info.sender.to_string())
        .add_attribute("reviewee", reviewee.to_string())
        .add_attribute("rating", rating.to_string());

    Ok(Response::new()
        .add_event(event)
        .add_attribute("method", "submit_review")
        .add_attribute("review_id", id.to_string())
        .add_attribute("project_id", project_id.to_string())
        .add_attribute("rating", rating.to_string()))
}

pub fn execute_update_platform_fee(
    deps: DepsMut,
    info: MessageInfo,
    new_fee_percent: u64,
) -> Result<Response, ContractError> {
    // Load config
    let mut config = CONFIG.load(deps.storage)?;

    // Validate caller is owner
    if config.owner != info.sender {
        return Err(ContractError::Unauthorized {});
    }

    // Validate fee percentage
    if new_fee_percent > 1000 {
        return Err(ContractError::InvalidFee {});
    }

    // Update fee
    config.platform_fee_percent = new_fee_percent;
    CONFIG.save(deps.storage, &config)?;

    Ok(Response::new()
        .add_attribute("method", "update_platform_fee")
        .add_attribute("new_fee_percent", new_fee_percent.to_string()))
}

pub fn execute_cancel_project(
    deps: DepsMut,
    _env: Env,
    info: MessageInfo,
    project_id: u64,
) -> Result<Response, ContractError> {
    // Load project
    let mut project = PROJECTS.load(deps.storage, project_id)?;

    // Validate caller is client
    if project.client != info.sender {
        return Err(ContractError::Unauthorized {});
    }

    // Validate project is open
    if project.status != ProjectStatus::Open {
        return Err(ContractError::ProjectNotOpen {});
    }

    // Update project status
    project.status = ProjectStatus::Cancelled;
    PROJECTS.save(deps.storage, project_id, &project)?;

    let event = Event::new("web3lancer-project-cancelled")
        .add_attribute("project_id", project_id.to_string());

    Ok(Response::new()
        .add_event(event)
        .add_attribute("method", "cancel_project")
        .add_attribute("project_id", project_id.to_string()))
}

#[cfg_attr(not(feature = "library"), entry_point)]
pub fn query(deps: Deps, _env: Env, msg: QueryMsg) -> StdResult<Binary> {
    match msg {
        QueryMsg::GetProject { project_id } => to_json_binary(&query_project(deps, project_id)?),
        QueryMsg::GetProposal { proposal_id } => to_json_binary(&query_proposal(deps, proposal_id)?),
        QueryMsg::GetMilestone { milestone_id } => to_json_binary(&query_milestone(deps, milestone_id)?),
        QueryMsg::GetDispute { project_id } => to_json_binary(&query_dispute(deps, project_id)?),
        QueryMsg::GetUserProjects { user } => to_json_binary(&query_user_projects(deps, user)?),
        QueryMsg::GetProjectProposals { project_id } => to_json_binary(&query_project_proposals(deps, project_id)?),
        QueryMsg::GetProjectMilestones { project_id } => to_json_binary(&query_project_milestones(deps, project_id)?),
        QueryMsg::GetUserRating { user } => to_json_binary(&query_user_rating(deps, user)?),
        QueryMsg::GetConfig {} => to_json_binary(&query_config(deps)?),
        QueryMsg::ListProjects { start_after, limit } => to_json_binary(&query_list_projects(deps, start_after, limit)?),
    }
}

fn query_project(deps: Deps, project_id: u64) -> StdResult<ProjectResponse> {
    let project = PROJECTS.load(deps.storage, project_id)?;
    Ok(ProjectResponse {
        id: project.id,
        client: project.client.to_string(),
        title: project.title,
        description: project.description,
        budget: project.budget,
        deadline: project.deadline,
        status: project.status,
        freelancer: project.freelancer.map(|addr| addr.to_string()),
        created_at: project.created_at,
    })
}

fn query_proposal(deps: Deps, proposal_id: u64) -> StdResult<ProposalResponse> {
    let proposal = PROPOSALS.load(deps.storage, proposal_id)?;
    Ok(ProposalResponse {
        id: proposal.id,
        project_id: proposal.project_id,
        freelancer: proposal.freelancer.to_string(),
        description: proposal.description,
        price: proposal.price,
        timeline_in_days: proposal.timeline_in_days,
        status: proposal.status,
        created_at: proposal.created_at,
    })
}

fn query_milestone(deps: Deps, milestone_id: u64) -> StdResult<MilestoneResponse> {
    let milestone = MILESTONES.load(deps.storage, milestone_id)?;
    Ok(MilestoneResponse {
        id: milestone.id,
        project_id: milestone.project_id,
        description: milestone.description,
        amount: milestone.amount,
        status: milestone.status,
        created_at: milestone.created_at,
    })
}

fn query_dispute(deps: Deps, project_id: u64) -> StdResult<DisputeResponse> {
    let dispute = DISPUTES.load(deps.storage, project_id)?;
    Ok(DisputeResponse {
        id: dispute.id,
        project_id: dispute.project_id,
        initiator: dispute.initiator.to_string(),
        reason: dispute.reason,
        votes_for_client: dispute.votes_for_client,
        votes_for_freelancer: dispute.votes_for_freelancer,
        resolved: dispute.resolved,
        created_at: dispute.created_at,
        voters: dispute.voters.iter().map(|addr| addr.to_string()).collect(),
    })
}

fn query_user_projects(deps: Deps, user: String) -> StdResult<Vec<u64>> {
    let user_addr = deps.api.addr_validate(&user)?;
    let projects = USER_PROJECTS.may_load(deps.storage, &user_addr)?.unwrap_or_default();
    Ok(projects)
}

fn query_project_proposals(deps: Deps, project_id: u64) -> StdResult<Vec<u64>> {
    let proposals = PROJECT_PROPOSALS.may_load(deps.storage, project_id)?.unwrap_or_default();
    Ok(proposals)
}

fn query_project_milestones(deps: Deps, project_id: u64) -> StdResult<Vec<u64>> {
    let milestones = PROJECT_MILESTONES.may_load(deps.storage, project_id)?.unwrap_or_default();
    Ok(milestones)
}

fn query_user_rating(deps: Deps, user: String) -> StdResult<UserRatingResponse> {
    let user_addr = deps.api.addr_validate(&user)?;
    let (total, count) = USER_RATINGS.may_load(deps.storage, &user_addr)?.unwrap_or((Uint128::zero(), 0u64));
    
    let rating = if count > 0 {
        total.checked_div(Uint128::from(count)).unwrap_or_default()
    } else {
        Uint128::zero()
    };
    
    Ok(UserRatingResponse {
        user: user_addr.to_string(),
        rating,
        count,
    })
}

fn query_config(deps: Deps) -> StdResult<ConfigResponse> {
    let config = CONFIG.load(deps.storage)?;
    Ok(ConfigResponse {
        owner: config.owner.to_string(),
        platform_fee_percent: config.platform_fee_percent,
    })
}

fn query_list_projects(
    deps: Deps,
    start_after: Option<u64>,
    limit: Option<u32>,
) -> StdResult<ProjectsResponse> {
    let limit = limit.unwrap_or(30) as usize;
    let start = start_after.map(|s| Bound::exclusive(s));
    
    let projects: StdResult<Vec<_>> = PROJECTS
        .range(deps.storage, start, None, Order::Ascending)
        .take(limit)
        .map(|item| {
            let (_, project) = item?;
            Ok(ProjectResponse {
                id: project.id,
                client: project.client.to_string(),
                title: project.title,
                description: project.description,
                budget: project.budget,
                deadline: project.deadline,
                status: project.status,
                freelancer: project.freelancer.map(|addr| addr.to_string()),
                created_at: project.created_at,
            })
        })
        .collect();
        
    Ok(ProjectsResponse { projects: projects? })
}