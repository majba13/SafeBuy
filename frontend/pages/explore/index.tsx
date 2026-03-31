import FadeIn from '../../components/FadeIn';
import AnimatedTabs from '../../components/AnimatedTabs';
import { useState } from 'react';

const exploreTabs = [
  'Trending', 'Categories', 'Collections', 'New Arrivals', 'Top Rated',
  'Deals', 'Brands', 'Editors Picks', 'For You', 'All Products'
];

export default function Explore() {
  const [tab, setTab] = useState(0);
  return (
    <FadeIn>
      <div className="max-w-3xl mx-auto p-8">
        <h1 className="text-3xl font-bold mb-6">Explore</h1>
        <AnimatedTabs tabs={exploreTabs} initial={0} onTabChange={setTab} />
        <div className="mt-8 p-6 bg-gray-100 dark:bg-gray-800 rounded shadow">
          <h2 className="text-xl font-semibold mb-2">{exploreTabs[tab]}</h2>
          <p>This is a sample content area for the <b>{exploreTabs[tab]}</b>. Add discovery features here.</p>
        </div>
      </div>
    </FadeIn>
  );
}
