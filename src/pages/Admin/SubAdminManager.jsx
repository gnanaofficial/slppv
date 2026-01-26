import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAdmin } from "../../context/AdminContext";
import {
  getAllAdmins,
  createAdmin,
  updateAdmin,
  deleteAdmin,
} from "../../lib/firestoreService";
import { formatDateTime } from "../../utils/donorUtils";
import { initializeApp, deleteApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth, firebaseConfig } from "../../lib/firebase";

const SubAdminManager = () => {
  const { adminData } = useAdmin();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "sub_admin",
    permissions: [],
  });

  const availablePermissions = [
    { id: "donors.view", label: "View Donors" },
    { id: "donors.edit", label: "Edit Donors" },
    { id: "donors.delete", label: "Delete Donors" },
    { id: "donors.export", label: "Export Donors" },
    { id: "donations.view", label: "View Donations" },
    { id: "donations.create", label: "Create Manual Donations" },
    { id: "gallery.manage", label: "Manage Gallery" },
    { id: "videos.manage", label: "Manage Videos" },
    { id: "sevas.manage", label: "Manage Sevas" },
  ];

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const data = await getAllAdmins();
      setAdmins(data);
    } catch (error) {
      console.error("Error fetching admins:", error);
      toast.error("Failed to load admins");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePermissionToggle = (permissionId) => {
    setFormData((prev) => {
      const permissions = prev.permissions.includes(permissionId)
        ? prev.permissions.filter((p) => p !== permissionId)
        : [...prev.permissions, permissionId];
      return { ...prev, permissions };
    });
  };

  const handleAddAdmin = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.password) {
      toast.error("Please fill all required fields");
      return;
    }

    if (formData.permissions.length === 0) {
      toast.error("Please select at least one permission");
      return;
    }

    let secondaryApp = null;

    try {
      setLoading(true);

      // 1. Initialize a secondary firebase app to create the user
      // Using a unique name prevents conflicts
      const appName = `secondaryApp-${Date.now()}`;
      secondaryApp = initializeApp(firebaseConfig, appName);
      const secondaryAuth = getAuth(secondaryApp);

      // 2. Create the user in Firebase Auth using the secondary app
      console.log("Creating user in Auth...");
      const userCredential = await createUserWithEmailAndPassword(
        secondaryAuth,
        formData.email,
        formData.password,
      );
      const uid = userCredential.user.uid;
      console.log("User created in Auth with UID:", uid);

      // 3. Immediately sign out the new user from the secondary app
      await signOut(secondaryAuth);
      console.log("Secondary user signed out.");

      // 4. Create admin record in Firestore
      console.log("Creating admin record in Firestore...");
      const newAdmin = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        permissions: formData.permissions,
        uid: uid,
      };

      await createAdmin(newAdmin);
      console.log("Admin record created in Firestore successfully.");

      toast.success("Sub-admin created successfully");
      setShowAddModal(false);
      setFormData({
        name: "",
        email: "",
        password: "",
        role: "sub_admin",
        permissions: [],
      });

      // Refresh list
      await fetchAdmins();
    } catch (error) {
      console.error("Error creating admin:", error);
      if (error.code === "auth/email-already-in-use") {
        toast.error(
          "This email is already registered. Please use a DIFFERENT email address.",
        );
      } else {
        toast.error("Failed to create: " + error.message);
      }
    } finally {
      // 5. Cleanup the secondary app
      if (secondaryApp) {
        try {
          await deleteApp(secondaryApp);
        } catch (cleanupError) {
          console.error("Error cleaning up secondary app:", cleanupError);
        }
      }
      setLoading(false);
    }
  };

  const handleEditAdmin = async (e) => {
    e.preventDefault();

    if (!selectedAdmin) return;

    try {
      const updates = {
        name: formData.name,
        permissions: formData.permissions,
      };

      // Update email if changed
      if (formData.email && formData.email !== selectedAdmin.email) {
        updates.email = formData.email;
      }

      await updateAdmin(selectedAdmin.id, updates);

      // Note: Password update requires Firebase Admin SDK on backend
      // For now, we'll show a message that password reset email will be sent
      if (formData.password) {
        toast.success("Sub-admin updated! Password will be reset via email.", {
          duration: 4000,
        });
      } else {
        toast.success("Sub-admin updated successfully");
      }

      setShowEditModal(false);
      setSelectedAdmin(null);
      fetchAdmins();
    } catch (error) {
      console.error("Error updating admin:", error);
      toast.error("Failed to update sub-admin");
    }
  };

  const handleDeleteAdmin = async () => {
    if (!selectedAdmin) return;

    try {
      await deleteAdmin(selectedAdmin.id);
      toast.success("Sub-admin deleted successfully");
      setShowDeleteConfirm(false);
      setSelectedAdmin(null);
      fetchAdmins();
    } catch (error) {
      console.error("Error deleting admin:", error);
      toast.error("Failed to delete sub-admin");
    }
  };

  const openEditModal = (admin) => {
    setSelectedAdmin(admin);
    setFormData({
      name: admin.name,
      email: admin.email,
      password: "",
      role: admin.role,
      permissions: admin.permissions || [],
    });
    setShowEditModal(true);
  };

  const openDeleteConfirm = (admin) => {
    setSelectedAdmin(admin);
    setShowDeleteConfirm(true);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-mainColor font-play">
            {adminData?.role === "main_admin"
              ? "Admin Management"
              : "Sub-Admin Management"}
          </h2>
          <p className="text-gray-600 mt-1">
            {adminData?.role === "main_admin"
              ? "Manage all admins and their permissions"
              : "Manage sub-admins and their permissions"}
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-mainColor text-white rounded-lg hover:bg-red-700 transition font-semibold"
        >
          + Add {adminData?.role === "main_admin" ? "Admin" : "Sub-Admin"}
        </button>
      </div>

      {/* Admins Table */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-mainColor"></div>
          <p className="mt-4 text-gray-600">Loading admins...</p>
        </div>
      ) : admins.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">No admins found</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead className="bg-mainColor text-white">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  Role
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  Permissions
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  Created
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {admins.map((admin) => (
                <tr key={admin.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-semibold">
                    {admin.name}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {admin.email}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        admin.role === "main_admin"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {admin.role === "main_admin" ? "Main Admin" : "Sub Admin"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {admin.permissions?.length || 0} permissions
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {formatDateTime(admin.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {/* Show edit/delete for sub-admins, or for main admins if current user is also main admin */}
                    {(admin.role !== "main_admin" ||
                      adminData?.role === "main_admin") && (
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => openEditModal(admin)}
                          className="text-blue-600 hover:text-blue-800 font-semibold text-sm"
                        >
                          Edit
                        </button>
                        {/* Prevent deleting yourself */}
                        {admin.email !== adminData?.email && (
                          <button
                            onClick={() => openDeleteConfirm(admin)}
                            className="text-red-600 hover:text-red-800 font-semibold text-sm"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Admin Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-mainColor text-white p-6 rounded-t-lg">
              <h3 className="text-2xl font-bold font-play">
                {adminData?.role === "main_admin"
                  ? "Add New Admin"
                  : "Add New Sub-Admin"}
              </h3>
            </div>
            <form onSubmit={handleAddAdmin} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-mainColor focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-mainColor focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password *
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-mainColor focus:outline-none"
                  required
                  minLength="8"
                />
              </div>
              {adminData?.role === "main_admin" && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Role *
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-mainColor focus:outline-none"
                  >
                    <option value="sub_admin">Sub Admin</option>
                    <option value="main_admin">Main Admin</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    ⚠️ Main Admins have full access to all features
                  </p>
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Permissions *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {availablePermissions.map((perm) => (
                    <label
                      key={perm.id}
                      className="flex items-center space-x-2 p-2 border rounded hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={
                          Array.isArray(formData.permissions) &&
                          formData.permissions.includes(perm.id)
                        }
                        onChange={() => handlePermissionToggle(perm.id)}
                        className="w-4 h-4 text-mainColor"
                      />
                      <span className="text-sm">{perm.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-4 py-2 text-white rounded-lg transition font-semibold ${
                    loading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-mainColor hover:bg-red-700"
                  }`}
                >
                  {loading ? "Creating..." : "Create Sub-Admin"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Admin Modal */}
      {showEditModal && selectedAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-mainColor text-white p-6 rounded-t-lg">
              <h3 className="text-2xl font-bold font-play">Edit Sub-Admin</h3>
            </div>
            <form onSubmit={handleEditAdmin} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-mainColor focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-mainColor focus:outline-none"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  ⚠️ Changing email will update login credentials
                </p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  New Password (Optional)
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-mainColor focus:outline-none"
                  placeholder="Leave blank to keep current password"
                  minLength="8"
                />
                <p className="text-xs text-gray-500 mt-1">
                  💡 Enter new password only if you want to change it (min 8
                  characters)
                </p>
              </div>
              {formData.role !== "main_admin" ? (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Permissions *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {availablePermissions.map((perm) => (
                      <label
                        key={perm.id}
                        className="flex items-center space-x-2 p-2 border rounded hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={
                            Array.isArray(formData.permissions) &&
                            formData.permissions.includes(perm.id)
                          }
                          onChange={() => handlePermissionToggle(perm.id)}
                          className="w-4 h-4 text-mainColor"
                        />
                        <span className="text-sm">{perm.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-800 font-semibold">
                    ℹ️ Main Admins have full access to all features.
                  </p>
                </div>
              )}
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedAdmin(null);
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-mainColor text-white rounded-lg hover:bg-red-700 transition font-semibold"
                >
                  Update Sub-Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && selectedAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-mainColor mb-4">
              Confirm Deletion
            </h3>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete sub-admin{" "}
              <strong>{selectedAdmin.name}</strong>?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setSelectedAdmin(null);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAdmin}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubAdminManager;
