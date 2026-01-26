import React, { useState, useEffect } from "react";
import vectorImg from "@/assets/Vector.png";
import chakraLogo from "@/assets/chakra.png";
import { assets } from "@/assets/assets";
import { getSiteContent } from "@/lib/firestoreService";
import { getSiteSettings } from "@/lib/configService";
import { motion, AnimatePresence } from "framer-motion";

const Cover = () => {
  const [carouselImages, setCarouselImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [posterImage, setPosterImage] = useState(assets.poster); // Left side image
  const [isLoadingPoster, setIsLoadingPoster] = useState(true);

  // Fetch left poster image from site settings
  useEffect(() => {
    const fetchPosterImage = async () => {
      try {
        setIsLoadingPoster(true);
        const settings = await getSiteSettings();

        if (settings && settings.heroPosterImage) {
          setPosterImage(settings.heroPosterImage);
        } else {
          // Use default if not configured
          setPosterImage(assets.poster);
        }
      } catch (error) {
        console.error("Error fetching poster image:", error);
        setPosterImage(assets.poster);
      } finally {
        setIsLoadingPoster(false);
      }
    };

    fetchPosterImage();
  }, []);

  // Fetch right carousel images (existing logic)
  useEffect(() => {
    const fetchDynamicImages = async () => {
      try {
        const heroDoc = await getSiteContent("hero");
        if (heroDoc && heroDoc.images && heroDoc.images.length > 0) {
          // Extract URLs from image objects
          const dynamicUrls = heroDoc.images.map((img) => img.url.trim());
          setCarouselImages(dynamicUrls);
        }
      } catch (error) {
        console.error("Error fetching dynamic cover images:", error);
      }
    };

    fetchDynamicImages();
  }, []);

  useEffect(() => {
    // Only start interval if we have images
    if (carouselImages.length <= 1) return;

    const intervalId = setInterval(() => {
      setCurrentImageIndex(
        (prevIndex) => (prevIndex + 1) % carouselImages.length,
      );
    }, 5000); // 5 seconds per slide (includes transition time)

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
          {/* LEFT SIDE - Static Poster (now dynamic from admin) */}
          <div className="w-2/5 md:w-1/4 relative aspect-[3/4] overflow-hidden rounded-3xl">
            {isLoadingPoster ? (
              <div className="w-full h-full flex items-center justify-center bg-gray-50/30">
                <img
                  src={chakraLogo}
                  alt="Loading"
                  className="w-12 h-12 animate-spin-slow opacity-60"
                />
              </div>
            ) : (
              <img
                className="w-full h-full object-cover"
                src={posterImage}
                alt="Temple Poster"
              />
            )}
          </div>

          {/* RIGHT SIDE - Carousel (existing, working fine) */}
          <div className="w-2/5 md:w-1/4 relative aspect-[3/4] overflow-hidden rounded-3xl">
            <AnimatePresence>
              {carouselImages.length > 0 ? (
                <motion.img
                  key={currentImageIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1 }}
                  className="absolute inset-0 w-full h-full object-cover"
                  src={carouselImages[currentImageIndex]}
                  alt={`Carousel image ${currentImageIndex + 1}`}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-50/30">
                  <img
                    src={chakraLogo}
                    alt="Loading"
                    className="w-12 h-12 animate-spin-slow opacity-60"
                  />
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </>
  );
};

export default Cover;
