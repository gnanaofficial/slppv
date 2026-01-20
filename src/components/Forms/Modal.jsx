import React, { useEffect, useRef } from "react";
import { assets } from "@/assets/assets";

const Modal = ({ open, onClose, message }) => {
  // Create a ref for the modal content
  const modalRef = useRef(null);

  useEffect(() => {
    // Handle Escape key press
    const handleEscKey = (e) => {
      if (e.key === "Escape") onClose();
    };

    // Handle clicks outside the modal
    const handleOutsideClick = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };

    // Add event listeners when modal is open
    if (open) {
      window.addEventListener("keydown", handleEscKey);
      document.addEventListener("mousedown", handleOutsideClick);

      // Prevent body scrolling
      document.body.style.overflow = "hidden";
    }

    // Cleanup function
    return () => {
      window.removeEventListener("keydown", handleEscKey);
      document.removeEventListener("mousedown", handleOutsideClick);

      // Restore body scrolling when component unmounts or modal closes
      document.body.style.overflow = "auto";
    };
  }, [open, onClose]);

  // Handle closing the modal with proper scroll restoration
  const handleClose = () => {
    // Restore body scrolling
    document.body.style.overflow = "auto";

    // Call the onClose prop
    onClose();

    // Add a small delay to ensure DOM updates before attempting to scroll
    setTimeout(() => {
      window.scrollTo({
        top: window.scrollY,
        behavior: "auto",
      });
    }, 10);
  };

  // Don't render anything if modal is not open
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div
        ref={modalRef}
        className="bg-white p-5 h-[300px] w-[500px] flex flex-col items-center justify-center rounded shadow-lg"
      >
        <h2 className="text-lg text-green-600 font-semibold">Success</h2>
        <p className="mt-2">{message}</p>
        <img
          className="w-1/3 m-2 rounded-xl"
          src={assets.bomma}
          alt="Success"
        />
        <button
          onClick={handleClose}
          className="mt-6 px-6 py-2 bg-secondaryColor text-white rounded-md transition-all hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondaryColor z-10 relative"
          aria-label="Close modal"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default Modal;
