import React from "react";

const Emap = () => {
  return (

    <div className="w-full flex items-center justify-center md:p-4">
      <iframe src="https://www.google.com/maps/embed?pb=!1m23!1m12!1m3!1d124083.12821976171!2d79.33290385567823!3d13.62136163779256!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!4m8!3e6!4m0!4m5!1s0x3a4d4b76703bdb89%3A0xf8c83ec23898d720!2sJCC8%2BF45%20Back%20Side%2C%20Air%20Bypass%20Rd%2C%20near%20M%20R%20O%20Office%2C%20New%20Balaji%20Colony%2C%20Tirupati%2C%20Andhra%20Pradesh%20517501!3m2!1d13.6213751!2d79.4152861!5e0!3m2!1sen!2sin!4v1743479396902!5m2!1sen!2sin" 
        className="w-full lg:w-[80%] 2xl:w-[60%] h-96 md:h-[500px] rounded-lg" // Responsive width and fixed height

        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"></iframe>



    </div>
  );
};

export default Emap;