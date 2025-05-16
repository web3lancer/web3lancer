import { AppwriteService } from './appwriteService';
import { defaultEnvConfig, EnvConfig } from '@/config/environment';
import SystemService from './systemService';
import NotificationService from './notificationService';
import ProfileService from './profileService';
import FinanceService from './financeService';
import GovernanceService from './governanceService';

/**
 * Service Factory
 * 
 * This class follows the Factory pattern to create and provide access to 
 * all the service instances in the application. It ensures there's only 
 * one instance of each service (Singleton pattern) for efficient resource use.
 */
class ServiceFactory {
  private static instance: ServiceFactory;
  private config: EnvConfig;
  private appwriteService: AppwriteService;
  
  // Service instances
  private systemService: SystemService | null = null;
  private notificationService: NotificationService | null = null;
  private profileService: ProfileService | null = null;
  private financeService: FinanceService | null = null;
  private governanceService: GovernanceService | null = null;

  private constructor(config: EnvConfig = defaultEnvConfig) {
    this.config = config;
    this.appwriteService = new AppwriteService(config);
  }

  /**
   * Get the singleton instance of ServiceFactory
   */
  public static getInstance(config?: EnvConfig): ServiceFactory {
    if (!ServiceFactory.instance) {
      ServiceFactory.instance = new ServiceFactory(config);
    }
    return ServiceFactory.instance;
  }

  /**
   * Get the environment configuration
   */
  public getConfig(): EnvConfig {
    return this.config;
  }

  /**
   * Get the core Appwrite service
   */
  public getAppwriteService(): AppwriteService {
    return this.appwriteService;
  }

  /**
   * Get SystemService instance
   */
  public getSystemService(): SystemService {
    if (!this.systemService) {
      this.systemService = new SystemService(this.appwriteService, this.config);
    }
    return this.systemService;
  }

  /**
   * Get NotificationService instance
   */
  public getNotificationService(): NotificationService {
    if (!this.notificationService) {
      this.notificationService = new NotificationService(this.appwriteService, this.config);
    }
    return this.notificationService;
  }

  /**
   * Get ProfileService instance
   */
  public getProfileService(): ProfileService {
    if (!this.profileService) {
      this.profileService = new ProfileService(this.appwriteService, this.config);
    }
    return this.profileService;
  }

  /**
   * Get FinanceService instance
   */
  public getFinanceService(): FinanceService {
    if (!this.financeService) {
      this.financeService = new FinanceService(this.appwriteService, this.config);
    }
    return this.financeService;
  }

  /**
   * Get GovernanceService instance
   */
  public getGovernanceService(): GovernanceService {
    if (!this.governanceService) {
      this.governanceService = new GovernanceService(this.appwriteService, this.config);
    }
    return this.governanceService;
  }

  /**
   * Reset all service instances 
   * (useful for testing or when environment config changes)
   */
  public reset(config?: EnvConfig): void {
    if (config) {
      this.config = config;
      this.appwriteService = new AppwriteService(config);
    }
    
    this.systemService = null;
    this.notificationService = null;
    this.profileService = null;
    this.financeService = null;
    this.governanceService = null;
  }
}

export default ServiceFactory;