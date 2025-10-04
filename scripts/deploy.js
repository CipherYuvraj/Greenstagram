#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

const log = (message, color = 'reset') => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

const execCommand = (command, options = {}) => {
  try {
    log(`Executing: ${command}`, 'blue');
    return execSync(command, { stdio: 'inherit', ...options });
  } catch (error) {
    log(`Error executing command: ${command}`, 'red');
    throw error;
  }
};

const checkPrerequisites = (platform) => {
  log('Checking prerequisites...', 'cyan');
  
  // Check if required directories exist
  if (!fs.existsSync('frontend')) {
    throw new Error('Frontend directory not found');
  }
  if (!fs.existsSync('backend')) {
    throw new Error('Backend directory not found');
  }
  
  // Check if node_modules exist
  const requiredDirs = ['node_modules', 'frontend/node_modules', 'backend/node_modules'];
  for (const dir of requiredDirs) {
    if (!fs.existsSync(dir)) {
      log(`Warning: ${dir} not found. Running npm install...`, 'yellow');
      execCommand('npm run install:all');
      break;
    }
  }
  
  // Platform-specific checks
  if (platform === 'vercel' && !commandExists('vercel')) {
    log('Installing Vercel CLI...', 'yellow');
    execCommand('npm install -g vercel');
  }
  
  if (platform === 'netlify' && !commandExists('netlify')) {
    log('Installing Netlify CLI...', 'yellow');
    execCommand('npm install -g netlify-cli');
  }
  
  if (platform === 'azure' && !commandExists('az')) {
    log('Warning: Azure CLI not found. Please install it manually.', 'yellow');
  }
  
  if (platform === 'aws' && !commandExists('aws')) {
    log('Warning: AWS CLI not found. Please install it manually.', 'yellow');
  }
  
  log('Prerequisites check completed!', 'green');
};

const commandExists = (command) => {
  try {
    execSync(`which ${command}`, { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
};

const loadEnvironmentVariables = (platform) => {
  const envFile = `.env.${platform}`;
  if (fs.existsSync(envFile)) {
    log(`Loading environment variables from ${envFile}`, 'blue');
    require('dotenv').config({ path: envFile });
  } else {
    log(`Warning: Environment file ${envFile} not found`, 'yellow');
    // Load default .env if it exists
    if (fs.existsSync('.env')) {
      require('dotenv').config();
    }
  }
};

const platforms = {
  vercel: {
    name: 'Vercel',
    frontend: {
      deploy: () => {
        log('Deploying frontend to Vercel...', 'cyan');
        execCommand('cd frontend && npm run build');
        execCommand('cd frontend && npx vercel --prod --confirm');
      }
    },
    backend: {
      deploy: () => {
        log('Deploying backend to Vercel...', 'cyan');
        execCommand('cd backend && npm run build');
        execCommand('cd backend && npx vercel --prod --confirm');
      }
    }
  },
  netlify: {
    name: 'Netlify',
    frontend: {
      deploy: () => {
        log('Building and deploying frontend to Netlify...', 'cyan');
        execCommand('cd frontend && npm run build');
        execCommand('npx netlify deploy --prod --dir=frontend/build');
      }
    },
    backend: {
      deploy: () => {
        log('Deploying backend functions to Netlify...', 'cyan');
        execCommand('cd backend && npm run build');
        execCommand('npx netlify deploy --prod --functions=backend/dist');
      }
    }
  },
  render: {
    name: 'Render',
    frontend: {
      deploy: () => {
        log('Preparing frontend for Render deployment...', 'cyan');
        execCommand('cd frontend && npm run build');
        log('Frontend built successfully! Push to your connected Git repository to deploy on Render.', 'green');
      }
    },
    backend: {
      deploy: () => {
        log('Preparing backend for Render deployment...', 'cyan');
        execCommand('cd backend && npm run build');
        log('Backend built successfully! Push to your connected Git repository to deploy on Render.', 'green');
      }
    }
  },
  azure: {
    name: 'Azure Static Web Apps',
    frontend: {
      deploy: () => {
        log('Deploying to Azure Static Web Apps...', 'cyan');
        execCommand('cd frontend && npm run build');
        if (commandExists('az')) {
          execCommand('az staticwebapp deploy --name greenstagram --source-location frontend --output-location build');
        } else {
          log('Azure CLI not found. Please use the Azure portal or GitHub Actions for deployment.', 'yellow');
        }
      }
    },
    backend: {
      deploy: () => {
        log('Azure Static Web Apps includes API deployment with frontend.', 'blue');
      }
    }
  },
  aws: {
    name: 'AWS (Lambda + S3)',
    frontend: {
      deploy: () => {
        log('Deploying frontend to AWS S3...', 'cyan');
        execCommand('cd frontend && npm run build');
        if (commandExists('aws')) {
          // This would need to be configured with actual bucket name
          log('Please configure your S3 bucket name in the deployment script.', 'yellow');
          // execCommand('aws s3 sync frontend/build/ s3://your-bucket-name --delete');
        } else {
          log('AWS CLI not found. Please install and configure it first.', 'yellow');
        }
      }
    },
    backend: {
      deploy: () => {
        log('Deploying backend to AWS Lambda...', 'cyan');
        execCommand('cd backend && npm run build');
        if (commandExists('serverless')) {
          execCommand('npx serverless deploy');
        } else {
          log('Serverless framework not found. Installing...', 'yellow');
          execCommand('npm install -g serverless');
          execCommand('npx serverless deploy');
        }
      }
    }
  }
};

const validateEnvironment = (platform) => {
  const envFile = `.env.${platform}`;
  if (!fs.existsSync(envFile)) {
    log(`Warning: Environment file ${envFile} not found`, 'yellow');
    log(`Create ${envFile} with the required environment variables for ${platform}`, 'yellow');
    return false;
  }
  return true;
};

const buildAll = () => {
  log('Building all projects...', 'cyan');
  
  try {
    // Install dependencies if needed
    log('Installing dependencies...', 'blue');
    execCommand('npm run install:all');
    
    // Build backend
    log('Building backend...', 'blue');
    execCommand('cd backend && npm run build');
    
    // Build frontend
    log('Building frontend...', 'blue');
    execCommand('cd frontend && npm run build');
    
    log('Build completed successfully!', 'green');
  } catch (error) {
    log('Build failed!', 'red');
    process.exit(1);
  }
};

const deployToTarget = (platform, target = 'both') => {
  if (!platforms[platform]) {
    log(`Error: Unknown platform '${platform}'`, 'red');
    log(`Available platforms: ${Object.keys(platforms).join(', ')}`, 'blue');
    process.exit(1);
  }

  log(`Deploying to ${platforms[platform].name}...`, 'green');
  
  try {
    // Check prerequisites
    checkPrerequisites(platform);
    
    // Load environment variables
    loadEnvironmentVariables(platform);
    
    // Validate environment
    validateEnvironment(platform);
    
    if (target === 'both' || target === 'backend') {
      platforms[platform].backend.deploy();
    }
    
    if (target === 'both' || target === 'frontend') {
      platforms[platform].frontend.deploy();
    }
    
    log(`Deployment to ${platforms[platform].name} completed!`, 'green');
  } catch (error) {
    log(`Deployment to ${platforms[platform].name} failed!`, 'red');
    log(`Error: ${error.message}`, 'red');
    process.exit(1);
  }
};

const showHelp = () => {
  log('Greenstagram Deployment Script', 'green');
  log('Usage: npm run deploy [platform] [target]', 'blue');
  log('');
  log('Platforms:', 'yellow');
  Object.keys(platforms).forEach(platform => {
    log(`  ${platform} - ${platforms[platform].name}`, 'white');
  });
  log('');
  log('Targets:', 'yellow');
  log('  both (default) - Deploy both frontend and backend', 'white');
  log('  frontend - Deploy only frontend', 'white');
  log('  backend - Deploy only backend', 'white');
  log('');
  log('Examples:', 'yellow');
  log('  npm run deploy vercel', 'white');
  log('  npm run deploy netlify frontend', 'white');
  log('  npm run deploy azure backend', 'white');
  log('');
  log('Special commands:', 'yellow');
  log('  npm run deploy build - Build all projects without deploying', 'white');
  log('  npm run deploy help - Show this help message', 'white');
  log('');
  log('Environment Variables:', 'yellow');
  log('  Create .env.[platform] files for platform-specific configuration', 'white');
  log('  Example: .env.vercel, .env.netlify, .env.aws', 'white');
};

// Main execution
const main = () => {
  const args = process.argv.slice(2);
  const command = args[0] || 'help';
  const target = args[1] || 'both';

  if (command === 'help' || command === '-h' || command === '--help') {
    showHelp();
    return;
  }

  if (command === 'build') {
    buildAll();
    return;
  }

  if (!platforms[command]) {
    log(`Error: Unknown command '${command}'`, 'red');
    showHelp();
    process.exit(1);
  }

  deployToTarget(command, target);
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  log('Unhandled Rejection at:', 'red');
  console.log(promise);
  log('Reason:', 'red');
  console.log(reason);
  process.exit(1);
});

main();