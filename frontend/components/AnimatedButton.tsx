import { motion } from 'framer-motion';

export default function AnimatedButton({ children, ...props }: any) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="transition bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-2 rounded shadow-md hover:from-blue-600 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
      {...props}
    >
      {children}
    </motion.button>
  );
}
