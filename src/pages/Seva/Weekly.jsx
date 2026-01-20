import React from "react";
import Weekly1 from "@/assets/Sevas/weekly.png";
import { Container } from "@mui/material";

const Weekly = () => {
  return (
    <Container
      maxWidth="xl"
      className="bg-[#FAAC2F] h-auto flex flex-col items-center"
    >
      <div className="bg-white w-[95%] 2xl:h-26 3xl:h-26 xl:h-24 lg:h-20 md:h-20 sm:h-16 xs:h-12 2xs:h-12 rounded-lg flex items-center border-b-[7px] border-gray-300 xl:mb-12 lg:mb-12 md:mb-8 sm:mb-6 xs:mb-3 2xs:mb-2 2xs:ml-1 2xs:mr-1 xs:ml-1 xs:mr-1 sm:ml-4 sm:mr-4 md:ml-6 md:mr-6 lg:ml-6 lg:mr-6 xl:ml-6 xl:mr-6 2xl:ml-6 2xl:mr-6">
        <h1 className="text-[#8B0000] font-bold pl-4  2xl:text-3xl 3xl:text-3xl xl:text-3xl lg:text-3xl md:text-2xl sm:text-xl xs:text-sm 2xs:text-sm">
          Sevas
        </h1>
      </div>
      <div
        className="bg-white w-1/6 rounded-lg flex items-center justify-center 
               h-6 2xs:h-6 xs:h-8 sm:h-10 md:h-12 lg:h-14 xl:h-14
               mb-2 2xs:mb-2 xs:mb-2 sm:mb-3 md:mb-4 lg:mb-6 xl:mb-6"
      >
        <h1
          className="text-[#8B0000] font-bold 
                text-xs 2xs:text-xs xs:text-sm sm:text-xl md:text-2xl lg:text-3xl xl:text-3xl"
        >
          Weekly
        </h1>
      </div>
      <div className=" h-auto lg:w-2/3 md:tw-3/4 sm:w-5/6 xs:w-5/6 2xs:w-5/6 overflow-hidden mb-[4%]">
        <img src={Weekly1} className="h-full w-full"></img>
      </div>
    </Container>
  );
};

export default Weekly;
