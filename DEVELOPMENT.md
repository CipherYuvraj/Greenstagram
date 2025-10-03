# Greenstagram Development Guide

## Prerequisites

- Node.js (v18 or later)
- npm (v9 or later)
- MongoDB (v6 or later)
- Git

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/tarone-saloni/Greenstagram.git
   cd Greenstagram
   ```

2. Install dependencies:
   ```bash
   npm run install:all
   ```

3. Environment Setup:
   - Copy `.env.example` to `.env` in both `frontend` and `backend` directories
   - Update the environment variables with your configuration

4. Start Development Servers:
   ```bash
   # Start frontend development server
   npm run dev:frontend

   # In another terminal, start the backend functions
   npm run dev:functions
   ```

   Or run both together:
   ```bash
   npm run dev
   ```

## Project Structure

```
Greenstagram/
├── frontend/          # React frontend application
├── backend/          # Backend API services
└── netlify/          # Netlify serverless functions
```

## Available Scripts

### Root Directory
- `npm run install:all` - Install all dependencies
- `npm run build` - Build the project
- `npm run dev` - Start development environment
- `npm run dev:frontend` - Start frontend development server
- `npm run dev:functions` - Start Netlify Functions development server
- `npm run deploy` - Deploy to production
- `npm run deploy:preview` - Create a preview deployment

### Frontend
- `npm run dev` - Start Vite dev server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build locally

## Code Quality Standards

### TypeScript
- Strict mode enabled
- All files must have proper type definitions
- No `any` types unless absolutely necessary
- Use interface over type when possible

### ESLint Rules
- No unused variables
- No unnecessary dependencies
- Consistent type definitions
- React hooks rules strictly enforced

### Prettier Configuration
- Single quotes
- No semicolons
- 2 space indentation
- 80 character line length

## Pre-commit Hooks

The project uses Husky for pre-commit hooks:
1. Lint staged files
2. Run type checking
3. Run tests (if applicable)
4. Format code

## Environment Variables

Required environment variables:

### Frontend (.env)
```
VITE_API_URL=http://localhost:8888/.netlify/functions
VITE_APP_ENV=development
```

### Backend (.env)
```
MONGODB_URI=mongodb://localhost:27017/greenstagram
JWT_SECRET=your-secret-key
NODE_ENV=development
```

## Troubleshooting

### Common Issues

1. **"Module not found" errors**
   - Solution: Run `npm run install:all` again
   - Check if all dependencies are properly installed

2. **TypeScript errors**
   - Solution: Check if all required types are installed
   - Run `npm install -D @types/[package-name]` for missing types

3. **Environment Variables not loading**
   - Solution: Check if .env files exist and are properly formatted
   - Ensure variables are prefixed with VITE_ for frontend

4. **Build failures**
   - Solution: Check build logs for specific errors
   - Ensure all required dependencies are installed
   - Verify TypeScript configuration

5. **MongoDB Connection Issues**
   - Solution: Check if MongoDB is running
   - Verify connection string in .env file
   - Check network connectivity

### Getting Help

If you encounter any issues not covered here:
1. Check the existing GitHub issues
2. Search the project documentation
3. Create a new issue with:
   - Detailed description of the problem
   - Steps to reproduce
   - Environment information
   - Relevant error messages
