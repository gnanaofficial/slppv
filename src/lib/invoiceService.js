import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/**
 * Generate unique invoice number
 * Format: INV-YYYYMMDD-XXXX
 */
export const generateInvoiceNumber = () => {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "");
  const randomNum = Math.floor(Math.random() * 10000);
  const paddedNum = String(randomNum).padStart(4, "0");

  return `INV-${dateStr}-${paddedNum}`;
};

/**
 * Create invoice data structure
 */
export const createInvoice = (donationData) => {
  return {
    invoiceNumber: generateInvoiceNumber(),
    invoiceDate: new Date().toISOString(),
    donorName: donationData.donorName,
    donorEmail: donationData.donorEmail,
    donorPhone: donationData.donorPhone,
    donorId: donationData.donorId || "N/A",
    amount: donationData.amount,
    purpose: donationData.purpose,
    paymentMethod: donationData.paymentMethod,
    transactionId: donationData.transactionId || "N/A",
    transactionDate: donationData.transactionDate || new Date().toISOString(),
    status: donationData.status || "success",
  };
};

/**
 * Generate invoice PDF
 */
export const generateInvoicePDF = (invoiceData) => {
  const doc = new jsPDF();

  // Temple branding color
  const mainColor = [165, 42, 42]; // #A52A2A
  const accentColor = [250, 172, 47]; // #FAAC2F

  // Header - Temple Name
  doc.setFillColor(...accentColor);
  doc.rect(0, 0, 210, 40, "F");

  doc.setTextColor(165, 42, 42);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("Sri Lakshmi Padmavathi Temple", 105, 20, { align: "center" });

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text("Donation Receipt", 105, 30, { align: "center" });

  // Invoice Details
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(`Invoice No: ${invoiceData.invoiceNumber}`, 20, 50);
  doc.text(
    `Date: ${new Date(invoiceData.invoiceDate).toLocaleDateString()}`,
    20,
    56,
  );

  // Donor Details
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Donor Details", 20, 70);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Name: ${invoiceData.donorName}`, 20, 78);
  doc.text(`Email: ${invoiceData.donorEmail}`, 20, 84);
  doc.text(`Phone: ${invoiceData.donorPhone}`, 20, 90);
  doc.text(`Donor ID: ${invoiceData.donorId}`, 20, 96);

  // Transaction Details Table
  autoTable(doc, {
    startY: 110,
    head: [["Description", "Amount"]],
    body: [
      ["Purpose", invoiceData.purpose],
      ["Payment Method", invoiceData.paymentMethod],
      ["Transaction ID", invoiceData.transactionId],
      [
        "Transaction Date",
        new Date(invoiceData.transactionDate).toLocaleDateString(),
      ],
      ["Status", invoiceData.status.toUpperCase()],
    ],
    theme: "grid",
    headStyles: {
      fillColor: mainColor,
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    styles: {
      fontSize: 10,
    },
  });

  // Total Amount
  const finalY = doc.lastAutoTable.finalY + 10;
  doc.setFillColor(...accentColor);
  doc.rect(20, finalY, 170, 15, "F");

  doc.setTextColor(...mainColor);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(
    `Total Amount: ₹${invoiceData.amount.toLocaleString("en-IN")}`,
    105,
    finalY + 10,
    { align: "center" },
  );

  // Thank You Message
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont("helvetica", "italic");
  doc.text("Thank you for your generous donation!", 105, finalY + 25, {
    align: "center",
  });
  doc.text(
    "Your contribution helps us serve the community better.",
    105,
    finalY + 31,
    { align: "center" },
  );

  // Footer
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(
    "This is a computer-generated receipt and does not require a signature.",
    105,
    280,
    { align: "center" },
  );

  return doc;
};

/**
 * Download invoice as PDF
 */
export const downloadInvoicePDF = (invoiceData) => {
  const doc = generateInvoicePDF(invoiceData);
  doc.save(`Invoice-${invoiceData.invoiceNumber}.pdf`);
};

/**
 * Print invoice
 */
export const printInvoice = (invoiceData) => {
  try {
    const doc = generateInvoicePDF(invoiceData);

    // Auto-print is still good to have properties set
    doc.autoPrint();

    const blobUrl = doc.output("bloburl");

    // Create invisible iframe
    const iframe = document.createElement("iframe");
    iframe.style.position = "absolute";
    iframe.style.width = "0px";
    iframe.style.height = "0px";
    iframe.style.border = "none";
    iframe.src = blobUrl;

    document.body.appendChild(iframe);

    // Wait for PDF to load then print
    iframe.onload = () => {
      setTimeout(() => {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
      }, 500);
    };
  } catch (error) {
    console.error("Print failed:", error);
    alert("Failed to generate print document. Please try again.");
  }
};

/**
 * Export invoices to CSV
 */
export const exportInvoicesCSV = (invoices) => {
  const headers = [
    "Invoice Number",
    "Date",
    "Donor Name",
    "Donor Email",
    "Donor Phone",
    "Donor ID",
    "Amount",
    "Purpose",
    "Payment Method",
    "Transaction ID",
    "Status",
  ];

  const rows = invoices.map((inv) => [
    inv.invoiceNumber,
    new Date(inv.invoiceDate).toLocaleDateString(),
    inv.donorName,
    inv.donorEmail,
    inv.donorPhone,
    inv.donorId,
    inv.amount,
    inv.purpose,
    inv.paymentMethod,
    inv.transactionId,
    inv.status,
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", `invoices-${Date.now()}.csv`);
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Format invoice for display
 */
export const formatInvoiceForDisplay = (invoiceData) => {
  return {
    ...invoiceData,
    formattedDate: new Date(invoiceData.invoiceDate).toLocaleDateString(
      "en-IN",
      {
        year: "numeric",
        month: "long",
        day: "numeric",
      },
    ),
    formattedAmount: `₹${invoiceData.amount.toLocaleString("en-IN")}`,
    formattedTransactionDate: new Date(
      invoiceData.transactionDate,
    ).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
  };
};
