import React, { useState, useEffect } from "react";
import vectorImg from "@/assets/Vector.png";
import { assets } from "@/assets/assets";

import Img1 from "@/assets/Cover/img1.png";
import Img2 from "@/assets/Cover/img2.png";
import Img3 from "@/assets/Cover/img3.png";
import Img4 from "@/assets/Cover/img4.png";

const Cover = () => {
  const carouselImages = [Img1, Img2, Img3, Img4];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const transitionDuration = 1000;
    const displayDuration = 3000;

    const intervalId = setInterval(() => {
      setIsTransitioning(true);

      setTimeout(() => {
        setCurrentImageIndex(
          (prevIndex) => (prevIndex + 1) % carouselImages.length,
        );
        setIsTransitioning(false);
      }, transitionDuration);
    }, transitionDuration + displayDuration);

    return () => clearInterval(intervalId);
  }, [carouselImages.length]);

  return (
    <>
      <div className="w-full h-full flex flex-col justify-center items-center md:py-10 2xl:py-6">
        <div className="hidden md:absolute top-1/3 left-0 w-full h-full overflow-hidden bg-cover bg-center bg-no-repeat z-[-2]">
          <img src={vectorImg} alt="" />
        </div>
        <div
          id="home"
          className="w-full flex  md:flex-row items-center justify-evenly align-center my-auto gap-y-6 md:gap-2"
        >
          <img
            className="w-2/5 md:w-1/4 relative aspect-[3/4] overflow-hidden rounded-3xl"
            src={assets.poster}
            alt=""
          />
          <div className="w-2/5 md:w-1/4 relative aspect-[3/4] overflow-hidden rounded-3xl">
            <img
              className={`w-full h-full object-cover transition-opacity duration-1000 ${
                isTransitioning ? "opacity-0" : "opacity-100"
              }`}
              src={carouselImages[currentImageIndex]}
              alt={`Carousel image ${currentImageIndex + 1}`}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default Cover;
