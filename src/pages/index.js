import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { FiShield, FiArrowRight, FiPackage, FiMonitor, FiBook, FiTool, FiShoppingBag, FiActivity, FiSmile, FiMoreHorizontal, FiSearch } from 'react-icons/fi';
import { useTranslation } from 'next-i18next';
import { getI18nProps } from '../lib/i18n';
import Layout from '../components/Layout';
import ListingCard from '../components/ListingCard';
import { listingsAPI, categoriesAPI } from '../lib/api';
import { useRouter } from 'next/router';

const categoryIcons = {
  'Furniture': FiPackage,
  'Electronics': FiMonitor,
  'Books': FiBook,
  'Kitchen': FiTool,
  'Clothing': FiShoppingBag,
  'Sports': FiActivity,
  'Toys': FiSmile,
  'Other': FiMoreHorizontal,
};

export default function Home() {
  const { t } = useTranslation('common');
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredListings, setFeaturedListings] = useState([]);
  const [recentListings, setRecentListings] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [featuredRes, recentRes, categoriesRes] = await Promise.all([
          listingsAPI.getFeatured(),
          listingsAPI.getRecent(8),
          categoriesAPI.getAll(),
        ]);

        if (featuredRes.data.success) setFeaturedListings(featuredRes.data.listings);
        if (recentRes.data.success) setRecentListings(recentRes.data.listings);
        if (categoriesRes.data.success) setCategories(categoriesRes.data.categories);
      } catch (error) {
        console.error('Failed to fetch homepage data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <Layout>
      <Head>
        <title>MySouqify - Buy & Sell Used Items in Cairo</title>
        <meta name="description" content="Egypt's trusted marketplace for buying and selling second-hand items. Find great deals on furniture, electronics, and more in Cairo." />
      </Head>

      {/* Hero Section - Full Screen with Overlay */}
      <section className="relative min-h-[88vh] flex items-center overflow-hidden">
        {/* Dark gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-red-950 to-gray-900" />

        {/* Dot pattern overlay */}
        <div
          className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)', backgroundSize: '32px 32px' }}
        />

        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-red-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-red-800/20 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4" />

        {/* Content */}
        <div className="container-app relative z-10 text-white py-20 w-full">
          <div className="max-w-3xl mx-auto text-center">

            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm mb-8 border border-white/20">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              Cairo&apos;s trusted marketplace
            </div>

            {/* Heading */}
            <h1 className="text-5xl lg:text-7xl font-extrabold mb-6 leading-tight tracking-tight">
              Buy & Sell<br />
              <span className="text-red-400">Anything</span> in Cairo
            </h1>

            <p className="text-lg lg:text-xl text-white/70 mb-10 max-w-xl mx-auto">
              {t('home.hero_subtitle')}
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex gap-2 max-w-xl mx-auto mb-10">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for items..."
                className="flex-1 px-5 py-4 rounded-xl text-gray-900 text-base outline-none shadow-lg"
              />
              <button
                type="submit"
                className="px-6 py-4 bg-red-600 hover:bg-red-700 rounded-xl font-semibold transition-colors flex items-center gap-2 shadow-lg"
              >
                <FiSearch size={20} />
              </button>
            </form>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-14">
              <Link
                href="/post"
                className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-colors text-base shadow-lg"
              >
                {t('home.start_selling')}
              </Link>
              <Link
                href="/search"
                className="px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-semibold rounded-xl transition-colors text-base border border-white/20"
              >
                Browse Listings
              </Link>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap justify-center gap-8 text-white/50 text-sm">
              <span className="flex items-center gap-2"><FiShield size={14} className="text-green-400" /> Free to post</span>
              <span className="flex items-center gap-2"><FiShield size={14} className="text-green-400" /> Safe deals</span>
              <span className="flex items-center gap-2"><FiShield size={14} className="text-green-400" /> Local community</span>
            </div>
          </div>
        </div>
      </section>

      {/* Browse Categories */}
      <section className="container-app py-10 lg:py-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl lg:text-2xl font-bold text-gray-900">{t('home.browse_categories')}</h2>
          <Link href="/search" className="text-sm text-primary-600 hover:underline flex items-center gap-1">
            {t('home.view_all')} <FiArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-4 lg:grid-cols-8 gap-3 lg:gap-4">
          {categories.map((category) => {
            const Icon = categoryIcons[category.name] || FiPackage;
            return (
              <Link
                key={category.name}
                href={`/search?category=${encodeURIComponent(category.name)}`}
                className="flex flex-col items-center p-3 lg:p-4 bg-white rounded-xl border border-gray-100 hover:border-primary-500 hover:shadow-card transition-all group"
              >
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gray-50 rounded-full flex items-center justify-center mb-2 group-hover:bg-primary-50 transition-colors">
                  <Icon className="text-gray-600 group-hover:text-primary-600" size={20} />
                </div>
                <span className="text-xs lg:text-sm text-gray-700 text-center">{category.name}</span>
                <span className="text-xs text-gray-400">{category.count || 0} ads</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured Listings */}
      {featuredListings.length > 0 && (
        <section className="container-app pb-10 lg:pb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl lg:text-2xl font-bold text-gray-900">{t('home.featured_listings')}</h2>
            <Link href="/search?featured=true" className="text-sm text-primary-600 hover:underline flex items-center gap-1">
              {t('home.view_all')} <FiArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
            {featuredListings.slice(0, 4).map((listing) => (
              <ListingCard key={listing._id} listing={listing} />
            ))}
          </div>
        </section>
      )}

      {/* Recent Listings */}
      <section className="container-app pb-10 lg:pb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl lg:text-2xl font-bold text-gray-900">{t('home.recent_listings')}</h2>
          <Link href="/search" className="text-sm text-primary-600 hover:underline flex items-center gap-1">
            {t('home.view_all')} <FiArrowRight size={14} />
          </Link>
        </div>

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
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
            {recentListings.map((listing) => (
              <ListingCard key={listing._id} listing={listing} />
            ))}
          </div>
        )}
      </section>

      {/* Safety Section */}
      <section className="bg-gray-50 py-10 lg:py-16">
        <div className="container-app">
          <div className="bg-white rounded-2xl p-6 lg:p-10 text-center max-w-2xl mx-auto">
            <div className="w-12 h-12 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiShield className="text-primary-600" size={24} />
            </div>
            <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-3">{t('home.safe_trading_title')}</h2>
            <p className="text-gray-600 mb-6">
              {t('home.safe_trading_desc')}
            </p>
            <Link href="/safety" className="text-primary-600 font-medium hover:underline inline-flex items-center gap-1">
              {t('home.read_safety_tips')} <FiArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="container-app py-10 lg:py-16">
        <h2 className="text-xl lg:text-2xl font-bold text-gray-900 text-center mb-10">How It Works</h2>
        
        <div className="grid lg:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
              1
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Post Your Ad</h3>
            <p className="text-sm text-gray-600">
              Create a listing with photos and description. It's quick and easy.
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
              2
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Connect with Buyers</h3>
            <p className="text-sm text-gray-600">
              Chat with interested buyers through our secure messaging system.
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
              3
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Complete the Deal</h3>
            <p className="text-sm text-gray-600">
              Meet safely, inspect the item, and complete your transaction.
            </p>
          </div>
        </div>
      </section>
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
