import React from "react";
import { Container } from "@mui/material";
import ArchakaBrundham from "./ArchakaBrundham";

const Trust = () => {
  const trustees = [
    {
      position: "President & Managing Trustee",
      name: "Sri G C Venkateswarulu garu",
    },
    {
      position: "Vice President & Trustee",
      name: "Sri M Ashok Reddy Garu",
    },
    {
      position: "General Secretary & Trustee",
      name: "Smt M S Himabindu Garu",
    },
    {
      position: "Treasurer & Trustee",
      name: "Sri K Prasad Babu garu",
    },
  ];

  return (
    <section id="trust-details" className="mt-8 md:mt-12 mb-8">
      <Container maxWidth="xl">
        <div className="m-auto bg-white rounded-2xl overflow-hidden">
          <div>
            <p className="text-red-700 text-3xl font-bold p-6">Trust details</p>
            <div className="bg-gray-300 w-full h-1"></div>
          </div>

          <div className="grid grid-cols-2 gap-8 p-6 sm:p-10">
            {trustees.map((trustee, index) => (
              <div key={index} className="flex flex-col w-full sm:w-[90%]">
                <h2 className="text-red-700 text-lg sm:text-xl xl:text-2xl font-semibold mb-2">
                  {trustee.position}
                </h2>
                <div className="bg-yellow-400 h-1 w-full mb-4"></div>
                <p className="text-gray-800 text-lg sm:text-xl xl:text-2xl font-medium">
                  {trustee.name}
                </p>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-8">
          <ArchakaBrundham />
        </div>
      </Container>
    </section>
  );
};

export default Trust;
