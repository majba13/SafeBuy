import FadeIn from '../../components/FadeIn';
import AnimatedTabs from '../../components/AnimatedTabs';
import { useState } from 'react';

const reportTabs = [
  'Sales Report', 'User Report', 'Product Report', 'Order Report', 'Revenue Report',
  'Refund Report', 'Inventory Report', 'Traffic Report', 'Conversion Report', 'Custom Report'
];

export default function Reports() {
  const [tab, setTab] = useState(0);
  return (
    <FadeIn>
      <div className="max-w-3xl mx-auto p-8">
        <h1 className="text-3xl font-bold mb-6">Reports</h1>
        <AnimatedTabs tabs={reportTabs} initial={0} onTabChange={setTab} />
        <div className="mt-8 p-6 bg-gray-100 dark:bg-gray-800 rounded shadow">
          <h2 className="text-xl font-semibold mb-2">{reportTabs[tab]}</h2>
          <p>This is a sample content area for the <b>{reportTabs[tab]}</b>. Add charts, tables, and analytics here.</p>
        </div>
      </div>
    </FadeIn>
  );
}
