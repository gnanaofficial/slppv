import React from "react";
import God from "@/assets/image_in_Seva.png";
import Schedule from "@/assets/Sevas/daily.png";
import { Container } from "@mui/material";

const Daily = () => {
  return (
    <Container maxWidth="xl" className="bg-[#FAAC2F] w-full h-auto py-2 ">
      <div className="bg-white w-auto 2xl:h-26 3xl:h-26 xl:h-24 lg:h-20 md:h-20 sm:h-16 xs:h-12 2xs:h-12 rounded-lg flex items-center border-b-[7px] border-gray-300 xl:mb-12 lg:mb-12 md:mb-8 sm:mb-6 xs:mb-3 2xs:mb-2 2xs:ml-1 2xs:mr-1 xs:ml-1 xs:mr-1 sm:ml-4 sm:mr-4 md:ml-6 md:mr-6 lg:ml-6 lg:mr-6 xl:ml-6 xl:mr-6 2xl:ml-6 2xl:mr-6">
        <h1 className="text-[#8B0000] font-bold pl-4  2xl:text-3xl 3xl:text-3xl xl:text-3xl lg:text-3xl md:text-2xl sm:text-xl xs:text-sm 2xs:text-sm">
          Nithya Kainkarya’s
        </h1>
      </div>

      <div className="flex justify-around xl:mb-12 lg:mb-12 md:mb-8 sm:mb-6 xs:mb-3 2xs:mb-2">
        <div className=" h-auto w-[30%] overflow-hidden">
          <img src={God} className="h-full w-full"></img>
        </div>

        <div className=" h-auto w-[35%] overflow-hidden">
          <div
            className="bg-white w-1/2 rounded-lg flex items-center justify-center 
               h-6 2xs:h-6 xs:h-8 sm:h-10 md:h-12 lg:h-14 xl:h-14
               mb-2 2xs:mb-2 xs:mb-2 sm:mb-3 md:mb-4 lg:mb-6 xl:mb-6"
          >
            <h1
              className="text-[#8B0000] font-bold 
                text-xs 2xs:text-xs xs:text-sm sm:text-xl md:text-2xl lg:text-3xl xl:text-3xl"
            >
              Timings
            </h1>
          </div>

          <div className=" h-auto w-full overflow-hidden">
            <img src={Schedule} className="h-full w-full"></img>
          </div>
        </div>
      </div>
    </Container>
  );
};

export default Daily;
