import React, { useState, useEffect } from "react";
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Button, 
  Chip, 
  IconButton,
  Menu,
  MenuItem,
  Divider,
  useTheme,
  Badge,
  Stack,
  Avatar,
  Tabs,
  Tab,
  ListItemIcon,
  Paper,
  Alert
} from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PendingIcon from '@mui/icons-material/Pending';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DoNotDisturbIcon from '@mui/icons-material/DoNotDisturb';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import PaidIcon from '@mui/icons-material/Paid';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PersonIcon from '@mui/icons-material/Person';
import WorkIcon from '@mui/icons-material/Work';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface MyListingsTabProps {
  user: any;
  jobs: any[];
  projects: any[];
}

const MotionCard = motion(Card);

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  }
};

export default function MyListingsTab({ user, jobs, projects }: MyListingsTabProps) {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  const myJobs = user ? jobs.filter((job: any) => job.clientId === user.$id) : [];
  const myProjects = user ? projects.filter((project: any) => project.userId === user.$id) : [];

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, itemId: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedItemId(itemId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedItemId(null);
  };

  const handleDelete = () => {
    // Handle delete logic here
    handleMenuClose();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open':
        return theme.palette.success.main;
      case 'pending':
        return theme.palette.warning.main;
      case 'closed':
        return theme.palette.error.main;
      default:
        return theme.palette.grey[500];
    }
  };

  const getStatusChipIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open':
        return <CheckCircleIcon fontSize="small" />;
      case 'pending':
        return <PendingIcon fontSize="small" />;
      case 'closed':
        return <DoNotDisturbIcon fontSize="small" />;
      default:
        return undefined;
    }
  };

  if (!user) {
    return (
      <Alert severity="info" sx={{ borderRadius: 2, boxShadow: 1 }}>
        Please sign in to view your listings.
      </Alert>
    );
  }

  return (
    <Box>
      <Paper sx={{ 
        borderRadius: 3,
        mb: 3,
        overflow: 'hidden',
        boxShadow: theme => `0 4px 20px ${theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.1)'}`
      }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{
            background: theme => `linear-gradient(145deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
            '& .MuiTab-root': {
              color: 'white',
              opacity: 0.7,
              py: 2,
              '&.Mui-selected': {
                opacity: 1,
                fontWeight: 'bold',
              }
            },
            '& .MuiTabs-indicator': {
              height: 3,
              backgroundColor: 'white',
            }
          }}
        >
          <Tab 
            icon={<WorkIcon />} 
            iconPosition="start" 
            label={`My Jobs (${myJobs.length})`} 
          />
          <Tab 
            icon={<PersonIcon />} 
            iconPosition="start" 
            label={`My Projects (${myProjects.length})`} 
          />
        </Tabs>
      </Paper>

      <Box role="tabpanel" hidden={tabValue !== 0}>
        {tabValue === 0 && (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {myJobs.length === 0 ? (
              <Box 
                sx={{ 
                  textAlign: 'center', 
                  py: 8, 
                  px: 3,
                  bgcolor: theme.palette.grey[50],
                  borderRadius: 3,
                  border: `1px dashed ${theme.palette.grey[300]}`
                }}
              >
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  You haven't posted any jobs yet
                </Typography>
                <Button 
                  variant="contained" 
                  sx={{ mt: 2, borderRadius: 2 }}
                  onClick={() => {
                    // Navigate to post job tab logic
                  }}
                >
                  Post Your First Job
                </Button>
              </Box>
            ) : (
              <Grid container spacing={3}>
                {myJobs.map((job) => (
                  <Grid item xs={12} key={job.$id}>
                    <motion.div variants={itemVariants}>
                      <MotionCard
                        whileHover={{ 
                          y: -5, 
                          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                          transition: { duration: 0.2 }
                        }}
                        sx={{ 
                          borderRadius: 3,
                          overflow: 'hidden',
                          position: 'relative',
                          border: `1px solid ${theme.palette.divider}`,
                          '&:hover': {
                            borderColor: theme.palette.primary.main,
                          }
                        }}
                      >
                        <Box 
                          sx={{ 
                            height: 8, 
                            width: '100%', 
                            bgcolor: theme.palette.primary.main,
                            position: 'absolute',
                            top: 0,
                            left: 0
                          }} 
                        />
                        
                        <CardContent sx={{ pt: 3 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                            <Stack direction="row" spacing={1}>
                              <Chip 
                                label="Job" 
                                sx={{ 
                                  bgcolor: `${theme.palette.primary.main}15`,
                                  color: theme.palette.primary.main,
                                  fontWeight: 'bold'
                                }} 
                              />
                              
                              <Chip 
                                icon={getStatusChipIcon(job.status || 'open')}
                                label={job.status || 'Open'} 
                                sx={{ 
                                  bgcolor: `${getStatusColor(job.status || 'open')}15`,
                                  color: getStatusColor(job.status || 'open'),
                                  fontWeight: 'bold'
                                }} 
                              />
                            </Stack>
                            
                            <IconButton
                              aria-label="more options"
                              onClick={(e) => handleMenuOpen(e, job.$id)}
                              size="small"
                            >
                              <MoreVertIcon />
                            </IconButton>
                          </Box>
                          
                          <Typography
                            variant="h6"
                            component="h2"
                            sx={{
                              mb: 1,
                              fontWeight: 'bold',
                            }}
                          >
                            {job.title}
                          </Typography>
                          
                          <Box sx={{ display: 'flex', gap: 3, mb: 2, color: 'text.secondary' }}>
                            {job.budget && (
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <PaidIcon fontSize="small" sx={{ mr: 0.5, color: 'success.main' }} />
                                <Typography variant="body2" fontWeight="medium">
                                  {job.budget}
                                </Typography>
                              </Box>
                            )}
                            
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <CalendarTodayIcon fontSize="small" sx={{ mr: 0.5 }} />
                              <Typography variant="body2">
                                Posted: {formatDate(job.$createdAt)}
                              </Typography>
                            </Box>
                          </Box>
                          
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mb: 2 }}
                          >
                            {job.description}
                          </Typography>
                          
                          {job.skills && job.skills.length > 0 && (
                            <Box sx={{ mb: 3, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                              {job.skills.map((skill: string, index: number) => (
                                <Chip
                                  key={index}
                                  label={skill}
                                  size="small"
                                  sx={{
                                    bgcolor: theme.palette.grey[100],
                                    color: theme.palette.text.primary,
                                  }}
                                />
                              ))}
                            </Box>
                          )}
                          
                          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                            <Button
                              variant="outlined"
                              startIcon={<EditIcon />}
                              sx={{ borderRadius: 2 }}
                            >
                              Edit
                            </Button>
                            
                            <Button
                              component={Link}
                              href={`/jobs/${job.$id}`}
                              variant="contained"
                              endIcon={<ArrowForwardIcon />}
                              sx={{ 
                                borderRadius: 2,
                                textTransform: 'none',
                                fontWeight: 'bold',
                                boxShadow: `0 4px 10px ${theme.palette.primary.main}40`,
                                '&:hover': {
                                  boxShadow: `0 6px 15px ${theme.palette.primary.main}60`,
                                }
                              }}
                            >
                              View Details
                            </Button>
                          </Box>
                        </CardContent>
                      </MotionCard>
                    </motion.div>
                  </Grid>
                ))}
              </Grid>
            )}
          </motion.div>
        )}
      </Box>

      <Box role="tabpanel" hidden={tabValue !== 1}>
        {tabValue === 1 && (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {myProjects.length === 0 ? (
              <Box 
                sx={{ 
                  textAlign: 'center', 
                  py: 8, 
                  px: 3,
                  bgcolor: theme.palette.grey[50],
                  borderRadius: 3,
                  border: `1px dashed ${theme.palette.grey[300]}`
                }}
              >
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  You haven't created any projects yet
                </Typography>
                <Button 
                  variant="contained" 
                  color="secondary"
                  sx={{ mt: 2, borderRadius: 2 }}
                  onClick={() => {
                    // Navigate to create project tab logic
                  }}
                >
                  Create Your First Project
                </Button>
              </Box>
            ) : (
              <Grid container spacing={3}>
                {myProjects.map((project) => (
                  <Grid item xs={12} key={project.$id}>
                    <motion.div variants={itemVariants}>
                      <MotionCard
                        whileHover={{ 
                          y: -5, 
                          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                          transition: { duration: 0.2 }
                        }}
                        sx={{ 
                          borderRadius: 3,
                          overflow: 'hidden',
                          position: 'relative',
                          border: `1px solid ${theme.palette.divider}`,
                          '&:hover': {
                            borderColor: theme.palette.secondary.main,
                          }
                        }}
                      >
                        <Box 
                          sx={{ 
                            height: 8, 
                            width: '100%', 
                            bgcolor: theme.palette.secondary.main,
                            position: 'absolute',
                            top: 0,
                            left: 0
                          }} 
                        />
                        
                        <CardContent sx={{ pt: 3 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                            <Stack direction="row" spacing={1}>
                              <Chip 
                                label="Project" 
                                sx={{ 
                                  bgcolor: `${theme.palette.secondary.main}15`,
                                  color: theme.palette.secondary.main,
                                  fontWeight: 'bold'
                                }} 
                              />
                              
                              <Chip 
                                icon={getStatusChipIcon(project.status || 'open')}
                                label={project.status || 'Open'} 
                                sx={{ 
                                  bgcolor: `${getStatusColor(project.status || 'open')}15`,
                                  color: getStatusColor(project.status || 'open'),
                                  fontWeight: 'bold'
                                }} 
                              />
                            </Stack>
                            
                            <IconButton
                              aria-label="more options"
                              onClick={(e) => handleMenuOpen(e, project.$id)}
                              size="small"
                            >
                              <MoreVertIcon />
                            </IconButton>
                          </Box>
                          
                          <Typography
                            variant="h6"
                            component="h2"
                            sx={{
                              mb: 1,
                              fontWeight: 'bold',
                            }}
                          >
                            {project.title}
                          </Typography>
                          
                          <Box sx={{ display: 'flex', gap: 3, mb: 2, color: 'text.secondary' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <CalendarTodayIcon fontSize="small" sx={{ mr: 0.5 }} />
                              <Typography variant="body2">
                                Created: {formatDate(project.$createdAt)}
                              </Typography>
                            </Box>
                          </Box>
                          
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mb: 2 }}
                          >
                            {project.description}
                          </Typography>
                          
                          {project.skills && project.skills.length > 0 && (
                            <Box sx={{ mb: 3, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                              {project.skills.map((skill: string, index: number) => (
                                <Chip
                                  key={index}
                                  label={skill}
                                  size="small"
                                  sx={{
                                    bgcolor: theme.palette.grey[100],
                                    color: theme.palette.text.primary,
                                  }}
                                />
                              ))}
                            </Box>
                          )}
                          
                          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                            <Button
                              variant="outlined"
                              color="secondary"
                              startIcon={<EditIcon />}
                              sx={{ borderRadius: 2 }}
                            >
                              Edit
                            </Button>
                            
                            <Button
                              component={Link}
                              href={`/projects/${project.$id}`}
                              variant="contained"
                              color="secondary"
                              endIcon={<ArrowForwardIcon />}
                              sx={{ 
                                borderRadius: 2,
                                textTransform: 'none',
                                fontWeight: 'bold',
                                boxShadow: `0 4px 10px ${theme.palette.secondary.main}40`,
                                '&:hover': {
                                  boxShadow: `0 6px 15px ${theme.palette.secondary.main}60`,
                                }
                              }}
                            >
                              View Details
                            </Button>
                          </Box>
                        </CardContent>
                      </MotionCard>
                    </motion.div>
                  </Grid>
                ))}
              </Grid>
            )}
          </motion.div>
        )}
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            borderRadius: 2,
            minWidth: 180
          }
        }}
      >
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          Edit
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <ListItemIcon sx={{ color: 'error.main' }}>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          Delete
        </MenuItem>
      </Menu>
    </Box>
  );
}
