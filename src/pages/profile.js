import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  FiEdit2, FiPlusCircle, FiMessageCircle, FiHeart, FiLogOut,
  FiSettings, FiStar
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { getI18nProps } from '../lib/i18n';
import Layout from '../components/Layout';
import ListingCard from '../components/ListingCard';
import { usersAPI, listingsAPI } from '../lib/api';
import { useAuthStore } from '../lib/store';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  
  const [activeTab, setActiveTab] = useState('listings');
  const [myListings, setMyListings] = useState([]);
  const [soldListings, setSoldListings] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    rating: 0,
    salesCount: 0,
    listingsCount: 0,
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [listingsRes, soldRes, favoritesRes, profileRes] = await Promise.all([
          listingsAPI.getMyListings(),
          listingsAPI.getMySoldListings(),
          listingsAPI.getFavorites(),
          usersAPI.getProfile(),
        ]);

        if (listingsRes.data.success) setMyListings(listingsRes.data.listings);
        if (soldRes.data.success) setSoldListings(soldRes.data.listings);
        if (favoritesRes.data.success) setFavorites(favoritesRes.data.favorites || favoritesRes.data.listings || []);
        if (profileRes.data.success) {
          setStats({
            rating: profileRes.data.user.rating?.average || 0,
            salesCount: profileRes.data.user.salesCount || 0,
            listingsCount: listingsRes.data.listings?.length || 0,
          });
        }
      } catch (error) {
        console.error('Failed to fetch profile data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, router]);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    router.push('/');
  };

  const getTabContent = () => {
    switch (activeTab) {
      case 'listings':
        return myListings;
      case 'sold':
        return soldListings;
      case 'favorites':
        return favorites;
      default:
        return [];
    }
  };

  const tabContent = getTabContent();

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Layout>
      <Head>
        <title>My Profile - Market Cairo</title>
      </Head>

      <div className="container-app py-6 lg:py-10">
        {/* Profile Header */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 lg:p-8 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="w-20 h-20 lg:w-24 lg:h-24 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl lg:text-4xl">👨</span>
                )}
              </div>
              
              {/* Info */}
              <div>
                <h1 className="text-xl lg:text-2xl font-bold text-gray-900">{user?.name}</h1>
                <p className="text-gray-500 text-sm mb-2">
                  Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'June 2023'}
                </p>
                <div className="flex items-center gap-3 text-sm">
                  {stats.rating > 0 && (
                    <span className="flex items-center gap-1 text-gray-700">
                      <FiStar className="text-yellow-400 fill-current" size={14} />
                      <span className="font-medium">{stats.rating.toFixed(1)}</span>
                      <span className="text-gray-400">rating</span>
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-gray-700">
                    <span className="font-medium">{stats.salesCount}</span>
                    <span className="text-gray-400">sales</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Settings Button */}
            <button
              onClick={() => router.push('/dashboard/settings')}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FiSettings size={20} />
            </button>
          </div>

          {/* Edit Profile Link */}
          <Link
            href="/dashboard/settings"
            className="inline-flex items-center gap-2 text-primary-600 text-sm font-medium hover:underline mb-6"
          >
            <FiEdit2 size={14} />
            Edit Profile
          </Link>

          {/* Contact Info */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-400 mb-1">Email</p>
              <p className="text-gray-900 flex items-center gap-2">
                {user?.email}
              </p>
            </div>
            <div>
              <p className="text-gray-400 mb-1">Phone</p>
              <p className="text-gray-900">
                {user?.phone || 'Not provided'}
              </p>
            </div>
            <div>
              <p className="text-gray-400 mb-1">Location</p>
              <p className="text-gray-900">
                {user?.location?.area ? `${user.location.area}, ${user.location.city}` : 'Cairo, Egypt'}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6">
          <Link 
            href="/post"
            className="flex flex-col items-center justify-center gap-2 bg-white rounded-xl border border-gray-100 p-5 hover:border-primary-500 hover:shadow-card transition-all group"
          >
            <div className="w-12 h-12 bg-primary-50 rounded-full flex items-center justify-center group-hover:bg-primary-100 transition-colors">
              <FiPlusCircle className="text-primary-600" size={24} />
            </div>
            <span className="text-sm font-medium text-gray-700">Post New Ad</span>
          </Link>

          <Link 
            href="/messages"
            className="flex flex-col items-center justify-center gap-2 bg-white rounded-xl border border-gray-100 p-5 hover:border-primary-500 hover:shadow-card transition-all group"
          >
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-gray-200 transition-colors">
              <FiMessageCircle className="text-gray-600" size={24} />
            </div>
            <span className="text-sm font-medium text-gray-700">Messages</span>
          </Link>

          <Link 
            href="/favorites"
            className="flex flex-col items-center justify-center gap-2 bg-white rounded-xl border border-gray-100 p-5 hover:border-primary-500 hover:shadow-card transition-all group"
          >
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center group-hover:bg-red-100 transition-colors">
              <FiHeart className="text-primary-600" size={24} />
            </div>
            <span className="text-sm font-medium text-gray-700">Favorites</span>
          </Link>

          <button 
            onClick={handleLogout}
            className="flex flex-col items-center justify-center gap-2 bg-white rounded-xl border border-gray-100 p-5 hover:border-gray-300 hover:shadow-card transition-all group"
          >
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-gray-200 transition-colors">
              <FiLogOut className="text-gray-600" size={24} />
            </div>
            <span className="text-sm font-medium text-gray-700">Logout</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="flex border-b border-gray-100">
            <button
              onClick={() => setActiveTab('listings')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === 'listings'
                  ? 'text-primary-600 border-b-2 border-primary-600 -mb-px'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              My Listings ({myListings.length})
            </button>
            <button
              onClick={() => setActiveTab('sold')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === 'sold'
                  ? 'text-primary-600 border-b-2 border-primary-600 -mb-px'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Sold ({soldListings.length})
            </button>
            <button
              onClick={() => setActiveTab('favorites')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === 'favorites'
                  ? 'text-primary-600 border-b-2 border-primary-600 -mb-px'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Favorites ({favorites.length})
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-4 lg:p-6">
            {isLoading ? (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="card">
                    <div className="aspect-card skeleton" />
                    <div className="p-3 space-y-2">
                      <div className="h-4 skeleton w-3/4" />
                      <div className="h-5 skeleton w-1/2" />
                      <div className="h-3 skeleton w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : tabContent.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  {activeTab === 'listings' && <FiPlusCircle className="text-gray-400" size={32} />}
                  {activeTab === 'sold' && <FiStar className="text-gray-400" size={32} />}
                  {activeTab === 'favorites' && <FiHeart className="text-gray-400" size={32} />}
                </div>
                <p className="text-gray-500 mb-4">
                  {activeTab === 'listings' && "You haven't posted any listings yet"}
                  {activeTab === 'sold' && "No sold items yet"}
                  {activeTab === 'favorites' && "No favorites saved yet"}
                </p>
                {activeTab === 'listings' && (
                  <Link href="/post" className="btn btn-primary">
                    Post Your First Ad
                  </Link>
                )}
                {activeTab === 'favorites' && (
                  <Link href="/search" className="btn btn-primary">
                    Browse Listings
                  </Link>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
                {tabContent.map((listing) => (
                  <ListingCard key={listing._id} listing={listing} showStatus={activeTab === 'listings'} />
                ))}
              </div>
            )}
          </div>
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
