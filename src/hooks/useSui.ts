import { useState, useEffect, useCallback } from 'react';
import { Ed25519Keypair } from '@mysten/sui.js/keypairs/ed25519';
import { 
  suiUserProfileService, 
  suiProjectService, 
  suiReputationService, 
  suiMessagingService 
} from '@/services/suiServices';
import { suiWallet } from '@/utils/walletUtils';
import type {
  UserProfile,
  Project,
  Review,
  Conversation,
  CreateProfileParams,
  CreateProjectParams,
  SubmitReviewParams,
  TransactionResult,
  SuiServiceResponse
} from '@/types/suiTypes';

// Wallet connection hook
export const useSuiWallet = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [keypair, setKeypair] = useState<Ed25519Keypair | null>(null);

  useEffect(() => {
    const updateWalletState = () => {
      setIsConnected(suiWallet.isConnected());
      setAddress(suiWallet.getAddress());
      setKeypair(suiWallet.getKeypair());
    };

    updateWalletState();
  }, []);

  const connect = useCallback((privateKey: string) => {
    const result = suiWallet.connectWithPrivateKey(privateKey);
    if (result.success) {
      setIsConnected(true);
      setAddress(result.address || null);
      setKeypair(suiWallet.getKeypair());
    }
    return result;
  }, []);

  const disconnect = useCallback(() => {
    suiWallet.disconnect();
    setIsConnected(false);
    setAddress(null);
    setKeypair(null);
  }, []);

  const generateKeypair = useCallback(() => {
    return suiWallet.generateKeypair();
  }, []);

  return {
    isConnected,
    address,
    keypair,
    connect,
    disconnect,
    generateKeypair,
  };
};

// User Profile hooks
export const useUserProfile = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { keypair } = useSuiWallet();

  const createProfile = useCallback(async (params: CreateProfileParams): Promise<SuiServiceResponse> => {
    if (!keypair) {
      return { success: false, error: 'Wallet not connected' };
    }

    setLoading(true);
    setError(null);

    try {
      const result = await suiUserProfileService.createProfile(params, keypair);
      if (!result.success) {
        setError(result.error || 'Failed to create profile');
      }
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [keypair]);

  const updateProfile = useCallback(async (profileId: string, params: { bio: string; hourlyRate: number }): Promise<SuiServiceResponse> => {
    if (!keypair) {
      return { success: false, error: 'Wallet not connected' };
    }

    setLoading(true);
    setError(null);

    try {
      const result = await suiUserProfileService.updateProfile(profileId, params, keypair);
      if (!result.success) {
        setError(result.error || 'Failed to update profile');
      }
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [keypair]);

  const addSkill = useCallback(async (profileId: string, skill: string): Promise<SuiServiceResponse> => {
    if (!keypair) {
      return { success: false, error: 'Wallet not connected' };
    }

    setLoading(true);
    setError(null);

    try {
      const result = await suiUserProfileService.addSkill(profileId, skill, keypair);
      if (!result.success) {
        setError(result.error || 'Failed to add skill');
      }
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [keypair]);

  const getProfile = useCallback(async (profileId: string): Promise<SuiServiceResponse<UserProfile>> => {
    setLoading(true);
    setError(null);

    try {
      const result = await suiUserProfileService.getProfile(profileId);
      if (!result.success) {
        setError(result.error || 'Failed to get profile');
      }
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    createProfile,
    updateProfile,
    addSkill,
    getProfile,
  };
};

// Project Management hooks
export const useProject = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { keypair } = useSuiWallet();

  const createProject = useCallback(async (params: CreateProjectParams, paymentCoinId: string): Promise<SuiServiceResponse> => {
    if (!keypair) {
      return { success: false, error: 'Wallet not connected' };
    }

    setLoading(true);
    setError(null);

    try {
      const result = await suiProjectService.createProject(params, paymentCoinId, keypair);
      if (!result.success) {
        setError(result.error || 'Failed to create project');
      }
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [keypair]);

  const acceptProject = useCallback(async (projectId: string): Promise<SuiServiceResponse> => {
    if (!keypair) {
      return { success: false, error: 'Wallet not connected' };
    }

    setLoading(true);
    setError(null);

    try {
      const result = await suiProjectService.acceptProject(projectId, keypair);
      if (!result.success) {
        setError(result.error || 'Failed to accept project');
      }
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [keypair]);

  const submitMilestone = useCallback(async (projectId: string, milestoneId: number): Promise<SuiServiceResponse> => {
    if (!keypair) {
      return { success: false, error: 'Wallet not connected' };
    }

    setLoading(true);
    setError(null);

    try {
      const result = await suiProjectService.submitMilestone(projectId, milestoneId, keypair);
      if (!result.success) {
        setError(result.error || 'Failed to submit milestone');
      }
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [keypair]);

  const approveMilestone = useCallback(async (projectId: string, freelancerProfileId: string, milestoneId: number): Promise<SuiServiceResponse> => {
    if (!keypair) {
      return { success: false, error: 'Wallet not connected' };
    }

    setLoading(true);
    setError(null);

    try {
      const result = await suiProjectService.approveMilestone(projectId, freelancerProfileId, milestoneId, keypair);
      if (!result.success) {
        setError(result.error || 'Failed to approve milestone');
      }
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [keypair]);

  const getProject = useCallback(async (projectId: string): Promise<SuiServiceResponse<Project>> => {
    setLoading(true);
    setError(null);

    try {
      const result = await suiProjectService.getProject(projectId);
      if (!result.success) {
        setError(result.error || 'Failed to get project');
      }
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    createProject,
    acceptProject,
    submitMilestone,
    approveMilestone,
    getProject,
  };
};

// Reputation System hooks
export const useReputation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { keypair } = useSuiWallet();

  const submitReview = useCallback(async (params: SubmitReviewParams): Promise<SuiServiceResponse> => {
    if (!keypair) {
      return { success: false, error: 'Wallet not connected' };
    }

    setLoading(true);
    setError(null);

    try {
      const result = await suiReputationService.submitReview(params, keypair);
      if (!result.success) {
        setError(result.error || 'Failed to submit review');
      }
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [keypair]);

  const verifySkill = useCallback(async (
    userAddress: string,
    skill: string,
    verificationType: string,
    evidenceUrl: string,
    expiryDate: number
  ): Promise<SuiServiceResponse> => {
    if (!keypair) {
      return { success: false, error: 'Wallet not connected' };
    }

    setLoading(true);
    setError(null);

    try {
      const result = await suiReputationService.verifySkill(
        userAddress, skill, verificationType, evidenceUrl, expiryDate, keypair
      );
      if (!result.success) {
        setError(result.error || 'Failed to verify skill');
      }
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [keypair]);

  return {
    loading,
    error,
    submitReview,
    verifySkill,
  };
};

// Messaging hooks
export const useMessaging = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { keypair } = useSuiWallet();

  const createConversation = useCallback(async (otherParticipant: string, projectId?: string): Promise<SuiServiceResponse> => {
    if (!keypair) {
      return { success: false, error: 'Wallet not connected' };
    }

    setLoading(true);
    setError(null);

    try {
      const result = await suiMessagingService.createConversation(otherParticipant, projectId, keypair);
      if (!result.success) {
        setError(result.error || 'Failed to create conversation');
      }
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [keypair]);

  const sendMessage = useCallback(async (
    conversationId: string, 
    params: { content: string; messageType: number; fileUrl?: string; replyTo?: number }
  ): Promise<SuiServiceResponse> => {
    if (!keypair) {
      return { success: false, error: 'Wallet not connected' };
    }

    setLoading(true);
    setError(null);

    try {
      const result = await suiMessagingService.sendMessage(conversationId, params, keypair);
      if (!result.success) {
        setError(result.error || 'Failed to send message');
      }
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [keypair]);

  return {
    loading,
    error,
    createConversation,
    sendMessage,
  };
};

// Combined hook for all Sui functionality
export const useSuiIntegration = () => {
  const wallet = useSuiWallet();
  const profile = useUserProfile();
  const project = useProject();
  const reputation = useReputation();
  const messaging = useMessaging();

  return {
    wallet,
    profile,
    project,
    reputation,
    messaging,
  };
};