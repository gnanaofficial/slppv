import React, { Suspense, lazy } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import PageWrapper from "./components/common/PageWrapper";
import Loader from "./components/common/Loader/Loader";

import Navbar from "./components/common/Navbar/Navbar";
import Footer from "./components/common/Footer/Footer";

// Lazy Load Pages
const HomePage = lazy(() => import("./pages/HomePage/HomePage"));
const Donate = lazy(() => import("./pages/Donate/Donate"));
const PhotoGallery = lazy(() => import("./pages/PhotoGallery/PhotoGallery"));
const About = lazy(() => import("./pages/About/About"));
const NotFound = lazy(() => import("./pages/NotFound/NotFound"));
const Daily = lazy(() => import("./pages/Seva/Daily"));
const Auspicious = lazy(() => import("./pages/Seva/Auspicious"));
const Monthly = lazy(() => import("./pages/Seva/Monthly"));
const Weekly = lazy(() => import("./pages/Seva/Weekly"));
const Contact = lazy(() => import("./pages/Contact"));
const Feedback = lazy(() => import("./pages/Feedback"));
const Trust = lazy(() => import("./pages/Trust/Trust"));

const AdminLogin = lazy(() => import("./pages/Admin/AdminLogin"));
const Dashboard = lazy(() => import("./pages/Admin/Dashboard"));
const GalleryManager = lazy(() => import("./pages/Admin/GalleryManager"));
const DonorManager = lazy(() => import("./pages/Admin/DonorManager"));
const SevaManager = lazy(() => import("./pages/Admin/SevaManager"));
const Setup = lazy(() => import("./pages/Admin/Setup"));
const AdminRoute = lazy(() => import("./components/admin/AdminRoute"));

const Layout = ({ children }) => {
  return (
    <>
      <Navbar />
      <PageWrapper>{children}</PageWrapper>
      <Footer />
    </>
  );
};

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<Loader />}>
        <Routes location={location} key={location.pathname}>
          <Route
            path="/"
            element={
              <Layout>
                <HomePage />
              </Layout>
            }
          />
          <Route
            path="/about"
            element={
              <Layout>
                <About />
              </Layout>
            }
          />
          <Route
            path="/contact"
            element={
              <Layout>
                <Contact />
              </Layout>
            }
          />
          <Route
            path="/trust-details"
            element={
              <Layout>
                <Trust />
              </Layout>
            }
          />
          <Route
            path="/donate"
            element={
              <Layout>
                <Donate />
              </Layout>
            }
          />
          <Route
            path="/photo-gallery"
            element={
              <Layout>
                <PhotoGallery />
              </Layout>
            }
          />

          <Route
            path="/sevas/daily-sevas"
            element={
              <Layout>
                <Daily />
              </Layout>
            }
          />
          <Route
            path="/sevas/weekly-sevas"
            element={
              <Layout>
                <Weekly />
              </Layout>
            }
          />
          <Route
            path="/sevas/monthly-sevas"
            element={
              <Layout>
                <Monthly />
              </Layout>
            }
          />
          <Route
            path="/sevas/auspicious-sevas"
            element={
              <Layout>
                <Auspicious />
              </Layout>
            }
          />
          <Route
            path="/feedback"
            element={
              <Layout>
                <Feedback />
              </Layout>
            }
          />

          {/* Admin Routes - No animations to avoid conflicts with Sidebar */}
          <Route path="/admin/setup" element={<Setup />} />
          <Route path="/admin-slppv" element={<AdminLogin />} />
          <Route path="/admin-slppv" element={<AdminLogin />} />
          <Route path="/admin/setup" element={<Setup />} />
          <Route path="/admin" element={<Dashboard />}>
            <Route
              index
              element={
                <h2 className="text-2xl font-bold">
                  Welcome to Admin Dashboard
                </h2>
              }
            />
            <Route path="gallery" element={<GalleryManager />} />
            <Route path="donors" element={<DonorManager />} />
            <Route path="sevas" element={<SevaManager />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </AnimatePresence>
  );
};

export default AnimatedRoutes;
