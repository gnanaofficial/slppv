// This service handles Payment Gateway logic
// Using Razorpay as the primary provider

export const initializePayment = (money, onSuccess, onError, userDetails) => {
  const isRazorpayLoaded = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  isRazorpayLoaded().then((loaded) => {
    if (!loaded) {
      onError("Razorpay SDK failed to load");
      return;
    }

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_placeholder", // Replace with env variable
      amount: money * 100, // Amount in paise
      currency: "INR",
      name: "Sri Lakshmi Padmavathi Trust",
      description: "Donation",
      image: "https://your-logo-url.com/logo.png", // Updates with actual logo
      handler: function (response) {
        // Here we would typically verify the payment on the backend
        onSuccess({
          paymentId: response.razorpay_payment_id,
          orderId: response.razorpay_order_id,
          signature: response.razorpay_signature,
          amount: money,
          ...userDetails,
        });
      },
      prefill: {
        name: userDetails?.name || "",
        email: userDetails?.email || "",
        contact: userDetails?.phone || "",
      },
      theme: {
        color: "#FAAC2F", // Primary color
      },
    };

    const rzp1 = new window.Razorpay(options);
    rzp1.on("payment.failed", function (response) {
      onError(response.error.description);
    });
    rzp1.open();
  });
};
