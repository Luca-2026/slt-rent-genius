import { useState, useEffect, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import heroKrefeld from "@/assets/hero-krefeld.jpg";
import heroBonn from "@/assets/hero-bonn.jpg";

const images = [
  { src: heroKrefeld, alt: "Krefeld – SLT Rental Hauptsitz" },
  { src: heroBonn, alt: "Bonn – SLT Rental Filiale" },
];
const INTERVAL = 6000;

export function HeroBackgroundSlider() {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % images.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(next, INTERVAL);
    return () => clearInterval(timer);
  }, [next]);

  return (
    <>
      {/* Preload LCP hero image so the browser fetches it as early as possible */}
      <Helmet>
        <link
          rel="preload"
          as="image"
          href={images[0].src}
          // @ts-expect-error – non-standard attribute supported by Chrome/Edge/Safari
          fetchpriority="high"
        />
      </Helmet>
      {images.map((img, i) => (
        <img
          key={i}
          src={img.src}
          alt={img.alt}
          width={1920}
          height={1080}
          fetchPriority={i === 0 ? "high" : "low"}
          loading={i === 0 ? "eager" : "lazy"}
          decoding={i === 0 ? "sync" : "async"}
          className="absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-1000 ease-in-out"
          style={{ opacity: i === current ? 1 : 0 }}
        />
      ))}
    </>
  );
}
