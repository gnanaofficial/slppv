import React from "react";
import { useTranslation } from "react-i18next";
import white from "@/assets/white.svg";
import { Container } from "@mui/material";
import Content from "./Content";
import ImageSection from "./ImageSection";
import { getStoryData } from "./StoryData";

import SEO from "../../components/common/SEO";

const About = () => {
  const { t } = useTranslation();
  const storyData = getStoryData(t);

  return (
    <div className="mb-5 h-full">
      <SEO
        title={t('about.title')}
        description="Learn about the history and journey of Sri Lakshmi Padmavathi Sameta Sri Prasanna Venkateswara Swamy Temple."
        keywords="About, History, Temple Journey"
      />
      <div className="flex flex-col justify-center items-center gap-2 py-5">
        <h1 className="text-white font-montserrat font-semibold text-base sm:text-lg lg:text-xl tracking-wide uppercase">
          {t('about.title')}
        </h1>
        <h1 className="text-xl sm:text-3xl md:text-4xl text-mainColor font-semibold capitalize">
          {t('about.subtitle')}
        </h1>
        <img className="w-1/8 animate-pulse" src={white} alt="" />
      </div>
      <Container>
        <div className="relative overflow-hidden animate-fade-in font-montserrat">
          <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
            <div className="flex flex-col">
              {storyData.map((story) => (
                <div
                  className={`flex  ${story.id % 2 === 1 ? "flex-row" : "flex-row-reverse"
                    }`}
                  key={story.id}
                >
                  <div className="w-3/6 md:w-2/3">
                    {story.title && (
                      <div className="mt-8 px-6 inline-flex rounded-r-xl bg-[#FFBB1D]">
                        <h2 className="text-2xl md:text-3xl font-normal text-gray-900 p-2">
                          {story.title}
                        </h2>
                      </div>
                    )}
                    <Content text={story.content} />
                  </div>
                  <div className="w-3/6 md:w-2/3 my-20 mr-5 ms-3">
                    <ImageSection
                      imageSrc={story.imageSrc}
                      imageAlt={story.imageAlt}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="absolute -bottom-10 w-full h-20 bg-white rounded-full transform translate-y-10"></div>
        </div>
      </Container>
      <div className="w-72 h-1 bg-mainColor mt-2 animate-pulse">
        <span className="w-20 h-2 bg-mainColor"></span>
      </div>
    </div>
  );
};

export default About;
