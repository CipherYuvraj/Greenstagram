#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

const platforms = ['development', 'vercel', 'netlify', 'render', 'azure', 'aws'];

const setupEnvironment = async () => {
  console.log('🌱 Greenstagram Environment Setup');
  console.log('==================================\n');
  
  const platform = await question(`Select platform (${platforms.join(', ')}): `);
  
  if (!platforms.includes(platform)) {
    console.log('❌ Invalid platform selected');
    process.exit(1);
  }
  
  const templatePath = `.env.${platform}`;
  const envPath = '.env';
  
  if (!fs.existsSync(templatePath)) {
    console.log(`❌ Template file ${templatePath} not found`);
    process.exit(1);
  }
  
  console.log(`\n📋 Setting up environment for ${platform}...`);
  
  // Read template
  let envContent = fs.readFileSync(templatePath, 'utf8');
  
  // Interactive configuration
  if (platform !== 'development') {
    console.log('\n🔧 Please provide the following configuration values:');
    
    const mongoUri = await question('MongoDB URI: ');
    envContent = envContent.replace('your_production_mongodb_connection_string', mongoUri);
    
    const jwtSecret = await question('JWT Secret: ');
    envContent = envContent.replace('your_secure_jwt_secret', jwtSecret);
    
    const frontendUrl = await question('Frontend URL: ');
    envContent = envContent.replace(/https:\/\/your-[\w-]+\.(vercel\.app|netlify\.app|onrender\.com|azurestaticapps\.net|cloudfront\.net)/g, frontendUrl);
    
    const azureClientId = await question('Azure Client ID (optional): ');
    if (azureClientId) {
      envContent = envContent.replace('your_azure_client_id', azureClientId);
    }
    
    const groqApiKey = await question('GROQ API Key (optional): ');
    if (groqApiKey) {
      envContent = envContent.replace('your_groq_api_key', groqApiKey);
    }
  }
  
  // Write .env file
  fs.writeFileSync(envPath, envContent);
  console.log(`\n✅ Environment file created: ${envPath}`);
  
  // Update .gitignore if needed
  const gitignorePath = '.gitignore';
  if (fs.existsSync(gitignorePath)) {
    const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
    if (!gitignoreContent.includes('.env')) {
      fs.appendFileSync(gitignorePath, '\n# Environment variables\n.env\n.env.*\n');
      console.log('✅ Updated .gitignore to exclude environment files');
    }
  }
  
  console.log('\n🎉 Environment setup complete!');
  console.log(`📝 Review and update ${envPath} with your actual values before deployment.`);
  
  rl.close();
};

setupEnvironment().catch(console.error);