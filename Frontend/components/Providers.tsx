'use client';
import { useState } from 'react';
import { Provider } from 'react-redux';
import { QueryClientProvider } from '@tanstack/react-query';
import { store } from '@/store';
import { createQueryClient } from '@/lib/query-client';
import { Toaster } from 'react-hot-toast';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => createQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3200,
            style: { background: '#111827', color: '#f8fafc', borderRadius: '12px', border: '1px solid #1f2937' },
            success: { style: { background: '#10B981', color: '#f8fafc' } },
            error: { style: { background: '#EF4444', color: '#f8fafc' } },
          }}
        />
      </Provider>
    </QueryClientProvider>
  );
}
