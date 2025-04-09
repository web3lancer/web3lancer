"""
Voting Security Integration Module.

This module integrates Web3Sentry security detectors with the Web3lancer voting system.
"""
import asyncio
import logging
from typing import Dict, Any, List, Optional
import os
import sys

# Add the Web3Sentry path to enable imports
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../web3sentry')))

from web3sentry.api.detector_service import DetectorService

logger = logging.getLogger(__name__)

class VotingSecurityService:
    """Service for integrating security detectors with the voting system."""
    
    def __init__(self):
        """Initialize the voting security service."""
        self.detector_service = DetectorService()
        logger.info("Voting security service initialized")
        
    async def verify_proposal_creation(self, proposal_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Verify a proposal creation for security issues.
        
        Args:
            proposal_data: Dictionary with proposal details including:
                - creator information
                - proposal content
                - voting parameters
                - multisig details if applicable
                
        Returns:
            Security analysis results.
        """
        # Prepare transaction data for analysis
        transaction_data = {
            "type": "proposal_creation",
            "from": proposal_data.get("creator_address"),
            "to": proposal_data.get("voting_contract_address"),
            "user_id": proposal_data.get("creator_id"),
            # Include multisig data if using a multisig governance
            "signers": proposal_data.get("authorized_signers", []),
            "required_signatures": proposal_data.get("required_signatures", 0)
        }
        
        # Determine which detectors to use
        detector_ids = []
        if proposal_data.get("is_multisig_governance", False):
            detector_ids.append("multisig")
            
        # Run security analysis
        analysis_results = await self.detector_service.analyze_transaction(
            transaction_data,
            detector_ids=detector_ids
        )
        
        # Add voting-specific recommendations
        self._add_voting_recommendations(analysis_results, proposal_data)
        
        return analysis_results
    
    async def verify_vote_submission(self, vote_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Verify a vote submission for security issues.
        
        Args:
            vote_data: Dictionary with vote details.
                
        Returns:
            Security analysis results.
        """
        # Prepare transaction data for analysis
        transaction_data = {
            "type": "vote_submission",
            "from": vote_data.get("voter_address"),
            "to": vote_data.get("voting_contract_address"),
            "user_id": vote_data.get("voter_id"),
            "proposal_id": vote_data.get("proposal_id"),
            # Include multisig data if applicable
            "signers": vote_data.get("signers", []),
            "provided_signatures": vote_data.get("provided_signatures", []),
            "signature_timestamps": vote_data.get("signature_timestamps", []),
            "required_signatures": vote_data.get("required_signatures", 0)
        }
        
        # Determine which detectors to use
        detector_ids = []
        if vote_data.get("is_multisig", False):
            detector_ids.append("multisig")
            
        # Run security analysis
        analysis_results = await self.detector_service.analyze_transaction(
            transaction_data,
            detector_ids=detector_ids
        )
        
        # Add voting-specific recommendations
        self._add_voting_recommendations(analysis_results, vote_data)
        
        return analysis_results
    
    def _add_voting_recommendations(self, results: Dict[str, Any], vote_data: Dict[str, Any]):
        """Add voting-specific security recommendations based on analysis."""
        overall_risk = results.get("overall_risk", "unknown")
        
        if overall_risk in ["high", "critical"]:
            results["voting_recommendations"] = [
                "Consider canceling this transaction and reviewing the security issues",
                "Verify all voting parameters before proceeding",
                "Check if this proposal/vote aligns with community guidelines"
            ]
        elif overall_risk == "medium":
            results["voting_recommendations"] = [
                "Review the security warnings before proceeding",
                "Consider waiting for more community feedback before finalizing"
            ]
        else:
            results["voting_recommendations"] = [
                "Transaction appears safe, but always verify proposal details before confirming"
            ]
        
        # Add specific recommendation for multisig
        if vote_data.get("is_multisig", False):
            results["voting_recommendations"].append(
                "Ensure all signers are legitimate governance participants"
            )
