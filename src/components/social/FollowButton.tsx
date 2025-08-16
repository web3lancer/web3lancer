import { useState, useCallback, useEffect } from 'react';
import { Button, CircularProgress, Typography } from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import { useAuth } from '@/contexts/AuthContext';
import {
  getConnection,
  createConnection,
  deleteConnection,
} from '@/lib/appwrite';

interface FollowButtonProps {
  targetUserId: string;
  variant?: 'text' | 'outlined' | 'contained';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  showFollowText?: boolean; // Whether to show "Follow"/"Unfollow" text or just icons
  onFollowChange?: (isFollowing: boolean) => void; // Callback when follow status changes
}

const FollowButton = ({
  targetUserId,
  variant = 'outlined',
  size = 'medium',
  fullWidth = false,
  showFollowText = true,
  onFollowChange,
}: FollowButtonProps) => {
  const { user } = useAuth();
  const [following, setFollowing] = useState<boolean>(false);
  const [connectionId, setConnectionId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Check if the current user is already following the target user
  const checkFollowStatus = useCallback(async () => {
    if (!user || !targetUserId || user.$id === targetUserId) {
      return;
    }

    try {
      setLoading(true);
      const connection = await getConnection(user.$id, targetUserId);
      if (connection) {
        setFollowing(true);
        setConnectionId(connection.$id);
      } else {
        setFollowing(false);
        setConnectionId(null);
      }
    } catch (err) {
      console.error('Error checking follow status:', err);
      setError('Could not check follow status');
    } finally {
      setLoading(false);
    }
  }, [user, targetUserId]);

  useEffect(() => {
    checkFollowStatus();
  }, [checkFollowStatus]);

  const handleFollowToggle = async () => {
    if (!user || !targetUserId) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      if (following && connectionId) {
        // Unfollow
        await deleteConnection(connectionId);
        setFollowing(false);
        setConnectionId(null);
      } else {
        // Follow
        const connection = await createConnection({
          followerId: user.$id,
          followingId: targetUserId,
          connectionType: 'follow',
          status: 'active',
        });
        setFollowing(true);
        setConnectionId(connection.$id);
      }

      // Call the callback if provided
      if (onFollowChange) {
        onFollowChange(!following);
      }
    } catch (err) {
      console.error('Error toggling follow status:', err);
      setError(following ? 'Failed to unfollow' : 'Failed to follow');
    } finally {
      setLoading(false);
    }
  };

  // If this is the user's own profile or no user is logged in, don't show the button
  if (!user || user.$id === targetUserId) {
    return null;
  }

  return (
    <Button
      variant={variant}
      size={size}
      fullWidth={fullWidth}
      onClick={handleFollowToggle}
      disabled={loading}
      startIcon={following ? <PersonRemoveIcon /> : <PersonAddIcon />}
      color={following ? 'primary' : 'secondary'}
      sx={{
        borderRadius: 1.5,
        textTransform: 'none',
      }}
    >
      {loading ? (
        <CircularProgress size={24} color="inherit" />
      ) : (
        showFollowText && (
          <Typography component="span" fontWeight={500}>
            {following ? 'Unfollow' : 'Follow'}
          </Typography>
        )
      )}
    </Button>
  );
};

export default FollowButton;