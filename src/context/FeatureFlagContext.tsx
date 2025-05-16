import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import ServiceFactory from '@/services/serviceFactory';
import SystemService from '@/services/systemService';

// Define default feature flags
export interface FeatureFlags {
  enableNewProfilePage: boolean;
  enableChatFunctionality: boolean;
  enableBlockchainIntegration: boolean;
  enableAdvancedSearch: boolean;
  enableVideoConferencing: boolean;
  enableGroupMessages: boolean;
  enableNewJobFlow: boolean;
  enableAIMatching: boolean;
  enableEscrowService: boolean;
  showNewNotifications: boolean;
  enableReviews: boolean;
  enableBadges: boolean;
  [key: string]: boolean; // Allow for dynamic flags
}

// Default values for feature flags
const defaultFeatureFlags: FeatureFlags = {
  enableNewProfilePage: false,
  enableChatFunctionality: true,
  enableBlockchainIntegration: false,
  enableAdvancedSearch: false,
  enableVideoConferencing: false,
  enableGroupMessages: false,
  enableNewJobFlow: false,
  enableAIMatching: false,
  enableEscrowService: true,
  showNewNotifications: true,
  enableReviews: true,
  enableBadges: false,
};

// Define the feature flag context type
interface FeatureFlagContextType {
  flags: FeatureFlags;
  isLoading: boolean;
  isEnabled: (flagName: string) => boolean;
  setFlag: (flagName: string, value: boolean) => Promise<void>;
  refreshFlags: () => Promise<void>;
}

// Create the context with default values
const FeatureFlagContext = createContext<FeatureFlagContextType>({
  flags: defaultFeatureFlags,
  isLoading: true,
  isEnabled: () => false,
  setFlag: async () => {},
  refreshFlags: async () => {},
});

// Provider component
export const FeatureFlagProvider = ({ children }: { children: ReactNode }) => {
  const [flags, setFlags] = useState<FeatureFlags>(defaultFeatureFlags);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Get services
  const serviceFactory = ServiceFactory.getInstance();
  const systemService = new SystemService(
    serviceFactory.getAppwriteService(),
    serviceFactory.getConfig()
  );

  // Load feature flags on mount
  useEffect(() => {
    refreshFlags();
  }, []);

  // Check if a feature is enabled
  const isEnabled = (flagName: string): boolean => {
    return flags[flagName] === true;
  };

  // Update a feature flag
  const setFlag = async (flagName: string, value: boolean): Promise<void> => {
    try {
      // Update the flag in the database
      await systemService.setFeatureFlag(flagName, value);
      
      // Update local state
      setFlags(prevFlags => ({
        ...prevFlags,
        [flagName]: value
      }));
    } catch (error) {
      console.error(`Error setting feature flag ${flagName}:`, error);
      throw error;
    }
  };

  // Refresh all feature flags from the server
  const refreshFlags = async (): Promise<void> => {
    try {
      setIsLoading(true);
      
      // Create a new flags object starting with defaults
      const newFlags: FeatureFlags = { ...defaultFeatureFlags };
      
      // Load each flag from the server
      await Promise.all(
        Object.keys(defaultFeatureFlags).map(async (flagName) => {
          const value = await systemService.getFeatureFlag(
            flagName, 
            defaultFeatureFlags[flagName]
          );
          newFlags[flagName] = value;
        })
      );
      
      setFlags(newFlags);
    } catch (error) {
      console.error('Error refreshing feature flags:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Prepare the context value
  const value = {
    flags,
    isLoading,
    isEnabled,
    setFlag,
    refreshFlags,
  };

  return (
    <FeatureFlagContext.Provider value={value}>
      {children}
    </FeatureFlagContext.Provider>
  );
};

// Custom hook to use the feature flag context
export const useFeatureFlags = () => useContext(FeatureFlagContext);

// Conditional rendering component based on feature flags
interface FeatureFlagProps {
  flag: string;
  fallback?: ReactNode;
  children: ReactNode;
}

export const FeatureFlag: React.FC<FeatureFlagProps> = ({ 
  flag,
  fallback = null,
  children 
}) => {
  const { isEnabled } = useFeatureFlags();
  
  if (isEnabled(flag)) {
    return <>{children}</>;
  }
  
  return <>{fallback}</>;
};