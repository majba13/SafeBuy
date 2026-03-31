import { useState } from 'react';

export default function SidebarMiniToggle({ mini, setMini }: { mini: boolean; setMini: (v: boolean) => void }) {
  return (
    <button
      className="absolute top-4 right-[-18px] z-50 bg-blue-700 hover:bg-blue-900 text-white rounded-full w-8 h-8 flex items-center justify-center shadow focus:outline-none focus:ring-2 focus:ring-blue-400"
      aria-label={mini ? 'Expand sidebar' : 'Collapse sidebar'}
      onClick={() => setMini((v) => !v)}
      tabIndex={0}
    >
      {mini ? (
        <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
      ) : (
        <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
      )}
    </button>
  );
}
