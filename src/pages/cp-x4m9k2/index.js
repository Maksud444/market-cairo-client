import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { getI18nProps } from '../../lib/i18n';
import { withAdmin } from '../../hoc/withAdmin';
import { adminAPI } from '../../lib/api';
import { FiUsers, FiShoppingBag, FiAlertCircle, FiTrendingUp } from 'react-icons/fi';
import toast from 'react-hot-toast';
import AdminLayout from '../../components/AdminLayout';

function AdminDashboard() {
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Admin Dashboard - MySouqify</title>
      </Head>

      <AdminLayout title="Admin Dashboard" />

      {/* Main Content */}
      <div className="container-app py-6 sm:py-8">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
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
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900 truncate">{user.name}</p>
                        <p className="text-sm text-gray-500 truncate">{user.email}</p>
                      </div>
                      <div className="text-right flex-shrink-0 ml-2">
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
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{listing.title}</p>
                        <p className="text-sm text-gray-500">by {listing.seller?.name}</p>
                      </div>
                      <div className="text-right ml-4 flex-shrink-0">
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
