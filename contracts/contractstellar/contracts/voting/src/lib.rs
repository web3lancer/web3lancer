#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, vec, Env, String, Vec, Map, Address, BytesN};

#[contract]
pub struct ReputationContract;

// Define data structures for reputation system
#[contracttype]
pub enum DataKey {
    UserRating(Address),
    UserReviews(Address),
    ProjectReview(BytesN<32>, Address),
}

#[contracttype]
pub struct Review {
    reviewer: Address,
    reviewee: Address,
    project_id: BytesN<32>,
    rating: u32,         // 1-5 star rating
    comment: String,
    timestamp: u64,
}

#[contracttype]
pub struct UserRatingData {
    total_rating: u32,
    review_count: u32,
    average_rating: u32,  // Multiplied by 100 for precision (e.g., 450 = 4.5 stars)
}

// Implementation of the reputation contract
#[contractimpl]
impl ReputationContract {
    // Submit a review for a user after project completion
    pub fn submit_review(
        env: Env,
        reviewer: Address,
        reviewee: Address,
        project_id: BytesN<32>,
        rating: u32,
        comment: String,
    ) -> bool {
        // Verify reviewer
        reviewer.require_auth();
        
        // Validate rating (1-5 stars)
        assert!(rating >= 1 && rating <= 5, "Rating must be between 1 and 5");
        
        // Check if review already exists for this project and reviewer
        let review_key = DataKey::ProjectReview(project_id.clone(), reviewer.clone());
        let review_exists: bool = env.storage().persistent().has(&review_key);
        assert!(!review_exists, "You have already reviewed this project");
        
        // Create review
        let review = Review {
            reviewer: reviewer.clone(),
            reviewee: reviewee.clone(),
            project_id: project_id.clone(),
            rating,
            comment,
            timestamp: env.ledger().timestamp(),
        };
        
        // Store review
        env.storage().persistent().set(&review_key, &review);
        
        // Add review to user's review list
        let mut user_reviews: Vec<Review> = env.storage().persistent().get(&DataKey::UserReviews(reviewee.clone())).unwrap_or(Vec::new(&env));
        user_reviews.push_back(review.clone());
        env.storage().persistent().set(&DataKey::UserReviews(reviewee.clone()), &user_reviews);
        
        // Update user's rating data
        let mut user_rating: UserRatingData = env.storage().persistent().get(&DataKey::UserRating(reviewee.clone())).unwrap_or(
            UserRatingData {
                total_rating: 0,
                review_count: 0,
                average_rating: 0,
            }
        );
        
        user_rating.total_rating += rating;
        user_rating.review_count += 1;
        user_rating.average_rating = (user_rating.total_rating * 100) / user_rating.review_count;
        
        env.storage().persistent().set(&DataKey::UserRating(reviewee), &user_rating);
        
        true
    }
    
    // Get reviews for a specific user
    pub fn get_user_reviews(
        env: Env,
        user: Address,
    ) -> Vec<Review> {
        env.storage().persistent().get(&DataKey::UserReviews(user)).unwrap_or(Vec::new(&env))
    }
    
    // Get a user's rating data
    pub fn get_user_rating(
        env: Env,
        user: Address,
    ) -> UserRatingData {
        env.storage().persistent().get(&DataKey::UserRating(user)).unwrap_or(
            UserRatingData {
                total_rating: 0,
                review_count: 0,
                average_rating: 0,
            }
        )
    }
    
    // Get the full reputation score for display (returns in format like 4.5)
    pub fn get_reputation_score(
        env: Env,
        user: Address,
    ) -> i128 {
        let rating_data = Self::get_user_rating(env, user);
        if rating_data.review_count == 0 {
            return 0;
        }
        
        // Return as number with 1 decimal place (450 -> 4.5)
        rating_data.average_rating as i128
    }
    
    // Dispute a review (could be extended with arbitration mechanics)
    pub fn dispute_review(
        env: Env,
        disputer: Address,
        project_id: BytesN<32>,
        reviewer: Address,
        reason: String,
    ) -> bool {
        // Verify disputer
        disputer.require_auth();
        
        // Check if review exists
        let review_key = DataKey::ProjectReview(project_id, reviewer);
        let review_exists: bool = env.storage().persistent().has(&review_key);
        assert!(review_exists, "Review does not exist");
        
        // In a real implementation, this would create a dispute case
        // that would be handled by platform moderators or a DAO
        
        // For now, just return true to acknowledge the dispute
        true
    }
}

mod test;
