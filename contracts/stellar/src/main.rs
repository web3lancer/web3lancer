#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, Vec, BytesN};

// Data structure for storing payment information
#[contracttype]
pub enum DataKey {
    // Payment record with client and freelancer addresses
    Payment(BytesN<32>),
    // Escrow funds with milestone tracking
    Escrow(BytesN<32>),
    // User profile data
    UserProfile(Address),
}

#[contracttype]
pub struct Payment {
    client: Address,
    freelancer: Address,
    amount: i128,
    completed: bool,
}

#[contracttype]
pub struct Escrow {
    payment_id: BytesN<32>,
    total_amount: i128,
    released_amount: i128,
    milestones: Vec<Milestone>,
}

#[contracttype]
pub struct Milestone {
    description: Vec<u8>,
    amount: i128,
    completed: bool,
}

#[contract]
pub struct Web3LancerContract;

#[contractimpl]
impl Web3LancerContract {
    // Create a new payment from client to freelancer
    pub fn create_payment(
        env: Env,
        client: Address,
        freelancer: Address,
        amount: i128,
    ) -> BytesN<32> {
        // Ensure the client has authorized this transaction
        client.require_auth();
        
        // Generate a unique ID for this payment
        let payment_id = env.crypto().sha256(&env.ledger().sequence().to_be_bytes());
        
        // Create payment record
        let payment = Payment {
            client: client.clone(),
            freelancer: freelancer.clone(),
            amount,
            completed: false,
        };
        
        // Store the payment data
        env.storage().persistent().set(&DataKey::Payment(payment_id.clone()), &payment);
        
        // Return the payment ID
        payment_id
    }
    
    // Create an escrow with milestones
    pub fn create_escrow(
        env: Env, 
        client: Address, 
        freelancer: Address,
        total_amount: i128,
        milestone_descriptions: Vec<Vec<u8>>,
        milestone_amounts: Vec<i128>,
    ) -> BytesN<32> {
        // Require client authorization
        client.require_auth();
        
        // Validate milestone amounts sum to total
        let mut sum = 0;
        for amount in milestone_amounts.iter() {
            sum += *amount;
        }
        assert!(sum == total_amount, "Milestone amounts must sum to total");
        
        // Create payment first
        let payment_id = Self::create_payment(env.clone(), client, freelancer, total_amount);
        
        // Create milestones
        let mut milestones = Vec::new(&env);
        for i in 0..milestone_descriptions.len() {
            milestones.push_back(Milestone {
                description: milestone_descriptions.get(i).unwrap(),
                amount: milestone_amounts.get(i).unwrap(),
                completed: false,
            });
        }
        
        // Create and store escrow
        let escrow = Escrow {
            payment_id: payment_id.clone(),
            total_amount,
            released_amount: 0,
            milestones,
        };
        
        env.storage().persistent().set(&DataKey::Escrow(payment_id.clone()), &escrow);
        
        payment_id
    }
    
    // Release a milestone payment
    pub fn release_milestone(
        env: Env,
        client: Address,
        payment_id: BytesN<32>,
        milestone_index: u32,
    ) -> bool {
        // Require client authorization
        client.require_auth();
        
        // Get escrow data
        let mut escrow: Escrow = env.storage().persistent().get(&DataKey::Escrow(payment_id.clone())).unwrap();
        
        // Get payment data to verify client
        let payment: Payment = env.storage().persistent().get(&DataKey::Payment(payment_id.clone())).unwrap();
        assert!(payment.client == client, "Only the client can release milestone payments");
        
        // Check milestone index
        assert!(milestone_index < escrow.milestones.len(), "Invalid milestone index");
        
        // Get milestone
        let mut milestone = escrow.milestones.get(milestone_index).unwrap();
        assert!(!milestone.completed, "Milestone already completed");
        
        // Mark milestone as completed
        milestone.completed = true;
        escrow.milestones.set(milestone_index, milestone.clone());
        
        // Update released amount
        escrow.released_amount += milestone.amount;
        
        // Update escrow
        env.storage().persistent().set(&DataKey::Escrow(payment_id.clone()), &escrow);
        
        // If all funds released, mark payment as completed
        if escrow.released_amount == escrow.total_amount {
            let mut payment: Payment = env.storage().persistent().get(&DataKey::Payment(payment_id.clone())).unwrap();
            payment.completed = true;
            env.storage().persistent().set(&DataKey::Payment(payment_id), &payment);
        }
        
        true
    }
    
    // Get payment information
    pub fn get_payment(env: Env, payment_id: BytesN<32>) -> Payment {
        env.storage().persistent().get(&DataKey::Payment(payment_id)).unwrap()
    }
    
    // Get escrow information
    pub fn get_escrow(env: Env, payment_id: BytesN<32>) -> Escrow {
        env.storage().persistent().get(&DataKey::Escrow(payment_id)).unwrap()
    }
}

// Include tests in a separate module
mod test;
