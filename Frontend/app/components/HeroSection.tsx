'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function HeroSection() {
  return (
    <section className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
      <div className="max-w-7xl mx-auto px-4 py-16 lg:py-24 grid lg:grid-cols-2 gap-8 items-center">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block bg-orange-700 text-xs font-semibold px-3 py-1 rounded-full mb-4">
            🇧🇩 Bangladesh&apos;s Trusted Marketplace
          </span>
          <h1 className="text-4xl lg:text-5xl font-extrabold leading-tight mb-4">
            Shop Smart,<br />Shop <span className="text-yellow-300">Safe</span>
          </h1>
          <p className="text-lg text-orange-100 mb-8">
            Millions of products from verified sellers. Fast delivery across Bangladesh. 
            Secure bKash, Nagad, Rocket & bank payments.
          </p>
          <div className="flex gap-4 flex-wrap">
            <Link
              href="/search"
              className="bg-white text-orange-600 font-bold px-6 py-3 rounded-xl hover:bg-orange-50 transition shadow-lg"
            >
              Shop Now
            </Link>
            <Link
              href="/auth/register?role=seller"
              className="border-2 border-white text-white font-bold px-6 py-3 rounded-xl hover:bg-white hover:text-orange-600 transition"
            >
              Sell on SafeBuy
            </Link>
          </div>
          <div className="mt-8 flex gap-6 text-sm text-orange-100">
            <span>✓ Buyer Protection</span>
            <span>✓ Easy Returns</span>
            <span>✓ COD Available</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="hidden lg:flex items-center justify-center"
        >
          <div className="bg-orange-400/30 rounded-2xl p-8 text-center">
            <div className="text-8xl mb-4">🛒</div>
            <div className="grid grid-cols-2 gap-3 mt-4">
              {['📱 Electronics', '👗 Fashion', '🏠 Home', '💄 Beauty'].map((item) => (
                <div key={item} className="bg-white/20 rounded-lg px-3 py-2 text-sm font-medium backdrop-blur-sm">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
