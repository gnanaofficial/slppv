import React from "react";
import Reveal from "../../common/Reveal";

const MapSection = () => {
  const mapUrl =
    "https://maps.google.com/maps?q=Sri+Lakshmi+Padmavathi+Sametha+Sri+Prasanna+venkateswara+swamy+Devasthanams,+Back+Side,+Air+Bypass+Rd,+near+M+R+O+Office,+New+Balaji+Colony,+Tirupati,+Andhra+Pradesh+517501&t=&z=15&ie=UTF8&iwloc=&output=embed";

  const navigationUrl =
    "https://www.google.com/maps/dir/Tirupati,+Andhra+Pradesh/JCC8%2BF45+Sri+Lakshmi+Padmavathi+Sametha+Sri+Prasanna+venkateswara+swamy+Devasthanams,+Back+Side,+Air+Bypass+Rd,+near+M+R+O+Office,+New+Balaji+Colony,+Tirupati,+Andhra+Pradesh+517501,+India/@13.6242014,79.4127187,16.05z/data=!4m14!4m13!1m5!1m1!1s0x3a4d4b0f88620427:0xcf4152d1daca0cac!2m2!1d79.4191795!2d13.6287557!1m5!1m1!1s0x3a4d4b76703bdb89:0xf8c83ec23898d720!2m2!1d79.4152861!2d13.6213751!3e0?hl=en&entry=ttu&g_ep=EgoyMDI2MDEyMC4wIKXMDSoKLDEwMDc5MjA3M0gBUAM%3D";

  return (
    <div className="w-full py-12 bg-white">
      <div className="container mx-auto px-4">
        <Reveal width="100%">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-mainColor font-play mb-2">
              Visit The Temple
            </h2>
            <p className="text-gray-600">
              Air Bypass Road, Near Tasildar Office, Tirupati
            </p>
          </div>
        </Reveal>

        <Reveal width="100%">
          <div className="relative w-full h-[400px] rounded-2xl overflow-hidden shadow-lg border-4 border-gray-100 group">
            <iframe
              title="Temple Location"
              src={mapUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full h-full"
            ></iframe>

            {/* Overlay for Click-to-Navigate */}
            <a
              href={navigationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center pointer-events-none group-hover:pointer-events-auto"
            >
              <div className="bg-white px-6 py-3 rounded-full shadow-xl opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 font-bold text-mainColor flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                    clipRule="evenodd"
                  />
                </svg>
                Get Directions
              </div>
            </a>
          </div>
        </Reveal>
      </div>
    </div>
  );
};

export default MapSection;
