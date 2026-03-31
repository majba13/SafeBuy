import '../styles/globals.css';
import '../styles/custom.css';
import type { AppProps } from 'next/app';
import { Provider } from 'react-redux';
import { store } from '../redux/store';

import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';


function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Provider store={store}>
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900 transition-colors">
          <Component {...pageProps} />
        </main>
      </div>
    </Provider>
  );
}

export default MyApp;
