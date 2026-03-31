import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/router';
import { ReactNode } from 'react';

export default function PageTransition({ children }: { children: ReactNode }) {
  const router = useRouter();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={router.route}
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -40 }}
        transition={{ duration: 0.3 }}
        className="min-h-screen"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
