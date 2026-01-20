import React from "react";

const ImageSection = ({ imageSrc, imageAlt }) => {
  return (
    <div className=" bg-[#FFBB1D] rounded-2xl shadow-lg overflow-hidden inline-flex items-end justify-center">
      <div className="h-full w-full overflow-hidden flex items-end justify-center">
        <img
          src={imageSrc}
          alt={imageAlt}
          className="object-cover rounded-xl w-full h-auto "
        />
      </div>
    </div>
  );
};

export default ImageSection;
