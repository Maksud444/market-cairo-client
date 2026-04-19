import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuthStore } from '../lib/store';
import { FiLogOut } from 'react-icons/fi';
import toast from 'react-hot-toast';

const NAV_LINKS = [
  { href: '/cp-x4m9k2', label: 'Dashboard' },
  { href: '/cp-x4m9k2/users', label: 'Users' },
  { href: '/cp-x4m9k2/listings', label: 'Listings' },
  { href: '/cp-x4m9k2/verifications', label: 'Verifications' },
  { href: '/cp-x4m9k2/reports', label: 'Reports' },
  { href: '/cp-x4m9k2/categories', label: 'Categories' },
  { href: '/cp-x4m9k2/admins', label: 'Admins' },
  { href: '/', label: 'View Site' },
];

export default function AdminLayout({ children, title }) {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    window.location.href = '/';
  };

  const isActive = (href) => {
    if (href === '/cp-x4m9k2') {
      return router.pathname === '/cp-x4m9k2';
    }
    return router.pathname === href || router.pathname.startsWith(href + '/');
  };

  return (
    <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
      {/* Header */}
      <div className="container-app py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold text-gray-900 sm:text-2xl">MySouqify Admin</h1>
          <div className="flex items-center gap-2 sm:gap-4">
            <span className="hidden sm:block text-sm text-gray-600">Welcome, {user?.name}</span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900 text-sm"
              title="Logout"
            >
              <FiLogOut size={18} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="border-t border-gray-100">
        <div className="container-app">
          <nav className="flex gap-1 overflow-x-auto no-scrollbar">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`py-3 px-3 border-b-2 whitespace-nowrap text-sm font-medium transition-colors flex-shrink-0 ${
                  isActive(link.href)
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}
