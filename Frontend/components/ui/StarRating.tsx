import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  count?: number;
  maxStars?: number;
  size?: number;
  showCount?: boolean;
}

export default function StarRating({ rating, count, maxStars = 5, size = 14, showCount = true }: StarRatingProps) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: maxStars }).map((_, i) => {
        const filled = i + 1 <= Math.floor(rating);
        const partial = !filled && i < rating;
        return (
          <span key={i} className="relative inline-block" style={{ width: size, height: size }}>
            <Star
              size={size}
              className="text-gray-200"
              fill="currentColor"
            />
            {(filled || partial) && (
              <span
                className="absolute inset-0 overflow-hidden"
                style={{ width: partial ? `${(rating % 1) * 100}%` : '100%' }}
              >
                <Star size={size} className="text-yellow-400" fill="currentColor" />
              </span>
            )}
          </span>
        );
      })}
      {showCount && count !== undefined && (
        <span className="text-xs text-gray-500 ml-0.5">({count.toLocaleString()})</span>
      )}
    </div>
  );
}
