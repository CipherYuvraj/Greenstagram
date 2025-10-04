#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const log = (message, color = 'reset') => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

const validateJSON = (filePath) => {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    JSON.parse(content);
    return { valid: true, error: null };
  } catch (error) {
    return { valid: false, error: error.message };
  }
};

const validateTOML = (filePath) => {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    // Basic TOML validation - check for common syntax issues
    if (content.includes('[') && content.includes(']')) {
      return { valid: true, error: null };
    }
    return { valid: false, error: 'Invalid TOML format' };
  } catch (error) {
    return { valid: false, error: error.message };
  }
};

const validateYAML = (filePath) => {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    // Basic YAML validation - check for proper indentation and structure
    const lines = content.split('\n');
    let hasValidStructure = false;
    
    for (const line of lines) {
      if (line.trim() && (line.includes(':') || line.includes('-'))) {
        hasValidStructure = true;
        break;
      }
    }
    
    return { valid: hasValidStructure, error: hasValidStructure ? null : 'Invalid YAML structure' };
  } catch (error) {
    return { valid: false, error: error.message };
  }
};

const configFiles = [
  { path: 'vercel.json', type: 'json', platform: 'Vercel' },
  { path: 'netlify.toml', type: 'toml', platform: 'Netlify' },
  { path: 'render.yaml', type: 'yaml', platform: 'Render' },
  { path: 'staticwebapp.config.json', type: 'json', platform: 'Azure Static Web Apps' },
  { path: 'serverless.yml', type: 'yaml', platform: 'AWS Serverless' },
  { path: 'deployment.config.json', type: 'json', platform: 'Deployment Configuration' },
  { path: 'package.json', type: 'json', platform: 'Root Package' },
  { path: 'frontend/package.json', type: 'json', platform: 'Frontend Package' },
  { path: 'backend/package.json', type: 'json', platform: 'Backend Package' }
];

const validators = {
  json: validateJSON,
  toml: validateTOML,
  yaml: validateYAML
};

const main = () => {
  log('🔍 Validating Deployment Configuration Files...', 'cyan');
  log('==========================================', 'blue');
  
  let totalFiles = 0;
  let validFiles = 0;
  let errorFiles = [];

  for (const config of configFiles) {
    const filePath = config.path;
    totalFiles++;
    
    if (!fs.existsSync(filePath)) {
      log(`❌ ${config.platform}: ${filePath} - File not found`, 'red');
      errorFiles.push({ file: filePath, error: 'File not found' });
      continue;
    }

    const validator = validators[config.type];
    const result = validator(filePath);
    
    if (result.valid) {
      log(`✅ ${config.platform}: ${filePath} - Valid`, 'green');
      validFiles++;
    } else {
      log(`❌ ${config.platform}: ${filePath} - ${result.error}`, 'red');
      errorFiles.push({ file: filePath, error: result.error });
    }
  }

  log('', 'reset');
  log('📊 Validation Summary:', 'cyan');
  log(`Total files checked: ${totalFiles}`, 'blue');
  log(`Valid files: ${validFiles}`, 'green');
  log(`Invalid files: ${errorFiles.length}`, errorFiles.length > 0 ? 'red' : 'green');

  if (errorFiles.length > 0) {
    log('', 'reset');
    log('🚨 Files with errors:', 'yellow');
    errorFiles.forEach(error => {
      log(`  - ${error.file}: ${error.error}`, 'red');
    });
  }

  // Check deployment scripts
  log('', 'reset');
  log('🔧 Checking Deployment Scripts...', 'cyan');
  
  const deployScript = 'scripts/deploy.js';
  if (fs.existsSync(deployScript)) {
    log(`✅ Deployment script: ${deployScript} - Found`, 'green');
  } else {
    log(`❌ Deployment script: ${deployScript} - Not found`, 'red');
  }

  // Check environment examples
  log('', 'reset');
  log('🌐 Checking Environment Templates...', 'cyan');
  
  const envFiles = ['.env.example'];
  
  envFiles.forEach(envFile => {
    if (fs.existsSync(envFile)) {
      log(`✅ Environment template: ${envFile} - Found`, 'green');
    } else {
      log(`❌ Environment template: ${envFile} - Not found`, 'red');
    }
  });

  // Check GitHub Actions workflow
  log('', 'reset');
  log('🔄 Checking CI/CD Configuration...', 'cyan');
  
  const workflowPath = '.github/workflows/deploy.yml';
  if (fs.existsSync(workflowPath)) {
    const workflowResult = validateYAML(workflowPath);
    if (workflowResult.valid) {
      log(`✅ GitHub Actions: ${workflowPath} - Valid`, 'green');
    } else {
      log(`❌ GitHub Actions: ${workflowPath} - ${workflowResult.error}`, 'red');
    }
  } else {
    log(`❌ GitHub Actions: ${workflowPath} - Not found`, 'red');
  }

  log('', 'reset');
  if (errorFiles.length === 0) {
    log('🎉 All deployment configurations are valid!', 'green');
    log('🚀 Ready for deployment to any platform.', 'green');
  } else {
    log('⚠️  Some configuration files have issues.', 'yellow');
    log('🔧 Please fix the errors above before deploying.', 'yellow');
  }
};

main();