import React from "react";
import Cover from "../../components/sections/Cover/Cover";
import Seva from "../Seva/Seva";
import Gallary from "../../components/sections/Gallary/Gallary";
import ResearchPage from "../../components/sections/ResearchPage/ResearchPage";
import SEO from "../../components/common/SEO";
import Reveal from "../../components/common/Reveal";
import EventPopup from "../../components/common/EventPopup";
import MapSection from "../../components/sections/MapSection/MapSection";

const HomePage = () => {
  return (
    <>
      <SEO
        title="Home"
        description="Welcome to Sri Lakshmi Padmavathi Sameta Sri Prasanna Venkateswara Swamy Temple. Join us for daily sevas and spiritual activities."
        keywords="Home, Temple, Sevas"
      />
      <EventPopup />
      <Cover />
      <div className="flex flex-col items-center w-full">
        <Reveal width="100%">
          <Seva />
        </Reveal>
        <Reveal width="100%">
          <Gallary />
        </Reveal>
        <Reveal width="100%">
          <MapSection />
        </Reveal>
      </div>
    </>
  );
};

export default HomePage;
