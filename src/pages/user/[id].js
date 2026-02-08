import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FiMapPin, FiStar, FiClock, FiShoppingBag, FiMessageCircle } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import { getI18nProps } from '../../lib/i18n';
import Layout from '../../components/Layout';
import ListingCard from '../../components/ListingCard';
import { usersAPI } from '../../lib/api';
import { useAuthStore } from '../../lib/store';

export default function UserProfilePage() {
  const router = useRouter();
  const { id } = router.query;
  const { user: currentUser, isAuthenticated } = useAuthStore();

  const [seller, setSeller] = useState(null);
  const [listings, setListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    // If viewing own profile, redirect to /profile
    if (currentUser?._id === id) {
      router.replace('/profile');
      return;
    }

    const fetchUser = async () => {
      setIsLoading(true);
      try {
        const [userRes, listingsRes] = await Promise.all([
          usersAPI.getById(id),
          usersAPI.getUserListings(id),
        ]);

        if (userRes.data.success) {
          setSeller(userRes.data.user);
        }
        if (listingsRes.data.success) {
          setListings(listingsRes.data.listings);
        }
      } catch (error) {
        console.error('Failed to fetch user:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [id, currentUser, router]);

  if (isLoading) {
    return (
      <Layout>
        <div className="container-app py-8">
          <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 skeleton rounded-full" />
              <div className="space-y-2">
                <div className="h-6 skeleton w-40" />
                <div className="h-4 skeleton w-32" />
              </div>
            </div>
          </div>
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
        </div>
      </Layout>
    );
  }

  if (!seller) {
    return (
      <Layout>
        <div className="container-app py-16 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">User Not Found</h1>
          <p className="text-gray-500 mb-6">This user doesn't exist or has been removed.</p>
          <Link href="/" className="btn btn-primary">
            Go Home
          </Link>
        </div>
      </Layout>
    );
  }

  const activeListings = listings.filter(l => l.status === 'active');

  return (
    <Layout>
      <Head>
        <title>{seller.name} - Market Cairo</title>
      </Head>

      <div className="container-app py-6 lg:py-10">
        {/* Seller Profile Card */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 lg:p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-16 h-16 lg:w-20 lg:h-20 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold text-2xl lg:text-3xl flex-shrink-0">
              {seller.name?.charAt(0).toUpperCase()}
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="text-xl lg:text-2xl font-bold text-gray-900 truncate">
                {seller.name}
              </h1>
              
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-gray-500">
                {seller.location?.area && (
                  <span className="flex items-center gap-1">
                    <FiMapPin size={14} />
                    {seller.location.area}, {seller.location.city}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <FiClock size={14} />
                  Member since {formatDistanceToNow(new Date(seller.createdAt), { addSuffix: true })}
                </span>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 mt-3">
                {seller.rating?.count > 0 && (
                  <div className="flex items-center gap-1 text-sm">
                    <FiStar className="text-yellow-400 fill-current" size={16} />
                    <span className="font-medium">{seller.rating.average.toFixed(1)}</span>
                    <span className="text-gray-400">({seller.rating.count} reviews)</span>
                  </div>
                )}
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <FiShoppingBag size={14} />
                  <span>{seller.salesCount || 0} sales</span>
                </div>
              </div>
            </div>

            {isAuthenticated && currentUser?._id !== id && (
              <Link 
                href={`/messages?newConversation=${id}`}
                className="btn btn-primary shrink-0"
              >
                <FiMessageCircle size={18} className="mr-2" />
                Contact
              </Link>
            )}
          </div>
        </div>

        {/* Listings */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Listings by {seller.name} ({activeListings.length})
          </h2>

          {activeListings.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiShoppingBag className="text-gray-400" size={24} />
              </div>
              <p className="text-gray-500">No active listings</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
              {activeListings.map((listing) => (
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
