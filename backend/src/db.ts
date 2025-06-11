import mongoose from "mongoose";
import { DefaultAzureCredential } from "@azure/identity";
import { SecretClient } from "@azure/keyvault-secrets";

let keyVaultClient: SecretClient | null = null;

// Initialize Key Vault client if URI is provided
const initializeKeyVault = () => {
    const vaultUrl = process.env.KEYVAULT_URI;
    
    if (vaultUrl) {
        try {
            const credential = new DefaultAzureCredential();
            keyVaultClient = new SecretClient(vaultUrl, credential);
            console.log("🔐 Azure Key Vault client initialized");
        } catch (error) {
            console.warn("⚠️ Failed to initialize Key Vault client:", error);
        }
    } else {
        console.log("ℹ️ No Key Vault URI provided, using environment variables");
    }
};

// Fetch secret from Key Vault with fallback to environment variable
const getSecret = async (secretName: string, envVarName: string): Promise<string> => {
    if (keyVaultClient) {
        try {
            const secret = await keyVaultClient.getSecret(secretName);
            if (secret.value) {
                console.log(`✅ Retrieved ${secretName} from Key Vault`);
                return secret.value;
            }
        } catch (error) {
            console.warn(`⚠️ Failed to fetch ${secretName} from Key Vault:`, error);
        }
    }
    
    // Fallback to environment variable
    const envValue = process.env[envVarName];
    if (envValue) {
        console.log(`📄 Using ${envVarName} from environment variables`);
        return envValue;
    }
    
    throw new Error(`❌ Neither Key Vault secret '${secretName}' nor environment variable '${envVarName}' is available`);
};

const connectDB = async () => {
    try {
        // Initialize Key Vault client
        initializeKeyVault();
        
        // Get MongoDB URI - try Key Vault first, fallback to env var
        let mongoUri: string;
        try {
            mongoUri = await getSecret("mongodb-uri", "MONGODB_URI");
        } catch (error) {
            console.error("❌ Failed to get MongoDB URI:", error);
            throw error;
        }

        await mongoose.connect(mongoUri, {
            // SSL/TLS options to handle connection issues
            ssl: true,
            // Increase timeout values
            serverSelectionTimeoutMS: 10000, // 10 seconds
            socketTimeoutMS: 45000, // 45 seconds
            // Buffer settings
            bufferCommands: false,
            // Connection pool settings
            maxPoolSize: 10,
            minPoolSize: 5,
        });

        console.log("✅ MongoDB connected successfully");
        
        // Handle connection events
        mongoose.connection.on('error', (err) => {
            console.error("❌ MongoDB connection error:", err);
        });
        
        mongoose.connection.on('disconnected', () => {
            console.log("⚠️ MongoDB disconnected");
        });
        
        mongoose.connection.on('reconnected', () => {
            console.log("🔄 MongoDB reconnected");
        });
        
    } catch (err) {
        console.error("❌ MongoDB connection error:", err);
        // Don't exit immediately, allow for retries
        setTimeout(() => {
            console.log("🔄 Retrying MongoDB connection...");
            connectDB();
        }, 5000);
    }
};

export default connectDB;