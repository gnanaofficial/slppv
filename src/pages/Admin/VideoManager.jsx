import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAdmin } from "../../context/AdminContext";
import { uploadVideo } from "../../lib/cloudflareService";
import {
  getAllVideos,
  createVideo,
  deleteVideo,
} from "../../lib/firestoreService";
import { deleteFile } from "../../lib/cloudflareService";
import LazyVideo from "../../components/common/LazyVideo";

const VideoManager = () => {
  const { t } = useTranslation();
  const { hasPermission, adminData } = useAdmin();
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [category, setCategory] = useState("video_gallery");
  const [title, setTitle] = useState({ en: "", te: "" });
  const [description, setDescription] = useState({ en: "", te: "" });
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState(null);

  const canUpload =
    hasPermission("upload_media") || hasPermission("videos.manage");

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    try {
      setLoading(true);
      const items = await getAllVideos();
      setVideos(items);
    } catch (error) {
      console.error("Error loading videos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !canUpload) return;

    setUploading(true);
    setUploadResult(null);
    setUploadProgress(0);

    try {
      // Upload to Cloudflare R2
      const result = await uploadVideo(selectedFile, category, (progress) =>
        setUploadProgress(progress),
      );

      if (result.success) {
        // Save metadata to Firestore
        await createVideo({
          url: result.url,
          path: result.path,
          category,
          title,
          description,
          uploadedBy: adminData.id,
          order: Date.now(),
        });

        setUploadResult("Video uploaded successfully!");
        setSelectedFile(null);
        setTitle({ en: "", te: "" });
        setDescription({ en: "", te: "" });

        // Reload videos
        await loadVideos();
      } else {
        setUploadResult("Upload failed: " + result.error?.message);
      }
    } catch (error) {
      console.error("Upload error:", error);
      setUploadResult("Upload failed: " + error.message);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async (video) => {
    if (!window.confirm("Are you sure you want to delete this video?")) return;

    try {
      // Delete from Cloudflare R2
      if (video.path) {
        await deleteFile(video.path);
      }

      // Delete from Firestore
      await deleteVideo(video.id);

      // Reload videos
      await loadVideos();
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete video");
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-mainColor mb-6 font-play">
        {t("admin.video_manager")}
      </h2>

      {/* Upload Section */}
      {canUpload ? (
        <div className="mb-8 p-6 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Upload Video</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("admin.category")}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-mainColor"
              >
                <option value="video_gallery">Video Gallery</option>
                <option value="home">Home</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Video
              </label>
              <input
                type="file"
                onChange={handleFileChange}
                accept="video/*"
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title (English)
              </label>
              <input
                type="text"
                value={title.en}
                onChange={(e) => setTitle({ ...title, en: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                placeholder="Video title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title (Telugu)
              </label>
              <input
                type="text"
                value={title.te}
                onChange={(e) => setTitle({ ...title, te: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                placeholder="వీడియో శీర్షిక"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (English)
              </label>
              <textarea
                value={description.en}
                onChange={(e) =>
                  setDescription({ ...description, en: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                rows="3"
                placeholder="Optional description"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (Telugu)
              </label>
              <textarea
                value={description.te}
                onChange={(e) =>
                  setDescription({ ...description, te: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                rows="3"
                placeholder="ఐచ్ఛిక వివరణ"
              />
            </div>
          </div>

          {uploading && uploadProgress > 0 && (
            <div className="mb-4">
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className="bg-mainColor h-4 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-2 text-center">
                Uploading... {uploadProgress}%
              </p>
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
            className={`w-full md:w-auto px-6 py-3 rounded-lg text-white font-semibold ${
              uploading || !selectedFile
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-mainColor hover:bg-red-700"
            } transition`}
          >
            {uploading ? t("admin.uploading") : t("admin.upload")}
          </button>

          {uploadResult && (
            <div
              className={`mt-4 p-3 rounded ${
                uploadResult.includes("successfully")
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {uploadResult}
            </div>
          )}
        </div>
      ) : (
        <div className="mb-8 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800">
            You don't have permission to upload videos.
          </p>
        </div>
      )}

      {/* Videos List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mainColor mx-auto"></div>
          <p className="mt-4 text-gray-600">{t("common.loading")}</p>
        </div>
      ) : videos.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No videos found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => (
            <div
              key={video.id}
              className="relative group bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition"
            >
              <LazyVideo src={video.url} className="w-full h-48" controls />

              <div className="p-4">
                <h3 className="font-semibold text-gray-800 truncate">
                  {video.title?.en || "Untitled"}
                </h3>
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                  {video.description?.en || "No description"}
                </p>
                <p className="text-xs text-gray-500 mt-2">{video.category}</p>
              </div>

              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition">
                <button
                  onClick={() => handleDelete(video)}
                  className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700 shadow-lg"
                  title="Delete"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VideoManager;
