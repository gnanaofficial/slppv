import React, { useState, useEffect } from "react";
import { Container } from "@mui/material";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useTranslation } from "react-i18next";

const Monthly = () => {
  const { t, i18n } = useTranslation();
  const [sevas, setSevas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMonthlySevas();
  }, []);

  const fetchMonthlySevas = async () => {
    try {
      const q = query(
        collection(db, "sevas"),
        where("type", "==", "monthly"),
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
      console.error("Error fetching monthly sevas:", err);
      setError(err.message);
      setLoading(false);
    }
  };

  const currentLang = i18n.language;

  return (
    <Container
      maxWidth="xl"
      className="bg-[#FAAC2F] min-h-screen py-8 flex flex-col items-center"
    >
      {/* Header */}
      <div className="bg-white w-[95%] 2xl:h-26 3xl:h-26 xl:h-24 lg:h-20 md:h-20 sm:h-16 xs:h-12 2xs:h-12 rounded-lg flex items-center border-b-[7px] border-gray-300 xl:mb-12 lg:mb-12 md:mb-8 sm:mb-6 xs:mb-3 2xs:mb-2 2xs:ml-1 2xs:mr-1 xs:ml-1 xs:mr-1 sm:ml-4 sm:mr-4 md:ml-6 md:mr-6 lg:ml-6 lg:mr-6 xl:ml-6 xl:mr-6 2xl:ml-6 2xl:mr-6">
        <h1 className="text-[#8B0000] font-bold pl-4 2xl:text-3xl 3xl:text-3xl xl:text-3xl lg:text-3xl md:text-2xl sm:text-xl xs:text-sm 2xs:text-sm">
          {t("sevas.title", "Sevas")}
        </h1>
      </div>

      {/* Page Title */}
      <div className="bg-white w-1/6 rounded-lg flex items-center justify-center h-6 2xs:h-6 xs:h-8 sm:h-10 md:h-12 lg:h-14 xl:h-14 mb-2 2xs:mb-2 xs:mb-2 sm:mb-3 md:mb-4 lg:mb-6 xl:mb-6">
        <h1 className="text-[#8B0000] font-bold text-xs 2xs:text-xs xs:text-sm sm:text-xl md:text-2xl lg:text-3xl xl:text-3xl">
          {t("sevas.monthly", "Monthly")}
        </h1>
      </div>

      {/* Content */}
      <div className="w-[95%] 2xl:w-3/4 3xl:w-3/4 xl:w-3/4 lg:w-3/4 md:w-3/4 sm:w-5/6 xs:w-5/6 2xs:w-5/6 mb-8">
        {loading ? (
          <div className="bg-white rounded-lg p-8">
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
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
              onClick={fetchMonthlySevas}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {t("common.retry", "Retry")}
            </button>
          </div>
        ) : sevas.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center">
            <p className="text-gray-600 text-lg">
              {t(
                "sevas.noMonthlySevas",
                "No monthly sevas available at the moment.",
              )}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
              {sevas.map((seva) => (
                <div
                  key={seva.id}
                  className="border border-gray-200 rounded-lg p-5 hover:shadow-xl transition-shadow bg-gradient-to-br from-white to-gray-50"
                >
                  {/* Date Badge */}
                  {seva.date && (
                    <div className="bg-[#8B0000] text-white px-3 py-1 rounded-full text-sm font-bold inline-block mb-3">
                      {seva.date}
                    </div>
                  )}

                  {/* Seva Name */}
                  <h3 className="text-lg font-bold text-[#8B0000] mb-2">
                    {seva.name?.[currentLang] ||
                      seva.name?.en ||
                      "Unnamed Seva"}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-gray-700 mb-3">
                    {seva.description?.[currentLang] ||
                      seva.description?.en ||
                      ""}
                  </p>

                  {/* Timings */}
                  {seva.timings && seva.timings.length > 0 && (
                    <div className="mb-3">
                      <span className="text-xs font-semibold text-gray-600">
                        {t("sevas.timings", "Timings")}:{" "}
                      </span>
                      <span className="text-xs text-gray-800">
                        {seva.timings.join(", ")}
                      </span>
                    </div>
                  )}

                  {/* Price */}
                  <div className="mt-4 pt-3 border-t border-gray-200">
                    {seva.price > 0 ? (
                      <div className="text-right">
                        <span className="text-2xl font-bold text-[#8B0000]">
                          ₹{seva.price}
                        </span>
                      </div>
                    ) : (
                      <div className="text-right">
                        <span className="text-lg font-bold text-green-600">
                          {t("sevas.free", "Free")}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Container>
  );
};

export default Monthly;
