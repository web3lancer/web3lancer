import React from 'react';
import { Box, Tooltip, Typography } from '@mui/material';

interface TruncatedKeyProps {
  publicKey: string;
  length?: number;
  fontSize?: string;
  onClick?: () => void;
}

export function TruncatedKey({ 
  publicKey, 
  length = 12, 
  fontSize = "0.875rem",
  onClick 
}: TruncatedKeyProps) {
  if (!publicKey) return null;
  
  // Calculate how many characters to show at beginning and end
  const halfLength = Math.floor(length / 2);
  
  // Create the truncated display of the key
  const displayKey = publicKey.length > length
    ? `${publicKey.substring(0, halfLength)}...${publicKey.substring(publicKey.length - halfLength)}`
    : publicKey;
  
  return (
    <Tooltip title={publicKey} arrow>
      <Typography
        component="span"
        variant="body2"
        sx={{ 
          fontFamily: 'monospace', 
          fontSize,
          cursor: onClick ? 'pointer' : 'default',
          '&:hover': onClick ? { textDecoration: 'underline' } : {}
        }}
        onClick={onClick}
      >
        {displayKey}
      </Typography>
    </Tooltip>
  );
}
