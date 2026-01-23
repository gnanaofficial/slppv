import React, { useState, useEffect } from "react";
import { Container } from "@mui/material";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useTranslation } from "react-i18next";
import Schedule from "@/assets/Sevas/aus.png";

const Auspicious = () => {
  const { t, i18n } = useTranslation();
  const [sevas, setSevas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAuspiciousSevas();
  }, []);

  const fetchAuspiciousSevas = async () => {
    try {
      const q = query(
        collection(db, "sevas"),
        where("type", "==", "auspicious"),
        where("active", "==", true),
      );
      const querySnapshot = await getDocs(q);
      const sevasData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Sort by date and order
      sevasData.sort((a, b) => {
        if (a.date && b.date) {
          return a.date.localeCompare(b.date);
        }
        return (a.order || 0) - (b.order || 0);
      });

      setSevas(sevasData);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching auspicious sevas:", err);
      setError(err.message);
      setLoading(false);
    }
  };

  const currentLang = i18n.language;

  return (
    <Container maxWidth="xl" className="bg-[#FAAC2F] min-h-screen py-8">
      {/* Header */}
      <div className="bg-white w-auto 2xl:h-26 3xl:h-26 xl:h-24 lg:h-20 md:h-20 sm:h-16 xs:h-12 2xs:h-12 rounded-lg flex items-center border-b-[7px] border-gray-300 xl:mb-12 lg:mb-12 md:mb-8 sm:mb-6 xs:mb-3 2xs:mb-2 2xs:ml-1 2xs:mr-1 xs:ml-1 xs:mr-1 sm:ml-4 sm:mr-4 md:ml-6 md:mr-6 lg:ml-6 lg:mr-6 xl:ml-6 xl:mr-6 2xl:ml-6 2xl:mr-6">
        <h1 className="text-[#8B0000] font-bold pl-4 2xl:text-3xl 3xl:text-3xl xl:text-3xl lg:text-3xl md:text-2xl sm:text-xl xs:text-sm 2xs:text-sm">
          {t("sevas.title", "Sevas")}
        </h1>
      </div>

      <div className="xl:mb-12 lg:mb-12 md:mb-8 sm:mb-6 xs:mb-3 2xs:mb-2">
        <div className="h-auto w-full overflow-hidden flex flex-col items-center justify-center mx-auto">
          {/* Page Title */}
          <div className="bg-white w-1/2 rounded-lg flex items-center justify-center h-6 2xs:h-6 xs:h-8 sm:h-10 md:h-12 lg:h-14 xl:h-14 mb-2 2xs:mb-2 xs:mb-2 sm:mb-3 md:mb-4 lg:mb-6 xl:mb-6">
            <h1 className="text-[#8B0000] font-bold text-xs 2xs:text-xs xs:text-sm sm:text-xl md:text-2xl lg:text-3xl xl:text-3xl text-center">
              {t("sevas.auspicious", "Auspicious")}
            </h1>
          </div>

          {/* Content */}
          <div className="h-auto w-full px-4">
            {loading ? (
              <div className="bg-white rounded-lg p-8">
                <div className="animate-pulse space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-32 bg-gray-200 rounded"></div>
                  ))}
                </div>
                <p className="text-center text-gray-600 mt-4">
                  {t("common.loading", "Loading...")}
                </p>
              </div>
            ) : error ? (
              <div className="bg-white rounded-lg p-8 text-center">
                <p className="text-red-600 mb-4">
                  {t("common.error", "Error loading sevas")}: {error}
                </p>
                <button
                  onClick={fetchAuspiciousSevas}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  {t("common.retry", "Retry")}
                </button>
              </div>
            ) : sevas.length === 0 ? (
              <div className="bg-white rounded-lg p-12 text-center">
                <p className="text-gray-600 text-lg">
                  {t(
                    "sevas.noAuspiciousSevas",
                    "No auspicious sevas available at the moment.",
                  )}
                </p>
                <div className="mt-6">
                  <img
                    src={Schedule}
                    className="max-w-full h-auto mx-auto rounded-lg shadow-lg"
                    alt="Auspicious Sevas"
                  />
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="space-y-6 p-6">
                  {sevas.map((seva, index) => (
                    <div
                      key={seva.id}
                      className={`border-l-4 border-[#8B0000] bg-gradient-to-r from-yellow-50 to-white rounded-lg p-6 shadow-md hover:shadow-xl transition-shadow ${
                        index !== sevas.length - 1
                          ? "border-b border-gray-200 pb-6"
                          : ""
                      }`}
                    >
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div className="flex-1">
                          {/* Date Badge */}
                          {seva.date && (
                            <div className="bg-[#8B0000] text-white px-4 py-2 rounded-lg text-sm font-bold inline-block mb-3">
                              📅 {seva.date}
                            </div>
                          )}

                          {/* Seva Name */}
                          <h3 className="text-2xl font-bold text-[#8B0000] mb-2">
                            {seva.name?.[currentLang] ||
                              seva.name?.en ||
                              "Unnamed Seva"}
                          </h3>

                          {/* Description */}
                          <p className="text-base text-gray-700 mb-3 leading-relaxed">
                            {seva.description?.[currentLang] ||
                              seva.description?.en ||
                              ""}
                          </p>

                          {/* Timings */}
                          {seva.timings && seva.timings.length > 0 && (
                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                              <span className="font-semibold">
                                🕐 {t("sevas.timings", "Timings")}:
                              </span>
                              <span className="text-gray-800">
                                {seva.timings.join(", ")}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Price */}
                        <div className="md:text-right">
                          {seva.price > 0 ? (
                            <div className="bg-[#8B0000] text-white px-6 py-3 rounded-lg inline-block">
                              <div className="text-sm font-medium">
                                {t("sevas.price", "Price")}
                              </div>
                              <div className="text-3xl font-bold">
                                ₹{seva.price}
                              </div>
                            </div>
                          ) : (
                            <div className="bg-green-600 text-white px-6 py-3 rounded-lg inline-block">
                              <div className="text-2xl font-bold">
                                {t("sevas.free", "Free")}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Container>
  );
};

export default Auspicious;
