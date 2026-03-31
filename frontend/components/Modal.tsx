import { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Modal({ open, onClose, children, title }: { open: boolean; onClose: () => void; children: ReactNode; title?: string }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white dark:bg-gray-900 rounded-lg shadow-xl p-6 w-full max-w-md relative"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            {title && <h2 className="text-lg font-semibold mb-4">{title}</h2>}
            {children}
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 dark:hover:text-white"
              onClick={onClose}
              aria-label="Close"
            >
              &times;
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
