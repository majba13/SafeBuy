import { motion } from 'framer-motion';
import AnimatedButton from './AnimatedButton';

export default function HeroSection({
  title,
  subtitle,
  image,
  ctaText,
  onCtaClick,
}: {
  title: string;
  subtitle?: string;
  image?: string;
  ctaText?: string;
  onCtaClick?: () => void;
}) {
  return (
    <section className="flex flex-col md:flex-row items-center justify-between py-12 md:py-20 gap-8">
      <motion.div
        className="flex-1 text-center md:text-left"
        initial={{ opacity: 0, x: -40 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
      >
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          {title}
        </h1>
        {subtitle && <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-6">{subtitle}</p>}
        {ctaText && onCtaClick && (
          <AnimatedButton onClick={onCtaClick}>{ctaText}</AnimatedButton>
        )}
      </motion.div>
      {image && (
        <motion.img
          src={image}
          alt="Hero"
          className="flex-1 max-w-xs md:max-w-md rounded-lg shadow-xl"
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        />
      )}
    </section>
  );
}
