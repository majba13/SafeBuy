import React, { useState } from 'react';
import TabbedSection, { TabConfig } from '../../components/TabbedSection';
import Modal from '../../components/Modal';
import AnimatedAccordion from '../../components/AnimatedAccordion';

const tabNames = [
  'Overview', 'Analytics', 'Sales', 'Customers', 'Products', 'Orders', 'Reviews', 'Support', 'Settings', 'Integrations',
  'Marketing', 'Finance', 'Reports', 'Inventory', 'Shipping', 'Returns', 'Discounts', 'Affiliates', 'Messages', 'Notifications',
  'Team', 'Roles', 'Permissions', 'API', 'Logs', 'Security', 'Billing', 'Subscriptions', 'Invoices', 'Tax',
  'Compliance', 'Legal', 'Feedback', 'Roadmap', 'Changelog', 'Beta', 'Labs', 'Themes', 'Appearance', 'Accessibility',
  'Mobile', 'Webhooks', 'Exports', 'Imports', 'Backups', 'Restore', 'Data', 'GDPR', 'Audit', 'History',
  'Tasks', 'Calendar', 'Events', 'Goals', 'Milestones', 'Projects', 'Kanban', 'Gantt', 'Sprints', 'Time Tracking',
  'Documents', 'Files', 'Media', 'Assets', 'Brand', 'SEO', 'Domains', 'DNS', 'SSL', 'CDN',
  'Performance', 'Uptime', 'Status', 'Monitoring', 'Alerts', 'Escalations', 'Incidents', 'Maintenance', 'Deployments', 'Releases',
  'Environments', 'Staging', 'Production', 'Sandbox', 'Testing', 'QA', 'DevOps', 'CI/CD', 'Pipelines', 'Integrations 2',
  'Marketplace', 'Partners', 'Vendors', 'Suppliers', 'Procurement', 'Inventory 2', 'Warehouse', 'Logistics', 'Fleet', 'Tracking',
  'Returns 2', 'Refunds', 'Disputes', 'Chargebacks', 'Compliance 2', 'Legal 2', 'Feedback 2', 'Roadmap 2', 'Changelog 2', 'Beta 2'
];

export default function Dashboard() {
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const tabs: TabConfig[] = tabNames.map((name, idx) => ({
    label: name,
    content: (
      <p>This is the content area for the <b>{name}</b> tab. Implement features and UI for this section here.</p>
    ),
    modal: idx === activeTab ? (
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={name + ' Info'}>
        <p>This is a modal for the <b>{name}</b> tab. You can add more details or actions here.</p>
      </Modal>
    ) : undefined,
    accordion: idx === activeTab ? (
      <div className="my-8">
        <button className="bg-blue-600 text-white px-4 py-2 rounded mb-4" onClick={() => setModalOpen(true)}>
          Show Info
        </button>
        <AnimatedAccordion items={[
          { title: `What is the ${name} tab?`, content: `This is the ${name} section. Here you can manage all related features.` },
          { title: 'How to use tabs?', content: 'Click on any tab to switch between dashboard sections instantly.' },
          { title: 'Can I customize tabs?', content: 'Yes, you can add, remove, or reorder tabs as needed.' },
        ]} />
      </div>
    ) : undefined,
  }));
  return (
    <TabbedSection
      title="Mega Dashboard"
      tabs={tabs}
      initialTab={0}
      className=""
      // Ensure activeTab is updated on tab change
      // @ts-ignore
      onTabChange={setActiveTab}
    />
  );
}
