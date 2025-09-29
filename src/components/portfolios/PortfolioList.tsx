import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia, 
  CardActions, 
  Button, 
  Chip,
  IconButton, 
  CircularProgress, 
  Alert, 
  Paper 
} from '@mui/material';
import { 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  Launch as LaunchIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { listPortfolios, getFileViewUrl, BUCKET } from '@/lib/appwrite';
import { Query } from 'appwrite';
import type { Portfolios } from '@/types/appwrite.d';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

interface PortfolioListProps {
  profileId: string;
  showAddButton?: boolean;
}

const PortfolioList: React.FC<PortfolioListProps> = ({ profileId, showAddButton = false }) => {
  const { user } = useAuth();
  const [portfolios, setPortfolios] = useState<Portfolios[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  
  // Fetch portfolios on component mount
  useEffect(() => {
    const fetchPortfolios = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await listPortfolios([
          Query.equal('profileId', profileId),
          Query.orderDesc('$createdAt')
        ]);
        setPortfolios(response.documents);
        
        // Check if current user is the owner of this profile
        if (user) {
          setIsOwner(profileId === user.$id);
        }
      } catch (error) {
        console.error('Error fetching portfolios:', error);
        setError('Failed to load portfolios. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPortfolios();
  }, [profileId, user]);
  
  const handleDeletePortfolio = async (portfolioId: string) => {
    if (!confirm('Are you sure you want to delete this portfolio item?')) {
      return;
    }
    
    try {
      await portfolioService.deletePortfolio(portfolioId);
      
      // Remove from portfolios list
      setPortfolios(prevPortfolios => prevPortfolios.filter(p => p.$id !== portfolioId));
    } catch (error) {
      console.error('Error deleting portfolio:', error);
      setError('Failed to delete portfolio. Please try again.');
    }
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">Portfolio Projects</Typography>
        
        {showAddButton && isOwner && (
          <Button
            variant="contained"
            component={Link}
            href="/portfolios/create"
            startIcon={<AddIcon />}
            sx={{ 
              borderRadius: 2,
              background: 'linear-gradient(90deg, #2097ff 0%, #7857ff 100%)',
            }}
          >
            Add Project
          </Button>
        )}
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {portfolios.length > 0 ? (
        <Grid container spacing={3}>
          {portfolios.map((portfolio) => (
            <Grid item xs={12} sm={6} md={4} key={portfolio.$id}>
              <Card sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                borderRadius: 2,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)'
                }
              }}>
                {portfolio.mediaFileIds && portfolio.mediaFileIds.length > 0 && (
                  <CardMedia
                    component="img"
                    height="160"
                    image={portfolioService.getPortfolioMedia(portfolio.mediaFileIds[0])}
                    alt={portfolio.title}
                    sx={{ objectFit: 'cover' }}
                  />
                )}
                
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" component="h2" gutterBottom>
                    {portfolio.title}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 60 }}>
                    {portfolio.description.length > 150 
                      ? `${portfolio.description.substring(0, 150)}...` 
                      : portfolio.description}
                  </Typography>
                  
                  {portfolio.skillsUsed && portfolio.skillsUsed.length > 0 && (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                      {portfolio.skillsUsed.map((skill, index) => (
                        <Chip
                          key={index}
                          label={skill}
                          size="small"
                          sx={{ borderRadius: 1 }}
                        />
                      ))}
                    </Box>
                  )}
                </CardContent>
                
                <CardActions sx={{ p: 2 }}>
                  <Button 
                    component={Link}
                    href={`/portfolios/${portfolio.$id}`}
                    size="small" 
                    color="primary"
                  >
                    View Details
                  </Button>
                  
                  {portfolio.projectUrl && (
                    <IconButton 
                      size="small" 
                      color="primary" 
                      href={portfolio.projectUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <LaunchIcon fontSize="small" />
                    </IconButton>
                  )}
                  
                  {isOwner && (
                    <>
                      <Box sx={{ flexGrow: 1 }} />
                      <IconButton 
                        size="small" 
                        color="primary" 
                        component={Link}
                        href={`/portfolios/${portfolio.$id}/edit`}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        color="error" 
                        onClick={() => handleDeletePortfolio(portfolio.$id)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Paper 
          sx={{ 
            p: 4, 
            textAlign: 'center',
            borderRadius: 2,
            bgcolor: 'background.paper' 
          }}
        >
          <Typography variant="h6" color="text.secondary">
            {isOwner 
              ? 'You haven\'t added any portfolio projects yet.'
              : 'This user has not added any portfolio projects yet.'}
          </Typography>
          
          {isOwner && (
            <Button
              variant="contained"
              component={Link}
              href="/portfolios/create"
              startIcon={<AddIcon />}
              sx={{ mt: 2 }}
            >
              Add Your First Project
            </Button>
          )}
        </Paper>
      )}
    </Box>
  );
};

export default PortfolioList;