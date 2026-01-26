import { useEffect, useState } from "react";
import chakraLogo from "@/assets/chakra.png";

const Loader = ({ isLoading, onFinish }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!isLoading) {
      // Start fade out
      const timer = setTimeout(() => {
        setVisible(false);
        if (onFinish) onFinish();
      }, 500); // Shorter fade out
      return () => clearTimeout(timer);
    }
  }, [isLoading, onFinish]);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex justify-center items-center transition-opacity duration-500 ease-in-out bg-white/80 backdrop-blur-sm ${
        !isLoading ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="relative">
        <img
          src={chakraLogo}
          alt="Loading..."
          className="w-24 h-24 animate-spin-slow"
        />
      </div>
    </div>
  );
};

export default Loader;
