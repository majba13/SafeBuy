import { Product } from '../types';
import AnimatedButton from './AnimatedButton';
import { motion } from 'framer-motion';

export default function ProductCard({ product, onAddToCart }: { product: Product; onAddToCart: (id: string) => void }) {
  return (
    <motion.div
      className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-4 flex flex-col hover:shadow-xl transition-shadow duration-300"
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
    >
      <img
        src={product.image}
        alt={product.name}
        className="w-full h-48 object-cover rounded mb-3"
        loading="lazy"
      />
      <h3 className="font-semibold text-lg mb-1 truncate">{product.name}</h3>
      <p className="text-gray-500 dark:text-gray-300 text-sm mb-2 line-clamp-2">{product.description}</p>
      <div className="flex items-center justify-between mt-auto">
        <span className="font-bold text-blue-600 dark:text-blue-400 text-lg">${product.price.toFixed(2)}</span>
        <AnimatedButton onClick={() => onAddToCart(product._id)}>
          Add to Cart
        </AnimatedButton>
      </div>
    </motion.div>
  );
}
