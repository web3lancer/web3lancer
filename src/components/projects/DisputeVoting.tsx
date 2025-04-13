'use client';

import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Paper, 
  CircularProgress,
  Divider,
  Alert,
  Card,
  CardContent,
  Grid,
  Chip,
  Avatar
} from '@mui/material';
import GavelIcon from '@mui/icons-material/Gavel';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import PersonIcon from '@mui/icons-material/Person';
import { useAbstraxionAccount, useAbstraxionSigningClient, useAbstraxionClient, useModal } from '@burnt-labs/abstraxion';
import { Abstraxion } from "@burnt-labs/abstraxion";
import { 
  getXionContractAddress, 
  getDisputeMsg, 
  getDisputeVotesMsg, 
  hasUserVotedMsg, 
  voteOnDisputeMsg 
} from '@/utils/xionContractUtils';
import { formatDistanceToNow } from 'date-fns';

interface DisputeVotingProps {
  projectId: number;
  clientName: string;
  clientAvatar?: string;
  freelancerName: string;
  freelancerAvatar?: string;
  onVoteComplete?: () => void;
}

export const DisputeVoting: React.FC<DisputeVotingProps> = ({
  projectId,
  clientName,
  clientAvatar,
  freelancerName,
  freelancerAvatar,
  onVoteComplete
}) => {
  const { data: account, isConnected } = useAbstraxionAccount();
  const { client: signingClient } = useAbstraxionSigningClient();
  const { client: queryClient } = useAbstraxionClient();
  const [showModal, setShowModal] = useModal();

  const [dispute, setDispute] = useState<any>(null);
  const [votes, setVotes] = useState<any[]>([]);
  const [hasVoted, setHasVoted] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isVoting, setIsVoting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const contractAddress = getXionContractAddress();

  // Fetch dispute details
  const fetchDispute = async () => {
    if (!queryClient || !contractAddress) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const disputeData = await queryClient.queryContractSmart(
        contractAddress,
        getDisputeMsg(projectId)
      );
      
      setDispute(disputeData);
      
      // Fetch votes for this dispute
      const votesData = await queryClient.queryContractSmart(
        contractAddress,
        getDisputeVotesMsg(projectId)
      );
      
      setVotes(votesData.votes || []);
      
      // Check if current user has voted
      if (account?.bech32Address) {
        const userVoteData = await queryClient.queryContractSmart(
          contractAddress,
          hasUserVotedMsg(projectId, account.bech32Address)
        );
        
        setHasVoted(userVoteData.has_voted);
      }
    } catch (err) {
      console.error("Error fetching dispute data:", err);
      setError("Failed to load dispute information. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Vote on the dispute
  const handleVote = async (voteForClient: boolean) => {
    if (!signingClient || !account?.bech32Address || !contractAddress) {
      setError("Please connect your wallet first.");
      return;
    }

    setIsVoting(true);
    setError(null);
    setSuccess(null);
    
    try {
      const response = await signingClient.execute(
        account.bech32Address,
        contractAddress,
        voteOnDisputeMsg(projectId, voteForClient),
        "auto"
      );

      console.log("Vote transaction successful:", response);
      setSuccess(`Your vote has been recorded! Transaction hash: ${response.transactionHash.substring(0, 10)}...`);
      
      // Refresh data
      await fetchDispute();
      
      if (onVoteComplete) {
        onVoteComplete();
      }
    } catch (err) {
      console.error("Error voting on dispute:", err);
      setError(`Failed to submit your vote: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsVoting(false);
    }
  };

  useEffect(() => {
    if (queryClient && contractAddress) {
      fetchDispute();
    }
  }, [queryClient, account?.bech32Address, contractAddress]);

  // Calculate vote percentages
  const totalVotes = dispute ? dispute.votes_for_client + dispute.votes_for_freelancer : 0;
  const clientVotePercentage = totalVotes > 0 ? (dispute?.votes_for_client / totalVotes) * 100 : 0;
  const freelancerVotePercentage = totalVotes > 0 ? (dispute?.votes_for_freelancer / totalVotes) * 100 : 0;

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!dispute) {
    return (
      <Alert severity="info">No active dispute found for this project.</Alert>
    );
  }

  return (
    <Card elevation={3} sx={{ mb: 3, overflow: 'visible', borderRadius: 2 }}>
      <Box sx={{ backgroundColor: 'primary.main', color: 'primary.contrastText', py: 1, px: 2, display: 'flex', alignItems: 'center' }}>
        <GavelIcon sx={{ mr: 1 }} />
        <Typography variant="h6">Dispute Resolution</Typography>
      </Box>
      
      <CardContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
        
        <Typography variant="body1" paragraph>
          {dispute.reason || "A dispute has been raised for this project."}
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Created {dispute.created_at ? formatDistanceToNow(new Date(dispute.created_at), { addSuffix: true }) : 'recently'}
          </Typography>
          <Chip 
            label={dispute.status || 'Active'} 
            color={dispute.status === 'Resolved' ? 'success' : 'warning'} 
            size="small" 
          />
        </Box>

        <Divider sx={{ my: 2 }} />
        
        {/* Voting UI */}
        <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <HowToVoteIcon sx={{ mr: 1 }} />
          Community Vote
        </Typography>

        <Grid container spacing={2} sx={{ mb: 3 }}>
          {/* Client side */}
          <Grid item xs={6}>
            <Box sx={{ 
              border: '1px solid',
              borderColor: 'divider', 
              borderRadius: 2,
              p: 2, 
              textAlign: 'center',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              <Box>
                <Avatar 
                  src={clientAvatar} 
                  sx={{ width: 64, height: 64, mx: 'auto', mb: 1 }}
                >
                  {!clientAvatar && <PersonIcon />}
                </Avatar>
                <Typography variant="subtitle1">{clientName || 'Client'}</Typography>
                <Typography 
                  variant="h5" 
                  color="primary.main" 
                  sx={{ fontWeight: 'bold', my: 1 }}
                >
                  {dispute.votes_for_client || 0} votes
                </Typography>
                <Box sx={{ 
                  bgcolor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  p: 1,
                  position: 'relative'
                }}>
                  <Box sx={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: `${clientVotePercentage}%`,
                    bgcolor: 'primary.light',
                    opacity: 0.2,
                    borderRadius: 1,
                  }} />
                  <Typography variant="body2">{clientVotePercentage.toFixed(1)}%</Typography>
                </Box>
              </Box>
              
              <Button 
                variant="contained" 
                color="primary"
                disabled={!isConnected || hasVoted || isVoting || dispute.status === 'Resolved'} 
                onClick={() => handleVote(true)}
                sx={{ mt: 2 }}
              >
                {isVoting ? <CircularProgress size={24} /> : 'Vote for Client'}
              </Button>
            </Box>
          </Grid>
          
          {/* Freelancer side */}
          <Grid item xs={6}>
            <Box sx={{ 
              border: '1px solid',
              borderColor: 'divider', 
              borderRadius: 2,
              p: 2, 
              textAlign: 'center',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              <Box>
                <Avatar 
                  src={freelancerAvatar} 
                  sx={{ width: 64, height: 64, mx: 'auto', mb: 1 }}
                >
                  {!freelancerAvatar && <PersonIcon />}
                </Avatar>
                <Typography variant="subtitle1">{freelancerName || 'Freelancer'}</Typography>
                <Typography 
                  variant="h5" 
                  color="secondary.main" 
                  sx={{ fontWeight: 'bold', my: 1 }}
                >
                  {dispute.votes_for_freelancer || 0} votes
                </Typography>
                <Box sx={{ 
                  bgcolor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  p: 1,
                  position: 'relative'
                }}>
                  <Box sx={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: `${freelancerVotePercentage}%`,
                    bgcolor: 'secondary.light',
                    opacity: 0.2,
                    borderRadius: 1,
                  }} />
                  <Typography variant="body2">{freelancerVotePercentage.toFixed(1)}%</Typography>
                </Box>
              </Box>
              
              <Button 
                variant="contained" 
                color="secondary" 
                disabled={!isConnected || hasVoted || isVoting || dispute.status === 'Resolved'} 
                onClick={() => handleVote(false)}
                sx={{ mt: 2 }}
              >
                {isVoting ? <CircularProgress size={24} /> : 'Vote for Freelancer'}
              </Button>
            </Box>
          </Grid>
        </Grid>
        
        {/* Connect wallet reminder */}
        {!isConnected && (
          <Box sx={{ textAlign: 'center', my: 2 }}>
            <Button 
              variant="outlined" 
              onClick={() => setShowModal(true)}
              startIcon={<HowToVoteIcon />}
            >
              Connect Wallet to Vote
            </Button>
          </Box>
        )}
        
        {hasVoted && dispute.status !== 'Resolved' && (
          <Alert severity="info" sx={{ mt: 2 }}>
            You have already voted on this dispute. Thank you for your participation!
          </Alert>
        )}
        
        {dispute.status === 'Resolved' && (
          <Alert severity="success" sx={{ mt: 2 }}>
            This dispute has been resolved. The {dispute.winner === 'client' ? 'client' : 'freelancer'} has won the dispute.
          </Alert>
        )}
        
        {/* Recent votes */}
        {votes.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" gutterBottom>Recent Votes</Typography>
            <Box sx={{ maxHeight: '200px', overflow: 'auto' }}>
              {votes.slice(0, 5).map((vote: any, index: number) => (
                <Box 
                  key={index}
                  sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    py: 1,
                    borderBottom: index < votes.length - 1 ? '1px solid' : 'none',
                    borderColor: 'divider'
                  }}
                >
                  <Typography variant="body2" sx={{ 
                    overflow: 'hidden', 
                    textOverflow: 'ellipsis',
                    maxWidth: '70%'
                  }}>
                    {vote.voter.substring(0, 8)}...{vote.voter.substring(vote.voter.length - 6)}
                  </Typography>
                  <Chip 
                    size="small" 
                    label={vote.vote_for_client ? 'Client' : 'Freelancer'} 
                    color={vote.vote_for_client ? 'primary' : 'secondary'} 
                    variant="outlined"
                  />
                </Box>
              ))}
            </Box>
          </Box>
        )}
      </CardContent>
      
      {/* Abstraxion Modal */}
      <Abstraxion onClose={() => setShowModal(false)} />
    </Card>
  );
};