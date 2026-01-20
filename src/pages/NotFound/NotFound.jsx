import React from "react";
import { Link } from "react-router-dom";
import { Container } from "@mui/material";

const NotFound = () => {
  return (
    <Container
      maxWidth="lg"
      className="flex justify-center items-center h-svh md:h-dvh lg:h-lvh h-screen font-montserrat"
    >
      <div className="m-auto xs:w-[90%] flex flex-col gap-3 items-center justify-center ">
        <h4 className="text-4xl sm:text-5xl lg:text-6xl 2xl:text-7xl text-white font-montserrat font-semibold">
          <span className="text-[#C0322E]">404</span> Not Found
        </h4>
        <p className="text-white text-sm sm:text-base lg:text-lg tracking-wider text-center mt-2">
          The page you're looking for doesn't exist. Back to {" "}
          <Link to="/">
            <span className="font-semibold text-[#8D1214] underline hover:no-underline transition-all duration-300 ease-in-out">
              Homepage
            </span>
          </Link>
        </p>
      </div>
    </Container>
  );
};

export default NotFound;
