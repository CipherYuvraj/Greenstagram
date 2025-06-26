require('dotenv').config();
const { SecretClient } = require('@azure/keyvault-secrets');
const { DefaultAzureCredential } = require('@azure/identity');

async function testAzureAuth() {
  console.log('🔍 Testing Azure Authentication...\n');
  
  // Check environment variables
  console.log('Environment Variables:');
  console.log('AZURE_KEY_VAULT_URL:', process.env.AZURE_KEY_VAULT_URL);
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('');
  
  const keyVaultUrl = process.env.AZURE_KEY_VAULT_URL;
  
  if (!keyVaultUrl) {
    console.error('❌ AZURE_KEY_VAULT_URL not found in environment variables');
    return;
  }
  
  try {
    console.log('🔑 Creating DefaultAzureCredential...');
    const credential = new DefaultAzureCredential();
    
    console.log('🔧 Creating SecretClient...');
    const client = new SecretClient(keyVaultUrl, credential);
    
    console.log('📋 Testing secret list access...');
    const secretsIterator = client.listPropertiesOfSecrets();
    const secrets = [];
    
    for await (const secretProperties of secretsIterator) {
      secrets.push(secretProperties.name);
    }
    
    console.log('✅ Successfully connected to Key Vault!');
    console.log('📝 Available secrets:', secrets);
    
    // Test retrieving a specific secret
    if (secrets.includes('jwt-secret')) {
      console.log('\n🔍 Testing secret retrieval...');
      const secret = await client.getSecret('jwt-secret');
      console.log('✅ Successfully retrieved jwt-secret');
      console.log('🔐 Secret value length:', secret.value ? secret.value.length : 0, 'characters');
    }
    
  } catch (error) {
    console.error('❌ Error testing Azure authentication:', error.message);
    
    if (error.message.includes('Forbidden')) {
      console.error('\n💡 Access denied. Please run:');
      console.error('   az keyvault set-policy --name greenstagram --upn $(az account show --query user.name -o tsv) --secret-permissions get list');
    } else if (error.message.includes('Unauthorized')) {
      console.error('\n💡 Authentication failed. Please run:');
      console.error('   az login');
    } else if (error.message.includes('ENOTFOUND')) {
      console.error('\n💡 Key Vault not found. Please check:');
      console.error('   1. The vault name is correct');
      console.error('   2. The vault exists: az keyvault show --name greenstagram');
    }
  }
}

testAzureAuth();
