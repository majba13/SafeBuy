import { useRouter } from 'next/router';
import FadeIn from '../../components/FadeIn';

export default function ReportType() {
  const router = useRouter();
  const { type } = router.query;
  return (
    <FadeIn>
      <div className="max-w-2xl mx-auto p-8">
        <h1 className="text-2xl font-bold mb-4">Report: {type}</h1>
        <div className="mt-8 p-6 bg-gray-100 dark:bg-gray-800 rounded shadow">
          <h2 className="text-xl font-semibold mb-2">{type} Details</h2>
          <p>This is a sample content area for the <b>{type}</b> report. Add charts, tables, and analytics here.</p>
        </div>
      </div>
    </FadeIn>
  );
}
