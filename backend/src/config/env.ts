import path from 'path';
import dotenv from 'dotenv';
import fs from 'fs';

export function loadEnvironment(): void {
  // Possible .env file locations
  const envPaths = [
    path.resolve(__dirname, '../../.env'),          // backend/.env
    path.resolve(process.cwd(), '.env'),            // current working directory
    path.resolve(__dirname, '../.env'),             // src/.env
    path.resolve(__dirname, '../../../.env'),       // project root
  ];

  console.log('🔍 Searching for .env file...');
  
  let loaded = false;
  
  for (const envPath of envPaths) {
    console.log(`   Checking: ${envPath}`);
    
    if (fs.existsSync(envPath)) {
      console.log(`✅ Found .env file at: ${envPath}`);
      
      const result = dotenv.config({ path: envPath });
      
      if (result.error) {
        console.error(`❌ Error loading .env from ${envPath}:`, result.error);
        continue;
      }
      
      console.log(`✅ Successfully loaded .env from: ${envPath}`);
      loaded = true;
      break;
    }
  }
  
  if (!loaded) {
    console.warn('⚠️ No .env file found. Using system environment variables only.');
  }
  
  // Validate critical environment variables
  validateEnvironment();
}

function validateEnvironment(): void {
  const required = ['MONGODB_CONNECTION_STRING'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:', missing);
    console.error('💡 Please check your .env file or system environment variables');
  }
  
  console.log('📊 Environment Status:');
  console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
  console.log(`   PORT: ${process.env.PORT || 'not set'}`);
  console.log(`   MONGODB_CONNECTION_STRING: ${process.env.MONGODB_CONNECTION_STRING ? '✅ Set' : '❌ Missing'}`);
  console.log(`   REDIS_URL: ${process.env.REDIS_URL ? '✅ Set' : '⚠️  Not set (optional - caching disabled)'}`);
  console.log(`   AZURE_KEY_VAULT_URL: ${process.env.AZURE_KEY_VAULT_URL || 'not set'}`);
  console.log(`   JWT_SECRET: ${process.env.JWT_SECRET ? '✅ Set' : '❌ Missing'}`);
  
  // Validate Redis URL format if provided
  if (process.env.REDIS_URL) {
    validateRedisUrl(process.env.REDIS_URL);
  }
}

function validateRedisUrl(url: string): void {
  try {
    const parsed = new URL(url);
    
    if (!['redis:', 'rediss:'].includes(parsed.protocol)) {
      console.warn('⚠️  Redis URL Warning: Invalid protocol. Use redis:// or rediss:// (for TLS)');
      console.warn(`   Current: ${parsed.protocol}`);
    }
    
    if (!parsed.hostname) {
      console.warn('⚠️  Redis URL Warning: Missing hostname');
    }
    
    console.log(`   Redis Configuration:`);
    console.log(`     Protocol: ${parsed.protocol}`);
    console.log(`     Host: ${parsed.hostname}`);
    console.log(`     Port: ${parsed.port || '6379'}`);
    console.log(`     Auth: ${parsed.password ? '✅ Enabled' : '❌ Disabled'}`);
  } catch (error) {
    console.error('❌ Invalid REDIS_URL format');
    console.error('   Expected: redis://[username:password@]host[:port][/database]');
    console.error('   Examples:');
    console.error('     Local: redis://localhost:6379');
    console.error('     With Auth: redis://username:password@localhost:6379');
    console.error('     TLS: rediss://username:password@host:6380');
  }
}
