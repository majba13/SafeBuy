import Head from 'next/head';

import FadeIn from '../components/FadeIn';

export default function Home() {
  return (
    <div>
      <Head>
        <title>SafeBuy Marketplace</title>
      </Head>
      <main className="min-h-screen flex items-center justify-center">
        <FadeIn>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-700 to-purple-600 text-transparent bg-clip-text drop-shadow-lg">Welcome to SafeBuy</h1>
        </FadeIn>
      </main>
    </div>
  );
}
