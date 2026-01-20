import React from "react";

import white from "@/assets/white.svg";
import Emap from "./Emap";

function ResearchPage() {
  return (
    <section className="research-page mt-24 mb-5" id="researchmap">
      <div className="flex flex-col justify-center items-center gap-2">
        <h1 className="text-white font-montserrat font-semibold text-base sm:text-lg lg:text-xl tracking-wide uppercase">
          Showcase
        </h1>
        <h1 className="text-xl sm:text-3xl md:text-4xl text-mainColor font-semibold capitalize">
          Research Locations Explored
        </h1>
        <img className="w-1/8 animate-pulse" src={white} alt="" />
      </div>
      <div className="container flex mx-auto mt-2 mb-12">
        <Emap />
      </div>
    </section>
  );
}

export default ResearchPage;
