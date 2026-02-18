"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

const workflows = [
  {
    title: "Wan Lora - Rotate",
    description: "Create rotating object animations using Wan LoRA fine-tuning.",
    image: "https://cdn.prod.website-files.com/681b040781d5b5e278a69989/6825b0acc901ee5c718efc90_Wan%20Lora%20-%20Rotate.avif",
    models: ["Wan", "LoRA"],
  },
  {
    title: "Multiple Models",
    description: "Combine multiple AI models in a single workflow for enhanced results.",
    image: "https://cdn.prod.website-files.com/681b040781d5b5e278a69989/681f925d9ecbfaf69c5dc15e_Workflow%2001.avif",
    models: ["Flux Pro", "SD 3.5"],
  },
  {
    title: "Wan LoRa Inflate",
    description: "Generate inflating object animations with Wan LoRA models.",
    image: "https://cdn.prod.website-files.com/681b040781d5b5e278a69989/681f925d9ecbfaf69c5dc164_Workflow%2003.avif",
    models: ["Wan", "LoRA"],
  },
  {
    title: "Relight 2.0 Human",
    description: "Professional relighting for human portraits with precise control.",
    image: "https://cdn.prod.website-files.com/681b040781d5b5e278a69989/6825b0ac314fefe464791808_Relight%202.0%20human.avif",
    models: ["Relight", "Portrait"],
  },
  {
    title: "Weavy Logo",
    description: "Generate brand logos with AI-powered creative workflows.",
    image: "https://cdn.prod.website-files.com/681b040781d5b5e278a69989/6825b0acdb693fa2102f0af2_Weavy%20Logo.avif",
    models: ["Flux Pro", "GPT img"],
  },
  {
    title: "Relight - Product",
    description: "Studio-quality product relighting for e-commerce photography.",
    image: "https://cdn.prod.website-files.com/681b040781d5b5e278a69989/6825b0ac04c55a803826a6e5_Relight%20-%20Product.avif",
    models: ["Relight", "Product"],
  },
  {
    title: "ControlNet - Structure Reference",
    description: "Apply artistic styles to photos while preserving details.",
    image: "https://cdn.prod.website-files.com/681b040781d5b5e278a69989/681f925d9ecbfaf69c5dc16a_Workflow%2002.avif",
    models: ["Imagen 3", "Astro"],
  },
  {
    title: "Camera Angle Control",
    description: "Advanced multi-layer compositing with AI-driven blending.",
    image: "https://cdn.prod.website-files.com/681b040781d5b5e278a69989/681f925d9ecbfaf69c5dc170_Workflow%2004.avif",
    models: ["Layers", "Blend"],
  },
];

export default function ExploreWorkflows() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollPos, setScrollPos] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Double the items for infinite scroll illusion
  const allWorkflows = [...workflows, ...workflows];

  const scroll = useCallback(
    (direction: "left" | "right") => {
      if (!scrollRef.current) return;
      const container = scrollRef.current;
      const cardWidth = 340;
      const newPos =
        direction === "right"
          ? scrollPos + cardWidth
          : scrollPos - cardWidth;
      container.scrollTo({ left: newPos, behavior: "smooth" });
      setScrollPos(newPos);
    },
    [scrollPos]
  );

  // Auto-scroll effect
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      if (!scrollRef.current) return;
      const container = scrollRef.current;
      const maxScroll = container.scrollWidth - container.clientWidth;
      if (container.scrollLeft >= maxScroll - 10) {
        container.scrollLeft = 0;
        setScrollPos(0);
      } else {
        container.scrollLeft += 1;
        setScrollPos(container.scrollLeft);
      }
    }, 30);
    return () => clearInterval(interval);
  }, [isPaused]);

  return (
    <section className="relative w-full bg-[#2b2d2a] py-20 md:py-32 overflow-hidden">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 mb-12">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <h2 className="text-4xl md:text-6xl font-medium tracking-tight text-white">
              Explore Our Workflows
            </h2>
            <p className="mt-3 text-lg text-white/60 max-w-lg">
              From multi-layer compositing to matte manipulation, Weavy keeps up with your creativity with all the editing tools you recognize and rely on.
            </p>
          </div>

          {/* Nav arrows */}
          <div className="flex gap-3">
            <button
              onClick={() => scroll("left")}
              className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
              aria-label="Scroll left"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button
              onClick={() => scroll("right")}
              className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
              aria-label="Scroll right"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Card carousel */}
      <div
        ref={scrollRef}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        className="flex gap-5 overflow-x-auto scrollbar-hide px-4 md:px-8 pb-4"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {allWorkflows.map((wf, idx) => (
          <motion.div
            key={`${wf.title}-${idx}`}
            className="flex-shrink-0 w-[300px] md:w-[340px] bg-[#363836] rounded-2xl overflow-hidden group cursor-pointer"
            whileHover={{ scale: 1.03, y: -8 }}
            transition={{ duration: 0.3 }}
          >
            {/* Card Image */}
            <div className="relative w-full h-[200px] overflow-hidden">
              <Image
                src={wf.image}
                alt={wf.title}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#363836] via-transparent to-transparent" />
            </div>

            {/* Card content */}
            <div className="p-5">
              <h3 className="text-lg font-semibold text-white mb-1">
                {wf.title}
              </h3>
              <p className="text-sm text-white/50 mb-4 line-clamp-2">
                {wf.description}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  {wf.models.map((model) => (
                    <span
                      key={model}
                      className="text-[11px] px-2.5 py-1 rounded-full bg-white/10 text-white/70"
                    >
                      {model}
                    </span>
                  ))}
                </div>
                <button className="text-xs px-4 py-1.5 rounded-full bg-[#f7ff9e] text-[#252525] font-medium hover:bg-[#eaeada] transition-colors">
                  Try
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
