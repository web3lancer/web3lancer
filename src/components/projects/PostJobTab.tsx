import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Paper, 
  Chip,
  Divider,
  Alert,
  InputAdornment,
  Stack,
  Autocomplete,
  useTheme,
  alpha,
  Slide,
  CircularProgress
} from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import WorkIcon from '@mui/icons-material/Work';
import ScheduleIcon from '@mui/icons-material/Schedule';
import StarRateIcon from '@mui/icons-material/StarRate';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { motion } from 'framer-motion';
import { databases, ID } from "@/utils/api";
import { APPWRITE_CONFIG } from "@/lib/env";

// Skills data
const AVAILABLE_SKILLS = [
  'JavaScript', 'React', 'Angular', 'Vue.js', 'Node.js', 'TypeScript', 'Python', 
  'Java', 'C#', 'Ruby', 'PHP', 'Swift', 'Kotlin', 'Solidity', 'Rust', 'Blockchain',
  'Smart Contracts', 'Web3', 'DeFi', 'NFTs', 'DAO', 'Ethereum', 'Bitcoin', 'AWS',
  'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'CI/CD', 'DevOps', 'UI/UX Design'
];

// Project durations
const PROJECT_DURATIONS = [
  'Less than 1 week',
  '1-2 weeks',
  '2-4 weeks',
  '1-3 months',
  '3-6 months',
  '6+ months'
];

// Experience levels
const EXPERIENCE_LEVELS = [
  'Entry Level',
  'Intermediate',
  'Expert',
  'Specialist'
];

// Budget ranges
const BUDGET_RANGES = [
  'Less than $100',
  '$100 - $500',
  '$500 - $1,000',
  '$1,000 - $5,000',
  '$5,000 - $10,000',
  '$10,000+'
];

interface PostJobTabProps {
  user: any;
  onJobPosted: () => void;
  setActiveTab: (tab: number) => void;
}

const MotionPaper = motion(Paper);

export default function PostJobTab({ user, onJobPosted, setActiveTab }: PostJobTabProps) {
  const theme = useTheme();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    skills: [] as string[],
    duration: '',
    experienceLevel: '',
    budget: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name as string]: value,
    });
  };

  const handleSkillsChange = (_: any, newValue: string[]) => {
    setFormData({
      ...formData,
      skills: newValue,
    });
  };

  const isFormValid = () => {
    return (
      formData.title.trim() !== '' &&
      formData.description.trim() !== '' &&
      formData.skills.length > 0 &&
      formData.duration !== '' &&
      formData.experienceLevel !== '' &&
      formData.budget !== ''
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('You must be logged in to post a job.');
      return;
    }

    if (!isFormValid()) {
      setError('Please fill out all fields before submitting.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const jobData = {
        userId: user.$id,
        title: formData.title,
        description: formData.description,
        skills: formData.skills,
        duration: formData.duration,
        experienceLevel: formData.experienceLevel,
        budget: formData.budget,
        status: 'open',
      };

      await databases.createDocument(
        APPWRITE_CONFIG.DATABASES.JOBS,
        APPWRITE_CONFIG.COLLECTIONS.JOBS,
        ID.unique(),
        jobData
      );

      setSuccess(true);
      setTimeout(() => {
        onJobPosted();
        setActiveTab(0); // Switch to Browse tab after posting
      }, 2000);
    } catch (error: any) {
      console.error('Error posting job:', error);
      setError(error.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Slide direction="up" in={true}>
        <Alert 
          severity="success"
          sx={{ 
            p: 3, 
            borderRadius: 3,
            alignItems: 'center',
            boxShadow: 3
          }}
        >
          <Typography variant="h6" sx={{ mb: 1 }}>
            Job Posted Successfully!
          </Typography>
          <Typography>
            Your job has been posted and is now visible to potential freelancers.
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Button 
              variant="outlined" 
              onClick={() => setActiveTab(0)}
              sx={{ borderRadius: 2 }}
            >
              View All Jobs
            </Button>
          </Box>
        </Alert>
      </Slide>
    );
  }

  if (!user) {
    return (
      <Alert 
        severity="info" 
        sx={{ 
          borderRadius: 3,
          p: 3,
          boxShadow: 2
        }}
      >
        <Typography variant="h6" gutterBottom>
          Sign In Required
        </Typography>
        <Typography variant="body1" paragraph>
          You need to be signed in to post a new job.
        </Typography>
        <Button 
          variant="contained" 
          href="/login" 
          sx={{ borderRadius: 2 }}
        >
          Sign In
        </Button>
      </Alert>
    );
  }

  return (
    <MotionPaper
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      elevation={0}
      sx={{ 
        p: { xs: 2, sm: 3, md: 4 },
        borderRadius: 3,
        background: theme => `linear-gradient(145deg, ${alpha(theme.palette.primary.light, 0.03)}, ${alpha(theme.palette.background.paper, 1)})`,
        border: `1px solid ${theme.palette.divider}`,
        boxShadow: theme => `0 4px 20px ${theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.1)'}`
      }}
    >
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
        <Box 
          sx={{ 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 50,
            height: 50,
            borderRadius: '50%',
            bgcolor: theme => alpha(theme.palette.primary.main, 0.1),
            color: 'primary.main',
            mr: 2
          }}
        >
          <WorkIcon fontSize="large" />
        </Box>
        <Box>
          <Typography variant="h5" component="h2" fontWeight="bold">
            Post a New Job
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Find the perfect talent for your project
          </Typography>
        </Box>
      </Box>

      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 3, borderRadius: 2 }}
          onClose={() => setError('')}
        >
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Stack spacing={3}>
          <TextField
            label="Job Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            fullWidth
            required
            variant="outlined"
            placeholder="e.g., 'Smart Contract Developer for DeFi Project'"
            InputProps={{
              sx: { borderRadius: 2 }
            }}
          />

          <TextField
            label="Job Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            fullWidth
            required
            multiline
            rows={6}
            variant="outlined"
            placeholder="Describe the job, requirements, and expectations in detail..."
            InputProps={{
              sx: { borderRadius: 2 }
            }}
          />

          <Autocomplete
            multiple
            options={AVAILABLE_SKILLS}
            value={formData.skills}
            onChange={handleSkillsChange}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Required Skills"
                variant="outlined"
                placeholder="Select skills"
                required
                InputProps={{
                  ...params.InputProps,
                  sx: { borderRadius: 2 }
                }}
              />
            )}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  label={option}
                  {...getTagProps({ index })}
                  sx={{ 
                    bgcolor: theme => alpha(theme.palette.primary.main, 0.1),
                    color: 'primary.main',
                    fontWeight: 500,
                    '& .MuiChip-deleteIcon': {
                      color: 'primary.main',
                      '&:hover': {
                        color: 'primary.dark',
                      },
                    },
                  }}
                />
              ))
            }
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              }
            }}
          />

          <Box 
            sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, 
              gap: 2 
            }}
          >
            <FormControl fullWidth required>
              <InputLabel id="duration-label">Project Duration</InputLabel>
              <Select
                labelId="duration-label"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                label="Project Duration"
                sx={{ borderRadius: 2 }}
                startAdornment={
                  <InputAdornment position="start">
                    <ScheduleIcon color="action" />
                  </InputAdornment>
                }
              >
                {PROJECT_DURATIONS.map((duration) => (
                  <MenuItem key={duration} value={duration}>
                    {duration}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth required>
              <InputLabel id="experience-label">Experience Level</InputLabel>
              <Select
                labelId="experience-label"
                name="experienceLevel"
                value={formData.experienceLevel}
                onChange={handleChange}
                label="Experience Level"
                sx={{ borderRadius: 2 }}
                startAdornment={
                  <InputAdornment position="start">
                    <StarRateIcon color="action" />
                  </InputAdornment>
                }
              >
                {EXPERIENCE_LEVELS.map((level) => (
                  <MenuItem key={level} value={level}>
                    {level}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth required>
              <InputLabel id="budget-label">Budget Range</InputLabel>
              <Select
                labelId="budget-label"
                name="budget"
                value={formData.budget}
                onChange={handleChange}
                label="Budget Range"
                sx={{ borderRadius: 2 }}
                startAdornment={
                  <InputAdornment position="start">
                    <AccountBalanceWalletIcon color="action" />
                  </InputAdornment>
                }
              >
                {BUDGET_RANGES.map((budget) => (
                  <MenuItem key={budget} value={budget}>
                    {budget}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              type="button"
              variant="outlined"
              sx={{ mr: 2, borderRadius: 2 }}
              onClick={() => setActiveTab(0)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading || !isFormValid()}
              sx={{ 
                borderRadius: 2, 
                minWidth: 150,
                boxShadow: theme => `0 4px 10px ${alpha(theme.palette.primary.main, 0.4)}`,
                '&:hover': {
                  boxShadow: theme => `0 6px 15px ${alpha(theme.palette.primary.main, 0.6)}`,
                }
              }}
              endIcon={loading ? <CircularProgress size={20} color="inherit" /> : <ArrowForwardIcon />}
            >
              {loading ? 'Posting...' : 'Post Job'}
            </Button>
          </Box>
        </Stack>
      </form>
    </MotionPaper>
  );
}
