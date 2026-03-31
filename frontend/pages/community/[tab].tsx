import { useRouter } from 'next/router';
import FadeIn from '../../components/FadeIn';

export default function CommunityTab() {
  const router = useRouter();
  const { tab } = router.query;
  return (
    <FadeIn>
      <div className="max-w-2xl mx-auto p-8">
        <h1 className="text-2xl font-bold mb-4">Community: {tab}</h1>
        <div className="mt-8 p-6 bg-gray-100 dark:bg-gray-800 rounded shadow">
          <h2 className="text-xl font-semibold mb-2">{tab} Content</h2>
          <p>This is a sample content area for the <b>{tab}</b> community section. Add posts, discussions, and user content here.</p>
        </div>
      </div>
    </FadeIn>
  );
}
