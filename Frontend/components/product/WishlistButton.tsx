'use client';

import { Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import toast from 'react-hot-toast';

type WishlistButtonProps = {
  title: string;
};

export default function WishlistButton({ title }: WishlistButtonProps) {
  const [active, setActive] = useState(false);

  const onToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const next = !active;
    setActive(next);
    toast.success(next ? `${title} added to wishlist` : `${title} removed from wishlist`);
  };

  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={onToggle}
      className="absolute right-3 top-3 z-20 grid h-9 w-9 place-items-center rounded-full border border-border bg-white/95 shadow-sm backdrop-blur"
      aria-label="Toggle wishlist"
    >
      <Heart size={16} className={active ? 'fill-rose-500 text-rose-500' : 'text-slate-500'} />
    </motion.button>
  );
}
