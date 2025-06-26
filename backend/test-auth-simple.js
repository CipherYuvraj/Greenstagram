const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

async function testAzureSetup() {
  console.log('🔍 Testing Azure CLI setup...\n');
  
  try {
    // Test 1: Check if Azure CLI is installed
    console.log('1. Checking Azure CLI installation...');
    const { stdout: version } = await execAsync('az --version');
    console.log('✅ Azure CLI is installed');
    console.log('Version info:', version.split('\n')[0]);
    
    // Test 2: Check if logged in
    console.log('\n2. Checking Azure login status...');
    const { stdout: account } = await execAsync('az account show');
    const accountInfo = JSON.parse(account);
    console.log('✅ Logged in to Azure');
    console.log('Account:', accountInfo.user.name);
    console.log('Subscription:', accountInfo.name);
    
    // Test 3: Check Key Vault access
    console.log('\n3. Checking Key Vault access...');
    const { stdout: vault } = await execAsync('az keyvault show --name greenstagram');
    const vaultInfo = JSON.parse(vault);
    console.log('✅ Key Vault found');
    console.log('Vault URL:', vaultInfo.properties.vaultUri);
    
    // Test 4: Check secret access
    console.log('\n4. Testing secret access...');
    try {
      const { stdout: secrets } = await execAsync('az keyvault secret list --vault-name greenstagram --output table');
      console.log('✅ Can access secrets');
      console.log('Available secrets:\n', secrets);
    } catch (secretError) {
      console.log('❌ Cannot access secrets - need to set access policy');
      console.log('Run this command:');
      console.log('az keyvault set-policy --name greenstagram --upn $(az account show --query user.name -o tsv) --secret-permissions get list set');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    
    if (error.message.includes('az')) {
      console.error('\n💡 Azure CLI not found. Please install it:');
      console.error('Windows: winget install Microsoft.AzureCLI');
      console.error('Or download: https://aka.ms/installazurecliwindows');
    } else if (error.message.includes('Please run')) {
      console.error('\n💡 Not logged in to Azure. Please run: az login');
    } else if (error.message.includes('ResourceNotFound')) {
      console.error('\n💡 Key Vault "greenstagram" not found. Create it with:');
      console.error('az group create --name greenstagram-rg --location eastus');
      console.error('az keyvault create --name greenstagram --resource-group greenstagram-rg --location eastus');
    }
  }
}

testAzureSetup();
