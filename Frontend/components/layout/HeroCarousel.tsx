'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

const SLIDES = [
  {
    title: 'Mega Tech Festival',
    subtitle: 'Up to 55% off on gadgets from trusted sellers',
    cta: 'Shop Electronics',
    href: '/search?category=electronics',
    bg: 'from-blue-600 via-blue-500 to-sky-400',
  },
  {
    title: 'Fashion Week Drops',
    subtitle: 'Fresh arrivals for Eid, wedding and daily style',
    cta: 'Explore Fashion',
    href: '/search?category=fashion',
    bg: 'from-slate-900 via-slate-700 to-amber-500',
  },
  {
    title: 'Home Upgrade Deals',
    subtitle: 'Smart appliances, furniture and decor at better prices',
    cta: 'Upgrade Home',
    href: '/search?category=home-living',
    bg: 'from-emerald-700 via-emerald-500 to-teal-300',
  },
];

export default function HeroCarousel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % SLIDES.length);
    }, 4200);
    return () => clearInterval(timer);
  }, []);

  const slide = SLIDES[index];

  return (
    <section className="market-container pt-6">
      <div className="relative h-[280px] overflow-hidden rounded-3xl md:h-[360px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.title}
            initial={{ opacity: 0.2, scale: 1.03 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0.2, scale: 0.98 }}
            transition={{ duration: 0.45 }}
            className={`absolute inset-0 bg-gradient-to-br ${slide.bg}`}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_20%,rgba(255,255,255,.24),transparent_40%)]" />
            <div className="relative flex h-full flex-col justify-center px-7 text-white md:px-12">
              <p className="mb-2 text-sm uppercase tracking-[0.2em] text-white/80">SafeBuy Marketplace</p>
              <h1 className="max-w-xl text-3xl font-bold md:text-5xl">{slide.title}</h1>
              <p className="mt-3 max-w-lg text-sm text-white/90 md:text-base">{slide.subtitle}</p>
              <div className="mt-6">
                <Link href={slide.href} className="inline-flex rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-100">
                  {slide.cta}
                </Link>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
          {SLIDES.map((item, i) => (
            <button
              key={item.title}
              onClick={() => setIndex(i)}
              className={`h-2 rounded-full transition ${index === i ? 'w-7 bg-white' : 'w-2 bg-white/50'}`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
