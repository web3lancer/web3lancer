import { useState, useCallback, useEffect } from 'react';
import { Button, CircularProgress, Typography, Tooltip } from '@mui/material';
import LinkIcon from '@mui/icons-material/Link';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import { getConnectionStatus, toggleConnectUsers } from '@/utils/api';
import { useAuth } from '@/contexts/AuthContext';

interface ConnectButtonProps {
  targetUserId: string;
  variant?: 'text' | 'outlined' | 'contained';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  showConnectText?: boolean; // Whether to show text or just icons
  onConnectChange?: (status: 'none' | 'pending' | 'active' | 'disconnected') => void; // Callback when connect status changes
}

const ConnectButton = ({
  targetUserId,
  variant = 'outlined',
  size = 'medium',
  fullWidth = false,
  showConnectText = true,
  onConnectChange
}: ConnectButtonProps) => {
  const { user } = useAuth();
  const [connectionStatus, setConnectionStatus] = useState<'none' | 'pending' | 'active' | 'disconnected'>('none');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Check the current connection status between users
  const checkConnectionStatus = useCallback(async () => {
    if (!user || !targetUserId || user.$id === targetUserId) {
      return;
    }

    try {
      setLoading(true);
      const status = await getConnectionStatus(user.$id, targetUserId);
      setConnectionStatus(status);
    } catch (err) {
      console.error('Error checking connection status:', err);
      setError('Could not check connection status');
    } finally {
      setLoading(false);
    }
  }, [user, targetUserId]);

  useEffect(() => {
    checkConnectionStatus();
  }, [checkConnectionStatus]);

  const handleConnectToggle = async () => {
    if (!user || !targetUserId) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Toggle connection based on current status
      let newAction: 'connect' | 'disconnect';
      let expectedNewStatus: 'none' | 'pending' | 'active' | 'disconnected';
      
      if (connectionStatus === 'active') {
        newAction = 'disconnect';
        expectedNewStatus = 'disconnected';
      } else {
        newAction = 'connect';
        expectedNewStatus = 'pending'; // Initial request status is pending
      }
      
      await toggleConnectUsers(user.$id, targetUserId, newAction);
      
      // Update local state
      setConnectionStatus(expectedNewStatus);
      
      // Call the callback if provided
      if (onConnectChange) {
        onConnectChange(expectedNewStatus);
      }
    } catch (err) {
      console.error('Error toggling connection status:', err);
      setError('Failed to update connection');
    } finally {
      setLoading(false);
    }
  };

  // If this is the user's own profile or no user is logged in, don't show the button
  if (!user || user.$id === targetUserId) {
    return null;
  }

  // Determine button state based on connection status
  const getButtonProps = () => {
    let icon;
    let text;
    let color: 'primary' | 'secondary' | 'success' | 'warning' | 'info';
    let tooltip;
    
    switch (connectionStatus) {
      case 'active':
        icon = <LinkIcon />;
        text = 'Connected';
        color = 'success';
        tooltip = 'Click to disconnect';
        break;
      case 'pending':
        icon = <HourglassEmptyIcon />;
        text = 'Pending';
        color = 'warning';
        tooltip = 'Connection request sent';
        break;
      case 'disconnected':
        icon = <LinkOffIcon />;
        text = 'Reconnect';
        color = 'info';
        tooltip = 'You were previously connected';
        break;
      case 'none':
      default:
        icon = <LinkIcon />;
        text = 'Connect';
        color = 'primary';
        tooltip = 'Send connection request';
    }

    return { icon, text, color, tooltip };
  };

  const { icon, text, color, tooltip } = getButtonProps();

  return (
    <Tooltip title={tooltip}>
      <Button
        variant={variant}
        size={size}
        fullWidth={fullWidth}
        onClick={handleConnectToggle}
        disabled={loading || connectionStatus === 'pending'}
        startIcon={loading ? <CircularProgress size={20} /> : icon}
        color={color}
        sx={{
          borderRadius: 1.5,
          textTransform: 'none',
          minWidth: showConnectText ? undefined : 40,
          p: showConnectText ? undefined : 1,
        }}
      >
        {!loading && showConnectText && (
          <Typography component="span" fontWeight={500}>
            {text}
          </Typography>
        )}
      </Button>
    </Tooltip>
  );
};

export default ConnectButton;