import React, { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { FiPlus, FiTrash2, FiSave, FiAlertCircle, FiGlobe, FiSettings, FiEdit2, FiX, FiCheck } from "react-icons/fi";
import toast, { Toaster } from "react-hot-toast";
import { getSevaSchedule, updateSevaSchedule, getSevaCategories, updateSevaCategories } from "../../lib/firestoreService";
import { useAdmin } from "../../context/AdminContext";

const DailySevasManager = () => {
    const { adminData } = useAdmin();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [tabs, setTabs] = useState([]);
    const [activeTab, setActiveTab] = useState("");

    // Category Management State
    const [isManageModalOpen, setIsManageModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null); // ID of category being edited
    const [newCategoryName, setNewCategoryName] = useState("");
    const [newCategoryLayout, setNewCategoryLayout] = useState("cards");

    const { register, control, handleSubmit, reset, watch } = useForm({
        defaultValues: {
            schedule: [],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "schedule",
    });

    useEffect(() => {
        loadCategories();
    }, []);

    useEffect(() => {
        if (activeTab) {
            fetchData(activeTab);
        }
    }, [activeTab]);

    const loadCategories = async () => {
        try {
            const categories = await getSevaCategories();
            setTabs(categories);
            if (categories.length > 0 && !activeTab) {
                setActiveTab(categories[0].id);
            }
        } catch (error) {
            console.error("Error loading categories", error);
            toast.error("Fixed to load categories");
        }
    };

    const fetchData = async (type) => {
        setLoading(true);
        try {
            const schedule = await getSevaSchedule(type);
            if (schedule && schedule.length > 0) {
                reset({ schedule });
            } else {
                // Defaults based on type if completely empty
                const defaultSchedule = [];
                // Basic defaults if standard types, else empty
                if (type === "daily") {
                    defaultSchedule.push(
                        { time: "05:00 AM", name: "Suprabatha Seva", nameTe: "సుప్రభాత సేవ" }
                    );
                }
                reset({ schedule: defaultSchedule });
            }
        } catch (error) {
            console.error("Error fetching schedule:", error);
            // toast.error("Failed to load schedule");
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = async (data) => {
        setSaving(true);
        try {
            await updateSevaSchedule(activeTab, data.schedule, adminData?.email || "admin");
            toast.success(`Schedule saved successfully`);
        } catch (error) {
            console.error("Error saving schedule:", error);
            toast.error("Failed to save schedule");
        } finally {
            setSaving(false);
        }
    };

    const handleAddCategory = async () => {
        if (!newCategoryName.trim()) return;
        const id = newCategoryName.toLowerCase().replace(/[^a-z0-9]/g, '-');

        if (tabs.find(t => t.id === id)) {
            toast.error("Category already exists");
            return;
        }

        const newTabs = [...tabs, { id, label: newCategoryName, layout: newCategoryLayout }];
        setTabs(newTabs);
        setNewCategoryName("");

        try {
            await updateSevaCategories(newTabs, adminData?.email);
            toast.success("Category added");
        } catch (e) {
            toast.error("Failed to save category");
        }
    };

    const handleUpdateCategory = async (id, newLabel, newLayout) => {
        const newTabs = tabs.map(t => t.id === id ? { ...t, label: newLabel, layout: newLayout } : t);
        setTabs(newTabs);
        setEditingCategory(null);
        try {
            await updateSevaCategories(newTabs, adminData?.email);
            toast.success("Category updated");
        } catch (e) {
            toast.error("Failed to save category");
        }
    }

    const deleteCategory = async (id) => {
        if (!window.confirm("Are you sure? This will hide the tab. Data is preserved in DB but won't be accessible.")) return;
        const newTabs = tabs.filter(t => t.id !== id);
        setTabs(newTabs);
        if (activeTab === id) setActiveTab(newTabs[0]?.id || "");
        try {
            await updateSevaCategories(newTabs, adminData?.email);
            toast.success("Category deleted");
        } catch (e) {
            toast.error("Failed to delete category");
        }
    }

    const handleTranslateAll = () => {
        const currentSchedule = watch("schedule");
        const translations = {
            "Suprabatha Seva": "సుప్రభాత సేవ",
            // Add more common terms
        };
        const updatedSchedule = currentSchedule.map(item => ({
            ...item,
            nameTe: translations[item.name] || item.nameTe
        }));
        reset({ schedule: updatedSchedule });
        toast.success("Translation applied");
    };

    return (
        <div className="p-6">
            <Toaster position="top-right" />

            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 font-play">
                        Sevas Schedule Manager
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Manage all seva categories and their timings
                    </p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setIsManageModalOpen(true)}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center gap-2 font-semibold"
                    >
                        <FiSettings /> Manage Categories
                    </button>
                    <button
                        onClick={handleSubmit(onSubmit)}
                        disabled={saving}
                        className="px-6 py-2 bg-mainColor text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2 font-bold shadow-md"
                    >
                        <FiSave /> {saving ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </div>

            {/* Dynamic Tabs */}
            <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200 overflow-x-auto">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-6 py-3 font-semibold transition-colors whitespace-nowrap ${activeTab === tab.id
                            ? "text-mainColor border-b-2 border-mainColor"
                            : "text-gray-500 hover:text-gray-700"
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Editor Area */}
            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mainColor"></div>
                </div>
            ) : tabs.length === 0 ? (
                <div className="text-center p-12 text-gray-500">No categories found settings to add one.</div>
            ) : (
                <div className="bg-white rounded-xl shadow-md p-6">
                    {/* Column Headers */}
                    <div className="grid grid-cols-12 gap-4 mb-4 font-semibold text-gray-700 border-b pb-2">
                        {/* Logic: Daily usually just Time, others need Header */}
                        {/* We can be generic: If layout is NOT timeline, show Header */}
                        {tabs.find(t => t.id === activeTab)?.layout !== 'timeline' && (
                            <div className="col-span-3">Header (e.g. Day/Event)</div>
                        )}

                        <div className={tabs.find(t => t.id === activeTab)?.layout !== 'timeline' ? "col-span-2" : "col-span-2"}>Time</div>
                        <div className={tabs.find(t => t.id === activeTab)?.layout !== 'timeline' ? "col-span-3" : "col-span-4"}>Seva Name</div>
                        <div className={tabs.find(t => t.id === activeTab)?.layout !== 'timeline' ? "col-span-3" : "col-span-4"}>Seva Name (Telugu)</div>
                        <div className="col-span-1 text-center">Action</div>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        {fields.map((field, index) => (
                            <div
                                key={field.id}
                                className="grid grid-cols-12 gap-4 items-center p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-gray-300 transition"
                            >
                                {tabs.find(t => t.id === activeTab)?.layout !== 'timeline' && (
                                    <div className="col-span-3 flex flex-col gap-2">
                                        <input
                                            {...register(`schedule.${index}.header`)}
                                            placeholder="Group Header"
                                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-mainColor/20 text-sm font-bold text-mainColor"
                                        />
                                        <input
                                            {...register(`schedule.${index}.subHeader`)}
                                            placeholder="Sub-Header"
                                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-mainColor/20 text-xs"
                                        />
                                    </div>
                                )}

                                <div className="col-span-2">
                                    <input
                                        {...register(`schedule.${index}.time`)}
                                        placeholder="Time"
                                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-mainColor/20 font-mono"
                                    />
                                </div>
                                <div className={tabs.find(t => t.id === activeTab)?.layout !== 'timeline' ? "col-span-3" : "col-span-4"}>
                                    <input
                                        {...register(`schedule.${index}.name`)}
                                        placeholder="Seva Name"
                                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-mainColor/20"
                                    />
                                </div>
                                <div className={tabs.find(t => t.id === activeTab)?.layout !== 'timeline' ? "col-span-3" : "col-span-4"}>
                                    <input
                                        {...register(`schedule.${index}.nameTe`)}
                                        placeholder="Telugu Name"
                                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-mainColor/20 font-telugu"
                                        style={{ fontFamily: "'Ramabhadra', sans-serif" }}
                                    />
                                </div>
                                <div className="col-span-1 flex justify-center">
                                    <button
                                        type="button"
                                        onClick={() => remove(index)}
                                        className="p-2 text-red-500 hover:bg-red-50 rounded-full transition"
                                    >
                                        <FiTrash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}

                        <button
                            type="button"
                            onClick={() => append({ header: "", subHeader: "", time: "", name: "", nameTe: "" })}
                            className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-mainColor hover:text-mainColor transition flex justify-center items-center gap-2 font-semibold"
                        >
                            <FiPlus /> Add Item
                        </button>
                    </form>
                </div>
            )}

            {/* Manage Categories Modal */}
            {isManageModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-[500px] max-w-full shadow-2xl relative">
                        <button onClick={() => setIsManageModalOpen(false)} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800">
                            <FiX size={24} />
                        </button>
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">Manage Categories</h2>

                        {/* Add New */}
                        <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-200">
                            <h3 className="font-semibold text-gray-700 mb-3">Add New Category</h3>
                            <div className="flex flex-col gap-3">
                                <input
                                    value={newCategoryName}
                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                    placeholder="Category Name (e.g. Festival Sevas)"
                                    className="px-3 py-2 border rounded-md"
                                />
                                <div className="flex items-center gap-2">
                                    <label className="text-sm text-gray-600">Layout Style:</label>
                                    <select
                                        value={newCategoryLayout}
                                        onChange={(e) => setNewCategoryLayout(e.target.value)}
                                        className="px-3 py-2 border rounded-md flex-1"
                                    >
                                        <option value="timeline">Timeline (Like Daily)</option>
                                        <option value="cards">Cards (Like Weekly)</option>
                                        <option value="grid">Grid (Like Monthly)</option>
                                        <option value="banner">Banner (Like Auspicious)</option>
                                    </select>
                                </div>
                                <button
                                    onClick={handleAddCategory}
                                    className="bg-mainColor text-white py-2 rounded-md font-bold hover:bg-red-700"
                                >
                                    Add Category
                                </button>
                            </div>
                        </div>

                        {/* Edit Existing */}
                        <div className="max-h-[300px] overflow-y-auto space-y-2">
                            <h3 className="font-semibold text-gray-700 mb-2">My Categories</h3>
                            {tabs.map(tab => (
                                <div key={tab.id} className="flex gap-2 items-center p-2 border rounded hover:bg-gray-50">
                                    {editingCategory === tab.id ? (
                                        <>
                                            <input
                                                defaultValue={tab.label}
                                                id={`edit-label-${tab.id}`}
                                                className="border px-2 py-1 rounded w-32"
                                            />
                                            <select
                                                defaultValue={tab.layout}
                                                id={`edit-layout-${tab.id}`}
                                                className="border px-2 py-1 rounded w-24 text-sm"
                                            >
                                                <option value="timeline">Timeline</option>
                                                <option value="cards">Cards</option>
                                                <option value="grid">Grid</option>
                                                <option value="banner">Banner</option>
                                            </select>
                                            <button
                                                onClick={() => handleUpdateCategory(
                                                    tab.id,
                                                    document.getElementById(`edit-label-${tab.id}`).value,
                                                    document.getElementById(`edit-layout-${tab.id}`).value
                                                )}
                                                className="text-green-600"
                                            >
                                                <FiCheck />
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <span className="font-medium flex-1">{tab.label}</span>
                                            <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">{tab.layout}</span>
                                            <button onClick={() => setEditingCategory(tab.id)} className="text-blue-500 hover:text-blue-700">
                                                <FiEdit2 />
                                            </button>
                                            <button onClick={() => deleteCategory(tab.id)} className="text-red-500 hover:text-red-700">
                                                <FiTrash2 />
                                            </button>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DailySevasManager;
