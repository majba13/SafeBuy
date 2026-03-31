import FadeIn from '../../components/FadeIn';
import AnimatedTabs from '../../components/AnimatedTabs';
import { useState } from 'react';

const learningTabs = [
  'Courses', 'Tutorials', 'Webinars', 'Certifications', 'Workshops',
  'Guides', 'Docs', 'Videos', 'Quizzes', 'Practice'
];

export default function Learning() {
  const [tab, setTab] = useState(0);
  return (
    <FadeIn>
      <div className="max-w-3xl mx-auto p-8">
        <h1 className="text-3xl font-bold mb-6">Learning</h1>
        <AnimatedTabs tabs={learningTabs} initial={0} onTabChange={setTab} />
        <div className="mt-8 p-6 bg-gray-100 dark:bg-gray-800 rounded shadow">
          <h2 className="text-xl font-semibold mb-2">{learningTabs[tab]}</h2>
          <p>This is a sample content area for the <b>{learningTabs[tab]}</b>. Add lessons, resources, and interactive content here.</p>
        </div>
      </div>
    </FadeIn>
  );
}
