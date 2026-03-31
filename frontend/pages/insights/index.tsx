import FadeIn from '../../components/FadeIn';
import AnimatedTabs from '../../components/AnimatedTabs';
import { useState } from 'react';

const insightsTabs = [
  'Overview', 'Trends', 'Benchmarks', 'Forecasts', 'Comparisons',
  'Opportunities', 'Risks', 'Highlights', 'Deep Dives', 'Custom Insights'
];

export default function Insights() {
  const [tab, setTab] = useState(0);
  return (
    <FadeIn>
      <div className="max-w-3xl mx-auto p-8">
        <h1 className="text-3xl font-bold mb-6">Insights</h1>
        <AnimatedTabs tabs={insightsTabs} initial={0} onTabChange={setTab} />
        <div className="mt-8 p-6 bg-gray-100 dark:bg-gray-800 rounded shadow">
          <h2 className="text-xl font-semibold mb-2">{insightsTabs[tab]}</h2>
          <p>This is a sample content area for the <b>{insightsTabs[tab]}</b>. Add insights and analytics here.</p>
        </div>
      </div>
    </FadeIn>
  );
}
