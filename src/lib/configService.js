import { db } from "./firebase";
import {
    doc,
    getDoc,
    setDoc,
    collection,
    getDocs,
    updateDoc,
} from "firebase/firestore";

// Cache for configuration to avoid excessive Firestore reads
const configCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Get configuration value from Firestore with caching
 * @param {string} key - Configuration key (e.g., 'email_config', 'site_settings')
 * @returns {Promise<Object|null>} Configuration object or null if not found
 */
export const getConfig = async (key) => {
    try {
        // Check cache first
        const cached = configCache.get(key);
        if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
            return cached.data;
        }

        // Fetch from Firestore
        const docRef = doc(db, "site_config", key);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();

            // Update cache
            configCache.set(key, {
                data,
                timestamp: Date.now(),
            });

            return data;
        }

        return null;
    } catch (error) {
        console.error(`Error fetching config for ${key}:`, error);
        return null;
    }
};

/**
 * Update configuration in Firestore
 * @param {string} key - Configuration key
 * @param {Object} value - Configuration object to save
 * @returns {Promise<boolean>} Success status
 */
export const updateConfig = async (key, value) => {
    try {
        const docRef = doc(db, "site_config", key);

        await setDoc(
            docRef,
            {
                ...value,
                updatedAt: new Date().toISOString(),
            },
            { merge: true }
        );

        // Clear cache for this key
        configCache.delete(key);

        return true;
    } catch (error) {
        console.error(`Error updating config for ${key}:`, error);
        throw error;
    }
};

/**
 * Get all configuration documents
 * @returns {Promise<Object>} All configuration as key-value pairs
 */
export const getAllConfig = async () => {
    try {
        const configCollection = collection(db, "site_config");
        const snapshot = await getDocs(configCollection);

        const allConfig = {};
        snapshot.forEach((doc) => {
            allConfig[doc.id] = doc.data();
        });

        return allConfig;
    } catch (error) {
        console.error("Error fetching all config:", error);
        return {};
    }
};

/**
 * Initialize default configuration if not exists
 * This should be run once during setup
 */
export const initializeDefaultConfig = async () => {
    try {
        // Email Configuration
        const emailConfig = await getConfig("email_config");
        if (!emailConfig) {
            await updateConfig("email_config", {
                resendApiKey: "",
                senderEmail: "noreply@slpptemple.org",
                senderName: "SLPPV Temple",
                enabled: false,
            });
        }

        // Site Settings
        const siteSettings = await getConfig("site_settings");
        if (!siteSettings) {
            await updateConfig("site_settings", {
                siteName: "Sri Lakshmi Padmavathi Sameta Sri Prasanna Venkateswara Swamy Temple",
                siteNameTelugu: "శ్రీ లక్ష్మీ పద్మావతి సమేత శ్రీ ప్రసన్న వెంకటేశ్వర స్వామి దేవస్థానం",
                contactEmail: "info@slpptemple.org",
                contactPhone: "+91 9492284523",
                address: "Air Bypass Road, Near Tasaldar Office, Tirupati",
                musicEnabled: true,
                musicVolume: 0.5,
                musicUrl: "",
            });
        }

        // R2 Configuration
        const r2Config = await getConfig("r2_config");
        if (!r2Config) {
            await updateConfig("r2_config", {
                endpoint: "",
                accessKeyId: "",
                secretAccessKey: "",
                bucketName: "",
                publicUrl: "",
                enabled: false,
            });
        }

        // Payment Configuration
        const paymentConfig = await getConfig("payment_config");
        if (!paymentConfig) {
            await updateConfig("payment_config", {
                sbiMerchantId: "",
                sbiEncryptionKey: "",
                sbiReturnUrl: "",
                enabled: true,
            });
        }

        console.log("Default configuration initialized successfully");
        return true;
    } catch (error) {
        console.error("Error initializing default config:", error);
        return false;
    }
};

/**
 * Clear configuration cache
 * Useful when you want to force a fresh fetch
 */
export const clearConfigCache = () => {
    configCache.clear();
};

/**
 * Export all configuration as JSON
 * @returns {Promise<string>} JSON string of all configuration
 */
export const exportConfig = async () => {
    try {
        const allConfig = await getAllConfig();
        return JSON.stringify(allConfig, null, 2);
    } catch (error) {
        console.error("Error exporting config:", error);
        throw error;
    }
};

/**
 * Import configuration from JSON
 * @param {string} jsonString - JSON string of configuration
 * @returns {Promise<boolean>} Success status
 */
export const importConfig = async (jsonString) => {
    try {
        const config = JSON.parse(jsonString);

        for (const [key, value] of Object.entries(config)) {
            await updateConfig(key, value);
        }

        clearConfigCache();
        return true;
    } catch (error) {
        console.error("Error importing config:", error);
        throw error;
    }
};

/**
 * Get specific configuration fields with fallback to environment variables
 * This ensures backward compatibility during migration
 */
export const getEmailConfig = async () => {
    const config = await getConfig("email_config");
    return config || {
        resendApiKey: import.meta.env.VITE_RESEND_API_KEY || "",
        senderEmail: "noreply@slppvtempletpt.org",
        senderName: "SLPPV Temple",
        enabled: false,
    };
};

export const getSiteSettings = async () => {
    const config = await getConfig("site_settings");
    return config || {
        siteName: "Sri Lakshmi Padmavathi Sameta Sri Prasanna Venkateswara Swamy Temple",
        siteNameTelugu: "శ్రీ లక్ష్మీ పద్మావతి సమేత శ్రీ ప్రసన్న వెంకటేశ్వర స్వామి దేవస్థానం",
        contactEmail: "info@slpptemple.org",
        contactPhone: "+91 9492284523",
        address: "Air Bypass Road, Near Tasaldar Office, Tirupati",
        musicEnabled: true,
        musicVolume: 0.5,
        musicUrl: "",
        heroPosterImage: "", // Left side hero image
    };
};

export const getR2Config = async () => {
    const config = await getConfig("r2_config");
    return config || {
        endpoint: import.meta.env.VITE_R2_ENDPOINT || "",
        accessKeyId: import.meta.env.VITE_R2_ACCESS_KEY_ID || "",
        secretAccessKey: import.meta.env.VITE_R2_SECRET_ACCESS_KEY || "",
        bucketName: import.meta.env.VITE_R2_BUCKET_NAME || "",
        publicUrl: import.meta.env.VITE_R2_PUBLIC_URL || "",
        enabled: false,
    };
};

export const getPaymentConfig = async () => {
    const config = await getConfig("payment_config");
    return config || {
        sbiMerchantId: "",
        sbiEncryptionKey: "",
        sbiReturnUrl: window.location.origin + "/payment/status",
        enabled: true,
    };
};
