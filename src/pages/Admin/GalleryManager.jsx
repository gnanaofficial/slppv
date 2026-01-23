import React, { useState, useEffect, useRef } from "react";
import { useAdmin } from "../../context/AdminContext";
import { bulkUpload, deleteFile } from "../../lib/cloudflareService";
import {
  getAllGalleryItems,
  createGalleryItem,
  deleteGalleryItem,
} from "../../lib/firestoreService";
import LazyImage from "../../components/common/LazyImage";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const GalleryManager = () => {
  const { hasPermission, adminData } = useAdmin();
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [category, setCategory] = useState("photo_gallery");
  const [eventTag, setEventTag] = useState("");
  const [customTag, setCustomTag] = useState("");
  const [uploadDate, setUploadDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [caption, setCaption] = useState({ en: "", te: "" });
  const [galleryItems, setGalleryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [bulkProgress, setBulkProgress] = useState({ current: 0, total: 0 });
  const [selectedItems, setSelectedItems] = useState([]);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const deleteTimeoutRef = useRef(null);

  const canUpload =
    hasPermission("upload_media") || hasPermission("gallery.manage");
  console.log("GalleryManager AdminData:", adminData);
  console.log("GalleryManager Permissions:", adminData?.permissions);
  console.log("Can Upload:", canUpload);

  const eventTags = [
    "Brahmotsavam",
    "Vaikunta Ekadasi",
    "Rathotsavam",
    "Vasantotsavam",
    "Daily Pooja",
    "Special Event",
    "Festival",
    "Annadanam",
    "Other",
  ];

  useEffect(() => {
    loadGalleryItems();
    return () => {
      if (deleteTimeoutRef.current) {
        clearTimeout(deleteTimeoutRef.current);
      }
    };
  }, []);

  const loadGalleryItems = async () => {
    try {
      setLoading(true);
      const items = await getAllGalleryItems();
      setGalleryItems(items);
    } catch (error) {
      console.error("Error loading gallery:", error);
      toast.error("Failed to load gallery");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0 || !canUpload) return;

    setUploading(true);
    setBulkProgress({ current: 0, total: selectedFiles.length });

    try {
      const finalTag = eventTag === "Other" ? customTag : eventTag;
      const results = await bulkUpload(
        selectedFiles,
        category,
        (current, total) => {
          setBulkProgress({ current, total });
        },
      );

      for (let i = 0; i < results.length; i++) {
        const result = results[i];
        if (result.success) {
          await createGalleryItem({
            url: result.url,
            path: result.path,
            category,
            fileName: result.file.name,
            uploadedBy: adminData.id,
            caption,
            eventTag: finalTag,
            uploadDate: uploadDate,
            order: Date.now() + i,
          });
        }
      }

      const successCount = results.filter((r) => r.success).length;
      toast.success(
        `🎉 Successfully uploaded ${successCount} of ${selectedFiles.length} images!`,
      );
      setSelectedFiles([]);
      setCaption({ en: "", te: "" });
      setEventTag("");
      setCustomTag("");
      await loadGalleryItems();
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Upload failed: " + error.message);
    } finally {
      setUploading(false);
      setBulkProgress({ current: 0, total: 0 });
    }
  };

  // DELETE WITH 10-SECOND UNDO
  const deleteImage = async (itemId, itemPath, itemName) => {
    let countdown = 10;
    let cancelled = false;

    const UndoButton = ({ closeToast }) => (
      <button
        onClick={() => {
          cancelled = true;
          if (deleteTimeoutRef.current) {
            clearTimeout(deleteTimeoutRef.current);
          }
          closeToast();
          toast.info(`Deletion of "${itemName}" cancelled`);
        }}
        className="bg-white text-mainColor px-4 py-2 rounded font-semibold hover:bg-gray-100 transition"
      >
        UNDO
      </button>
    );

    const toastId = toast.warning(
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-semibold">Deleting "{itemName}"</p>
          <p className="text-sm">
            Deleting in <span id={`countdown-${itemId}`}>{countdown}</span>{" "}
            seconds...
          </p>
        </div>
        <UndoButton />
      </div>,
      {
        autoClose: false,
        closeButton: false,
        draggable: false,
      },
    );

    // Countdown interval
    const countdownInterval = setInterval(() => {
      countdown--;
      const countdownEl = document.getElementById(`countdown-${itemId}`);
      if (countdownEl) {
        countdownEl.textContent = countdown;
      }
      if (countdown <= 0) {
        clearInterval(countdownInterval);
      }
    }, 1000);

    // Execute delete after 10 seconds
    deleteTimeoutRef.current = setTimeout(async () => {
      clearInterval(countdownInterval);

      if (cancelled) return;

      toast.dismiss(toastId);
      const loadingToast = toast.loading(`Deleting "${itemName}"...`);

      try {
        if (itemPath) {
          await deleteFile(itemPath);
        }
        await deleteGalleryItem(itemId);
        await loadGalleryItems();

        toast.update(loadingToast, {
          render: `✅ "${itemName}" deleted successfully!`,
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
      } catch (error) {
        console.error("Delete error:", error);
        toast.update(loadingToast, {
          render: `❌ Failed to delete: ${error.message}`,
          type: "error",
          isLoading: false,
          autoClose: 5000,
        });
      }
    }, 10000);
  };

  // BULK DELETE WITH 10-SECOND UNDO
  const handleBulkDelete = async () => {
    if (selectedItems.length === 0) {
      toast.warning("No items selected");
      return;
    }

    const itemsToDelete = [...selectedItems];
    const count = itemsToDelete.length;
    let countdown = 10;
    let cancelled = false;

    const UndoButton = ({ closeToast }) => (
      <button
        onClick={() => {
          cancelled = true;
          if (deleteTimeoutRef.current) {
            clearTimeout(deleteTimeoutRef.current);
          }
          closeToast();
          toast.info(`Bulk deletion of ${count} items cancelled`);
        }}
        className="bg-white text-mainColor px-4 py-2 rounded font-semibold hover:bg-gray-100 transition"
      >
        UNDO
      </button>
    );

    const toastId = toast.warning(
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-semibold">Deleting {count} items</p>
          <p className="text-sm">
            Deleting in <span id="bulk-countdown">{countdown}</span> seconds...
          </p>
        </div>
        <UndoButton />
      </div>,
      {
        autoClose: false,
        closeButton: false,
        draggable: false,
      },
    );

    // Countdown interval
    const countdownInterval = setInterval(() => {
      countdown--;
      const countdownEl = document.getElementById("bulk-countdown");
      if (countdownEl) {
        countdownEl.textContent = countdown;
      }
      if (countdown <= 0) {
        clearInterval(countdownInterval);
      }
    }, 1000);

    // Execute bulk delete after 10 seconds
    deleteTimeoutRef.current = setTimeout(async () => {
      clearInterval(countdownInterval);

      if (cancelled) return;

      toast.dismiss(toastId);
      const loadingToast = toast.loading(`Deleting ${count} items...`);

      try {
        for (const itemId of itemsToDelete) {
          const item = galleryItems.find((i) => i.id === itemId);
          if (item) {
            if (item.path) {
              await deleteFile(item.path);
            }
            await deleteGalleryItem(item.id);
          }
        }

        setSelectedItems([]);
        await loadGalleryItems();

        toast.update(loadingToast, {
          render: `✅ Successfully deleted ${count} items!`,
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
      } catch (error) {
        console.error("Bulk delete error:", error);
        toast.update(loadingToast, {
          render: `❌ Bulk delete failed: ${error.message}`,
          type: "error",
          isLoading: false,
          autoClose: 5000,
        });
      }
    }, 10000);
  };

  const toggleSelectItem = (itemId) => {
    setSelectedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId],
    );
  };

  const selectAll = () => {
    setSelectedItems(filteredItems.map((item) => item.id));
    toast.info(`Selected ${filteredItems.length} items`);
  };

  const deselectAll = () => {
    setSelectedItems([]);
  };

  const filteredItems = galleryItems.filter((item) => {
    if (filter !== "all" && item.category !== filter) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matches =
        item.caption?.en?.toLowerCase().includes(query) ||
        item.caption?.te?.toLowerCase().includes(query) ||
        item.eventTag?.toLowerCase().includes(query) ||
        item.fileName?.toLowerCase().includes(query);
      if (!matches) return false;
    }
    return true;
  });

  return (
    <div className="bg-white p-4 md:p-6 rounded-lg shadow-md">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

      <h2 className="text-xl md:text-2xl font-bold text-mainColor mb-4 md:mb-6">
        Gallery Manager
      </h2>

      {/* Upload Section */}
      {canUpload && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Upload Images</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="border rounded px-3 py-2"
            >
              <option value="photo_gallery">Photo Gallery</option>
              <option value="home_hero">Home Hero</option>
              <option value="sevas">Sevas</option>
              <option value="other">Other</option>
            </select>

            <select
              value={eventTag}
              onChange={(e) => setEventTag(e.target.value)}
              className="border rounded px-3 py-2"
            >
              <option value="">Select Event</option>
              {eventTags.map((tag) => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
            </select>

            {eventTag === "Other" && (
              <input
                type="text"
                value={customTag}
                onChange={(e) => setCustomTag(e.target.value)}
                className="border rounded px-3 py-2"
                placeholder="Custom event name"
              />
            )}

            <input
              type="date"
              value={uploadDate}
              onChange={(e) => setUploadDate(e.target.value)}
              className="border rounded px-3 py-2"
            />

            <div className="md:col-span-2">
              <input
                type="file"
                onChange={handleFileChange}
                accept="image/*"
                multiple
                className="w-full border rounded px-3 py-2"
              />
            </div>
          </div>

          {selectedFiles.length > 0 && (
            <div className="mb-4 p-3 bg-white rounded border-2 border-mainColor">
              <div className="flex justify-between mb-2">
                <span className="font-semibold">
                  📷 {selectedFiles.length} Selected
                </span>
                <button
                  onClick={() => setSelectedFiles([])}
                  className="text-red-600 text-sm hover:underline"
                >
                  Clear All
                </button>
              </div>
              <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                {selectedFiles.map((file, idx) => (
                  <div key={idx} className="relative group">
                    <img
                      src={URL.createObjectURL(file)}
                      alt=""
                      className="w-full h-20 object-cover rounded border"
                    />
                    <button
                      onClick={() =>
                        setSelectedFiles(
                          selectedFiles.filter((_, i) => i !== idx),
                        )
                      }
                      className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full w-5 h-5 text-xs hover:bg-red-700"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              value={caption.en}
              onChange={(e) => setCaption({ ...caption, en: e.target.value })}
              className="border rounded px-3 py-2"
              placeholder="Caption (English)"
            />
            <input
              type="text"
              value={caption.te}
              onChange={(e) => setCaption({ ...caption, te: e.target.value })}
              className="border rounded px-3 py-2"
              placeholder="Caption (Telugu)"
            />
          </div>

          {bulkProgress.total > 0 && (
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span>Uploading...</span>
                <span>
                  {bulkProgress.current} / {bulkProgress.total}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-mainColor h-2 rounded-full transition-all"
                  style={{
                    width: `${(bulkProgress.current / bulkProgress.total) * 100}%`,
                  }}
                ></div>
              </div>
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={selectedFiles.length === 0 || uploading}
            className={`w-full px-6 py-3 rounded text-white font-semibold ${
              uploading || selectedFiles.length === 0
                ? "bg-gray-400"
                : "bg-mainColor hover:bg-red-700"
            }`}
          >
            {uploading
              ? `Uploading ${bulkProgress.current}/${bulkProgress.total}...`
              : `Upload ${selectedFiles.length} Image(s)`}
          </button>
        </div>
      )}

      {/* Search, Filter, Actions */}
      <div className="mb-4 grid grid-cols-1 md:grid-cols-12 gap-3">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="md:col-span-5 border rounded px-3 py-2"
          placeholder="Search..."
        />

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="md:col-span-3 border rounded px-3 py-2"
        >
          <option value="all">All Categories</option>
          <option value="photo_gallery">Photo Gallery</option>
          <option value="home_hero">Home Hero</option>
          <option value="sevas">Sevas</option>
        </select>

        <button
          onClick={loadGalleryItems}
          className="md:col-span-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          🔄 Refresh
        </button>

        {selectedItems.length > 0 && (
          <button
            onClick={handleBulkDelete}
            className="md:col-span-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            🗑️ Delete ({selectedItems.length})
          </button>
        )}
      </div>

      {selectedItems.length > 0 && (
        <div className="mb-4 flex gap-2">
          <button
            onClick={selectAll}
            className="px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
          >
            Select All
          </button>
          <button
            onClick={deselectAll}
            className="px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
          >
            Deselect All
          </button>
        </div>
      )}

      <div className="mb-3 text-sm text-gray-600">
        Showing {filteredItems.length} of {galleryItems.length} images
      </div>

      {/* Gallery Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mainColor mx-auto"></div>
          <p className="mt-4">Loading...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded">
          <p className="text-gray-500">No images found</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="relative bg-white border-2 rounded overflow-hidden hover:border-mainColor transition"
            >
              <input
                type="checkbox"
                checked={selectedItems.includes(item.id)}
                onChange={() => toggleSelectItem(item.id)}
                className="absolute top-2 left-2 w-5 h-5 z-10 cursor-pointer"
              />

              <LazyImage
                src={item.url}
                alt={item.fileName}
                className="w-full h-40 object-cover"
              />

              <div className="p-2">
                {item.eventTag && (
                  <span className="inline-block bg-mainColor text-white text-xs px-2 py-1 rounded mb-1">
                    {item.eventTag}
                  </span>
                )}
                <p className="text-xs truncate">{item.fileName}</p>
              </div>

              <button
                type="button"
                onClick={() => deleteImage(item.id, item.path, item.fileName)}
                className="absolute top-2 right-2 bg-red-600 text-white p-1.5 rounded-full hover:bg-red-700 z-10 shadow-lg transition hover:scale-110"
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
          ))}
        </div>
      )}
    </div>
  );
};

export default GalleryManager;
