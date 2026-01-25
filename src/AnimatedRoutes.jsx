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
const DashboardHome = lazy(() => import("./pages/Admin/DashboardHome"));
const GalleryManager = lazy(() => import("./pages/Admin/GalleryManager"));
const VideoManager = lazy(() => import("./pages/Admin/VideoManager"));
const DonorManager = lazy(() => import("./pages/Admin/DonorManager"));
const ManualDonationEntry = lazy(
  () => import("./pages/Admin/ManualDonationEntry"),
);
const DonorHistory = lazy(() => import("./pages/Admin/DonorHistory"));
const SubAdminManager = lazy(() => import("./pages/Admin/SubAdminManager"));
const SevaManager = lazy(() => import("./pages/Admin/SevaManager"));
const Setup = lazy(() => import("./pages/Admin/Setup"));
const Seed = lazy(() => import("./pages/Admin/Seed"));
const SiteContentManager = lazy(
  () => import("./pages/Admin/SiteContentManager"),
);
const EmailConfigManager = lazy(
  () => import("./pages/Admin/EmailConfigManager"),
);
const SiteSettingsManager = lazy(
  () => import("./pages/Admin/SiteSettingsManager"),
);
const PaymentStatus = lazy(() => import("./pages/PaymentStatus/PaymentStatus"));
const Debug = lazy(() => import("./pages/Admin/Debug"));
const AdminRoute = lazy(() => import("./components/admin/AdminRoute"));

const DonorLogin = lazy(() => import("./pages/Donor/DonorLogin"));
const DonorDashboard = lazy(() => import("./pages/Donor/DonorDashboard"));

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
          <Route
            path="/payment/status"
            element={
              <Layout>
                <PaymentStatus />
              </Layout>
            }
          />

          {/* Donor Routes */}
          <Route
            path="/donor/login"
            element={
              <Layout>
                <DonorLogin />
              </Layout>
            }
          />
          <Route
            path="/donor/dashboard"
            element={
              <Layout>
                <DonorDashboard />
              </Layout>
            }
          />

          {/* Admin Routes - No animations to avoid conflicts with Sidebar */}
          <Route path="/admin/setup" element={<Setup />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<Dashboard />}>
            <Route index element={<DashboardHome />} />
            <Route path="gallery" element={<GalleryManager />} />
            <Route path="videos" element={<VideoManager />} />
            <Route path="donors" element={<DonorManager />} />
            <Route
              path="donors/manual-entry"
              element={<ManualDonationEntry />}
            />
            <Route path="donors/history" element={<DonorHistory />} />
            <Route path="sub-admins" element={<SubAdminManager />} />
            <Route path="sevas" element={<SevaManager />} />
            <Route path="seed-data" element={<Seed />} />
            <Route path="site-content" element={<SiteContentManager />} />
            <Route path="email-config" element={<EmailConfigManager />} />
            <Route path="site-settings" element={<SiteSettingsManager />} />
            <Route path="debug" element={<Debug />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </AnimatePresence>
  );
};

export default AnimatedRoutes;
