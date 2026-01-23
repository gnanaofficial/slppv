import React, { useState, useEffect } from "react";
import { db } from "../../lib/firebase";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { useForm, useFieldArray } from "react-hook-form";

const SevaManager = () => {
  const [sevas, setSevas] = useState([]);
  const [loading, setLoading] = useState(true);
  const { register, handleSubmit, reset, control, watch, setValue } = useForm({
    defaultValues: {
      nameEn: "",
      nameTe: "",
      descriptionEn: "",
      descriptionTe: "",
      type: "daily",
      dayOfWeek: 0,
      date: "",
      timings: [""],
      price: 0,
      active: true,
      order: 0,
    },
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: "timings",
  });
  const [editingId, setEditingId] = useState(null);
  const sevaType = watch("type");

  const fetchSevas = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "sevas"));
      const sevasData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setSevas(sevasData.sort((a, b) => (a.order || 0) - (b.order || 0)));
      setLoading(false);
    } catch (error) {
      console.error("Error fetching sevas: ", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSevas();
  }, []);

  const onSubmit = async (data) => {
    try {
      // Transform data to match Firestore schema
      const sevaData = {
        name: {
          en: data.nameEn,
          te: data.nameTe,
        },
        description: {
          en: data.descriptionEn,
          te: data.descriptionTe,
        },
        type: data.type,
        timings: data.timings.filter((t) => t.trim() !== ""),
        price: parseFloat(data.price) || 0,
        active: data.active,
        order: parseInt(data.order) || 0,
        updatedAt: new Date(),
      };

      // Add type-specific fields
      if (data.type === "weekly") {
        sevaData.dayOfWeek = parseInt(data.dayOfWeek);
      } else if (data.type === "monthly" || data.type === "auspicious") {
        sevaData.date = data.date;
      }

      if (editingId) {
        await updateDoc(doc(db, "sevas", editingId), sevaData);
        setEditingId(null);
      } else {
        sevaData.createdAt = new Date();
        await addDoc(collection(db, "sevas"), sevaData);
      }

      reset({
        nameEn: "",
        nameTe: "",
        descriptionEn: "",
        descriptionTe: "",
        type: "daily",
        dayOfWeek: 0,
        date: "",
        timings: [""],
        price: 0,
        active: true,
        order: 0,
      });
      fetchSevas();
    } catch (error) {
      console.error("Error saving seva: ", error);
      alert("Error saving: " + error.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this Seva?")) {
      try {
        await deleteDoc(doc(db, "sevas", id));
        fetchSevas();
      } catch (error) {
        console.error("Error deleting seva: ", error);
      }
    }
  };

  const handleEdit = (seva) => {
    setEditingId(seva.id);
    reset({
      nameEn: seva.name?.en || "",
      nameTe: seva.name?.te || "",
      descriptionEn: seva.description?.en || "",
      descriptionTe: seva.description?.te || "",
      type: seva.type || "daily",
      dayOfWeek: seva.dayOfWeek || 0,
      date: seva.date || "",
      timings: seva.timings?.length > 0 ? seva.timings : [""],
      price: seva.price || 0,
      active: seva.active !== undefined ? seva.active : true,
      order: seva.order || 0,
    });
    // Scroll to form
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getDayName = (dayNum) => {
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    return days[dayNum] || "";
  };

  const getSevaTypeLabel = (type) => {
    const labels = {
      daily: "Daily",
      weekly: "Weekly",
      monthly: "Monthly",
      auspicious: "Auspicious",
    };
    return labels[type] || type;
  };

  if (loading) return <div className="p-4">Loading Sevas...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Manage Sevas</h2>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mb-8 bg-white p-6 rounded-lg shadow-lg border border-gray-200"
      >
        <h3 className="text-xl font-semibold mb-4 text-gray-700">
          {editingId ? "Edit Seva" : "Add New Seva"}
        </h3>

        {/* Bilingual Name Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name (English) *
            </label>
            <input
              {...register("nameEn", { required: true })}
              placeholder="e.g., Suprabhata Seva"
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name (Telugu) *
            </label>
            <input
              {...register("nameTe", { required: true })}
              placeholder="e.g., సుప్రభాత సేవ"
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Bilingual Description Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (English) *
            </label>
            <textarea
              {...register("descriptionEn", { required: true })}
              placeholder="Description in English"
              rows="3"
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (Telugu) *
            </label>
            <textarea
              {...register("descriptionTe", { required: true })}
              placeholder="Description in Telugu"
              rows="3"
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Seva Type, Price, Order, Active */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Seva Type *
            </label>
            <select
              {...register("type", { required: true })}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="auspicious">Auspicious</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price (₹)
            </label>
            <input
              {...register("price")}
              type="number"
              min="0"
              step="0.01"
              placeholder="500"
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Display Order
            </label>
            <input
              {...register("order")}
              type="number"
              min="0"
              placeholder="0"
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-end">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                {...register("active")}
                type="checkbox"
                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Active</span>
            </label>
          </div>
        </div>

        {/* Conditional Fields Based on Type */}
        {sevaType === "weekly" && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Day of Week *
            </label>
            <select
              {...register("dayOfWeek", { required: sevaType === "weekly" })}
              className="w-full md:w-1/2 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="0">Sunday</option>
              <option value="1">Monday</option>
              <option value="2">Tuesday</option>
              <option value="3">Wednesday</option>
              <option value="4">Thursday</option>
              <option value="5">Friday</option>
              <option value="6">Saturday</option>
            </select>
          </div>
        )}

        {(sevaType === "monthly" || sevaType === "auspicious") && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date {sevaType === "monthly" ? "(DD-MM format)" : "*"}
            </label>
            <input
              {...register("date", {
                required: sevaType === "monthly" || sevaType === "auspicious",
              })}
              type="text"
              placeholder={
                sevaType === "monthly" ? "e.g., 15-01" : "e.g., 2024-01-15"
              }
              className="w-full md:w-1/2 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        )}

        {/* Timings Management */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Timings
          </label>
          {fields.map((field, index) => (
            <div key={field.id} className="flex gap-2 mb-2">
              <input
                {...register(`timings.${index}`)}
                placeholder="e.g., 06:00 AM"
                className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {fields.length > 1 && (
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => append("")}
            className="mt-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
          >
            + Add Timing
          </button>
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-2 mt-6">
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            {editingId ? "Update Seva" : "Add Seva"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                reset({
                  nameEn: "",
                  nameTe: "",
                  descriptionEn: "",
                  descriptionTe: "",
                  type: "daily",
                  dayOfWeek: 0,
                  date: "",
                  timings: [""],
                  price: 0,
                  active: true,
                  order: 0,
                });
              }}
              className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition font-medium"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Sevas List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sevas.map((seva) => (
          <div
            key={seva.id}
            className={`bg-white p-5 rounded-lg shadow-md border-l-4 ${
              seva.active ? "border-green-500" : "border-gray-400"
            } hover:shadow-lg transition`}
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold text-lg text-gray-800">
                {seva.name?.en || "Unnamed Seva"}
              </h3>
              <span
                className={`text-xs px-2 py-1 rounded ${
                  seva.active
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {seva.active ? "Active" : "Inactive"}
              </span>
            </div>
            <p className="text-sm text-gray-500 mb-1">{seva.name?.te}</p>
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
              {seva.description?.en}
            </p>

            <div className="space-y-1 text-xs text-gray-500 mb-3">
              <p>
                <span className="font-semibold">Type:</span>{" "}
                {getSevaTypeLabel(seva.type)}
              </p>
              {seva.type === "weekly" && (
                <p>
                  <span className="font-semibold">Day:</span>{" "}
                  {getDayName(seva.dayOfWeek)}
                </p>
              )}
              {(seva.type === "monthly" || seva.type === "auspicious") &&
                seva.date && (
                  <p>
                    <span className="font-semibold">Date:</span> {seva.date}
                  </p>
                )}
              {seva.timings && seva.timings.length > 0 && (
                <p>
                  <span className="font-semibold">Timings:</span>{" "}
                  {seva.timings.join(", ")}
                </p>
              )}
              {seva.price > 0 && (
                <p>
                  <span className="font-semibold">Price:</span> ₹{seva.price}
                </p>
              )}
              <p>
                <span className="font-semibold">Order:</span> {seva.order || 0}
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(seva)}
                className="flex-1 bg-yellow-500 text-white px-3 py-2 rounded text-sm hover:bg-yellow-600 transition font-medium"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(seva.id)}
                className="flex-1 bg-red-500 text-white px-3 py-2 rounded text-sm hover:bg-red-600 transition font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {sevas.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500 text-lg">
            No sevas found. Add your first seva above!
          </p>
        </div>
      )}
    </div>
  );
};

export default SevaManager;
