import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { FiShield, FiArrowRight, FiPackage, FiMonitor, FiBook, FiTool, FiShoppingBag, FiMoreHorizontal, FiGift, FiHeart, FiCamera, FiMail, FiCheck } from 'react-icons/fi';
import { useTranslation } from 'next-i18next';
import { getI18nProps } from '../lib/i18n';
import Layout from '../components/Layout';
import ListingCard from '../components/ListingCard';
import DonateCard from '../components/DonateCard';
import BannerSlider from '../components/BannerSlider';
import PromoBanner from '../components/PromoBanner';
import { listingsAPI, categoriesAPI, newsletterAPI } from '../lib/api';
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

export default function Home() {
  const { t } = useTranslation('common');
  const [featuredListings, setFeaturedListings] = useState([]);
  const [recentListings, setRecentListings] = useState([]);
  const [donationListings, setDonationListings] = useState([]);
  const [rentListings, setRentListings] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState('idle'); // idle | loading | success | error

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    setNewsletterStatus('loading');
    try {
      await newsletterAPI.subscribe(newsletterEmail.trim());
      setNewsletterStatus('success');
      setNewsletterEmail('');
    } catch {
      setNewsletterStatus('error');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [featuredRes, recentRes, categoriesRes, donationsRes, rentRes] = await Promise.all([
          listingsAPI.getFeatured(),
          listingsAPI.getRecent(8),
          categoriesAPI.getAll(),
          listingsAPI.getDonations(4),
          listingsAPI.getRentListings({ limit: 6 }),
        ]);

        const featured = featuredRes.data.success ? featuredRes.data.listings : [];
        if (featured.length) setFeaturedListings(featured);

        if (recentRes.data.success) {
          const featuredIds = new Set(featured.map(l => l._id));
          setRecentListings(recentRes.data.listings.filter(l => !featuredIds.has(l._id)));
        }
        if (categoriesRes.data.success) setCategories(categoriesRes.data.categories);
        if (donationsRes.data.success) setDonationListings(donationsRes.data.listings);
        if (rentRes.data.success) setRentListings(rentRes.data.listings);
      } catch (error) {
        console.error('Failed to fetch homepage data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
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
    sameAs: [],
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

      {/* Newsletter Section */}
      <section className="bg-primary-600 py-12 lg:py-16">
        <div className="container-app text-center">
          <div className="max-w-xl mx-auto">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiMail className="text-white" size={22} />
            </div>
            <h2 className="text-2xl lg:text-3xl font-bold text-white mb-2">Stay Updated</h2>
            <p className="text-primary-100 mb-6 text-sm lg:text-base">Get the best deals and new listings straight to your inbox.</p>
            {newsletterStatus === 'success' ? (
              <div className="flex items-center justify-center gap-2 text-white font-medium">
                <FiCheck size={20} /> Subscribed successfully! Thank you.
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="flex gap-2 max-w-md mx-auto">
                <input
                  type="email"
                  value={newsletterEmail}
                  onChange={e => { setNewsletterEmail(e.target.value); setNewsletterStatus('idle'); }}
                  placeholder="Enter your email address"
                  required
                  className="flex-1 px-4 py-3 rounded-xl text-sm focus:outline-none text-gray-900"
                />
                <button
                  type="submit"
                  disabled={newsletterStatus === 'loading'}
                  className="px-5 py-3 bg-white text-primary-600 font-bold rounded-xl text-sm hover:bg-primary-50 transition-colors disabled:opacity-70 whitespace-nowrap"
                >
                  {newsletterStatus === 'loading' ? '...' : 'Subscribe'}
                </button>
              </form>
            )}
            {newsletterStatus === 'error' && (
              <p className="text-red-200 text-sm mt-2">Something went wrong. Please try again.</p>
            )}
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
