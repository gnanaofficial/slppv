import React, { useState, useEffect } from "react";
import { Container } from "@mui/material";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useTranslation } from "react-i18next";
import God from "@/assets/image_in_Seva.png";
import DailySevas from "../../components/sections/Sevas/DailySevas";

const Daily = () => {
  const { t, i18n } = useTranslation();
  const [sevas, setSevas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDailySevas();
  }, []);

  const fetchDailySevas = async () => {
    try {
      const q = query(
        collection(db, "sevas"),
        where("type", "==", "daily"),
        where("active", "==", true),
      );
      const querySnapshot = await getDocs(q);
      const sevasData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Sort by order
      sevasData.sort((a, b) => (a.order || 0) - (b.order || 0));

      setSevas(sevasData);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching daily sevas:", err);
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
          {t("sevas.dailyTitle", "Nithya Kainkarya's")}
        </h1>
      </div>

      <div className="flex flex-col md:flex-row justify-around items-start gap-6 xl:mb-12 lg:mb-12 md:mb-8 sm:mb-6 xs:mb-3 2xs:mb-2 px-4">
        {/* God Image */}
        <div className="h-auto w-full md:w-[30%] overflow-hidden rounded-lg shadow-lg">
          <img src={God} className="h-full w-full object-cover" alt="Deity" />
        </div>

        {/* Sevas Schedule */}
        <div className="h-auto w-full md:w-[65%]">
          {/* Title */}
          <div className="bg-white w-full md:w-1/2 mx-auto rounded-lg flex items-center justify-center h-6 2xs:h-6 xs:h-8 sm:h-10 md:h-12 lg:h-14 xl:h-14 mb-2 2xs:mb-2 xs:mb-2 sm:mb-3 md:mb-4 lg:mb-6 xl:mb-6">
            <h1 className="text-[#8B0000] font-bold text-xs 2xs:text-xs xs:text-sm sm:text-xl md:text-2xl lg:text-3xl xl:text-3xl">
              {t("sevas.timings", "Timings")}
            </h1>
          </div>

          {/* Content */}
          <DailySevas type="daily" />
        </div>
      </div>
    </Container>
  );
};

export default Daily;
