import React, { useState, useEffect } from "react";
import { MdAdd, MdEdit, MdDelete, MdSave, MdCancel, MdImage, MdFilterList } from "react-icons/md";
import {
    getAllGalleryImages,
    addGalleryImage,
    updateGalleryImage,
    deleteGalleryImage,
} from "../../lib/contentService";
import { uploadImage, deleteImage as deleteStorageImage } from "../../lib/uploadService";

const CATEGORIES = [
    { value: "temple", label: "Temple", labelTelugu: "మందిరం" },
    { value: "festival", label: "Festival", labelTelugu: "ఉత్సవం" },
    { value: "event", label: "Event", labelTelugu: "కార్యక్రమం" },
    { value: "deity", label: "Deity", labelTelugu: "దేవుడు" },
    { value: "general", label: "General", labelTelugu: "సాధారణ" },
];

const GalleryImagesManager = () => {
    const [images, setImages] = useState([]);
    const [filteredImages, setFilteredImages] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [filterCategory, setFilterCategory] = useState("all");
    const [formData, setFormData] = useState({
        imageUrl: "",
        caption: "",
        captionTelugu: "",
        category: "general",
        enabled: true,
    });
    const [uploadingImage, setUploadingImage] = useState(false);

    useEffect(() => {
        loadImages();
    }, []);

    useEffect(() => {
        // Filter images when category filter changes
        if (filterCategory === "all") {
            setFilteredImages(images);
        } else {
            setFilteredImages(images.filter((img) => img.category === filterCategory));
        }
    }, [filterCategory, images]);

    const loadImages = async () => {
        try {
            setIsLoading(true);
            const data = await getAllGalleryImages();
            setImages(data);
            setFilteredImages(data);
        } catch (error) {
            console.error("Error loading gallery images:", error);
            alert("Failed to load gallery images");
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            imageUrl: "",
            caption: "",
            captionTelugu: "",
            category: "general",
            enabled: true,
        });
        setIsAdding(false);
        setEditingId(null);
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            setUploadingImage(true);
            const imageUrl = await uploadImage(file, "gallery");
            setFormData({ ...formData, imageUrl });
        } catch (error) {
            console.error("Error uploading image:", error);
            alert(`Failed to upload image: ${error.message}`);
        } finally {
            setUploadingImage(false);
        }
    };

    const handleAdd = () => {
        resetForm();
        setIsAdding(true);
    };

    const handleEdit = (image) => {
        setFormData({
            imageUrl: image.imageUrl,
            caption: image.caption || "",
            captionTelugu: image.captionTelugu || "",
            category: image.category || "general",
            enabled: image.enabled,
        });
        setEditingId(image.id);
    };

    const handleSave = async () => {
        // Validation
        if (!formData.imageUrl) {
            alert("Please upload an image");
            return;
        }

        try {
            const imageData = {
                ...formData,
                order: editingId ? undefined : images.length,
            };

            if (editingId) {
                await updateGalleryImage(editingId, imageData);
            } else {
                await addGalleryImage(imageData);
            }

            await loadImages();
            resetForm();
            alert(`✅ Image ${editingId ? "updated" : "added"} successfully!`);
        } catch (error) {
            console.error("Error saving image:", error);
            alert("Failed to save image");
        }
    };

    const handleDelete = async (image) => {
        if (!confirm(`Delete this image?\n\nThis action cannot be undone.`)) {
            return;
        }

        try {
            if (image.imageUrl) {
                await deleteStorageImage(image.imageUrl);
            }
            await deleteGalleryImage(image.id);
            await loadImages();
            alert("✅ Image deleted successfully!");
        } catch (error) {
            console.error("Error deleting image:", error);
            alert("Failed to delete image");
        }
    };

    const handleToggleEnabled = async (image) => {
        try {
            await updateGalleryImage(image.id, { enabled: !image.enabled });
            await loadImages();
        } catch (error) {
            console.error("Error toggling image:", error);
            alert("Failed to update image status");
        }
    };

    if (isLoading) {
        return (
            <div className="max-w-7xl">
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mainColor"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl">
            <div className="bg-white rounded-lg shadow-lg p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <MdImage className="text-3xl text-mainColor" />
                        <h1 className="text-2xl font-bold text-mainColor">Gallery Images Manager</h1>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Category Filter */}
                        <div className="flex items-center gap-2">
                            <MdFilterList className="text-gray-600" />
                            <select
                                value={filterCategory}
                                onChange={(e) => setFilterCategory(e.target.value)}
                                className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-mainColor focus:outline-none"
                            >
                                <option value="all">All Categories</option>
                                {CATEGORIES.map((cat) => (
                                    <option key={cat.value} value={cat.value}>
                                        {cat.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {!isAdding && !editingId && (
                            <button
                                onClick={handleAdd}
                                className="px-6 py-3 bg-mainColor text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 font-semibold shadow-lg"
                            >
                                <MdAdd className="text-xl" />
                                Add Image
                            </button>
                        )}
                    </div>
                </div>

                <p className="text-gray-600 mb-6">
                    Manage gallery images displayed on the website. Upload, categorize, and organize images.
                </p>

                {/* Add/Edit Form */}
                {(isAdding || editingId) && (
                    <div className="mb-6 p-6 bg-gray-50 border border-gray-200 rounded-lg">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">
                            {editingId ? "Edit Image" : "Add New Image"}
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Image Upload */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Image *
                                </label>
                                <div className="flex items-center gap-4">
                                    <label className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
                                        {uploadingImage ? "Uploading..." : "Choose Image"}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            className="hidden"
                                            disabled={uploadingImage}
                                        />
                                    </label>
                                    {formData.imageUrl && (
                                        <img
                                            src={formData.imageUrl}
                                            alt="Preview"
                                            className="h-32 w-32 object-cover rounded-lg border-2 border-gray-300"
                                        />
                                    )}
                                </div>
                            </div>

                            {/* Caption (English) */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Caption (English)
                                </label>
                                <input
                                    type="text"
                                    value={formData.caption}
                                    onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-mainColor focus:ring-2 focus:ring-mainColor focus:outline-none"
                                    placeholder="Temple Festival 2024"
                                />
                            </div>

                            {/* Caption (Telugu) */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Caption (Telugu)
                                </label>
                                <input
                                    type="text"
                                    value={formData.captionTelugu}
                                    onChange={(e) => setFormData({ ...formData, captionTelugu: e.target.value })}
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-mainColor focus:ring-2 focus:ring-mainColor focus:outline-none"
                                    placeholder="దేవాలయ ఉత్సవం 2024"
                                />
                            </div>

                            {/* Category */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Category *
                                </label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-mainColor focus:ring-2 focus:ring-mainColor focus:outline-none"
                                >
                                    {CATEGORIES.map((cat) => (
                                        <option key={cat.value} value={cat.value}>
                                            {cat.label} ({cat.labelTelugu})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Enabled */}
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="enabled"
                                    checked={formData.enabled}
                                    onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                                    className="w-5 h-5 text-mainColor focus:ring-mainColor rounded"
                                />
                                <label htmlFor="enabled" className="text-sm font-semibold text-gray-700">
                                    Enabled (visible to visitors)
                                </label>
                            </div>
                        </div>

                        {/* Form Actions */}
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={handleSave}
                                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 font-semibold"
                            >
                                <MdSave />
                                Save Image
                            </button>
                            <button
                                onClick={resetForm}
                                className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2 font-semibold"
                            >
                                <MdCancel />
                                Cancel
                            </button>
                        </div>
                    </div>
                )}

                {/* Images Grid */}
                {filteredImages.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                        <MdImage className="text-6xl text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 text-lg">
                            {filterCategory === "all" ? "No images yet" : `No ${filterCategory} images`}
                        </p>
                        <p className="text-gray-500 text-sm mt-2">
                            {filterCategory === "all" ? "Add your first image to get started" : "Try a different category filter"}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {filteredImages.map((image) => (
                            <div
                                key={image.id}
                                className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow bg-white"
                            >
                                {/* Image */}
                                <div className="aspect-square bg-gray-100">
                                    <img
                                        src={image.imageUrl}
                                        alt={image.caption || "Gallery image"}
                                        className="w-full h-full object-cover"
                                    />
                                </div>

                                {/* Content */}
                                <div className="p-3">
                                    {image.caption && (
                                        <p className="font-semibold text-gray-800 text-sm mb-1 truncate">
                                            {image.caption}
                                        </p>
                                    )}
                                    {image.captionTelugu && (
                                        <p className="text-gray-600 text-xs mb-2 truncate">{image.captionTelugu}</p>
                                    )}

                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
                                            {CATEGORIES.find((c) => c.value === image.category)?.label || image.category}
                                        </span>
                                        <span
                                            className={`px-2 py-1 rounded text-xs font-semibold ${image.enabled ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                                                }`}
                                        >
                                            {image.enabled ? "Enabled" : "Disabled"}
                                        </span>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEdit(image)}
                                            className="flex-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm flex items-center justify-center gap-1"
                                        >
                                            <MdEdit />
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleToggleEnabled(image)}
                                            className={`flex-1 px-3 py-2 rounded transition-colors text-sm ${image.enabled
                                                    ? "bg-yellow-600 hover:bg-yellow-700 text-white"
                                                    : "bg-green-600 hover:bg-green-700 text-white"
                                                }`}
                                        >
                                            {image.enabled ? "Disable" : "Enable"}
                                        </button>
                                        <button
                                            onClick={() => handleDelete(image)}
                                            className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
                                        >
                                            <MdDelete />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Info Box */}
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                        <strong>💡 Tip:</strong> Gallery images are displayed on the Photo Gallery page. Use
                        categories to organize images by type. Only enabled images will be visible to visitors.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default GalleryImagesManager;
