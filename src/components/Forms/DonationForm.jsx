import React, { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import useWeb3Forms from "@web3forms/react";
import Modal from "./Modal";
import { initializePayment } from "../../lib/payment";
import { db } from "../../lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function DonationForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    mode: "onTouched",
  });

  const [amount, setAmount] = useState(""); // Add amount state
  const [paymentMethod, setPaymentMethod] = useState("razorpay"); // Default to Razorpay

  const [isSuccess, setIsSuccess] = useState(false);
  const [message, setMessage] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [screenshot, setScreenshot] = useState(null);
  const [fileError, setFileError] = useState("");
  const fileInputRef = useRef(null);

  // Please move this API key to an environment variable in production
  const apiKey = "bae9aaf7-fef2-42e1-a95a-55a840e1c378";

  // Handle file upload with validation
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFileError("");

    if (!file) {
      setScreenshot(null);
      return;
    }

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setFileError(
        "Please upload a valid image file (JPEG, PNG, GIF, or WEBP)",
      );
      fileInputRef.current.value = "";
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setFileError("File size should be less than 5MB");
      fileInputRef.current.value = "";
      return;
    }

    // Convert file to base64 for email attachment
    const reader = new FileReader();
    reader.onloadend = () => {
      setScreenshot({
        name: file.name,
        data: reader.result,
      });
    };
    reader.onerror = () => {
      setFileError("Error reading the file. Please try again.");
    };
    reader.readAsDataURL(file);
  };

  // Web3Forms configuration
  const { submit: onSubmit } = useWeb3Forms({
    access_key: apiKey,
    settings: {
      from_name: "Padmavathi Trust Donations",
      subject: "New Donation Submission",
    },
    onSuccess: (msg) => {
      setIsSuccess(true);
      setMessage(msg);
      reset();
      setScreenshot(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setModalOpen(true);
    },
    onError: (msg) => {
      setIsSuccess(false);
      setMessage(msg);
      alert("Error submitting form: " + msg);
    },
  });

  // Handle modal close with proper scroll restoration
  const handleCloseModal = () => {
    setModalOpen(false);

    // Ensure scroll is restored - this works with the enhanced Modal component
    document.body.style.overflow = "auto";

    // Add a small delay to ensure DOM updates before attempting to scroll
    setTimeout(() => {
      window.scrollTo({
        top: window.scrollY,
        behavior: "auto",
      });
    }, 10);
  };

  // Form submission handler
  const handleFormSubmit = async (data) => {
    // If we have a file, it might be a manual offline donation verification
    // But if we want to support online payment, we trigger it here.

    // For this implementation, let's assume if "screenshot" is provided, it's offline/manual
    // If not, or if user chooses online (UI needs to support this choice), we do online.
    // For now, let's trigger online payment if no screenshot is uploaded, OR just add a "Pay Online" button.

    // Integrating Online Payment Flow
    // We will save to Firebase after successful payment

    const money = data.amount || 100; // Default or from form

    const userDetails = {
      name: data.accountHolderName,
      email: data.email,
      phone: data.phone,
    };

    // If user uploaded a screenshot, we treat it as manual/already paid
    if (screenshot) {
      try {
        // Save to Firestore 'donations' collection
        await addDoc(collection(db, "donors"), {
          ...data, // includes form fields
          screenshot: screenshot.data, // base64
          status: "pending_verification",
          type: "manual",
          createdAt: serverTimestamp(),
        });

        await onSubmit(data); // Send email notification via Web3Forms
      } catch (error) {
        console.error("Error saving donation:", error);
      }
      return;
    }

    // Else trigger Razorpay
    if (paymentMethod === "sbi") {
      alert("Redirecting to SBI ePay... (Simulating success for demo)");
      try {
        await addDoc(collection(db, "donors"), {
          ...userDetails,
          amount: money,
          method: "sbi_epay",
          paymentId: "SIMULATED_SBI_" + Date.now(),
          status: "success",
          type: "online",
          createdAt: serverTimestamp(),
        });
        setIsSuccess(true);
        setMessage("Payment Successful via SBI ePay! (Simulated)");
        reset();
        setModalOpen(true);
      } catch (e) {
        console.error("Error saving sbi payment", e);
      }
      return;
    }

    initializePayment(
      money,
      async (paymentResponse) => {
        // Payment Success
        try {
          await addDoc(collection(db, "donors"), {
            ...userDetails,
            amount: money,
            paymentId: paymentResponse.paymentId,
            status: "success",
            type: "online",
            createdAt: serverTimestamp(),
          });

          setIsSuccess(true);
          setMessage("Payment Successful! Thank you for your donation.");
          reset();
          setModalOpen(true);
        } catch (e) {
          console.error("Error saving payment to db", e);
          alert(
            "Payment successful but failed to save record. Contact support.",
          );
        }
      },
      (errorMessage) => {
        // Payment Failure
        alert("Payment Failed: " + errorMessage);
      },
      userDetails,
    );
  };

  return (
    <>
      <p className="text-center text-red-600 font-bold text-2xl md:text-3xl font-play my-5">
        Donation Form
      </p>
      <form
        onSubmit={handleSubmit(handleFormSubmit)}
        className="w-full w-2/3 xl:w-1/3 max-w-xl mx-auto px-4 font-play"
      >
        {/* Hidden field for bot detection */}
        <input
          type="checkbox"
          id="botcheck"
          className="hidden"
          style={{ display: "none" }}
          {...register("botcheck")}
        />

        <div className="mb-5">
          <input
            type="number"
            placeholder="Amount (₹)"
            className={`w-full px-4 py-3 border-2 placeholder:text-gray-800 dark:text-white rounded-md outline-none dark:placeholder:text-gray-200 dark:bg-gray-900 focus:ring-4 ${
              errors.amount
                ? "border-red-600 focus:border-red-600 ring-red-100 dark:ring-0"
                : "border-gray-300 focus:border-gray-600 ring-gray-100 dark:border-gray-600 dark:focus:border-white dark:ring-0"
            }`}
            {...register("amount", {
              required: "Amount is required",
              min: { value: 1, message: "Amount must be at least ₹1" },
            })}
          />
          {errors.amount && (
            <div className="mt-1 text-red-600">
              <small>{errors.amount.message}</small>
            </div>
          )}
        </div>

        {/* Payment Method Selection */}
        <div className="mb-5">
          <label className="block mb-2 font-bold dark:text-white">
            Payment Method
          </label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer dark:text-white">
              <input
                type="radio"
                name="paymentMethod"
                value="razorpay"
                checked={paymentMethod === "razorpay"}
                onChange={() => setPaymentMethod("razorpay")}
                className="accent-[#FAAC2F]"
              />
              Razorpay
            </label>
            <label className="flex items-center gap-2 cursor-pointer dark:text-white">
              <input
                type="radio"
                name="paymentMethod"
                value="sbi"
                checked={paymentMethod === "sbi"}
                onChange={() => setPaymentMethod("sbi")}
                className="accent-[#FAAC2F]"
              />
              SBI ePay
            </label>
          </div>
        </div>

        <div className="mb-5">
          <input
            type="text"
            placeholder="Name"
            autoComplete="name"
            className={`w-full px-4 py-3 border-2 placeholder:text-gray-800 dark:text-white rounded-md outline-none dark:placeholder:text-gray-200 dark:bg-gray-900 focus:ring-4 ${
              errors.accountHolderName
                ? "border-red-600 focus:border-red-600 ring-red-100 dark:ring-0"
                : "border-gray-300 focus:border-gray-600 ring-gray-100 dark:border-gray-600 dark:focus:border-white dark:ring-0"
            }`}
            {...register("accountHolderName", {
              required: "Account holder's name is required",
              maxLength: 100,
            })}
          />
          {errors.accountHolderName && (
            <div className="mt-1 text-red-600">
              <small>{errors.accountHolderName.message}</small>
            </div>
          )}
        </div>

        <div className="mb-5">
          <input
            type="text"
            placeholder="Account Number"
            autoComplete="off"
            className={`w-full px-4 py-3 border-2 placeholder:text-gray-800 dark:text-white rounded-md outline-none dark:placeholder:text-gray-200 dark:bg-gray-900 focus:ring-4 ${
              errors.accountNumber
                ? "border-red-600 focus:border-red-600 ring-red-100 dark:ring-0"
                : "border-gray-300 focus:border-gray-600 ring-gray-100 dark:border-gray-600 dark:focus:border-white dark:ring-0"
            }`}
            {...register("accountNumber", {
              required: "Account number is required",
              pattern: {
                value: /^[0-9]+$/,
                message: "Please enter a valid account number (numbers only)",
              },
            })}
          />
          {errors.accountNumber && (
            <div className="mt-1 text-red-600">
              <small>{errors.accountNumber.message}</small>
            </div>
          )}
        </div>

        <div className="mb-5">
          <input
            type="text"
            placeholder="IFSC Code"
            autoComplete="off"
            className={`w-full px-4 py-3 border-2 placeholder:text-gray-800 dark:text-white rounded-md outline-none dark:placeholder:text-gray-200 dark:bg-gray-900 focus:ring-4 ${
              errors.ifscCode
                ? "border-red-600 focus:border-red-600 ring-red-100 dark:ring-0"
                : "border-gray-300 focus:border-gray-600 ring-gray-100 dark:border-gray-600 dark:focus:border-white dark:ring-0"
            }`}
            {...register("ifscCode", {
              required: "IFSC code is required",
              pattern: {
                value: /^[A-Z]{4}0[A-Z0-9]{6}$/,
                message: "Please enter a valid IFSC code",
              },
            })}
          />
          {errors.ifscCode && (
            <div className="mt-1 text-red-600">
              <small>{errors.ifscCode.message}</small>
            </div>
          )}
        </div>

        <div className="mb-5">
          <input
            type="text"
            placeholder="UTR Number"
            autoComplete="off"
            className={`w-full px-4 py-3 border-2 placeholder:text-gray-800 dark:text-white rounded-md outline-none dark:placeholder:text-gray-200 dark:bg-gray-900 focus:ring-4 ${
              errors.utrNumber
                ? "border-red-600 focus:border-red-600 ring-red-100 dark:ring-0"
                : "border-gray-300 focus:border-gray-600 ring-gray-100 dark:border-gray-600 dark:focus:border-white dark:ring-0"
            }`}
            {...register("utrNumber", {
              required: "UTR number is required",
            })}
          />
          {errors.utrNumber && (
            <div className="mt-1 text-red-600">
              <small>{errors.utrNumber.message}</small>
            </div>
          )}
        </div>

        <div className="mb-5">
          <label htmlFor="email" className="sr-only">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            placeholder="Email Address"
            autoComplete="email"
            className={`w-full px-4 py-3 border-2 placeholder:text-gray-800 dark:text-white rounded-md outline-none dark:placeholder:text-gray-200 dark:bg-gray-900 focus:ring-4 ${
              errors.email
                ? "border-red-600 focus:border-red-600 ring-red-100 dark:ring-0"
                : "border-gray-300 focus:border-gray-600 ring-gray-100 dark:border-gray-600 dark:focus:border-white dark:ring-0"
            }`}
            {...register("email", {
              required: "Enter your email",
              pattern: {
                value: /^\S+@\S+$/i,
                message: "Please enter a valid email",
              },
            })}
          />
          {errors.email && (
            <div className="mt-1 text-red-600">
              <small>{errors.email.message}</small>
            </div>
          )}
        </div>

        <div className="mb-5">
          <input
            type="tel"
            placeholder="Phone Number"
            autoComplete="tel"
            className={`w-full px-4 py-3 border-2 placeholder:text-gray-800 dark:text-white rounded-md outline-none dark:placeholder:text-gray-200 dark:bg-gray-900 focus:ring-4 ${
              errors.phone
                ? "border-red-600 focus:border-red-600 ring-red-100 dark:ring-0"
                : "border-gray-300 focus:border-gray-600 ring-gray-100 dark:border-gray-600 dark:focus:border-white dark:ring-0"
            }`}
            {...register("phone", {
              required: "Phone number is required",
              pattern: {
                value: /^[0-9]{10}$/,
                message: "Please enter a valid phone number",
              },
            })}
          />
          {errors.phone && (
            <div className="mt-1 text-red-600">
              <small>{errors.phone.message}</small>
            </div>
          )}
        </div>

        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Payment Screenshot
          </label>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-md outline-none focus:ring-4 focus:border-gray-600 ring-gray-100"
          />
          {fileError && (
            <div className="mt-1 text-red-600">
              <small>{fileError}</small>
            </div>
          )}
          {screenshot && (
            <div className="mt-2 text-green-600 text-sm">
              ✓ File uploaded: {screenshot.name}
            </div>
          )}
        </div>

        <div className="mb-5">
          <textarea
            name="donationDetails"
            placeholder="Additional Details (optional)"
            className="w-full px-4 py-3 border-2 placeholder:text-gray-800 dark:text-white dark:placeholder:text-gray-200 dark:bg-gray-900 rounded-md outline-none h-36 focus:ring-4 border-gray-300 focus:border-gray-600 ring-gray-100 dark:border-gray-600 dark:focus:border-white dark:ring-0"
            {...register("donationDetails")}
          />
        </div>

        <button
          type="submit"
          className="w-full py-4 font-semibold text-white transition-colors bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-offset-2 focus:ring focus:ring-red-200 px-7"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <svg
              className="w-5 h-5 mx-auto text-white animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          ) : (
            "Submit Donation Details"
          )}
        </button>
      </form>

      {/* Modal for success message */}
      <Modal
        open={modalOpen}
        onClose={handleCloseModal}
        message={
          message ||
          "Success! Your donation details have been submitted. Thank you for your contribution."
        }
      />
    </>
  );
}
