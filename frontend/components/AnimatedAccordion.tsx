import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AnimatedAccordion({ items }: { items: { title: string; content: string }[] }) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  return (
    <div className="w-full max-w-xl mx-auto">
      {items.map((item, idx) => (
        <div key={item.title} className="mb-2">
          <button
            className="w-full flex justify-between items-center px-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-lg focus:outline-none"
            onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
          >
            <span className="font-medium text-left">{item.title}</span>
            <span>{openIdx === idx ? '-' : '+'}</span>
          </button>
          <AnimatePresence initial={false}>
            {openIdx === idx && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden px-4 py-2 bg-white dark:bg-gray-900 rounded-b-lg shadow"
              >
                <div>{item.content}</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}
