# Greenstagram 🌿

A social media platform focused on sustainability and eco-friendly living, enhanced with Azure cloud services.

## 🌟 Project Overview

Greenstagram is a platform where users can share their sustainable lifestyle choices, eco-friendly practices, and green initiatives. The application uses Azure services for enhanced security, scalability, and AI capabilities.

## 🚀 Features

- **User Authentication**: Secure login and registration with JWT
- **Enhanced Security**: Azure Key Vault integration for secret management
- **Post Management**: Share eco-friendly initiatives with images
- **Social Interactions**: Follow users, like and comment on posts
- **Gamification**: Earn eco points and level up for sustainable actions

## 🔧 Tech Stack

### Backend
- Node.js with Express
- TypeScript
- MongoDB for database
- JWT for authentication
- Azure Key Vault for secret management

### Azure Integration
- **Azure Key Vault**: Secure secret management
- **Azure Blob Storage**: Image storage (coming soon)
- **Azure Cognitive Services**: AI capabilities (coming soon)
- **Azure Functions**: Serverless operations (coming soon)

## 🛠️ Setup Instructions

### Prerequisites
- Node.js (v16+)
- MongoDB
- Azure account with Key Vault configured

### Environment Variables
Create a `.env` file in the backend directory with the following:

```
PORT=5000
MONGODB_URI=your_mongodb_connection_string
KEYVAULT_URI=your_azure_keyvault_uri
JWT_SECRET=fallback_jwt_secret_for_development
```

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/greenstagram.git
cd greenstagram
```

2. Install backend dependencies
```bash
cd backend
npm install
```

3. Start the development server
```bash
npm run dev
```

## 🔐 Azure Key Vault Integration

Greenstagram uses Azure Key Vault to securely store sensitive information like JWT secrets. This provides:

- Enhanced security for authentication
- Centralized secrets management
- Rotation of secrets without code changes
- Compliance with security best practices

### Setup Key Vault

1. Create a Key Vault in Azure Portal
2. Add a secret named `jwt-secret` with your JWT signing key
3. Configure access policies for your application
4. Set the KEYVAULT_URI environment variable

## 📚 API Documentation

### Authentication Endpoints

- **POST /api/auth/register** - Register a new user
  - Body: `{ username, email, password, bio?, interests? }`
  - Returns: User data with JWT token

- **POST /api/auth/login** - Login existing user
  - Body: `{ emailOrUsername, password }`
  - Returns: User data with JWT token

- **GET /api/auth/profile** - Get user profile (protected)
  - Headers: `Authorization: Bearer {token}`
  - Returns: User profile data

### Other Endpoints

- **GET /** - API root endpoint
- **GET /health** - Health check endpoint
- **POST /test/user** - Test user creation

## 🔄 Development Workflow

1. Implement feature in a new branch
2. Test thoroughly
3. Create pull request
4. Review and merge
5. Deploy to production

## 🛡️ Security Best Practices

- Secrets stored in Azure Key Vault
- Password hashing with bcrypt
- JWT authentication for API endpoints
- Input validation on all endpoints

## 🔮 Future Enhancements

- Azure Blob Storage for media uploads
- Azure Cognitive Services for plant identification
- Real-time notifications with Azure SignalR
- Mobile apps for iOS and Android

## 📄 License

[MIT](LICENSE)
