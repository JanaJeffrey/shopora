"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Slide {
  src: string;
  alt: string;
}

// Curated, freely-licensed Unsplash photos — mix of shopping and
// delivery so the hero doesn't read as one-note.
const SLIDES: Slide[] = [
  {
    src: "https://images.unsplash.com/photo-1574634534894-89d7576c8259?fm=jpg&q=80&w=1600&auto=format&fit=crop",
    alt: "Woman holding a shopping bag beside a colorful mural",
  },
  {
    src: "https://images.unsplash.com/photo-1621972750749-0fbb1abb7736?fm=jpg&q=80&w=1600&auto=format&fit=crop",
    alt: "Delivery rider in an orange jacket cycling at night",
  },
  {
    src: "https://images.unsplash.com/photo-1617347454431-f49d7ff5c3b1?fm=jpg&q=80&w=1600&auto=format&fit=crop",
    alt: "Delivery driver on a red scooter riding through the city at night",
  },
  {
    src: "https://images.unsplash.com/photo-1483985988355-763728e1935b?fm=jpg&q=80&w=1600&auto=format&fit=crop",
    alt: "Woman holding white and black paper shopping bags",
  },
  {
    src: "https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?fm=jpg&q=80&w=1600&auto=format&fit=crop",
    alt: "Courier handing over a delivery box",
  },
];

const SLIDE_DURATION_MS = 5000;

export default function HeroCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((current) => (current + 1) % SLIDES.length);
    }, SLIDE_DURATION_MS);

    return () => clearInterval(timer);
  }, []);

  const goTo = (index: number) => {
    setActiveIndex((index + SLIDES.length) % SLIDES.length);
  };

  return (
    <div className="group relative h-full w-full overflow-hidden">
      {SLIDES.map((slide, index) => (
        <img
          key={slide.src}
          src={slide.src}
          alt={slide.alt}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ease-in-out ${
            index === activeIndex ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}

      {/* Darkening gradient so dots/arrows stay legible on any photo */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

      {/* Prev / next arrows — shown on hover (desktop) */}
      <button
        type="button"
        onClick={() => goTo(activeIndex - 1)}
        aria-label="Previous slide"
        className="absolute left-3 top-1/2 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-gray-900 opacity-0 shadow-md transition group-hover:opacity-100 sm:flex"
      >
        <ChevronLeft size={18} />
      </button>

      <button
        type="button"
        onClick={() => goTo(activeIndex + 1)}
        aria-label="Next slide"
        className="absolute right-3 top-1/2 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-gray-900 opacity-0 shadow-md transition group-hover:opacity-100 sm:flex"
      >
        <ChevronRight size={18} />
      </button>

      {/* Dot indicators */}
      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
        {SLIDES.map((slide, index) => (
          <button
            key={slide.src}
            type="button"
            onClick={() => goTo(index)}
            aria-label={`Go to slide ${index + 1}`}
            className={`h-2 rounded-full transition-all ${
              index === activeIndex
                ? "w-6 bg-white"
                : "w-2 bg-white/50 hover:bg-white/75"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
