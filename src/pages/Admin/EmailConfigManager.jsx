import React, { useState, useEffect } from "react";
import { MdEmail, MdSend, MdSettings, MdCheckCircle } from "react-icons/md";
import { getEmailConfig, updateConfig } from "../../lib/configService";

const EmailConfigManager = () => {
    const [config, setConfig] = useState({
        resendApiKey: "",
        senderEmail: "noreply@slppvtempletpt.org",
        senderName: "SLPPV Temple",
        enabled: false,
    });

    const [testEmail, setTestEmail] = useState("");
    const [isTesting, setIsTesting] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [saveSuccess, setSaveSuccess] = useState(false);

    // Load configuration on mount
    useEffect(() => {
        loadConfig();
    }, []);

    const loadConfig = async () => {
        try {
            setIsLoading(true);
            const emailConfig = await getEmailConfig();
            setConfig(emailConfig);
        } catch (error) {
            console.error("Error loading email config:", error);
            alert("Failed to load email configuration");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setIsSaving(true);
            setSaveSuccess(false);

            await updateConfig("email_config", config);

            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (error) {
            console.error("Error saving email config:", error);
            alert("Failed to save email configuration");
        } finally {
            setIsSaving(false);
        }
    };

    const handleTest = async () => {
        if (!testEmail) {
            alert("Please enter a test email address");
            return;
        }

        if (!config.resendApiKey) {
            alert("Please enter your Resend API key first");
            return;
        }

        setIsTesting(true);
        try {
            // First, save the configuration to Firestore
            console.log("Saving configuration before test...");
            await updateConfig("email_config", config);

            // Clear the config cache to force fresh fetch
            const { clearConfigCache } = await import("../../lib/configService");
            clearConfigCache();

            // Small delay to ensure Firestore write completes
            await new Promise(resolve => setTimeout(resolve, 500));

            // Now send the test email
            const { sendTestEmail } = await import("../../lib/emailService");
            const result = await sendTestEmail(testEmail);

            if (result.success) {
                alert(`✅ Test email sent successfully to ${testEmail}!\n\nCheck your inbox (and spam folder).`);
            } else {
                alert(`⚠️ Email sending is disabled in configuration.`);
            }
        } catch (error) {
            console.error("Test email error:", error);
            alert(`❌ Failed to send test email:\n${error.message}\n\nPlease check your API key and try again.`);
        } finally {
            setIsTesting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="max-w-4xl">
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mainColor"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl">
            <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center gap-3 mb-6">
                    <MdEmail className="text-3xl text-mainColor" />
                    <h1 className="text-2xl font-bold text-mainColor">Email Configuration</h1>
                </div>

                <p className="text-gray-600 mb-6">
                    Configure email settings for automated receipts and notifications using Resend.
                </p>

                <div className="space-y-6">
                    {/* Enable Email */}
                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            id="emailEnabled"
                            checked={config.enabled}
                            onChange={(e) =>
                                setConfig({ ...config, enabled: e.target.checked })
                            }
                            className="w-5 h-5 text-mainColor focus:ring-mainColor rounded"
                        />
                        <label htmlFor="emailEnabled" className="text-sm font-semibold text-gray-700">
                            Enable Email Notifications
                        </label>
                    </div>

                    {/* Resend API Key */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Resend API Key *
                        </label>
                        <input
                            type="password"
                            value={config.resendApiKey}
                            onChange={(e) =>
                                setConfig({ ...config, resendApiKey: e.target.value })
                            }
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-mainColor focus:ring-2 focus:ring-mainColor focus:outline-none"
                            placeholder="re_xxxxxxxxxxxx"
                        />
                        <p className="text-sm text-gray-500 mt-1">
                            Get your API key from{" "}
                            <a
                                href="https://resend.com/api-keys"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-mainColor hover:underline"
                            >
                                Resend Dashboard
                            </a>
                        </p>
                    </div>

                    {/* Sender Email */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Sender Email *
                        </label>
                        <input
                            type="email"
                            value={config.senderEmail}
                            onChange={(e) =>
                                setConfig({ ...config, senderEmail: e.target.value })
                            }
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-mainColor focus:ring-2 focus:ring-mainColor focus:outline-none"
                            placeholder="noreply@yourdomain.com"
                        />
                    </div>

                    {/* Sender Name */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Sender Name *
                        </label>
                        <input
                            type="text"
                            value={config.senderName}
                            onChange={(e) =>
                                setConfig({ ...config, senderName: e.target.value })
                            }
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-mainColor focus:ring-2 focus:ring-mainColor focus:outline-none"
                            placeholder="Your Temple Name"
                        />
                    </div>

                    {/* Test Email */}
                    <div className="border-t pt-6">
                        <h3 className="text-lg font-semibold text-gray-700 mb-4">
                            Test Email Configuration
                        </h3>
                        <div className="flex gap-3">
                            <input
                                type="email"
                                value={testEmail}
                                onChange={(e) => setTestEmail(e.target.value)}
                                className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-mainColor focus:ring-2 focus:ring-mainColor focus:outline-none"
                                placeholder="test@example.com"
                            />
                            <button
                                onClick={handleTest}
                                disabled={isTesting || !config.enabled}
                                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                <MdSend />
                                {isTesting ? "Sending..." : "Send Test"}
                            </button>
                        </div>
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-end gap-3 pt-6 border-t">
                        {saveSuccess && (
                            <div className="flex items-center gap-2 text-green-600 mr-4">
                                <MdCheckCircle className="text-xl" />
                                <span className="font-semibold">Saved successfully!</span>
                            </div>
                        )}
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="px-8 py-3 bg-mainColor text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 font-semibold shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            <MdSettings />
                            {isSaving ? "Saving..." : "Save Configuration"}
                        </button>
                    </div>
                </div>

                {/* Info Box */}
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800">
                        <strong>✅ Email automation is now active!</strong> Configuration is stored in Firestore.
                        When you click "Send Test", your settings will be automatically saved before sending.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default EmailConfigManager;
