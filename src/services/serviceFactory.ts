import { AppwriteService } from './appwriteService';
import { defaultEnvConfig, EnvConfig } from '@/config/environment';

/**
 * ServiceFactory - Creates and manages application services
 * 
 * This factory ensures services are created with the correct configuration
 * and simplifies dependency injection throughout the application.
 */
class ServiceFactory {
  private static instance: ServiceFactory;
  private config: EnvConfig;
  private appwriteService: AppwriteService;
  
  // Service instances cache
  private serviceInstances: Map<string, any> = new Map();

  private constructor(config: EnvConfig = defaultEnvConfig) {
    this.config = config;
    this.appwriteService = new AppwriteService(config);
  }

  public static getInstance(config?: EnvConfig): ServiceFactory {
    if (!ServiceFactory.instance) {
      ServiceFactory.instance = new ServiceFactory(config);
    }
    return ServiceFactory.instance;
  }

  // Get the Appwrite service with default config
  public getAppwriteService(): AppwriteService {
    return this.appwriteService;
  }

  // Generic method to get or create a service
  public getService<T>(serviceKey: string, ServiceClass: new (appwrite: AppwriteService, config: EnvConfig) => T): T {
    if (!this.serviceInstances.has(serviceKey)) {
      this.serviceInstances.set(serviceKey, new ServiceClass(this.appwriteService, this.config));
    }
    return this.serviceInstances.get(serviceKey) as T;
  }

  // Utility method to reset all services (useful for testing or logout)
  public resetServices(): void {
    this.serviceInstances.clear();
  }
}

export default ServiceFactory;

export default ServiceFactory;