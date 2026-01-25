import { initializeDefaultConfig } from "../lib/configService";

/**
 * Initialize Firestore configuration with default values
 * Run this script once to set up the site_config collection
 * 
 * Usage:
 * 1. Open browser console on your site
 * 2. Import and run: initConfig()
 * 3. Or add a button in admin panel to run this
 */

export const initConfig = async () => {
    console.log("Initializing site configuration...");

    try {
        const success = await initializeDefaultConfig();

        if (success) {
            console.log("✅ Configuration initialized successfully!");
            console.log("Default values have been set for:");
            console.log("- email_config");
            console.log("- site_settings");
            console.log("- r2_config");
            console.log("- payment_config");
            console.log("\nYou can now configure these in the admin panel.");
            return true;
        } else {
            console.error("❌ Failed to initialize configuration");
            return false;
        }
    } catch (error) {
        console.error("❌ Error during initialization:", error);
        return false;
    }
};

// Auto-run if this script is executed directly
if (typeof window !== "undefined") {
    window.initConfig = initConfig;
    console.log("Config initialization utility loaded.");
    console.log("Run 'initConfig()' in console to initialize default configuration.");
}
