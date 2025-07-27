"use client";

import { useState, useEffect } from "react";
import Slider from "react-slick";
import Image from "next/image";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./slidingCards.css"; // Custom styles

const images = [
  "/images/cardsHeroPage/slide1.png",
  "/images/cardsHeroPage/slide2.png",
  "/images/cardsHeroPage/slide3.png",
  "/images/cardsHeroPage/slide4.png",
];

export default function SlidingCards() {
  const [isMobile, setIsMobile] = useState(false);

  // Listen for screen width changes
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024); // <1024px → md and below
    };

    handleResize(); // Initial check
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const settings = {
    dots: true,
    infinite: true,
    autoplay: true,
    autoplaySpeed: 2500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    centerMode: true, // enable center mode only on mobile
    centerPadding: isMobile ? "15%" : "35px", // show side images only on mobile
  };

  return (
    <div className="w-full mt-6 pb-8 px-2">
      <Slider {...settings}>
        {images.map((src, index) => (
          <div key={index} className="slide-wrapper">
            <div className="relative w-full h-[230px] sm:h-[300px] md:h-[320px] rounded-xl overflow-hidden shadow-md">
              <Image
                src={src}
                alt={`Slide ${index + 1}`}
                fill
                className="object-cover object-top"
                priority
              />
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
}
