import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { FiCamera, FiPlus, FiMapPin, FiFilter, FiSearch } from 'react-icons/fi';
import { useTranslation } from 'next-i18next';
import { getI18nProps } from '../lib/i18n';
import Layout from '../components/Layout';
import { listingsAPI } from '../lib/api';
import { getImageUrl, PLACEHOLDER_IMG } from '../lib/utils';
import { useAuthStore, useUIStore } from '../lib/store';

const RENT_CATEGORIES = [
  { key: 'all', label: 'All', icon: '🎬' },
  { key: 'camera', label: 'Camera', icon: '📷' },
  { key: 'car', label: 'Car', icon: '🚗' },
  { key: 'wedding', label: 'Wedding', icon: '💍' },
  { key: 'azhar', label: 'Azhar Collection', icon: '🕌' },
];

function StoreCard({ store }) {
  const [imgSrc, setImgSrc] = useState(getImageUrl(store.images?.[0]));

  const priceLabel = store.pricePerDayMax && store.pricePerDayMax > store.pricePerDay
    ? `${store.pricePerDay}–${store.pricePerDayMax} EGP/day`
    : `${store.pricePerDay} EGP/day`;

  return (
    <Link href={`/listing/${store._id}`}>
      <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg transition-all cursor-pointer group">
        <div className="relative bg-gray-100" style={{ aspectRatio: '16/9' }}>
          <Image
            src={imgSrc}
            alt={store.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImgSrc(PLACEHOLDER_IMG)}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
          <div className="absolute top-2 left-2">
            <span className="bg-primary-600 text-white text-xs font-bold px-2 py-0.5 rounded-lg">Store</span>
          </div>
        </div>
        <div className="p-3">
          <h3 className="font-bold text-sm text-gray-900 line-clamp-1">{store.storeName || store.title}</h3>
          <p className="text-primary-600 font-semibold text-sm mt-0.5">{priceLabel}</p>
          {store.location?.area && (
            <div className="flex items-center gap-1 mt-1 text-gray-400">
              <FiMapPin size={11} />
              <span className="text-xs">{store.location.area}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

function RentItemCard({ listing }) {
  const [imgSrc, setImgSrc] = useState(getImageUrl(listing.images?.[0]));

  const priceLabel = listing.pricePerDayMax && listing.pricePerDayMax > listing.pricePerDay
    ? `${listing.pricePerDay}–${listing.pricePerDayMax} EGP/day`
    : `${listing.pricePerDay} EGP/day`;

  return (
    <Link href={`/listing/${listing._id}`}>
      <div className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer group">
        <div className="relative bg-gray-100" style={{ aspectRatio: '4/3' }}>
          <Image
            src={imgSrc}
            alt={listing.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImgSrc(PLACEHOLDER_IMG)}
            sizes="(max-width: 640px) 50vw, 25vw"
          />
          <div className="absolute top-2 left-2">
            <span className="bg-primary-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md">For Rent</span>
          </div>
          {listing.storeName && (
            <div className="absolute top-2 right-2">
              <span className="bg-white/90 text-gray-700 text-[10px] font-semibold px-1.5 py-0.5 rounded-md border border-gray-200">Store</span>
            </div>
          )}
        </div>
        <div className="p-2.5">
          <p className="text-xs font-semibold text-gray-900 line-clamp-2 leading-snug">{listing.title}</p>
          <p className="text-sm font-bold text-primary-600 mt-1">{priceLabel}</p>
        </div>
      </div>
    </Link>
  );
}

export default function RentPage() {
  const { t } = useTranslation('common');
  const { isAuthenticated } = useAuthStore();
  const { openLoginModal } = useUIStore();
  const [activeCategory, setActiveCategory] = useState('all');
  const [listings, setListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchListings();
  }, [activeCategory]);

  const fetchListings = async () => {
    setIsLoading(true);
    try {
      const params = { limit: 50 };
      if (activeCategory !== 'all') params.rentCategory = activeCategory;
      const res = await listingsAPI.getRentListings(params);
      if (res.data.success) setListings(res.data.listings);
    } catch (err) {
      console.error('Failed to fetch rent listings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Group by storeName to show "Top Rental Stores"
  const storeMap = {};
  listings.forEach((l) => {
    const key = l.storeName || l.seller?._id || l._id;
    if (!storeMap[key]) storeMap[key] = l;
  });
  const topStores = Object.values(storeMap).slice(0, 8);

  const filteredListings = searchQuery
    ? listings.filter(
        (l) =>
          l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (l.storeName || '').toLowerCase().includes(searchQuery.toLowerCase())
      )
    : listings;

  const handlePostRent = () => {
    if (!isAuthenticated) { openLoginModal(); return; }
    window.location.href = '/rent/post';
  };

  return (
    <Layout>
      <Head>
        <title>Rent Items in Cairo — Cameras, Cars, Wedding & More | MySouqify</title>
        <meta name="description" content="Rent cameras, cars, wedding dresses, and Azhar clothing in Cairo. Browse top rental stores on MySouqify — Egypt's rental marketplace." />
        <link rel="canonical" href="https://mysouqify.com/rent" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="MySouqify" />
        <meta property="og:title" content="Rent Items in Cairo — Cameras, Cars, Wedding & More | MySouqify" />
        <meta property="og:description" content="Rent cameras, cars, wedding dresses and more in Cairo. Find the best rental stores on MySouqify." />
        <meta property="og:url" content="https://mysouqify.com/rent" />
        <meta property="og:image" content="https://mysouqify.com/og-image.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>

      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="container-app py-8 lg:py-12">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FiCamera size={20} className="text-primary-200" />
                <span className="text-primary-100 text-sm font-medium">Rental Marketplace</span>
              </div>
              <h1 className="text-2xl lg:text-4xl font-bold">{t('rent.page_title')}</h1>
              <p className="text-primary-100 mt-1 text-sm lg:text-base">{t('rent.page_subtitle')}</p>
            </div>
            <Link
              href="/rent/post"
              className="flex items-center gap-2 bg-white text-primary-700 font-bold px-5 py-2.5 rounded-xl hover:bg-primary-50 transition-colors self-start lg:self-auto text-sm"
            >
              <FiPlus size={16} /> {t('rent.post_item_cta')}
            </Link>
          </div>
        </div>
      </div>

      <div className="container-app py-6 lg:py-10">
        {/* Search + Filter bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 flex-shrink-0">
            <FiMapPin size={14} className="text-primary-600" />
            <span className="font-medium">Rental Stores in Cairo</span>
          </div>
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for stores..."
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-500 transition-colors"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-600 hover:border-primary-500 hover:text-primary-600 transition-colors flex-shrink-0">
            <FiFilter size={14} /> Filter
          </button>
        </div>

        {/* Category Filter Pills */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 mb-8">
          {RENT_CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all flex-shrink-0 ${
                activeCategory === cat.key
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-primary-500 hover:text-primary-600'
              }`}
            >
              <span>{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>

        {/* Top Rental Stores */}
        {!searchQuery && (
          <section className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg lg:text-xl font-bold text-gray-900">{t('rent.top_stores')}</h2>
            </div>
            {isLoading ? (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    <div className="skeleton" style={{ aspectRatio: '16/9' }} />
                    <div className="p-3 space-y-2">
                      <div className="h-4 skeleton w-3/4" />
                      <div className="h-3 skeleton w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : topStores.length > 0 ? (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
                {topStores.map((store) => (
                  <StoreCard key={store._id} store={store} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-primary-200">
                <FiCamera size={36} className="text-primary-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">{t('rent.no_stores_yet')}</p>
              </div>
            )}
          </section>
        )}

        {/* All Rent Items */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg lg:text-xl font-bold text-gray-900">
              {searchQuery ? `Results for "${searchQuery}"` : t('rent.all_items')}
              {!isLoading && (
                <span className="ml-2 text-sm font-normal text-gray-400">({filteredListings.length})</span>
              )}
            </h2>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                  <div className="skeleton" style={{ aspectRatio: '4/3' }} />
                  <div className="p-2.5 space-y-1.5">
                    <div className="h-3 skeleton w-2/3" />
                    <div className="h-4 skeleton w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredListings.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-4">
              {filteredListings.map((listing) => (
                <RentItemCard key={listing._id} listing={listing} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
              <FiCamera size={40} className="text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-2">{t('rent.no_items_category')}</p>
              <p className="text-gray-400 text-sm mb-4">{t('rent.be_first')}</p>
              <Link href="/rent/post" className="inline-flex items-center gap-2 bg-primary-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary-700 transition-colors">
                <FiPlus size={15} /> {t('rent.post_item_cta')}
              </Link>
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
}

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await getI18nProps(locale)),
    },
  };
}
