import React, { useState } from "react";
import white from "@/assets/white.svg";
import img1 from "@/assets/Gallery/img12.jpg";
import img2 from "@/assets/Gallery/img9.jpg";
import img3 from "@/assets/Gallery/img1.jpg";
import img4 from "@/assets/Gallery/img1.svg";
import ImageModal from "./ImageModal";
import { Container } from "@mui/material";

const Gallary = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const openModal = (imageUrl) => {
    setSelectedImage(imageUrl);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedImage(null);
  };

  return (
    <section id="gallery" className="mt-12 sm:mt-16 md:mt-20 lg:mt-24">
      <Container maxWidth="xl">
        <div className="flex flex-col justify-center items-center gap-2 mb-6 md:mb-10">
          <h1 className="text-white font-montserrat font-semibold text-base sm:text-lg lg:text-xl tracking-wide">
            GALLERY
          </h1>
          <h1 className="text-xl sm:text-3xl md:text-4xl text-mainColor font-semibold capitalize text-center">
            Curated Showcase
          </h1>
          <img className="w-20 md:w-24 animate-pulse" src={white} alt="" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 w-full max-w-7xl mx-auto px-4">
          {/* First large image - smaller and centered on small screens */}
          <div className="col-span-12 md:col-span-4 lg:col-span-4 flex justify-center items-center w-full gap-4 md:gap-0">
            <div className="w-1/2 md:w-full aspect-[4/5] overflow-hidden rounded-lg">
              <img
                className="w-full h-full object-cover cursor-pointer transition duration-300 hover:opacity-90"
                src={img1}
                alt=""
                onClick={() => openModal(img1)}
              />
            </div>
            <div className="w-1/2 md:w-full aspect-[4/5] overflow-hidden rounded-lg block md:hidden">
              <img
                className="w-full h-full object-cover cursor-pointer transition duration-300 hover:opacity-90"
                src={img4}
                alt=""
                onClick={() => openModal(img1)}
              />
            </div>
          </div>

          {/* Middle column with two images - takes 4 cols on md, 2 on lg */}
          <div className="col-span-12 md:col-span-4 flex flex-row md:flex-col justify-between gap-4">
            <div className="w-full aspect-[5/3] overflow-hidden rounded-lg">
              <img
                className="w-full h-full object-cover cursor-pointer transition duration-300 hover:opacity-90"
                src={img2}
                alt=""
                onClick={() => openModal(img2)}
              />
            </div>
            <div className="w-full aspect-[5/3] overflow-hidden rounded-lg">
              <img
                className="w-full h-full object-cover cursor-pointer transition duration-300 hover:opacity-90"
                src={img3}
                alt=""
                onClick={() => openModal(img3)}
              />
            </div>
          </div>

          {/* Last large image - smaller and centered on small screens */}
          <div className="md:col-span-4 lg:col-span-4 flex justify-center hidden md:block">
            <div className="w-4/5 md:w-full aspect-[4/5] overflow-hidden rounded-lg">
              <img
                className="w-full h-full object-cover cursor-pointer transition duration-300 hover:opacity-90"
                src={img4}
                alt=""
                onClick={() => openModal(img4)}
              />
            </div>
          </div>
        </div>

        <ImageModal
          isOpen={isModalOpen}
          onClose={closeModal}
          imageUrl={selectedImage}
        />
      </Container>
    </section>
  );
};

export default Gallary;
