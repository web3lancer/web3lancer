import { EnvConfig, defaultEnvConfig } from '@/config/environment';

/**
 * EnvService - A service for accessing environment variables with proper typing
 * 
 * This service provides a consistent way to access environment variables and
 * configuration values throughout the application.
 */
class EnvService {
  private config: EnvConfig;

  constructor(customConfig?: Partial<EnvConfig>) {
    this.config = {
      ...defaultEnvConfig,
      ...customConfig
    };
  }

  /**
   * Get a module-specific configuration
   * @param module The module to get configuration for
   * @returns The module configuration
   */
  public getModuleConfig<T extends keyof EnvConfig>(module: T): EnvConfig[T] {
    return this.config[module];
  }

  /**
   * Get the entire configuration
   * @returns The complete environment configuration
   */
  public getConfig(): EnvConfig {
    return this.config;
  }

  /**
   * Override a specific configuration value
   * @param module The module to override
   * @param key The specific key to override
   * @param value The new value
   */
  public override<T extends keyof EnvConfig, K extends keyof EnvConfig[T]>(
    module: T,
    key: K,
    value: EnvConfig[T][K]
  ): void {
    this.config[module][key] = value;
  }

  /**
   * Get the Appwrite endpoint URL
   * @returns The Appwrite endpoint URL
   */
  public getAppwriteEndpoint(): string {
    return this.config.appwrite.endpoint;
  }

  /**
   * Get the Appwrite project ID
   * @returns The Appwrite project ID
   */
  public getAppwriteProjectId(): string {
    return this.config.appwrite.projectId;
  }

  /**
   * Check if the environment is production
   * @returns True if in production, false otherwise
   */
  public isProduction(): boolean {
    return process.env.NODE_ENV === 'production';
  }

  /**
   * Get the base app URL
   * @returns The base URL for the application
   */
  public getAppUrl(): string {
    return process.env.NEXT_PUBLIC_APP_URL || '';
  }
}

// Export a singleton instance for easy access
export const envService = new EnvService();

export default EnvService;