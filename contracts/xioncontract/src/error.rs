use cosmwasm_std::StdError;
use thiserror::Error;

#[derive(Error, Debug, PartialEq)]
pub enum ContractError {
    #[error("{0}")]
    Std(#[from] StdError),

    #[error("Unauthorized")]
    Unauthorized {},
    
    #[error("Empty title")]
    EmptyTitle {},
    
    #[error("Empty description")]
    EmptyDescription {},
    
    #[error("Empty reason")]
    EmptyReason {},
    
    #[error("Invalid fee percentage")]
    InvalidFee {},
    
    #[error("Invalid amount")]
    InvalidAmount {},
    
    #[error("Invalid rating")]
    InvalidRating {},
    
    #[error("Insufficient funds")]
    InsufficientFunds {},
    
    #[error("Project not open")]
    ProjectNotOpen {},
    
    #[error("Project not in progress")]
    ProjectNotInProgress {},
    
    #[error("Project not completed")]
    ProjectNotCompleted {},
    
    #[error("Project not disputed")]
    ProjectNotDisputed {},
    
    #[error("Invalid proposal")]
    InvalidProposal {},
    
    #[error("Proposal not pending")]
    ProposalNotPending {},
    
    #[error("Invalid milestone")]
    InvalidMilestone {},
    
    #[error("Invalid milestone status")]
    InvalidMilestoneStatus {},
    
    #[error("Milestone not submitted")]
    MilestoneNotSubmitted {},
    
    #[error("Already voted")]
    AlreadyVoted {},
    
    #[error("Dispute already resolved")]
    DisputeResolved {},
    
    #[error("Budget exceeded")]
    ExceedsBudget {},
    
    #[error("Project funding failed")]
    FundingFailed {},
    
    #[error("Invalid deadline")]
    InvalidDeadline {},
}