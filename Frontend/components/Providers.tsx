'use client';
import { Provider } from 'react-redux';
import { store } from '@/store';
import { Toaster } from 'react-hot-toast';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: { background: '#363636', color: '#fff', borderRadius: '8px' },
          success: { style: { background: '#16a34a' } },
          error: { style: { background: '#dc2626' } },
        }}
      />
    </Provider>
  );
}
