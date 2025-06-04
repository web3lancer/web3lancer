'use client';

import React from 'react';
import { Chip, Tooltip, Box } from '@mui/material';
import { 
  Verified, 
  Star, 
  Security, 
  Warning,
  CheckCircle 
} from '@mui/icons-material';

interface ReputationBadgeProps {
  score: number;
  level: string;
  isVerified: boolean;
  kycLevel: number;
  size?: 'small' | 'medium';
  showDetails?: boolean;
}

export const ReputationBadge: React.FC<ReputationBadgeProps> = ({
  score,
  level,
  isVerified,
  kycLevel,
  size = 'medium',
  showDetails = true
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 4.5) return 'success';
    if (score >= 4.0) return 'primary';
    if (score >= 3.5) return 'secondary';
    if (score >= 3.0) return 'warning';
    return 'error';
  };

  const getVerificationIcon = () => {
    if (!isVerified) return <Warning fontSize="small" />;
    if (kycLevel >= 3) return <Security fontSize="small" />;
    if (kycLevel >= 1) return <Verified fontSize="small" />;
    return <CheckCircle fontSize="small" />;
  };

  const getTooltipContent = () => (
    <Box>
      <div>Trust Score: {score.toFixed(1)}/5.0</div>
      <div>Level: {level}</div>
      <div>KYC Level: {kycLevel}</div>
      <div>Status: {isVerified ? 'Verified' : 'Unverified'}</div>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
      <Tooltip title={showDetails ? getTooltipContent() : ''}>
        <Chip
          icon={<Star fontSize="small" />}
          label={`${score.toFixed(1)} ${level}`}
          color={getScoreColor(score) as any}
          size={size}
          variant="outlined"
        />
      </Tooltip>
      
      <Tooltip title={`Verification Level: ${kycLevel}`}>
        <Chip
          icon={getVerificationIcon()}
          label={isVerified ? 'Verified' : 'Unverified'}
          color={isVerified ? 'success' : 'default'}
          size={size}
          variant="filled"
        />
      </Tooltip>
    </Box>
  );
};

export default ReputationBadge;
