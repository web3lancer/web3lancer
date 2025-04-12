# Web3Lancer - Decentralized Freelancing Platform

Web3Lancer is a decentralized freelancing platform built on CosmWasm, allowing clients and freelancers to connect, collaborate, and transact in a trustless manner using smart contracts. The platform features project creation, milestone-based payments, proposal submissions, dispute resolution through community voting, and a reputation system.

## Table of Contents

- [Architecture](#architecture)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Building and Optimizing](#building-and-optimizing)
  - [Deployment](#deployment)
- [Contract Interactions](#contract-interactions)
  - [Instantiation](#instantiation)
  - [Creating Projects](#creating-projects)
  - [Submitting Proposals](#submitting-proposals)
  - [Managing Projects](#managing-projects)
  - [Milestone Management](#milestone-management)
  - [Dispute Resolution](#dispute-resolution)
  - [Reviews and Rating System](#reviews-and-rating-system)
  - [Platform Management](#platform-management)
- [Query Operations](#query-operations)
  - [Project Queries](#project-queries)
  - [Proposal Queries](#proposal-queries)
  - [Milestone Queries](#milestone-queries)
  - [User Queries](#user-queries)
  - [Dispute Queries](#dispute-queries)
  - [Platform Queries](#platform-queries)
- [Testing](#testing)
- [Security Considerations](#security-considerations)

## Architecture

Web3Lancer consists of the following core components:

1. **Project Management** - Creation, tracking, and completion of freelance projects
2. **Proposal System** - Submission and acceptance of freelancer proposals
3. **Milestone Management** - Breaking projects into manageable chunks with individual payments
4. **Dispute Resolution** - Community-based voting system to resolve conflicts
5. **Rating System** - Building reputation based on successful project completions

## Getting Started

### Prerequisites

- Go 1.19 or later
- Rust 1.64.0 or later
- [wasmd](https://github.com/CosmWasm/wasmd) 
- [xiond](https://burnt.com/xion) CLI tool

### Building and Optimizing

Compile the contract:

```bash
# Navigate to the contract directory
cd contracts/xioncontract

# Compile the contract
cargo build

# Run tests
cargo test

# Create an optimized build
docker run --rm -v "$(pwd)":/code \
  --mount type=volume,source="$(basename "$(pwd)")_cache",target=/target \
  --mount type=volume,source=registry_cache,target=/usr/local/cargo/registry \
  cosmwasm/optimizer:0.16.0
```

### Deployment

1. **Store Contract on Chain**:

```bash
WALLET="YOUR_WALLET_NAME"
xiond tx wasm store artifacts/xioncontract.wasm \
  --from $WALLET \
  --chain-id xion-testnet-2 \
  --gas-prices 0.025uxion \
  --gas auto \
  --gas-adjustment 1.3 \
  --node https://rpc.xion-testnet-2.burnt.com:443 \
  -y
```

2. **Get the Code ID**:

```bash
CODE_ID=$(xiond query wasm list-code --output json | jq -r '.code_infos[-1].code_id')
echo $CODE_ID
```

## Contract Interactions

### Instantiation

Instantiate the contract with an initial platform fee (in basis points, 100 = 1%):

```bash
# Set platform fee to 2.5%
MSG='{"platform_fee_percent": 250}'

# Instantiate contract
xiond tx wasm instantiate $CODE_ID "$MSG" \
  --from $WALLET \
  --label "web3lancer" \
  --gas-prices 0.025uxion \
  --gas auto \
  --gas-adjustment 1.3 \
  --chain-id xion-testnet-2 \
  --node https://rpc.xion-testnet-2.burnt.com:443 \
  -y --no-admin
```

Get contract address:

```bash
CONTRACT=$(xiond query wasm list-contract-by-code $CODE_ID --output json | jq -r '.contracts[-1]')
echo $CONTRACT
```

### Creating Projects

Create a new project with a budget and deadline:

```bash
# Create a project with title, description, and deadline in seconds from now
CREATE_PROJECT_MSG='{"create_project":{"title":"Build a DApp Frontend","description":"Create a responsive web interface for my DApp","deadline":2592000}}'

# Execute with budget of 1000 XION
xiond tx wasm execute $CONTRACT "$CREATE_PROJECT_MSG" \
  --amount 1000uxion \
  --from $WALLET \
  --gas-prices 0.025uxion \
  --gas auto \
  --gas-adjustment 1.3 \
  --chain-id xion-testnet-2 \
  --node https://rpc.xion-testnet-2.burnt.com:443 \
  -y
```

### Submitting Proposals

Freelancers can submit proposals for projects:

```bash
# Submit a proposal for project ID 1
SUBMIT_PROPOSAL_MSG='{"submit_proposal":{"project_id":1,"description":"I can build this with React and Tailwind CSS","price":"800","timeline_in_days":20}}'

xiond tx wasm execute $CONTRACT "$SUBMIT_PROPOSAL_MSG" \
  --from $FREELANCER_WALLET \
  --gas-prices 0.025uxion \
  --gas auto \
  --gas-adjustment 1.3 \
  --chain-id xion-testnet-2 \
  --node https://rpc.xion-testnet-2.burnt.com:443 \
  -y
```

### Managing Projects

Accept a proposal:

```bash
# Accept proposal ID 2 for project ID 1
ACCEPT_PROPOSAL_MSG='{"accept_proposal":{"project_id":1,"proposal_id":2}}'

xiond tx wasm execute $CONTRACT "$ACCEPT_PROPOSAL_MSG" \
  --from $WALLET \
  --gas-prices 0.025uxion \
  --gas auto \
  --gas-adjustment 1.3 \
  --chain-id xion-testnet-2 \
  --node https://rpc.xion-testnet-2.burnt.com:443 \
  -y
```

Cancel a project (only when it's in Open status):

```bash
CANCEL_PROJECT_MSG='{"cancel_project":{"project_id":1}}'

xiond tx wasm execute $CONTRACT "$CANCEL_PROJECT_MSG" \
  --from $WALLET \
  --gas-prices 0.025uxion \
  --gas auto \
  --gas-adjustment 1.3 \
  --chain-id xion-testnet-2 \
  --node https://rpc.xion-testnet-2.burnt.com:443 \
  -y
```

### Milestone Management

Create a milestone:

```bash
# Create a milestone for project ID 1
CREATE_MILESTONE_MSG='{"create_milestone":{"project_id":1,"description":"Homepage and login functionality","amount":"300"}}'

xiond tx wasm execute $CONTRACT "$CREATE_MILESTONE_MSG" \
  --from $WALLET \
  --gas-prices 0.025uxion \
  --gas auto \
  --gas-adjustment 1.3 \
  --chain-id xion-testnet-2 \
  --node https://rpc.xion-testnet-2.burnt.com:443 \
  -y
```

Submit completed milestone:

```bash
# Freelancer submits milestone ID 3 for project ID 1
SUBMIT_MILESTONE_MSG='{"submit_milestone":{"project_id":1,"milestone_id":3}}'

xiond tx wasm execute $CONTRACT "$SUBMIT_MILESTONE_MSG" \
  --from $FREELANCER_WALLET \
  --gas-prices 0.025uxion \
  --gas auto \
  --gas-adjustment 1.3 \
  --chain-id xion-testnet-2 \
  --node https://rpc.xion-testnet-2.burnt.com:443 \
  -y
```

Approve milestone:

```bash
# Client approves milestone ID 3 for project ID 1
APPROVE_MILESTONE_MSG='{"approve_milestone":{"project_id":1,"milestone_id":3}}'

xiond tx wasm execute $CONTRACT "$APPROVE_MILESTONE_MSG" \
  --from $WALLET \
  --gas-prices 0.025uxion \
  --gas auto \
  --gas-adjustment 1.3 \
  --chain-id xion-testnet-2 \
  --node https://rpc.xion-testnet-2.burnt.com:443 \
  -y
```

### Dispute Resolution

Create a dispute:

```bash
# Create a dispute for project ID 1
CREATE_DISPUTE_MSG='{"create_dispute":{"project_id":1,"reason":"The work doesn't match the agreed requirements"}}'

xiond tx wasm execute $CONTRACT "$CREATE_DISPUTE_MSG" \
  --from $WALLET \
  --gas-prices 0.025uxion \
  --gas auto \
  --gas-adjustment 1.3 \
  --chain-id xion-testnet-2 \
  --node https://rpc.xion-testnet-2.burnt.com:443 \
  -y
```

Vote on a dispute:

```bash
# Vote in favor of the client on project ID 1 dispute
VOTE_ON_DISPUTE_MSG='{"vote_on_dispute":{"project_id":1,"vote_for_client":true}}'

xiond tx wasm execute $CONTRACT "$VOTE_ON_DISPUTE_MSG" \
  --from $VOTER_WALLET \
  --gas-prices 0.025uxion \
  --gas auto \
  --gas-adjustment 1.3 \
  --chain-id xion-testnet-2 \
  --node https://rpc.xion-testnet-2.burnt.com:443 \
  -y
```

### Reviews and Rating System

Submit a review:

```bash
# Client submits a review for project ID 1
SUBMIT_REVIEW_MSG='{"submit_review":{"project_id":1,"rating":5,"comment":"Excellent work, delivered on time"}}'

xiond tx wasm execute $CONTRACT "$SUBMIT_REVIEW_MSG" \
  --from $WALLET \
  --gas-prices 0.025uxion \
  --gas auto \
  --gas-adjustment 1.3 \
  --chain-id xion-testnet-2 \
  --node https://rpc.xion-testnet-2.burnt.com:443 \
  -y
```

### Platform Management

Update platform fee:

```bash
# Update platform fee to 3%
UPDATE_FEE_MSG='{"update_platform_fee":{"new_fee_percent":300}}'

xiond tx wasm execute $CONTRACT "$UPDATE_FEE_MSG" \
  --from $WALLET \
  --gas-prices 0.025uxion \
  --gas auto \
  --gas-adjustment 1.3 \
  --chain-id xion-testnet-2 \
  --node https://rpc.xion-testnet-2.burnt.com:443 \
  -y
```

## Query Operations

### Project Queries

Get a specific project:

```bash
# Query project ID 1
QUERY='{"get_project":{"project_id":1}}'

xiond query wasm contract-state smart $CONTRACT "$QUERY" \
  --output json \
  --node https://rpc.xion-testnet-2.burnt.com:443
```

List all projects:

```bash
# List up to 10 projects
QUERY='{"list_projects":{"limit":10}}'

xiond query wasm contract-state smart $CONTRACT "$QUERY" \
  --output json \
  --node https://rpc.xion-testnet-2.burnt.com:443
```

Paginated project list:

```bash
# Get projects after ID 5, limit 10
QUERY='{"list_projects":{"start_after":5,"limit":10}}'

xiond query wasm contract-state smart $CONTRACT "$QUERY" \
  --output json \
  --node https://rpc.xion-testnet-2.burnt.com:443
```

### Proposal Queries

Get a specific proposal:

```bash
# Query proposal ID 2
QUERY='{"get_proposal":{"proposal_id":2}}'

xiond query wasm contract-state smart $CONTRACT "$QUERY" \
  --output json \
  --node https://rpc.xion-testnet-2.burnt.com:443
```

Get all proposals for a project:

```bash
# Get all proposals for project ID 1
QUERY='{"get_project_proposals":{"project_id":1}}'

xiond query wasm contract-state smart $CONTRACT "$QUERY" \
  --output json \
  --node https://rpc.xion-testnet-2.burnt.com:443
```

### Milestone Queries

Get a specific milestone:

```bash
# Query milestone ID 3
QUERY='{"get_milestone":{"milestone_id":3}}'

xiond query wasm contract-state smart $CONTRACT "$QUERY" \
  --output json \
  --node https://rpc.xion-testnet-2.burnt.com:443
```

Get all milestones for a project:

```bash
# Get all milestones for project ID 1
QUERY='{"get_project_milestones":{"project_id":1}}'

xiond query wasm contract-state smart $CONTRACT "$QUERY" \
  --output json \
  --node https://rpc.xion-testnet-2.burnt.com:443
```

### User Queries

Get projects for a specific user:

```bash
# Get all projects involving a specific address
QUERY='{"get_user_projects":{"user":"xion1..."}}'  # Replace with actual address

xiond query wasm contract-state smart $CONTRACT "$QUERY" \
  --output json \
  --node https://rpc.xion-testnet-2.burnt.com:443
```

Get a user's rating:

```bash
# Get rating for a specific user
QUERY='{"get_user_rating":{"user":"xion1..."}}'  # Replace with actual address

xiond query wasm contract-state smart $CONTRACT "$QUERY" \
  --output json \
  --node https://rpc.xion-testnet-2.burnt.com:443
```

### Dispute Queries

Get details of a dispute:

```bash
# Get dispute details for project ID 1
QUERY='{"get_dispute":{"project_id":1}}'

xiond query wasm contract-state smart $CONTRACT "$QUERY" \
  --output json \
  --node https://rpc.xion-testnet-2.burnt.com:443
```

### Platform Queries

Get platform configuration:

```bash
# Get platform config (fee percentage, owner)
QUERY='{"get_config":{}}'

xiond query wasm contract-state smart $CONTRACT "$QUERY" \
  --output json \
  --node https://rpc.xion-testnet-2.burnt.com:443
```

## Testing

The contract includes comprehensive tests for all functionality. Run them with:

```bash
cargo test
```

Key test files:
- Full workflow test - Tests a complete project lifecycle
- Dispute resolution test - Tests the voting and resolution system
- Rating system test - Tests reputation calculations

## Security Considerations

1. **Fund Security**: All project funds are held in the contract until milestones are approved.
2. **Dispute Resolution**: Requires at least 3 voters to resolve disputes, preventing easy manipulation.
3. **Access Control**: Strict permission checks ensure only authorized users can perform actions.
4. **Rating System**: The reputation system influences voting power in disputes, incentivizing honest behavior.

## License

This project is licensed under the MIT License - see the LICENSE file for details.