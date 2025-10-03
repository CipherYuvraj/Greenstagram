#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const requiredEnvVars = {
  frontend: [
    'VITE_API_URL',
    'VITE_APP_ENV',
  ],
  backend: [
    'MONGODB_URI',
    'JWT_SECRET',
    'NODE_ENV',
  ],
};

function validateEnvFile(envPath, requiredVars) {
  if (!fs.existsSync(envPath)) {
    console.error(`Error: ${envPath} does not exist`);
    return false;
  }

  const envConfig = dotenv.parse(fs.readFileSync(envPath));
  const missingVars = requiredVars.filter(varName => !envConfig[varName]);

  if (missingVars.length > 0) {
    console.error(`Missing required environment variables in ${envPath}:`);
    missingVars.forEach(varName => console.error(`- ${varName}`));
    return false;
  }

  return true;
}

function main() {
  let isValid = true;

  // Validate frontend environment
  console.log('Validating frontend environment variables...');
  if (!validateEnvFile(
    path.join(__dirname, '../frontend/.env'),
    requiredEnvVars.frontend
  )) {
    isValid = false;
  }

  // Validate backend environment
  console.log('\nValidating backend environment variables...');
  if (!validateEnvFile(
    path.join(__dirname, '../backend/.env'),
    requiredEnvVars.backend
  )) {
    isValid = false;
  }

  if (!isValid) {
    console.error('\nEnvironment validation failed!');
    process.exit(1);
  }

  console.log('\nAll environment variables are properly configured!');
}

main();
