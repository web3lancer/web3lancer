import { useState, useEffect } from 'react';
import { 
  TextField, 
  Button, 
  Box, 
  CircularProgress, 
  Typography, 
  Alert, 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  IconButton
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import { checkUsernameAvailability, updateUserProfile } from '@/utils/api';
import { useRouter } from 'next/navigation';
import { APP_URL } from '@/lib/env';

interface UsernameEditorProps {
  userId: string;
  currentUsername: string | null | undefined;
}

const UsernameEditor = ({ userId, currentUsername }: UsernameEditorProps) => {
  const [username, setUsername] = useState(currentUsername || '');
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  // Reset state when dialog opens
  useEffect(() => {
    if (openDialog) {
      setUsername(currentUsername || '');
      setIsAvailable(null);
      setError(null);
      setSuccess(false);
    }
  }, [openDialog, currentUsername]);

  // Check username availability with debounce
  useEffect(() => {
    if (!username || username === currentUsername) {
      setIsAvailable(null);
      return;
    }

    const isValidUsername = /^[a-zA-Z0-9_]{3,20}$/.test(username);
    if (!isValidUsername) {
      setIsAvailable(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsChecking(true);
      try {
        const available = await checkUsernameAvailability(username);
        setIsAvailable(available);
      } catch (err) {
        console.error('Error checking username availability:', err);
        setIsAvailable(false);
      } finally {
        setIsChecking(false);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [username, currentUsername]);

  const handleUpdateUsername = async () => {
    if (!username || !isAvailable) return;

    setIsSubmitting(true);
    setError(null);
    
    try {
      await updateUserProfile(userId, { username });
      setSuccess(true);
      
      // Wait a moment before redirecting
      setTimeout(() => {
        // Close the dialog
        setOpenDialog(false);
        // Redirect to the new username path
        router.push(`/${username}`);
        // Reload the page to reflect the updated username
        window.location.reload();
      }, 1500);
    } catch (err: any) {
      console.error('Error updating username:', err);
      setError(err.message || 'Failed to update username');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value.trim());
    setIsAvailable(null);
    setError(null);
    setSuccess(false);
  };

  const getHelperText = () => {
    if (isChecking) return 'Checking availability...';
    if (error) return error;
    if (success) return 'Username updated successfully!';
    if (username === currentUsername) return 'This is your current username';
    if (username === '') return 'Username cannot be empty';
    if (username.length < 3) return 'Username must be at least 3 characters';
    if (username.length > 20) return 'Username must be at most 20 characters';
    if (!/^[a-zA-Z0-9_]+$/.test(username)) return 'Username can only contain letters, numbers, and underscores';
    if (isAvailable === true) return 'Username is available';
    if (isAvailable === false) return 'Username is already taken';
    return '';
  };

  const isValid = username !== '' && 
                 username !== currentUsername && 
                 isAvailable === true &&
                 !isChecking && 
                 !isSubmitting;

  return (
    <>
      <Button 
        startIcon={<EditIcon />} 
        variant="outlined" 
        color="primary" 
        size="small"
        onClick={() => setOpenDialog(true)}
        sx={{ borderRadius: 2, textTransform: 'none', ml: 1 }}
      >
        Edit Username
      </Button>

      <Dialog 
        open={openDialog} 
        onClose={() => !isSubmitting && setOpenDialog(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          Update Username
          {!isSubmitting && (
            <IconButton
              aria-label="close"
              onClick={() => setOpenDialog(false)}
              sx={{ position: 'absolute', right: 8, top: 8 }}
            >
              <CloseIcon />
            </IconButton>
          )}
        </DialogTitle>
        
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
            Choose a unique username. This will be used in your profile URL:
            <Box component="span" fontWeight="bold" sx={{ ml: 0.5 }}>
              {(APP_URL || (typeof window !== 'undefined' ? window.location.origin : '')) + '/' + (username || 'your-username')}
            </Box>
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Username updated successfully!
            </Alert>
          )}
          
          <TextField
            fullWidth
            label="Username"
            value={username}
            onChange={handleInputChange}
            margin="normal"
            variant="outlined"
            error={isAvailable === false}
            disabled={isSubmitting || success}
            autoFocus
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  @
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  {isChecking ? (
                    <CircularProgress size={20} />
                  ) : isAvailable === true ? (
                    <CheckCircleIcon color="success" />
                  ) : isAvailable === false ? (
                    <ErrorIcon color="error" />
                  ) : null}
                </InputAdornment>
              ),
            }}
            helperText={getHelperText()}
            sx={{ mb: 2 }}
          />
        </DialogContent>
        
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={() => setOpenDialog(false)} 
            color="inherit"
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpdateUsername}
            color="primary"
            variant="contained"
            disabled={!isValid || isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
          >
            {isSubmitting ? 'Updating...' : 'Update Username'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default UsernameEditor;