import { SecretClient } from '@azure/keyvault-secrets';
import { DefaultAzureCredential, AzureCliCredential } from '@azure/identity';

export class AzureKeyVault {
  private client: SecretClient | null = null;
  private isInitialized = false;
  private initializationAttempted = false;

  constructor() {
    // Don't initialize in constructor to avoid blocking
    // Initialize when first needed
  }

  private async initialize(): Promise<void> {
    if (this.initializationAttempted) return;
    this.initializationAttempted = true;

    try {
      // Ensure environment is loaded first
      if (!process.env.AZURE_KEY_VAULT_URL && !process.env.KEYVAULT_URI) {
        // Try to load .env file again if variables are missing
        require('dotenv').config();
      }

      // Debug: Check environment variables
      console.log('🔍 Debug - Environment variables check:');
      console.log('AZURE_KEY_VAULT_URL:', process.env.AZURE_KEY_VAULT_URL);
      console.log('KEYVAULT_URI:', process.env.KEYVAULT_URI);
      console.log('NODE_ENV:', process.env.NODE_ENV);
      
      const keyVaultUrl = process.env.AZURE_KEY_VAULT_URL || process.env.KEYVAULT_URI;
      
      if (!keyVaultUrl) {
        console.warn('⚠️ No Azure Key Vault URL provided. Using environment variables only.');
        return;
      }

      // Check if the URL is properly formatted
      if (!keyVaultUrl.startsWith('https://') || !keyVaultUrl.includes('.vault.azure.net')) {
        console.error(`❌ Invalid Key Vault URL format: ${keyVaultUrl}`);
        return;
      }

      console.log(`🔧 Attempting to connect to Azure Key Vault: ${keyVaultUrl}`);

      // Try Azure CLI credential first, then fallback to DefaultAzureCredential
      let credential;
      try {
        console.log('🔑 Trying Azure CLI authentication first...');
        credential = new AzureCliCredential();
        
        // Test the credential by trying to get a token
        await credential.getToken('https://vault.azure.net/.default');
        console.log('✅ Azure CLI authentication successful');
      } catch (cliError) {
        console.log('⚠️ Azure CLI authentication failed, trying DefaultAzureCredential...');
        console.log('CLI Error:', cliError instanceof Error ? cliError.message : String(cliError));
        credential = new DefaultAzureCredential();
      }

      this.client = new SecretClient(keyVaultUrl, credential);

      // Test the connection by trying to access a test secret
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
