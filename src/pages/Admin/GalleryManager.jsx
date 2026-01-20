import React, { useState } from "react";
import { uploadImage, deleteImage } from "../../lib/r2";

const GalleryManager = () => {
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadResult, setUploadResult] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    setUploadResult(null);

    // Path convention: gallery/YYYY/MM/timestamp_filename
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const path = `gallery/${year}/${month}/${Date.now()}_${selectedFile.name}`;

    const result = await uploadImage(selectedFile, path);
    setUploading(false);

    if (result.success) {
      setUploadResult("Upload successful! URL: " + result.url);
      setSelectedFile(null);
      // Ideally, save metadata to Firestore here so we can list it.
    } else {
      setUploadResult("Upload failed: " + result.error.message);
    }
  };

  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-xl font-bold mb-4">Gallery Management</h2>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Upload New Image
        </label>
        <div className="flex gap-2">
          <input
            type="file"
            onChange={handleFileChange}
            accept="image/*"
            className="border p-2 rounded w-full"
          />
          <button
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
            className={`bg-blue-500 text-white px-4 py-2 rounded ${uploading ? "opacity-50" : "hover:bg-blue-600"}`}
          >
            {uploading ? "Uploading..." : "Upload"}
          </button>
        </div>
      </div>
      {uploadResult && (
        <div
          className={`p-3 rounded ${uploadResult.includes("successful") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
        >
          {uploadResult}
        </div>
      )}

      {/* List of existing images (Requires Firestore fetch which needs setting up) */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-2">Existing Images</h3>
        <p className="text-gray-500 text-sm">
          Image listing requires connecting R2 uploads to Firestore metadata.
        </p>
        {/* Placeholder grid */}
      </div>
    </div>
  );
};

export default GalleryManager;
