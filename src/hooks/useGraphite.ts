import { useState, useEffect, useCallback } from 'react';
import { 
  getUserTrustScore, 
  canAccessPremiumFeatures, 
  canPostJobs,
  getGraphiteService,
  initializeGraphite
} from '@/utils/graphite';

interface TrustData {
  score: number;
  level: string;
  isVerified: boolean;
  compliance: {
    activated: boolean;
    kycLevel: number;
  };
}

interface GraphiteHook {
  trustData: TrustData | null;
  loading: boolean;
  error: string | null;
  canAccessPremium: boolean;
  canPost: boolean;
  refreshTrustData: () => Promise<void>;
  initializeService: (privateKey?: string) => Promise<void>;
}

export const useGraphite = (): GraphiteHook => {
  const [trustData, setTrustData] = useState<TrustData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [canAccessPremium, setCanAccessPremium] = useState(false);
  const [canPost, setCanPost] = useState(false);

  const refreshTrustData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [trust, premiumAccess, postAccess] = await Promise.all([
        getUserTrustScore(),
        canAccessPremiumFeatures(),
        canPostJobs()
      ]);

      setTrustData(trust);
      setCanAccessPremium(premiumAccess);
      setCanPost(postAccess);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load trust data';
      setError(errorMessage);
      console.error('Error refreshing trust data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const initializeService = useCallback(async (privateKey?: string) => {
    try {
      await initializeGraphite(privateKey);
      await refreshTrustData();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize Graphite service';
      setError(errorMessage);
      console.error('Error initializing Graphite:', err);
    }
  }, [refreshTrustData]);

  useEffect(() => {
    // Auto-initialize with default config
    initializeService().catch(console.error);
  }, [initializeService]);

  return {
    trustData,
    loading,
    error,
    canAccessPremium,
    canPost,
    refreshTrustData,
    initializeService
  };
};

export default useGraphite;
