
import Link from 'next/link';
import { sidebarIcons } from './SidebarIcons';
import { sidebarGroups } from './SidebarGroups';
import { useState, useRef } from 'react';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import Avatar from './Avatar';
import ThemeToggle from './ThemeToggle';
import SidebarMiniToggle from './SidebarMiniToggle';

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const [search, setSearch] = useState('');
  const [mini, setMini] = useState(false);
  const router = useRouter();
  const user = useSelector((state: any) => state.auth?.user);
  const navRef = useRef<HTMLDivElement>(null);

  const toggleGroup = (label: string) => {
    setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  // Keyboard navigation for sidebar links
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const focusable = navRef.current?.querySelectorAll('a,button');
    if (!focusable || focusable.length === 0) return;
    const focusArr = Array.from(focusable) as HTMLElement[];
    const idx = focusArr.indexOf(document.activeElement as HTMLElement);
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = focusArr[(idx + 1) % focusArr.length];
      next?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prev = focusArr[(idx - 1 + focusArr.length) % focusArr.length];
      prev?.focus();
    } else if (e.key === 'ArrowRight') {
      // Expand group if focused on group button
      if (document.activeElement?.tagName === 'BUTTON') {
        const label = (document.activeElement as HTMLElement).textContent?.trim().split(' ')[0];
        if (label && openGroups[label] === false) toggleGroup(label);
      }
    } else if (e.key === 'ArrowLeft') {
      // Collapse group if focused on group button
      if (document.activeElement?.tagName === 'BUTTON') {
        const label = (document.activeElement as HTMLElement).textContent?.trim().split(' ')[0];
        if (label && openGroups[label] !== false) toggleGroup(label);
      }
    }
  };

  // Filtered groups based on search
  const filteredGroups = sidebarGroups.map((group) => ({
    ...group,
    items: group.items.filter((s) =>
      s.label.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter((group) => group.items.length > 0);

  // Example badges for demo
  const badges: Record<string, number | undefined> = {
    Notifications: 7,
    Cart: 3,
    Messages: 2,
    Orders: 1,
  };

  return (
    <aside
      className={`hidden md:flex flex-col ${mini ? 'w-16' : 'w-60'} bg-gradient-to-b from-blue-800 to-purple-800 text-white min-h-screen py-8 px-2 sticky top-0 shadow-xl transition-all duration-300`}
      aria-label="Sidebar"
      role="navigation"
    >
      <SidebarMiniToggle mini={mini} setMini={setMini} />
      {/* User Profile */}
      <div className={`flex flex-col items-center mb-6 transition-all duration-300 ${mini ? 'opacity-0 h-0 pointer-events-none' : 'opacity-100 h-auto'}`} aria-hidden={mini}>
        <Avatar src={user?.avatar} alt={user?.name} size={mini ? 32 : 56} />
        <div className="mt-2 font-semibold text-lg">{user?.name || 'Guest'}</div>
        <div className="text-xs text-blue-200">{user?.email || 'Not logged in'}</div>
      </div>
      {/* Search/filter */}
      {!mini && (
        <div className="mb-4">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search..."
            className="w-full px-3 py-2 rounded bg-blue-900 text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
            aria-label="Sidebar search"
          />
        </div>
      )}
      {!mini && <ThemeToggle />}
      <nav
        className={`flex flex-col gap-4 overflow-y-auto flex-1 mt-4 ${mini ? 'items-center' : ''}`}
        ref={navRef}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        aria-label="Sidebar navigation"
        role="menu"
      >
        {filteredGroups.map((group) => (
          <div key={group.label}>
            <button
              className={`w-full flex items-center justify-between text-xs uppercase tracking-wider font-bold text-blue-200 hover:text-white mb-1 px-2 py-1 focus:outline-none focus:bg-blue-900 rounded transition-colors ${mini ? 'justify-center px-0' : ''}`}
              onClick={() => toggleGroup(group.label)}
              aria-expanded={openGroups[group.label] ?? true}
              tabIndex={0}
              aria-controls={`sidebar-group-${group.label}`}
              role="menuitem"
            >
              <span className={mini ? 'sr-only' : ''}>{group.label}</span>
              <span className={mini ? 'sr-only' : ''}>{openGroups[group.label] === false ? '+' : '-'}</span>
            </button>
            <div
              id={`sidebar-group-${group.label}`}
              className={`flex flex-col gap-1 pl-2 overflow-hidden transition-all duration-300 ${openGroups[group.label] === false ? 'max-h-0 opacity-0' : 'max-h-96 opacity-100'} ${mini ? 'items-center' : ''}`}
              style={{ willChange: 'max-height, opacity' }}
              aria-hidden={openGroups[group.label] === false}
              role="group"
            >
              {group.items.map((s) => (
                <Link
                  key={s.href}
                  href={s.href}
                  className={`rounded px-3 py-2 flex items-center gap-2 hover:bg-blue-900 focus:bg-blue-900 active:bg-blue-950 transition-colors relative ${router.pathname.startsWith(s.href) ? 'bg-blue-900 font-semibold' : ''} ${mini ? 'justify-center px-0' : ''}`}
                  tabIndex={0}
                  aria-label={s.label}
                  role="menuitem"
                >
                  {sidebarIcons[s.label]}
                  {!mini && <span>{s.label}</span>}
                  {badges[s.label] && (
                    <span className={`ml-auto bg-pink-500 text-xs px-2 py-0.5 rounded-full font-bold animate-pulse ${mini ? 'absolute top-1 right-1' : ''}`}>
                      {badges[s.label]}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
