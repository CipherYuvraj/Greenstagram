#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Required tools
const requiredTools = [
  { name: 'node', versionCommand: 'node --version', minVersion: 'v18.0.0' },
  { name: 'npm', versionCommand: 'npm --version', minVersion: '9.0.0' },
  { name: 'git', versionCommand: 'git --version', minVersion: '2.0.0' },
];

// Required environment variables
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

function checkVersion(current, required) {
  const clean = v => v.replace(/[^\d.]/g, '');
  return clean(current) >= clean(required);
}

function checkTool(tool) {
  try {
    const version = execSync(tool.versionCommand).toString().trim();
    const isValid = checkVersion(version, tool.minVersion);
    console.log(`✓ ${tool.name}: ${version} ${isValid ? '(OK)' : '(Outdated)'}`);
    return isValid;
  } catch (error) {
    console.error(`✗ ${tool.name}: Not found`);
    return false;
  }
}

function checkEnvFile(envPath, requiredVars) {
  if (!fs.existsSync(envPath)) {
    console.error(`✗ Missing .env file: ${envPath}`);
    return false;
  }

  const envContent = fs.readFileSync(envPath, 'utf8');
  const missingVars = [];

  for (const variable of requiredVars) {
    if (!envContent.includes(variable)) {
      missingVars.push(variable);
    }
  }

  if (missingVars.length > 0) {
    console.error(`✗ Missing environment variables in ${envPath}:`);
    missingVars.forEach(v => console.error(`  - ${v}`));
    return false;
  }

  console.log(`✓ Environment file ${envPath} OK`);
  return true;
}

function main() {
  console.log('Running development environment health check...\n');

  // Check required tools
  console.log('Checking required tools:');
  const toolsOk = requiredTools.every(checkTool);

  console.log('\nChecking environment files:');
  // Check frontend .env
  const frontendEnvOk = checkEnvFile(
    path.join(__dirname, '../frontend/.env'),
    requiredEnvVars.frontend
  );

  // Check backend .env
  const backendEnvOk = checkEnvFile(
    path.join(__dirname, '../backend/.env'),
    requiredEnvVars.backend
  );

  // Check dependencies
  console.log('\nChecking dependencies:');
  try {
    execSync('npm list', { stdio: 'ignore' });
    console.log('✓ All dependencies are installed correctly');
  } catch (error) {
    console.error('✗ Dependency issues detected. Run npm install to fix.');
  }

  // Final status
  const allChecksPass = toolsOk && frontendEnvOk && backendEnvOk;
  console.log('\nHealth Check Summary:');
  console.log(allChecksPass ? '✓ All checks passed!' : '✗ Some checks failed');
  
  process.exit(allChecksPass ? 0 : 1);
}

main();
