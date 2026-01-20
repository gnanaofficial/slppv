import React from "react";

const Content = ({ text }) => {
  return (
    <div className="p-6 md:p-8 lg:p-10">
      <p className="text-gray-800 text-base md:text-lg leading-relaxed md:leading-relaxed">
        {text}
      </p>
    </div>
  );
};

export default Content;
