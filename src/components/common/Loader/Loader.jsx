import { useEffect, useState } from "react";
import loaderLogo from "@/assets/chakra.mp4";

const Loader = ({ onFinish }) => {
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => {
      setOpacity(0);
      setTimeout(() => {
        if (onFinish) onFinish();
      }, 500);
    }, 900);

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div
      className="fixed inset-0 z-50 flex justify-center items-center transition-opacity duration-300 ease-in-out bg-[#ffad28]"
      style={{ opacity }}
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
