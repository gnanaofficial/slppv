import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiSearch,
  FiFilter,
  FiPlus,
  FiMoreVertical,
  FiEdit2,
  FiTrash2,
  FiEye,
  FiChevronLeft,
  FiChevronRight,
  FiRefreshCw,
  FiX,
  FiCheck,
} from "react-icons/fi";
import toast, { Toaster } from "react-hot-toast";
import {
  getAllDonors,
  updateDonor,
  getDonationsByDonor,
} from "../../lib/firestoreService";
import {
  softDeleteDonor,
  searchDonors,
  filterDonors,
  generateDonorAvatar,
  formatDonorId,
} from "../../lib/donorService";
import {
  formatDate,
  formatCurrency,
  exportDonorsToCSV,
} from "../../utils/donorUtils";
import { useAdmin } from "../../context/AdminContext";

const DonorManager = () => {
  const navigate = useNavigate();
  const { hasPermission } = useAdmin();
  const [donors, setDonors] = useState([]);
  const [filteredDonors, setFilteredDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // all, active, inactive

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Modals
  const [selectedDonor, setSelectedDonor] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    fetchDonors();
  }, []);

  useEffect(() => {
    handleSearchAndFilter();
  }, [donors, searchQuery, statusFilter]);

  const fetchDonors = async () => {
    setRefreshing(true);
    try {
      const data = await getAllDonors();
      setDonors(data);
    } catch (error) {
      console.error("Error fetching donors:", error);
      toast.error("Failed to load donors");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleSearchAndFilter = async () => {
    let result = donors;

    // Filter by status
    if (statusFilter !== "all") {
      const isActive = statusFilter === "active";
      result = result.filter((d) => d.active === isActive);
    }

    // Search
    if (searchQuery) {
      result = await searchDonors(searchQuery, result);
    }

    setFilteredDonors(result);
    setCurrentPage(1);
  };

  const handleExport = () => {
    exportDonorsToCSV(filteredDonors);
    toast.success("Donors exported successfully");
  };

  const handleDelete = async (donor) => {
    setSelectedDonor(donor);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedDonor) return;
    try {
      await softDeleteDonor(selectedDonor.id, "admin"); // TODO: Pass actual admin name
      toast.success("Donor deleted successfully");
      fetchDonors();
      setShowDeleteModal(false);
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete donor");
    }
  };

  const handleEdit = (donor) => {
    setSelectedDonor(donor);
    setShowEditModal(true);
  };

  const handleView = (donor) => {
    setSelectedDonor(donor);
    setShowDetailModal(true);
  };

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredDonors.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredDonors.length / itemsPerPage);

  const canEdit = hasPermission("donors.edit") || hasPermission("all");
  const canDelete = hasPermission("donors.delete") || hasPermission("all");

  return (
    <div className="p-6">
      <Toaster position="top-right" />
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 font-play">
            Manage Donors
          </h1>
          <p className="text-gray-600 mt-1">
            View, search, and manage all donor records
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/admin/donors/manual-entry"
            className="flex items-center gap-2 px-4 py-2 bg-mainColor text-white rounded-lg hover:bg-red-700 transition"
          >
            <FiPlus /> Manual Entry
          </Link>
          <Link
            to="/admin/donors/history"
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
          >
            <FiRefreshCw /> History
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Total Donors</p>
          <p className="text-2xl font-bold text-gray-800">{donors.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Active Donors</p>
          <p className="text-2xl font-bold text-green-600">
            {donors.filter((d) => d.active).length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Inactive Donors</p>
          <p className="text-2xl font-bold text-red-500">
            {donors.filter((d) => !d.active).length}
          </p>
        </div>
      </div>

      {/* Filters & Actions */}
      <div className="bg-white p-4 rounded-xl shadow-sm mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search donors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-mainColor/20"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-mainColor/20"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchDonors}
            className={`p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition ${
              refreshing ? "animate-spin" : ""
            }`}
            title="Refresh"
          >
            <FiRefreshCw />
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
          >
            <FiDownload /> Export CSV
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500">Loading...</div>
        ) : filteredDonors.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            No donors found matching your criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600">
                    Donor
                  </th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600">
                    Contact
                  </th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600">
                    Status
                  </th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600">
                    Joined
                  </th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {currentItems.map((donor) => (
                  <tr key={donor.id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-mainColor/10 text-mainColor flex items-center justify-center font-bold text-sm">
                          {generateDonorAvatar(donor.name)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">
                            {donor.name}
                          </p>
                          <p className="text-xs text-gray-500 font-mono">
                            {formatDonorId(donor.donorId)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <p className="text-gray-800">{donor.email}</p>
                        <p className="text-gray-500">{donor.phone}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          donor.active
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {donor.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(donor.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleView(donor)}
                          className="p-2 text-gray-400 hover:text-blue-600 transition"
                          title="View Details"
                        >
                          <FiEye />
                        </button>
                        {canEdit && (
                          <button
                            onClick={() => handleEdit(donor)}
                            className="p-2 text-gray-400 hover:text-orange-600 transition"
                            title="Edit"
                          >
                            <FiEdit2 />
                          </button>
                        )}
                        {canDelete && (
                          <button
                            onClick={() => handleDelete(donor)}
                            className="p-2 text-gray-400 hover:text-red-600 transition"
                            title="Delete"
                          >
                            <FiTrash2 />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {filteredDonors.length > itemsPerPage && (
          <div className="px-6 py-4 border-t border-gray-100 flex justify-between items-center">
            <span className="text-sm text-gray-500">
              Showing {indexOfFirstItem + 1} to{" "}
              {Math.min(indexOfLastItem, filteredDonors.length)} of{" "}
              {filteredDonors.length} entries
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                <FiChevronLeft />
              </button>
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                <FiChevronRight />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showDetailModal && selectedDonor && (
        <DonorDetailModal
          donor={selectedDonor}
          onClose={() => setShowDetailModal(false)}
        />
      )}
      {showEditModal && selectedDonor && (
        <EditDonorModal
          donor={selectedDonor}
          onClose={() => setShowEditModal(false)}
          onSave={() => {
            fetchDonors();
            setShowEditModal(false);
          }}
        />
      )}
      {showDeleteModal && selectedDonor && (
        <DeleteConfirmModal
          donor={selectedDonor}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
};

// ... imports
import {
  createInvoice,
  downloadInvoicePDF,
  printInvoice,
} from "../../lib/invoiceService";
import { FiPrinter, FiDownload } from "react-icons/fi";

const DonorDetailModal = ({ donor, onClose }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const data = await getDonationsByDonor(donor.id);
        console.log("Fetched donations for donor:", donor.id, data); // Debug log
        setTransactions(data);
      } catch (error) {
        console.error("Error fetching transactions:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, [donor.id]);

  const totalDonated = transactions
    .filter((t) => t.status === "success")
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const handlePrintInvoice = (transaction) => {
    try {
      const invoice = createInvoice({
        ...transaction,
        donorName: donor.name,
        donorEmail: donor.email,
        donorPhone: donor.phone,
        donorId: donor.donorId,
      });
      printInvoice(invoice);
    } catch (error) {
      console.error("Print error:", error);
      toast.error("Failed to print invoice");
    }
  };

  const handleDownloadInvoice = (transaction) => {
    try {
      const invoice = createInvoice({
        ...transaction,
        donorName: donor.name,
        donorEmail: donor.email,
        donorPhone: donor.phone,
        donorId: donor.donorId,
      });
      downloadInvoicePDF(invoice);
      toast.success("Download started");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download invoice");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-mainColor/10 text-mainColor flex items-center justify-center font-bold text-lg">
              {generateDonorAvatar(donor.name)}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">{donor.name}</h2>
              <p className="text-sm text-gray-500">
                {formatDonorId(donor.donorId)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <FiX size={24} />
          </button>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Total Donated</p>
              <p className="text-xl font-bold text-green-600">
                {formatCurrency(totalDonated)}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Transactions</p>
              <p className="text-xl font-bold text-blue-600">
                {transactions.length}
              </p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-800 mb-2">Contact Info</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p>
                <span className="font-medium text-gray-800">Email:</span>{" "}
                {donor.email}
              </p>
              <p>
                <span className="font-medium text-gray-800">Phone:</span>{" "}
                {donor.phone}
              </p>
              {donor.address && (
                <p>
                  <span className="font-medium text-gray-800">Address:</span>{" "}
                  {donor.address}
                </p>
              )}
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-800 mb-2">
              Transaction History
            </h3>
            {loading ? (
              <div className="text-center py-8 text-gray-500">
                <div className="animate-spin inline-block w-6 h-6 border-2 border-mainColor border-t-transparent rounded-full mb-2"></div>
                <p>Loading transactions...</p>
              </div>
            ) : transactions.length === 0 ? (
              <p className="text-sm text-gray-500 py-4 italic">
                No transactions found for this donor.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left border-collapse">
                  <thead className="bg-gray-50 text-gray-600">
                    <tr>
                      <th className="px-4 py-3 border-b">Date</th>
                      <th className="px-4 py-3 border-b">Amount</th>
                      <th className="px-4 py-3 border-b">Purpose</th>
                      <th className="px-4 py-3 border-b">Payment</th>
                      <th className="px-4 py-3 border-b">Status</th>
                      <th className="px-4 py-3 border-b text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {transactions.map((t) => (
                      <tr key={t.id} className="hover:bg-gray-50/50">
                        <td className="px-4 py-3">{formatDate(t.createdAt)}</td>
                        <td className="px-4 py-3 font-medium text-green-700">
                          {formatCurrency(t.amount)}
                        </td>
                        <td className="px-4 py-3 capitalize">
                          {t.purpose?.replace(/_/g, " ")}
                        </td>
                        <td className="px-4 py-3 capitalize">
                          {t.paymentMethod?.replace(/_/g, " ")}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              t.status === "success"
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {t.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handlePrintInvoice(t)}
                              className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition"
                              title="Print Invoice"
                            >
                              <FiPrinter size={16} />
                            </button>
                            <button
                              onClick={() => handleDownloadInvoice(t)}
                              className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded transition"
                              title="Download PDF"
                            >
                              <FiDownload size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const EditDonorModal = ({ donor, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: donor.name || "",
    phone: donor.phone || "",
    address: donor.address || "",
    active: donor.active !== false,
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateDonor(donor.id, formData);
      toast.success("Donor updated successfully");
      onSave();
    } catch (error) {
      toast.error("Failed to update donor");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-md w-full">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Edit Donor</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <FiX size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-mainColor/20 focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-mainColor/20 focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <textarea
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-mainColor/20 focus:outline-none"
              rows="3"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="active"
              checked={formData.active}
              onChange={(e) =>
                setFormData({ ...formData, active: e.target.checked })
              }
              className="rounded text-mainColor focus:ring-mainColor"
            />
            <label htmlFor="active" className="text-sm text-gray-700">
              Active Status
            </label>
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2 bg-mainColor text-white rounded-lg hover:bg-red-700 flex items-center justify-center gap-2"
            >
              {saving ? <div className="animate-spin">⌛</div> : <FiCheck />}{" "}
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const DeleteConfirmModal = ({ donor, onClose, onConfirm }) => {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-sm w-full p-6 text-center">
        <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
          <FiTrash2 size={24} />
        </div>
        <h3 className="text-lg font-bold text-gray-800 mb-2">Delete Donor?</h3>
        <p className="text-sm text-gray-500 mb-6">
          Are you sure you want to delete <strong>{donor.name}</strong>? They
          will be moved to the deleted history archive.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 font-medium"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DonorManager;
