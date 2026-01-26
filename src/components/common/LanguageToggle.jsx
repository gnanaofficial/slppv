import React from "react";
import { useTranslation } from "react-i18next";

const LanguageToggle = ({ className = "" }) => {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === "en" ? "te" : "en";
    i18n.changeLanguage(newLang);
  };

  const currentLang = i18n.language || "en";

  return (
    <button
      onClick={toggleLanguage}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg bg-mainColor text-white hover:bg-red-700 transition-all duration-300 shadow-md ${className}`}
      title={currentLang === "en" ? "Switch to Telugu" : "Switch to English"}
    >
      <span className="text-sm font-semibold">
        {currentLang === "en" ? "తెలుగు" : "English"}
      </span>
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
        />
      </svg>
    </button>
  );
};

export default LanguageToggle;
