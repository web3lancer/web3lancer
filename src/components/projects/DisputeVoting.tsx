'use client';

// Removed Abstraxion/Xion deps: replaced with stubs and fetch-based logic


import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Card, 
  CardContent, 
  Grid,
  Avatar,
  Divider,
  CircularProgress,
  Alert,
  Chip,
  LinearProgress,
  Paper
} from '@mui/material';
// Abstraxion/Xion removed
import PersonIcon from '@mui/icons-material/Person';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { 
  getXionContractAddress, 
  voteOnDisputeMsg, 
  getDisputeMsg, 
  hasUserVotedMsg 
} from '@/utils/xionContractUtils';
import { formatDistanceToNow } from 'date-fns';

interface DisputeVotingProps {
  projectId: number;
  clientName: string;
  clientAvatar?: string;
  freelancerName: string;
  freelancerAvatar?: string;
}

export const DisputeVoting: React.FC<DisputeVotingProps> = ({
  projectId,
  clientName,
  clientAvatar,
  freelancerName,
  freelancerAvatar
}) => {
  // Abstraxion/Xion integration removed. Use app backend and app wallet instead.
  const account = null as any;
  const signingClient = null as any;
  const queryClient = null as any;
  const [showModal, setShowModal] = useState(false);
  
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [dispute, setDispute] = useState<any>(null);
  const [hasVoted, setHasVoted] = useState<boolean>(false);
  const [userVotedFor, setUserVotedFor] = useState<'client' | 'freelancer' | null>(null);
  
  // Xion contract removed - fetch dispute information from app backend instead
  const contractAddress = null;
  
  // Fetch dispute information
  useEffect(() => {
    const fetchDisputeInfo = async () => {
      // Example: fetch from app API
      try {
        setLoading(true);
        const res = await fetch(`/api/projects/${projectId}/disputes/active`);
        if (!res.ok) throw new Error('Failed to fetch');
        const disputeData = await res.json();
        setDispute(disputeData);

        // determine if current user has voted -- placeholder
        setHasVoted(disputeData.user_has_voted || false);
        setUserVotedFor(disputeData.user_voted_for_client ? 'client' : 'freelancer');
      } catch (err) {
        console.error('Error fetching dispute:', err);
        setError('Failed to load dispute information.');
      } finally {
        setLoading(false);
      }
    };
    fetchDisputeInfo();
  }, [projectId]);
  
  // Calculate vote percentages
  const totalVotes = dispute ? (dispute.votes_for_client + dispute.votes_for_freelancer) : 0;
  const clientVotePercentage = totalVotes > 0 ? (dispute?.votes_for_client / totalVotes) * 100 : 0;
  const freelancerVotePercentage = totalVotes > 0 ? (dispute?.votes_for_freelancer / totalVotes) * 100 : 0;
  
  // Vote for client or freelancer
  const handleVote = async (voteForClient: boolean) => {
    if (!isConnected) {
      setShowModal(true);
      return;
    }
    
    if (!signingClient || !account?.bech32Address) {
      setError("Wallet not connected. Please connect your wallet.");
      return;
    }
    
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    
    try {
      const response = await signingClient.execute(
        account.bech32Address,
        contractAddress,
        voteOnDisputeMsg(projectId, voteForClient),
        "auto"
      );
      
      console.log("Vote submitted successfully:", response);
      setSuccess(`Your vote for the ${voteForClient ? 'client' : 'freelancer'} has been recorded.`);
      
      // Update UI to show the user has voted
      setHasVoted(true);
      setUserVotedFor(voteForClient ? 'client' : 'freelancer');
      
      // Refresh dispute data to get updated vote counts
      const updatedDispute = await queryClient?.queryContractSmart(
        contractAddress,
        getDisputeMsg(projectId)
      );
      
      setDispute(updatedDispute);
    } catch (err) {
      console.error("Error submitting vote:", err);
      setError(`Failed to submit vote: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <CircularProgress size={40} />
        <Typography sx={{ mt: 2 }}>Loading dispute information...</Typography>
      </Paper>
    );
  }
  
  if (error) {
    return (
      <Alert severity="error" sx={{ my: 2 }}>
        {error}
      </Alert>
    );
  }
  
  if (!dispute) {
    return (
      <Alert severity="info" sx={{ my: 2 }}>
        No active dispute found for this project.
      </Alert>
    );
  }
  
  return (
    <Card variant="outlined" sx={{ mb: 4, borderRadius: 2 }}>
      <Box sx={{ 
        p: 2, 
        backgroundColor: 'primary.main', 
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Box display="flex" alignItems="center">
          <HowToVoteIcon sx={{ mr: 1 }} />
          <Typography variant="h6">
            Project Dispute Resolution
          </Typography>
        </Box>
        <Chip 
          label={dispute.status} 
          color={dispute.status === 'Active' ? 'warning' : 'success'} 
          size="small" 
        />
      </Box>
      
      <CardContent>
        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            Dispute Reason:
          </Typography>
          <Typography variant="body1">
            {dispute.reason || "No reason provided"}
          </Typography>
          
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
            Created {dispute.created && formatDistanceToNow(new Date(dispute.created), { addSuffix: true })}
          </Typography>
        </Box>
        
        <Divider sx={{ my: 3 }} />
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>
            Current Votes: {totalVotes} total
          </Typography>
          
          <Box sx={{ mb: 4 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={12} md={12}>
                <LinearProgress
                  variant="determinate"
                  value={clientVotePercentage}
                  sx={{
                    height: 20,
                    borderRadius: 1,
                    backgroundColor: `rgba(244, 67, 54, 0.2)`, // Freelancer color with opacity
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: 'primary.main', // Client color
                    }
                  }}
                />
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  mt: 1
                }}>
                  <Typography variant="body2" color="primary.main">
                    Client: {dispute.votes_for_client} ({Math.round(clientVotePercentage)}%)
                  </Typography>
                  <Typography variant="body2" color="error">
                    Freelancer: {dispute.votes_for_freelancer} ({Math.round(freelancerVotePercentage)}%)
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Box>
        
        <Divider sx={{ my: 3 }} />
        
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Card 
              variant="outlined" 
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                p: 2,
                borderColor: hasVoted && userVotedFor === 'client' ? 'primary.main' : 'divider',
                boxShadow: hasVoted && userVotedFor === 'client' ? '0 0 0 2px #1976d2' : 'none'
              }}
            >
              <Avatar
                src={clientAvatar}
                sx={{ width: 60, height: 60, mb: 1, bgcolor: 'primary.main' }}
              >
                {!clientAvatar && <PersonIcon />}
              </Avatar>
              <Typography variant="h6" align="center" gutterBottom>
                {clientName}
              </Typography>
              <Typography variant="body2" color="text.secondary" align="center" gutterBottom>
                Client
              </Typography>
              
              {hasVoted && userVotedFor === 'client' && (
                <Chip
                  label="You voted for client"
                  color="primary"
                  icon={<CheckCircleIcon />}
                  sx={{ mt: 1, mb: 2 }}
                />
              )}
              
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={() => handleVote(true)}
                disabled={submitting || hasVoted || dispute.status !== 'Active'}
                sx={{ mt: 'auto' }}
              >
                {submitting ? <CircularProgress size={24} /> : "Vote for Client"}
              </Button>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Card 
              variant="outlined" 
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                p: 2,
                borderColor: hasVoted && userVotedFor === 'freelancer' ? 'error.main' : 'divider',
                boxShadow: hasVoted && userVotedFor === 'freelancer' ? '0 0 0 2px #f44336' : 'none'
              }}
            >
              <Avatar
                src={freelancerAvatar}
                sx={{ width: 60, height: 60, mb: 1, bgcolor: 'error.main' }}
              >
                {!freelancerAvatar && <PersonIcon />}
              </Avatar>
              <Typography variant="h6" align="center" gutterBottom>
                {freelancerName}
              </Typography>
              <Typography variant="body2" color="text.secondary" align="center" gutterBottom>
                Freelancer
              </Typography>
              
              {hasVoted && userVotedFor === 'freelancer' && (
                <Chip
                  label="You voted for freelancer"
                  color="error"
                  icon={<CheckCircleIcon />}
                  sx={{ mt: 1, mb: 2 }}
                />
              )}
              
              <Button
                variant="contained"
                color="error"
                fullWidth
                onClick={() => handleVote(false)}
                disabled={submitting || hasVoted || dispute.status !== 'Active'}
                sx={{ mt: 'auto' }}
              >
                {submitting ? <CircularProgress size={24} /> : "Vote for Freelancer"}
              </Button>
            </Card>
          </Grid>
        </Grid>
        
        {!isConnected && (
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Button
              variant="outlined"
              onClick={() => setShowModal(true)}
              startIcon={<HowToVoteIcon />}
            >
              Connect wallet to vote
            </Button>
          </Box>
        )}
        
        <Box sx={{ mt: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Please review the project details and dispute carefully before casting your vote. 
            Each wallet address can vote only once per dispute.
          </Typography>
        </Box>
      </CardContent>
      
      {/* Abstraxion Modal */}
      <Abstraxion onClose={() => setShowModal(false)} />
    </Card>
  );
};