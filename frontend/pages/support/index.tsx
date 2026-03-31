import FadeIn from '../../components/FadeIn';
import AnimatedTabs from '../../components/AnimatedTabs';
import { useState } from 'react';

const supportTabs = [
  'Help Center', 'Contact', 'FAQ', 'Live Chat', 'Tickets',
  'Guides', 'Policies', 'Feedback', 'Community', 'Updates'
];

export default function Support() {
  const [tab, setTab] = useState(0);
  return (
    <FadeIn>
      <div className="max-w-3xl mx-auto p-8">
        <h1 className="text-3xl font-bold mb-6">Support</h1>
        <AnimatedTabs tabs={supportTabs} initial={0} onTabChange={setTab} />
        <div className="mt-8 p-6 bg-gray-100 dark:bg-gray-800 rounded shadow">
          <h2 className="text-xl font-semibold mb-2">{supportTabs[tab]}</h2>
          <p>This is a sample content area for the <b>{supportTabs[tab]}</b>. Add support resources here.</p>
        </div>
      </div>
    </FadeIn>
  );
}
