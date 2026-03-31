import { useRouter } from 'next/router';
import FadeIn from '../../../components/FadeIn';
import Modal from '../../../components/Modal';
import { useState } from 'react';

export default function ProjectTab() {
  const router = useRouter();
  const { project } = router.query;
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <FadeIn>
      <div className="max-w-2xl mx-auto p-8">
        <h1 className="text-2xl font-bold mb-4">Project: {project}</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded mb-4" onClick={() => setModalOpen(true)}>
          Show Info
        </button>
        <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={`Info for ${project}`}>
          <p>This is a modal for the <b>{project}</b> project tab. Add more details or actions here.</p>
        </Modal>
        <div className="mt-8 p-6 bg-gray-100 dark:bg-gray-800 rounded shadow">
          <h2 className="text-xl font-semibold mb-2">{project} Content</h2>
          <p>This is the content area for the <b>{project}</b> project. Implement features and UI for this section here.</p>
        </div>
      </div>
    </FadeIn>
  );
}
