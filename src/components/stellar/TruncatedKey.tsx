import React from 'react';
import { Box, Tooltip, Typography } from '@mui/material';
import { useContacts } from '@/hooks/useContacts';

interface TruncatedKeyProps {
  publicKey: string;
  length?: number;
  showTooltip?: boolean;
}

export const TruncatedKey: React.FC<TruncatedKeyProps> = ({
  publicKey,
  length = 6,
  showTooltip = true
}) => {
  const { lookupContact } = useContacts();
  const contactName = lookupContact(publicKey);
  
  if (!publicKey) return null;
  
  const shortenedKey = `${publicKey.substring(0, length)}...${publicKey.substring(publicKey.length - length)}`;
  
  if (contactName) {
    return (
      <Tooltip title={showTooltip ? publicKey : ''}>
        <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center' }}>
          <Typography variant="body2" component="span">
            {contactName}
          </Typography>
          <Typography variant="caption" component="span" color="text.secondary" sx={{ ml: 1 }}>
            ({shortenedKey})
          </Typography>
        </Box>
      </Tooltip>
    );
  }
  
  return (
    <Tooltip title={showTooltip ? publicKey : ''}>
      <Typography 
        variant="body2" 
        component="span"
        sx={{ fontFamily: 'monospace' }}
      >
        {shortenedKey}
      </Typography>
    </Tooltip>
  );
};
