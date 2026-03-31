import { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AnimatedList({ items, renderItem, keyExtractor }: {
  items: any[];
  renderItem: (item: any, idx: number) => ReactNode;
  keyExtractor: (item: any, idx: number) => string | number;
}) {
  return (
    <AnimatePresence>
      {items.map((item, idx) => (
        <motion.div
          key={keyExtractor(item, idx)}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3, delay: idx * 0.05 }}
        >
          {renderItem(item, idx)}
        </motion.div>
      ))}
    </AnimatePresence>
  );
}
