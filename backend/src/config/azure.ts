import { SecretClient } from '@azure/keyvault-secrets';
import { DefaultAzureCredential } from '@azure/identity';
import { logger } from '../utils/logger';

export class AzureKeyVaultService {
  private keyVaultClient: SecretClient | null = null;
  private keyVaultUrl: string;
  private credential: DefaultAzureCredential;

  constructor() {
    this.keyVaultUrl = process.env.AZURE_KEY_VAULT_URL || '';
    
    if (this.keyVaultUrl) {
      try {
        // Use Managed Identity for authentication - Azure best practice
        this.credential = new DefaultAzureCredential();
        this.keyVaultClient = new SecretClient(this.keyVaultUrl, this.credential);
        logger.info('✅ Azure Key Vault client initialized successfully');
      } catch (error) {
        logger.error('❌ Failed to initialize Azure Key Vault client:', error);
      }
    } else {
      logger.warn('⚠️ No Key Vault URL provided, using environment variables');
    }
  }

  async getSecret(secretName: string, fallbackEnvVar?: string): Promise<string> {
    if (!this.keyVaultClient) {
      if (fallbackEnvVar && process.env[fallbackEnvVar]) {
        return process.env[fallbackEnvVar]!;
      }
      throw new Error(`Key Vault not configured and no fallback for secret: ${secretName}`);
    }

    try {
      const secret = await this.keyVaultClient.getSecret(secretName);
      return secret.value || '';
    } catch (error) {
      logger.error(`❌ Failed to fetch secret ${secretName} from Key Vault:`, error);
      
      // Fallback to environment variable if available
      if (fallbackEnvVar && process.env[fallbackEnvVar]) {
        logger.warn(`⚠️ Using fallback environment variable for ${secretName}`);
        return process.env[fallbackEnvVar]!;
      }
      
      throw error;
    }
  }

  async setSecret(secretName: string, secretValue: string): Promise<void> {
    if (!this.keyVaultClient) {
      throw new Error('Key Vault not configured');
    }

    try {
      await this.keyVaultClient.setSecret(secretName, secretValue);
      logger.info(`✅ Secret ${secretName} stored in Key Vault`);
    } catch (error) {
      logger.error(`❌ Failed to store secret ${secretName} in Key Vault:`, error);
      throw error;
    }
  }
}

export const azureKeyVault = new AzureKeyVaultService();
