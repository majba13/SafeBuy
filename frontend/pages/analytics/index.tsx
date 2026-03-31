import TabbedSection, { TabConfig } from '../../components/TabbedSection';

const analyticsTabs = [
  'Overview', 'Real-Time', 'Audience', 'Acquisition', 'Behavior',
  'Conversions', 'Funnels', 'Cohorts', 'Retention', 'Custom Analytics'
];

const tabs: TabConfig[] = analyticsTabs.map(name => ({
  label: name,
  content: (
    <p>This is a sample content area for the <b>{name}</b>. Add graphs, metrics, and insights here.</p>
  ),
}));

export default function Analytics() {
  return (
    <TabbedSection
      title="Analytics"
      tabs={tabs}
      initialTab={0}
      className="max-w-3xl"
    />
  );
}
