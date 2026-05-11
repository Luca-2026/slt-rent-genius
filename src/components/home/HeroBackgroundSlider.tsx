import { useState, useEffect, useCallback } from "react";
import heroKrefeld from "@/assets/hero-krefeld.webp";
import heroBonn from "@/assets/hero-bonn.webp";

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
      {/* LCP-Preload für hero-krefeld wird statisch via Vite-Plugin
          (heroImagePreloadPlugin in vite.config.ts) in <head> injiziert,
          damit der Browser-Preload-Scanner es vor JS-Hydration findet. */}
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
