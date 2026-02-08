import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { getI18nProps } from '../../lib/i18n';
import { withAuth } from '../../hoc/withAuth';
import Layout from '../../components/Layout';
import ListingCard from '../../components/ListingCard';
import { useAuthStore } from '../../lib/store';
import { FiEdit, FiSettings, FiShoppingBag, FiHeart, FiMessageSquare, FiStar, FiShield, FiAlertCircle, FiClock } from 'react-icons/fi';
import { listingsAPI, usersAPI } from '../../lib/api';
import toast from 'react-hot-toast';

function UserDashboard() {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { user } = useAuthStore();
  const [myListings, setMyListings] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [listingsRes, favoritesRes] = await Promise.all([
        usersAPI.getMyListings(),
        usersAPI.getFavorites()
      ]);

      if (listingsRes.data.success) {
        setMyListings(listingsRes.data.listings);
      }
      if (favoritesRes.data.success) {
        setFavorites(favoritesRes.data.favorites);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <Head>
        <title>My Dashboard - Market Cairo</title>
      </Head>

      <div className="container-app py-4 lg:py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 lg:p-6 mb-6 lg:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex items-center gap-3 lg:gap-4">
              <div className="w-14 h-14 lg:w-20 lg:h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white text-xl lg:text-2xl font-semibold flex-shrink-0">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <h1 className="text-lg lg:text-2xl font-bold text-gray-900 truncate">{user?.name}</h1>
                <p className="text-sm text-gray-600 truncate">{user?.email}</p>
                <div className="flex items-center gap-3 mt-1 lg:mt-2">
                  <div className="flex items-center gap-1 text-yellow-500">
                    <FiStar size={14} />
                    <span className="text-xs lg:text-sm font-medium">{user?.rating?.average?.toFixed(1) || '0.0'}</span>
                    <span className="text-gray-500 text-xs lg:text-sm">({user?.rating?.count || 0})</span>
                  </div>
                  <span className="text-gray-400">•</span>
                  <span className="text-xs lg:text-sm text-gray-600">{user?.salesCount || 0} sales</span>
                </div>
              </div>
            </div>
            <Link
              href="/dashboard/settings"
              className="btn btn-outline flex items-center gap-2 text-sm self-start"
            >
              <FiSettings size={16} />
              {t('dashboard.settings')}
            </Link>
          </div>
        </div>

        {/* Verification Banner */}
        {user && !user.isAdmin && user.verification?.status !== 'approved' && (
          <div className={`rounded-xl border p-4 mb-6 lg:mb-8 ${
            user.verification?.status === 'pending'
              ? 'bg-yellow-50 border-yellow-200'
              : user.verification?.status === 'rejected'
              ? 'bg-red-50 border-red-200'
              : 'bg-blue-50 border-blue-200'
          }`}>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {user.verification?.status === 'pending' ? (
                  <FiClock className="text-yellow-500 flex-shrink-0" size={24} />
                ) : user.verification?.status === 'rejected' ? (
                  <FiAlertCircle className="text-red-500 flex-shrink-0" size={24} />
                ) : (
                  <FiShield className="text-blue-500 flex-shrink-0" size={24} />
                )}
                <div>
                  <h3 className={`font-semibold text-sm ${
                    user.verification?.status === 'pending' ? 'text-yellow-800' :
                    user.verification?.status === 'rejected' ? 'text-red-800' : 'text-blue-800'
                  }`}>
                    {user.verification?.status === 'pending'
                      ? t('dashboard.verification_pending')
                      : user.verification?.status === 'rejected'
                      ? t('dashboard.verification_rejected')
                      : t('dashboard.verification_required')}
                  </h3>
                  <p className={`text-xs mt-0.5 ${
                    user.verification?.status === 'pending' ? 'text-yellow-600' :
                    user.verification?.status === 'rejected' ? 'text-red-600' : 'text-blue-600'
                  }`}>
                    {user.verification?.status === 'pending'
                      ? t('dashboard.verification_pending_desc')
                      : user.verification?.status === 'rejected'
                      ? user.verification?.rejectionReason || t('dashboard.verification_rejected_desc')
                      : t('dashboard.verification_required_desc')}
                  </p>
                </div>
              </div>
              {user.verification?.status !== 'pending' && (
                <Link
                  href="/verify"
                  className="btn btn-primary text-sm whitespace-nowrap"
                >
                  {user.verification?.status === 'rejected' ? t('dashboard.resubmit') : t('dashboard.verify_now')}
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 lg:gap-6 mb-6 lg:mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-3 lg:p-6">
            <div className="flex flex-col items-center lg:flex-row lg:items-center gap-2 lg:gap-3">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FiShoppingBag className="text-blue-600" size={20} />
              </div>
              <div className="text-center lg:text-left">
                <p className="text-xl lg:text-2xl font-bold text-gray-900">{myListings.length}</p>
                <p className="text-xs lg:text-sm text-gray-600">{t('dashboard.my_listings')}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-3 lg:p-6">
            <div className="flex flex-col items-center lg:flex-row lg:items-center gap-2 lg:gap-3">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <FiHeart className="text-red-600" size={20} />
              </div>
              <div className="text-center lg:text-left">
                <p className="text-xl lg:text-2xl font-bold text-gray-900">{favorites.length}</p>
                <p className="text-xs lg:text-sm text-gray-600">{t('dashboard.saved_items')}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-3 lg:p-6">
            <div className="flex flex-col items-center lg:flex-row lg:items-center gap-2 lg:gap-3">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <FiMessageSquare className="text-green-600" size={20} />
              </div>
              <div className="text-center lg:text-left">
                <p className="text-xl lg:text-2xl font-bold text-gray-900">0</p>
                <p className="text-xs lg:text-sm text-gray-600">{t('dashboard.messages')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* My Listings */}
        <div className="mb-6 lg:mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg lg:text-xl font-bold text-gray-900">{t('dashboard.my_listings')}</h2>
            <Link href="/post" className="btn btn-primary flex items-center gap-2 text-sm">
              <FiEdit size={16} />
              <span className="hidden sm:inline">{t('buttons.post_ad')}</span>
              <span className="sm:hidden">+</span>
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="card">
                  <div className="aspect-card skeleton" />
                  <div className="p-3 space-y-2">
                    <div className="h-4 skeleton w-3/4" />
                    <div className="h-5 skeleton w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : myListings.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <FiShoppingBag className="mx-auto text-gray-400 mb-4" size={48} />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No listings yet</h3>
              <p className="text-gray-600 mb-4">Start selling by posting your first ad</p>
              <Link href="/post" className="btn btn-primary">
                Post New Ad
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {myListings.slice(0, 4).map((listing) => (
                <div key={listing._id} className="relative">
                  <ListingCard listing={listing} />

                  {/* Pending approval badge */}
                  {listing.moderationStatus === 'pending' && (
                    <div className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-medium shadow-lg z-10">
                      {t('common.pending_approval')}
                    </div>
                  )}

                  {/* Soft deleted badge */}
                  {listing.isDeleted && (
                    <div className="absolute top-2 left-2 bg-gray-400 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg z-10">
                      {t('common.deleting_in')} {Math.ceil((new Date(listing.deletedAt).getTime() + 2 * 24 * 60 * 60 * 1000 - Date.now()) / (24 * 60 * 60 * 1000))} {t('common.days')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {myListings.length > 4 && (
            <div className="text-center mt-4">
              <Link href="/dashboard/listings" className="text-primary-600 hover:underline">
                {t('dashboard.view_all_listings')} →
              </Link>
            </div>
          )}
        </div>

        {/* Saved Items */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg lg:text-xl font-bold text-gray-900">{t('dashboard.saved_items')}</h2>
            <Link href="/favorites" className="text-sm text-primary-600 hover:underline">
              {t('home.view_all')}
            </Link>
          </div>

          {favorites.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <FiHeart className="mx-auto text-gray-400 mb-4" size={48} />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No saved items</h3>
              <p className="text-gray-600 mb-4">Save items you're interested in for later</p>
              <Link href="/search" className="btn btn-primary">
                Browse Listings
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {favorites.slice(0, 4).map((listing) => (
                <ListingCard key={listing._id} listing={listing} />
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

export async function getServerSideProps({ locale }) {
  return {
    props: {
      ...(await getI18nProps(locale)),
    },
  };
}

export default withAuth(UserDashboard);
