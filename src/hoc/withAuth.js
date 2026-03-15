import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '../lib/store';
import toast from 'react-hot-toast';

/**
 * Higher-Order Component to protect routes that require authentication
 * Waits for Zustand persist hydration before checking auth state
 */
export function withAuth(Component) {
  return function ProtectedRoute(props) {
    const router = useRouter();
    const { isAuthenticated, user, _hasHydrated } = useAuthStore();
    const [hydrated, setHydrated] = useState(false);

    useEffect(() => {
      // If store already hydrated synchronously, mark immediately
      if (_hasHydrated) {
        setHydrated(true);
        return;
      }
      // Otherwise poll until hydrated (max ~1s)
      const interval = setInterval(() => {
        if (useAuthStore.getState()._hasHydrated) {
          setHydrated(true);
          clearInterval(interval);
        }
      }, 50);
      const timeout = setTimeout(() => {
        clearInterval(interval);
        setHydrated(true); // fallback
      }, 1000);
      return () => { clearInterval(interval); clearTimeout(timeout); };
    }, [_hasHydrated]);

    useEffect(() => {
      if (!hydrated) return;
      if (!isAuthenticated || !user) {
        toast.error('Please login to access this page');
        router.push('/');
      }
    }, [hydrated, isAuthenticated, user]);

    // Show spinner while waiting for hydration
    if (!hydrated || !isAuthenticated || !user) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Checking authentication...</p>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };
}
