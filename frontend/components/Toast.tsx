import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Toast({ message, show, onClose }: { message: string; show: boolean; onClose: () => void }) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          className="fixed bottom-8 right-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded shadow-lg z-50"
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
