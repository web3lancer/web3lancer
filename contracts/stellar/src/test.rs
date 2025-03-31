#![cfg(test)]
extern crate std;

use soroban_sdk::{
    testutils::{Address as _, AuthorizedFunction, AuthorizedInvocation},
    symbol_short, vec, Address, BytesN, Env, IntoVal, Vec,
};

use crate::{Web3LancerContract, Web3LancerContractClient};

#[test]
fn test_payment_creation() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(Web3LancerContract, {});
    let client = Web3LancerContractClient::new(&env, &contract_id);

    let client_address = Address::generate(&env);
    let freelancer_address = Address::generate(&env);
    let amount = 1000_i128;

    // Create payment
    let payment_id = client.create_payment(&client_address, &freelancer_address, &amount);
    
    // Verify authorization
    assert_eq!(
        env.auths(),
        std::vec![(
            client_address.clone(),
            AuthorizedInvocation {
                function: AuthorizedFunction::Contract((
                    contract_id.clone(),
                    symbol_short!("create_payment"),
                    (client_address.clone(), freelancer_address.clone(), amount).into_val(&env),
                )),
                sub_invocations: std::vec![]
            }
        )]
    );
    
    // Get payment and verify details
    let payment = client.get_payment(&payment_id);
    assert_eq!(payment.client, client_address);
    assert_eq!(payment.freelancer, freelancer_address);
    assert_eq!(payment.amount, amount);
    assert_eq!(payment.completed, false);
}

#[test]
fn test_escrow_flow() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(Web3LancerContract, {});
    let client = Web3LancerContractClient::new(&env, &contract_id);

    let client_address = Address::generate(&env);
    let freelancer_address = Address::generate(&env);
    let total_amount = 1000_i128;
    
    // Create milestone descriptions
    let milestone_descriptions = {
        let mut v = Vec::new(&env);
        v.push_back(vec![&env, 1, 2, 3]); // Use actual descriptions in real code
        v.push_back(vec![&env, 4, 5, 6]);
        v
    };
    
    // Create milestone amounts
    let milestone_amounts = {
        let mut v = Vec::new(&env);
        v.push_back(400_i128);
        v.push_back(600_i128);
        v
    };
    
    // Create escrow
    let payment_id = client.create_escrow(
        &client_address, 
        &freelancer_address,
        &total_amount,
        &milestone_descriptions,
        &milestone_amounts
    );
    
    // Get escrow data
    let escrow = client.get_escrow(&payment_id);
    assert_eq!(escrow.total_amount, total_amount);
    assert_eq!(escrow.released_amount, 0);
    assert_eq!(escrow.milestones.len(), 2);
    
    // Release first milestone
    let result = client.release_milestone(&client_address, &payment_id, &0);
    assert_eq!(result, true);
    
    // Check updated escrow
    let escrow = client.get_escrow(&payment_id);
    assert_eq!(escrow.released_amount, 400);
    assert_eq!(escrow.milestones.get(0).unwrap().completed, true);
    assert_eq!(escrow.milestones.get(1).unwrap().completed, false);
    
    // Payment should not be completed yet
    let payment = client.get_payment(&payment_id);
    assert_eq!(payment.completed, false);
    
    // Release second milestone
    let result = client.release_milestone(&client_address, &payment_id, &1);
    assert_eq!(result, true);
    
    // Check escrow again
    let escrow = client.get_escrow(&payment_id);
    assert_eq!(escrow.released_amount, 1000);
    assert_eq!(escrow.milestones.get(1).unwrap().completed, true);
    
    // Payment should be completed now
    let payment = client.get_payment(&payment_id);
    assert_eq!(payment.completed, true);
}
