import React, { useState } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import ScrollToTop from "./components/common/ScrollToTop/ScrollToTop";
import ScaleWrapper from "./components/ui/ScaleWrapper";
import Loader from "./components/common/Loader/Loader";
import AnimatedRoutes from "./AnimatedRoutes";
import MusicPlayer from "./components/common/MusicPlayer";
import { AdminProvider } from "./context/AdminContext";
import { DonorProvider } from "./context/DonorContext";
import "./lib/i18n"; // Initialize i18n

import sbg1 from "./assets/sbg1.svg";
import sbg2 from "./assets/sbg2.svg";
import sb3 from "./assets/sb3.svg";
import sbg4 from "./assets/sbg4.svg";
import vectorImg from "./assets/Vector.png";
import { assets } from "./assets/assets";
import { getSiteContent } from "./lib/firestoreService";
import { getSiteSettings } from "./lib/configService";

const App = () => {
  const [appReady, setAppReady] = useState(false);

  // simple check: if url contains 'temple-management', don't play
  const isAdmin = window.location.pathname.includes("temple-management");

  useEffect(() => {
    const preloadAssets = async () => {
      const preloadImage = (src) => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.src = src;
          img.onload = resolve;
          img.onerror = resolve; // Continue even if error
        });
      };

      try {
        // 1. Preload Static Assets
        const staticAssets = [sbg1, sbg2, sb3, sbg4, vectorImg, assets.poster];
        const staticPromises = staticAssets.map(preloadImage);

        // 2. Fetch Dynamic Assets (Hero Images)
        const settingsPromise = getSiteSettings();
        const heroContentPromise = getSiteContent("hero");

        const [settings, heroDoc] = await Promise.all([settingsPromise, heroContentPromise]);

        const dynamicPromises = [];
        // Preload Hero Poster if configured
        if (settings?.heroPosterImage) {
          dynamicPromises.push(preloadImage(settings.heroPosterImage));
        }

        // Preload Hero Carousel Images
        if (heroDoc?.images?.length > 0) {
          heroDoc.images.forEach(img => {
            if (img.url) dynamicPromises.push(preloadImage(img.url));
          });
        }

        // Wait for everything
        await Promise.all([...staticPromises, ...dynamicPromises]);

      } catch (error) {
        console.error("Preload error:", error);
      } finally {
        // Minimum loading time of 2s to show branding, max is waiting for images
        setTimeout(() => setAppReady(true), 2000);
      }
    };

    preloadAssets();
  }, []);

  return (
    <AdminProvider>
      <DonorProvider>
        <Loader isLoading={!appReady} />
        <MusicPlayer shouldPlay={appReady && !isAdmin} />
        <ScaleWrapper>
          <Router>
            <ScrollToTop />
            <AnimatedRoutes />
          </Router>
        </ScaleWrapper>
      </DonorProvider>
    </AdminProvider>
  );
};

export default App;
