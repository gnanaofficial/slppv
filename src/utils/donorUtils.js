// import XLSX from "xlsx";

/**
 * Format donor ID for display
 */
export const formatDonorId = (id) => {
  if (!id) return "N/A";
  return id.toUpperCase();
};

/**
 * Generate donor avatar from initials
 */
export const generateDonorAvatar = (name) => {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

/**
 * Calculate donor statistics from donations
 */
export const calculateDonorStats = (donations) => {
  const successfulDonations = donations.filter((d) => d.status === "success");

  const totalAmount = successfulDonations.reduce(
    (sum, d) => sum + (d.amount || 0),
    0,
  );

  const averageAmount =
    successfulDonations.length > 0
      ? totalAmount / successfulDonations.length
      : 0;

  const firstDonation =
    donations.length > 0 ? donations[donations.length - 1] : null;

  const lastDonation = donations.length > 0 ? donations[0] : null;

  return {
    totalDonations: successfulDonations.length,
    totalAmount,
    averageAmount,
    firstDonationDate: firstDonation?.createdAt,
    lastDonationDate: lastDonation?.createdAt,
  };
};

/**
 * Export donors to CSV
 */
export const exportDonorsToCSV = (donors) => {
  const headers = [
    "Donor ID",
    "Name",
    "Email",
    "Phone",
    "Total Donated",
    "Transaction Count",
    "Last Donation",
    "Status",
  ];

  const rows = donors.map((donor) => [
    donor.donorId || "N/A",
    donor.name,
    donor.email,
    donor.phone,
    donor.totalDonated || 0,
    donor.transactionCount || 0,
    donor.lastDonation
      ? new Date(donor.lastDonation.toDate()).toLocaleDateString()
      : "N/A",
    donor.active ? "Active" : "Inactive",
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", `donors-${Date.now()}.csv`);
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Export donors to Excel
 */
export const exportDonorsToExcel = (donors) => {
  console.log("Excel export disabled for debugging");
  alert("Excel export temporarily disabled");
  // const worksheet = XLSX.utils.json_to_sheet(data);
  // const workbook = XLSX.utils.book_new();
  // XLSX.utils.book_append_sheet(workbook, worksheet, "Donors");
  // XLSX.writeFile(workbook, `donors-${Date.now()}.xlsx`);
};

/**
 * Validate donor data
 */
export const validateDonorData = (data) => {
  const errors = {};

  if (!data.name || data.name.trim() === "") {
    errors.name = "Name is required";
  }

  if (!data.email || data.email.trim() === "") {
    errors.email = "Email is required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = "Invalid email format";
  }

  if (!data.phone || data.phone.trim() === "") {
    errors.phone = "Phone is required";
  } else if (!/^[0-9]{10}$/.test(data.phone)) {
    errors.phone = "Phone must be 10 digits";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Format currency for display
 */
export const formatCurrency = (amount) => {
  return `₹${amount.toLocaleString("en-IN")}`;
};

/**
 * Format date for display
 */
export const formatDate = (date) => {
  if (!date) return "N/A";

  const dateObj = date.toDate ? date.toDate() : new Date(date);

  return dateObj.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

/**
 * Format date and time for display
 */
export const formatDateTime = (date) => {
  if (!date) return "N/A";

  const dateObj = date.toDate ? date.toDate() : new Date(date);

  return dateObj.toLocaleString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * Get donor status badge color
 */
export const getDonorStatusColor = (active) => {
  return active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";
};

/**
 * Get payment method badge color
 */
export const getPaymentMethodColor = (method) => {
  const colors = {
    cash: "bg-green-100 text-green-800",
    cheque: "bg-blue-100 text-blue-800",
    bank_transfer: "bg-purple-100 text-purple-800",
    upi: "bg-orange-100 text-orange-800",
    sbi_epay: "bg-indigo-100 text-indigo-800",
    online: "bg-cyan-100 text-cyan-800",
  };

  return colors[method] || "bg-gray-100 text-gray-800";
};

/**
 * Sort donors by field
 */
export const sortDonors = (donors, field, direction = "asc") => {
  return [...donors].sort((a, b) => {
    let aVal = a[field];
    let bVal = b[field];

    // Handle Firestore timestamps
    if (aVal?.toDate) aVal = aVal.toDate();
    if (bVal?.toDate) bVal = bVal.toDate();

    // Handle null/undefined
    if (aVal == null) return direction === "asc" ? 1 : -1;
    if (bVal == null) return direction === "asc" ? -1 : 1;

    // Compare
    if (aVal < bVal) return direction === "asc" ? -1 : 1;
    if (aVal > bVal) return direction === "asc" ? 1 : -1;
    return 0;
  });
};

/**
 * Paginate array
 */
export const paginate = (array, page, perPage) => {
  const start = (page - 1) * perPage;
  const end = start + perPage;

  return {
    data: array.slice(start, end),
    total: array.length,
    page,
    perPage,
    totalPages: Math.ceil(array.length / perPage),
  };
};
