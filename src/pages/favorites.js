import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FiHeart, FiSearch } from 'react-icons/fi';
import { useTranslation } from 'next-i18next';
import { getI18nProps } from '../lib/i18n';
import Layout from '../components/Layout';
import ListingCard from '../components/ListingCard';
import { usersAPI } from '../lib/api';
import { useAuthStore } from '../lib/store';

export default function FavoritesPage() {
  const router = useRouter();
  const { t } = useTranslation('common');
  const { isAuthenticated, _hasHydrated } = useAuthStore();
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Redirect if not authenticated (wait for hydration first)
  useEffect(() => {
    if (!_hasHydrated) return;
    if (!isAuthenticated) {
      router.push('/?login=true');
    }
  }, [_hasHydrated, isAuthenticated, router]);

  // Fetch favorites
  useEffect(() => {
    if (isAuthenticated) {
      const fetchFavorites = async () => {
        setIsLoading(true);
        try {
          const res = await usersAPI.getFavorites();
          if (res.data.success) {
            setFavorites(res.data.favorites || res.data.listings || []);
          }
        } catch (error) {
          console.error('Failed to fetch favorites:', error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchFavorites();
    }
  }, [isAuthenticated]);

  const handleRemoveFavorite = (listingId) => {
    setFavorites(prev => prev.filter(item => item._id !== listingId));
  };

  if (!_hasHydrated || !isAuthenticated) {
    return null;
  }

  return (
    <Layout>
      <Head>
        <title>{t('favorites.title')} - MySouqify</title>
      </Head>

      <div className="container-app py-6 lg:py-10">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-6">
          {t('favorites.title')}
        </h1>

        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
            {[...Array(8)].map((_, i) => (
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
        ) : favorites?.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiHeart className="text-gray-400" size={32} />
            </div>
            <h2 className="text-lg font-medium text-gray-900 mb-2">{t('favorites.no_favorites')}</h2>
            <p className="text-gray-500 mb-6">
              {t('favorites.no_favorites_desc')}
            </p>
            <Link href="/search" className="btn btn-primary">
              <FiSearch size={18} className="mr-2" />
              {t('favorites.browse_listings')}
            </Link>
          </div>
        ) : (
          <>
            <p className="text-gray-500 mb-4">
              {favorites.length} {favorites.length === 1 ? t('favorites.item_saved') : t('favorites.items_saved')}
            </p>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
              {favorites.map((listing) => (
                <ListingCard 
                  key={listing._id} 
                  listing={listing} 
                  isFavorite={true}
                  onFavoriteChange={() => handleRemoveFavorite(listing._id)}
                />
              ))}
            </div>
          </>
        )}
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
