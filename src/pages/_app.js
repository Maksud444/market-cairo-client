import { useEffect } from 'react';
import '../styles/globals.css';
import Head from 'next/head';
import { Toaster } from 'react-hot-toast';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { appWithTranslation } from 'next-i18next';
import nextI18NextConfig from '../../next-i18next.config';
import AuthModal from '../components/AuthModal';
import { useAuthStore } from '../lib/store';
import { useSocketStore } from '../lib/socket';
import Cookies from 'js-cookie';

function MyApp({ Component, pageProps }) {
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';
  const fetchUser = useAuthStore((state) => state.fetchUser);
  const user = useAuthStore((state) => state.user);
  const { connect, disconnect } = useSocketStore();

  // Fetch user data on mount
  useEffect(() => {
    // Only fetch user if we have a token but no user data
    const token = Cookies.get('token');
    if (token && !user) {
      fetchUser();
    }
  }, []);

  // Connect/disconnect socket based on authentication
  useEffect(() => {
    if (user?._id) {
      // User is logged in - connect socket
      connect(user._id);
    } else {
      // User logged out - disconnect socket
      disconnect();
    }

    // Cleanup on unmount
    return () => disconnect();
  }, [user, connect, disconnect]);

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="theme-color" content="#E00000" />
        <link rel="icon" href="/favicon.ico" />
        <title>Market Cairo - Buy & Sell Used Items in Cairo</title>
      </Head>
      <Component {...pageProps} />
      <AuthModal />
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            borderRadius: '10px',
            background: '#333',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
        containerStyle={{
          top: 20,
        }}
        reverseOrder={false}
      />
    </GoogleOAuthProvider>
  );
}

export default appWithTranslation(MyApp, nextI18NextConfig);
