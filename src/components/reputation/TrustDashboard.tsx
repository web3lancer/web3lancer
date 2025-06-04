'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Alert,
  LinearProgress,
  Grid,
  Divider
} from '@mui/material';
import { 
  AccountBalance,
  Security,
  Verified,
  Warning
} from '@mui/icons-material';
import { getUserTrustScore, getActivationRequirements, activateUserAccount } from '@/utils/graphite';
import ReputationBadge from './ReputationBadge';

interface TrustData {
  score: number;
  level: string;
  isVerified: boolean;
  compliance: {
    activated: boolean;
    kycLevel: number;
  };
}

interface ActivationInfo {
  required: boolean;
  fee: string;
  currency: string;
}

export const TrustDashboard: React.FC = () => {
  const [trustData, setTrustData] = useState<TrustData | null>(null);
  const [activationInfo, setActivationInfo] = useState<ActivationInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTrustData();
  }, []);

  const loadTrustData = async () => {
    try {
      setLoading(true);
      const [trust, activation] = await Promise.all([
        getUserTrustScore(),
        getActivationRequirements()
      ]);
      
      setTrustData(trust);
      setActivationInfo(activation);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load trust data');
    } finally {
      setLoading(false);
    }
  };

  const handleActivateAccount = async () => {
    try {
      setActivating(true);
      setError(null);
      await activateUserAccount();
      await loadTrustData(); // Refresh data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Activation failed');
    } finally {
      setActivating(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>Trust & Reputation</Typography>
          <LinearProgress />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent>
          <Alert severity="error" action={
            <Button onClick={loadTrustData} size="small">
              Retry
            </Button>
          }>
            {error}
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Security />
          Trust & Reputation Dashboard
        </Typography>

        {trustData && (
          <>
            <Box sx={{ mb: 3 }}>
              <ReputationBadge
                score={trustData.score}
                level={trustData.level}
                isVerified={trustData.isVerified}
                kycLevel={trustData.compliance.kycLevel}
                showDetails={true}
              />
            </Box>

            <Divider sx={{ my: 2 }} />

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Box sx={{ textAlign: 'center' }}>
                  <AccountBalance color="primary" sx={{ fontSize: 40 }} />
                  <Typography variant="h4" color="primary">
                    {trustData.score.toFixed(1)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Trust Score (out of 5.0)
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box sx={{ textAlign: 'center' }}>
                  <Verified color={trustData.isVerified ? 'success' : 'disabled'} sx={{ fontSize: 40 }} />
                  <Typography variant="h6">
                    Level {trustData.compliance.kycLevel}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    KYC Verification
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            {!trustData.compliance.activated && activationInfo && (
              <>
                <Divider sx={{ my: 2 }} />
                <Alert 
                  severity="warning" 
                  icon={<Warning />}
                  action={
                    <Button 
                      onClick={handleActivateAccount}
                      disabled={activating}
                      size="small"
                      variant="contained"
                    >
                      {activating ? 'Activating...' : `Activate (${activationInfo.fee} ${activationInfo.currency})`}
                    </Button>
                  }
                >
                  Your account needs activation to access all features and build trust on the Graphite Network.
                </Alert>
              </>
            )}

            <Box sx={{ mt: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Trust scores are calculated on-chain using Graphite Network's reputation infrastructure. 
                Higher scores unlock premium features and increase your visibility to potential clients.
              </Typography>
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default TrustDashboard;
