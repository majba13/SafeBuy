import FadeIn from '../../components/FadeIn';
import AnimatedTabs from '../../components/AnimatedTabs';
import Modal from '../../components/Modal';
import AnimatedAccordion from '../../components/AnimatedAccordion';
import { useState } from 'react';

const workspaceTabs = Array.from({ length: 50 }, (_, i) => `Workspace Tab ${i + 1}`);

export default function Workspace() {
  const [tab, setTab] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <FadeIn>
      <div className="max-w-4xl mx-auto p-8">
        <h1 className="text-3xl font-bold mb-6">Workspace</h1>
        <AnimatedTabs tabs={workspaceTabs} initial={0} onTabChange={setTab} />
        <div className="my-8">
          <button className="bg-blue-600 text-white px-4 py-2 rounded mb-4" onClick={() => setModalOpen(true)}>
            Show Info
          </button>
          <AnimatedAccordion items={[
            { title: `What is ${workspaceTabs[tab]}?`, content: `This is the ${workspaceTabs[tab]} section. Add your workspace features here.` },
            { title: 'How to use workspace tabs?', content: 'Switch between tabs to access different workspace features.' },
          ]} />
        </div>
        <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={workspaceTabs[tab] + ' Info'}>
          <p>This is a modal for <b>{workspaceTabs[tab]}</b>. Add more details or actions here.</p>
        </Modal>
        <div className="mt-8 p-6 bg-gray-100 dark:bg-gray-800 rounded shadow">
          <h2 className="text-xl font-semibold mb-2">{workspaceTabs[tab]} Content</h2>
          <p>This is the content area for <b>{workspaceTabs[tab]}</b>. Implement features and UI for this section here.</p>
        </div>
      </div>
    </FadeIn>
  );
}
