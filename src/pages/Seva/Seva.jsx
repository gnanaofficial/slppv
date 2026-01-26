import React, { useState, useEffect } from "react";
import white from "@/assets/white.svg";
import { Link } from "react-router-dom";
import { db } from "../../lib/firebase";
import { collection, getDocs } from "firebase/firestore";

const defaultSevaItems = [
  {
    id: 1,
    title: "DAILY",
    bgClass: "bg-sevaImg",
    path: "/sevas/daily-sevas",
    lineHeight: "h-16",
    description:
      "Experience divine connection through daily rituals that bring peace, protection, and positive energy",
  },
  {
    id: 2,
    title: "WEEKLY",
    bgClass: "bg-sevaImg2",
    path: "/sevas/weekly-sevas",
    lineHeight: "h-20",
    description:
      "Participate in weekly sevas to align your spiritual path with the energies of the days.",
  },
  {
    id: 3,
    title: "MONTHLY",
    bgClass: "bg-sevaImg3",
    path: "/sevas/monthly-sevas",
    lineHeight: "h-14",
    description:
      "Monthly sevas provide an opportunity to connect deeply with the divine on spiritually significant days.",
  },
  {
    id: 4,
    title: "AUSPICIOUS",
    bgClass: "bg-sevaImg4",
    path: "/sevas/auspicious-sevas",
    lineHeight: "h-18",
    description:
      "Celebrate festivals and special occasions with grand sevas that amplify divine grace.",
  },
];

const Seva = () => {
  const [sevaItems, setSevaItems] = useState(defaultSevaItems);



  return (
    <div id="sevas" className=" h-full w-full mt-12 xl:mt-24">
      <div className="flex flex-col items-center gap-2 z-20">
        <h1 className="text-white font-montserrat font-semibold text-base sm:text-lg lg:text-xl tracking-wide uppercase">
          Our
        </h1>
        <h1 className="text-xl sm:text-3xl md:text-4xl text-mainColor font-semibold capitalize">
          Sevas
        </h1>
        <img className="w-1/8 animate-pulse" src={white} alt="" />
      </div>

      <div className="relative hidden md:flex flex-row justify-center items-start gap-2 lg:gap-4 xl:gap-6 mt-8 w-full md:w-[95%] lg:w-[90%] xl:w-[85%] mx-auto px-4 ">
        {sevaItems.map((item) => (
          <div key={item.id}>
            <Link to={item.path} key={item.id}>
              <div className="flex  items-center ">
                <div
                  className={`hover:translate-y-[-12px] h-[280px] lg:h-[320px] xl:h-[350px] w-[180px] lg:w-[230px] xl:w-[280px] ${item.bgClass} bg-cover bg-center relative transition-all duration-300 ease-in-out p-4 cursor-pointer rounded-lg`}
                >
                  <div className="text-white absolute bottom-4 p-2">
                    <h1 className="font-montserrat font-bold">{item.title}</h1>
                    <p className="mt-2 font-medium text-[13px] font-montserrat  text-white/80 md:line-clamp-3 lg:line-clamp-4 xl:line-clamp-none">
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>

      <div className="relative manaVam sm:hidden flex flex-col items-center justify-center gap-6 my-12 w-full px-4">
        {sevaItems.map((item) => (
          <div key={item.id} className="w-full max-w-[250px]">
            <Link to={item.path}>
              <div className="flex flex-col items-center mx-auto w-full">
                <div
                  className={`hover:translate-y-[-12px] min-h-[200px] w-full ${item.bgClass} bg-cover bg-center relative transition-all duration-[0.3s] ease-in-out p-1 cursor-pointer rounded-lg shadow-md`}
                >
                  <div className="text-white absolute bottom-2 w-full p-3 bg-black/30 rounded-b-lg">
                    <h1 className="font-montserrat font-bold text-lg">{item.title}</h1>
                    <p className="mt-1 font-medium text-xs font-montserrat text-white/90">
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>

      <div className="relative manVam sm:flex hidden md:hidden  items-center justify-center gap-2 my-12 w-full px-4">
        {sevaItems.map((item) => (
          <Link to={item.path} key={item.id}>
            <div className="flex flex-col items-center mx-auto">
              <div
                className={`hover:translate-y-[-12px] min-h-[550px] min-w-[250px] ${item.bgClass} bg-cover bg-center relative transition-all duration-[0.3s] ease-in-out p-1 cursor-pointer`}
              >
                <div className="text-white absolute bottom-2 h-[120px] overflow-scroll p-1 ">
                  <h1 className="font-montserrat font-bold">{item.title}</h1>
                  <p className="mt-2 font-medium text-[13px] font-montserrat  text-white/80">
                    {item.description}
                  </p>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Seva;
