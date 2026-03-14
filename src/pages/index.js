import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { FiShield, FiArrowRight, FiPackage, FiMonitor, FiBook, FiTool, FiShoppingBag, FiMoreHorizontal } from 'react-icons/fi';
import { useTranslation } from 'next-i18next';
import { getI18nProps } from '../lib/i18n';
import Layout from '../components/Layout';
import ListingCard from '../components/ListingCard';
import BannerSlider from '../components/BannerSlider';
import RamadanBanner from '../components/RamadanBanner';
import { listingsAPI, categoriesAPI } from '../lib/api';

const categoryIcons = {
  'Mobile & Tablets': FiShoppingBag,
  'Electronics': FiMonitor,
  'Fashion & Beauty': FiShoppingBag,
  'Furniture': FiPackage,
  'Kitchen': FiTool,
  'Books': FiBook,
  'Other': FiMoreHorizontal,
};

export default function Home() {
  const { t } = useTranslation('common');
  const [featuredListings, setFeaturedListings] = useState([]);
  const [recentListings, setRecentListings] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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

      {/* Banner Slider - Both mobile and desktop */}
      <BannerSlider />

      {/* Ramadan Banner */}
      <RamadanBanner />

      {/* Browse Categories - Desktop only (mobile uses Header icons) */}
      <section className="hidden lg:block container-app py-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{t('home.browse_categories')}</h2>
          <Link href="/search" className="text-sm text-primary-600 hover:underline flex items-center gap-1">
            {t('home.view_all')} <FiArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-8 gap-4">
          {categories.map((category) => {
            const Icon = categoryIcons[category.name] || FiPackage;
            return (
              <Link key={category.name} href={`/search?category=${encodeURIComponent(category.name)}`}
                className="flex flex-col items-center p-4 bg-white rounded-xl border border-gray-100 hover:border-primary-500 hover:shadow-card transition-all group">
                <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-2 group-hover:bg-primary-50 transition-colors">
                  <Icon className="text-primary-600 group-hover:text-primary-700" size={24} />
                </div>
                <span className="text-sm text-gray-800 text-center font-bold leading-tight">{category.name}</span>
                <span className="text-xs text-gray-400 mt-0.5">{category.count || 0} ads</span>
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
      <section className="pb-10 lg:pb-16">
        <div className="px-4 lg:container-app">
          <div className="flex items-center justify-between mb-4 lg:mb-6">
            <h2 className="text-base lg:text-2xl font-bold text-gray-900">{t('home.recent_listings')}</h2>
            <Link href="/search" className="text-sm text-primary-600 hover:underline flex items-center gap-1">
              {t('home.view_all')} <FiArrowRight size={14} />
            </Link>
          </div>

          {isLoading ? (
            <div className="space-y-3 lg:grid lg:space-y-0 lg:grid-cols-4 lg:gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="lg:hidden flex gap-3 bg-white rounded-xl border border-gray-100 overflow-hidden h-28">
                  <div className="w-28 skeleton flex-shrink-0" />
                  <div className="flex-1 p-3 space-y-2">
                    <div className="h-4 skeleton w-3/4" />
                    <div className="h-5 skeleton w-1/2" />
                    <div className="h-3 skeleton w-2/3" />
                  </div>
                </div>
              ))}
              {[...Array(8)].map((_, i) => (
                <div key={i} className="hidden lg:block card">
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
            <>
              {/* Mobile: list view */}
              <div className="lg:hidden space-y-2">
                {recentListings.map((listing) => (
                  <ListingCard key={listing._id} listing={listing} viewMode="list" />
                ))}
              </div>
              {/* Desktop: grid view */}
              <div className="hidden lg:grid lg:grid-cols-4 gap-4">
                {recentListings.map((listing) => (
                  <ListingCard key={listing._id} listing={listing} viewMode="grid" />
                ))}
              </div>
            </>
          )}
        </div>
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
