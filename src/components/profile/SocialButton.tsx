"use client";

import React, { useState } from 'react';
import { Button, Typography, Badge, Box, CircularProgress } from '@mui/material';
import { PersonAdd, PersonRemove, Check, People } from '@mui/icons-material';

interface SocialButtonProps {
  type: 'follow' | 'connect';
  isActive: boolean;
  count: number;
  onToggle: () => Promise<void>;
  disabled?: boolean;
}

export default function SocialButton({ 
  type, 
  isActive, 
  count, 
  onToggle, 
  disabled = false 
}: SocialButtonProps) {
  const [loading, setLoading] = useState(false);
  
  const handleClick = async () => {
    setLoading(true);
    try {
      await onToggle();
    } catch (error) {
      console.error(`Error toggling ${type}:`, error);
    } finally {
      setLoading(false);
    }
  };
  
  // Determine button styling based on type and state
  const getButtonStyles = () => {
    const styles = {
      follow: {
        active: {
          color: 'primary.main',
          borderColor: 'primary.main',
          bgcolor: 'transparent',
        },
        inactive: {
          color: 'white',
          bgcolor: 'primary.main',
        }
      },
      connect: {
        active: {
          color: 'secondary.main',
          borderColor: 'secondary.main',
          bgcolor: 'transparent',
        },
        inactive: {
          color: 'white',
          bgcolor: 'secondary.main',
        }
      }
    };
    
    return isActive 
      ? styles[type].active 
      : styles[type].inactive;
  };
  
  const getIcon = () => {
    if (loading) return <CircularProgress size={20} color="inherit" />;
    
    if (type === 'follow') {
      return isActive ? <PersonRemove fontSize="small" /> : <PersonAdd fontSize="small" />;
    } else {
      return isActive ? <Check fontSize="small" /> : <People fontSize="small" />;
    }
  };
  
  const getLabel = () => {
    if (type === 'follow') {
      return isActive ? 'Unfollow' : 'Follow';
    } else {
      return isActive ? 'Connected' : 'Connect';
    }
  };
  
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Button
        variant={isActive ? "outlined" : "contained"}
        startIcon={getIcon()}
        onClick={handleClick}
        disabled={disabled || loading}
        sx={{
          ...getButtonStyles(),
          minWidth: 110,
          borderWidth: isActive ? 2 : 0,
          '&:hover': {
            borderWidth: isActive ? 2 : 0,
            bgcolor: isActive 
              ? 'rgba(0,0,0,0.04)' 
              : type === 'follow' ? 'primary.dark' : 'secondary.dark',
          }
        }}
      >
        {getLabel()}
      </Button>
      {count > 0 && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
          {count}
        </Typography>
      )}
    </Box>
  );
}