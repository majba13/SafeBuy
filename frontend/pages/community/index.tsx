import FadeIn from '../../components/FadeIn';
import AnimatedTabs from '../../components/AnimatedTabs';
import { useState } from 'react';

const communityTabs = [
  'Forum', 'Q&A', 'Events', 'Groups', 'Leaderboard',
  'Mentors', 'Resources', 'News', 'Feedback', 'Help Center'
];

export default function Community() {
  const [tab, setTab] = useState(0);
  return (
    <FadeIn>
      <div className="max-w-3xl mx-auto p-8">
        <h1 className="text-3xl font-bold mb-6">Community</h1>
        <AnimatedTabs tabs={communityTabs} initial={0} onTabChange={setTab} />
        <div className="mt-8 p-6 bg-gray-100 dark:bg-gray-800 rounded shadow">
          <h2 className="text-xl font-semibold mb-2">{communityTabs[tab]}</h2>
          <p>This is a sample content area for the <b>{communityTabs[tab]}</b>. Add posts, discussions, and user content here.</p>
        </div>
      </div>
    </FadeIn>
  );
}
