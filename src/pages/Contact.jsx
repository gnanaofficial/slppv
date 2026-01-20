import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import useWeb3Forms from "@web3forms/react";
import Modal from "../components/Forms/Modal"; // Using your enhanced Modal component
import { assets } from "@/assets/assets";

import SEO from "../components/common/SEO";

export default function Contact() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    mode: "onTouched",
  });

  const number = "+91 9655214532";
  const mail = "slppvtempletpt@gmail.com";
  const [isSuccess, setIsSuccess] = useState(false);
  const [message, setMessage] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  // Use this API key from an environment variable in production
  const apiKey = "bae9aaf7-fef2-42e1-a95a-55a840e1c378";

  // Web3Forms configuration
  const { submit: onSubmit } = useWeb3Forms({
    access_key: apiKey,
    settings: {
      from_name: "Padvamathi Trust",
      subject: "New Contact Message from your Website",
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
      // Add visible error handling
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

  return (
    <div className="">
      <SEO
        title="Contact Us"
        description="Get in touch with us for queries, donations, or seva bookings."
        keywords="Contact, Phone, Email, Location"
      />
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="my-10 w-2/3 xl:w-1/3 m-auto font-play"
      >
        <p className="text-center text-red-600 font-bold text-2xl md:text-3xl mb-2 font-play">
          Contact Us
        </p>
        <div className="flex gap-8 md:gap-10 items-center justify-center mb-6 font-play">
          <div className="flex items-center justify-center gap-2">
            <div className="h-6 w-1 bg-mainColor"> </div>
            <img className="w-5 h-5" src={assets.phoneicon} alt="Phone Icon" />
            <div className="font-bold text-xl leading-tight">{number} </div>
          </div>

          <div>
            <span className="flex gap-2 items-center justify-center">
              <img
                className="w-[20px]"
                src={assets.mailicon}
                alt="Email Icon"
              />{" "}
              <span className="font-bold text-center">{mail}</span>{" "}
            </span>
          </div>
        </div>

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
            type="text"
            placeholder="Full Name"
            autoComplete="name"
            className={`w-full px-4 py-3 border-2 placeholder:text-gray-800 dark:text-white rounded-md outline-none dark:placeholder:text-gray-200 dark:bg-gray-900 focus:ring-4 ${
              errors.name
                ? "border-red-600 focus:border-red-600 ring-red-100 dark:ring-0"
                : "border-gray-300 focus:border-gray-600 ring-gray-100 dark:border-gray-600 dark:focus:border-white dark:ring-0"
            }`}
            {...register("name", {
              required: "Full name is required",
              maxLength: 80,
            })}
          />
          {errors.name && (
            <div className="mt-1 text-red-600">
              <small>{errors.name.message}</small>
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
            name="email"
            autoComplete="email"
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

        <div className="mb-3">
          <textarea
            name="message"
            placeholder="Your Message"
            className={`w-full px-4 py-3 border-2 placeholder:text-gray-800 dark:text-white dark:placeholder:text-gray-200 dark:bg-gray-900 rounded-md outline-none h-36 focus:ring-4 ${
              errors.message
                ? "border-red-600 focus:border-red-600 ring-red-100 dark:ring-0"
                : "border-gray-300 focus:border-gray-600 ring-gray-100 dark:border-gray-600 dark:focus:border-white dark:ring-0"
            }`}
            {...register("message", {
              required: "Enter your Message",
            })}
          />
          {errors.message && (
            <div className="mt-1 text-red-600">
              <small>{errors.message.message}</small>
            </div>
          )}
        </div>

        <button
          type="submit"
          className="w-full py-4 font-semibold text-white transition-colors bg-gray-900 rounded-md hover:bg-gray-800 focus:outline-none focus:ring-offset-2 focus:ring focus:ring-gray-200 px-7 dark:bg-white dark:text-black"
          disabled={isSubmitting}
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
            "Send Message"
          )}
        </button>
      </form>

      {/* Modal component with success message */}
      <Modal
        open={modalOpen}
        onClose={handleCloseModal}
        message={message || "Success. Message sent successfully!"}
      />
    </div>
  );
}
