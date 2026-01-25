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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full max-w-7xl mx-auto px-4">
            {images.map((image, index) => (
              <div
                key={image.id}
                className={`
                  relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer group
                  ${index % 7 === 0 ? "sm:col-span-2 sm:row-span-2" : ""}
                  ${index % 11 === 0 ? "md:col-span-2" : ""}
                `}
                onClick={() => openModal(image.imageUrl)}
              >
                {/* Image */}
                <div className="aspect-square overflow-hidden">
                  <img
                    src={image.imageUrl}
                    alt={image.caption || "Gallery image"}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                  />
                </div>

                {/* Overlay with caption */}
                {(image.caption || image.captionTelugu) && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {image.caption && (
                      <p className="text-white font-semibold text-sm md:text-base">
                        {image.caption}
                      </p>
                    )}
                    {image.captionTelugu && (
                      <p className="text-white/90 text-xs md:text-sm mt-1">
                        {image.captionTelugu}
                      </p>
                    )}
                  </div>
                )}

                {/* Hover effect overlay */}
                <div className="absolute inset-0 bg-mainColor/0 group-hover:bg-mainColor/10 transition-colors duration-300"></div>
              </div>
            ))}
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
