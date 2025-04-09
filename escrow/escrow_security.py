"""
Escrow Security Integration Module.

This module integrates Web3Sentry security detectors with the Web3lancer escrow system.
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

class EscrowSecurityService:
    """Service for integrating security detectors with the escrow system."""
    
    def __init__(self):
        """Initialize the escrow security service."""
        self.detector_service = DetectorService()
        logger.info("Escrow security service initialized")
        
    async def verify_escrow_creation(self, escrow_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Verify an escrow creation transaction for security issues.
        
        Args:
            escrow_data: Dictionary with escrow details including:
                - parties involved (client, freelancer)
                - payment amount
                - token details
                - escrow contract address
                - multisig settings if applicable
                
        Returns:
            Security analysis results.
        """
        # Prepare transaction data for analysis
        transaction_data = {
            "type": "escrow_creation",
            "from": escrow_data.get("client_address"),
            "to": escrow_data.get("escrow_contract_address"),
            "amount": escrow_data.get("payment_amount"),
            "token_address": escrow_data.get("token_address"),
            "user_id": escrow_data.get("client_id"),
            # Include multisig data if present
            "signers": escrow_data.get("authorized_signers", []),
            "required_signatures": escrow_data.get("required_signatures", 0)
        }
        
        # Determine which detectors to use based on escrow type
        detector_ids = ["approvals"]
        if escrow_data.get("is_multisig", False):
            detector_ids.append("multisig")
            
        # Run security analysis
        analysis_results = await self.detector_service.analyze_transaction(
            transaction_data,
            detector_ids=detector_ids
        )
        
        # Add escrow-specific recommendations
        self._add_escrow_recommendations(analysis_results, escrow_data)
        
        return analysis_results
    
    async def verify_escrow_release(self, release_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Verify an escrow release transaction for security issues.
        
        Args:
            release_data: Dictionary with escrow release details.
                
        Returns:
            Security analysis results.
        """
        # Prepare transaction data for analysis
        transaction_data = {
            "type": "escrow_release",
            "from": release_data.get("sender_address"),
            "to": release_data.get("escrow_contract_address"),
            "amount": release_data.get("release_amount"),
            "user_id": release_data.get("sender_id"),
            # Include multisig data if applicable
            "signers": release_data.get("signers", []),
            "provided_signatures": release_data.get("provided_signatures", []),
            "signature_timestamps": release_data.get("signature_timestamps", []),
            "required_signatures": release_data.get("required_signatures", 0)
        }
        
        # Determine which detectors to use
        detector_ids = []
        if release_data.get("is_multisig", False):
            detector_ids.append("multisig")
            
        # Run security analysis
        analysis_results = await self.detector_service.analyze_transaction(
            transaction_data,
            detector_ids=detector_ids
        )
        
        # Add escrow-specific recommendations
        self._add_escrow_recommendations(analysis_results, release_data)
        
        return analysis_results
    
    def _add_escrow_recommendations(self, results: Dict[str, Any], escrow_data: Dict[str, Any]):
        """Add escrow-specific security recommendations based on analysis."""
        overall_risk = results.get("overall_risk", "unknown")
        
        if overall_risk in ["high", "critical"]:
            results["escrow_recommendations"] = [
                "Consider canceling this transaction and reviewing the security issues",
                "Verify all parties involved before proceeding",
                "Contact support if you need assistance resolving these issues"
            ]
        elif overall_risk == "medium":
            results["escrow_recommendations"] = [
                "Review the security warnings before proceeding",
                "Consider additional verification steps for the involved parties"
            ]
        else:
            results["escrow_recommendations"] = [
                "Transaction appears safe, but always verify details before confirming"
            ]
        
        # Add specific recommendation for multisig
        if escrow_data.get("is_multisig", False):
            results["escrow_recommendations"].append(
                "Ensure all signers are legitimate and expected for this transaction"
            )
