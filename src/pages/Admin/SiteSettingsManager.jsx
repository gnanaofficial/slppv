import React, { useState, useEffect } from "react";
import { MdSettings, MdSave, MdCheckCircle, MdMusicNote, MdImage } from "react-icons/md";
import { getSiteSettings, updateConfig } from "../../lib/configService";
import { uploadImage } from "../../lib/uploadService";

const SiteSettingsManager = () => {
    const [settings, setSettings] = useState({
        siteName: "",
        siteNameTelugu: "",
        contactEmail: "",
        contactPhone: "",
        address: "",
        musicEnabled: true,
        musicVolume: 0.5,
        musicUrl: "",
        heroPosterImage: "", // Left side hero image
    });

    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [isUploadingImage, setIsUploadingImage] = useState(false);

    // Load settings on mount
    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            setIsLoading(true);
            const siteSettings = await getSiteSettings();
            setSettings(siteSettings);
        } catch (error) {
            console.error("Error loading site settings:", error);
            alert("Failed to load site settings");
        } finally {
            setIsLoading(false);
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            setIsUploadingImage(true);
            const imageUrl = await uploadImage(file, "hero-poster");
            setSettings({ ...settings, heroPosterImage: imageUrl });
            alert("✅ Image uploaded successfully! Don't forget to save settings.");
        } catch (error) {
            console.error("Error uploading image:", error);
            alert(`❌ Failed to upload image: ${error.message}`);
        } finally {
            setIsUploadingImage(false);
        }
    };

    const handleSave = async () => {
        try {
            setIsSaving(true);
            setSaveSuccess(false);

            await updateConfig("site_settings", settings);

            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (error) {
            console.error("Error saving site settings:", error);
            alert("Failed to save site settings");
        } finally {
            setIsSaving(false);
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
                    <MdSettings className="text-3xl text-mainColor" />
                    <h1 className="text-2xl font-bold text-mainColor">Site Settings</h1>
                </div>

                <p className="text-gray-600 mb-6">
                    Manage global site settings and configuration.
                </p>

                <div className="space-y-6">
                    {/* Hero Poster Image */}
                    <div className="border-b pb-6">
                        <div className="flex items-center gap-2 mb-4">
                            <MdImage className="text-2xl text-mainColor" />
                            <h3 className="text-lg font-semibold text-gray-700">
                                Hero Section - Left Poster Image
                            </h3>
                        </div>

                        <p className="text-sm text-gray-600 mb-4">
                            Upload the main deity image that appears on the left side of the homepage hero section.
                        </p>

                        <div className="flex items-start gap-4">
                            <div className="flex-1">
                                <label className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer inline-block">
                                    {isUploadingImage ? "Uploading..." : "Choose Image"}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="hidden"
                                        disabled={isUploadingImage}
                                    />
                                </label>
                                <p className="text-xs text-gray-500 mt-2">
                                    Recommended size: 1080x1440px (3:4 aspect ratio)
                                </p>
                            </div>

                            {settings.heroPosterImage && (
                                <div className="w-32 h-40 flex-shrink-0">
                                    <img
                                        src={settings.heroPosterImage}
                                        alt="Hero Poster Preview"
                                        className="w-full h-full object-cover rounded-lg border-2 border-gray-300"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Site Name */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Site Name (English) *
                        </label>
                        <input
                            type="text"
                            value={settings.siteName}
                            onChange={(e) =>
                                setSettings({ ...settings, siteName: e.target.value })
                            }
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-mainColor focus:ring-2 focus:ring-mainColor focus:outline-none"
                        />
                    </div>

                    {/* Site Name Telugu */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Site Name (Telugu) *
                        </label>
                        <input
                            type="text"
                            value={settings.siteNameTelugu}
                            onChange={(e) =>
                                setSettings({ ...settings, siteNameTelugu: e.target.value })
                            }
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-mainColor focus:ring-2 focus:ring-mainColor focus:outline-none"
                        />
                    </div>

                    {/* Contact Email */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Contact Email *
                        </label>
                        <input
                            type="email"
                            value={settings.contactEmail}
                            onChange={(e) =>
                                setSettings({ ...settings, contactEmail: e.target.value })
                            }
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-mainColor focus:ring-2 focus:ring-mainColor focus:outline-none"
                        />
                    </div>

                    {/* Contact Phone */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Contact Phone *
                        </label>
                        <input
                            type="tel"
                            value={settings.contactPhone}
                            onChange={(e) =>
                                setSettings({ ...settings, contactPhone: e.target.value })
                            }
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-mainColor focus:ring-2 focus:ring-mainColor focus:outline-none"
                        />
                    </div>

                    {/* Address */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Address *
                        </label>
                        <textarea
                            value={settings.address}
                            onChange={(e) =>
                                setSettings({ ...settings, address: e.target.value })
                            }
                            rows={3}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-mainColor focus:ring-2 focus:ring-mainColor focus:outline-none"
                        />
                    </div>

                    {/* Music Settings */}
                    <div className="border-t pt-6">
                        <div className="flex items-center gap-2 mb-4">
                            <MdMusicNote className="text-2xl text-mainColor" />
                            <h3 className="text-lg font-semibold text-gray-700">
                                Music Player Settings
                            </h3>
                        </div>

                        <div className="flex items-center gap-4 mb-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={settings.musicEnabled}
                                    onChange={(e) =>
                                        setSettings({ ...settings, musicEnabled: e.target.checked })
                                    }
                                    className="w-5 h-5 text-mainColor focus:ring-mainColor rounded"
                                />
                                <span className="text-gray-700">Enable Background Music</span>
                            </label>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Music File URL
                            </label>
                            <input
                                type="url"
                                value={settings.musicUrl}
                                onChange={(e) =>
                                    setSettings({ ...settings, musicUrl: e.target.value })
                                }
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-mainColor focus:ring-2 focus:ring-mainColor focus:outline-none"
                                placeholder="https://your-cdn.com/music.mp3"
                            />
                            <p className="text-sm text-gray-500 mt-1">
                                Upload music to Cloudflare R2 (Phase 3) and paste the URL here
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Default Volume: {Math.round(settings.musicVolume * 100)}%
                            </label>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.1"
                                value={settings.musicVolume}
                                onChange={(e) =>
                                    setSettings({ ...settings, musicVolume: parseFloat(e.target.value) })
                                }
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-mainColor"
                            />
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
                            <MdSave />
                            {isSaving ? "Saving..." : "Save Settings"}
                        </button>
                    </div>
                </div>

                {/* Info Box */}
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                        <strong>💡 Tip:</strong> The hero poster image will appear on the left side of the homepage hero section. Upload a high-quality deity image for best results.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SiteSettingsManager;
