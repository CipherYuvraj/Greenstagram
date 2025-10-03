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

const platforms = {
  vercel: {
    name: 'Vercel',
    frontend: {
      deploy: () => {
        log('Deploying frontend to Vercel...', 'cyan');
        execCommand('cd frontend && npx vercel --prod');
      }
    },
    backend: {
      deploy: () => {
        log('Deploying backend to Vercel...', 'cyan');
        execCommand('cd backend && npx vercel --prod');
      }
    }
  },
  netlify: {
    name: 'Netlify',
    frontend: {
      deploy: () => {
        log('Building and deploying frontend to Netlify...', 'cyan');
        execCommand('cd frontend && npm run build');
        execCommand('cd frontend && npx netlify deploy --prod --dir=build');
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
        log('Frontend deployment to Render requires git push to connected repository', 'yellow');
        log('Building frontend locally for verification...', 'cyan');
        execCommand('cd frontend && npm run build');
      }
    },
    backend: {
      deploy: () => {
        log('Backend deployment to Render requires git push to connected repository', 'yellow');
        log('Building backend locally for verification...', 'cyan');
        execCommand('cd backend && npm run build');
      }
    }
  },
  azure: {
    name: 'Azure',
    frontend: {
      deploy: () => {
        log('Deploying frontend to Azure Static Web Apps...', 'cyan');
        execCommand('cd frontend && npm run build');
        execCommand('az staticwebapp deploy --name greenstagram-frontend --source-location build --resource-group greenstagram-rg');
      }
    },
    backend: {
      deploy: () => {
        log('Deploying backend to Azure Web Service...', 'cyan');
        execCommand('cd backend && npm run build');
        execCommand('az webapp deploy --name greenstagram-backend --resource-group greenstagram-rg --src-path ./backend');
      }
    }
  },
  aws: {
    name: 'AWS',
    frontend: {
      deploy: () => {
        log('Deploying frontend to AWS S3 + CloudFront...', 'cyan');
        execCommand('cd frontend && npm run build');
        execCommand('aws s3 sync build/ s3://greenstagram-frontend --delete');
        execCommand('aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"');
      }
    },
    backend: {
      deploy: () => {
        log('Deploying backend to AWS Lambda...', 'cyan');
        execCommand('cd backend && npm run build');
        execCommand('serverless deploy');
      }
    }
  }
};

const validateEnvironment = (platform) => {
  const envFile = `.env.${platform}`;
  if (!fs.existsSync(envFile)) {
    log(`Warning: Environment file ${envFile} not found`, 'yellow');
    return false;
  }
  return true;
};

const buildAll = () => {
  log('Building all projects...', 'cyan');
  
  // Build backend
  log('Building backend...', 'blue');
  execCommand('cd backend && npm run build');
  
  // Build frontend
  log('Building frontend...', 'blue');
  execCommand('cd frontend && npm run build');
  
  log('Build completed successfully!', 'green');
};

const deployToTarget = (platform, target = 'both') => {
  if (!platforms[platform]) {
    log(`Error: Unknown platform '${platform}'`, 'red');
    log(`Available platforms: ${Object.keys(platforms).join(', ')}`, 'blue');
    process.exit(1);
  }

  log(`Deploying to ${platforms[platform].name}...`, 'green');
  
  // Validate environment
  validateEnvironment(platform);
  
  try {
    if (target === 'both' || target === 'backend') {
      platforms[platform].backend.deploy();
    }
    
    if (target === 'both' || target === 'frontend') {
      platforms[platform].frontend.deploy();
    }
    
    log(`Deployment to ${platforms[platform].name} completed!`, 'green');
  } catch (error) {
    log(`Deployment to ${platforms[platform].name} failed!`, 'red');
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

main();