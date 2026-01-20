import React from "react";
import img1 from "@/assets/Trustees/01.jpg";
import img2 from "@/assets/Trustees/02.jpg";

const archakaBrundham = [
  {
    id: 1,
    name: "Sridhar Swamy",
    image: img1,
  },
  {
    id: 2,
    name: "Sriram Swamy",
    image: img2,
  },
];

const ArchakaBrundham = () => {
  return (
    <div className="m-auto bg-white rounded-2xl overflow-hidden">
      <div>
        <p className="text-red-700 text-3xl font-bold p-6">Archaka Brundham</p>
        <div className="bg-gray-300 w-full h-1"></div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-8 p-6 sm:p-10">
        {archakaBrundham.map((archaka, index) => (
          <div key={index} className="flex flex-col w-full sm:w-[90%]">
            <img
              src={archaka.image}
              alt=""
              className="rounded-2xl aspect-[3/4] object-cover"
            />
            {/* <div className="bg-yellow-400 h-1 w-full mb-4"></div>*/}
            <p className="text-gray-800 text-lg sm:text-xl xl:text-2xl font-medium mt-2">
              {archaka.name}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ArchakaBrundham;
