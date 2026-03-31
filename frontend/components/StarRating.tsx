import { useState } from 'react';

export default function StarRating({ rating, onRate, size = 24, interactive = false }: {
  rating: number;
  onRate?: (r: number) => void;
  size?: number;
  interactive?: boolean;
}) {
  const [hovered, setHovered] = useState<number | null>(null);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill={(hovered ?? rating) >= star ? '#fbbf24' : '#e5e7eb'}
          stroke="#f59e42"
          className={interactive ? 'cursor-pointer' : ''}
          onMouseEnter={() => interactive && setHovered(star)}
          onMouseLeave={() => interactive && setHovered(null)}
          onClick={() => interactive && onRate && onRate(star)}
        >
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
        </svg>
      ))}
    </div>
  );
}
