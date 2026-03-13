'use client';

import { Star } from 'lucide-react';

type RatingStarsProps = {
  rating: number;
  count?: number;
  size?: number;
  showValue?: boolean;
};

export default function RatingStars({ rating, count, size = 14, showValue = false }: RatingStarsProps) {
  const rounded = Math.round(rating || 0);

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5 text-amber-500">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} size={size} fill={i < rounded ? 'currentColor' : 'none'} />
        ))}
      </div>
      {showValue ? <span className="text-xs text-muted">{(rating || 0).toFixed(1)}</span> : null}
      {typeof count === 'number' ? <span className="text-xs text-muted">({count})</span> : null}
    </div>
  );
}
