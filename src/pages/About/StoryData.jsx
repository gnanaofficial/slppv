import aboutImg1 from "@/assets/aboutImg.png";
import aboutImg2 from "@/assets/Gallery/img9.jpg";
import aboutImg3 from "@/assets/Gallery/img8.jpg";

export const getStoryData = (t) => [
  {
    id: 1,
    title: t('about.story1_title'),
    content: t('about.story1_content'),
    imageSrc: aboutImg1,
    imageAlt:
      "Divine representation of Lakshmi Padmavathi adorned with colorful garlands and decorations",
  },
  {
    id: 2,
    title: "",
    content: t('about.story2_content'),
    imageSrc: aboutImg2,
    imageAlt:
      "Divine representation of Lakshmi Padmavathi adorned with colorful garlands and decorations",
  },
  {
    id: 3,
    title: "",
    content: t('about.story3_content'),
    imageSrc: aboutImg3,
    imageAlt:
      "Divine representation of Lakshmi Padmavathi adorned with colorful garlands and decorations",
  },
];
