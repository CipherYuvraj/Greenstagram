import { SecretClient } from '@azure/keyvault-secrets';
import { DefaultAzureCredential, ClientSecretCredential } from '@azure/identity';
import { logger } from '../utils/logger';

export class AzureKeyVault {
  private client: SecretClient | null = null;
  private isInitialized = false;
  private initializationAttempted = false;

  constructor() {
    this.initialize();
  }

  private async initialize(): Promise<void> {
    if (this.initializationAttempted) return;
    this.initializationAttempted = true;

    try {
      const keyVaultUrl = process.env.AZURE_KEY_VAULT_URL || process.env.KEYVAULT_URI;
      
      if (!keyVaultUrl) {
        logger.warn('⚠️ No Azure Key Vault URL provided. Using environment variables only.');
        return;
      }

      logger.info(`🔧 Attempting to connect to Azure Key Vault: ${keyVaultUrl}`);

      // Try different authentication methods
      let credential;
      
      if (process.env.AZURE_CLIENT_ID && process.env.AZURE_CLIENT_SECRET && process.env.AZURE_TENANT_ID) {
        // Service Principal authentication (for production)
        logger.info('🔑 Using Service Principal authentication');
        credential = new ClientSecretCredential(
          process.env.AZURE_TENANT_ID,
          process.env.AZURE_CLIENT_ID,
          process.env.AZURE_CLIENT_SECRET
        );
      } else {
        // Default Azure credential (for development)
        logger.info('🔑 Using Default Azure Credential');
        credential = new DefaultAzureCredential();
      }

      this.client = new SecretClient(keyVaultUrl, credential);

      // Test the connection by trying to access a test secret
      await this.testConnection();
      
      this.isInitialized = true;
      logger.info('✅ Azure Key Vault connected successfully');
      
    } catch (error: any) {
      logger.error('❌ Failed to initialize Azure Key Vault:', error.message);
      this.client = null;
      this.isInitialized = false;
    }
  }

  private async testConnection(): Promise<void> {
    if (!this.client) {
      throw new Error('Key Vault client not initialized');
    }

    try {
      // Try to access properties (this requires minimal permissions)
      const propertiesIterator = this.client.listPropertiesOfSecrets();
      await propertiesIterator.next();
      
      logger.info('✅ Key Vault connection test successful');
    } catch (error: any) {
      logger.error('❌ Key Vault connection test failed:', error.message);
      throw error;
    }
  }

  async getSecret(secretName: string, fallbackEnvVar?: string): Promise<string> {
    // Wait for initialization to complete
    let attempts = 0;
    while (!this.initializationAttempted && attempts < 10) {
      await new Promise(resolve => setTimeout(resolve, 100));
      attempts++;
    }

    if (!this.isInitialized || !this.client) {
      if (fallbackEnvVar && process.env[fallbackEnvVar]) {
        logger.warn(`⚠️ Using fallback environment variable: ${fallbackEnvVar}`);
        return process.env[fallbackEnvVar]!;
      }
      throw new Error(`Azure Key Vault not available and no fallback for ${secretName}`);
    }

    try {
      logger.info(`🔍 Retrieving secret '${secretName}' from Azure Key Vault`);
      const secret = await this.client.getSecret(secretName);
      
      if (!secret.value) {
        throw new Error(`Secret '${secretName}' has no value`);
      }

      logger.info(`✅ Successfully retrieved secret '${secretName}' from Key Vault`);
      return secret.value;
      
    } catch (error: any) {
      logger.error(`❌ Failed to get secret '${secretName}' from Key Vault:`, error.message);
      
      if (fallbackEnvVar && process.env[fallbackEnvVar]) {
        logger.warn(`⚠️ Using fallback environment variable: ${fallbackEnvVar}`);
        return process.env[fallbackEnvVar]!;
      }
      
      throw error;
    }
  }

  async healthCheck(): Promise<{ status: string; vault?: string; error?: string }> {
    try {
      if (!this.client) {
        return { 
          status: 'not_configured',
          vault: process.env.AZURE_KEY_VAULT_URL || 'not_set'
        };
      }

      await this.testConnection();
      
      return { 
        status: 'healthy',
        vault: process.env.AZURE_KEY_VAULT_URL || 'unknown'
      };
    } catch (error: any) {
      return { 
        status: 'error',
        vault: process.env.AZURE_KEY_VAULT_URL || 'not_set',
        error: error.message
      };
    }
  }

  isConnected(): boolean {
    return this.isInitialized && this.client !== null;
  }
}

export const azureKeyVault = new AzureKeyVault();
