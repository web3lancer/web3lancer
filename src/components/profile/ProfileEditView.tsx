"use client";
import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  TextField, 
  Button, 
  FormControl, 
  Divider,
  Autocomplete,
  Chip,
  Alert,
  Snackbar,
  CircularProgress
} from '@mui/material';
import { useAuth } from '@/contexts/AuthContext';
import { updateUserProfile, checkUsernameAvailability } from '@/utils/api';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';

interface ProfileEditViewProps {
  profile: any;
  onSaved: () => void;
}

export default function ProfileEditView({ profile, onSaved }: ProfileEditViewProps) {
  const { user } = useAuth();
  const [name, setName] = useState(profile?.name || '');
  const [username, setUsername] = useState(profile?.username || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [location, setLocation] = useState(profile?.location || '');
  const [skills, setSkills] = useState<string[]>(profile?.skills || []);
  const [projects, setProjects] = useState<any[]>(profile?.projects || []);
  const [loading, setLoading] = useState(false);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [usernameAvailable, setUsernameAvailable] = useState(true);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);

  // Common skill tags for suggestions
  const skillSuggestions = [
    'JavaScript', 'TypeScript', 'React', 'Next.js', 'Node.js', 
    'Python', 'Java', 'C#', 'PHP', 'Go',
    'Web3', 'Blockchain', 'Smart Contracts', 'Solidity', 'Rust',
    'UI/UX Design', 'Graphic Design', 'Product Management',
    'Data Science', 'Machine Learning', 'AI',
    'DevOps', 'AWS', 'Azure', 'Google Cloud'
  ];

  // Check username availability when it changes
  useEffect(() => {
    const checkUsername = async () => {
      if (!username || username === profile?.username) {
        setUsernameError(null);
        setUsernameAvailable(true);
        return;
      }
      
      // Only check if username is in correct format
      const usernameRegex = /^[a-zA-Z0-9_-]{3,30}$/;
      if (!usernameRegex.test(username)) {
        setUsernameError("Username must be 3-30 characters and contain only letters, numbers, underscores or hyphens.");
        setUsernameAvailable(false);
        return;
      }
      
      try {
        setIsCheckingUsername(true);
        const isAvailable = await checkUsernameAvailability(username);
        setUsernameAvailable(isAvailable);
        setUsernameError(isAvailable ? null : "Username is already taken.");
      } catch (error) {
        console.error('Error checking username:', error);
        setUsernameError("Error checking username availability.");
      } finally {
        setIsCheckingUsername(false);
      }
    };
    
    // Use a debounce to avoid too many requests
    const timeoutId = setTimeout(checkUsername, 500);
    return () => clearTimeout(timeoutId);
  }, [username, profile?.username]);

  // Handle save profile
  const handleSaveProfile = async () => {
    if (!user) return;
    
    // Validate form
    if (!name.trim()) {
      setSnackbar({
        open: true,
        message: 'Name is required',
        severity: 'error'
      });
      return;
    }
    
    if (username && !usernameAvailable) {
      setSnackbar({
        open: true,
        message: usernameError || 'Username is invalid or unavailable',
        severity: 'error'
      });
      return;
    }
    
    try {
      setLoading(true);
      
      await updateUserProfile(user.$id, {
        name,
        username,
        bio,
        location,
        skills,
        projects,
        updatedAt: new Date().toISOString()
      });
      
      setSnackbar({
        open: true,
        message: 'Profile updated successfully',
        severity: 'success'
      });
      
      // Call the callback after successful save
      onSaved();
      
    } catch (error) {
      console.error('Error updating profile:', error);
      setSnackbar({
        open: true,
        message: 'Failed to update profile',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleAddSkill = (skill: string) => {
    if (skill && !skills.includes(skill)) {
      setSkills([...skills, skill]);
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setSkills(skills.filter(s => s !== skill));
  };

  // Helper function to add a new project
  const handleAddProject = () => {
    setProjects([
      ...projects,
      {
        title: '',
        description: '',
        period: '',
        link: ''
      }
    ]);
  };

  // Helper function to update a project
  const handleUpdateProject = (index: number, field: string, value: string) => {
    const updatedProjects = [...projects];
    updatedProjects[index] = {
      ...updatedProjects[index],
      [field]: value
    };
    setProjects(updatedProjects);
  };

  // Helper function to remove a project
  const handleRemoveProject = (index: number) => {
    setProjects(projects.filter((_, i) => i !== index));
  };

  return (
    <Box sx={{ height: '100%' }}>
      {/* Basic Info Section */}
      <Paper 
        elevation={0}
        sx={{ 
          p: 3, 
          mb: 3, 
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Typography variant="h6" fontWeight="medium" gutterBottom>
          Basic Information
        </Typography>
        <Divider sx={{ mb: 3 }} />
        
        <Box component="form" noValidate autoComplete="off" sx={{ mb: 3 }}>
          <TextField
            fullWidth
            label="Name"
            variant="outlined"
            value={name}
            onChange={(e) => setName(e.target.value)}
            margin="normal"
            required
          />
          
          <TextField
            fullWidth
            label="Username"
            variant="outlined"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            margin="normal"
            error={!!usernameError}
            helperText={
              isCheckingUsername ? "Checking username..." : 
              usernameError ? usernameError : 
              username && "Username is available!"
            }
            InputProps={{
              endAdornment: isCheckingUsername ? <CircularProgress size={20} /> : null,
            }}
          />
          
          <TextField
            fullWidth
            label="Location"
            variant="outlined"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            margin="normal"
            placeholder="City, Country"
          />
        </Box>
      </Paper>

      {/* Bio Section */}
      <Paper 
        elevation={0}
        sx={{ 
          p: 3, 
          mb: 3, 
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Typography variant="h6" fontWeight="medium" gutterBottom>
          About You
        </Typography>
        <Divider sx={{ mb: 3 }} />
        
        <TextField
          fullWidth
          label="Bio"
          variant="outlined"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          margin="normal"
          multiline
          rows={4}
          placeholder="Tell others about yourself, your experience, and your interests"
        />
      </Paper>

      {/* Skills Section */}
      <Paper 
        elevation={0}
        sx={{ 
          p: 3, 
          mb: 3, 
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Typography variant="h6" fontWeight="medium" gutterBottom>
          Skills & Expertise
        </Typography>
        <Divider sx={{ mb: 3 }} />
        
        <FormControl fullWidth sx={{ mb: 2 }}>
          <Autocomplete
            multiple
            id="skills-input"
            options={skillSuggestions.filter(option => !skills.includes(option))}
            freeSolo
            value={skills}
            onChange={(_, newValue) => setSkills(newValue.filter(Boolean) as string[])}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip 
                  variant="outlined" 
                  label={option} 
                  {...getTagProps({ index })} 
                  sx={{ 
                    borderRadius: '4px',
                    backgroundColor: 'rgba(120, 87, 255, 0.1)',
                    color: 'primary.main'
                  }}
                />
              ))
            }
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                label="Skills"
                placeholder="Add skills..."
              />
            )}
          />
        </FormControl>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Add skills that showcase your expertise. These will help clients find you for relevant projects.
        </Typography>
      </Paper>

      {/* Projects Section */}
      <Paper 
        elevation={0}
        sx={{ 
          p: 3, 
          mb: 3, 
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Typography variant="h6" fontWeight="medium" gutterBottom>
          Projects & Portfolio
        </Typography>
        <Divider sx={{ mb: 3 }} />
        
        {projects.map((project, index) => (
          <Box key={index} sx={{ mb: 3, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Project {index + 1}
              <Button 
                size="small" 
                color="error" 
                onClick={() => handleRemoveProject(index)}
                sx={{ ml: 2 }}
              >
                Remove
              </Button>
            </Typography>
            
            <TextField
              fullWidth
              label="Project Title"
              variant="outlined"
              value={project.title}
              onChange={(e) => handleUpdateProject(index, 'title', e.target.value)}
              margin="normal"
            />
            
            <TextField
              fullWidth
              label="Project Period"
              variant="outlined"
              value={project.period}
              onChange={(e) => handleUpdateProject(index, 'period', e.target.value)}
              margin="normal"
              placeholder="e.g., Jan 2022 - Mar 2022"
            />
            
            <TextField
              fullWidth
              label="Project Description"
              variant="outlined"
              value={project.description}
              onChange={(e) => handleUpdateProject(index, 'description', e.target.value)}
              margin="normal"
              multiline
              rows={2}
            />
            
            <TextField
              fullWidth
              label="Project Link"
              variant="outlined"
              value={project.link}
              onChange={(e) => handleUpdateProject(index, 'link', e.target.value)}
              margin="normal"
              placeholder="https://..."
            />
          </Box>
        ))}
        
        <Button 
          variant="outlined" 
          onClick={handleAddProject}
          sx={{ mt: 1 }}
        >
          Add Project
        </Button>
      </Paper>

      {/* Save Button */}
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'flex-end', 
          gap: 2,
          mb: 3
        }}
      >
        <Button 
          variant="outlined" 
          color="inherit" 
          onClick={onSaved}
          startIcon={<CloseIcon />}
        >
          Cancel
        </Button>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleSaveProfile}
          startIcon={<SaveIcon />}
          disabled={loading || (username !== profile?.username && !usernameAvailable)}
        >
          {loading ? 'Saving...' : 'Save Profile'}
        </Button>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ 
            width: '100%',
            background: snackbar.severity === 'success' 
              ? 'linear-gradient(135deg, rgba(46, 213, 115, 0.95) 0%, rgba(37, 187, 112, 0.95) 100%)' 
              : 'linear-gradient(135deg, rgba(255, 71, 87, 0.95) 0%, rgba(231, 61, 77, 0.95) 100%)',
            color: 'white'
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}