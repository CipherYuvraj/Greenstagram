import { DefaultAzureCredential } from '@azure/identity';
import { SecretClient } from '@azure/keyvault-secrets';
import logger from '@/utils/logger';

let secretClient: SecretClient;

export const initializeAzureKeyVault = async (): Promise<void> => {
  try {
    if (!process.env.AZURE_KEY_VAULT_URL) {
      logger.warn('Azure Key Vault URL not provided, using fallback secrets');
      return;
    }

    const credential = new DefaultAzureCredential();
    secretClient = new SecretClient(process.env.AZURE_KEY_VAULT_URL, credential);
    
    // Test connection
    await secretClient.getSecret('jwt-secret');
    logger.info('Azure Key Vault connected successfully');
  } catch (error) {
    logger.warn('Azure Key Vault connection failed, using fallback secrets:', error);
  }
};

export const getSecret = async (secretName: string, fallbackKey?: string): Promise<string | undefined> => {
  try {
    if (secretClient) {
      const secret = await secretClient.getSecret(secretName);
      return secret.value;
    }
  } catch (error) {
    logger.warn(`Failed to get secret ${secretName} from Key Vault:`, error);
  }
  
  // Fallback to environment variable
  if (fallbackKey) {
    return process.env[fallbackKey];
  }
  
  return undefined;
};

export const getJWTSecret = async (): Promise<string> => {
  const secret = await getSecret('jwt-secret', 'JWT_SECRET');
  if (!secret) {
    throw new Error('JWT secret not found in Key Vault or environment variables');
  }
  return secret;
};

export const getGroqAPIKey = async (): Promise<string> => {
  const key = await getSecret('groq-api-key', 'GROQ_API_KEY');
  if (!key) {
    throw new Error('GROQ API key not found');
  }
  return key;
};

export const getPlantNetAPIKey = async (): Promise<string> => {
  const key = await getSecret('plantnet-api-key', 'PLANTNET_API_KEY');
  if (!key) {
    throw new Error('PlantNet API key not found');
  }
  return key;
};

class AzureKeyVault {
  private client: SecretClient | null = null;
  private isInitialized: boolean = false;
  private initializationAttempted: boolean = false;

  async initialize(): Promise<void> {
    if (this.initializationAttempted) {
      return;
    }
    
    this.initializationAttempted = true;
    
    try {
      const vaultUrl = process.env.AZURE_KEY_VAULT_URL || process.env.KEYVAULT_URI;
      
      if (!vaultUrl) {
        console.warn('⚠️ No Azure Key Vault URL provided (AZURE_KEY_VAULT_URL or KEYVAULT_URI)');
        console.warn('⚠️ Will fallback to environment variables for secrets');
        this.client = null;
        this.isInitialized = false;
        return;
      }

      console.log('🔄 Initializing Azure Key Vault connection...');
      console.log(`📍 Vault URL: ${vaultUrl}`);
      
      const credential = new DefaultAzureCredential();
      this.client = new SecretClient(vaultUrl, credential);
      
      // Test the connection
      await this.testConnection();
      
      this.isInitialized = true;
      console.log('✅ Azure Key Vault connected successfully');
      
    } catch (error: any) {
      console.error('❌ Failed to initialize Azure Key Vault:', error.message);
      
      // Provide specific troubleshooting steps
      console.error('💡 Troubleshooting steps:');
      console.error('   1. Install Azure CLI: https://aka.ms/installazurecliwindows');
      console.error('   2. Run: az login');
      console.error('   3. Verify login: az account show');
      console.error('   4. Check Key Vault exists: az keyvault show --name greenstagram');
      console.error('   5. Set access policy: az keyvault set-policy --name greenstagram --upn $(az account show --query user.name -o tsv) --secret-permissions get list');
      
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
      
      console.log('✅ Key Vault connection test successful');
    } catch (error: any) {
      console.error('❌ Key Vault connection test failed:', error.message);
      
      // Provide specific error guidance for development
      if (error.message.includes('Forbidden') || error.code === 'Forbidden') {
        console.error('💡 Access denied. Run this command to set access policy:');
        console.error(`   az keyvault set-policy --name greenstagram --upn $(az account show --query user.name -o tsv) --secret-permissions get list`);
      } else if (error.message.includes('Unauthorized') || error.code === 'Unauthorized') {
        console.error('💡 Authentication failed. Please run: az login');
      } else if (error.message.includes('NotFound')) {
        console.error('💡 Key Vault not found. Please check if the vault exists and the URL is correct.');
      }
      
      throw error;
    }
  }

  async getSecret(secretName: string, fallbackEnvVar?: string): Promise<string> {
    // Initialize if not attempted yet
    if (!this.initializationAttempted) {
      await this.initialize();
    }

    if (!this.isInitialized || !this.client) {
      if (fallbackEnvVar && process.env[fallbackEnvVar]) {
        console.warn(`⚠️ Using fallback environment variable: ${fallbackEnvVar}`);
        return process.env[fallbackEnvVar]!;
      }
      throw new Error(`Azure Key Vault not available and no fallback for ${secretName}`);
    }

    try {
      console.log(`🔍 Retrieving secret '${secretName}' from Azure Key Vault`);
      const secret = await this.client.getSecret(secretName);
      
      if (!secret.value) {
        throw new Error(`Secret '${secretName}' has no value`);
      }

      console.log(`✅ Successfully retrieved secret '${secretName}' from Key Vault`);
      return secret.value;
      
    } catch (error: any) {
      console.error(`❌ Failed to get secret '${secretName}' from Key Vault:`, error.message);
      
      if (fallbackEnvVar && process.env[fallbackEnvVar]) {
        console.warn(`⚠️ Using fallback environment variable: ${fallbackEnvVar}`);
        return process.env[fallbackEnvVar]!;
      }
      
      throw error;
    }
  }

  async healthCheck(): Promise<{ status: string; vault?: string; error?: string; authMethod?: string }> {
    try {
      // Force initialization if not done
      if (!this.initializationAttempted) {
        await this.initialize();
      }

      if (!this.client) {
        return { 
          status: 'not_configured',
          vault: process.env.AZURE_KEY_VAULT_URL || process.env.KEYVAULT_URI || 'not_set',
          error: 'Key Vault client not initialized',
          authMethod: 'none'
        };
      }

      await this.testConnection();
      
      return { 
        status: 'healthy',
        vault: process.env.AZURE_KEY_VAULT_URL || process.env.KEYVAULT_URI || 'unknown',
        authMethod: 'azure_cli'
      };
    } catch (error: any) {
      return { 
        status: 'error',
        vault: process.env.AZURE_KEY_VAULT_URL || process.env.KEYVAULT_URI || 'not_set',
        error: error.message,
        authMethod: 'azure_cli'
      };
    }
  }

  isConnected(): boolean {
    return this.isInitialized && this.client !== null;
  }

  // Get configuration status for debugging
  getConfigStatus(): { url: string; authMethod: string; cliLoggedIn: boolean } {
    const url = process.env.AZURE_KEY_VAULT_URL || process.env.KEYVAULT_URI || 'not_set';
    
    return {
      url,
      authMethod: 'azure_cli',
      cliLoggedIn: this.isInitialized // If initialized, CLI is likely logged in
    };
  }
}


export const azureKeyVault = new AzureKeyVault();
