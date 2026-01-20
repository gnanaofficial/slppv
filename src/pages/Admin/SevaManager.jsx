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
import { useForm } from "react-hook-form";

const SevaManager = () => {
  const [sevas, setSevas] = useState([]);
  const [loading, setLoading] = useState(true);
  const { register, handleSubmit, reset } = useForm();
  const [editingId, setEditingId] = useState(null);

  const fetchSevas = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "sevas"));
      const sevasData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setSevas(sevasData);
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
      if (editingId) {
        await updateDoc(doc(db, "sevas", editingId), data);
        setEditingId(null);
      } else {
        await addDoc(collection(db, "sevas"), data);
      }
      reset();
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
      title: seva.title,
      description: seva.description,
      path: seva.path,
      bgClass: seva.bgClass,
    });
  };

  if (loading) return <div className="p-4">Loading Sevas...</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Manage Sevas</h2>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mb-8 bg-white p-6 rounded-lg shadow-md"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            {...register("title", { required: true })}
            placeholder="Seva Title (e.g., DAILY)"
            className="p-2 border rounded"
          />
          <input
            {...register("query_path")}
            placeholder="Route Path (e.g., /sevas/daily-sevas)"
            className="p-2 border rounded"
          />
          <input
            {...register("bgClass")}
            placeholder="Background Class (e.g., bg-sevaImg)"
            className="p-2 border rounded"
          />
          <textarea
            {...register("description", { required: true })}
            placeholder="Description"
            className="p-2 border rounded md:col-span-2"
          />
        </div>
        <button
          type="submit"
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {editingId ? "Update Seva" : "Add Seva"}
        </button>
        {editingId && (
          <button
            type="button"
            onClick={() => {
              setEditingId(null);
              reset();
            }}
            className="mt-4 ml-2 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Cancel
          </button>
        )}
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sevas.map((seva) => (
          <div key={seva.id} className="bg-white p-4 rounded-lg shadow border">
            <h3 className="font-bold text-lg">{seva.title}</h3>
            <p className="text-gray-600 text-sm mb-2">{seva.description}</p>
            <p className="text-xs text-gray-400">
              Path: {seva.path || seva.query_path}
            </p>
            <p className="text-xs text-gray-400">Class: {seva.bgClass}</p>

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => handleEdit(seva)}
                className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(seva.id)}
                className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SevaManager;
