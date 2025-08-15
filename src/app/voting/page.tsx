'use client';

import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Grid, 
  Divider, 
  Card, 
  CardContent, 
  CardActionArea,
  Chip, 
  Button, 
  CircularProgress,
  Alert,
  TextField,
  InputAdornment
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import GavelIcon from '@mui/icons-material/Gavel';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
// Abstraxion/Xion removed — using placeholders
// Abstraxion removed — wallet-related data not available
const useAbstraxionAccount = () => ({ data: null, isConnected: false });
const useAbstraxionClient = () => ({ client: null });
const useModal = () => [false, (_v:boolean) => {}] as const;
const Abstraxion = (_props: any) => null;
import { 
  getXionContractAddress, 
  getActiveDisputesMsg, 
  Dispute 
} from '@/utils/xionContractUtils';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

export default function VotingPage() {
  const { data: account, isConnected } = useAbstraxionAccount();
  const { client: queryClient } = useAbstraxionClient();
  const [showModal, setShowModal] = useModal();

  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const contractAddress = getXionContractAddress();

  // Fetch all active disputes
  const fetchDisputes = async () => {
    if (!queryClient || !contractAddress) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await queryClient.queryContractSmart(
        contractAddress,
        getActiveDisputesMsg()
      );
      
      setDisputes(response.disputes || []);
    } catch (err) {
      console.error("Error fetching disputes:", err);
      setError("Failed to load disputes. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Filter disputes based on search term
  const filteredDisputes = disputes.filter(dispute => 
    dispute.projectId.toString().includes(searchTerm) ||
    dispute.reason?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    if (queryClient && contractAddress) {
      fetchDisputes();
    }
  }, [queryClient, contractAddress]);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper 
        elevation={0}
        sx={{ 
          p: 4, 
          mb: 4, 
          backgroundColor: 'primary.main', 
          color: 'white', 
          borderRadius: 2,
          backgroundImage: 'linear-gradient(to right, #3a5abb, #6599e2)',
        }}
      >
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={8}>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Community Voting System
            </Typography>
            <Typography variant="body1">
              Help resolve disputes between clients and freelancers by casting your vote. Your participation ensures fair resolutions and strengthens the Web3Lancer community.
            </Typography>
          </Grid>
          <Grid item xs={12} md={4} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
            <Button 
              variant="contained" 
              color="secondary" 
              onClick={() => setShowModal(true)}
              startIcon={<HowToVoteIcon />}
              size="large"
              sx={{ 
                fontWeight: 'bold', 
                px: 3, 
                backgroundColor: 'white', 
                color: 'primary.main',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.9)',
                }
              }}
            >
              {isConnected ? 'Connected' : 'Connect Wallet to Vote'}
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2} alignItems="center" justifyContent="space-between">
          <Grid item xs={12} sm={6}>
            <Typography variant="h5" fontWeight="medium">
              Active Disputes
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search disputes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              size="small"
            />
          </Grid>
        </Grid>
      </Box>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : filteredDisputes.length > 0 ? (
        <Grid container spacing={3}>
          {filteredDisputes.map((dispute) => (
            <Grid item xs={12} sm={6} md={4} key={dispute.id}>
              <Card 
                elevation={2} 
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 2,
                  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 20px -10px rgba(0,0,0,0.2)',
                  }
                }}
              >
                <CardActionArea 
                  component={Link}
                  href={`/projects/${dispute.projectId}`}
                  sx={{ flexGrow: 1 }}
                >
                  <Box sx={{ 
                    p: 1, 
                    backgroundColor: 'primary.main', 
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    <GavelIcon sx={{ mr: 1, fontSize: 20 }} />
                    <Typography variant="subtitle2">
                      Project #{dispute.projectId}
                    </Typography>
                  </Box>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Chip 
                        label={dispute.status} 
                        color={dispute.status === 'Active' ? 'warning' : 'success'} 
                        size="small" 
                      />
                      <Typography variant="caption" color="text.secondary">
                        {dispute.created ? formatDistanceToNow(new Date(dispute.created), { addSuffix: true }) : 'N/A'}
                      </Typography>
                    </Box>
                    
                    <Typography variant="body1" sx={{ 
                      mb: 2,
                      display: '-webkit-box',
                      overflow: 'hidden',
                      WebkitBoxOrient: 'vertical',
                      WebkitLineClamp: 2,
                      height: '48px'
                    }}>
                      {dispute.reason || "Dispute resolution required"}
                    </Typography>
                    
                    <Divider sx={{ my: 1 }} />
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="body2" color="primary">
                          Client: {dispute.votesForClient}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="secondary">
                          Freelancer: {dispute.votesForFreelancer}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </CardActionArea>
                <Box sx={{ p: 2, pt: 0 }}>
                  <Button 
                    component={Link}
                    href={`/projects/${dispute.projectId}`}
                    fullWidth 
                    variant="outlined" 
                    color="primary"
                    endIcon={<HowToVoteIcon />}
                  >
                    View & Vote
                  </Button>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Paper sx={{ p: 4, textAlign: 'center', mb: 3, borderRadius: 2 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {searchTerm ? 'No matching disputes found' : 'No active disputes at the moment'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {searchTerm ? 'Try adjusting your search criteria' : 'Check back later for new disputes that need community votes'}
          </Typography>
        </Paper>
      )}
      
      {/* How it works section */}
      <Paper sx={{ p: 4, mt: 6, borderRadius: 2 }}>
        <Typography variant="h5" gutterBottom>
          How Voting Works
        </Typography>
        <Divider sx={{ mb: 3 }} />
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                width: 60, 
                height: 60, 
                borderRadius: '50%', 
                backgroundColor: 'primary.light',
                color: 'primary.contrastText',
                mb: 2,
                mx: 'auto'
              }}>
                <Typography variant="h5" fontWeight="bold">1</Typography>
              </Box>
              <Typography variant="h6" gutterBottom>Connect Your Wallet</Typography>
              <Typography variant="body2" color="text.secondary">
                Use Xion wallet to authenticate and participate in the voting process securely.
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                width: 60, 
                height: 60, 
                borderRadius: '50%', 
                backgroundColor: 'primary.light',
                color: 'primary.contrastText',
                mb: 2,
                mx: 'auto'
              }}>
                <Typography variant="h5" fontWeight="bold">2</Typography>
              </Box>
              <Typography variant="h6" gutterBottom>Review the Dispute</Typography>
              <Typography variant="body2" color="text.secondary">
                Examine the details of the dispute, understand both parties' arguments, and make an informed decision.
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                width: 60, 
                height: 60, 
                borderRadius: '50%', 
                backgroundColor: 'primary.light',
                color: 'primary.contrastText',
                mb: 2,
                mx: 'auto'
              }}>
                <Typography variant="h5" fontWeight="bold">3</Typography>
              </Box>
              <Typography variant="h6" gutterBottom>Cast Your Vote</Typography>
              <Typography variant="body2" color="text.secondary">
                Vote for either the client or freelancer. Each address can vote once per dispute on the Xion blockchain.
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Abstraxion Modal */}
      <Abstraxion onClose={() => setShowModal(false)} />
    </Container>
  );
}