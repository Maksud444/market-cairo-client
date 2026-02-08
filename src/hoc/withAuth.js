import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '../lib/store';
import toast from 'react-hot-toast';

/**
 * Higher-Order Component to protect routes that require authentication
 * Redirects to home page if user is not logged in
 */
export function withAuth(Component) {
  return function ProtectedRoute(props) {
    const router = useRouter();
    const { isAuthenticated, user } = useAuthStore();
    const [hasChecked, setHasChecked] = useState(false);

    useEffect(() => {
      // Wait a moment for store to hydrate from localStorage
      const timer = setTimeout(() => {
        setHasChecked(true);

        if (!isAuthenticated || !user) {
          toast.error('Please login to access this page');
          router.push('/');
        }
      }, 100);

      return () => clearTimeout(timer);
    }, []);

    // Don't render the component if not authenticated
    if (!isAuthenticated || !user) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Checking authentication...</p>
          </div>
        </div>
      );
    }

    // Render the protected component
    return <Component {...props} />;
  };
}
