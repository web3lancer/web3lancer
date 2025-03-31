#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, vec, Env, String, Address};

#[test]
fn test_reputation_system() {
    // Initialize environment and contract
    let env = Env::default();
    let contract_id = env.register(ReputationContract, ());
    let client = ReputationContractClient::new(&env, &contract_id);
    
    // Generate test addresses
    let client_address = Address::generate(&env);
    let freelancer_address = Address::generate(&env);
    
    // Mock authorization
    env.mock_all_auths();
    
    // Generate a fake project ID
    let project_id = env.crypto().sha256(&[0u8; 32]);
    
    // Submit a review
    let comment = String::from_str(&env, "Excellent work, delivered on time!");
    let result = client.submit_review(
        &client_address,
        &freelancer_address,
        &project_id,
        &5, // 5-star rating
        &comment,
    );
    assert_eq!(result, true);
    
    // Get user's reviews
    let reviews = client.get_user_reviews(&freelancer_address);
    assert_eq!(reviews.len(), 1);
    assert_eq!(reviews.get(0).unwrap().reviewer, client_address);
    assert_eq!(reviews.get(0).unwrap().rating, 5);
    
    // Get user's rating
    let rating = client.get_user_rating(&freelancer_address);
    assert_eq!(rating.total_rating, 5);
    assert_eq!(rating.review_count, 1);
    assert_eq!(rating.average_rating, 500); // 5.0 stars (x100)
    
    // Add another review with different project ID
    let project_id2 = env.crypto().sha256(&[1u8; 32]);
    let comment2 = String::from_str(&env, "Good work but missed some requirements");
    client.submit_review(
        &client_address,
        &freelancer_address,
        &project_id2,
        &4, // 4-star rating
        &comment2,
    );
    
    // Check updated rating
    let rating = client.get_user_rating(&freelancer_address);
    assert_eq!(rating.total_rating, 9);
    assert_eq!(rating.review_count, 2);
    assert_eq!(rating.average_rating, 450); // 4.5 stars (x100)
    
    // Get reputation score
    let score = client.get_reputation_score(&freelancer_address);
    assert_eq!(score, 450); // 4.5 stars
}
