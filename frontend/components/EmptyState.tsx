import { motion } from 'framer-motion';

export default function EmptyState({ message }: { message: string }) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center py-16 text-gray-400 dark:text-gray-500"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
    >
      <svg width="48" height="48" fill="none" viewBox="0 0 24 24" className="mb-4">
        <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 18a8 8 0 110-16 8 8 0 010 16zm-1-7h2v2h-2v-2zm0-6h2v4h-2V7z" fill="currentColor" />
      </svg>
      <span className="text-lg font-medium">{message}</span>
    </motion.div>
  );
}
