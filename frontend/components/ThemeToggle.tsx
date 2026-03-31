import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [dark]);

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark') setDark(true);
  }, []);

  return (
    <button
      className={`mt-4 w-full flex items-center justify-center gap-2 px-3 py-2 rounded bg-blue-900 hover:bg-blue-700 transition-colors text-white font-semibold`}
      onClick={() => setDark((v) => !v)}
      aria-label="Toggle dark mode"
    >
      {dark ? (
        <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z" fill="currentColor" /></svg>
      ) : (
        <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M12 3v2m0 14v2m9-9h-2M5 12H3m15.364-6.364l-1.414 1.414M6.343 17.657l-1.414 1.414m12.728 0l-1.414-1.414M6.343 6.343L4.929 4.929" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
      )}
      <span>{dark ? 'Dark' : 'Light'} Mode</span>
    </button>
  );
}
