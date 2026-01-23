import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Container } from "@mui/material";
import SEO from "../../components/common/SEO";
import {
  initiatePayment,
  generateReceipt,
  downloadReceipt,
  getBankDetails,
} from "../../lib/paymentService";
import {
  createDonation,
  getAllDonors,
  createDonor,
} from "../../lib/firestoreService";
import { generateDonorId } from "../../lib/donorService";

const Donate = () => {
  const { t } = useTranslation();
  const [showBankDetails, setShowBankDetails] = useState(false);
  const [formData, setFormData] = useState({
    amount: "",
    purpose: "general",
    name: "",
    email: "",
    phone: "",
  });
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  const bankDetails = getBankDetails();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleDonate = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (
      !formData.amount ||
      !formData.name ||
      !formData.email ||
      !formData.phone
    ) {
      setError("All fields are required");
      return;
    }

    if (parseFloat(formData.amount) < 1) {
      setError("Amount must be at least ₹1");
      return;
    }

    if (!/^[0-9]{10}$/.test(formData.phone)) {
      setError("Please enter a valid 10-digit mobile number");
      return;
    }

    setProcessing(true);

    try {
      // Check if donor exists by email
      const allDonors = await getAllDonors();
      let donor = allDonors.find((d) => d.email === formData.email);
      let donorId = null;

      // Create new donor if doesn't exist
      if (!donor) {
        const newDonorId = await generateDonorId();
        donor = await createDonor({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          donorId: newDonorId,
        });
        donorId = donor.id;
        console.log("New donor created:", newDonorId);
      } else {
        donorId = donor.id;
        console.log("Existing donor found:", donor.donorId);
      }

      // Save donation as pending
      const donationData = {
        donorId: donorId,
        donorName: formData.name,
        donorEmail: formData.email,
        donorPhone: formData.phone,
        amount: parseFloat(formData.amount),
        purpose:
          formData.purpose === "general"
            ? "General Donation"
            : formData.purpose,
        paymentMethod: "sbi_epay",
        status: "pending",
      };

      const donation = await createDonation(donationData);

      // Initiate SBI ePay payment
      await initiatePayment({
        amount: parseFloat(formData.amount),
        purpose:
          formData.purpose === "general"
            ? "General Donation"
            : formData.purpose,
        donorName: formData.name,
        donorEmail: formData.email,
        donorPhone: formData.phone,
        onSuccess: async (response) => {
          // This will be handled on the return URL
          console.log("Payment initiated successfully");
        },
        onFailure: (error) => {
          setError(error.message || "Payment failed. Please try again.");
          setProcessing(false);
        },
      });
    } catch (err) {
      setError(err.message || "An error occurred. Please try again.");
      setProcessing(false);
    }
  };

  return (
    <div className="bg-[#FAAC2F] min-h-screen py-8">
      <SEO
        title={t("donate.title")}
        description={t("donate.description")}
        keywords="Donate, Payment, Trust, Support"
      />
      <Container maxWidth="xl" className="bg-white p-8 rounded-lg shadow-lg">
        {/* Header */}
        <div className="text-mainColor">
          <div className="text-center font-semibold text-lg sm:text-xl xl:text-2xl text-wrap">
            Donations may be offered to Organized temple Sevas and all Uthsavas
            <div className="h-2 w-full bg-gray-300 mt-4"></div>
          </div>
        </div>

        {/* Donation Form */}
        <div className="my-8 max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-mainColor text-center mb-6 font-phudu">
            Donate Online via SBI ePay
          </h2>

          <form onSubmit={handleDonate} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Amount (₹) *
              </label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-mainColor focus:ring-2 focus:ring-mainColor focus:outline-none"
                placeholder="Enter amount"
                min="1"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Purpose *
              </label>
              <select
                name="purpose"
                value={formData.purpose}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-mainColor focus:ring-2 focus:ring-mainColor focus:outline-none"
                required
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
              <label className="block text-gray-700 font-semibold mb-2">
                Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-mainColor focus:ring-2 focus:ring-mainColor focus:outline-none"
                placeholder="Your full name"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-mainColor focus:ring-2 focus:ring-mainColor focus:outline-none"
                placeholder="your.email@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Mobile Number *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-mainColor focus:ring-2 focus:ring-mainColor focus:outline-none"
                placeholder="10-digit mobile number"
                pattern="[0-9]{10}"
                maxLength="10"
                required
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> You will be redirected to SBI ePay secure
                payment gateway to complete your donation.
              </p>
            </div>

            <button
              type="submit"
              disabled={processing}
              className={`w-full py-4 px-6 rounded-lg text-white font-bold text-lg ${
                processing
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-mainColor hover:bg-red-700"
              } transition shadow-lg`}
            >
              {processing
                ? "Redirecting to SBI ePay..."
                : `Proceed to Pay ₹${formData.amount || "0"}`}
            </button>
          </form>
        </div>

        {/* Bank Details - Collapsible */}
        <div className="my-8 max-w-2xl mx-auto">
          <button
            onClick={() => setShowBankDetails(!showBankDetails)}
            className="w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 rounded-lg font-semibold text-gray-700 flex items-center justify-between transition"
          >
            <span>Other Payment Methods (Bank Transfer / UPI)</span>
            <svg
              className={`w-5 h-5 transform transition ${showBankDetails ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {showBankDetails && (
            <div className="mt-4 p-6 bg-gray-50 rounded-lg border-2 border-gray-200">
              <h3 className="text-xl font-bold text-mainColor mb-4">
                Bank Account Details
              </h3>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Account Name</p>
                  <p className="font-semibold text-gray-800">
                    {bankDetails.accountName}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Account Number</p>
                    <p className="font-mono font-bold text-mainColor text-lg">
                      {bankDetails.accountNumber}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">IFSC Code</p>
                    <p className="font-mono font-bold text-mainColor text-lg">
                      {bankDetails.ifscCode}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">Bank Name</p>
                    <p className="font-semibold text-gray-800">
                      {bankDetails.bankName}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">PhonePe / UPI</p>
                    <p className="font-mono font-bold text-mainColor text-lg">
                      {bankDetails.phonePay}
                    </p>
                  </div>
                </div>

                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="text-sm text-yellow-800">
                    <strong>Note:</strong> After making a bank transfer or UPI
                    payment, please send the transaction details to the temple
                    office for receipt generation.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </Container>
    </div>
  );
};

export default Donate;
