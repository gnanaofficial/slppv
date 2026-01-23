/**
 * SBI ePay Payment Service
 * Handles payment integration with SBI ePay gateway
 */

/**
 * Initialize SBI ePay payment
 * @param {Object} options - Payment options
 * @param {number} options.amount - Amount in rupees
 * @param {string} options.purpose - Purpose of donation
 * @param {string} options.donorName - Donor's name
 * @param {string} options.donorEmail - Donor's email
 * @param {string} options.donorPhone - Donor's phone
 * @param {Function} options.onSuccess - Success callback
 * @param {Function} options.onFailure - Failure callback
 */
export const initiatePayment = async ({
  amount,
  purpose,
  donorName,
  donorEmail,
  donorPhone,
  onSuccess,
  onFailure,
}) => {
  try {
    // SBI ePay integration details
    const merchantId = import.meta.env.VITE_SBI_MERCHANT_ID || "";
    const merchantKey = import.meta.env.VITE_SBI_MERCHANT_KEY || "";
    const paymentUrl =
      import.meta.env.VITE_SBI_PAYMENT_URL ||
      "https://www.sbiepay.sbi/secure/AggregatorHostedListener";

    if (!merchantId || !merchantKey) {
      console.warn("SBI ePay not configured. Using mock payment for testing.");
      // Mock payment for testing
      setTimeout(() => {
        if (onSuccess) {
          onSuccess({
            paymentId: `MOCK_${Date.now()}`,
            orderId: `ORDER_${Date.now()}`,
            signature: "mock_signature",
          });
        }
      }, 2000);
      return;
    }

    // Generate unique order ID
    const orderId = `SLPPV_${Date.now()}`;

    // Prepare SBI ePay request parameters
    const paymentData = {
      merchantId: merchantId,
      operatingMode: "DOM", // Domestic
      country: "IN",
      currency: "INR",
      amount: amount.toFixed(2),
      otherDetails: purpose,
      returnUrl: `${window.location.origin}/payment/success`,
      reference: orderId,
      payerName: donorName,
      payerEmail: donorEmail,
      payerMobile: donorPhone,
      payMode: "NB", // Net Banking (can be NB, CC, DC, etc.)
    };

    // Create form for SBI ePay submission
    const form = document.createElement("form");
    form.method = "POST";
    form.action = paymentUrl;
    form.style.display = "none";

    // Add all parameters as hidden fields
    Object.keys(paymentData).forEach((key) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = key;
      input.value = paymentData[key];
      form.appendChild(input);
    });

    // Add checksum (in production, this should be generated on backend)
    // For now, using a placeholder
    const checksumInput = document.createElement("input");
    checksumInput.type = "hidden";
    checksumInput.name = "checksum";
    checksumInput.value = generateChecksum(paymentData, merchantKey);
    form.appendChild(checksumInput);

    document.body.appendChild(form);

    // Store callback in sessionStorage for return URL handling
    sessionStorage.setItem(
      "paymentCallback",
      JSON.stringify({
        amount,
        purpose,
        donorName,
        donorEmail,
        donorPhone,
      }),
    );

    // Submit form to SBI ePay
    form.submit();
  } catch (error) {
    console.error("Payment initiation error:", error);
    if (onFailure) {
      onFailure({ message: error.message });
    }
  }
};

/**
 * Generate checksum for SBI ePay (simplified version)
 * In production, this should be done on the backend for security
 */
function generateChecksum(data, key) {
  // This is a placeholder. In production, use proper encryption
  // The actual checksum generation should be done on your backend
  const dataString = Object.values(data).join("|");
  return btoa(dataString + key).substring(0, 32);
}

/**
 * Verify payment response from SBI ePay
 * This should be called on the return URL
 */
export const verifyPayment = (responseData) => {
  // In production, verify the checksum on backend
  // For now, basic validation
  if (
    responseData.status === "SUCCESS" ||
    responseData.PaymentStatus === "SUCCESS"
  ) {
    return {
      success: true,
      paymentId: responseData.PaymentID || responseData.paymentId,
      orderId: responseData.OrderID || responseData.reference,
    };
  }
  return {
    success: false,
    error: responseData.ErrorMessage || "Payment failed",
  };
};

/**
 * Generate receipt for donation
 * @param {Object} donationData - Donation details
 * @returns {string} - Receipt URL or data
 */
export const generateReceipt = (donationData) => {
  const receipt = {
    receiptNumber: `SLPPV-${Date.now()}`,
    date: new Date().toLocaleDateString("en-IN"),
    donorName: donationData.donorName,
    amount: donationData.amount,
    purpose: donationData.purpose,
    paymentId: donationData.paymentId,
    status: "Success",
  };

  const receiptText = `
    ========================================
    SRI LAKSHMI PADMAVATHI TEMPLE
    DONATION RECEIPT
    ========================================
    
    Receipt No: ${receipt.receiptNumber}
    Date: ${receipt.date}
    
    Donor Name: ${receipt.donorName}
    Amount: ₹${receipt.amount}
    Purpose: ${receipt.purpose}
    Payment ID: ${receipt.paymentId}
    Status: ${receipt.status}
    
    ========================================
    Thank you for your generous donation!
    May Lord Venkateswara bless you!
    ========================================
  `;

  const blob = new Blob([receiptText], { type: "text/plain" });
  return URL.createObjectURL(blob);
};

/**
 * Download receipt
 * @param {string} receiptUrl - Receipt URL
 * @param {string} fileName - File name for download
 */
export const downloadReceipt = (
  receiptUrl,
  fileName = "donation-receipt.txt",
) => {
  const link = document.createElement("a");
  link.href = receiptUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Alternative: Direct bank transfer information
 * This can be shown as a fallback option
 */
export const getBankDetails = () => {
  return {
    accountName:
      "Sri Lakshmi Padmavathi Sameta Sri Prasanna Venkateswara Swamy trust",
    accountNumber: "41411167549",
    ifscCode: "SBIN0016990",
    bankName: "State Bank of India",
    branch: "Your Branch Name",
    phonePay: "9492284523",
  };
};

export default {
  initiatePayment,
  verifyPayment,
  generateReceipt,
  downloadReceipt,
  getBankDetails,
};
