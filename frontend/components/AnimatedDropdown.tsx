import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AnimatedDropdown({
  label,
  options,
  onSelect,
  selected,
}: {
  label: string;
  options: string[];
  onSelect: (option: string) => void;
  selected?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg font-medium flex items-center gap-2 focus:outline-none"
        onClick={() => setOpen((v) => !v)}
      >
        {selected || label}
        <span className="ml-2">▼</span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.ul
            className="absolute left-0 mt-2 w-40 bg-white dark:bg-gray-900 rounded-lg shadow-lg z-10 overflow-hidden"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {options.map((option) => (
              <li
                key={option}
                className={`px-4 py-2 hover:bg-blue-100 dark:hover:bg-blue-900 cursor-pointer ${selected === option ? 'font-bold text-blue-600 dark:text-blue-400' : ''}`}
                onClick={() => {
                  onSelect(option);
                  setOpen(false);
                }}
              >
                {option}
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
