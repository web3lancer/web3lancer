use cosmwasm_std::testing::{mock_dependencies, mock_env, mock_info};
use cosmwasm_std::{coins, Addr, Timestamp, Uint128};

use crate::contract::{execute, instantiate, query};
use crate::error::ContractError;
use crate::msg::{ExecuteMsg, InstantiateMsg, QueryMsg, ProjectResponse};
use crate::state::ProjectStatus;

const OWNER: &str = "owner";
const CLIENT: &str = "client";
const FREELANCER: &str = "freelancer";
const VOTER1: &str = "voter1";
const VOTER2: &str = "voter2";
const VOTER3: &str = "voter3";

#[test]
fn proper_initialization() {
    let mut deps = mock_dependencies();
    let env = mock_env();
    let info = mock_info(OWNER, &[]);
    
    let msg = InstantiateMsg {
        platform_fee_percent: 250, // 2.5%
    };
    
    // Instantiate the contract
    let res = instantiate(deps.as_mut(), env, info, msg).unwrap();
    assert_eq!(0, res.messages.len());
    
    // Verify config through query
    let res = query(deps.as_ref(), mock_env(), QueryMsg::GetConfig {}).unwrap();
    let config_response: crate::msg::ConfigResponse = from_binary(&res).unwrap();
    assert_eq!(config_response.owner, OWNER);
    assert_eq!(config_response.platform_fee_percent, 250);
}

#[test]
fn create_project() {
    let mut deps = mock_dependencies();
    let env = mock_env();
    let info = mock_info(OWNER, &[]);
    
    // Instantiate the contract
    let msg = InstantiateMsg {
        platform_fee_percent: 250,
    };
    let _res = instantiate(deps.as_mut(), env.clone(), info, msg).unwrap();
    
    // Create a project as CLIENT
    let create_info = mock_info(CLIENT, &coins(100, "uxion"));
    let create_msg = ExecuteMsg::CreateProject {
        title: "Test Project".to_string(),
        description: "This is a test project".to_string(),
        deadline: 1000000, // seconds in the future
    };
    
    let res = execute(deps.as_mut(), env.clone(), create_info, create_msg).unwrap();
    assert_eq!(res.attributes.len(), 4);
    assert_eq!(res.attributes[0].key, "method");
    assert_eq!(res.attributes[0].value, "create_project");
    assert_eq!(res.attributes[1].key, "project_id");
    assert_eq!(res.attributes[1].value, "1");
    
    // Query the project
    let res = query(deps.as_ref(), mock_env(), QueryMsg::GetProject { project_id: 1 }).unwrap();
    let project_response: ProjectResponse = from_binary(&res).unwrap();
    
    assert_eq!(project_response.id, 1);
    assert_eq!(project_response.client, CLIENT);
    assert_eq!(project_response.title, "Test Project");
    assert_eq!(project_response.description, "This is a test project");
    assert_eq!(project_response.budget, Uint128::from(100u128));
    assert_eq!(project_response.status, ProjectStatus::Open);
    assert_eq!(project_response.freelancer, None);
}

#[test]
fn full_workflow() {
    let mut deps = mock_dependencies();
    let mut env = mock_env();
    
    // Set initial time
    env.block.time = Timestamp::from_seconds(1_000_000);
    
    // Instantiate the contract
    let info = mock_info(OWNER, &[]);
    let msg = InstantiateMsg {
        platform_fee_percent: 250,
    };
    let _res = instantiate(deps.as_mut(), env.clone(), info, msg).unwrap();
    
    // 1. Create a project
    let create_info = mock_info(CLIENT, &coins(1000, "uxion"));
    let create_msg = ExecuteMsg::CreateProject {
        title: "Web Development".to_string(),
        description: "Build a responsive website".to_string(),
        deadline: 1000000, // seconds in the future
    };
    
    let _res = execute(deps.as_mut(), env.clone(), create_info, create_msg).unwrap();
    
    // 2. Freelancer submits a proposal
    let proposal_info = mock_info(FREELANCER, &[]);
    let proposal_msg = ExecuteMsg::SubmitProposal {
        project_id: 1,
        description: "I can build this website in 30 days".to_string(),
        price: Uint128::from(800u128),
        timeline_in_days: 30,
    };
    
    let _res = execute(deps.as_mut(), env.clone(), proposal_info, proposal_msg).unwrap();
    
    // 3. Client accepts the proposal
    let accept_info = mock_info(CLIENT, &[]);
    let accept_msg = ExecuteMsg::AcceptProposal {
        project_id: 1,
        proposal_id: 2,
    };
    
    let _res = execute(deps.as_mut(), env.clone(), accept_info, accept_msg).unwrap();
    
    // 4. Client creates a milestone
    let milestone_info = mock_info(CLIENT, &[]);
    let milestone_msg = ExecuteMsg::CreateMilestone {
        project_id: 1,
        description: "Complete homepage design".to_string(),
        amount: Uint128::from(400u128),
    };
    
    let _res = execute(deps.as_mut(), env.clone(), milestone_info, milestone_msg).unwrap();
    
    // 5. Freelancer submits the milestone
    let submit_info = mock_info(FREELANCER, &[]);
    let submit_msg = ExecuteMsg::SubmitMilestone {
        project_id: 1,
        milestone_id: 3,
    };
    
    let _res = execute(deps.as_mut(), env.clone(), submit_info, submit_msg).unwrap();
    
    // 6. Client approves the milestone
    let approve_info = mock_info(CLIENT, &[]);
    let approve_msg = ExecuteMsg::ApproveMilestone {
        project_id: 1,
        milestone_id: 3,
    };
    
    let _res = execute(deps.as_mut(), env.clone(), approve_info, approve_msg).unwrap();
    
    // 7. Create second milestone to complete the project
    let milestone2_info = mock_info(CLIENT, &[]);
    let milestone2_msg = ExecuteMsg::CreateMilestone {
        project_id: 1,
        description: "Complete full website".to_string(),
        amount: Uint128::from(400u128),
    };
    
    let _res = execute(deps.as_mut(), env.clone(), milestone2_info, milestone2_msg).unwrap();
    
    // 8. Freelancer submits the second milestone
    let submit2_info = mock_info(FREELANCER, &[]);
    let submit2_msg = ExecuteMsg::SubmitMilestone {
        project_id: 1,
        milestone_id: 4,
    };
    
    let _res = execute(deps.as_mut(), env.clone(), submit2_info, submit2_msg).unwrap();
    
    // 9. Client approves the second milestone (should complete the project)
    let approve2_info = mock_info(CLIENT, &[]);
    let approve2_msg = ExecuteMsg::ApproveMilestone {
        project_id: 1,
        milestone_id: 4,
    };
    
    let _res = execute(deps.as_mut(), env.clone(), approve2_info, approve2_msg).unwrap();
    
    // 10. Verify project is completed
    let res = query(deps.as_ref(), env.clone(), QueryMsg::GetProject { project_id: 1 }).unwrap();
    let project_response: ProjectResponse = from_binary(&res).unwrap();
    assert_eq!(project_response.status, ProjectStatus::Completed);
    
    // 11. Both parties leave reviews
    let client_review_info = mock_info(CLIENT, &[]);
    let client_review_msg = ExecuteMsg::SubmitReview {
        project_id: 1,
        rating: 5,
        comment: "Excellent work!".to_string(),
    };
    
    let _res = execute(deps.as_mut(), env.clone(), client_review_info, client_review_msg).unwrap();
    
    let freelancer_review_info = mock_info(FREELANCER, &[]);
    let freelancer_review_msg = ExecuteMsg::SubmitReview {
        project_id: 1,
        rating: 4,
        comment: "Great client to work with".to_string(),
    };
    
    let _res = execute(deps.as_mut(), env.clone(), freelancer_review_info, freelancer_review_msg).unwrap();
    
    // 12. Check freelancer rating
    let res = query(deps.as_ref(), env.clone(), QueryMsg::GetUserRating { user: FREELANCER.to_string() }).unwrap();
    let rating_response: crate::msg::UserRatingResponse = from_binary(&res).unwrap();
    assert_eq!(rating_response.rating, Uint128::from(5u128));
    assert_eq!(rating_response.count, 1);
    
    // 13. Check client rating
    let res = query(deps.as_ref(), env.clone(), QueryMsg::GetUserRating { user: CLIENT.to_string() }).unwrap();
    let rating_response: crate::msg::UserRatingResponse = from_binary(&res).unwrap();
    assert_eq!(rating_response.rating, Uint128::from(4u128));
    assert_eq!(rating_response.count, 1);
}

#[test]
fn dispute_resolution() {
    let mut deps = mock_dependencies();
    let mut env = mock_env();
    
    // Set initial time
    env.block.time = Timestamp::from_seconds(1_000_000);
    
    // Instantiate the contract
    let info = mock_info(OWNER, &[]);
    let msg = InstantiateMsg {
        platform_fee_percent: 250,
    };
    let _res = instantiate(deps.as_mut(), env.clone(), info, msg).unwrap();
    
    // 1. Create a project
    let create_info = mock_info(CLIENT, &coins(1000, "uxion"));
    let create_msg = ExecuteMsg::CreateProject {
        title: "Logo Design".to_string(),
        description: "Design a company logo".to_string(),
        deadline: 100000,
    };
    
    let _res = execute(deps.as_mut(), env.clone(), create_info, create_msg).unwrap();
    
    // 2. Freelancer submits a proposal
    let proposal_info = mock_info(FREELANCER, &[]);
    let proposal_msg = ExecuteMsg::SubmitProposal {
        project_id: 1,
        description: "I can design a professional logo".to_string(),
        price: Uint128::from(800u128),
        timeline_in_days: 10,
    };
    
    let _res = execute(deps.as_mut(), env.clone(), proposal_info, proposal_msg).unwrap();
    
    // 3. Client accepts the proposal
    let accept_info = mock_info(CLIENT, &[]);
    let accept_msg = ExecuteMsg::AcceptProposal {
        project_id: 1,
        proposal_id: 2,
    };
    
    let _res = execute(deps.as_mut(), env.clone(), accept_info, accept_msg).unwrap();
    
    // 4. Client creates a milestone
    let milestone_info = mock_info(CLIENT, &[]);
    let milestone_msg = ExecuteMsg::CreateMilestone {
        project_id: 1,
        description: "Logo design draft".to_string(),
        amount: Uint128::from(800u128),
    };
    
    let _res = execute(deps.as_mut(), env.clone(), milestone_info, milestone_msg).unwrap();
    
    // 5. Client creates a dispute
    let dispute_info = mock_info(CLIENT, &[]);
    let dispute_msg = ExecuteMsg::CreateDispute {
        project_id: 1,
        reason: "Freelancer is not responsive".to_string(),
    };
    
    let _res = execute(deps.as_mut(), env.clone(), dispute_info, dispute_msg).unwrap();
    
    // 6. First voter votes for freelancer
    let vote1_info = mock_info(VOTER1, &[]);
    let vote1_msg = ExecuteMsg::VoteOnDispute {
        project_id: 1,
        vote_for_client: false,
    };
    
    let _res = execute(deps.as_mut(), env.clone(), vote1_info, vote1_msg).unwrap();
    
    // 7. Second voter votes for freelancer
    let vote2_info = mock_info(VOTER2, &[]);
    let vote2_msg = ExecuteMsg::VoteOnDispute {
        project_id: 1,
        vote_for_client: false,
    };
    
    let _res = execute(deps.as_mut(), env.clone(), vote2_info, vote2_msg).unwrap();
    
    // 8. Third voter votes for freelancer - this should resolve the dispute in favor of the freelancer
    let vote3_info = mock_info(VOTER3, &[]);
    let vote3_msg = ExecuteMsg::VoteOnDispute {
        project_id: 1,
        vote_for_client: false,
    };
    
    let res = execute(deps.as_mut(), env.clone(), vote3_info, vote3_msg).unwrap();
    
    // Check that the dispute was resolved
    assert!(res.attributes.iter().any(|attr| attr.key == "dispute_resolved" && attr.value == "true"));
    
    // Check that project status has been restored to InProgress
    let res = query(deps.as_ref(), env.clone(), QueryMsg::GetProject { project_id: 1 }).unwrap();
    let project_response: ProjectResponse = from_binary(&res).unwrap();
    assert_eq!(project_response.status, ProjectStatus::InProgress);
    
    // Check the dispute details
    let res = query(deps.as_ref(), env.clone(), QueryMsg::GetDispute { project_id: 1 }).unwrap();
    let dispute_response: crate::msg::DisputeResponse = from_binary(&res).unwrap();
    assert_eq!(dispute_response.resolved, true);
    assert_eq!(dispute_response.votes_for_client, Uint128::zero());
    assert_eq!(dispute_response.votes_for_freelancer, Uint128::from(3u128));
}

// Helper for binary operations
use cosmwasm_std::{from_binary, Binary};