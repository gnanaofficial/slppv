import React, { useState, useEffect } from "react";
import { Container } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useDonor } from "../../context/DonorContext";
import { useTranslation } from "react-i18next";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { downloadReceipt } from "../../lib/paymentService";

const DonorDashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { donor, logout, isAuthenticated, loading: authLoading } = useDonor();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalAmount: 0,
    totalDonations: 0,
    recentDonation: null,
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/donor/login");
    }
  }, [isAuthenticated, authLoading, navigate]);

  useEffect(() => {
    if (donor) {
      fetchDonations();
    }
  }, [donor]);

  const fetchDonations = async () => {
    try {
      const q = query(
        collection(db, "donations"),
        where("donorEmail", "==", donor.email),
        orderBy("createdAt", "desc"),
      );
      const querySnapshot = await getDocs(q);
      const donationsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setDonations(donationsData);

      // Calculate stats
      const totalAmount = donationsData
        .filter((d) => d.status === "success")
        .reduce((sum, d) => sum + (d.amount || 0), 0);

      const totalDonations = donationsData.filter(
        (d) => d.status === "success",
      ).length;

      const recentDonation = donationsData.length > 0 ? donationsData[0] : null;

      setStats({
        totalAmount,
        totalDonations,
        recentDonation,
      });

      setLoading(false);
    } catch (err) {
      console.error("Error fetching donations:", err);
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/donor/login");
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "-";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadge = (status) => {
    const badges = {
      success: "bg-green-100 text-green-800",
      failed: "bg-red-100 text-red-800",
      pending: "bg-yellow-100 text-yellow-800",
    };
    return badges[status] || "bg-gray-100 text-gray-800";
  };

  if (authLoading || !donor) {
    return (
      <Container
        maxWidth="xl"
        className="bg-[#FAAC2F] min-h-screen py-12 flex items-center justify-center"
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#8B0000] mx-auto"></div>
          <p className="mt-4 text-gray-700">
            {t("common.loading", "Loading...")}
          </p>
        </div>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" className="bg-[#FAAC2F] min-h-screen py-8">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#8B0000] mb-2">
              {t("donor.dashboardTitle", "Donor Dashboard")}
            </h1>
            <p className="text-gray-600">
              {t("donor.welcome", "Welcome")},{" "}
              <span className="font-semibold">{donor.name}</span>
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
          >
            {t("common.logout", "Logout")}
          </button>
        </div>
      </div>

      {/* Profile Section */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          {t("donor.profileTitle", "Profile Information")}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">{t("donor.name", "Name")}</p>
            <p className="text-lg font-semibold text-gray-800">{donor.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">{t("donor.email", "Email")}</p>
            <p className="text-lg font-semibold text-gray-800">{donor.email}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">{t("donor.phone", "Phone")}</p>
            <p className="text-lg font-semibold text-gray-800">
              {donor.phone || "-"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">
              {t("donor.address", "Address")}
            </p>
            <p className="text-lg font-semibold text-gray-800">
              {donor.address || "-"}
            </p>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
          <p className="text-sm opacity-90 mb-1">
            {t("donor.totalDonated", "Total Donated")}
          </p>
          <p className="text-4xl font-bold">
            ₹{stats.totalAmount.toLocaleString("en-IN")}
          </p>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
          <p className="text-sm opacity-90 mb-1">
            {t("donor.totalDonations", "Total Donations")}
          </p>
          <p className="text-4xl font-bold">{stats.totalDonations}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
          <p className="text-sm opacity-90 mb-1">
            {t("donor.lastDonation", "Last Donation")}
          </p>
          <p className="text-2xl font-bold">
            {stats.recentDonation
              ? formatDate(stats.recentDonation.createdAt)
              : t("donor.noDonations", "No donations yet")}
          </p>
        </div>
      </div>

      {/* Donation History */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          {t("donor.donationHistory", "Donation History")}
        </h2>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#8B0000] mx-auto"></div>
            <p className="mt-4 text-gray-600">
              {t("common.loading", "Loading...")}
            </p>
          </div>
        ) : donations.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">
              {t("donor.noDonationsYet", "No donations found.")}
            </p>
            <button
              onClick={() => navigate("/donate")}
              className="mt-4 px-6 py-2 bg-[#8B0000] text-white rounded-lg hover:bg-[#6B0000] transition font-medium"
            >
              {t("donor.makeFirstDonation", "Make Your First Donation")}
            </button>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      {t("donor.date", "Date")}
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      {t("donor.purpose", "Purpose")}
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      {t("donor.amount", "Amount")}
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      {t("donor.paymentMethod", "Payment Method")}
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      {t("donor.status", "Status")}
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      {t("donor.receipt", "Receipt")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {donations.map((donation) => (
                    <tr key={donation.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-800">
                        {formatDate(donation.createdAt)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-800">
                        {donation.purpose || "-"}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-800">
                        ₹{donation.amount?.toLocaleString("en-IN") || 0}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-800 capitalize">
                        {donation.paymentMethod?.replace("_", " ") || "-"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadge(
                            donation.status,
                          )}`}
                        >
                          {donation.status || "pending"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {donation.status === "success" && (
                          <button
                            onClick={() => downloadReceipt(donation)}
                            className="text-[#8B0000] hover:underline text-sm font-medium"
                          >
                            {t("donor.download", "Download")}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-4">
              {donations.map((donation) => (
                <div
                  key={donation.id}
                  className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm text-gray-600">
                      {formatDate(donation.createdAt)}
                    </span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadge(
                        donation.status,
                      )}`}
                    >
                      {donation.status || "pending"}
                    </span>
                  </div>
                  <p className="font-semibold text-gray-800 mb-1">
                    {donation.purpose || "-"}
                  </p>
                  <p className="text-2xl font-bold text-[#8B0000] mb-2">
                    ₹{donation.amount?.toLocaleString("en-IN") || 0}
                  </p>
                  <p className="text-sm text-gray-600 mb-3 capitalize">
                    {donation.paymentMethod?.replace("_", " ") || "-"}
                  </p>
                  {donation.status === "success" && (
                    <button
                      onClick={() => downloadReceipt(donation)}
                      className="w-full px-4 py-2 bg-[#8B0000] text-white rounded-lg hover:bg-[#6B0000] transition font-medium text-sm"
                    >
                      {t("donor.downloadReceipt", "Download Receipt")}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </Container>
  );
};

export default DonorDashboard;
