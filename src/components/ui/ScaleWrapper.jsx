import React, { useEffect, useRef, useState } from "react";
import { useMediaQuery } from "react-responsive";

const ResponsiveScaleWrapper = ({
  children,
  className = "",
  mobileScaleRatio = 0.5,
  breakpoint = 768,
}) => {
  const containerRef = useRef(null);
  const contentRef = useRef(null);
  const isMobile = useMediaQuery({ maxWidth: breakpoint });
  const [scaleState, setScaleState] = useState({
    height: "auto",
    transform: "none",
    width: "100%",
  });

  useEffect(() => {
    const handleResponsiveScaling = () => {
      if (isMobile && containerRef.current && contentRef.current) {
        // Precise scaling calculation
        const scale = mobileScaleRatio;

        // Calculate natural dimensions
        const naturalHeight = contentRef.current.scrollHeight;
        const naturalWidth = contentRef.current.scrollWidth;

        // Compute scaled dimensions
        const scaledHeight = naturalHeight * scale;

        // Update state with precise scaling
        setScaleState({
          height: `${scaledHeight}px`,
          transform: `scale(${scale})`,
          width: `${100 / scale}%`,
        });
      } else {
        // Reset to full size for non-mobile screens
        setScaleState({
          height: "auto",
          transform: "none",
          width: "100%",
        });
      }
    };

    // Initial calculation
    handleResponsiveScaling();

    // Add resize listener
    window.addEventListener("resize", handleResponsiveScaling);

    // Cleanup listener
    return () => {
      window.removeEventListener("resize", handleResponsiveScaling);
    };
  }, [isMobile, mobileScaleRatio]);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      style={{
        height: scaleState.height,
        minHeight: isMobile ? scaleState.height : "auto",
      }}
    >
      <div
        ref={contentRef}
        className="origin-top-left"
        style={{
          transform: scaleState.transform,
          width: scaleState.width,
          transformOrigin: "top left",
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default ResponsiveScaleWrapper;
