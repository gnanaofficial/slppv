import React, { useState, useEffect } from "react";
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
    // Short timeout to allow initial render before showing content
    // This replaces the complex preloading logic
    const timer = setTimeout(() => {
      setAppReady(true);
    }, 500);

    return () => clearTimeout(timer);
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
