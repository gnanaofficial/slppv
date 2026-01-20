import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import useWeb3Forms from "@web3forms/react";
import Modal from "../components/Forms/Modal"; // Adjust the path as necessary

export default function Feedback() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    mode: "onTouched",
  });

  const [isSuccess, setIsSuccess] = useState(false);
  const [message, setMessage] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  // Please update the Access Key in the .env
  const apiKey = "bae9aaf7-fef2-42e1-a95a-55a840e1c378";

  const { submit: onSubmit } = useWeb3Forms({
    access_key: apiKey,
    settings: {
      from_name: "Padvamathi Trust",
      subject: "New Feedback Message",
    },
    onSuccess: (msg) => {
      setIsSuccess(true);
      setMessage(msg);
      reset();
      setModalOpen(true);
    },
    onError: (msg) => {
      setIsSuccess(false);
      setMessage(msg);
      alert("Error: " + msg); // Adding an alert for visibility of errors
    },
  });

  // Effect to manage body scroll when modal is open/closed
  useEffect(() => {
    if (modalOpen) {
      // Prevent scrolling on the body when modal is open
      document.body.style.overflow = "hidden";
    } else {
      // Restore scrolling when modal is closed
      document.body.style.overflow = "auto";
    }

    // Cleanup function to ensure scroll is restored when component unmounts
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [modalOpen]);

  const handleCloseModal = () => {
    setModalOpen(false);
    // Explicitly restore scrolling capability
    document.body.style.overflow = "auto";

    // Add a small delay to ensure DOM updates before attempting to scroll
    setTimeout(() => {
      window.scrollTo({
        top: window.scrollY,
        behavior: "auto",
      });
    }, 10);
  };

  return (
    <div className="my-12">
      <h2 className="text-center text-red-600 font-bold text-2xl md:text-3xl font-play ">
        Feedback
      </h2>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mt-4 mb-8 w-2/3 xl:w-1/3 m-auto font-play"
      >
        <input
          type="checkbox"
          id=""
          className="hidden"
          style={{ display: "none" }}
          {...register("botcheck")}
        />

        <div className="mb-5">
          <input
            type="text"
            placeholder="First Name"
            autoComplete="false"
            className={`w-full px-4 py-3 border-2 placeholder:text-gray-800 dark:text-white rounded-md outline-none dark:placeholder:text-gray-200 dark:bg-gray-900 focus:ring-4 ${
              errors.firstName
                ? "border-red-600 focus:border-red-600 ring-red-100 dark:ring-0"
                : "border-gray-300 focus:border-gray-600 ring-gray-100 dark:border-gray-600 dark:focus:border-white dark:ring-0"
            }`}
            {...register("firstName", {
              required: "First name is required",
              maxLength: 80,
            })}
          />
          {errors.firstName && (
            <div className="mt-1 text-red-600">
              <small>{errors.firstName.message}</small>
            </div>
          )}
        </div>

        <div className="mb-5">
          <input
            type="text"
            placeholder="Last Name"
            autoComplete="false"
            className={`w-full px-4 py-3 border-2 placeholder:text-gray-800 dark:text-white rounded-md outline-none dark:placeholder:text-gray-200 dark:bg-gray-900 focus:ring-4 ${
              errors.lastName
                ? "border-red-600 focus:border-red-600 ring-red-100 dark:ring-0"
                : "border-gray-300 focus:border-gray-600 ring-gray-100 dark:border-gray-600 dark:focus:border-white dark:ring-0"
            }`}
            {...register("lastName", {
              required: "Last name is required",
              maxLength: 80,
            })}
          />
          {errors.lastName && (
            <div className="mt-1 text-red-600">
              <small>{errors.lastName.message}</small>
            </div>
          )}
        </div>

        <div className="mb-5">
          <label htmlFor="email_address" className="sr-only">
            Email Address
          </label>
          <input
            id="email_address"
            type="email"
            placeholder="Email Address"
            autoComplete="false"
            className={`w-full px-4 py-3 border-2 placeholder:text-gray-800 dark:text-white rounded-md outline-none dark:placeholder:text-gray-200 dark:bg-gray-900 focus:ring-4 ${
              errors.email
                ? "border-red-600 focus:border-red-600 ring-red-100 dark"
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
            autoComplete="false"
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

        <div className="mb-3">
          <textarea
            name="feedback"
            placeholder="Your Feedback"
            className={`w-full px-4 py-3 border-2 placeholder:text-gray-800 dark:text-white dark:placeholder:text-gray-200 dark:bg-gray-900 rounded-md outline-none h-36 focus:ring-4 ${
              errors.feedback
                ? "border-red-600 focus:border-red-600 ring-red-100 dark:ring-0"
                : "border-gray-300 focus:border-gray-600 ring-gray-100 dark:border-gray-600 dark:focus:border-white dark:ring-0"
            }`}
            {...register("feedback", {
              required: "Please provide your feedback",
            })}
          />
          {errors.feedback && (
            <div className="mt-1 text-red-600">
              <small>{errors.feedback.message}</small>
            </div>
          )}
        </div>

        <button
          type="submit"
          className="w-full py-4 font-semibold text-white transition-colors bg-gray-900 rounded-md hover:bg-gray-800 focus:outline-none focus:ring-offset-2 focus:ring focus:ring-gray-200 px-7 dark:bg-white dark:text-black"
        >
          {isSubmitting ? (
            <svg
              className="w-5 h-5 mx-auto text-white dark:text-black animate-spin"
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
            "Send Feedback"
          )}
        </button>
      </form>

      {/* Modal for success message */}
      <Modal
        open={modalOpen}
        onClose={handleCloseModal}
        message={message || "Success. Feedback sent successfully!"}
      />
    </div>
  );
}
