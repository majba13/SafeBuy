import TabbedSection, { TabConfig } from '../../components/TabbedSection';

const accountTabs = [
  'Profile', 'Security', 'Preferences', 'Addresses', 'Payment Methods',
  'Orders', 'Wishlist', 'Subscriptions', 'Notifications', 'Settings'
];

const tabs: TabConfig[] = accountTabs.map(name => ({
  label: name,
  content: (
    <p>This is a sample content area for the <b>{name}</b>. Add account management features here.</p>
  ),
}));

export default function Account() {
  return (
    <TabbedSection
      title="Account"
      tabs={tabs}
      initialTab={0}
      className="max-w-3xl"
    />
  );
}
