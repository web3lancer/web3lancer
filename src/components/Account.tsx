import { useAccount, useDisconnect, useEnsAvatar, useEnsName } from 'wagmi';
import { Button, Box, Typography, Avatar, Paper } from '@mui/material';
import { motion } from 'framer-motion';

const MotionPaper = motion(Paper);

export function Account() {
  const { address } = useAccount();
  const { disconnect } = useDisconnect();
  const { data: ensName } = useEnsName({ address });
  const { data: ensAvatar } = useEnsAvatar({ name: ensName! });

  const formatAddress = (addr?: string) => {
    if (!addr) return '';
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  return (
    <MotionPaper
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      sx={{ 
        p: 3, 
        borderRadius: 4,
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.18)',
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
        <Avatar 
          src={ensAvatar || undefined} 
          sx={{ 
            width: 80, 
            height: 80, 
            mb: 2,
            background: 'linear-gradient(45deg, #1E40AF, #3B82F6)',
            boxShadow: '0 4px 20px rgba(59, 130, 246, 0.3)'
          }} 
        />
        
        {ensName && (
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {ensName}
          </Typography>
        )}
        
        <Typography 
          variant="body1" 
          sx={{ 
            p: 1, 
            px: 3, 
            bgcolor: 'rgba(59, 130, 246, 0.1)', 
            borderRadius: 2,
            fontFamily: 'monospace', 
            fontWeight: 500 
          }}
        >
          {formatAddress(address)}
        </Typography>
        
        <Button 
          variant="outlined" 
          onClick={() => disconnect()} 
          sx={{ 
            mt: 2,
            borderWidth: 2,
            borderColor: 'primary.main',
            '&:hover': {
              borderWidth: 2,
            }
          }}
        >
          Disconnect
        </Button>
      </Box>
    </MotionPaper>
  );
}
