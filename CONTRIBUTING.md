# 🌱 Contributing to Greenstagram

Thank you for your interest in contributing to Greenstagram! We're excited to have you join our mission to create a sustainable social media platform that connects eco-conscious individuals worldwide. 🌍

## 📋 Table of Contents

- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Contribution Workflow](#contribution-workflow)
- [Branch Naming Conventions](#branch-naming-conventions)
- [Coding Standards](#coding-standards)
- [Pull Request Process](#pull-request-process)
- [Issue Guidelines](#issue-guidelines)
- [Community Guidelines](#community-guidelines)

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.x or higher) - [Download here](https://nodejs.org/)
- **npm** (v8.x or higher) - Usually comes with Node.js
- **Git** - [Download here](https://git-scm.com/)
- **MongoDB Atlas Account** - [Sign up here](https://www.mongodb.com/atlas)
- **Code Editor** - We recommend [VS Code](https://code.visualstudio.com/)

### Tech Stack

- **Frontend**: React 18 + TypeScript + Vite + TailwindCSS + Framer Motion
- **Backend**: Node.js + Express + TypeScript + MongoDB + Redis
- **Deployment**: Azure App Service + Netlify Functions
- **AI Integration**: Groq API + PlantNet API
- **Real-time**: Socket.io
- **Testing**: Jest + React Testing Library

## 🛠️ Development Setup

### 1. Fork and Clone the Repository

```bash
# Fork the repository on GitHub, then clone your fork
git clone https://github.com/YOUR_USERNAME/Greenstagram.git
cd Greenstagram

# Add the original repository as upstream
git remote add upstream https://github.com/ORIGINAL_OWNER/Greenstagram.git
```

### 2. Install Dependencies

```bash
# Install all dependencies (frontend, backend, and functions)
npm run install:all

# Or install individually:
cd backend && npm install
cd ../frontend && npm install
cd ../netlify/functions && npm install
```

### 3. Environment Setup

```bash
# Copy environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Edit the .env files with your configuration
```

**Required Environment Variables:**

```bash
# Backend (.env)
MONGODB_CONNECTION_STRING=mongodb+srv://...
JWT_SECRET=your-super-secure-jwt-secret
REDIS_URL=redis://localhost:6379
GROQ_API_KEY=your-groq-api-key (optional)
PLANTNET_API_KEY=your-plantnet-api-key (optional)

# Frontend (.env)
VITE_API_URL=http://localhost:5000/api
```

### 4. Start Development Servers

```bash
# Start both frontend and backend simultaneously
npm run dev

# Or start individually:
npm run dev:backend   # Backend on port 5000
npm run dev:frontend  # Frontend on port 3000
```

### 5. Verify Setup

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Health Check: http://localhost:5000/health

## 🔄 Contribution Workflow

### 1. Create a New Branch

```bash
# Sync with upstream
git checkout main
git pull upstream main

# Create a new branch (see naming conventions below)
git checkout -b feature/eco-challenges-system
```

### 2. Make Your Changes

- Write clean, readable code
- Follow our coding standards
- Add tests for new features
- Update documentation as needed

### 3. Test Your Changes

```bash
# Run tests
npm test

# Run linting
npm run lint

# Check types
npm run type-check

# Test the build
npm run build
```

### 4. Commit Your Changes

```bash
# Stage your changes
git add .

# Commit with a descriptive message
git commit -m "feat: add eco-challenges system with badge rewards

- Implement challenge creation and management
- Add progress tracking for users
- Integrate badge system for completion rewards
- Add unit tests for challenge logic

Closes #123"
```

## 🌿 Branch Naming Conventions

Use descriptive branch names that follow this pattern:

### Branch Types

- `feature/` - New features or enhancements
- `bugfix/` - Bug fixes
- `hotfix/` - Critical production fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Adding or updating tests
- `chore/` - Maintenance tasks

### Examples

```bash
feature/user-profile-badges
feature/plant-identification-ai
bugfix/login-form-validation
hotfix/security-token-refresh
docs/api-documentation-update
refactor/auth-middleware-cleanup
test/add-e2e-registration-flow
chore/update-dependencies
```

### Issue-Based Branches

If working on a specific issue, include the issue number:

```bash
feature/issue-45-eco-points-system
bugfix/issue-78-mobile-responsive-nav
```

## 📝 Coding Standards

### TypeScript Guidelines

- **Use TypeScript** for all new code
- **Define interfaces** for all data structures
- **Avoid `any` type** - use proper typing
- **Use enums** for constants with multiple values

```typescript
// Good
interface User {
  id: string;
  username: string;
  ecoPoints: number;
  badges: Badge[];
}

// Avoid
const user: any = { ... };
```

### React Guidelines

- **Use functional components** with hooks
- **Use TypeScript interfaces** for props
- **Follow the component structure**:

```tsx
// Component structure
interface ComponentProps {
  // Props interface
}

const Component: React.FC<ComponentProps> = ({ prop1, prop2 }) => {
  // Hooks
  // Event handlers
  // Render logic
  
  return (
    // JSX
  );
};

export default Component;
```

### Code Formatting

We use **Prettier** and **ESLint** for consistent formatting:

```bash
# Format code
npm run format

# Check linting
npm run lint

# Fix linting issues
npm run lint:fix
```

### Naming Conventions

- **Files**: `kebab-case` for files (`user-profile.tsx`)
- **Components**: `PascalCase` (`UserProfile`)
- **Variables/Functions**: `camelCase` (`getUserProfile`)
- **Constants**: `UPPER_SNAKE_CASE` (`API_BASE_URL`)
- **CSS Classes**: `kebab-case` (`eco-badge-container`)

### CSS/Styling Guidelines

- **Use TailwindCSS** utility classes primarily
- **Follow responsive-first** approach
- **Use consistent spacing** (4, 8, 16, 24, 32px scale)
- **Eco-friendly color palette**:
  ```css
  /* Primary greens */
  green-50 to green-900
  emerald-50 to emerald-900
  
  /* Accent colors */
  teal-50 to teal-900
  yellow-400 to orange-500 (for badges/points)
  ```

### Git Commit Messages

Follow the **Conventional Commits** specification:

```bash
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```bash
feat(auth): add social media login integration
fix(ui): resolve mobile navigation overlay issue
docs(api): update authentication endpoints documentation
test(user): add unit tests for user profile validation
```

## 🔄 Pull Request Process

### 1. Before Submitting

- [ ] Code follows the style guidelines
- [ ] Tests pass (`npm test`)
- [ ] Build succeeds (`npm run build`)
- [ ] No TypeScript errors (`npm run type-check`)
- [ ] Documentation is updated (if applicable)
- [ ] Commit messages follow conventions

### 2. Pull Request Template

When creating a PR, use this template:

```markdown
## 🌱 Description
Brief description of changes and motivation.

## 🔧 Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## 🧪 Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed

## 📸 Screenshots (if applicable)
Include screenshots for UI changes.

## ✅ Checklist
- [ ] My code follows the style guidelines of this project
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes

## 🔗 Related Issues
Closes #123
Related to #456
```

### 3. Review Process

1. **Automated Checks**: GitHub Actions will run tests and linting
2. **Code Review**: Maintainers will review your code
3. **Feedback**: Address any requested changes
4. **Approval**: Once approved, your PR will be merged

## 🐛 Issue Guidelines

### Reporting Bugs

Use the bug report template and include:

- **Environment**: OS, Node.js version, browser
- **Steps to reproduce**: Clear, numbered steps
- **Expected behavior**: What should happen
- **Actual behavior**: What actually happens
- **Screenshots**: If applicable
- **Error messages**: Full error messages/stack traces

### Feature Requests

For new features, include:

- **Problem description**: What problem does this solve?
- **Proposed solution**: How should it work?
- **Alternatives considered**: Other approaches you've thought of
- **Additional context**: Mockups, examples, references

### Good First Issues

Look for issues labeled:
- `good first issue` - Perfect for newcomers
- `help wanted` - We need community help
- `documentation` - Help improve our docs
- `frontend` - Frontend-specific tasks
- `backend` - Backend-specific tasks

## 🌍 Community Guidelines

### Code of Conduct

- **Be respectful** and inclusive to all contributors
- **Use welcoming language** and be patient with newcomers
- **Focus on constructive feedback** in code reviews
- **Help others learn** and grow in the eco-tech space

### Getting Help

- **Discussions**: Use GitHub Discussions for questions
- **Discord**: Join our community Discord (link in README)
- **Documentation**: Check our docs first
- **Issues**: Create an issue for bugs or feature requests

### Recognition

Contributors are recognized through:
- **Contributors section** in README
- **Release notes** crediting contributors
- **Special eco-contributor badges** in our platform
- **Hacktoberfest participation** (during October)

## 🎯 Areas for Contribution

We especially welcome contributions in:

### 🎨 Frontend
- React components and UI improvements
- Framer Motion animations
- Mobile responsiveness
- PWA features
- Accessibility improvements

### ⚙️ Backend
- API endpoints and business logic
- Database optimization
- Real-time features with Socket.io
- Security enhancements
- Performance improvements

### 🤖 AI/ML
- Plant identification improvements
- Eco-quote generation
- Content recommendation algorithms
- Image processing for posts

### 📱 Features
- Eco-challenges system
- Badge and achievement system
- Social features (comments, follows)
- Analytics dashboard
- Notification system

### 📚 Documentation
- API documentation
- User guides
- Development tutorials
- Deployment guides

### 🧪 Testing
- Unit tests
- Integration tests
- E2E tests
- Performance testing

## 🌟 Recognition

### Contributor Levels

- **🌱 Seedling**: First contribution
- **🌿 Sprout**: 5+ contributions
- **🌳 Tree**: 15+ contributions
- **🌲 Forest Guardian**: Core contributor

### Benefits

- Name in README contributors section
- Special badges in the Greenstagram platform
- Priority support in Discord
- Input on project roadmap
- Potential maintainer invitation

## 📞 Contact

- **Project Maintainers**: +91 9376308345
- **Email**: yuvrajudaywal@gmail.com

---

Thank you for contributing to Greenstagram! Together, we're building a platform that makes environmental consciousness social and fun. Every contribution, no matter how small, helps us create a more sustainable future! 🌍💚

*Happy coding and stay green!* 🌱✨
