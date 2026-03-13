import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '../lib/store';
import toast from 'react-hot-toast';

/**
 * Higher-Order Component to protect admin-only routes
 * Waits for Zustand persist hydration before checking auth
 */
export function withAdmin(Component) {
  return function AdminProtectedRoute(props) {
    const router = useRouter();
    const { isAuthenticated, user } = useAuthStore();
    const [hasHydrated, setHasHydrated] = useState(false);

    useEffect(() => {
      // Check if Zustand persist store has already hydrated
      if (useAuthStore.persist.hasHydrated()) {
        setHasHydrated(true);
      } else {
        // Wait for hydration to complete
        const unsub = useAuthStore.persist.onFinishHydration(() => {
          setHasHydrated(true);
        });
        // Fallback timeout in case hydration event doesn't fire
        const timer = setTimeout(() => setHasHydrated(true), 1000);
        return () => {
          unsub();
          clearTimeout(timer);
        };
      }
    }, []);

    useEffect(() => {
      if (!hasHydrated) return;

      if (!isAuthenticated || !user) {
        toast.error('Please login to access this page');
        router.push('/');
      } else if (!user.isAdmin) {
        toast.error('Access denied. Admin privileges required.');
        router.push('/');
      }
    }, [hasHydrated, isAuthenticated, user]);

    // Show loading spinner until hydrated and confirmed admin
    if (!hasHydrated || !isAuthenticated || !user || !user.isAdmin) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Checking access...</p>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };
}
