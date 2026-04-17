import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import '../styles/globals.css';
import Head from 'next/head';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { appWithTranslation } from 'next-i18next';
import nextI18NextConfig from '../../next-i18next.config';
import { useRouter } from 'next/router';
import { useAuthStore, useUIStore } from '../lib/store';
import { useSocketStore } from '../lib/socket';
import Cookies from 'js-cookie';

// Lazy load non-critical components — not needed for first paint
const Toaster = dynamic(() => import('react-hot-toast').then(m => ({ default: m.Toaster })), { ssr: false });
const AuthModal = dynamic(() => import('../components/AuthModal'), { ssr: false });
const SplashScreen = dynamic(() => import('../components/SplashScreen'), { ssr: false });
const VerificationBanner = dynamic(() => import('../components/VerificationBanner'), { ssr: false });

function MyApp({ Component, pageProps }) {
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';
  const fetchUser = useAuthStore((state) => state.fetchUser);
  const user = useAuthStore((state) => state.user);
  const { connect, disconnect } = useSocketStore();
  const { openLoginModal } = useUIStore();
  const router = useRouter();
  const [showSplash, setShowSplash] = useState(false);

  // Show splash screen once per session
  useEffect(() => {
    if (!sessionStorage.getItem('splash_shown')) {
      setShowSplash(true);
      sessionStorage.setItem('splash_shown', '1');
    }
  }, []);

  // Auto-open login modal when ?login=true is in the URL
  useEffect(() => {
    if (router.query.login === 'true') {
      const redirect = router.query.redirect || null;
      openLoginModal(redirect);
      // Clean the query params without reloading
      const { login, redirect: _r, ...rest } = router.query;
      router.replace({ pathname: router.pathname, query: rest }, undefined, { shallow: true });
    }
  }, [router.query.login]);

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
      {showSplash && <SplashScreen onDone={() => setShowSplash(false)} />}
      {user && user.verification?.status !== 'approved' && (
        <VerificationBanner status={user.verification?.status} />
      )}
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#E00000" />
        <link rel="icon" href="/favicon.ico" />
        <title>MySouqify - Buy & Sell Used Items in Cairo</title>
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
