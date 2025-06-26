console.log('=== Checking dotenv loading ===');
console.log('Before dotenv.config():');
console.log('AZURE_KEY_VAULT_URL:', process.env.AZURE_KEY_VAULT_URL);

const dotenvResult = require('dotenv').config();
console.log('dotenv.config() result:', dotenvResult);

console.log('After dotenv.config():');
console.log('AZURE_KEY_VAULT_URL:', process.env.AZURE_KEY_VAULT_URL);
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✅ Set' : '❌ Missing');
console.log('MONGODB_CONNECTION_STRING:', process.env.MONGODB_CONNECTION_STRING ? '✅ Set' : '❌ Missing');
