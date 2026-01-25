import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { getDeletedDonors, restoreDonor } from "../../lib/donorService";
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  formatDonorId,
  generateDonorAvatar,
  paginate,
} from "../../utils/donorUtils";

const DonorHistory = () => {
  const navigate = useNavigate();
  const [deletedDonors, setDeletedDonors] = useState([]);
  const [filteredDonors, setFilteredDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDonor, setSelectedDonor] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);
  const [donorToRestore, setDonorToRestore] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

  useEffect(() => {
    fetchDeletedDonors();
  }, []);

  useEffect(() => {
    applySearch();
  }, [deletedDonors, searchQuery]);

  const fetchDeletedDonors = async () => {
    try {
      setLoading(true);
      const data = await getDeletedDonors();
      setDeletedDonors(data);
    } catch (error) {
      console.error("Error fetching deleted donors:", error);
      toast.error("Failed to load deleted donors");
    } finally {
      setLoading(false);
    }
  };

  const applySearch = () => {
    if (!searchQuery || searchQuery.trim() === "") {
      setFilteredDonors(deletedDonors);
      return;
    }

    const searchLower = searchQuery.toLowerCase().trim();
    const filtered = deletedDonors.filter((donor) => {
      return (
        donor.name?.toLowerCase().includes(searchLower) ||
        donor.email?.toLowerCase().includes(searchLower) ||
        donor.phone?.includes(searchQuery) ||
        donor.donorId?.toLowerCase().includes(searchLower)
      );
    });

    setFilteredDonors(filtered);
    setCurrentPage(1);
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleViewDetails = (donor) => {
    setSelectedDonor(donor);
    setShowDetailModal(true);
  };

  const handleRestoreClick = (donor) => {
    setDonorToRestore(donor);
    setShowRestoreConfirm(true);
  };

  const handleRestoreConfirm = async () => {
    if (!donorToRestore) return;

    try {
      await restoreDonor(donorToRestore.id);
      toast.success("Donor restored successfully");
      setShowRestoreConfirm(false);
      setDonorToRestore(null);
      fetchDeletedDonors();
    } catch (error) {
      console.error("Error restoring donor:", error);
      toast.error("Failed to restore donor");
    }
  };

  // Pagination
  const paginatedData = paginate(filteredDonors, currentPage, itemsPerPage);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-mainColor font-play">
            Deleted Donors History
          </h2>
          <p className="text-gray-600 mt-1">
            Total Deleted Donors: {filteredDonors.length}
          </p>
        </div>
        <button
          onClick={() => navigate("/temple-management/donors")}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition font-semibold"
        >
          ← Back to Donors
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Search Deleted Donors
        </label>
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearch}
          placeholder="Search by name, email, phone, or donor ID..."
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-mainColor focus:outline-none"
        />
      </div>

      {/* Deleted Donors Table */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-mainColor"></div>
          <p className="mt-4 text-gray-600">Loading deleted donors...</p>
        </div>
      ) : filteredDonors.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">No deleted donors found</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
              <thead className="bg-red-100">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Avatar
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Donor ID
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Phone
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Deleted On
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Deleted By
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedData.data.map((donor) => (
                  <tr
                    key={donor.id}
                    className="hover:bg-gray-50 transition cursor-pointer"
                    onClick={() => handleViewDetails(donor)}
                  >
                    <td className="px-4 py-3">
                      <div className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center font-bold">
                        {generateDonorAvatar(donor.name)}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm font-mono text-mainColor font-semibold">
                      {formatDonorId(donor.donorId)}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold">
                      {donor.name}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {donor.email}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {donor.phone}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {formatDateTime(donor.deletedAt)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {donor.deletedBy || "Unknown"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRestoreClick(donor);
                        }}
                        className="text-green-600 hover:text-green-800 font-semibold text-sm"
                      >
                        Restore
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {paginatedData.totalPages > 1 && (
            <div className="flex justify-between items-center mt-6">
              <p className="text-sm text-gray-600">
                Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                {Math.min(currentPage * itemsPerPage, paginatedData.total)} of{" "}
                {paginatedData.total} deleted donors
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="px-4 py-2 bg-mainColor text-white rounded-lg">
                  {currentPage} / {paginatedData.totalPages}
                </span>
                <button
                  onClick={() =>
                    setCurrentPage((p) =>
                      Math.min(paginatedData.totalPages, p + 1),
                    )
                  }
                  disabled={currentPage === paginatedData.totalPages}
                  className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Donor Detail Modal */}
      {showDetailModal && selectedDonor && (
        <DeletedDonorDetailModal
          donor={selectedDonor}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedDonor(null);
          }}
          onRestore={() => {
            setShowDetailModal(false);
            handleRestoreClick(selectedDonor);
          }}
        />
      )}

      {/* Restore Confirmation Modal */}
      {showRestoreConfirm && donorToRestore && (
        <RestoreConfirmModal
          donor={donorToRestore}
          onConfirm={handleRestoreConfirm}
          onCancel={() => {
            setShowRestoreConfirm(false);
            setDonorToRestore(null);
          }}
        />
      )}
    </div>
  );
};

// Deleted Donor Detail Modal Component
const DeletedDonorDetailModal = ({ donor, onClose, onRestore }) => {
  const donations = donor.donations || [];

  const totalAmount = donations
    .filter((d) => d.status === "success")
    .reduce((sum, d) => sum + (d.amount || 0), 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-red-600 text-white p-6 rounded-t-lg">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-2xl font-bold font-play">{donor.name}</h3>
              <p className="text-red-100 mt-1">
                {formatDonorId(donor.donorId)} (DELETED)
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-red-200 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Deletion Info */}
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 mb-6">
            <h4 className="text-lg font-bold text-red-800 mb-2">
              Deletion Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-red-700">Deleted On</p>
                <p className="font-semibold text-red-900">
                  {formatDateTime(donor.deletedAt)}
                </p>
              </div>
              <div>
                <p className="text-sm text-red-700">Deleted By</p>
                <p className="font-semibold text-red-900">
                  {donor.deletedBy || "Unknown"}
                </p>
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="mb-6">
            <h4 className="text-lg font-bold text-mainColor mb-3">
              Personal Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-semibold">{donor.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="font-semibold">{donor.phone}</p>
              </div>
              {donor.address && (
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-600">Address</p>
                  <p className="font-semibold">{donor.address}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-600">Originally Joined</p>
                <p className="font-semibold">{formatDate(donor.createdAt)}</p>
              </div>
            </div>
          </div>

          {/* Donation Summary */}
          <div className="mb-6">
            <h4 className="text-lg font-bold text-mainColor mb-3">
              Donation Summary
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-green-50 p-4 rounded-lg border-2 border-green-200">
                <p className="text-sm text-green-700 font-semibold">
                  Total Donated
                </p>
                <p className="text-2xl font-bold text-green-800">
                  {formatCurrency(totalAmount)}
                </p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
                <p className="text-sm text-blue-700 font-semibold">
                  Total Donations
                </p>
                <p className="text-2xl font-bold text-blue-800">
                  {donations.filter((d) => d.status === "success").length}
                </p>
              </div>
            </div>
          </div>

          {/* Transaction History */}
          {donations.length > 0 && (
            <div>
              <h4 className="text-lg font-bold text-mainColor mb-3">
                Transaction History
              </h4>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">
                        Date
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">
                        Amount
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">
                        Purpose
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">
                        Payment Method
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {donations.map((donation, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-2 text-sm">
                          {formatDate(donation.createdAt)}
                        </td>
                        <td className="px-4 py-2 text-sm font-semibold text-green-700">
                          {formatCurrency(donation.amount)}
                        </td>
                        <td className="px-4 py-2 text-sm">
                          {donation.purpose}
                        </td>
                        <td className="px-4 py-2 text-sm">
                          {donation.paymentMethod}
                        </td>
                        <td className="px-4 py-2">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              donation.status === "success"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {donation.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-4 rounded-b-lg flex justify-between">
          <button
            onClick={onRestore}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
          >
            Restore Donor
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// Restore Confirmation Modal Component
const RestoreConfirmModal = ({ donor, onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h3 className="text-xl font-bold text-mainColor mb-4">
          Confirm Restoration
        </h3>
        <p className="text-gray-700 mb-6">
          Are you sure you want to restore donor <strong>{donor.name}</strong> (
          {formatDonorId(donor.donorId)})?
        </p>
        <p className="text-sm text-gray-600 mb-6">
          This donor will be moved back to the active donors list with all their
          transaction history.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
          >
            Restore
          </button>
        </div>
      </div>
    </div>
  );
};

export default DonorHistory;
