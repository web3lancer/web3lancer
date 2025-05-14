import React, { useState, useEffect } from "react";
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Button, 
  Chip, 
  Avatar,
  Divider,
  IconButton,
  TextField,
  InputAdornment,
  ToggleButtonGroup,
  ToggleButton,
  useTheme,
  Paper,
  CircularProgress
} from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import PaidIcon from '@mui/icons-material/Paid';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface BrowseProjectsTabProps {
  jobs: any[];
  projects: any[];
  loading: boolean;
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

export default function BrowseProjectsTab({ jobs, projects, loading }: BrowseProjectsTabProps) {
  const theme = useTheme();
  const [filter, setFilter] = useState('all');
  const [view, setView] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredItems, setFilteredItems] = useState([...jobs, ...projects]);
  const [bookmarkedItems, setBookmarkedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Filter items based on current filter and search query
    let filtered;
    
    if (filter === 'all') {
      filtered = [...jobs, ...projects];
    } else if (filter === 'jobs') {
      filtered = [...jobs];
    } else {
      filtered = [...projects];
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(query) || 
        item.description.toLowerCase().includes(query) ||
        (item.skills && item.skills.some((skill: string) => skill.toLowerCase().includes(query)))
      );
    }
    
    setFilteredItems(filtered);
  }, [jobs, projects, filter, searchQuery]);

  const toggleBookmark = (id: string) => {
    const updatedBookmarks = new Set(bookmarkedItems);
    if (updatedBookmarks.has(id)) {
      updatedBookmarks.delete(id);
    } else {
      updatedBookmarks.add(id);
    }
    setBookmarkedItems(updatedBookmarks);
  };

  const handleFilterChange = (event: React.MouseEvent<HTMLElement>, newFilter: string) => {
    if (newFilter !== null) {
      setFilter(newFilter);
    }
  };

  const handleViewChange = (event: React.MouseEvent<HTMLElement>, newView: string) => {
    if (newView !== null) {
      setView(newView);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Search and filter section */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          mb: 3, 
          borderRadius: 3,
          background: theme => `linear-gradient(145deg, ${theme.palette.background.paper}, ${theme.palette.grey[50]})`,
          border: `1px solid ${theme.palette.divider}`,
          boxShadow: theme => `0 4px 20px ${theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.1)'}`
        }}
      >
        <Grid container spacing={3} alignItems="center">
          <Grid xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search jobs, projects, skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="primary" />
                  </InputAdornment>
                ),
                sx: { 
                  borderRadius: 3,
                  bgcolor: theme.palette.background.paper,
                  '&:hover': {
                    boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.2)'
                  },
                  transition: 'box-shadow 0.3s ease'
                }
              }}
              variant="outlined"
            />
          </Grid>
          <Grid xs={12} md={6}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: { xs: 'flex-start', md: 'flex-end' },
              flexWrap: 'wrap',
              gap: 2
            }}>
              <ToggleButtonGroup
                value={filter}
                exclusive
                onChange={handleFilterChange}
                aria-label="content filter"
                size="small"
                sx={{ 
                  bgcolor: theme.palette.background.paper,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  borderRadius: 2,
                  '& .MuiToggleButton-root': {
                    borderRadius: 0,
                    px: 2,
                    py: 1,
                    '&.Mui-selected': {
                      bgcolor: theme.palette.primary.main,
                      color: 'white',
                      '&:hover': {
                        bgcolor: theme.palette.primary.dark,
                      }
                    }
                  },
                  '& .MuiToggleButton-root:first-of-type': {
                    borderTopLeftRadius: '8px',
                    borderBottomLeftRadius: '8px'
                  },
                  '& .MuiToggleButton-root:last-of-type': {
                    borderTopRightRadius: '8px',
                    borderBottomRightRadius: '8px'
                  }
                }}
              >
                <ToggleButton value="all">All</ToggleButton>
                <ToggleButton value="jobs">Jobs</ToggleButton>
                <ToggleButton value="projects">Projects</ToggleButton>
              </ToggleButtonGroup>
              
              <ToggleButtonGroup
                value={view}
                exclusive
                onChange={handleViewChange}
                aria-label="view mode"
                size="small"
                sx={{ 
                  bgcolor: theme.palette.background.paper,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  borderRadius: 2,
                  '& .MuiToggleButton-root': {
                    borderRadius: 0,
                    px: 2,
                    '&.Mui-selected': {
                      bgcolor: theme.palette.primary.main,
                      color: 'white',
                      '&:hover': {
                        bgcolor: theme.palette.primary.dark,
                      }
                    }
                  },
                  '& .MuiToggleButton-root:first-of-type': {
                    borderTopLeftRadius: '8px',
                    borderBottomLeftRadius: '8px'
                  },
                  '& .MuiToggleButton-root:last-of-type': {
                    borderTopRightRadius: '8px',
                    borderBottomRightRadius: '8px'
                  }
                }}
              >
                <ToggleButton value="grid"><ViewModuleIcon /></ToggleButton>
                <ToggleButton value="list"><ViewListIcon /></ToggleButton>
              </ToggleButtonGroup>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {filteredItems.length === 0 ? (
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
            No matches found
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Try adjusting your search or filter to find what you're looking for.
          </Typography>
        </Box>
      ) : (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >              <Grid container spacing={3}>
                {filteredItems.map((item) => {
                  const isJob = 'budget' in item; // Simple way to differentiate jobs from projects
                  const itemColor = isJob ? theme.palette.primary.main : theme.palette.secondary.main;
                  
                  return (
                    <Grid key={item.$id} md={view === 'grid' ? 6 : 12} xs={12}>
                      <motion.div variants={itemVariants}>
                    <MotionCard
                      whileHover={{ 
                        y: -5, 
                        boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                        transition: { duration: 0.2 }
                      }}
                      sx={{ 
                        height: '100%',
                        borderRadius: 3,
                        overflow: 'hidden',
                        position: 'relative',
                        transition: 'all 0.3s ease',
                        border: `1px solid ${theme.palette.divider}`,
                        '&:hover': {
                          borderColor: itemColor,
                        }
                      }}
                    >
                      <Box 
                        sx={{ 
                          height: 8, 
                          width: '100%', 
                          bgcolor: itemColor,
                          position: 'absolute',
                          top: 0,
                          left: 0
                        }} 
                      />
                      
                      <CardContent sx={{ pt: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                          <Chip 
                            label={isJob ? 'Job' : 'Project'} 
                            sx={{ 
                              bgcolor: `${itemColor}15`,
                              color: itemColor,
                              fontWeight: 'bold'
                            }} 
                          />
                          
                          <IconButton 
                            onClick={() => toggleBookmark(item.$id)}
                            size="small"
                            sx={{ 
                              color: bookmarkedItems.has(item.$id) ? 'warning.main' : 'text.secondary',
                              '&:hover': { color: 'warning.main' }
                            }}
                          >
                            {bookmarkedItems.has(item.$id) ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                          </IconButton>
                        </Box>
                        
                        <Typography
                          variant="h6"
                          component="h2"
                          sx={{
                            mb: 1,
                            fontWeight: 'bold',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                          }}
                        >
                          {item.title}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', gap: 3, mb: 2, color: 'text.secondary' }}>
                          {item.budget && (
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <PaidIcon fontSize="small" sx={{ mr: 0.5, color: 'success.main' }} />
                              <Typography variant="body2" fontWeight="medium">
                                {item.budget}
                              </Typography>
                            </Box>
                          )}
                          
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <CalendarTodayIcon fontSize="small" sx={{ mr: 0.5 }} />
                            <Typography variant="body2">
                              {formatDate(item.$createdAt)}
                            </Typography>
                          </Box>
                        </Box>
                        
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            mb: 2,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical',
                          }}
                        >
                          {item.description}
                        </Typography>
                        
                        {item.skills && item.skills.length > 0 && (
                          <Box sx={{ mb: 3, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {item.skills.slice(0, 4).map((skill: string, index: number) => (
                              <Chip
                                key={index}
                                label={skill}
                                size="small"
                                sx={{
                                  bgcolor: theme.palette.grey[100],
                                  color: theme.palette.text.primary,
                                  fontWeight: 500,
                                  '&:hover': {
                                    bgcolor: theme.palette.grey[200],
                                  },
                                }}
                              />
                            ))}
                            {item.skills.length > 4 && (
                              <Chip
                                label={`+${item.skills.length - 4}`}
                                size="small"
                                sx={{
                                  bgcolor: theme.palette.grey[100],
                                  color: theme.palette.text.primary,
                                }}
                              />
                            )}
                          </Box>
                        )}
                        
                        <Button
                          component={Link}
                          href={`/${isJob ? 'jobs' : 'projects'}/${item.$id}`}
                          variant="contained"
                          color={isJob ? 'primary' : 'secondary'}
                          endIcon={<ArrowForwardIcon />}
                          sx={{ 
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 'bold',
                            boxShadow: `0 4px 10px ${itemColor}40`,
                            '&:hover': {
                              boxShadow: `0 6px 15px ${itemColor}60`,
                            }
                          }}
                        >
                          {isJob ? 'Apply Now' : 'View Project'}
                        </Button>
                      </CardContent>
                    </MotionCard>
                  </motion.div>
                </Grid>
              );
            })}
          </Grid>
        </motion.div>
      )}
    </Box>
  );
}
