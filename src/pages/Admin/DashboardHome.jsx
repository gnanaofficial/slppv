import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAdmin } from "../../context/AdminContext";
import {
  getAllDonations,
  getDonationStats,
  getAllGalleryItems,
  getAllVideos,
  getAllSevas,
} from "../../lib/firestoreService";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const DashboardHome = () => {
  const { t } = useTranslation();
  const { adminData } = useAdmin();
  const [stats, setStats] = useState({
    totalDonations: 0,
    donationCount: 0,
    imageCount: 0,
    videoCount: 0,
    sevaCount: 0,
  });
  const [recentDonations, setRecentDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Get donation stats
      const donationStats = await getDonationStats();

      // Get recent donations
      const donations = await getAllDonations(10);

      // Get gallery count
      const galleryItems = await getAllGalleryItems();

      // Get video count
      const videos = await getAllVideos();

      // Get seva count
      const sevas = await getAllSevas();

      setStats({
        totalDonations: donationStats.total,
        donationCount: donationStats.count,
        imageCount: galleryItems.length,
        videoCount: videos.length,
        sevaCount: sevas.length,
      });

      setRecentDonations(donations);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ["#8B0000", "#FFD700", "#FF6B6B", "#4ECDC4"];

  const pieData = [
    { name: "Images", value: stats.imageCount },
    { name: "Videos", value: stats.videoCount },
    { name: "Sevas", value: stats.sevaCount },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mainColor mx-auto"></div>
          <p className="mt-4 text-gray-600">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-mainColor font-play">
          {t("admin.dashboard")}
        </h1>
        <p className="text-gray-600 mt-2">
          Welcome back, {adminData?.email || "Admin"}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-red-600 to-red-800 text-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Total Donations</p>
              <p className="text-3xl font-bold mt-2">
                ₹{stats.totalDonations.toLocaleString("en-IN")}
              </p>
            </div>
            <div className="text-4xl opacity-80">💰</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-yellow-700 text-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Total Images</p>
              <p className="text-3xl font-bold mt-2">{stats.imageCount}</p>
            </div>
            <div className="text-4xl opacity-80">🖼️</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Total Videos</p>
              <p className="text-3xl font-bold mt-2">{stats.videoCount}</p>
            </div>
            <div className="text-4xl opacity-80">🎥</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-600 to-green-800 text-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Total Sevas</p>
              <p className="text-3xl font-bold mt-2">{stats.sevaCount}</p>
            </div>
            <div className="text-4xl opacity-80">🙏</div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Content Distribution Pie Chart */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold text-mainColor mb-4">
            Content Distribution
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Donations */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold text-mainColor mb-4">
            {t("admin.recent_donations")}
          </h2>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {recentDonations.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No donations yet</p>
            ) : (
              recentDonations.map((donation) => (
                <div
                  key={donation.id}
                  className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                >
                  <div>
                    <p className="font-semibold text-gray-800">
                      {donation.donorName || "Anonymous"}
                    </p>
                    <p className="text-sm text-gray-600">{donation.purpose}</p>
                    <p className="text-xs text-gray-500">
                      {donation.createdAt?.toDate?.().toLocaleDateString() ||
                        "N/A"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-mainColor">
                      ₹{donation.amount?.toLocaleString("en-IN")}
                    </p>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        donation.status === "success"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {donation.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
