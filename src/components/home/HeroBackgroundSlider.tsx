import { useState, useEffect, useCallback } from "react";
import heroKrefeld from "@/assets/hero-krefeld.jpg";
import heroBonn from "@/assets/hero-bonn.jpg";

const images = [heroKrefeld, heroBonn];
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
      {images.map((src, i) => (
        <div
          key={i}
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000 ease-in-out"
          style={{
            backgroundImage: `url(${src})`,
            opacity: i === current ? 1 : 0,
          }}
        />
      ))}
    </>
  );
}
