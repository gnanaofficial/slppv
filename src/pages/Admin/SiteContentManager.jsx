import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAdmin } from "../../context/AdminContext";
import { uploadImage, deleteFile } from "../../lib/cloudflareService";
import { getSiteContent, updateSiteContent } from "../../lib/firestoreService";
import toast from "react-hot-toast";
import { FiUpload, FiTrash2, FiEye, FiEyeOff, FiSave } from "react-icons/fi";

const SiteContentManager = () => {
  const { t } = useTranslation();
  const { adminData } = useAdmin();
  const [activeTab, setActiveTab] = useState("hero"); // 'hero' or 'popup'
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Hero Section State
  const [heroImages, setHeroImages] = useState([]);
  const [newHeroFiles, setNewHeroFiles] = useState([]);
  const [isUploadingHero, setIsUploadingHero] = useState(false);

  // Popup Section State
  const [popupConfig, setPopupConfig] = useState({
    active: false,
    imageUrl: "",
    imagePath: "",
    title: "",
    link: "",
  });
  const [newPopupFile, setNewPopupFile] = useState(null);
  const [isUploadingPopup, setIsUploadingPopup] = useState(false);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    setLoading(true);
    try {
      // Fetch Hero Config
      const heroDoc = await getSiteContent("hero");
      if (heroDoc && heroDoc.images) {
        setHeroImages(heroDoc.images);
      }

      // Fetch Popup Config
      const popupDoc = await getSiteContent("popup");
      if (popupDoc) {
        setPopupConfig({
          active: popupDoc.active || false,
          imageUrl: popupDoc.imageUrl || "",
          imagePath: popupDoc.imagePath || "",
          title: popupDoc.title || "",
          link: popupDoc.link || "",
        });
      }
    } catch (error) {
      console.error("Error fetching site content:", error);
      toast.error("Failed to load content");
    } finally {
      setLoading(false);
    }
  };

  // ==================== HERO SECTION HANDLERS ====================

  const handleHeroFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      // Convert FileList to Array
      setNewHeroFiles(Array.from(e.target.files));
    }
  };

  const handleUploadHeroImages = async () => {
    if (newHeroFiles.length === 0) return;

    setIsUploadingHero(true);
    const uploadedImages = [];

    try {
      for (const file of newHeroFiles) {
        const result = await uploadImage(file, "home_hero");
        if (result.success) {
          uploadedImages.push({
            url: result.url,
            path: result.path,
            id: Date.now() + Math.random().toString(36).substr(2, 9),
            uploadedAt: new Date().toISOString(),
          });
        } else {
          toast.error(`Failed to upload ${file.name}`);
        }
      }

      if (uploadedImages.length > 0) {
        const updatedImages = [...heroImages, ...uploadedImages];
        await updateSiteContent(
          "hero",
          { images: updatedImages },
          adminData.email,
        );
        setHeroImages(updatedImages);
        setNewHeroFiles([]);
        toast.success(`Successfully uploaded ${uploadedImages.length} images`);
      }
    } catch (error) {
      console.error("Error uploading hero images:", error);
      toast.error("Upload failed");
    } finally {
      setIsUploadingHero(false);
    }
  };

  const handleDeleteHeroImage = async (imageToDelete) => {
    if (!window.confirm("Are you sure you want to delete this image?")) return;

    try {
      // Delete from R2 if path exists
      if (imageToDelete.path) {
        await deleteFile(imageToDelete.path);
      }

      // Update Firestore
      const updatedImages = heroImages.filter(
        (img) => img.id !== imageToDelete.id,
      );
      await updateSiteContent(
        "hero",
        { images: updatedImages },
        adminData.email,
      );
      setHeroImages(updatedImages);
      toast.success("Image deleted successfully");
    } catch (error) {
      console.error("Error deleting hero image:", error);
      toast.error("Failed to delete image");
    }
  };

  // ==================== POPUP SECTION HANDLERS ====================

  const handlePopupFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setNewPopupFile(e.target.files[0]);
    }
  };

  const handleSavePopupConfig = async () => {
    setSaving(true);
    setIsUploadingPopup(true);

    try {
      let updatedConfig = { ...popupConfig };

      // Upload new image if selected
      if (newPopupFile) {
        // Delete old image if exists
        if (popupConfig.imagePath) {
          await deleteFile(popupConfig.imagePath);
        }

        // Upload new
        const result = await uploadImage(newPopupFile, "popup");
        if (result.success) {
          updatedConfig.imageUrl = result.url;
          updatedConfig.imagePath = result.path;
        } else {
          throw new Error("Failed to upload popup image");
        }
      }

      // Update Firestore
      await updateSiteContent("popup", updatedConfig, adminData.email);
      setPopupConfig(updatedConfig);
      setNewPopupFile(null);
      toast.success("Popup settings updated successfully");
    } catch (error) {
      console.error("Error saving popup config:", error);
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
      setIsUploadingPopup(false);
    }
  };

  const togglePopupActive = async () => {
    const newStatus = !popupConfig.active;
    try {
      await updateSiteContent(
        "popup",
        { ...popupConfig, active: newStatus },
        adminData.email,
      );
      setPopupConfig((prev) => ({ ...prev, active: newStatus }));
      toast.success(`Popup ${newStatus ? "enabled" : "disabled"}`);
    } catch (error) {
      console.error("Error toggling popup:", error);
      toast.error("Failed to update status");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mainColor"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md min-h-screen">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <h1 className="text-2xl font-bold text-mainColor font-play">
          Site Content Manager
        </h1>
        <p className="text-gray-600">
          Manage Hero section images and promotional popups
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          className={`px-6 py-3 font-semibold text-sm transition-colors ${
            activeTab === "hero"
              ? "border-b-2 border-mainColor text-mainColor"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("hero")}
        >
          Hero Images
        </button>
        <button
          className={`px-6 py-3 font-semibold text-sm transition-colors ${
            activeTab === "popup"
              ? "border-b-2 border-mainColor text-mainColor"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("popup")}
        >
          Event Popup
        </button>
      </div>

      <div className="p-6">
        {/* ================= HERO TAB ================= */}
        {activeTab === "hero" && (
          <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-6">
              <h3 className="font-bold text-blue-800 mb-2">
                Upload New Images
              </h3>
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleHeroFileChange}
                    className="block w-full text-sm text-slate-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-full file:border-0
                      file:text-sm file:font-semibold
                      file:bg-blue-100 file:text-blue-700
                      hover:file:bg-blue-200"
                  />
                </div>
                <button
                  onClick={handleUploadHeroImages}
                  disabled={newHeroFiles.length === 0 || isUploadingHero}
                  className={`px-4 py-2 rounded-lg text-white font-semibold flex items-center gap-2 ${
                    newHeroFiles.length === 0 || isUploadingHero
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-mainColor hover:bg-red-700"
                  }`}
                >
                  {isUploadingHero ? (
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  ) : (
                    <FiUpload />
                  )}
                  Upload {newHeroFiles.length > 0 && `(${newHeroFiles.length})`}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {heroImages.map((img, index) => (
                <div
                  key={img.id || index}
                  className="group relative bg-gray-100 rounded-lg overflow-hidden border border-gray-200 aspect-video shadow-sm hover:shadow-md transition"
                >
                  <img
                    src={img.url}
                    alt={`Hero ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      onClick={() => handleDeleteHeroImage(img)}
                      className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transform hover:scale-110 transition"
                      title="Delete Image"
                    >
                      <FiTrash2 size={20} />
                    </button>
                  </div>
                </div>
              ))}
              {heroImages.length === 0 && (
                <div className="col-span-full text-center py-12 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                  No images uploaded. Using default application images.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= POPUP TAB ================= */}
        {activeTab === "popup" && (
          <div className="max-w-2xl mx-auto space-y-8">
            {/* Status Toggle */}
            <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div>
                <h3 className="font-bold text-gray-800">Popup Status</h3>
                <p className="text-sm text-gray-500">
                  Enable/Disable the popup on the homepage
                </p>
              </div>
              <button
                onClick={togglePopupActive}
                className={`px-6 py-2 rounded-full font-bold transition-colors flex items-center gap-2 ${
                  popupConfig.active
                    ? "bg-green-100 text-green-700 hover:bg-green-200"
                    : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                }`}
              >
                {popupConfig.active ? (
                  <>
                    <FiEye /> Active
                  </>
                ) : (
                  <>
                    <FiEyeOff /> Inactive
                  </>
                )}
              </button>
            </div>

            {/* Config Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Popup Title (Optional)
                </label>
                <input
                  type="text"
                  value={popupConfig.title}
                  onChange={(e) =>
                    setPopupConfig({ ...popupConfig, title: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mainColor focus:outline-none"
                  placeholder="e.g. Special Festival Announcement"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Poster Image
                </label>
                <div className="flex gap-4 items-start">
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePopupFileChange}
                      className="block w-full text-sm text-slate-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-sm file:font-semibold
                        file:bg-blue-50 file:text-blue-700
                        hover:file:bg-blue-100"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Recommended size: 600x800px or similar portrait/square
                      ratio.
                    </p>
                  </div>
                </div>
              </div>

              {/* Preview */}
              {(popupConfig.imageUrl || newPopupFile) && (
                <div className="mt-4">
                  <p className="text-sm font-semibold text-gray-600 mb-2">
                    Preview:
                  </p>
                  <div className="w-full max-w-xs mx-auto border-4 border-gray-800 rounded-lg overflow-hidden shadow-xl">
                    <img
                      src={
                        newPopupFile
                          ? URL.createObjectURL(newPopupFile)
                          : popupConfig.imageUrl
                      }
                      alt="Popup Preview"
                      className="w-full h-auto"
                    />
                  </div>
                </div>
              )}

              <div className="pt-4 flex justify-end">
                <button
                  onClick={handleSavePopupConfig}
                  disabled={saving || isUploadingPopup}
                  className={`px-8 py-3 rounded-lg text-white font-bold text-lg flex items-center gap-2 ${
                    saving || isUploadingPopup
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-mainColor hover:bg-red-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
                  }`}
                >
                  {saving || isUploadingPopup ? (
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                  ) : (
                    <FiSave />
                  )}
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SiteContentManager;
