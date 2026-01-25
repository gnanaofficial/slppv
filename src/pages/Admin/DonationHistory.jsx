import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
    FiSearch,
    FiFilter,
    FiDownload,
    FiRefreshCw,
    FiCalendar,
    FiPrinter,
} from "react-icons/fi";
import { getAllDonations } from "../../lib/firestoreService";
import {
    formatDate,
    formatCurrency,
    formatDateTime,
    exportDonorsToCSV,
} from "../../utils/donorUtils";
import { createInvoice, printInvoice, downloadInvoicePDF } from "../../lib/invoiceService";
import toast, { Toaster } from "react-hot-toast";

const DonationHistory = () => {
    const [donations, setDonations] = useState([]);
    const [filteredDonations, setFilteredDonations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Search & Filter
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [dateFilter, setDateFilter] = useState("all"); // all, today, week, month

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(20);

    useEffect(() => {
        fetchDonations();
    }, []);

    useEffect(() => {
        handleSearchAndFilter();
    }, [donations, searchQuery, statusFilter, dateFilter]);

    const fetchDonations = async () => {
        setRefreshing(true);
        try {
            // Fetch a large number of donations for history
            const data = await getAllDonations(1000);
            setDonations(data);
        } catch (error) {
            console.error("Error fetching donations:", error);
            toast.error("Failed to load donations");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleSearchAndFilter = () => {
        let result = donations;

        // Filter by status
        if (statusFilter !== "all") {
            result = result.filter((d) => d.status === statusFilter);
        }

        // Filter by date
        if (dateFilter !== "all") {
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

            result = result.filter((d) => {
                const date = d.createdAt?.toDate ? d.createdAt.toDate() : new Date(d.createdAt);
                if (dateFilter === "today") {
                    return date >= today;
                } else if (dateFilter === "week") {
                    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                    return date >= weekAgo;
                } else if (dateFilter === "month") {
                    const monthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
                    return date >= monthAgo;
                }
                return true;
            });
        }

        // Search
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(
                (d) =>
                    d.donorName?.toLowerCase().includes(query) ||
                    d.donorId?.toLowerCase().includes(query) ||
                    d.paymentId?.toLowerCase().includes(query) ||
                    d.purpose?.toLowerCase().includes(query)
            );
        }

        setFilteredDonations(result);
        setCurrentPage(1);
    };

    const handleExport = () => {
        // Basic export functionality
        const csvContent = [
            ["Date", "Donor Name", "Donor ID", "Amount", "Purpose", "Payment Method", "Status", "Transaction ID"],
            ...filteredDonations.map((d) => [
                formatDate(d.createdAt),
                d.donorName || "Anonymous",
                d.donorId || "-",
                d.amount,
                d.purpose,
                d.paymentMethod,
                d.status,
                d.paymentId || "-",
            ]),
        ]
            .map((e) => e.join(","))
            .join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", `donations_history_${new Date().toISOString().split("T")[0]}.csv`);
            link.style.visibility = "hidden";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const handlePrint = (donation) => {
        try {
            const invoice = createInvoice(donation);
            printInvoice(invoice);
        } catch (error) {
            toast.error("Could not print. Missing donor details?");
        }
    }

    const handleDownload = (donation) => {
        try {
            const invoice = createInvoice(donation);
            downloadInvoicePDF(invoice);
        } catch (error) {
            toast.error("Could not download. Missing donor details?");
        }
    }

    // Pagination Logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredDonations.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredDonations.length / itemsPerPage);

    return (
        <div className="p-6">
            <Toaster position="top-right" />
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 font-play">
                        Donation History
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Complete history of all transactions and donations
                    </p>
                </div>
                <div className="flex gap-3">
                    <Link
                        to="/temple-management/donors"
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-semibold"
                    >
                        ← Back to Donors
                    </Link>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <p className="text-sm text-gray-500">Total Transactions</p>
                    <p className="text-2xl font-bold text-gray-800">{filteredDonations.length}</p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <p className="text-sm text-gray-500">Total Amount</p>
                    <p className="text-2xl font-bold text-green-600">
                        {formatCurrency(filteredDonations.reduce((sum, d) => sum + (d.status === 'success' ? Number(d.amount) : 0), 0))}
                    </p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <p className="text-sm text-gray-500">Successful Donations</p>
                    <p className="text-2xl font-bold text-blue-600">
                        {filteredDonations.filter(d => d.status === 'success').length}
                    </p>
                </div>
            </div>

            {/* Filters & Actions */}
            <div className="bg-white p-4 rounded-xl shadow-sm mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto flex-1">
                    <div className="relative flex-1 max-w-md">
                        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name, ID, or transaction #..."
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
                        <option value="success">Success</option>
                        <option value="pending">Pending</option>
                        <option value="failed">Failed</option>
                    </select>
                    <select
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-mainColor/20"
                    >
                        <option value="all">All Dates</option>
                        <option value="today">Today</option>
                        <option value="week">This Week</option>
                        <option value="month">This Month</option>
                    </select>
                </div>
                <div className="flex gap-2 w-full md:w-auto justify-end">
                    <button
                        onClick={fetchDonations}
                        className={`p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition ${refreshing ? "animate-spin" : ""
                            }`}
                        title="Refresh"
                    >
                        <FiRefreshCw />
                    </button>
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-lg transition"
                    >
                        <FiDownload /> Export
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center text-gray-500">
                        <div className="animate-spin inline-block w-8 h-8 border-4 border-current border-t-transparent text-mainColor rounded-full mb-4"></div>
                        <p>Loading donation history...</p>
                    </div>
                ) : filteredDonations.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                        No donations found matching your criteria.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">Date</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">Donor</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">Amount</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">Purpose</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">Method</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">Status</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {currentItems.map((donation) => (
                                    <tr key={donation.id} className="hover:bg-gray-50/50">
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            <div>{formatDate(donation.createdAt)}</div>
                                            <div className="text-xs text-gray-400">
                                                {donation.createdAt?.toDate ? donation.createdAt.toDate().toLocaleTimeString() : ""}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-semibold text-gray-800">{donation.donorName || "Anonymous"}</p>
                                                {donation.donorId && (
                                                    <p className="text-xs text-gray-500 font-mono">{donation.donorId}</p>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-bold text-gray-800">
                                                {formatCurrency(donation.amount)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 capitalize">
                                            {donation.purpose?.replace(/_/g, " ")}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 capitalize">
                                            {donation.paymentMethod}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${donation.status === "success"
                                                        ? "bg-green-100 text-green-800"
                                                        : donation.status === "failed"
                                                            ? "bg-red-100 text-red-800"
                                                            : "bg-yellow-100 text-yellow-800"
                                                    }`}
                                            >
                                                {donation.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handlePrint(donation)}
                                                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition"
                                                    title="Print Invoice"
                                                >
                                                    <FiPrinter />
                                                </button>
                                                <button
                                                    onClick={() => handleDownload(donation)}
                                                    className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition"
                                                    title="Download PDF"
                                                >
                                                    <FiDownload />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {filteredDonations.length > itemsPerPage && (
                    <div className="px-6 py-4 border-t border-gray-100 flex justify-between items-center">
                        <span className="text-sm text-gray-500">
                            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredDonations.length)} of {filteredDonations.length} entries
                        </span>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-1 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50 text-sm"
                            >
                                Previous
                            </button>
                            <div className="flex gap-1">
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    // Logic to show generic page numbers or specific range can be complex
                                    // For now, simpler prev/next is safer.
                                    // Let's just show current page number
                                    return null;
                                })}
                                <span className="px-3 py-1 bg-gray-100 rounded text-sm font-medium">
                                    Page {currentPage} of {totalPages}
                                </span>
                            </div>
                            <button
                                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="px-3 py-1 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50 text-sm"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DonationHistory;
