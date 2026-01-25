import React, { useState, useEffect } from "react";
import white from "@/assets/white.svg";
import { getGalleryImages } from "@/lib/contentService";
import ImageModal from "./ImageModal";
import { Container } from "@mui/material";

const Gallary = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadGalleryImages();
  }, []);

  const loadGalleryImages = async () => {
    try {
      setIsLoading(true);
      const data = await getGalleryImages(); // Get all enabled images
      setImages(data);
    } catch (error) {
      console.error("Error loading gallery images:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const openModal = (imageUrl) => {
    setSelectedImage(imageUrl);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedImage(null);
  };

  // Get first 4 images for display (or fallback to empty array)
  const displayImages = images.slice(0, 4);

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

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-mainColor"></div>
          </div>
        ) : images.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-600 text-lg">No gallery images available yet.</p>
            <p className="text-gray-500 text-sm mt-2">Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 w-full max-w-7xl mx-auto px-4">
            {/* First large image - smaller and centered on small screens */}
            {displayImages[0] && (
              <div className="col-span-12 md:col-span-4 lg:col-span-4 flex justify-center items-center w-full gap-4 md:gap-0">
                <div className="w-1/2 md:w-full aspect-[4/5] overflow-hidden rounded-lg">
                  <img
                    className="w-full h-full object-cover cursor-pointer transition duration-300 hover:opacity-90"
                    src={displayImages[0].imageUrl}
                    alt={displayImages[0].caption || "Gallery image"}
                    onClick={() => openModal(displayImages[0].imageUrl)}
                  />
                </div>
                {displayImages[3] && (
                  <div className="w-1/2 md:w-full aspect-[4/5] overflow-hidden rounded-lg block md:hidden">
                    <img
                      className="w-full h-full object-cover cursor-pointer transition duration-300 hover:opacity-90"
                      src={displayImages[3].imageUrl}
                      alt={displayImages[3].caption || "Gallery image"}
                      onClick={() => openModal(displayImages[3].imageUrl)}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Middle column with two images - takes 4 cols on md, 2 on lg */}
            <div className="col-span-12 md:col-span-4 flex flex-row md:flex-col justify-between gap-4">
              {displayImages[1] && (
                <div className="w-full aspect-[5/3] overflow-hidden rounded-lg">
                  <img
                    className="w-full h-full object-cover cursor-pointer transition duration-300 hover:opacity-90"
                    src={displayImages[1].imageUrl}
                    alt={displayImages[1].caption || "Gallery image"}
                    onClick={() => openModal(displayImages[1].imageUrl)}
                  />
                </div>
              )}
              {displayImages[2] && (
                <div className="w-full aspect-[5/3] overflow-hidden rounded-lg">
                  <img
                    className="w-full h-full object-cover cursor-pointer transition duration-300 hover:opacity-90"
                    src={displayImages[2].imageUrl}
                    alt={displayImages[2].caption || "Gallery image"}
                    onClick={() => openModal(displayImages[2].imageUrl)}
                  />
                </div>
              )}
            </div>

            {/* Last large image - smaller and centered on small screens */}
            {displayImages[3] && (
              <div className="md:col-span-4 lg:col-span-4 flex justify-center hidden md:block">
                <div className="w-4/5 md:w-full aspect-[4/5] overflow-hidden rounded-lg">
                  <img
                    className="w-full h-full object-cover cursor-pointer transition duration-300 hover:opacity-90"
                    src={displayImages[3].imageUrl}
                    alt={displayImages[3].caption || "Gallery image"}
                    onClick={() => openModal(displayImages[3].imageUrl)}
                  />
                </div>
              </div>
            )}
          </div>
        )}

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
