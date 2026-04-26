// src/components/ImageCarousel.jsx
// Simple image carousel for listing detail page.

import React, { useState } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const PLACEHOLDER = 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&q=80';

const ImageCarousel = ({ images = [] }) => {
  const [current, setCurrent] = useState(0);
  const imgs = images.length > 0 ? images : [PLACEHOLDER];

  const prev = () => setCurrent((c) => (c === 0 ? imgs.length - 1 : c - 1));
  const next = () => setCurrent((c) => (c === imgs.length - 1 ? 0 : c + 1));

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gray-100 select-none">
      {/* Main image */}
      <div className="relative h-72 sm:h-96 lg:h-[480px]">
        <img
          src={imgs[current]}
          alt={`Image ${current + 1}`}
          className="w-full h-full object-cover"
          onError={(e) => { e.target.src = PLACEHOLDER; }}
        />

        {/* Gradient overlay for counter readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20" />

        {/* Counter */}
        <div className="absolute bottom-4 right-4 bg-black/50 text-white text-xs font-medium px-2.5 py-1 rounded-full">
          {current + 1} / {imgs.length}
        </div>
      </div>

      {/* Navigation arrows (only if more than 1 image) */}
      {imgs.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 hover:bg-white shadow-md flex items-center justify-center transition-all"
            aria-label="Previous image"
          >
            <FiChevronLeft size={18} className="text-dark-700" />
          </button>
          <button
            onClick={next}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 hover:bg-white shadow-md flex items-center justify-center transition-all"
            aria-label="Next image"
          >
            <FiChevronRight size={18} className="text-dark-700" />
          </button>

          {/* Thumbnail dots */}
          <div className="flex justify-center gap-2 py-3 bg-white">
            {imgs.map((img, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`transition-all rounded-full overflow-hidden border-2
                  ${i === current ? 'border-primary-400 w-10 h-10' : 'border-transparent w-9 h-9 opacity-60 hover:opacity-90'}`}
                aria-label={`Go to image ${i + 1}`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ImageCarousel;
