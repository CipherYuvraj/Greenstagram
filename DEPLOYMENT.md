# 🚀 Greenstagram Deployment Guide

<div align="center">

![Greenstagram Logo](logo.png)

**Comprehensive Deployment Documentation**

*Deploy your eco-focused social media platform to any cloud provider*

[![Build Status](https://github.com/adity1raut/Greenstagram/actions/workflows/deploy.yml/badge.svg)](https://github.com/adity1raut/Greenstagram/actions)

[📚 Main Documentation](README.md) • [🐛 Issues](https://github.com/adity1raut/Greenstagram/issues) • [💡 Discussions](https://github.com/adity1raut/Greenstagram/discussions)

</div>

---

## 📋 Table of Contents

- [🎯 Overview](#-overview)
- [🔧 Prerequisites](#-prerequisites)
- [⚡ Quick Deployment](#-quick-deployment)
- [🌐 Platform-Specific Deployments](#-platform-specific-deployments)
  - [🚀 Vercel](#-vercel-deployment)
  - [🌐 Netlify](#-netlify-deployment)
  - [🔧 Render](#-render-deployment)
  - [☁️ Azure](#️-azure-deployment)
  - [🔗 AWS](#-aws-deployment)
- [🔐 Environment Configuration](#-environment-configuration)
- [📊 CI/CD Pipeline](#-cicd-pipeline)
- [🔍 Deployment Verification](#-deployment-verification)
- [🆘 Troubleshooting](#-troubleshooting)
- [🔄 Rollback Strategies](#-rollback-strategies)
- [📈 Monitoring & Alerts](#-monitoring--alerts)

---

## 🎯 Overview

Greenstagram is designed to be deployed on multiple cloud platforms with minimal configuration. This guide covers deployment strategies for all major cloud providers, ensuring you can choose the best option for your needs.

### 🏗️ Architecture Overview

```mermaid
graph TB
    subgraph "🌐 Frontend (React + TypeScript)"
        A[Vite Build] --> B[Static Assets]
        B --> C[Progressive Web App]
    end
    
    subgraph "⚙️ Backend (Node.js + Express)"
        D[TypeScript API] --> E[JWT Authentication]
        E --> F[Socket.io Real-time]
        F --> G[Express Middleware]
    end
    
    subgraph "💾 Database Layer"
        H[MongoDB Atlas] --> I[Redis Cache]
        I --> J[File Storage]
    end
    
    subgraph "🤖 External Services"
        K[PlantNet API] --> L[Groq AI API]
        L --> M[Azure Key Vault]
    end
    
    A --> D
    D --> H
    D --> K
```

### 📊 Supported Platforms

| Platform | Frontend | Backend | Database | Cost | Best For |
|----------|----------|---------|----------|------|----------|
| 🚀 **Vercel** | ✅ Static + SSR | ✅ Serverless Functions | External | Free tier | Modern web apps |
| 🌐 **Netlify** | ✅ JAMstack | ✅ Edge Functions | External | Free tier | Static sites + APIs |
| 🔧 **Render** | ✅ Static Sites | ✅ Web Services | ✅ PostgreSQL | Free tier | Full-stack apps |
| ☁️ **Azure** | ✅ Static Web Apps | ✅ App Service | ✅ Cosmos DB | Pay-as-you-go | Enterprise solutions |
| 🔗 **AWS** | ✅ S3 + CloudFront | ✅ Lambda | ✅ DocumentDB | Pay-as-you-go | Scalable applications |

---

## 🔧 Prerequisites

### 📋 System Requirements

- **Node.js**: v18.0.0 or higher
- **npm**: v8.0.0 or higher
- **Git**: Latest version
- **MongoDB Atlas**: Free tier account
- **Redis**: Cloud instance or local installation

### 🔍 Pre-deployment Checklist

<details>
<summary>✅ Essential Requirements</summary>

- [ ] **Source Code Ready**
  ```bash
  git clone https://github.com/adity1raut/Greenstagram.git
  cd Greenstagram
  ```

- [ ] **Dependencies Installed**
  ```bash
  npm run install:all
  ```

- [ ] **Environment Variables Configured**
  ```bash
  cp backend/.env.example backend/.env
  cp frontend/.env.example frontend/.env
  ```

- [ ] **Build Tests Passing**
  ```bash
  npm run build
  npm test
  ```

- [ ] **Database Connection Working**
  ```bash
  npm run health-check
  ```

</details>

### 🔐 Required Accounts & Services

<details>
<summary>🌐 External Service Accounts</summary>

| Service | Purpose | Required | Free Tier |
|---------|---------|----------|-----------|
| **MongoDB Atlas** | Primary Database | ✅ Yes | 512MB |
| **Redis Cloud** | Caching Layer | ✅ Yes | 30MB |
| **PlantNet** | Plant Identification | 🔶 Optional | 500 requests/day |
| **Groq** | AI Quote Generation | 🔶 Optional | Limited requests |
| **Cloudinary** | Image Storage | 🔶 Optional | 25GB |

**Setup Links:**
- [MongoDB Atlas](https://www.mongodb.com/atlas) - Database hosting
- [Redis Cloud](https://redis.com/try-free/) - Caching service
- [PlantNet API](https://my.plantnet.org/) - Plant identification
- [Groq Console](https://console.groq.com/) - AI API access
- [Cloudinary](https://cloudinary.com/) - Media management

</details>

---

## ⚡ Quick Deployment

### 🎯 One-Command Deployment

Deploy to your preferred platform with a single command:

```bash
# Interactive deployment wizard
npm run deploy

# Platform-specific deployment
npm run deploy:vercel
npm run deploy:netlify
npm run deploy:render
npm run deploy:azure
npm run deploy:aws
```

### 🔧 Automated Setup

```bash
# 1. Clone and setup
git clone https://github.com/adity1raut/Greenstagram.git
cd Greenstagram

# 2. Install dependencies
npm run install:all

# 3. Environment setup wizard
npm run setup:env

# 4. Choose deployment platform
npm run deploy
```

---

## 🌐 Platform-Specific Deployments

## 🚀 Vercel Deployment

### 🎯 Why Choose Vercel?

- ⚡ **Lightning Fast**: Global edge network
- 🔄 **Zero Config**: Auto-detects framework
- 🌐 **Serverless**: Automatic scaling
- 🆓 **Generous Free Tier**: Perfect for hobby projects

### 📝 Step-by-Step Deployment

<details>
<summary>🔧 Method 1: Vercel CLI (Recommended)</summary>

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Login to Vercel
vercel login

# 3. Deploy from root directory
vercel

# 4. Follow prompts:
# ? Set up and deploy "~/Greenstagram"? [Y/n] y
# ? Which scope do you want to deploy to? [your-username]
# ? Link to existing project? [y/N] n
# ? What's your project's name? greenstagram
# ? In which directory is your code located? ./
```

**Advanced Configuration:**
```bash
# Deploy with custom settings
vercel --prod --regions sfo1,lhr1 --env NODE_ENV=production
```

</details>

<details>
<summary>🌐 Method 2: GitHub Integration</summary>

1. **Connect Repository**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository

2. **Configure Build Settings**
   ```json
   {
     "buildCommand": "npm run build",
     "outputDirectory": "frontend/build",
     "installCommand": "npm run install:all",
     "devCommand": "npm run dev"
   }
   ```

3. **Set Environment Variables**
   - Navigate to Project Settings → Environment Variables
   - Add all required variables from the [environment section](#-environment-configuration)

</details>

### 🔧 Vercel Configuration

<details>
<summary>📄 vercel.json Configuration</summary>

```json
{
  "version": 2,
  "projects": [
    {
      "name": "greenstagram-frontend",
      "source": "frontend",
      "framework": "vite",
      "buildCommand": "npm run build",
      "outputDirectory": "build",
      "installCommand": "npm install",
      "devCommand": "npm run dev",
      "env": {
        "VITE_API_URL": "@api_url",
        "VITE_APP_ENV": "@app_env"
      }
    },
    {
      "name": "greenstagram-backend", 
      "source": "backend",
      "runtime": "nodejs18.x",
      "buildCommand": "npm run build",
      "installCommand": "npm install",
      "functions": {
        "backend/dist/**/*.js": {
          "runtime": "nodejs18.x"
        }
      },
      "env": {
        "NODE_ENV": "@node_env",
        "MONGODB_URI": "@mongodb_uri",
        "JWT_SECRET": "@jwt_secret",
        "AZURE_CLIENT_ID": "@azure_client_id",
        "AZURE_CLIENT_SECRET": "@azure_client_secret",
        "AZURE_TENANT_ID": "@azure_tenant_id",
        "REDIS_URL": "@redis_url"
      }
    }
  ],
  "build": {
    "env": {
      "NODE_VERSION": "18"
    }
  }
}
```

</details>

### 🔐 Environment Variables for Vercel

```bash
# Essential Variables
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/greenstagram
JWT_SECRET=your-super-secure-jwt-secret
NODE_ENV=production

# Azure Integration
AZURE_CLIENT_ID=your-azure-client-id
AZURE_CLIENT_SECRET=your-azure-client-secret
AZURE_TENANT_ID=your-azure-tenant-id
AZURE_KEY_VAULT_URL=https://your-keyvault.vault.azure.net/

# AI Services
GROQ_API_KEY=gsk_your-groq-api-key
PLANTNET_API_KEY=your-plantnet-api-key

# Frontend Configuration
VITE_API_URL=https://your-backend.vercel.app
VITE_APP_ENV=production
```

---

## 🌐 Netlify Deployment

### 🎯 Why Choose Netlify?

- 🔄 **Git-based Workflow**: Automatic deployments on push
- 🌍 **Global CDN**: Fast content delivery
- 🔧 **Edge Functions**: Serverless backend capabilities
- 📱 **Form Handling**: Built-in form processing

### 📝 Step-by-Step Deployment

<details>
<summary>🔧 Method 1: Netlify CLI</summary>

```bash
# 1. Install Netlify CLI
npm install -g netlify-cli

# 2. Login to Netlify
netlify login

# 3. Initialize site
netlify init

# 4. Deploy
netlify deploy --prod

# 5. Configure functions
netlify functions:build
```

</details>

<details>
<summary>🌐 Method 2: Git Integration</summary>

1. **Connect Repository**
   - Go to [Netlify Dashboard](https://app.netlify.com/)
   - Click "New site from Git"
   - Choose your repository

2. **Configure Build Settings**
   ```yaml
   # Build settings
   Base directory: frontend
   Build command: npm run build
   Publish directory: frontend/build
   ```

3. **Deploy Settings**
   ```yaml
   # netlify.toml
   [build]
     base = "frontend"
     publish = "build" 
     command = "npm run build"

   [build.environment]
     NODE_VERSION = "18"
     VITE_API_URL = "https://api.greenstagram.netlify.app/.netlify/functions"

   [[redirects]]
     from = "/api/*"
     to = "/.netlify/functions/:splat"
     status = 200

   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200

   [functions]
     directory = "backend/dist"
     node_bundler = "esbuild"
   ```

</details>

### 🔧 Netlify Edge Functions

<details>
<summary>⚡ Setting up Serverless Functions</summary>

```javascript
// netlify/functions/api.js
exports.handler = async (event, context) => {
  const { path, httpMethod, headers, body } = event;
  
  // Import your Express app
  const app = require('../../backend/dist/index.js');
  
  return new Promise((resolve, reject) => {
    const res = {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE'
      },
      body: ''
    };
    
    // Handle the request
    app.handle(event, res, resolve);
  });
};
```

</details>

---

## 🔧 Render Deployment

### 🎯 Why Choose Render?

- 🆓 **Free Tier**: No credit card required
- 🔄 **Auto-deploys**: GitHub integration
- 🗄️ **Managed Databases**: PostgreSQL, Redis included
- 🔒 **SSL by Default**: Automatic HTTPS

### 📝 Step-by-Step Deployment

<details>
<summary>🌐 Web Service Deployment</summary>

1. **Create Render Account**
   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Sign up with GitHub

2. **Deploy Backend Service**
   ```yaml
   # render.yaml
   services:
     - type: web
       name: greenstagram-backend
       env: node
       buildCommand: cd backend && npm install && npm run build
       startCommand: cd backend && npm start
       envVars:
         - key: NODE_ENV
           value: production
         - key: PORT
           value: 10000
   ```

3. **Deploy Frontend**
   ```yaml
   services:
     - type: web
       name: greenstagram-frontend
       env: static
       buildCommand: cd frontend && npm install && npm run build
       staticPublishPath: frontend/build
   ```

</details>

<details>
<summary>🗄️ Database Setup</summary>

```yaml
# Add to render.yaml
databases:
  - name: greenstagram-redis
    type: redis
    plan: starter
    
  - name: greenstagram-postgres
    type: postgresql
    plan: starter
    databaseName: greenstagram
    user: admin
```

</details>

---

## ☁️ Azure Deployment

### 🎯 Why Choose Azure?

- 🏢 **Enterprise Ready**: Comprehensive cloud services
- 🔐 **Advanced Security**: Azure Key Vault, AD integration
- 📊 **Rich Monitoring**: Application Insights, Azure Monitor
- 🌍 **Global Scale**: Worldwide data centers

### 📝 Step-by-Step Deployment

<details>
<summary>🔧 Azure CLI Setup</summary>

```bash
# 1. Install Azure CLI
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash

# 2. Login to Azure
az login

# 3. Create resource group
az group create --name greenstagram-rg --location eastus

# 4. Create App Service plan
az appservice plan create \
  --name greenstagram-plan \
  --resource-group greenstagram-rg \
  --sku B1 \
  --is-linux

# 5. Create web app for backend
az webapp create \
  --resource-group greenstagram-rg \
  --plan greenstagram-plan \
  --name greenstagram-api \
  --runtime "NODE|18-lts"

# 6. Create static web app for frontend
az staticwebapp create \
  --name greenstagram-frontend \
  --resource-group greenstagram-rg \
  --source https://github.com/adity1raut/Greenstagram \
  --location "East US 2" \
  --branch main \
  --app-location "frontend" \
  --output-location "build"
```

</details>

<details>
<summary>🔐 Azure Key Vault Setup</summary>

```bash
# 1. Create Key Vault
az keyvault create \
  --name greenstagram-kv \
  --resource-group greenstagram-rg \
  --location eastus

# 2. Enable system identity for web app
az webapp identity assign \
  --name greenstagram-api \
  --resource-group greenstagram-rg

# 3. Grant access to Key Vault
az keyvault set-policy \
  --name greenstagram-kv \
  --object-id <webapp-identity-object-id> \
  --secret-permissions get list

# 4. Add secrets
az keyvault secret set --vault-name greenstagram-kv --name "jwt-secret" --value "your-jwt-secret"
az keyvault secret set --vault-name greenstagram-kv --name "mongodb-uri" --value "your-mongodb-connection"
```

</details>

<details>
<summary>📊 Application Insights Setup</summary>

```bash
# Create Application Insights
az monitor app-insights component create \
  --app greenstagram-insights \
  --location eastus \
  --resource-group greenstagram-rg \
  --application-type web

# Configure app service
az webapp config appsettings set \
  --name greenstagram-api \
  --resource-group greenstagram-rg \
  --settings APPLICATIONINSIGHTS_CONNECTION_STRING="<connection-string>"
```

</details>

### 🔧 Azure Configuration Files

<details>
<summary>📄 staticwebapp.config.json</summary>

```json
{
  "routes": [
    {
      "route": "/api/*",
      "methods": ["GET", "POST", "PUT", "DELETE"],
      "allowedRoles": ["anonymous"]
    },
    {
      "route": "/admin/*",
      "allowedRoles": ["admin"]
    }
  ],
  "navigationFallback": {
    "rewrite": "/index.html",
    "exclude": ["/api/*", "/*.{css,scss,js,png,gif,ico,jpg,svg}"]
  },
  "mimeTypes": {
    ".json": "text/json"
  },
  "globalHeaders": {
    "X-Frame-Options": "DENY",
    "X-Content-Type-Options": "nosniff"
  }
}
```

</details>

---

## 🔗 AWS Deployment

### 🎯 Why Choose AWS?

- 🌍 **Global Leader**: Most comprehensive cloud platform
- 🔧 **Flexible**: Infinite configuration options
- 📈 **Scalable**: Handle any traffic load
- 🔒 **Secure**: Advanced security features

### 📝 Step-by-Step Deployment

<details>
<summary>🔧 AWS CLI Setup</summary>

```bash
# 1. Install AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# 2. Configure AWS credentials
aws configure
# AWS Access Key ID: [Your Access Key]
# AWS Secret Access Key: [Your Secret Key]
# Default region name: us-east-1
# Default output format: json

# 3. Install Serverless Framework
npm install -g serverless
```

</details>

<details>
<summary>⚡ Serverless Backend Deployment</summary>

```yaml
# serverless.yml
service: greenstagram-backend

provider:
  name: aws
  runtime: nodejs18.x
  region: us-east-1
  environment:
    NODE_ENV: production
    MONGODB_URI: ${env:MONGODB_URI}
    JWT_SECRET: ${env:JWT_SECRET}

functions:
  api:
    handler: dist/index.handler
    events:
      - http:
          path: /{proxy+}
          method: ANY
          cors: true

plugins:
  - serverless-offline
  - serverless-dotenv-plugin

custom:
  dotenv:
    path: .env
```

```bash
# Deploy backend
cd backend
serverless deploy
```

</details>

<details>
<summary>🌐 S3 + CloudFront Frontend</summary>

```bash
# 1. Create S3 bucket
aws s3 mb s3://greenstagram-frontend-bucket

# 2. Enable static website hosting
aws s3 website s3://greenstagram-frontend-bucket \
  --index-document index.html \
  --error-document error.html

# 3. Build and upload frontend
cd frontend
npm run build
aws s3 sync build/ s3://greenstagram-frontend-bucket

# 4. Create CloudFront distribution
aws cloudfront create-distribution \
  --distribution-config file://cloudfront-config.json
```

</details>

---

## 🔐 Environment Configuration

### 📋 Environment Variables Overview

<details>
<summary>🔧 Backend Environment Variables</summary>

```bash
# ===========================================
# 🌟 ESSENTIAL CONFIGURATION
# ===========================================

# 🔗 Database Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/greenstagram
JWT_SECRET=your-super-secure-jwt-secret-minimum-32-characters
BCRYPT_ROUNDS=12

# 🚀 Server Configuration
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://your-frontend-url.com

# ===========================================
# ☁️ AZURE SERVICES (Optional)
# ===========================================
AZURE_KEY_VAULT_URL=https://your-keyvault.vault.azure.net/
AZURE_TENANT_ID=your-azure-tenant-id
AZURE_CLIENT_ID=your-azure-client-id
AZURE_CLIENT_SECRET=your-azure-client-secret

# ===========================================
# 🤖 AI SERVICES (Optional)
# ===========================================
GROQ_API_KEY=gsk_your-groq-api-key-here
PLANTNET_API_KEY=your-plantnet-api-key

# ===========================================
# 💾 CACHING (Optional but Recommended)
# ===========================================
REDIS_URL=redis://localhost:6379
CACHE_TTL=3600

# ===========================================
# 📧 EMAIL SERVICES (Optional)
# ===========================================
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# ===========================================
# 📱 MEDIA STORAGE (Optional)
# ===========================================
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# ===========================================
# 🔒 SECURITY & RATE LIMITING
# ===========================================
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
SESSION_TIMEOUT=1800
```

</details>

<details>
<summary>🎨 Frontend Environment Variables</summary>

```bash
# ===========================================
# 🌐 API CONFIGURATION
# ===========================================
VITE_API_URL=https://your-backend-url.com
VITE_SOCKET_URL=https://your-backend-url.com

# ===========================================
# 🎯 APP CONFIGURATION
# ===========================================
VITE_APP_ENV=production
VITE_APP_VERSION=1.0.0
VITE_APP_NAME=Greenstagram

# ===========================================
# 🤖 AI FEATURES (Client-side)
# ===========================================
VITE_ENABLE_PLANT_ID=true
VITE_ENABLE_AI_QUOTES=true

# ===========================================
# 📊 ANALYTICS (Optional)
# ===========================================
VITE_GOOGLE_ANALYTICS_ID=GA_MEASUREMENT_ID
VITE_HOTJAR_ID=your-hotjar-id

# ===========================================
# 🌍 PWA CONFIGURATION
# ===========================================
VITE_PWA_SHORT_NAME=Greenstagram
VITE_PWA_NAME=Greenstagram - Eco Social Platform
VITE_PWA_DESCRIPTION=Connect with eco-warriors worldwide
```

</details>

### 🛠️ Platform-Specific Environment Setup

<details>
<summary>🚀 Vercel Environment Variables</summary>

**Add in Vercel Dashboard:**
```bash
# Project Settings → Environment Variables

# Production Environment
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-jwt-secret
AZURE_CLIENT_ID=your-azure-client-id
AZURE_CLIENT_SECRET=your-azure-client-secret
AZURE_TENANT_ID=your-azure-tenant-id
REDIS_URL=your-redis-url
GROQ_API_KEY=your-groq-key
PLANTNET_API_KEY=your-plantnet-key

# Frontend Variables
VITE_API_URL=https://your-backend.vercel.app
VITE_APP_ENV=production
```

</details>

<details>
<summary>🌐 Netlify Environment Variables</summary>

**Add in Netlify Dashboard:**
```bash
# Site Settings → Environment Variables

NODE_ENV=production
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-jwt-secret
VITE_API_URL=https://your-site.netlify.app/.netlify/functions
VITE_APP_ENV=production
```

</details>

<details>
<summary>🔧 Render Environment Variables</summary>

**Add in Render Dashboard:**
```bash
# Service Settings → Environment

NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-jwt-secret
VITE_API_URL=https://your-backend.onrender.com
```

</details>

---

## 📊 CI/CD Pipeline

### 🔄 GitHub Actions Workflow

<details>
<summary>🚀 Complete CI/CD Pipeline</summary>

```yaml
# .github/workflows/deploy.yml
name: 🚀 Deploy Greenstagram

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

env:
  NODE_VERSION: '18'

jobs:
  test:
    name: 🧪 Test & Lint
    runs-on: ubuntu-latest
    
    steps:
    - name: 📥 Checkout code
      uses: actions/checkout@v4
      
    - name: 📦 Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: ${{ env.NODE_VERSION }}
        cache: 'npm'
        
    - name: 📂 Install dependencies
      run: npm run install:all
      
    - name: 🔍 Lint code
      run: |
        cd backend && npm run lint
        cd ../frontend && npm run lint
        
    - name: 🧪 Run tests
      run: |
        cd backend && npm test
        cd ../frontend && npm test
        
    - name: 🏗️ Test build
      run: npm run build

  deploy-vercel:
    name: 🚀 Deploy to Vercel
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - name: 📥 Checkout code
      uses: actions/checkout@v4
      
    - name: 🚀 Deploy to Vercel
      uses: amondnet/vercel-action@v25
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-args: '--prod'
        vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
        vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}

  deploy-netlify:
    name: 🌐 Deploy to Netlify
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - name: 📥 Checkout code
      uses: actions/checkout@v4
      
    - name: 📦 Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: ${{ env.NODE_VERSION }}
        
    - name: 📂 Install dependencies
      run: cd frontend && npm ci
      
    - name: 🏗️ Build frontend
      run: cd frontend && npm run build
      env:
        VITE_API_URL: ${{ secrets.NETLIFY_API_URL }}
        
    - name: 🌐 Deploy to Netlify
      uses: nwtgck/actions-netlify@v3.0
      with:
        publish-dir: './frontend/build'
        production-branch: main
        github-token: ${{ secrets.GITHUB_TOKEN }}
        deploy-message: "🚀 Deploy from GitHub Actions"
      env:
        NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
        NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}

  deploy-azure:
    name: ☁️ Deploy to Azure
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - name: 📥 Checkout code
      uses: actions/checkout@v4
      
    - name: 🔐 Azure Login
      uses: azure/login@v1
      with:
        creds: ${{ secrets.AZURE_CREDENTIALS }}
        
    - name: 🏗️ Build backend
      run: |
        cd backend
        npm ci
        npm run build
        
    - name: ☁️ Deploy to Azure App Service
      uses: azure/webapps-deploy@v2
      with:
        app-name: 'greenstagram-api'
        package: backend
        
    - name: 🌐 Deploy to Azure Static Web Apps
      uses: Azure/static-web-apps-deploy@v1
      with:
        azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
        repo_token: ${{ secrets.GITHUB_TOKEN }}
        action: "upload"
        app_location: "frontend"
        output_location: "build"

  health-check:
    name: 🏥 Health Check
    needs: [deploy-vercel, deploy-netlify, deploy-azure]
    runs-on: ubuntu-latest
    if: always() && github.ref == 'refs/heads/main'
    
    steps:
    - name: 🔍 Check Vercel deployment
      run: |
        curl -f ${{ secrets.VERCEL_URL }}/health || exit 1
        
    - name: 🔍 Check Netlify deployment
      run: |
        curl -f ${{ secrets.NETLIFY_URL }}/health || exit 1
        
    - name: 🔍 Check Azure deployment
      run: |
        curl -f ${{ secrets.AZURE_URL }}/health || exit 1
        
    - name: 📧 Notify on failure
      if: failure()
      uses: 8398a7/action-slack@v3
      with:
        status: failure
        text: "🚨 Deployment health check failed!"
      env:
        SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```

</details>

### 🔐 Required Secrets

<details>
<summary>🔑 GitHub Secrets Configuration</summary>

**Add in GitHub Repository Settings → Secrets and variables → Actions:**

```bash
# Vercel Secrets
VERCEL_TOKEN=your-vercel-token
VERCEL_ORG_ID=your-org-id
VERCEL_PROJECT_ID=your-project-id
VERCEL_URL=https://your-app.vercel.app

# Netlify Secrets
NETLIFY_AUTH_TOKEN=your-netlify-token
NETLIFY_SITE_ID=your-site-id
NETLIFY_URL=https://your-app.netlify.app
NETLIFY_API_URL=https://your-app.netlify.app/.netlify/functions

# Azure Secrets
AZURE_CREDENTIALS={"clientId":"...","clientSecret":"...","subscriptionId":"...","tenantId":"..."}
AZURE_STATIC_WEB_APPS_API_TOKEN=your-static-web-apps-token
AZURE_URL=https://your-app.azurewebsites.net

# AWS Secrets (if using)
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1

# Application Secrets
JWT_SECRET=your-jwt-secret
MONGODB_URI=your-mongodb-connection
GROQ_API_KEY=your-groq-key
PLANTNET_API_KEY=your-plantnet-key

# Notification Secrets (optional)
SLACK_WEBHOOK_URL=your-slack-webhook
```

</details>

---

## 🔍 Deployment Verification

### ✅ Post-Deployment Checklist

<details>
<summary>🔍 Frontend Verification</summary>

```bash
# 1. Check if frontend loads
curl -I https://your-frontend-url.com
# Expected: HTTP/2 200

# 2. Verify routing works
curl -I https://your-frontend-url.com/login
curl -I https://your-frontend-url.com/profile
# Expected: HTTP/2 200 (not 404)

# 3. Check static assets
curl -I https://your-frontend-url.com/static/css/main.css
curl -I https://your-frontend-url.com/static/js/main.js
# Expected: HTTP/2 200

# 4. Verify PWA manifest
curl -I https://your-frontend-url.com/manifest.json
# Expected: HTTP/2 200
```

</details>

<details>
<summary>⚙️ Backend Verification</summary>

```bash
# 1. Health check endpoint
curl https://your-backend-url.com/health
# Expected: {"status":"ok","timestamp":"..."}

# 2. API endpoints
curl https://your-backend-url.com/api/posts/trending
# Expected: {"success":true,"data":[...]}

# 3. Authentication endpoint
curl -X POST https://your-backend-url.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass"}'
# Expected: {"success":true,"token":"..."}

# 4. Database connectivity
curl https://your-backend-url.com/api/health/db
# Expected: {"database":"connected","status":"ok"}
```

</details>

<details>
<summary>🤖 AI Services Verification</summary>

```bash
# 1. Test quote generation
curl -X POST https://your-backend-url.com/api/ai/quote \
  -H "Authorization: Bearer your-token" \
  -H "Content-Type: application/json" \
  -d '{"theme":"sustainability"}'
# Expected: {"success":true,"quote":"..."}

# 2. Test plant identification (if configured)
curl -X POST https://your-backend-url.com/api/ai/plant-identify \
  -H "Authorization: Bearer your-token" \
  -H "Content-Type: multipart/form-data" \
  -F "image=@test-plant.jpg"
# Expected: {"success":true,"species":"..."}
```

</details>

### 📊 Performance Testing

<details>
<summary>⚡ Automated Performance Tests</summary>

```bash
# Install testing tools
npm install -g lighthouse artillery

# 1. Lighthouse audit
lighthouse https://your-frontend-url.com --output=json --output-path=./lighthouse-report.json

# 2. Load testing with Artillery
# artillery.yml
config:
  target: 'https://your-backend-url.com'
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - name: "API Load Test"
    requests:
      - get:
          url: "/api/posts/trending"
      - post:
          url: "/api/auth/login"
          json:
            email: "test@example.com"
            password: "testpass"

# Run load test
artillery run artillery.yml
```

</details>

---

## 🆘 Troubleshooting

### 🔧 Common Issues & Solutions

<details>
<summary>❌ Build Failures</summary>

**Issue: TypeScript compilation errors**
```bash
# Solution: Check and fix TypeScript errors
npm run typecheck

# Common fixes:
# 1. Update type definitions
npm update @types/node @types/express @types/react

# 2. Fix import statements
# Change: import * as React from 'react'
# To: import React from 'react'

# 3. Clear TypeScript cache
rm -rf node_modules/.cache
rm tsconfig.tsbuildinfo
```

**Issue: Dependency conflicts**
```bash
# Solution: Clean install
rm -rf node_modules package-lock.json
npm install

# Or use npm ci for clean install
npm ci
```

**Issue: Out of memory during build**
```bash
# Solution: Increase Node.js memory
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build
```

</details>

<details>
<summary>🌐 Environment Variable Issues</summary>

**Issue: Environment variables not loading**
```bash
# Verify variables are set
node -e "console.log(process.env.NODE_ENV)"
node -e "console.log(process.env.MONGODB_URI ? 'Set' : 'Not set')"

# Platform-specific checks:

# Vercel: Check dashboard environment variables
vercel env ls

# Netlify: Check site settings
netlify env:list

# Render: Check service environment
# (Check in dashboard under Environment tab)
```

**Issue: CORS errors**
```bash
# Solution: Update CORS configuration
# In backend/src/index.ts
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
```

</details>

<details>
<summary>🗄️ Database Connection Issues</summary>

**Issue: MongoDB connection timeout**
```bash
# Solution 1: Check connection string
node -e "
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 })
  .then(() => console.log('✅ Connected'))
  .catch(err => console.log('❌ Failed:', err.message));
"

# Solution 2: Whitelist IP addresses
# Go to MongoDB Atlas → Network Access
# Add current deployment platform IPs:
# - Vercel: 0.0.0.0/0 (or specific IPs)
# - Netlify: 0.0.0.0/0 (or specific IPs)
# - Render: Check Render documentation for IP ranges
```

**Issue: Redis connection failures**
```bash
# Solution: Test Redis connectivity
node -e "
const redis = require('redis');
const client = redis.createClient({ url: process.env.REDIS_URL });
client.connect()
  .then(() => console.log('✅ Redis connected'))
  .catch(err => console.log('❌ Redis failed:', err.message));
"
```

</details>

<details>
<summary>🤖 AI Service Issues</summary>

**Issue: Groq API errors**
```bash
# Test API key validity
curl -X POST https://api.groq.com/openai/v1/chat/completions \
  -H "Authorization: Bearer $GROQ_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role": "user", "content": "test"}],
    "model": "mixtral-8x7b-32768"
  }'
```

**Issue: PlantNet API errors**
```bash
# Test PlantNet API
curl "https://my-api.plantnet.org/v2/identify/project?api-key=$PLANTNET_API_KEY&organs=leaf"
```

</details>

### 🔍 Debugging Tools

<details>
<summary>🛠️ Debugging Commands</summary>

```bash
# 1. Check deployment logs
# Vercel
vercel logs greenstagram-backend

# Netlify
netlify logs

# Render
# Check logs in dashboard

# Azure
az webapp log tail --name greenstagram-api --resource-group greenstagram-rg

# 2. Test API endpoints locally
npm run dev:backend
curl http://localhost:5000/health

# 3. Check environment variables
node backend/debug-env.js

# 4. Validate configuration
npm run validate:env

# 5. Database connection test
node backend/test-db-connection.js
```

</details>

---

## 🔄 Rollback Strategies

### ⏪ Quick Rollback Options

<details>
<summary>🚀 Vercel Rollback</summary>

```bash
# List previous deployments
vercel list

# Rollback to specific deployment
vercel rollback https://greenstagram-abc123.vercel.app

# Promote specific deployment to production
vercel promote https://greenstagram-abc123.vercel.app
```

</details>

<details>
<summary>🌐 Netlify Rollback</summary>

```bash
# List site deployments
netlify api listSiteDeploys --data '{"site_id": "your-site-id"}'

# Restore specific deployment
netlify api restoreSiteDeploy --data '{"deploy_id": "deploy-id"}'
```

</details>

<details>
<summary>☁️ Azure Rollback</summary>

```bash
# List deployment slots
az webapp deployment slot list --name greenstagram-api --resource-group greenstagram-rg

# Swap slots (if using staging)
az webapp deployment slot swap \
  --name greenstagram-api \
  --resource-group greenstagram-rg \
  --slot staging \
  --target-slot production
```

</details>

### 🔄 Git-based Rollback

```bash
# 1. Identify problematic commit
git log --oneline -10

# 2. Revert to previous working commit
git revert <commit-hash>

# 3. Push revert commit
git push origin main

# 4. Deploy will automatically trigger with CI/CD
```

---

## 📈 Monitoring & Alerts

### 📊 Monitoring Setup

<details>
<summary>📈 Application Insights (Azure)</summary>

```typescript
// backend/src/config/applicationInsights.ts
import { setup, start } from 'applicationinsights';

if (process.env.APPLICATIONINSIGHTS_CONNECTION_STRING) {
  setup(process.env.APPLICATIONINSIGHTS_CONNECTION_STRING)
    .setAutoDependencyCorrelation(true)
    .setAutoCollectRequests(true)
    .setAutoCollectPerformance(true)
    .setAutoCollectExceptions(true)
    .setAutoCollectDependencies(true)
    .setAutoCollectConsole(true)
    .setUseDiskRetryCaching(true)
    .setSendLiveMetrics(true)
    .start();
}
```

</details>

<details>
<summary>🚨 Health Check Endpoints</summary>

```typescript
// backend/src/routes/health.ts
import express from 'express';
import mongoose from 'mongoose';
import { client as redisClient } from '../config/redis';

const router = express.Router();

router.get('/health', async (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      redis: redisClient?.isOpen ? 'connected' : 'disconnected',
      memory: process.memoryUsage(),
      uptime: process.uptime()
    }
  };
  
  const isHealthy = health.services.database === 'connected';
  res.status(isHealthy ? 200 : 503).json(health);
});

export default router;
```

</details>

### 🔔 Alert Configuration

<details>
<summary>📧 Email Alerts</summary>

```yaml
# .github/workflows/alerts.yml
name: 🚨 Monitoring Alerts

on:
  schedule:
    - cron: '*/5 * * * *'  # Every 5 minutes

jobs:
  health-check:
    runs-on: ubuntu-latest
    steps:
    - name: Check application health
      run: |
        response=$(curl -s -o /dev/null -w "%{http_code}" https://your-app.com/health)
        if [ $response != "200" ]; then
          echo "::error::Application health check failed with status $response"
          exit 1
        fi
        
    - name: Send alert on failure
      if: failure()
      uses: dawidd6/action-send-mail@v3
      with:
        server_address: smtp.gmail.com
        server_port: 587
        username: ${{ secrets.EMAIL_USERNAME }}
        password: ${{ secrets.EMAIL_PASSWORD }}
        subject: 🚨 Greenstagram Health Check Failed
        body: |
          The health check for Greenstagram has failed.
          Please check the application status immediately.
          
          Time: ${{ github.event.head_commit.timestamp }}
          Commit: ${{ github.sha }}
        to: admin@yourdomain.com
        from: alerts@yourdomain.com
```

</details>

---

## 📚 Additional Resources

### 🔗 Useful Links

- 📖 **[Main Documentation](README.md)** - Complete project documentation
- 🏗️ **[Development Guide](DEVELOPMENT.md)** - Local development setup
- 🤝 **[Contributing Guidelines](CONTRIBUTING.md)** - How to contribute
- 🐛 **[Issue Tracker](https://github.com/adity1raut/Greenstagram/issues)** - Report bugs
- 💬 **[Discussions](https://github.com/adity1raut/Greenstagram/discussions)** - Community chat

### 📋 Platform Documentation

- 🚀 **[Vercel Docs](https://vercel.com/docs)** - Vercel deployment guide
- 🌐 **[Netlify Docs](https://docs.netlify.com/)** - Netlify deployment guide
- 🔧 **[Render Docs](https://render.com/docs)** - Render deployment guide
- ☁️ **[Azure Docs](https://docs.microsoft.com/azure/)** - Azure deployment guide
- 🔗 **[AWS Docs](https://docs.aws.amazon.com/)** - AWS deployment guide

### 🛠️ Tools & Services

- 🗄️ **[MongoDB Atlas](https://www.mongodb.com/atlas)** - Database hosting
- 🔄 **[Redis Cloud](https://redis.com/try-free/)** - Caching service
- 🔐 **[Azure Key Vault](https://azure.microsoft.com/services/key-vault/)** - Secret management
- 📊 **[Application Insights](https://docs.microsoft.com/azure/azure-monitor/app/app-insights-overview)** - Application monitoring

---

<div align="center">

## 🌱 Happy Deploying!

**Made with 💚 for the Planet**

*If this guide helped you deploy successfully, please consider starring ⭐ the repository!*

[![Deploy to Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/adity1raut/Greenstagram)
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/adity1raut/Greenstagram)
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/adity1raut/Greenstagram)

---

### 📞 Need Help?

- 💬 **Community Support**: [GitHub Discussions](https://github.com/adity1raut/Greenstagram/discussions)
- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/adity1raut/Greenstagram/issues)
- 📧 **Email**: support@greenstagram.com
- 🐦 **Twitter**: [@greenstagram](https://twitter.com/greenstagram)

</div>