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

const App = () => {
  const [isLoading, setIsLoading] = useState(true);

  // simple check: if url contains 'admin', don't play
  const isAdmin = window.location.pathname.includes("admin");

  return (
    <AdminProvider>
      <DonorProvider>
        {isLoading && <Loader onFinish={() => setIsLoading(false)} />}
        <MusicPlayer shouldPlay={!isLoading && !isAdmin} />
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
