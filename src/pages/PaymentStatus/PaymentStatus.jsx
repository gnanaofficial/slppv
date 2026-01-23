import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { FiCheckCircle, FiXCircle, FiAlertCircle } from "react-icons/fi";
import { motion } from "framer-motion";

const PaymentStatus = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading"); // loading, success, failure, pending
  const [details, setDetails] = useState(null);

  useEffect(() => {
    // Parse query parameters from SBI ePay or other gateways
    const paymentStatus = searchParams.get("status")?.toLowerCase();
    const transactionId =
      searchParams.get("transactionId") || searchParams.get("txnId");
    const amount = searchParams.get("amount");
    const orderId = searchParams.get("orderId");

    // Simulate processing delay for better UX
    setTimeout(() => {
      if (paymentStatus === "success" || paymentStatus === "captured") {
        setStatus("success");
      } else if (paymentStatus === "failure" || paymentStatus === "failed") {
        setStatus("failure");
      } else if (paymentStatus === "pending") {
        setStatus("pending");
      } else {
        // Default fallthrough if no status param, or unknown
        // For now, let's assume if we are here without params, it's an error or direct access
        if (!paymentStatus) {
          setStatus("unknown");
        } else {
          setStatus("failure");
        }
      }

      setDetails({
        transactionId: transactionId || "N/A",
        amount: amount,
        orderId: orderId,
      });
    }, 1500);
  }, [searchParams]);

  const renderContent = () => {
    switch (status) {
      case "loading":
        return (
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-mainColor border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-gray-800">
              Verifying Payment...
            </h2>
            <p className="text-gray-600 mt-2">
              Please wait while we confirm your transaction.
            </p>
          </div>
        );

      case "success":
        return (
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <FiCheckCircle size={48} />
            </motion.div>
            <h2 className="text-3xl font-bold text-green-700 font-play mb-4">
              Payment Successful!
            </h2>
            <p className="text-gray-600 mb-6">
              Thank you for your generous donation. Your transaction has been
              completed successfully.
            </p>

            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 text-left max-w-md mx-auto mb-8">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Transaction ID:</span>
                <span className="font-semibold text-gray-800 break-all">
                  {details.transactionId}
                </span>
              </div>
              {details.amount && (
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-semibold text-green-700">
                    ₹{details.amount}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="font-semibold text-green-600 uppercase">
                  Success
                </span>
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <Link
                to="/"
                className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition font-semibold"
              >
                Go Home
              </Link>
              <Link
                to="/donate"
                className="px-6 py-3 bg-mainColor text-white rounded-lg hover:bg-red-700 transition font-semibold"
              >
                Donate Again
              </Link>
            </div>
          </div>
        );

      case "failure":
        return (
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <FiXCircle size={48} />
            </motion.div>
            <h2 className="text-3xl font-bold text-red-700 font-play mb-4">
              Payment Failed
            </h2>
            <p className="text-gray-600 mb-6">
              We couldn't process your payment. This might be due to a bank
              decline or network issue.
            </p>

            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 text-left max-w-md mx-auto mb-8">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Transaction ID:</span>
                <span className="font-semibold text-gray-800 break-all">
                  {details?.transactionId}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="font-semibold text-red-600 uppercase">
                  Failed
                </span>
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <Link
                to="/"
                className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition font-semibold"
              >
                Cancel
              </Link>
              <Link
                to="/donate"
                className="px-6 py-3 bg-mainColor text-white rounded-lg hover:bg-red-700 transition font-semibold"
              >
                Try Again
              </Link>
            </div>
          </div>
        );

      case "pending":
        return (
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-20 h-20 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <FiAlertCircle size={48} />
            </motion.div>
            <h2 className="text-3xl font-bold text-yellow-700 font-play mb-4">
              Payment Pending
            </h2>
            <p className="text-gray-600 mb-6">
              Your payment is currently being processed. You will receive a
              confirmation shortly.
            </p>
            <Link
              to="/"
              className="px-6 py-3 bg-mainColor text-white rounded-lg hover:bg-red-700 transition font-semibold"
            >
              Return Home
            </Link>
          </div>
        );

      default: // unknown
        return (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Payment Status Unknown
            </h2>
            <p className="text-gray-600 mb-6">
              We could not retrieve the status of your payment. Please contact
              support if money was deducted.
            </p>
            <Link
              to="/"
              className="px-6 py-3 bg-mainColor text-white rounded-lg hover:bg-red-700 transition font-semibold"
            >
              Return Home
            </Link>
          </div>
        );
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center py-12 px-4 bg-gray-50">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-2xl w-full">
        {renderContent()}
      </div>
    </div>
  );
};

export default PaymentStatus;
