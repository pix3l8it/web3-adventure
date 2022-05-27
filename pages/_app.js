import '../styles/globals.css';
import Link from 'next/link';
import { useRouter } from 'next/router';
import NavBar from './navbar.js'

function MyApp({ Component, pageProps }) {
  const router = useRouter();

  return (
    <div className="bg-gray-800 flex flex-col h-screen font-mono">
      <NavBar />
      <Component {...pageProps} />
    </div>
  );
};

export default MyApp;
