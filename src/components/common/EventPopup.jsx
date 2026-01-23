import React, { useState, useEffect } from "react";
import { getSiteContent } from "../../lib/firestoreService";
import { FiX } from "react-icons/fi";
import { AnimatePresence, motion } from "framer-motion";

const EventPopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [popupData, setPopupData] = useState(null);

  useEffect(() => {
    const checkPopup = async () => {
      try {
        const doc = await getSiteContent("popup");
        if (doc && doc.active && doc.imageUrl) {
          // Check if already seen in this session?
          // For now, let's show it every time or maybe check sessionStorage
          const hasSeen = sessionStorage.getItem(`seen_popup_${doc.imageUrl}`);
          if (!hasSeen) {
            setPopupData(doc);
            setIsOpen(true);
          }
        }
      } catch (error) {
        console.error("Error checking popup:", error);
      }
    };

    // Small delay to let page load first
    const timer = setTimeout(checkPopup, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    if (popupData) {
      sessionStorage.setItem(`seen_popup_${popupData.imageUrl}`, "true");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && popupData && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
          >
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-2 right-2 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full z-10 transition-colors"
            >
              <FiX size={20} />
            </button>

            {/* Image */}
            <div className="relative">
              <img
                src={popupData.imageUrl}
                alt={popupData.title || "Event Popup"}
                className="w-full h-auto object-contain max-h-[80vh]"
              />
            </div>

            {/* Optional Title/Content */}
            {popupData.title && (
              <div className="p-4 bg-white text-center">
                <h3 className="text-xl font-bold text-mainColor font-play">
                  {popupData.title}
                </h3>
                {popupData.link && (
                  <a
                    href={popupData.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-2 px-6 py-2 bg-mainColor text-white rounded-full font-semibold text-sm hover:bg-red-700 transition"
                  >
                    Learn More
                  </a>
                )}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default EventPopup;
