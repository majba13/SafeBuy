import { useState, ReactNode } from 'react';
import AnimatedTabs from './AnimatedTabs';
import FadeIn from './FadeIn';

export interface TabConfig {
  label: string;
  content: ReactNode | (() => ReactNode);
  modal?: ReactNode;
  accordion?: ReactNode;
}

interface TabbedSectionProps {
  title: string;
  tabs: TabConfig[];
  initialTab?: number;
  className?: string;
}

export default function TabbedSection({ title, tabs, initialTab = 0, className = '' }: TabbedSectionProps) {
  const [tab, setTab] = useState(initialTab);
  const currentTab = tabs[tab];
  return (
    <FadeIn>
      <div className={`w-full max-w-4xl mx-auto p-8 ${className}`}>
        <h1 className="text-3xl font-bold mb-6">{title}</h1>
        <AnimatedTabs tabs={tabs.map(t => t.label)} initial={initialTab} onTabChange={setTab} />
        {currentTab.modal}
        {currentTab.accordion}
        <div className="mt-8 p-6 bg-gray-100 dark:bg-gray-800 rounded shadow">
          <h2 className="text-xl font-semibold mb-2">{currentTab.label} Content</h2>
          {typeof currentTab.content === 'function' ? currentTab.content() : currentTab.content}
        </div>
      </div>
    </FadeIn>
  );
}
