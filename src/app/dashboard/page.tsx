"use client";
import { 
  Box, 
  Grid, 
  Typography, 
  useTheme, 
  Paper, 
  Avatar, 
  LinearProgress, 
  Divider, 
  Card, 
  CardContent,
  Button,
  Chip,
  IconButton,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Tab,
  Tabs,
  useMediaQuery,
  Tooltip
} from '@mui/material';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState, useRef } from 'react';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { ProjectProgress } from '@/components/dashboard/ProjectProgress';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import WorkOutlineOutlinedIcon from '@mui/icons-material/WorkOutlineOutlined';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import StarBorderOutlinedIcon from '@mui/icons-material/StarBorderOutlined';
import FilterListIcon from '@mui/icons-material/FilterList';
import SearchIcon from '@mui/icons-material/Search';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import Link from 'next/link';
import { databases } from '@/utils/api';
import { APPWRITE_CONFIG } from '@/lib/env';

// Animation variants for staggered children animations
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const cardHoverVariants = {
  hover: { 
    y: -8,
    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
    transition: { duration: 0.3 }
  }
};

interface Job {
  $id: string;
  title: string;
  description: string;
  budget?: string;
  skills?: string[];
  category?: string;
  status?: string;
  createdAt: string;
  deadline?: string;
  userId?: string;
}

interface Project {
  $id: string;
  title: string;
  description: string;
  status?: string;
  budget?: string;
  category?: string;
  technologies?: string[];
  createdAt: string;
  userId?: string;
}

interface QuickPickItem {
  id: string;
  type: 'job' | 'project' | 'profile' | 'trending' | 'recommendation';
  title: string;
  description: string;
  icon: React.ElementType;
  action: string;
  link: string;
  color: string;
  badge?: string;
}

// Skill match score types
interface SkillMatch {
  job: Job;
  matchScore: number;
}

export default function DashboardPage() {
  const theme = useTheme();
  const { user } = useAuth();
  const [userStats, setUserStats] = useState<any[]>([]);
  const [userActivities, setUserActivities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [sortOption, setSortOption] = useState('newest');
  const [activeTab, setActiveTab] = useState(0);
  const [quickPicks, setQuickPicks] = useState<QuickPickItem[]>([]);
  const [recommendedJobs, setRecommendedJobs] = useState<SkillMatch[]>([]);
  const [userSkills, setUserSkills] = useState<string[]>(['React', 'Solidity', 'Web3', 'JavaScript', 'TypeScript']);
  const carouselRef = useRef<HTMLDivElement>(null);
  const recommendationsRef = useRef<HTMLDivElement>(null);
  
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    if (user) {
      const timer = setTimeout(() => {
        fetchUserStats(); 
        fetchUserActivities();
        fetchJobs();
        fetchProjects();
        generateQuickPicks();
        findMatchingJobs();
        setIsLoading(false);
      }, 500);
      
      return () => clearTimeout(timer);
    } else {
      setIsLoading(false); 
    }
  }, [user]);

  const fetchUserStats = async () => {
    console.log("Fetching user stats from Appwrite..."); 
    try {
      setUserStats([
        { title: 'Total Earnings', value: '$12,350', icon: AccountBalanceWalletOutlinedIcon, increase: '+15%', color: theme.palette.success.main },
        { title: 'Active Projects', value: '8', icon: WorkOutlineOutlinedIcon, increase: '+5%', color: theme.palette.info.main },
        { title: 'Completion Rate', value: '94%', icon: AssessmentOutlinedIcon, increase: '+2%', color: theme.palette.warning.main },
        { title: 'Client Rating', value: '4.9/5', icon: StarBorderOutlinedIcon, increase: '+0.3', color: theme.palette.secondary.main },
      ]);
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  const fetchUserActivities = async () => {
    console.log("Fetching user activities from Appwrite...");
    try {
      setUserActivities([
        { id: 'act1', type: 'Project Completed', description: 'Blockchain Integration', time: '2 hours ago', icon: 'CheckCircleOutline' },
        { id: 'act2', type: 'New Project Assigned', description: 'Smart Contract Development', time: '5 hours ago', icon: 'AssignmentTurnedInOutlined' },
        { id: 'act3', type: 'Payment Received', description: '$1,500 for DApp Development', time: '1 day ago', icon: 'PaidOutlined' },
        { id: 'act4', type: 'Proposal Accepted', description: 'NFT Marketplace Design', time: '2 days ago', icon: 'ThumbUpAltOutlined' },
      ]);
    } catch (error) {
      console.error('Error fetching user activities:', error);
    }
  };
  
  const fetchJobs = async () => {
    try {
      const response = await databases.listDocuments(
        APPWRITE_CONFIG.DATABASES.JOBS || '67af3ffe0011106c4575',
        APPWRITE_CONFIG.COLLECTIONS.JOBS || '67b8f57b0018fe4fcde7'
      );
      setJobs(response.documents as unknown as Job[]);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  };
  
  const fetchProjects = async () => {
    try {
      const response = await databases.listDocuments(
        APPWRITE_CONFIG.DATABASES.PROJECTS || '67af3ffe0011106c4575',
        APPWRITE_CONFIG.COLLECTIONS.PROJECTS || '67b8f57b0018fe4fcde7'
      );
      setProjects(response.documents as unknown as Project[]);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };
  
  const generateQuickPicks = () => {
    const picks: QuickPickItem[] = [
      {
        id: 'qp1',
        type: 'profile',
        title: 'Complete Your Profile',
        description: 'Add your skills and experience to get more job recommendations',
        icon: PersonOutlineIcon,
        action: 'Update',
        link: '/profile/edit',
        color: theme.palette.primary.main
      },
      {
        id: 'qp2',
        type: 'trending',
        title: 'Trending: Web3 Development',
        description: 'Web3 developers are in high demand',
        icon: TrendingUpIcon,
        action: 'Explore',
        link: '/projects?category=web3',
        color: theme.palette.secondary.main
      },
      {
        id: 'qp3',
        type: 'job',
        title: 'Featured Job: Smart Contract Developer',
        description: 'Build DeFi protocols with competitive pay',
        icon: WorkOutlineOutlinedIcon,
        action: 'Apply',
        link: '/jobs/featured',
        color: theme.palette.info.main
      },
      {
        id: 'qp4',
        type: 'project',
        title: 'New Project Opportunity',
        description: 'NFT Marketplace needs frontend developers',
        icon: AssessmentOutlinedIcon,
        action: 'View',
        link: '/projects/nft',
        color: theme.palette.success.main
      },
      {
        id: 'qp5',
        type: 'trending',
        title: 'Earn with Bounties',
        description: 'Quick tasks with immediate payouts',
        icon: AccountBalanceWalletOutlinedIcon,
        action: 'Browse',
        link: '/bounties',
        color: theme.palette.warning.main
      },
      {
        id: 'qp6',
        type: 'recommendation',
        title: 'Top Match: Smart Contract Audit',
        description: 'Your skills are a perfect match for this high-paying role',
        icon: StarBorderOutlinedIcon,
        action: 'View Job',
        link: '/jobs/recommended',
        color: theme.palette.success.main,
        badge: '95% Match'
      },
    ];
    
    setQuickPicks(picks);
  };

  // Find jobs that match user skills
  const findMatchingJobs = () => {
    // In a real app, these would come from the user profile
    const userSkills = ['React', 'Solidity', 'Web3', 'JavaScript', 'TypeScript'];
    
    // Calculate match scores for each job
    const jobMatches = jobs.map(job => {
      let matchScore = 0;
      
      if (job.skills && job.skills.length > 0) {
        // Count how many skills match
        const matchedSkills = job.skills.filter(skill => 
          userSkills.some(userSkill => 
            userSkill.toLowerCase() === skill.toLowerCase()
          )
        );
        
        matchScore = matchedSkills.length;
        
        // Convert to percentage
        matchScore = job.skills.length > 0 ? (matchScore / job.skills.length) * 100 : 0;
      }
      
      return { job, matchScore };
    });
    
    // Sort by match score (highest first)
    jobMatches.sort((a, b) => b.matchScore - a.matchScore);
    
    // Add top match to quickPicks
    if (jobMatches.length > 0 && jobMatches[0].matchScore > 50) {
      const topMatch = jobMatches[0];
      
      const recommendationPick: QuickPickItem = {
        id: 'qp-rec-1',
        type: 'recommendation',
        title: `${Math.round(topMatch.matchScore)}% Match: ${topMatch.job.title}`,
        description: topMatch.job.description.substring(0, 80) + '...',
        icon: StarBorderOutlinedIcon,
        action: 'View Job',
        link: `/jobs/${topMatch.job.$id}`,
        color: theme.palette.success.main,
        badge: `${Math.round(topMatch.matchScore)}% Match`
      };
      
      setQuickPicks(prev => [recommendationPick, ...prev.filter(item => item.type !== 'recommendation')]);
    }
  };

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = 300;
      const currentScroll = carouselRef.current.scrollLeft;
      carouselRef.current.scrollTo({
        left: direction === 'left' ? currentScroll - scrollAmount : currentScroll + scrollAmount,
        behavior: 'smooth'
      });
    }
  };
  
  const handleSortChange = (event: any) => {
    setSortOption(event.target.value);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };
  
  const sortedJobs = () => {
    let sorted = [...jobs];
    
    switch(sortOption) {
      case 'newest':
        sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'oldest':
        sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'budget-high':
        sorted.sort((a, b) => {
          const budgetA = a.budget ? parseFloat(a.budget.replace(/[^0-9.-]+/g, '')) : 0;
          const budgetB = b.budget ? parseFloat(b.budget.replace(/[^0-9.-]+/g, '')) : 0;
          return budgetB - budgetA;
        });
        break;
      case 'budget-low':
        sorted.sort((a, b) => {
          const budgetA = a.budget ? parseFloat(a.budget.replace(/[^0-9.-]+/g, '')) : 0;
          const budgetB = b.budget ? parseFloat(b.budget.replace(/[^0-9.-]+/g, '')) : 0;
          return budgetA - budgetB;
        });
        break;
      default:
        break;
    }
    
    return sorted;
  };
  
  const sortedProjects = () => {
    let sorted = [...projects];
    
    switch(sortOption) {
      case 'newest':
        sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'oldest':
        sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'budget-high':
        sorted.sort((a, b) => {
          const budgetA = a.budget ? parseFloat(a.budget.replace(/[^0-9.-]+/g, '')) : 0;
          const budgetB = b.budget ? parseFloat(b.budget.replace(/[^0-9.-]+/g, '')) : 0;
          return budgetB - budgetA;
        });
        break;
      case 'budget-low':
        sorted.sort((a, b) => {
          const budgetA = a.budget ? parseFloat(a.budget.replace(/[^0-9.-]+/g, '')) : 0;
          const budgetB = b.budget ? parseFloat(b.budget.replace(/[^0-9.-]+/g, '')) : 0;
          return budgetA - budgetB;
        });
        break;
      default:
        break;
    }
    
    return sorted;
  };

  if (isLoading) {
    return (
      <Box 
        sx={{ 
          p: 3, 
          minHeight: 'calc(100vh - 64px)', 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center', 
          alignItems: 'center',
          gap: 2
        }}
      >
        <Typography variant="h6" sx={{ mb: 2 }}>Loading your dashboard...</Typography>
        <Box sx={{ width: '60%', maxWidth: 500 }}>
          <LinearProgress color="primary" />
        </Box>
      </Box>
    );
  }

  return (
    <Box 
      sx={{ 
        p: { xs: 2, md: 3 }, 
        minHeight: 'calc(100vh - 64px)', 
        background: theme.palette.background.default,
        overflow: 'hidden'
      }}
    >
      <motion.div
        initial="hidden"
        animate="show"
        variants={containerVariants}
      >
        {/* Header with welcome message and stats */}
        <motion.div variants={itemVariants}>
          <Paper 
            elevation={0}
            sx={{ 
              p: { xs: 2, md: 3 }, 
              mb: 3, 
              borderRadius: 3,
              background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
              color: 'white',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <Box 
              sx={{
                position: 'absolute',
                top: 0,
                right: 0,
                bottom: 0,
                width: { xs: '100%', md: '40%' },
                background: 'radial-gradient(circle at 70% 50%, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)',
                display: { xs: 'none', md: 'block' }
              }}
            />
            
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={7} component="div">
                <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 2, md: 3 } }}>
                  <Avatar 
                    src={user?.photoURL || "/assets/default-avatar.png"} 
                    sx={{ 
                      width: { xs: 56, md: 64 }, 
                      height: { xs: 56, md: 64 }, 
                      mr: 2, 
                      border: '3px solid white', 
                      boxShadow: theme.shadows[3] 
                    }}
                  />
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                      Welcome back, {user?.name || 'Developer'}!
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.9 }}>
                      Here's your dashboard overview.
                    </Typography>
                  </Box>
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={6} sm={3} component="div">
                      <Box>
                        <Typography variant="body2" sx={{ opacity: 0.8 }}>
                          Jobs Applied
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          24
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} sm={3} component="div">
                      <Box>
                        <Typography variant="body2" sx={{ opacity: 0.8 }}>
                          Interviews
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          6
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} sm={3} component="div">
                      <Box>
                        <Typography variant="body2" sx={{ opacity: 0.8 }}>
                          Projects
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          12
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} sm={3} component="div">
                      <Box>
                        <Typography variant="body2" sx={{ opacity: 0.8 }}>
                          Proposals
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          8
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={5} sx={{ display: { xs: 'none', md: 'block' } }} component="div">
                <Box sx={{ position: 'relative', textAlign: 'right' }}>
                  <Box sx={{ position: 'relative', display: 'inline-block' }}>
                    <Box 
                      component="img"
                      src="/assets/dashboard-illustration.svg"
                      alt="Dashboard"
                      sx={{ 
                        maxWidth: '100%', 
                        height: 'auto',
                        maxHeight: 180
                      }}
                    />
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </motion.div>

        {/* Quick Picks Section */}
        <motion.div variants={itemVariants}>
          <Box sx={{ mb: 4 }}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              mb: 2 
            }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Quick Picks
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton 
                  size="small" 
                  onClick={() => scrollCarousel('left')}
                  sx={{ 
                    bgcolor: 'background.paper', 
                    boxShadow: 1,
                    '&:hover': { bgcolor: 'grey.100' } 
                  }}
                >
                  <ArrowBackIcon fontSize="small" />
                </IconButton>
                <IconButton 
                  size="small" 
                  onClick={() => scrollCarousel('right')}
                  sx={{ 
                    bgcolor: 'background.paper', 
                    boxShadow: 1,
                    '&:hover': { bgcolor: 'grey.100' } 
                  }}
                >
                  <ArrowForwardIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>
            
            <Box 
              ref={carouselRef}
              sx={{ 
                display: 'flex', 
                overflowX: 'auto',
                py: 1,
                px: 0.5,
                scrollbarWidth: 'none',
                '&::-webkit-scrollbar': {
                  display: 'none'
                },
                gap: 2
              }}
            >
              {quickPicks.map((pick) => (
                <motion.div
                  key={pick.id}
                  variants={cardHoverVariants}
                  whileHover="hover"
                >
                  <Card
                    component={Link}
                    href={pick.link}
                    sx={{ 
                      minWidth: { xs: 260, sm: 300 },
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                      textDecoration: 'none',
                      display: 'flex',
                      flexDirection: 'column',
                      height: '100%',
                    }}
                  >
                    <CardContent sx={{ p: 2.5, flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', mb: 1.5, justifyContent: 'space-between' }}>
                        <Box 
                          sx={{ 
                            width: 40, 
                            height: 40, 
                            borderRadius: '50%', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            bgcolor: `${pick.color}10`,
                            color: pick.color
                          }}
                        >
                          <pick.icon />
                        </Box>
                        <Chip 
                          label={pick.type.charAt(0).toUpperCase() + pick.type.slice(1)} 
                          size="small"
                          sx={{ 
                            bgcolor: `${pick.color}10`,
                            color: pick.color,
                            fontWeight: 500
                          }}
                        />
                      </Box>
                      
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                        {pick.title}
                      </Typography>
                      
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {pick.description}
                      </Typography>
                      
                      <Button 
                        endIcon={<KeyboardArrowRightIcon />}
                        sx={{ 
                          color: pick.color,
                          fontWeight: 500,
                          '&:hover': {
                            backgroundColor: `${pick.color}10`
                          }
                        }}
                      >
                        {pick.action}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </Box>
          </Box>
        </motion.div>

        {/* Main Dashboard Stats */}
        <motion.div variants={itemVariants}>
          <DashboardStats stats={userStats} />
        </motion.div>

        {/* Job Recommendations Section */}
        <motion.div variants={itemVariants}>
          <Paper 
            elevation={0}
            sx={{ 
              p: { xs: 2, md: 3 }, 
              borderRadius: 3,
              mt: 4,
              mb: 4,
              border: `1px solid ${theme.palette.divider}`,
              background: `linear-gradient(135deg, ${theme.palette.primary.dark}10, ${theme.palette.primary.main}10)`,
            }}
          >
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Recommended For You
              </Typography>
              <Button 
                variant="text" 
                endIcon={<ArrowForwardIcon />}
                component={Link}
                href="/jobs/recommended"
              >
                View All
              </Button>
            </Box>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Personalized job recommendations based on your skills and profile
            </Typography>
            
            <Grid container spacing={2}>
              {jobs.slice(0, 3).map((job) => (
                <Grid item xs={12} sm={4} key={job.$id} component="div">
                  <motion.div variants={cardHoverVariants} whileHover="hover">
                    <Card
                      sx={{ 
                        height: '100%',
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: 'divider',
                        position: 'relative',
                        overflow: 'visible'
                      }}
                    >
                      <Box
                        sx={{
                          position: 'absolute',
                          top: -10,
                          right: 16,
                          bgcolor: 'success.main',
                          color: 'white',
                          px: 1.5,
                          py: 0.5,
                          borderRadius: 1,
                          fontSize: '0.75rem',
                          fontWeight: 'bold',
                          boxShadow: 1,
                          zIndex: 1
                        }}
                      >
                        {Math.floor(Math.random() * 30) + 70}% Match
                      </Box>
                      <CardContent sx={{ p: 2.5 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, lineHeight: 1.3 }}>
                          {job.title}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            mb: 2,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}
                        >
                          {job.description}
                        </Typography>
                        
                        {job.budget && (
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                            <Typography variant="body2" fontWeight={600} color="text.secondary" sx={{ mr: 1 }}>
                              Budget:
                            </Typography>
                            <Typography variant="body1" fontWeight={600} color="primary.main">
                              {job.budget}
                            </Typography>
                          </Box>
                        )}
                        
                        {job.skills && job.skills.length > 0 && (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                            {job.skills.slice(0, 3).map((skill, idx) => (
                              <Chip
                                key={idx}
                                label={skill}
                                size="small"
                                sx={{
                                  bgcolor: 'background.default',
                                  fontSize: '0.7rem'
                                }}
                              />
                            ))}
                          </Box>
                        )}
                        
                        <Button
                          variant="outlined"
                          fullWidth
                          component={Link}
                          href={`/jobs/${job.$id}`}
                          endIcon={<ArrowForwardIcon />}
                        >
                          View Details
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </motion.div>

        {/* Projects & Jobs Section */}
        <motion.div variants={itemVariants}>
          <Paper 
            elevation={0}
            sx={{ 
              p: { xs: 2, md: 3 },
              borderRadius: 3,
              mt: 4,
              border: `1px solid ${theme.palette.divider}`
            }}
          >
            <Box sx={{ mb: 2 }}>
              <Tabs 
                value={activeTab} 
                onChange={handleTabChange}
                sx={{
                  '.MuiTabs-indicator': {
                    height: 3,
                    borderRadius: 1.5
                  }
                }}
              >
                <Tab label="Jobs" />
                <Tab label="Projects" />
              </Tabs>
            </Box>
            
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              mb: 2,
              flexDirection: { xs: 'column', sm: 'row' },
              gap: { xs: 2, sm: 0 }
            }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {activeTab === 0 ? 'Available Jobs' : 'Open Projects'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {activeTab === 0 
                    ? `${jobs.length} jobs matching your skills and interests` 
                    : `${projects.length} projects you can contribute to`}
                </Typography>
              </Box>
              
              <FormControl 
                size="small"
                sx={{ 
                  minWidth: 200,
                  width: { xs: '100%', sm: 'auto' }
                }}
              >
                <InputLabel id="sort-select-label">Sort By</InputLabel>
                <Select
                  labelId="sort-select-label"
                  id="sort-select"
                  value={sortOption}
                  onChange={handleSortChange}
                  label="Sort By"
                  startAdornment={<FilterListIcon fontSize="small" sx={{ mr: 1, opacity: 0.7 }} />}
                >
                  <MenuItem value="newest">Newest First</MenuItem>
                  <MenuItem value="oldest">Oldest First</MenuItem>
                  <MenuItem value="budget-high">Budget: High to Low</MenuItem>
                  <MenuItem value="budget-low">Budget: Low to High</MenuItem>
                </Select>
              </FormControl>
            </Box>
            
            <Divider sx={{ mb: 2 }} />
            
            {/* Jobs Tab */}
            {activeTab === 0 && (
              <Box>
                {sortedJobs().length > 0 ? (
                  <Grid container spacing={2}>
                    {sortedJobs().slice(0, 6).map((job) => (
                      <Grid item xs={12} sm={6} md={4} key={job.$id} component="div">
                        <motion.div variants={cardHoverVariants} whileHover="hover">
                          <Card
                            sx={{ 
                              height: '100%',
                              borderRadius: 2,
                              border: '1px solid',
                              borderColor: 'divider'
                            }}
                          >
                            <CardContent sx={{ p: 2.5, height: '100%', display: 'flex', flexDirection: 'column' }}>
                              <Box sx={{ mb: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <Chip 
                                  label={job.category || "Job"} 
                                  size="small"
                                  sx={{ 
                                    bgcolor: `${theme.palette.primary.main}15`,
                                    color: theme.palette.primary.main,
                                    fontWeight: 500
                                  }}
                                />
                                <Chip 
                                  label={job.status || "Open"} 
                                  size="small"
                                  sx={{ 
                                    bgcolor: job.status === 'Closed' 
                                      ? `${theme.palette.error.main}15` 
                                      : `${theme.palette.success.main}15`,
                                    color: job.status === 'Closed' 
                                      ? theme.palette.error.main 
                                      : theme.palette.success.main,
                                    fontWeight: 500
                                  }}
                                />
                              </Box>
                              
                              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, lineHeight: 1.3 }}>
                                {job.title}
                              </Typography>
                              
                              <Typography 
                                variant="body2" 
                                color="text.secondary"
                                sx={{ 
                                  mb: 2,
                                  display: '-webkit-box',
                                  WebkitLineClamp: 3,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden'
                                }}
                              >
                                {job.description}
                              </Typography>
                              
                              {job.budget && (
                                <Box sx={{ mt: 'auto', display: 'flex', alignItems: 'center', mb: 1.5 }}>
                                  <Typography variant="body2" fontWeight={600} color="text.secondary" sx={{ mr: 1 }}>
                                    Budget:
                                  </Typography>
                                  <Typography variant="body1" fontWeight={600} color="primary.main">
                                    {job.budget}
                                  </Typography>
                                </Box>
                              )}
                              
                              {job.skills && job.skills.length > 0 && (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 2 }}>
                                  {job.skills.slice(0, 3).map((skill, idx) => (
                                    <Chip 
                                      key={idx} 
                                      label={skill} 
                                      size="small"
                                      sx={{ 
                                        bgcolor: 'background.default',
                                        fontSize: '0.7rem'
                                      }}
                                    />
                                  ))}
                                  {job.skills.length > 3 && (
                                    <Chip 
                                      label={`+${job.skills.length - 3}`} 
                                      size="small"
                                      sx={{ 
                                        bgcolor: 'background.default',
                                        fontSize: '0.7rem'
                                      }}
                                    />
                                  )}
                                </Box>
                              )}
                              
                              <Button
                                variant="outlined"
                                fullWidth
                                component={Link}
                                href={`/jobs/${job.$id}`}
                                endIcon={<ArrowForwardIcon />}
                                sx={{ mt: 'auto' }}
                              >
                                View Details
                              </Button>
                            </CardContent>
                          </Card>
                        </motion.div>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      No jobs available at the moment.
                    </Typography>
                  </Box>
                )}
                
                {jobs.length > 6 && (
                  <Box sx={{ textAlign: 'center', mt: 3 }}>
                    <Button 
                      variant="outlined"
                      component={Link}
                      href="/jobs"
                      endIcon={<ArrowForwardIcon />}
                    >
                      View All Jobs
                    </Button>
                  </Box>
                )}
              </Box>
            )}
            
            {/* Projects Tab */}
            {activeTab === 1 && (
              <Box>
                {sortedProjects().length > 0 ? (
                  <Grid container spacing={2}>
                    {sortedProjects().slice(0, 6).map((project) => (
                      <Grid item xs={12} sm={6} md={4} key={project.$id} component="div">
                        <motion.div variants={cardHoverVariants} whileHover="hover">
                          <Card
                            sx={{ 
                              height: '100%',
                              borderRadius: 2,
                              border: '1px solid',
                              borderColor: 'divider'
                            }}
                          >
                            <CardContent sx={{ p: 2.5, height: '100%', display: 'flex', flexDirection: 'column' }}>
                              <Box sx={{ mb: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <Chip 
                                  label={project.category || "Project"} 
                                  size="small"
                                  sx={{ 
                                    bgcolor: `${theme.palette.secondary.main}15`,
                                    color: theme.palette.secondary.main,
                                    fontWeight: 500
                                  }}
                                />
                                <Chip 
                                  label={project.status || "Active"} 
                                  size="small"
                                  sx={{ 
                                    bgcolor: project.status === 'Completed' 
                                      ? `${theme.palette.info.main}15` 
                                      : `${theme.palette.success.main}15`,
                                    color: project.status === 'Completed' 
                                      ? theme.palette.info.main 
                                      : theme.palette.success.main,
                                    fontWeight: 500
                                  }}
                                />
                              </Box>
                              
                              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, lineHeight: 1.3 }}>
                                {project.title}
                              </Typography>
                              
                              <Typography 
                                variant="body2" 
                                color="text.secondary"
                                sx={{ 
                                  mb: 2,
                                  display: '-webkit-box',
                                  WebkitLineClamp: 3,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden'
                                }}
                              >
                                {project.description}
                              </Typography>
                              
                              {project.budget && (
                                <Box sx={{ mt: 'auto', display: 'flex', alignItems: 'center', mb: 1.5 }}>
                                  <Typography variant="body2" fontWeight={600} color="text.secondary" sx={{ mr: 1 }}>
                                    Budget:
                                  </Typography>
                                  <Typography variant="body1" fontWeight={600} color="secondary.main">
                                    {project.budget}
                                  </Typography>
                                </Box>
                              )}
                              
                              {project.technologies && project.technologies.length > 0 && (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 2 }}>
                                  {project.technologies.slice(0, 3).map((tech, idx) => (
                                    <Chip 
                                      key={idx} 
                                      label={tech} 
                                      size="small"
                                      sx={{ 
                                        bgcolor: 'background.default',
                                        fontSize: '0.7rem'
                                      }}
                                    />
                                  ))}
                                  {project.technologies.length > 3 && (
                                    <Chip 
                                      label={`+${project.technologies.length - 3}`} 
                                      size="small"
                                      sx={{ 
                                        bgcolor: 'background.default',
                                        fontSize: '0.7rem'
                                      }}
                                    />
                                  )}
                                </Box>
                              )}
                              
                              <Button
                                variant="outlined"
                                color="secondary"
                                fullWidth
                                component={Link}
                                href={`/projects/${project.$id}`}
                                endIcon={<ArrowForwardIcon />}
                                sx={{ mt: 'auto' }}
                              >
                                View Details
                              </Button>
                            </CardContent>
                          </Card>
                        </motion.div>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      No projects available at the moment.
                    </Typography>
                  </Box>
                )}
                
                {projects.length > 6 && (
                  <Box sx={{ textAlign: 'center', mt: 3 }}>
                    <Button 
                      variant="outlined"
                      color="secondary"
                      component={Link}
                      href="/projects"
                      endIcon={<ArrowForwardIcon />}
                    >
                      View All Projects
                    </Button>
                  </Box>
                )}
              </Box>
            )}
          </Paper>
        </motion.div>

        <Grid container spacing={{ xs: 2, md: 3 }} sx={{ mt: { xs: 2, md: 3 } }}>
          <Grid item xs={12} lg={8}>
            <motion.div variants={itemVariants}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: { xs: 2, md: 3 }, 
                  borderRadius: 3, 
                  border: `1px solid ${theme.palette.divider}`, 
                  background: theme.palette.background.paper,
                  height: '100%'
                }}
              >
                <RecentActivity activities={userActivities} />
              </Paper>
            </motion.div>
          </Grid>
          <Grid item xs={12} lg={4}>
            <motion.div variants={itemVariants}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: { xs: 2, md: 3 }, 
                  borderRadius: 3, 
                  border: `1px solid ${theme.palette.divider}`, 
                  background: theme.palette.background.paper,
                  height: '100%'
                }}
              >
                <ProjectProgress />
              </Paper>
            </motion.div>
          </Grid>
        </Grid>
      </motion.div>
    </Box>
  );
}