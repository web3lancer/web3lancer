#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, vec, Env, String, Address};

#[test]
fn test_project_flow() {
    // Initialize environment and contract
    let env = Env::default();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);
    
    // Generate test addresses
    let client_address = Address::generate(&env);
    let freelancer_address = Address::generate(&env);
    
    // Mock authorization for client
    env.mock_all_auths();
    
    // Test data
    let total_payment = 1000;
    let title = String::from_str(&env, "Web Development Project");
    let description = String::from_str(&env, "Create a website for my business");
    
    // Milestone descriptions
    let milestone_descriptions = vec![
        &env,
        String::from_str(&env, "Design mockups"),
        String::from_str(&env, "Frontend implementation"),
        String::from_str(&env, "Backend integration"),
    ];
    
    // Milestone amounts
    let milestone_amounts = vec![
        &env,
        200,
        400,
        400,
    ];
    
    // Create project
    let project_id = client.create_project(
        &client_address,
        &freelancer_address,
        &total_payment,
        &title,
        &description,
        &milestone_descriptions,
        &milestone_amounts,
    );
    
    // Verify project created
    let project = client.get_project(&project_id);
    assert_eq!(project.client, client_address);
    assert_eq!(project.freelancer, freelancer_address);
    assert_eq!(project.total_payment, total_payment);
    assert_eq!(project.title, title);
    
    // Verify milestones
    let milestones = client.get_milestones(&project_id);
    assert_eq!(milestones.len(), 3);
    assert_eq!(milestones.get(0).unwrap().amount, 200);
    assert_eq!(milestones.get(1).unwrap().amount, 400);
    assert_eq!(milestones.get(2).unwrap().amount, 400);
    
    // Start project
    let result = client.start_project(&client_address, &project_id);
    assert_eq!(result, true);
    
    // Get updated project
    let project = client.get_project(&project_id);
    match project.status {
        ProjectStatus::InProgress => { /* Expected status */ },
        _ => panic!("Project should be in progress"),
    }
    
    // Complete first milestone (as freelancer)
    let result = client.complete_milestone(&freelancer_address, &project_id, &0);
    assert_eq!(result, true);
    
    // Verify milestone is marked as completed
    let milestones = client.get_milestones(&project_id);
    assert_eq!(milestones.get(0).unwrap().completed, true);
    assert_eq!(milestones.get(0).unwrap().approved, false);
    
    // Approve milestone (as client)
    let result = client.approve_milestone(&client_address, &project_id, &0);
    assert_eq!(result, true);
    
    // Verify milestone is approved
    let milestones = client.get_milestones(&project_id);
    assert_eq!(milestones.get(0).unwrap().approved, true);
    
    // Complete remaining milestones
    client.complete_milestone(&freelancer_address, &project_id, &1);
    client.approve_milestone(&client_address, &project_id, &1);
    client.complete_milestone(&freelancer_address, &project_id, &2);
    client.approve_milestone(&client_address, &project_id, &2);
    
    // Verify project is completed
    let project = client.get_project(&project_id);
    match project.status {
        ProjectStatus::Completed => { /* Expected status */ },
        _ => panic!("Project should be completed"),
    }
    
    // Verify user projects
    let client_projects = client.get_user_projects(&client_address);
    assert_eq!(client_projects.len(), 1);
    assert_eq!(client_projects.get(0).unwrap().id, project_id);
    
    let freelancer_projects = client.get_user_projects(&freelancer_address);
    assert_eq!(freelancer_projects.len(), 1);
    assert_eq!(freelancer_projects.get(0).unwrap().id, project_id);
}
