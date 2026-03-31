import FadeIn from '../../components/FadeIn';
import AnimatedTabs from '../../components/AnimatedTabs';
import { useState } from 'react';

const mediaTabs = [
  'Gallery', 'Videos', 'Audio', 'Documents', 'Uploads',
  'Downloads', 'Favorites', 'Shared', 'Recent', 'Archive'
];

export default function Media() {
  const [tab, setTab] = useState(0);
  return (
    <FadeIn>
      <div className="max-w-3xl mx-auto p-8">
        <h1 className="text-3xl font-bold mb-6">Media</h1>
        <AnimatedTabs tabs={mediaTabs} initial={0} onTabChange={setTab} />
        <div className="mt-8 p-6 bg-gray-100 dark:bg-gray-800 rounded shadow">
          <h2 className="text-xl font-semibold mb-2">{mediaTabs[tab]}</h2>
          <p>This is a sample content area for the <b>{mediaTabs[tab]}</b>. Add media management features here.</p>
        </div>
      </div>
    </FadeIn>
  );
}
