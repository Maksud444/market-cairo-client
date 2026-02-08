import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '../lib/store';
import toast from 'react-hot-toast';

/**
 * Higher-Order Component to protect admin-only routes
 * Redirects to home page if user is not an admin
 */
export function withAdmin(Component) {
  return function AdminProtectedRoute(props) {
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
        } else if (!user.isAdmin) {
          toast.error('Access denied. Admin privileges required.');
          router.push('/');
        }
      }, 100);

      return () => clearTimeout(timer);
    }, []);

    // Don't render if not authenticated or not admin
    if (!isAuthenticated || !user || !user.isAdmin) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Checking access...</p>
          </div>
        </div>
      );
    }

    // Render the admin component
    return <Component {...props} />;
  };
}
