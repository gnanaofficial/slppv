import React, { useState } from "react";
import { Container } from "@mui/material";
import { Imgdataset } from "@/assets/Imgdataset";
import ImageModal from "../../components/sections/Gallary/ImageModal";

import video1 from "@/assets/Videos/video1.mp4";
import video2 from "@/assets/Videos/video2.mp4";

const videos = [
  {
    id: 1,
    title: "Video 1",
    source: video1,
  },
  {
    id: 2,
    title: "Video 2",
    source: video2,
  },
];

const PhotoGallery = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const images = Imgdataset.images;

  const openModal = (imageUrl) => {
    setSelectedImage(imageUrl);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedImage(null);
  };

  return (
    <section id="gallery" className="mt-8 md:mt-12 mb-8">
      <Container maxWidth="xl">
        <div className="m-auto bg-white pt-6 rounded-2xl">
          <div>
            <p className="text-mainColor text-3xl font-bold ml-6">
              Photo Gallery
            </p>
            <div className="bg-gray-300 w-full h-2 mt-2"></div>
          </div>

          {/* Grid layout matching the image */}
          <div className="p-4 sm:p-6 w-[95%] flex flex-col m-auto">
            {/* First row - 4 equal squares */}
            <div className="grid grid-cols-4 gap-4 md:gap-5 xl:gap-6 mb-4">
              {images.slice(0, 4).map((item, index) => (
                <div
                  key={`row1-${index}`}
                  className="aspect-square rounded-lg overflow-hidden"
                  onClick={() => openModal(item)}
                >
                  <img
                    src={item}
                    alt={`Gallery image ${index + 1}`}
                    className="w-full h-full object-cover cursor-pointer transition duration-300 hover:opacity-90"
                  />
                </div>
              ))}
            </div>

            {/* Second row - 3 wider rectangles */}
            <div className="grid grid-cols-3 gap-4 md:gap-5 xl:gap-6 mb-4">
              {images.slice(4, 7).map((item, index) => (
                <div
                  key={`row2-${index}`}
                  className="aspect-[4/3] rounded-lg overflow-hidden"
                  onClick={() => openModal(item)}
                >
                  <img
                    src={item}
                    alt={`Gallery image ${index + 5}`}
                    className="w-full h-full object-cover cursor-pointer transition duration-300 hover:opacity-90"
                  />
                </div>
              ))}
            </div>

            {/* Third row - 4 equal taller rectangles */}
            <div className="grid grid-cols-4 gap-4 md:gap-5 xl:gap-6">
              {images.slice(7, 11).map((item, index) => (
                <div
                  key={`row3-${index}`}
                  className="aspect-square rounded-lg overflow-hidden"
                  onClick={() => openModal(item)}
                >
                  <img
                    src={item}
                    alt={`Gallery image ${index + 8}`}
                    className="w-full h-full object-cover cursor-pointer transition duration-300 hover:opacity-90"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <ImageModal
          isOpen={isModalOpen}
          onClose={closeModal}
          imageUrl={selectedImage}
        />
      </Container>
      <Container maxWidth="xl" className="my-10">
        <div className="m-auto bg-white pt-6 rounded-2xl">
          <div>
            <p className="text-mainColor text-3xl font-bold ml-6">
              Video Gallery
            </p>
            <div className="bg-gray-300 w-full h-2 mt-2"></div>
          </div>

          {/* Grid layout matching the image */}
          <div className="p-4 sm:p-6 w-[95%] flex flex-col m-auto">
            {/* First row - 4 equal squares */}
            <div className="grid grid-cols-4 gap-4 md:gap-5 xl:gap-6 mb-4">
              {videos.map((item, index) => (
                <div
                  key={`row1-${index}`}
                  className="aspect-square rounded-lg overflow-hidden"
                >
                  <video
                    controls
                    className="w-full h-full object-cover cursor-pointer transition duration-300 hover:opacity-90"
                    src={item.source}
                    alt={`Gallery image ${index + 1}`}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default PhotoGallery;
