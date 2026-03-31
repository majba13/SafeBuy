import { useEffect, useState } from 'react';
import { apiFetch } from '../../utils/api';
import TabbedSection, { TabConfig } from '../../components/TabbedSection';
import Loader from '../../components/Loader';
import EmptyState from '../../components/EmptyState';
import Modal from '../../components/Modal';
import AnimatedAccordion from '../../components/AnimatedAccordion';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    setStatus('loading');
    apiFetch('/admin/dashboard')
      .then(setStats)
      .catch(e => setError(e.message))
      .finally(() => setStatus('idle'));
  }, []);

  const tabNames = ["Overview", "Users", "Sellers", "Products", "Orders", "Payments"];
  const tabs: TabConfig[] = tabNames.map((name, idx) => ({
    label: name,
    content: (
      <>
        {status === 'loading' && <Loader />}
        {error && <EmptyState message={error} />}
        {stats && idx === 0 && (
          <ul className="mb-6">
            <li>Users: {stats.users}</li>
            <li>Sellers: {stats.sellers}</li>
            <li>Products: {stats.products}</li>
            <li>Orders: {stats.orders}</li>
            <li>Payments: {stats.payments}</li>
          </ul>
        )}
        {idx === 0 && (
          <>
            <button className="bg-blue-600 text-white px-4 py-2 rounded mb-4" onClick={() => setModalOpen(true)}>Show Info</button>
            <AnimatedAccordion items={[
              { title: 'How are stats calculated?', content: 'Stats are aggregated from all marketplace activity in real time.' },
              { title: 'How to manage users?', content: 'Go to the Users tab to view, edit, or remove users.' },
              { title: 'How to resolve disputes?', content: 'Check the Orders tab for flagged orders and use the dispute resolution tools.' },
            ]} />
          </>
        )}
        <div className="mt-8 p-6 bg-gray-100 dark:bg-gray-800 rounded shadow">
          <h2 className="text-xl font-semibold mb-2">{name} Content</h2>
          <p>This is the content area for the <b>{name}</b> tab. Implement features and UI for this section here.</p>
        </div>
      </>
    ),
    modal: idx === activeTab ? (
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={name + ' Info'}>
        <p>This is a modal for the <b>{name}</b> tab. You can add more details or actions here.</p>
      </Modal>
    ) : undefined,
  }));

  return (
    <TabbedSection
      title="Admin Dashboard"
      tabs={tabs}
      initialTab={0}
      className="max-w-xl"
    />
  );
}
          <AnimatedAccordion items={accordionItems} />
        </>}
        <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Admin Info">
          <p>This is a demo modal for admin dashboard actions and information.</p>
        </Modal>
      </div>
    </FadeIn>
  );
}
