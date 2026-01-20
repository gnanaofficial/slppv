import { assets } from "@/assets/assets";
import React from "react";
import DonationForm from "../../components/Forms/DonationForm";
import { Container } from "@mui/material";

import SEO from "../../components/common/SEO";

const Donate = () => {
  return (
    <div className="bg-[#FAAC2F] h-auto">
      <SEO
        title="Donate"
        description="Support the temple and its activities by donating online. Secure payments via Razorpay and SBI ePay."
        keywords="Donate, Payment, Trust, Support"
      />
      <Container
        maxWidth="xl"
        className="bg-white p-8 m-auto rounded-lg shadow-lg"
      >
        <div className="text-mainColor">
          {" "}
          <div
            className="text-center font-semibold text-lg sm:text-xl xl:text-2xl
         text-wrap"
          >
            Donations may be offered to Organized temple Sevas and all Uthsavas
            <div className="h-2 w-full bg-gray-300 mt-4"> </div>
          </div>{" "}
        </div>

        <div className="text-mainColor text-3xl text-center font-bold mt-3 mb-2 md:mt-4 md:mb-4">
          <h1 className="font-phudu">Account Details</h1>
        </div>

        <div>
          <p className="text-center text-xl sm:text-2xl xl:text-3xl text-mainColor font-play">
            <span className="text-black font-bold"> Account Name : </span> Sri
            Lakshmi Padmavathi Sameta Sri Prasanna Venkateswara Swamy trust.
          </p>
        </div>
        <div className="flex gap-3 justify-ceter sm:w-[80%] xl:w-[60%] m-auto items-center my-4">
          {
            //left
          }
          <div className="w-[60%] sm:w-[50%] m-auto flex justify-center items-center">
            <img className="" src={assets.qr} alt="" />
          </div>
          {
            //right
          }

          <div className="w-full h-full font-bold text-xl sm:text-2xl xl:text-3xl font-play tracking-wider sm:tracking-widest">
            <div className="leading-10 sm:leading-loose">
              <div className="font-semibold  ">
                Account Number :
                <span className="font-mono text-mainColor">
                  {" "}
                  41411167549
                </span>{" "}
              </div>

              <div className="font-semibold  ">
                IFSC Code :
                <span className="font-mono text-mainColor">
                  {" "}
                  SBIN0016990
                </span>{" "}
              </div>

              <div className="font-semibold  ">
                Phone Pay :
                <span className="font-mono text-mainColor">
                  {" "}
                  9492284523
                </span>{" "}
              </div>
            </div>
          </div>
        </div>
      </Container>
      <div className="my-24">
        <DonationForm />
      </div>
    </div>
  );
};

export default Donate;
