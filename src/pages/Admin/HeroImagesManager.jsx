import React, { useState, useEffect } from "react";
import { MdImage, MdAdd, MdDelete, MdEdit, MdSave, MdCancel, MdDragIndicator } from "react-icons/md";
import {
    getAllHeroImages,
    addHeroImage,
    updateHeroImage,
    deleteHeroImage,
    reorderHeroImages,
} from "../../lib/contentService";
import { uploadImage, deleteImage as deleteStorageImage } from "../../lib/uploadService";

const HeroImagesManager = () => {
    const [images, setImages] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({});

    useEffect(() => {
        loadImages();
    }, []);

    const loadImages = async () => {
        try {
            setIsLoading(true);
            const data = await getAllHeroImages();
            setImages(data);
        } catch (error) {
            console.error("Error loading images:", error);
            alert("Failed to load hero images");
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            setIsUploading(true);
            setUploadProgress(0);

            // Upload image
            const imageUrl = await uploadImage(file, "hero-images", (progress) => {
                setUploadProgress(progress);
            });

            // Add to Firestore
            const newImage = {
                imageUrl,
                caption: "",
                captionTelugu: "",
                order: images.length,
                enabled: true,
            };

            await addHeroImage(newImage);
            await loadImages();

            alert("✅ Image uploaded successfully!");
            e.target.value = ""; // Reset input
        } catch (error) {
            console.error("Error uploading image:", error);
            alert(`❌ Failed to upload image: ${error.message}`);
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
        }
    };

    const handleEdit = (image) => {
        setEditingId(image.id);
        setEditForm({
            caption: image.caption || "",
            captionTelugu: image.captionTelugu || "",
            enabled: image.enabled,
        });
    };

    const handleSaveEdit = async (id) => {
        try {
            await updateHeroImage(id, editForm);
            await loadImages();
            setEditingId(null);
            setEditForm({});
        } catch (error) {
            console.error("Error updating image:", error);
            alert("Failed to update image");
        }
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditForm({});
    };

    const handleDelete = async (image) => {
        if (!confirm(`Delete this hero image?\n\nThis action cannot be undone.`)) {
            return;
        }

        try {
            // Delete from Storage
            await deleteStorageImage(image.imageUrl);

            // Delete from Firestore
            await deleteHeroImage(image.id);
            await loadImages();

            alert("✅ Image deleted successfully!");
        } catch (error) {
            console.error("Error deleting image:", error);
            alert("Failed to delete image");
        }
    };

    const handleToggleEnabled = async (image) => {
        try {
            await updateHeroImage(image.id, { enabled: !image.enabled });
            await loadImages();
        } catch (error) {
            console.error("Error toggling image:", error);
            alert("Failed to update image status");
        }
    };

    if (isLoading) {
        return (
            <div className="max-w-6xl">
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mainColor"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl">
            <div className="bg-white rounded-lg shadow-lg p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <MdImage className="text-3xl text-mainColor" />
                        <h1 className="text-2xl font-bold text-mainColor">Hero Images Manager</h1>
                    </div>

                    <label className="px-6 py-3 bg-mainColor text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 font-semibold shadow-lg cursor-pointer">
                        <MdAdd className="text-xl" />
                        Upload Image
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleUpload}
                            className="hidden"
                            disabled={isUploading}
                        />
                    </label>
                </div>

                {/* Upload Progress */}
                {isUploading && (
                    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800 mb-2">Uploading image... {uploadProgress.toFixed(0)}%</p>
                        <div className="w-full bg-blue-200 rounded-full h-2">
                            <div
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${uploadProgress}%` }}
                            ></div>
                        </div>
                    </div>
                )}

                {/* Info */}
                <p className="text-gray-600 mb-6">
                    Manage hero carousel images for the homepage. Images are displayed in order. Drag to reorder (coming soon).
                </p>

                {/* Images Grid */}
                {images.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                        <MdImage className="text-6xl text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 text-lg">No hero images yet</p>
                        <p className="text-gray-500 text-sm mt-2">Upload your first image to get started</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {images.map((image) => (
                            <div
                                key={image.id}
                                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                            >
                                <div className="flex gap-4">
                                    {/* Drag Handle */}
                                    <div className="flex items-center text-gray-400 cursor-move">
                                        <MdDragIndicator className="text-2xl" />
                                    </div>

                                    {/* Image Preview */}
                                    <div className="w-48 h-32 flex-shrink-0">
                                        <img
                                            src={image.imageUrl}
                                            alt={image.caption || "Hero image"}
                                            className="w-full h-full object-cover rounded-lg"
                                        />
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1">
                                        {editingId === image.id ? (
                                            // Edit Mode
                                            <div className="space-y-3">
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                                                        Caption (English)
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={editForm.caption}
                                                        onChange={(e) => setEditForm({ ...editForm, caption: e.target.value })}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-mainColor focus:ring-2 focus:ring-mainColor focus:outline-none"
                                                        placeholder="Welcome to SLPPV Temple"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                                                        Caption (Telugu)
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={editForm.captionTelugu}
                                                        onChange={(e) => setEditForm({ ...editForm, captionTelugu: e.target.value })}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-mainColor focus:ring-2 focus:ring-mainColor focus:outline-none"
                                                        placeholder="శ్రీ లక్ష్మీ పద్మావతి..."
                                                    />
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="checkbox"
                                                        id={`enabled-${image.id}`}
                                                        checked={editForm.enabled}
                                                        onChange={(e) => setEditForm({ ...editForm, enabled: e.target.checked })}
                                                        className="w-4 h-4 text-mainColor focus:ring-mainColor rounded"
                                                    />
                                                    <label htmlFor={`enabled-${image.id}`} className="text-sm font-semibold text-gray-700">
                                                        Enabled
                                                    </label>
                                                </div>
                                            </div>
                                        ) : (
                                            // View Mode
                                            <div>
                                                <h3 className="font-semibold text-gray-800 mb-1">
                                                    {image.caption || <span className="text-gray-400 italic">No caption</span>}
                                                </h3>
                                                {image.captionTelugu && (
                                                    <p className="text-gray-600 text-sm mb-2">{image.captionTelugu}</p>
                                                )}
                                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                                    <span>Order: {image.order}</span>
                                                    <span className={`px-2 py-1 rounded text-xs font-semibold ${image.enabled ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                                                        }`}>
                                                        {image.enabled ? "Enabled" : "Disabled"}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex flex-col gap-2">
                                        {editingId === image.id ? (
                                            <>
                                                <button
                                                    onClick={() => handleSaveEdit(image.id)}
                                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                                                >
                                                    <MdSave />
                                                    Save
                                                </button>
                                                <button
                                                    onClick={handleCancelEdit}
                                                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
                                                >
                                                    <MdCancel />
                                                    Cancel
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={() => handleEdit(image)}
                                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                                                >
                                                    <MdEdit />
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleToggleEnabled(image)}
                                                    className={`px-4 py-2 rounded-lg transition-colors ${image.enabled
                                                            ? "bg-yellow-600 hover:bg-yellow-700 text-white"
                                                            : "bg-green-600 hover:bg-green-700 text-white"
                                                        }`}
                                                >
                                                    {image.enabled ? "Disable" : "Enable"}
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(image)}
                                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                                                >
                                                    <MdDelete />
                                                    Delete
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Info Box */}
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                        <strong>💡 Tip:</strong> Hero images are displayed on the homepage carousel.
                        Only enabled images will be visible to visitors. Recommended image size: 1920x1080px.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default HeroImagesManager;
