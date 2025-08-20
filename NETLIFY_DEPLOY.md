# 🚀 Netlify Deployment Guide for Greenstagram

## Prerequisites

1. **Netlify Account**: Sign up at [netlify.com](https://netlify.com)
2. **MongoDB Atlas**: Set up a database at [mongodb.com/atlas](https://mongodb.com/atlas)
3. **GitHub Repository**: Push your code to GitHub

## 🔧 Setup Steps

### 1. Install Netlify CLI
```bash
npm install -g netlify-cli
netlify login
```

### 2. Initialize Netlify in Your Project
```bash
cd greenstagram
netlify init
```

### 3. Set Environment Variables

In your Netlify dashboard (Site settings > Environment variables), add:

```
MONGODB_CONNECTION_STRING=mongodb+srv://...
JWT_SECRET=your-jwt-secret-here
GROQ_API_KEY=your-groq-key
PLANTNET_API_KEY=your-plantnet-key
```

### 4. Deploy
```bash
# Development preview
netlify deploy

# Production deployment
netlify deploy --prod
```

## 🌐 Manual Deployment via Netlify Dashboard

1. Go to [app.netlify.com](https://app.netlify.com)
2. Click "New site from Git"
3. Connect your GitHub repository
4. Set build settings:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/dist`
5. Add environment variables in Site settings
6. Deploy!

## 📱 Frontend-Only Deployment (Faster)

If you want to deploy just the frontend with mock data:

1. Comment out backend function calls in your frontend
2. Use mock data instead of API calls
3. Deploy as a static site

## 🔍 Troubleshooting

- **Build fails**: Check that all dependencies are in package.json
- **Functions timeout**: Increase function timeout in netlify.toml
- **Database connection**: Verify MongoDB connection string
- **CORS issues**: Check headers in function responses
