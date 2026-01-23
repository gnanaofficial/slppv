import React, { useState, useEffect } from "react";
import { Container } from "@mui/material";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useTranslation } from "react-i18next";

const Weekly = () => {
  const { t, i18n } = useTranslation();
  const [sevas, setSevas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchWeeklySevas();
  }, []);

  const fetchWeeklySevas = async () => {
    try {
      const q = query(
        collection(db, "sevas"),
        where("type", "==", "weekly"),
        where("active", "==", true),
      );
      const querySnapshot = await getDocs(q);
      const sevasData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Sort by dayOfWeek and order
      sevasData.sort((a, b) => {
        if (a.dayOfWeek !== b.dayOfWeek) {
          return a.dayOfWeek - b.dayOfWeek;
        }
        return (a.order || 0) - (b.order || 0);
      });

      setSevas(sevasData);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching weekly sevas:", err);
      setError(err.message);
      setLoading(false);
    }
  };

  const getDayName = (dayNum) => {
    const days = [
      t("days.sunday", "Sunday"),
      t("days.monday", "Monday"),
      t("days.tuesday", "Tuesday"),
      t("days.wednesday", "Wednesday"),
      t("days.thursday", "Thursday"),
      t("days.friday", "Friday"),
      t("days.saturday", "Saturday"),
    ];
    return days[dayNum] || "";
  };

  // Group sevas by day
  const sevasByDay = sevas.reduce((acc, seva) => {
    const day = seva.dayOfWeek;
    if (!acc[day]) {
      acc[day] = [];
    }
    acc[day].push(seva);
    return acc;
  }, {});

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
          {t("sevas.weekly", "Weekly")}
        </h1>
      </div>

      {/* Content */}
      <div className="w-[95%] lg:w-5/6 mb-8">
        {loading ? (
          <div className="bg-white rounded-lg p-8 text-center">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-1/4 mx-auto"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
            <p className="text-gray-600 mt-4">
              {t("common.loading", "Loading...")}
            </p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-lg p-8 text-center">
            <p className="text-red-600 mb-4">
              {t("common.error", "Error loading sevas")}: {error}
            </p>
            <button
              onClick={fetchWeeklySevas}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {t("common.retry", "Retry")}
            </button>
          </div>
        ) : sevas.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center">
            <p className="text-gray-600 text-lg">
              {t(
                "sevas.noWeeklySevas",
                "No weekly sevas available at the moment.",
              )}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-[#8B0000] text-white">
                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold">
                      {t("sevas.day", "Day")}
                    </th>
                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold">
                      {t("sevas.sevaName", "Seva Name")}
                    </th>
                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold">
                      {t("sevas.timings", "Timings")}
                    </th>
                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold">
                      {t("sevas.price", "Price")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[0, 1, 2, 3, 4, 5, 6].map((dayNum) => {
                    const daySevas = sevasByDay[dayNum] || [];
                    if (daySevas.length === 0) return null;

                    return daySevas.map((seva, index) => (
                      <tr
                        key={seva.id}
                        className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}
                      >
                        {index === 0 && (
                          <td
                            className="border border-gray-300 px-4 py-3 font-semibold text-[#8B0000]"
                            rowSpan={daySevas.length}
                          >
                            {getDayName(dayNum)}
                          </td>
                        )}
                        <td className="border border-gray-300 px-4 py-3">
                          <div className="font-medium">
                            {seva.name?.[currentLang] ||
                              seva.name?.en ||
                              "Unnamed Seva"}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            {seva.description?.[currentLang] ||
                              seva.description?.en ||
                              ""}
                          </div>
                        </td>
                        <td className="border border-gray-300 px-4 py-3">
                          {seva.timings && seva.timings.length > 0
                            ? seva.timings.join(", ")
                            : "-"}
                        </td>
                        <td className="border border-gray-300 px-4 py-3 font-semibold">
                          {seva.price > 0
                            ? `₹${seva.price}`
                            : t("sevas.free", "Free")}
                        </td>
                      </tr>
                    ));
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden p-4 space-y-4">
              {[0, 1, 2, 3, 4, 5, 6].map((dayNum) => {
                const daySevas = sevasByDay[dayNum] || [];
                if (daySevas.length === 0) return null;

                return (
                  <div
                    key={dayNum}
                    className="border-b border-gray-200 pb-4 last:border-b-0"
                  >
                    <h3 className="text-lg font-bold text-[#8B0000] mb-3">
                      {getDayName(dayNum)}
                    </h3>
                    {daySevas.map((seva) => (
                      <div
                        key={seva.id}
                        className="bg-gray-50 rounded-lg p-4 mb-3 last:mb-0"
                      >
                        <h4 className="font-semibold text-gray-800 mb-1">
                          {seva.name?.[currentLang] ||
                            seva.name?.en ||
                            "Unnamed Seva"}
                        </h4>
                        <p className="text-sm text-gray-600 mb-2">
                          {seva.description?.[currentLang] ||
                            seva.description?.en ||
                            ""}
                        </p>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-700">
                            <span className="font-medium">
                              {t("sevas.timings", "Timings")}:
                            </span>{" "}
                            {seva.timings && seva.timings.length > 0
                              ? seva.timings.join(", ")
                              : "-"}
                          </span>
                          <span className="font-semibold text-[#8B0000]">
                            {seva.price > 0
                              ? `₹${seva.price}`
                              : t("sevas.free", "Free")}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </Container>
  );
};

export default Weekly;
