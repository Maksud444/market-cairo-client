import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { FiShield, FiArrowRight, FiPackage, FiMonitor, FiBook, FiTool, FiShoppingBag, FiMoreHorizontal, FiGift, FiHeart, FiCamera } from 'react-icons/fi';
import { useTranslation } from 'next-i18next';
import { getI18nProps } from '../lib/i18n';
import Layout from '../components/Layout';
import ListingCard from '../components/ListingCard';
import DonateCard from '../components/DonateCard';
import BannerSlider from '../components/BannerSlider';
import PromoBanner from '../components/PromoBanner';
import { listingsAPI, categoriesAPI } from '../lib/api';
import RentCard from '../components/RentCard';

const categoryIcons = {
  'Mobile & Tablets': FiShoppingBag,
  'Electronics': FiMonitor,
  'Fashion & Beauty': FiShoppingBag,
  'Furniture': FiPackage,
  'Kitchen': FiTool,
  'Books': FiBook,
  'Other': FiMoreHorizontal,
};

const catKeyMap = {
  'Mobile & Tablets': 'mobile_tablets',
  'Electronics': 'electronics',
  'Fashion & Beauty': 'fashion_beauty',
  'Furniture': 'furniture',
  'Kitchen': 'kitchen',
  'Books': 'books',
  'Other': 'other',
};

export default function Home({ featuredListings = [], recentListings = [], donationListings = [], rentListings = [], categories = [] }) {
  const { t } = useTranslation('common');
  const [isLoading] = useState(false);
  const [recentlyViewed, setRecentlyViewed] = useState([]);

  useEffect(() => {
    try {
      const items = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
      setRecentlyViewed(items.slice(0, 6));
    } catch {}
  }, []);

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'MySouqify',
    url: 'https://mysouqify.com',
    logo: 'https://mysouqify.com/logo.png',
    description: "Egypt's trusted marketplace for buying and selling second-hand items.",
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Cairo',
      addressCountry: 'EG',
    },
    sameAs: [
      'https://www.facebook.com/mysouqify',
      'https://www.instagram.com/mysouqify',
      'https://www.tiktok.com/@mysouqify',
    ],
  };

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'MySouqify',
    url: 'https://mysouqify.com',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://mysouqify.com/search?q={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <Layout>
      <Head>
        <title>MySouqify - Buy & Sell Used Items in Cairo</title>
        <meta name="description" content="Egypt's trusted marketplace for buying and selling second-hand items. Find great deals on furniture, electronics, and more in Cairo." />
        <link rel="canonical" href="https://mysouqify.com" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="MySouqify - Buy & Sell Used Items in Cairo" />
        <meta property="og:description" content="Egypt's trusted marketplace for buying and selling second-hand items. Find great deals on furniture, electronics, and more in Cairo." />
        <meta property="og:url" content="https://mysouqify.com" />
        <meta property="og:site_name" content="MySouqify" />
        <meta name="twitter:card" content="summary_large_image" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </Head>

      {/* Banner Slider - Both mobile and desktop */}
      <BannerSlider />

      {/* Promo Banner */}
      <PromoBanner />

      {/* Browse Categories — shown on tablet (md) only; desktop uses header nav, mobile uses header icon strip */}
      <section className="hidden md:block lg:hidden container-app py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">{t('home.browse_categories')}</h2>
          <Link href="/search" className="text-sm text-primary-600 hover:underline flex items-center gap-1">
            {t('home.view_all')} <FiArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {categories.map((category) => {
            const Icon = categoryIcons[category.name] || FiPackage;
            return (
              <Link key={category.name} href={`/search?category=${encodeURIComponent(category.name)}`}
                className="flex flex-col items-center p-3 bg-white rounded-xl border border-gray-100 hover:border-primary-500 hover:shadow-card transition-all group">
                <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center mb-1.5 group-hover:bg-primary-50 transition-colors">
                  <Icon className="text-primary-600" size={20} />
                </div>
                <span className="text-xs text-gray-700 text-center font-semibold leading-tight">{catKeyMap[category.name] ? t(`categories.${catKeyMap[category.name]}`) : category.name}</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured Listings */}
      {featuredListings.length > 0 && (
        <section className="pb-6 lg:pb-16">
          <div className="flex items-center justify-between mb-3 lg:mb-6 px-3 lg:container-app">
            <h2 className="text-base font-bold text-gray-900 lg:text-2xl">{t('home.featured_listings')}</h2>
            <Link href="/search?featured=true" className="text-sm font-semibold text-primary-600 hover:underline flex items-center gap-0.5">
              {t('home.view_all')} <FiArrowRight size={14} />
            </Link>
          </div>

          {/* Mobile: horizontal slider */}
          <div className="lg:hidden overflow-x-auto no-scrollbar pl-3">
            <div className="flex gap-2.5 pr-3" style={{ width: 'max-content' }}>
              {isLoading
                ? [...Array(4)].map((_, i) => (
                    <div key={i} className="bg-white rounded-xl border border-gray-100 overflow-hidden flex-shrink-0" style={{ width: '160px' }}>
                      <div className="skeleton" style={{ aspectRatio: '4/3' }} />
                      <div className="p-2.5 space-y-1.5">
                        <div className="h-3 skeleton w-2/3" />
                        <div className="h-4 skeleton w-1/2" />
                        <div className="h-3 skeleton w-3/4" />
                      </div>
                    </div>
                  ))
                : featuredListings.slice(0, 8).map((listing) => (
                    <div key={listing._id} className="flex-shrink-0" style={{ width: '160px' }}>
                      <ListingCard listing={listing} viewMode="grid" />
                    </div>
                  ))
              }
            </div>
          </div>

          {/* Desktop: 4-col grid */}
          <div className="hidden lg:grid lg:grid-cols-4 gap-4 container-app">
            {featuredListings.slice(0, 4).map((listing) => (
              <ListingCard key={listing._id} listing={listing} />
            ))}
          </div>
        </section>
      )}

      {/* Recent Listings */}
      <section className="pb-8 lg:pb-16">
        <div className="lg:container-app">
          <div className="flex items-center justify-between mb-3 lg:mb-6 px-3 lg:px-0">
            <h2 className="text-base font-bold text-gray-900 lg:text-2xl">{t('home.recent_listings')}</h2>
            <Link href="/search" className="text-sm font-semibold text-primary-600 hover:underline flex items-center gap-0.5">
              {t('home.view_all')} <FiArrowRight size={14} />
            </Link>
          </div>

          {/* Mobile: horizontal slider */}
          <div className="lg:hidden overflow-x-auto no-scrollbar pl-3">
            <div className="flex gap-2.5 pr-3" style={{ width: 'max-content' }}>
              {isLoading
                ? [...Array(4)].map((_, i) => (
                    <div key={i} className="bg-white rounded-xl border border-gray-100 overflow-hidden flex-shrink-0" style={{ width: '160px' }}>
                      <div className="skeleton" style={{ aspectRatio: '4/3' }} />
                      <div className="p-2.5 space-y-1.5">
                        <div className="h-3 skeleton w-2/3" />
                        <div className="h-4 skeleton w-1/2" />
                        <div className="h-3 skeleton w-3/4" />
                      </div>
                    </div>
                  ))
                : recentListings.map((listing) => (
                    <div key={listing._id} className="flex-shrink-0" style={{ width: '160px' }}>
                      <ListingCard listing={listing} viewMode="grid" />
                    </div>
                  ))
              }
            </div>
          </div>

          {/* Desktop: 4-col grid */}
          <div className="hidden lg:grid lg:grid-cols-4 gap-4">
            {isLoading
              ? [...Array(8)].map((_, i) => (
                  <div key={i} className="card">
                    <div className="aspect-card skeleton" />
                    <div className="p-3 space-y-2">
                      <div className="h-4 skeleton w-3/4" />
                      <div className="h-5 skeleton w-1/2" />
                      <div className="h-3 skeleton w-full" />
                    </div>
                  </div>
                ))
              : recentListings.map((listing) => (
                  <ListingCard key={listing._id} listing={listing} viewMode="grid" />
                ))
            }
          </div>
        </div>
      </section>

      {/* Items for Rent Section */}
      <section className="pb-8 lg:pb-16">
        <div className="flex items-center justify-between mb-3 lg:mb-6 px-3 lg:container-app">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-50 rounded-xl flex items-center justify-center">
              <FiCamera className="text-primary-600" size={16} />
            </div>
            <h2 className="text-base font-bold text-gray-900 lg:text-2xl">{t('rent.section_title')}</h2>
          </div>
          <Link href="/rent" className="text-sm font-semibold text-primary-600 hover:underline flex items-center gap-0.5">
            {t('home.view_all')} <FiArrowRight size={14} />
          </Link>
        </div>

        {/* Mobile: horizontal slider */}
        <div className="lg:hidden overflow-x-auto no-scrollbar pl-3">
          <div className="flex gap-2.5 pr-3" style={{ width: 'max-content' }}>
            {isLoading
              ? [...Array(4)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl border border-gray-100 overflow-hidden flex-shrink-0" style={{ width: '160px' }}>
                    <div className="skeleton" style={{ aspectRatio: '4/3' }} />
                    <div className="p-2.5 space-y-1.5">
                      <div className="h-3 skeleton w-2/3" />
                      <div className="h-4 skeleton w-1/2" />
                      <div className="h-3 skeleton w-3/4" />
                    </div>
                  </div>
                ))
              : rentListings.length > 0
                ? rentListings.map((listing) => (
                    <div key={listing._id} className="flex-shrink-0" style={{ width: '160px' }}>
                      <RentCard listing={listing} compact />
                    </div>
                  ))
                : null
            }
          </div>
        </div>

        {/* Desktop: grid */}
        <div className="hidden lg:grid lg:grid-cols-3 gap-4 container-app">
          {isLoading
            ? [...Array(3)].map((_, i) => (
                <div key={i} className="card">
                  <div className="aspect-card skeleton" />
                  <div className="p-3 space-y-2">
                    <div className="h-4 skeleton w-3/4" />
                    <div className="h-5 skeleton w-1/2" />
                    <div className="h-3 skeleton w-full" />
                  </div>
                </div>
              ))
            : rentListings.length > 0
              ? rentListings.slice(0, 3).map((listing) => (
                  <RentCard key={listing._id} listing={listing} />
                ))
              : (
                <div className="col-span-3 text-center py-10 bg-white rounded-2xl border border-dashed border-primary-200">
                  <FiCamera size={32} className="text-primary-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">{t('rent.no_items_yet')}</p>
                  <Link href="/rent/post" className="mt-3 inline-block text-sm font-semibold text-primary-600 hover:underline">{t('rent.post_rent_cta')}</Link>
                </div>
              )
          }
        </div>
      </section>

      {/* Community Donations Section */}
      <section className="py-10 lg:py-16 bg-gray-50">
        <div className="container-app">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
            <div>
              <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-xs font-semibold mb-2">
                <FiGift size={13} />
                {t('donate.section_badge')}
              </div>
              <h2 className="text-xl lg:text-2xl font-bold text-gray-900">{t('donate.section_title')}</h2>
              <p className="text-sm text-gray-500 mt-1 max-w-lg">{t('donate.section_subtitle')}</p>
            </div>
            <Link href="/donate" className="inline-flex items-center gap-1 text-sm font-semibold text-primary-600 hover:underline flex-shrink-0">
              {t('home.view_all')} <FiArrowRight size={14} />
            </Link>
          </div>

          {/* Cards */}
          {isLoading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                  <div className="skeleton" style={{ aspectRatio: '4/3' }} />
                  <div className="p-3 space-y-2">
                    <div className="h-4 skeleton w-3/4" />
                    <div className="h-3 skeleton w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : donationListings.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {donationListings.map((listing) => (
                <DonateCard key={listing._id} listing={listing} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-primary-200">
              <FiHeart size={32} className="text-primary-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">{t('donate.no_items_yet')}</p>
            </div>
          )}

          {/* Single CTA strip */}
          <div className="mt-8 bg-primary-600 rounded-2xl p-5 lg:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-white">
            <div className="text-center sm:text-left">
              <p className="font-bold text-lg">{t('donate.impact_title')}</p>
              <p className="text-primary-100 text-sm">{t('donate.impact_desc')}</p>
            </div>
            <Link
              href="/donate"
              className="flex-shrink-0 bg-white text-primary-700 font-bold px-6 py-2.5 rounded-xl hover:bg-primary-50 transition-colors text-sm"
            >
              {t('donate.section_cta')}
            </Link>
          </div>
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
        <h2 className="text-xl lg:text-2xl font-bold text-gray-900 text-center mb-10">{t('home.how_it_works')}</h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 lg:gap-8 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
              1
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">{t('home.how_step1_title')}</h3>
            <p className="text-sm text-gray-600">{t('home.how_step1_desc')}</p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
              2
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">{t('home.how_step2_title')}</h3>
            <p className="text-sm text-gray-600">{t('home.how_step2_desc')}</p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
              3
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">{t('home.how_step3_title')}</h3>
            <p className="text-sm text-gray-600">{t('home.how_step3_desc')}</p>
          </div>
        </div>
      </section>

      {/* Recently Viewed */}
      {recentlyViewed.length > 0 && (
        <section className="container-app py-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg lg:text-xl font-bold text-gray-900">Recently Viewed</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {recentlyViewed.map((item) => (
              <Link key={item._id} href={`/listing/${item._id}`} className="group bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-all">
                <div className="relative bg-gray-100" style={{ aspectRatio: '1' }}>
                  {item.images?.[0]?.url ? (
                    <img src={item.images[0].url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 text-2xl">📦</div>
                  )}
                </div>
                <div className="p-2">
                  <p className="text-xs font-medium text-gray-800 line-clamp-1">{item.title}</p>
                  <p className="text-xs font-bold text-primary-600 mt-0.5">
                    {item.isDonation || item.price === 0 ? 'FREE' : `${item.price?.toLocaleString()} EGP`}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

    </Layout>
  );
}

export async function getStaticProps({ locale }) {
  const API = process.env.INTERNAL_API_URL ||
    (process.env.NEXT_PUBLIC_API_URL
      ? process.env.NEXT_PUBLIC_API_URL.replace(/\/api$/, '')
      : 'http://localhost:5000');

  const safeFetch = async (url) => {
    try {
      const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
      if (!res.ok) return null;
      return res.json();
    } catch {
      return null;
    }
  };

  const [featuredData, recentData, categoriesData, donationsData, rentData] = await Promise.all([
    safeFetch(`${API}/api/listings/featured`),
    safeFetch(`${API}/api/listings/recent?limit=8`),
    safeFetch(`${API}/api/categories`),
    safeFetch(`${API}/api/listings/donations?limit=4`),
    safeFetch(`${API}/api/listings/rent?limit=6`),
  ]);

  const featured = featuredData?.success ? featuredData.listings : [];
  const featuredIds = new Set(featured.map(l => l._id));
  const recent = recentData?.success
    ? recentData.listings.filter(l => !featuredIds.has(l._id))
    : [];

  return {
    props: {
      ...(await getI18nProps(locale)),
      featuredListings: featured,
      recentListings: recent,
      donationListings: donationsData?.success ? donationsData.listings : [],
      rentListings: rentData?.success ? rentData.listings : [],
      categories: categoriesData?.success ? categoriesData.categories : [],
    },
    revalidate: 60, // ISR — rebuild every 60 seconds
  };
}
