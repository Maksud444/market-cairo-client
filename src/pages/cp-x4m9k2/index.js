import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { getI18nProps } from '../../lib/i18n';
import { withAdmin } from '../../hoc/withAdmin';
import { useAuthStore } from '../../lib/store';
import { adminAPI } from '../../lib/api';
import { FiUsers, FiShoppingBag, FiAlertCircle, FiTrendingUp, FiLogOut } from 'react-icons/fi';
import toast from 'react-hot-toast';

function AdminDashboard() {
  const { user, logout } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await adminAPI.getDashboardStats();
      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (error) {
      toast.error('Failed to load dashboard stats');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Admin Dashboard - MySouqify</title>
      </Head>

      {/* Admin Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container-app py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <span className="px-3 py-1 bg-primary-100 text-primary-700 text-sm font-medium rounded-full">
                Admin
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Welcome, {user?.name}</span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <FiLogOut size={18} />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="container-app">
          <nav className="flex gap-6">
            <Link
              href="/cp-x4m9k2"
              className="py-4 border-b-2 border-primary-600 text-primary-600 font-medium"
            >
              Dashboard
            </Link>
            <Link
              href="/cp-x4m9k2/users"
              className="py-4 border-b-2 border-transparent hover:border-gray-300 text-gray-600 hover:text-gray-900"
            >
              Users
            </Link>
            <Link
              href="/cp-x4m9k2/listings"
              className="py-4 border-b-2 border-transparent hover:border-gray-300 text-gray-600 hover:text-gray-900"
            >
              Listings
            </Link>
            <Link
              href="/cp-x4m9k2/verifications"
              className="py-4 border-b-2 border-transparent hover:border-gray-300 text-gray-600 hover:text-gray-900"
            >
              Verifications
            </Link>
            <Link
              href="/cp-x4m9k2/reports"
              className="py-4 border-b-2 border-transparent hover:border-gray-300 text-gray-600 hover:text-gray-900"
            >
              Reports
            </Link>
            <Link
              href="/cp-x4m9k2/categories"
              className="py-4 border-b-2 border-transparent hover:border-gray-300 text-gray-600 hover:text-gray-900"
            >
              Categories
            </Link>
            <Link
              href="/"
              className="py-4 border-b-2 border-transparent hover:border-gray-300 text-gray-600 hover:text-gray-900"
            >
              View Site
            </Link>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="container-app py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading dashboard...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Total Users */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-600">Total Users</h3>
                  <FiUsers className="text-blue-500" size={24} />
                </div>
                <p className="text-3xl font-bold text-gray-900">{stats?.users?.total || 0}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {stats?.users?.newThisMonth || 0} new this month
                </p>
              </div>

              {/* Active Listings */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-600">Active Listings</h3>
                  <FiShoppingBag className="text-green-500" size={24} />
                </div>
                <p className="text-3xl font-bold text-gray-900">{stats?.listings?.active || 0}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {stats?.listings?.total || 0} total listings
                </p>
              </div>

              {/* Pending Moderation */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-600">Pending Review</h3>
                  <FiAlertCircle className="text-yellow-500" size={24} />
                </div>
                <p className="text-3xl font-bold text-gray-900">{stats?.listings?.pending || 0}</p>
                <p className="text-sm text-gray-500 mt-1">Need moderation</p>
              </div>

              {/* Reported Items */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-600">Reported Items</h3>
                  <FiTrendingUp className="text-red-500" size={24} />
                </div>
                <p className="text-3xl font-bold text-gray-900">{stats?.listings?.reported || 0}</p>
                <p className="text-sm text-gray-500 mt-1">Flagged by users</p>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Users */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Users</h2>
                <div className="space-y-3">
                  {stats?.recentUsers?.slice(0, 5).map((user) => (
                    <div key={user._id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                      <div>
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                      <div className="text-right">
                        {user.isAdmin && (
                          <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full">
                            Admin
                          </span>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <Link
                  href="/cp-x4m9k2/users"
                  className="block text-center mt-4 text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  View All Users →
                </Link>
              </div>

              {/* Recent Listings */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Listings</h2>
                <div className="space-y-3">
                  {stats?.recentListings?.slice(0, 5).map((listing) => (
                    <div key={listing._id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 truncate">{listing.title}</p>
                        <p className="text-sm text-gray-500">by {listing.seller?.name}</p>
                      </div>
                      <div className="text-right ml-4">
                        <p className="font-semibold text-gray-900">{listing.price} EGP</p>
                        <p className="text-xs text-gray-500">{listing.category}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Link
                  href="/cp-x4m9k2/listings"
                  className="block text-center mt-4 text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  View All Listings →
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export async function getServerSideProps({ locale }) {
  return {
    props: {
      ...(await getI18nProps(locale)),
    },
  };
}

export default withAdmin(AdminDashboard);
