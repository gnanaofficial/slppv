import React from "react";
import { Helmet } from "react-helmet-async";

const SEO = ({ title, description, keywords }) => {
  return (
    <Helmet>
      <title>
        {title} | Sri Lakshmi Padmavathi Sameta Sri Prasanna Venkateswara Swamy
        Temple
      </title>
      <meta name="description" content={description} />
      <meta
        name="keywords"
        content={`Tirupati, Sri Venkateswara, Temple, ${keywords}`}
      />
    </Helmet>
  );
};

export default SEO;
