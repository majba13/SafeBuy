import { motion } from 'framer-motion';

export default function FloatingActionButton({ icon, onClick, label }: { icon: React.ReactNode; onClick: () => void; label?: string }) {
  return (
    <motion.button
      className="fixed bottom-8 right-8 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-full shadow-lg p-4 flex items-center justify-center hover:scale-110 focus:outline-none z-50"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      aria-label={label || 'Action'}
    >
      {icon}
    </motion.button>
  );
}
