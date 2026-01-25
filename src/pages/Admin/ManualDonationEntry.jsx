import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Select from "react-select";
import {
  getAllDonors,
  createDonor,
  createDonation,
} from "../../lib/firestoreService";
import { generateDonorId } from "../../lib/donorService";
import { validateDonorData } from "../../utils/donorUtils";
import {
  createInvoice,
  downloadInvoicePDF,
  printInvoice,
} from "../../lib/invoiceService";

const ManualDonationEntry = () => {
  const navigate = useNavigate();
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isNewDonor, setIsNewDonor] = useState(false);
  const [generatedInvoice, setGeneratedInvoice] = useState(null);
  const [showInvoicePreview, setShowInvoicePreview] = useState(false);

  const [formData, setFormData] = useState({
    // Donor selection
    selectedDonorId: "",

    // New donor fields
    donorName: "",
    donorEmail: "",
    donorPhone: "",
    donorAddress: "",

    // Transaction fields
    amount: "",
    purpose: "general",
    paymentMethod: "cash",
    transactionReference: "",
    transactionDate: new Date().toISOString().split("T")[0],
    notes: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchDonors();
  }, []);

  const fetchDonors = async () => {
    try {
      const data = await getAllDonors();
      setDonors(data);
    } catch (error) {
      console.error("Error fetching donors:", error);
      toast.error("Failed to load donors");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleDonorSelection = (selectedOption) => {
    if (!selectedOption) {
      // Clear selection
      setIsNewDonor(false);
      setFormData((prev) => ({
        ...prev,
        selectedDonorId: "",
        donorName: "",
        donorEmail: "",
        donorPhone: "",
        donorAddress: "",
      }));
      return;
    }

    const donorId = selectedOption.value;

    if (donorId === "new") {
      setIsNewDonor(true);
      setFormData((prev) => ({
        ...prev,
        selectedDonorId: "",
        donorName: "",
        donorEmail: "",
        donorPhone: "",
        donorAddress: "",
      }));
    } else {
      setIsNewDonor(false);
      const selectedDonor = donors.find((d) => d.id === donorId);

      if (selectedDonor) {
        setFormData((prev) => ({
          ...prev,
          selectedDonorId: donorId,
          donorName: selectedDonor.name,
          donorEmail: selectedDonor.email,
          donorPhone: selectedDonor.phone,
          donorAddress: selectedDonor.address || "",
        }));
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate amount
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = "Amount must be greater than 0";
    }

    // Validate donor info
    if (isNewDonor) {
      const donorValidation = validateDonorData({
        name: formData.donorName,
        email: formData.donorEmail,
        phone: formData.donorPhone,
      });

      if (!donorValidation.isValid) {
        Object.assign(newErrors, donorValidation.errors);
      }
    } else if (!formData.selectedDonorId) {
      newErrors.selectedDonorId = "Please select a donor or create new";
    }

    // Validate transaction reference for certain payment methods
    if (
      (formData.paymentMethod === "cheque" ||
        formData.paymentMethod === "bank_transfer" ||
        formData.paymentMethod === "upi") &&
      !formData.transactionReference
    ) {
      newErrors.transactionReference =
        "Transaction reference is required for this payment method";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setLoading(true);

    try {
      let donorId = formData.selectedDonorId;
      let donorData = {
        name: formData.donorName,
        email: formData.donorEmail,
        phone: formData.donorPhone,
      };

      // Create new donor if needed
      if (isNewDonor) {
        const newDonorId = await generateDonorId();
        const newDonor = await createDonor({
          ...donorData,
          address: formData.donorAddress,
          donorId: newDonorId,
        });
        donorId = newDonor.id;
        donorData.donorId = newDonorId;
        toast.success("New donor created successfully");
      } else {
        const selectedDonor = donors.find((d) => d.id === donorId);
        donorData.donorId = selectedDonor.donorId;
      }

      // Create donation record
      const donation = await createDonation({
        donorId: donorId,
        donorName: donorData.name,
        donorEmail: donorData.email,
        donorPhone: donorData.phone,
        amount: parseFloat(formData.amount),
        purpose: getPurposeLabel(formData.purpose),
        paymentMethod: formData.paymentMethod,
        transactionId: formData.transactionReference || `MANUAL-${Date.now()}`,
        transactionDate: new Date(formData.transactionDate).toISOString(),
        status: "success",
        notes: formData.notes,
        entryType: "manual",
      });

      // Generate invoice
      const invoice = createInvoice({
        ...donation,
        donorId: donorData.donorId,
      });

      setGeneratedInvoice(invoice);
      setShowInvoicePreview(true);

      toast.success("Donation recorded successfully!");

      // Reset form
      setFormData({
        selectedDonorId: "",
        donorName: "",
        donorEmail: "",
        donorPhone: "",
        donorAddress: "",
        amount: "",
        purpose: "general",
        paymentMethod: "cash",
        transactionReference: "",
        transactionDate: new Date().toISOString().split("T")[0],
        notes: "",
      });
      setIsNewDonor(false);

      // Refresh donors list
      fetchDonors();
    } catch (error) {
      console.error("Error creating donation:", error);
      toast.error("Failed to record donation");
    } finally {
      setLoading(false);
    }
  };

  const getPurposeLabel = (purpose) => {
    const purposes = {
      general: "General Donation",
      building_fund: "Building Fund",
      seva_donation: "Seva Donation",
      annadanam: "Annadanam",
      gopuja: "Go Puja",
      nitya_kainkaryam: "Nitya Kainkaryam",
    };
    return purposes[purpose] || purpose;
  };

  const handlePrintInvoice = () => {
    if (generatedInvoice) {
      printInvoice(generatedInvoice);
    }
  };

  const handleDownloadInvoice = () => {
    if (generatedInvoice) {
      downloadInvoicePDF(generatedInvoice);
    }
  };

  const handleCloseInvoicePreview = () => {
    setShowInvoicePreview(false);
    setGeneratedInvoice(null);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-mainColor font-play">
            Manual Donation Entry
          </h2>
          <p className="text-gray-600 mt-1">
            Record offline transactions (Cash, Cheque, Bank Transfer)
          </p>
        </div>
        <button
          onClick={() => navigate("/temple-management/donors")}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition font-semibold"
        >
          ← Back to Donors
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Donor Selection */}
        <div className="bg-gray-50 p-6 rounded-lg border-2 border-gray-200">
          <h3 className="text-xl font-bold text-mainColor mb-4">
            Donor Information
          </h3>

          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Select Donor *
            </label>
            <Select
              value={
                isNewDonor
                  ? { value: "new", label: "+ Create New Donor" }
                  : formData.selectedDonorId
                    ? {
                      value: formData.selectedDonorId,
                      label: donors.find((d) => d.id === formData.selectedDonorId)
                        ? `${donors.find((d) => d.id === formData.selectedDonorId).name} - ${donors.find((d) => d.id === formData.selectedDonorId).donorId
                        } (${donors.find((d) => d.id === formData.selectedDonorId).email})`
                        : "",
                    }
                    : null
              }
              onChange={handleDonorSelection}
              options={[
                ...donors.map((donor) => ({
                  value: donor.id,
                  label: `${donor.name} - ${donor.donorId} (${donor.email})`,
                  donor: donor, // Store full donor object for easy access
                })),
                { value: "new", label: "+ Create New Donor" },
              ]}
              placeholder="🔍 Search or select donor..."
              isClearable
              isSearchable
              className="react-select-container"
              classNamePrefix="react-select"
              styles={{
                control: (base, state) => ({
                  ...base,
                  borderColor: state.isFocused ? "#C62828" : "#D1D5DB",
                  borderWidth: "2px",
                  borderRadius: "0.5rem",
                  padding: "0.5rem",
                  boxShadow: state.isFocused ? "0 0 0 1px #C62828" : "none",
                  "&:hover": {
                    borderColor: "#C62828",
                  },
                }),
                option: (base, state) => ({
                  ...base,
                  backgroundColor: state.isSelected
                    ? "#C62828"
                    : state.isFocused
                      ? "#FEE2E2"
                      : "white",
                  color: state.isSelected ? "white" : "#1F2937",
                  cursor: "pointer",
                  "&:active": {
                    backgroundColor: "#C62828",
                  },
                }),
                placeholder: (base) => ({
                  ...base,
                  color: "#9CA3AF",
                }),
              }}
              noOptionsMessage={() => "No donors found"}
            />
            {errors.selectedDonorId && (
              <p className="text-red-600 text-sm mt-1">
                {errors.selectedDonorId}
              </p>
            )}
          </div>

          {/* New Donor Fields */}
          {isNewDonor && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 p-4 bg-yellow-50 rounded-lg border-2 border-yellow-200">
              <div className="md:col-span-2">
                <p className="text-sm font-semibold text-yellow-800 mb-2">
                  Creating New Donor
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  name="donorName"
                  value={formData.donorName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-mainColor focus:outline-none"
                  placeholder="Full name"
                />
                {errors.name && (
                  <p className="text-red-600 text-sm mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="donorEmail"
                  value={formData.donorEmail}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-mainColor focus:outline-none"
                  placeholder="email@example.com"
                />
                {errors.email && (
                  <p className="text-red-600 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone *
                </label>
                <input
                  type="tel"
                  name="donorPhone"
                  value={formData.donorPhone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-mainColor focus:outline-none"
                  placeholder="10-digit mobile number"
                  maxLength="10"
                />
                {errors.phone && (
                  <p className="text-red-600 text-sm mt-1">{errors.phone}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Address (Optional)
                </label>
                <input
                  type="text"
                  name="donorAddress"
                  value={formData.donorAddress}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-mainColor focus:outline-none"
                  placeholder="Full address"
                />
              </div>
            </div>
          )}
        </div>

        {/* Transaction Details */}
        <div className="bg-gray-50 p-6 rounded-lg border-2 border-gray-200">
          <h3 className="text-xl font-bold text-mainColor mb-4">
            Transaction Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Amount (₹) *
              </label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-mainColor focus:outline-none"
                placeholder="Enter amount"
                min="1"
              />
              {errors.amount && (
                <p className="text-red-600 text-sm mt-1">{errors.amount}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Purpose *
              </label>
              <select
                name="purpose"
                value={formData.purpose}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-mainColor focus:outline-none"
              >
                <option value="general">General Donation</option>
                <option value="building_fund">Building Fund</option>
                <option value="seva_donation">Seva Donation</option>
                <option value="annadanam">Annadanam</option>
                <option value="gopuja">Go Puja</option>
                <option value="nitya_kainkaryam">Nitya Kainkaryam</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Payment Method *
              </label>
              <select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-mainColor focus:outline-none"
              >
                <option value="cash">Cash</option>
                <option value="cheque">Cheque</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="upi">UPI</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Transaction Reference
                {(formData.paymentMethod === "cheque" ||
                  formData.paymentMethod === "bank_transfer" ||
                  formData.paymentMethod === "upi") &&
                  " *"}
              </label>
              <input
                type="text"
                name="transactionReference"
                value={formData.transactionReference}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-mainColor focus:outline-none"
                placeholder="Cheque no., UTR, Transaction ID"
              />
              {errors.transactionReference && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.transactionReference}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Transaction Date *
              </label>
              <input
                type="date"
                name="transactionDate"
                value={formData.transactionDate}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-mainColor focus:outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Notes / Remarks (Optional)
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="3"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-mainColor focus:outline-none"
                placeholder="Any additional notes..."
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate("/temple-management/donors")}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition font-semibold"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className={`px-6 py-3 rounded-lg text-white font-semibold transition ${loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-mainColor hover:bg-red-700"
              }`}
          >
            {loading ? "Recording..." : "Record Donation & Generate Invoice"}
          </button>
        </div>
      </form>

      {/* Invoice Preview Modal */}
      {showInvoicePreview && generatedInvoice && (
        <InvoicePreviewModal
          invoice={generatedInvoice}
          onPrint={handlePrintInvoice}
          onDownload={handleDownloadInvoice}
          onClose={handleCloseInvoicePreview}
        />
      )}
    </div>
  );
};

// Invoice Preview Modal Component
const InvoicePreviewModal = ({ invoice, onPrint, onDownload, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-mainColor text-white p-6 rounded-t-lg">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-bold font-play">Invoice Generated</h3>
            <button
              onClick={onClose}
              className="text-white hover:text-yellow-200 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        {/* Invoice Preview */}
        <div className="p-6">
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6 mb-6">
            <div className="text-center mb-6">
              <h4 className="text-2xl font-bold text-mainColor font-play">
                Sri Lakshmi Padmavathi Temple
              </h4>
              <p className="text-gray-600 mt-1">Donation Receipt</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm text-gray-600">Invoice Number</p>
                <p className="font-bold text-mainColor">
                  {invoice.invoiceNumber}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Date</p>
                <p className="font-bold">
                  {new Date(invoice.invoiceDate).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="border-t-2 border-gray-300 pt-4 mb-4">
              <h5 className="font-bold text-mainColor mb-2">Donor Details</h5>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-600">Name:</span>{" "}
                  <span className="font-semibold">{invoice.donorName}</span>
                </div>
                <div>
                  <span className="text-gray-600">Donor ID:</span>{" "}
                  <span className="font-semibold">{invoice.donorId}</span>
                </div>
                <div>
                  <span className="text-gray-600">Email:</span>{" "}
                  <span className="font-semibold">{invoice.donorEmail}</span>
                </div>
                <div>
                  <span className="text-gray-600">Phone:</span>{" "}
                  <span className="font-semibold">{invoice.donorPhone}</span>
                </div>
              </div>
            </div>

            <div className="border-t-2 border-gray-300 pt-4 mb-4">
              <h5 className="font-bold text-mainColor mb-2">
                Transaction Details
              </h5>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Purpose:</span>
                  <span className="font-semibold">{invoice.purpose}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Method:</span>
                  <span className="font-semibold">{invoice.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Transaction ID:</span>
                  <span className="font-semibold">{invoice.transactionId}</span>
                </div>
              </div>
            </div>

            <div className="bg-mainColor text-white p-4 rounded-lg text-center">
              <p className="text-sm mb-1">Total Amount</p>
              <p className="text-3xl font-bold">
                ₹{invoice.amount.toLocaleString("en-IN")}
              </p>
            </div>

            <div className="text-center mt-6 text-sm text-gray-600 italic">
              <p>Thank you for your generous donation!</p>
              <p>Your contribution helps us serve the community better.</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4">
            <button
              onClick={onPrint}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              🖨️ Print Invoice
            </button>
            <button
              onClick={onDownload}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
            >
              📥 Download PDF
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-4 rounded-b-lg flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-mainColor text-white rounded-lg hover:bg-red-700 transition font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManualDonationEntry;
