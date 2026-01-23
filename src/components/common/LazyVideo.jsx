import React, { useState, useRef } from "react";
import { useInView } from "react-intersection-observer";

/**
 * Lazy loading video component
 */
const LazyVideo = ({
  src,
  poster,
  className = "",
  controls = true,
  autoPlay = false,
  muted = false,
  loop = false,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const videoRef = useRef(null);
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
    rootMargin: "100px",
  });

  const handleLoadedData = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setHasError(true);
  };

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      {/* Loading indicator */}
      {!isLoaded && !hasError && inView && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <svg
              className="w-16 h-16 mx-auto animate-spin text-mainColor"
              viewBox="0 0 100 100"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                strokeDasharray="70 200"
                strokeLinecap="round"
              />
            </svg>
            <p className="mt-2 text-sm text-gray-600">Loading video...</p>
          </div>
        </div>
      )}

      {/* Error fallback */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
          <div className="text-center text-gray-500">
            <svg
              className="w-12 h-12 mx-auto mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            <p className="text-sm">Failed to load video</p>
          </div>
        </div>
      )}

      {/* Actual video - only load when in view */}
      {inView && (
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          className={`w-full h-full ${isLoaded ? "opacity-100" : "opacity-0"} transition-opacity duration-500`}
          controls={controls}
          autoPlay={autoPlay}
          muted={muted}
          loop={loop}
          onLoadedData={handleLoadedData}
          onError={handleError}
          preload="metadata"
          {...props}
        />
      )}
    </div>
  );
};

export default LazyVideo;
