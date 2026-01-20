import { useState, useEffect } from "react";
import { Box } from "@mui/material";
import { useLocation } from "react-router-dom";
import { ArrowUp } from "lucide-react";

const ScrollToTop = () => {
  const { pathname } = useLocation();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    const toggleVisibility = () => {
      const scrolled = window.scrollY;

      if (scrolled > 50) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);

    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <>
      <Box
        className={`fixed right-4 bottom-4 lg:right-8 lg:bottom-8 z-[9999] bg-[#8D1214] xl:size-12 size-10 p-auto rounded-full flex align-middle justify-center cursor-pointer transition-all duration-300 flex justify-center items-center mx-auto ${
          isVisible
            ? "transition-opacity opacity-90 hover:opacity-100 translate-y-0"
            : "opacity-0 translate-y-10"
        }`}
        onClick={scrollToTop}
        style={{ pointerEvents: isVisible ? "auto" : "none" }}
      >
        <ArrowUp className="text-[#fff]" />
      </Box>
    </>
  );
};

export default ScrollToTop;
