import { useEffect, useState } from "react";
import loaderLogo from "@/assets/chakra.mp4";

const Loader = ({ isLoading, onFinish }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!isLoading) {
      // Start fade out
      const timer = setTimeout(() => {
        setVisible(false);
        if (onFinish) onFinish();
      }, 800); // Wait for fade out animation
      return () => clearTimeout(timer);
    }
  }, [isLoading, onFinish]);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex justify-center items-center transition-opacity duration-800 ease-in-out bg-[#ffad28] ${!isLoading ? "opacity-0" : "opacity-100"
        }`}
    >
      <div className="flex flex-col items-center">
        <div className="mt-4 relative">
          <video
            autoPlay
            loop
            muted
            className="h-auto w-64 xl:w-80"
            alt="Loading..."
            src={loaderLogo}
          />
        </div>

        <div className="mt-2 lg:mt-4 text-[#8B0000] font-medium text-base animate-pulse text-center">
          Sri Prasanna Venkateswara Swamy...
        </div>
      </div>
    </div>
  );
};

export default Loader;
