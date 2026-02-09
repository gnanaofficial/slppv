import React from "react";
import { Container } from "@mui/material";
import { Link } from "react-router-dom";
import { FaGooglePay } from "react-icons/fa";

import googlePayImg from "@/assets/PaymentLogos/googlepay.png";
import phonepeeImg from "@/assets/PaymentLogos/phonepee.png";
import paytmImg from "@/assets/PaymentLogos/paytm.png";
import upiImg from "@/assets/PaymentLogos/upi.svg";

const handleGooglePay = () => {
  console.log("Initiating Google Pay payment");
};

const Footer = () => {
  return (
    <footer className="w-full rounded-lg bg-[#C0322E] text-white py-8 px-4 mb-0 font-montserrat">
      <Container maxWidth="lg" className="container mx-auto">
        <div className="grid grid-cols-2 lg:items-center lg:grid-cols-5 xl:grid-cols-6 lg:gap-8">
          <div className="col-span-2 md:col-span-2 lg:col-span-1 xl:col-span-2 md:mb-6 mx-auto">
            <div className="flex flex-row justify-center md:justify-start items-start gap-x-5 w-full mb-4 text-sm xs:text-base">
              <p className="font-bold mb-2 w-1/3 lg:w-full xl:w-1/3">
                Address:
              </p>
              <p className="text-white w-2/3 lg:w-full xl:w-2/3">
                Air Bypass Road, Near Tasildar Office, Tirupati, Andhra Pradesh
                517501.
              </p>
            </div>

            <div className="flex flex-row justify-start items-start gap-x-5 w-full text-sm xs:text-base">
              <p className="font-bold mb-2 w-1/3 lg:w-full xl:w-1/3">
                Phone No:
              </p>
              <p className="text-white w-2/3 lg:w-full xl:w-2/3">
                +91 9492284523
              </p>
            </div>
          </div>
          <div className="col-span-2 lg:col-span-2 xl:col-span-2 grid grid-cols-2 gap-4 mx-auto xl:w-full my-3 xs:my-6 lg:my-0">
            <div className="col-span-1">
              <h3 className="font-bold mb-6">Quick Link</h3>
              <ul className="space-y-3">
                <li>
                  <Link
                    to="/about"
                    className="text-sm text-white hover:text-white/80 transition-all duration-100 ease-in-out"
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    to="/contact"
                    className="text-sm text-white hover:text-white/80 transition-all duration-100 ease-in-out"
                  >
                    Contact
                  </Link>
                </li>
                <li>
                  <Link
                    to="/photo-gallery"
                    className="text-sm text-white hover:text-white/80 transition-all duration-100 ease-in-out"
                  >
                    Gallery
                  </Link>
                </li>
                <li>
                  <Link
                    to="/terms-and-conditions"
                    className="text-sm text-white hover:text-white/80 transition-all duration-100 ease-in-out"
                  >
                    Terms & Conditions
                  </Link>
                </li>
                <li>
                  <Link to="/donate" className="inline-block mt-3">
                    <button className="text-white px-8 py-2 bg-gradient-to-r from-[#f2e496] via-[#b3892d] to-[#ba983c] rounded-full hover:from-[#ba983c] hover:to-[#b3892d] transition-all duration-500 ease-in-out">
                      Donate
                    </button>
                  </Link>
                </li>
              </ul>
            </div>

            <div className="col-span-1">
              <h3 className="font-bold mb-6">Sevas & Support</h3>
              <ul className="space-y-3">
                <li>
                  <Link
                    to="/sevas/daily-sevas"
                    className="text-sm text-white hover:text-white/80 transition-all duration-100 ease-in-out"
                  >
                    Daily Sevas
                  </Link>
                </li>
                <li>
                  <Link
                    to="/sevas/weekly-sevas"
                    className="text-sm text-white hover:text-white/80 transition-all duration-100 ease-in-out"
                  >
                    Weekly Sevas
                  </Link>
                </li>
                <li>
                  <Link
                    to="/sevas/monthly-sevas"
                    className="text-sm text-white hover:text-white/80 transition-all duration-100 ease-in-out"
                  >
                    Monthly Sevas
                  </Link>
                </li>
                <li>
                  <Link
                    to="/sevas/auspicious-sevas"
                    className="text-sm text-white hover:text-white/80 transition-all duration-100 ease-in-out"
                  >
                    Auspicious Sevas
                  </Link>
                </li>
                <li>
                  <Link
                    to="/feedback"
                    className="text-sm text-white hover:text-white/80 transition-all duration-100 ease-in-out"
                  >
                    Feedback
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="col-span-2 md:col-span-2 lg:col-span-2 md:w-[80%] lg:w-full mx-auto xl:w-full my-6 lg:my-0">
            <h3 className="text-lg font-bold mb-4">Sign Up To Newsletter</h3>
            <div className="flex flex-col">
              <div className="relative w-full mt-5">
                <input
                  type="email"
                  placeholder="Email address"
                  className="w-full bg-transparent text-white text-3xl font-light pb-2 pt-0 px-0 border-0 border-b-2 border-white focus:outline-none focus:ring-0 focus:border-white"
                />
              </div>

              <div className="mt-10">
                <p className="text-white text-lg font-bold mb-4">Payment By:</p>
                <div className="flex gap-3">
                  <button
                    onClick={handleGooglePay}
                    className="bg-white rounded-md p-1 flex items-center justify-center hover:opacity-80"
                  >
                    <img src={googlePayImg} className="size-8" />
                  </button>
                  <button
                    onClick={handleGooglePay}
                    className="bg-white rounded-md p-1 flex items-center justify-center hover:opacity-80"
                  >
                    <img src={phonepeeImg} className="size-8" />
                  </button>
                  <button
                    onClick={handleGooglePay}
                    className="bg-white rounded-md p-1 flex items-center justify-center hover:opacity-80"
                  >
                    <img src={paytmImg} className="size-8" />
                  </button>
                  <button
                    onClick={handleGooglePay}
                    className="bg-white rounded-md p-1 flex items-center justify-center hover:opacity-80"
                  >
                    <img src={upiImg} className="size-8" />
                  </button>
                  {/* <button
                    onClick={handleGooglePay}
                    className="bg-white rounded-md p-1 h-8 w-10 flex items-center justify-center hover:opacity-80"
                  >
                    <FaGooglePay size={30} className="text-gray-700" />
                  </button> */}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-secondaryColor mt-8 pt-4 text-center text-white">
          <p className="flex flex-col md:flex-row items-center justify-center gap-y-2 sm:gap-x-1 text-sm">
            <span className="font-semibold">© 2025 Sipptempletpt.org</span>
            <span>All Rights Reserved.</span>
          </p>
          <p className="text-xs mt-2">
            Designed & Developed by{" "}
            <a
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primaryColor underline hover:text-white/80 transition-all duration-200"
            >
              Zervitra
            </a>
          </p>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
