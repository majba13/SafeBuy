import { useState } from 'react';
import { motion } from 'framer-motion';

export default function AnimatedTabs({ tabs, onTabChange, initial = 0 }: {
  tabs: string[];
  onTabChange?: (idx: number) => void;
  initial?: number;
}) {
  const [active, setActive] = useState(initial);
  return (
    <div className="flex gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 w-fit mx-auto mb-6">
      {tabs.map((tab, idx) => (
        <button
          key={tab}
          className={`relative px-4 py-2 rounded-lg font-medium transition-colors duration-200 focus:outline-none ${active === idx ? 'text-white' : 'text-gray-700 dark:text-gray-200'}`}
          style={{ zIndex: 1 }}
          onClick={() => {
            setActive(idx);
            onTabChange && onTabChange(idx);
          }}
        >
          {active === idx && (
            <motion.div
              layoutId="tab-bg"
              className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg z-0"
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
          )}
          <span className="relative z-10">{tab}</span>
        </button>
      ))}
    </div>
  );
}
