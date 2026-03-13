'use client';

import { useMemo, useState } from 'react';
import { Search, Clock3, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { useDebounce } from '@/hooks/useDebounce';
import { useUiStore } from '@/store/ui-store';
import type { SearchSuggestion } from '@/types/marketplace';

const POPULAR_SEARCHES = ['iphone 15', 'smart watch', 'wireless earbuds', 'gaming laptop'];

export default function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [focus, setFocus] = useState(false);
  const debounced = useDebounce(query, 250);
  const { recentSearches, addRecentSearch } = useUiStore();

  const { data } = useQuery({
    queryKey: ['search-suggestions', debounced],
    queryFn: async () => {
      if (!debounced.trim()) return [] as SearchSuggestion[];
      const result = await apiFetch<{ suggestions: SearchSuggestion[] }>(`/ai/search-suggestions?q=${encodeURIComponent(debounced)}`);
      return result.suggestions ?? [];
    },
    enabled: debounced.trim().length > 1,
  });

  const suggestions = useMemo(() => data || [], [data]);

  const runSearch = (value: string) => {
    const cleaned = value.trim();
    if (!cleaned) return;
    addRecentSearch(cleaned);
    setFocus(false);
    router.push(`/search?q=${encodeURIComponent(cleaned)}`);
  };

  return (
    <div className="relative w-full">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          runSearch(query);
        }}
        className="relative"
      >
        <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocus(true)}
          placeholder="Search products, brands, categories..."
          className="h-11 w-full rounded-2xl border border-border bg-white pl-10 pr-4 text-sm outline-none ring-primary/20 transition focus:ring"
        />
      </form>

      {focus ? (
        <div className="absolute top-[48px] z-50 w-full rounded-2xl border border-border bg-white p-3 shadow-xl">
          {suggestions.length ? (
            <div className="space-y-1">
              {suggestions.slice(0, 6).map((item) => (
                <button
                  key={item._id}
                  onMouseDown={() => runSearch(item.title)}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-text-primary hover:bg-slate-50"
                >
                  <Search size={14} className="text-slate-400" />
                  {item.title}
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-text-secondary">
                  <Clock3 size={13} /> Recent searches
                </p>
                <div className="flex flex-wrap gap-2">
                  {(recentSearches.length ? recentSearches : ['headphones', 'sneakers']).map((item) => (
                    <button
                      key={item}
                      onMouseDown={() => runSearch(item)}
                      className="rounded-full border border-border px-3 py-1 text-xs text-text-secondary hover:border-primary hover:text-primary"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-text-secondary">
                  <TrendingUp size={13} /> Popular
                </p>
                <div className="flex flex-wrap gap-2">
                  {POPULAR_SEARCHES.map((item) => (
                    <button
                      key={item}
                      onMouseDown={() => runSearch(item)}
                      className="rounded-full border border-border px-3 py-1 text-xs text-text-secondary hover:border-primary hover:text-primary"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
