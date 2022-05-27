import '../styles/globals.css';
import NavBar from './navbar.js'

function MyApp({ Component, pageProps }) {

  return (
    <div className="bg-gray-800 flex flex-col h-screen font-mono">
      <NavBar />
      <Component {...pageProps} />
    </div>
  );
};

export default MyApp;
