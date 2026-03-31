import { motion } from 'framer-motion';

export default function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <motion.div
      className="mb-6 text-center"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-1">
        {title}
      </h2>
      {subtitle && <p className="text-gray-500 dark:text-gray-300 text-base">{subtitle}</p>}
    </motion.div>
  );
}
