import React, { useState, useEffect } from "react";
import { MdAdd, MdEdit, MdDelete, MdSave, MdCancel } from "react-icons/md";
import { FaOm } from "react-icons/fa";
import {
  getAllSevas,
  addSeva,
  updateSeva,
  deleteSeva,
} from "../../lib/contentService";
import { uploadImage, deleteImage as deleteStorageImage } from "../../lib/uploadService";

const SevaManager = () => {
  const [sevas, setSevas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    nameTelugu: "",
    description: "",
    descriptionTelugu: "",
    price: "",
    imageUrl: "",
    category: "daily",
    enabled: true,
  });
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    loadSevas();
  }, []);

  const loadSevas = async () => {
    try {
      setIsLoading(true);
      const data = await getAllSevas();
      setSevas(data);
    } catch (error) {
      console.error("Error loading sevas:", error);
      alert("Failed to load sevas");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      nameTelugu: "",
      description: "",
      descriptionTelugu: "",
      price: "",
      imageUrl: "",
      category: "daily",
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
      const imageUrl = await uploadImage(file, "sevas");
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

  const handleEdit = (seva) => {
    setFormData({
      name: seva.name,
      nameTelugu: seva.nameTelugu || "",
      description: seva.description,
      descriptionTelugu: seva.descriptionTelugu || "",
      price: seva.price.toString(),
      imageUrl: seva.imageUrl || "",
      category: seva.category || "daily",
      enabled: seva.enabled,
    });
    setEditingId(seva.id);
  };

  const handleSave = async () => {
    // Validation
    if (!formData.name || !formData.description || !formData.price) {
      alert("Please fill in all required fields (Name, Description, Price)");
      return;
    }

    try {
      const sevaData = {
        ...formData,
        price: parseFloat(formData.price),
        order: editingId ? undefined : sevas.length,
      };

      if (editingId) {
        await updateSeva(editingId, sevaData);
      } else {
        await addSeva(sevaData);
      }

      await loadSevas();
      resetForm();
      alert(`✅ Seva ${editingId ? "updated" : "added"} successfully!`);
    } catch (error) {
      console.error("Error saving seva:", error);
      alert("Failed to save seva");
    }
  };

  const handleDelete = async (seva) => {
    if (!confirm(`Delete "${seva.name}"?\n\nThis action cannot be undone.`)) {
      return;
    }

    try {
      if (seva.imageUrl) {
        await deleteStorageImage(seva.imageUrl);
      }
      await deleteSeva(seva.id);
      await loadSevas();
      alert("✅ Seva deleted successfully!");
    } catch (error) {
      console.error("Error deleting seva:", error);
      alert("Failed to delete seva");
    }
  };

  const handleToggleEnabled = async (seva) => {
    try {
      await updateSeva(seva.id, { enabled: !seva.enabled });
      await loadSevas();
    } catch (error) {
      console.error("Error toggling seva:", error);
      alert("Failed to update seva status");
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
            <FaOm className="text-3xl text-mainColor" />
            <h1 className="text-2xl font-bold text-mainColor">Seva Manager</h1>
          </div>

          {!isAdding && !editingId && (
            <button
              onClick={handleAdd}
              className="px-6 py-3 bg-mainColor text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 font-semibold shadow-lg"
            >
              <MdAdd className="text-xl" />
              Add New Seva
            </button>
          )}
        </div>

        <p className="text-gray-600 mb-6">
          Manage sevas offered at the temple. Add bilingual descriptions and pricing.
        </p>

        {/* Add/Edit Form */}
        {(isAdding || editingId) && (
          <div className="mb-6 p-6 bg-gray-50 border border-gray-200 rounded-lg">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              {editingId ? "Edit Seva" : "Add New Seva"}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name (English) */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Seva Name (English) *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-mainColor focus:ring-2 focus:ring-mainColor focus:outline-none"
                  placeholder="Abhishekam"
                />
              </div>

              {/* Name (Telugu) */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Seva Name (Telugu)
                </label>
                <input
                  type="text"
                  value={formData.nameTelugu}
                  onChange={(e) => setFormData({ ...formData, nameTelugu: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-mainColor focus:ring-2 focus:ring-mainColor focus:outline-none"
                  placeholder="అభిషేకం"
                />
              </div>

              {/* Description (English) */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description (English) *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-mainColor focus:ring-2 focus:ring-mainColor focus:outline-none"
                  rows="3"
                  placeholder="Special abhishekam for Lord Venkateswara..."
                />
              </div>

              {/* Description (Telugu) */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description (Telugu)
                </label>
                <textarea
                  value={formData.descriptionTelugu}
                  onChange={(e) => setFormData({ ...formData, descriptionTelugu: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-mainColor focus:ring-2 focus:ring-mainColor focus:outline-none"
                  rows="3"
                  placeholder="వెంకటేశ్వర స్వామికి ప్రత్యేక అభిషేకం..."
                />
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Price (₹) *
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-mainColor focus:ring-2 focus:ring-mainColor focus:outline-none"
                  placeholder="500"
                  min="0"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-mainColor focus:ring-2 focus:ring-mainColor focus:outline-none"
                >
                  <option value="daily">Daily</option>
                  <option value="special">Special</option>
                  <option value="festival">Festival</option>
                </select>
              </div>

              {/* Image Upload */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Seva Image
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
                      className="h-20 w-20 object-cover rounded-lg border-2 border-gray-300"
                    />
                  )}
                </div>
              </div>

              {/* Enabled */}
              <div className="md:col-span-2 flex items-center gap-2">
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
                Save Seva
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

        {/* Sevas List */}
        {sevas.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <FaOm className="text-6xl text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No sevas yet</p>
            <p className="text-gray-500 text-sm mt-2">Add your first seva to get started</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sevas.map((seva) => (
              <div
                key={seva.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex gap-4">
                  {/* Image */}
                  {seva.imageUrl && (
                    <div className="w-32 h-32 flex-shrink-0">
                      <img
                        src={seva.imageUrl}
                        alt={seva.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-800">{seva.name}</h3>
                    {seva.nameTelugu && (
                      <p className="text-gray-600 text-sm mb-2">{seva.nameTelugu}</p>
                    )}
                    <p className="text-gray-700 mb-2">{seva.description}</p>
                    {seva.descriptionTelugu && (
                      <p className="text-gray-600 text-sm mb-2">{seva.descriptionTelugu}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm">
                      <span className="font-semibold text-mainColor">₹{seva.price}</span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
                        {seva.category}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${seva.enabled ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                        }`}>
                        {seva.enabled ? "Enabled" : "Disabled"}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => handleEdit(seva)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                      <MdEdit />
                      Edit
                    </button>
                    <button
                      onClick={() => handleToggleEnabled(seva)}
                      className={`px-4 py-2 rounded-lg transition-colors ${seva.enabled
                          ? "bg-yellow-600 hover:bg-yellow-700 text-white"
                          : "bg-green-600 hover:bg-green-700 text-white"
                        }`}
                    >
                      {seva.enabled ? "Disable" : "Enable"}
                    </button>
                    <button
                      onClick={() => handleDelete(seva)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                    >
                      <MdDelete />
                      Delete
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
            <strong>💡 Tip:</strong> Sevas are displayed on the sevas page.
            Only enabled sevas will be visible to visitors. Add bilingual content for better accessibility.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SevaManager;
