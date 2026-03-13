import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { authAPI } from '../lib/api';
import toast from 'react-hot-toast';
import Cookies from 'js-cookie';

/**
 * Higher-Order Component to protect admin-only routes
 * Verifies admin status via API call - does NOT rely on client store hydration
 */
export function withAdmin(Component) {
  return function AdminProtectedRoute(props) {
    const router = useRouter();
    const [status, setStatus] = useState('checking'); // 'checking' | 'allowed' | 'denied'

    useEffect(() => {
      const checkAdmin = async () => {
        const token = Cookies.get('token');

        if (!token) {
          toast.error('Please login to access this page');
          router.push('/');
          setStatus('denied');
          return;
        }

        try {
          const { data } = await authAPI.getMe();
          if (data.success && data.user?.isAdmin) {
            setStatus('allowed');
          } else {
            toast.error('Access denied. Admin privileges required.');
            router.push('/');
            setStatus('denied');
          }
        } catch (error) {
          toast.error('Please login to access this page');
          router.push('/');
          setStatus('denied');
        }
      };

      checkAdmin();
    }, []);

    if (status !== 'allowed') {
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
