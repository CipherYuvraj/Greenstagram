require('dotenv').config();

console.log('=== Environment Variables Debug ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('AZURE_KEY_VAULT_URL:', process.env.AZURE_KEY_VAULT_URL);
console.log('KEYVAULT_URI:', process.env.KEYVAULT_URI);
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✅ Set' : '❌ Missing');
console.log('GROQ_API_KEY:', process.env.GROQ_API_KEY ? '✅ Set' : '❌ Missing');
console.log('PLANTNET_API_KEY:', process.env.PLANTNET_API_KEY ? '✅ Set' : '❌ Missing');
console.log('MONGODB_CONNECTION_STRING:', process.env.MONGODB_CONNECTION_STRING ? '✅ Set' : '❌ Missing');
console.log('======================================');
