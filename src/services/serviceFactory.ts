import { appwriteService } from './appwriteService';
import { EnvService } from './envService';
import ProfileService from './profileService';
import JobService from './jobService';
import ContentService from './contentService';
import FinanceService from './financeService';
import SocialService from './socialService';
import GovernanceService from './governanceService';
import NotificationService from './notificationService';
import SystemService from './systemService';

/**
 * Service Factory - Creates and manages service instances to avoid duplication
 * Following the best practices from Cross-Cutting Concerns section
 */
class ServiceFactory {
  private static instances: Record<string, any> = {};

  /**
   * Get or create a service instance
   * @param serviceType The service class to instantiate
   * @param args Arguments to pass to the service constructor
   * @returns The service instance
   */
  static getService<T>(serviceType: new (...args: any[]) => T, ...args: any[]): T {
    const serviceName = serviceType.name;
    
    if (!this.instances[serviceName]) {
      this.instances[serviceName] = new serviceType(...args);
    }
    
    return this.instances[serviceName];
  }

  /**
   * Get the ProfileService instance
   */
  static getProfileService(): ProfileService {
    return this.getService(ProfileService, appwriteService, new EnvService('profiles'));
  }

  /**
   * Get the JobService instance
   */
  static getJobService(): JobService {
    return this.getService(JobService, appwriteService, new EnvService('jobs'));
  }

  /**
   * Get the ContentService instance
   */
  static getContentService(): ContentService {
    return this.getService(ContentService, appwriteService, new EnvService('content'));
  }

  /**
   * Get the FinanceService instance
   */
  static getFinanceService(): FinanceService {
    return this.getService(FinanceService, appwriteService, new EnvService('finance'));
  }

  /**
   * Get the SocialService instance
   */
  static getSocialService(): SocialService {
    return this.getService(SocialService, appwriteService, new EnvService('social'));
  }

  /**
   * Get the GovernanceService instance
   */
  static getGovernanceService(): GovernanceService {
    return this.getService(GovernanceService, appwriteService, new EnvService('governance'));
  }

  /**
   * Get the NotificationService instance
   */
  static getNotificationService(): NotificationService {
    return this.getService(NotificationService, appwriteService, new EnvService('activity'));
  }

  /**
   * Get the SystemService instance
   */
  static getSystemService(): SystemService {
    return this.getService(SystemService, appwriteService, new EnvService('core'));
  }
}

export default ServiceFactory;