import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Import translation files
import enTranslations from "../locales/en.json";
import teTranslations from "../locales/te.json";

const resources = {
  en: {
    translation: enTranslations,
  },
  te: {
    translation: teTranslations,
  },
};

i18n
  .use(LanguageDetector) // Detect user language
  .use(initReactI18next) // Pass i18n instance to react-i18next
  .init({
    resources,
    fallbackLng: "en", // Default language
    lng: localStorage.getItem("language") || "en", // Get saved language or default to English

    interpolation: {
      escapeValue: false, // React already escapes values
    },

    detection: {
      // Order of language detection
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
    },
  });

// Save language preference when it changes
i18n.on("languageChanged", (lng) => {
  localStorage.setItem("language", lng);
});

export default i18n;
