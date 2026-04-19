import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { FiSearch, FiGift, FiHeart, FiUsers, FiArrowRight, FiX } from 'react-icons/fi';
import { useTranslation } from 'next-i18next';
import { getI18nProps } from '../lib/i18n';
import Layout from '../components/Layout';
import DonateCard from '../components/DonateCard';
import { listingsAPI, categoriesAPI } from '../lib/api';

export default function DonatePage() {
  const { t } = useTranslation('common');
  const [donations, setDonations] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [page, setPage] = useState(1);

  const ITEMS_PER_PAGE = 12;

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [donationsRes, categoriesRes] = await Promise.all([
          listingsAPI.getAll({ isDonation: 'true', limit: 100, sort: 'recent' }),
          categoriesAPI.getDonation(),
        ]);
        if (donationsRes.data.success) setDonations(donationsRes.data.listings);
        if (categoriesRes.data.success) setCategories(categoriesRes.data.categories);
      } catch (error) {
        console.error('Failed to fetch donations:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filter by category + search
  useEffect(() => {
    let result = donations;
    if (activeCategory !== 'all') {
      result = result.filter(d => d.category === activeCategory || d.category === 'Donate');
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(d =>
        d.title.toLowerCase().includes(q) ||
        d.description?.toLowerCase().includes(q)
      );
    }
    setFiltered(result);
    setPage(1);
  }, [donations, activeCategory, search]);

  const visibleItems = filtered.slice(0, page * ITEMS_PER_PAGE);
  const canLoadMore = visibleItems.length < filtered.length;

  const catKeyMap = {
    'Mobile & Tablets': 'mobile_tablets',
    'Electronics': 'electronics',
    'Fashion & Beauty': 'fashion_beauty',
    'Furniture': 'furniture',
    'Kitchen': 'kitchen',
    'Books': 'books',
    'Other': 'other',
  };
  const getCatLabel = (name) => {
    const key = catKeyMap[name];
    return key ? t(`categories.${key}`) : name;
  };

  return (
    <Layout>
      <Head>
        <title>Free Items in Cairo — Sadaqah & Donations | MySouqify</title>
        <meta name="description" content="Give and receive free items in Cairo. Browse donation listings — clothes, furniture, electronics and more. MySouqify Sadaqah Market." />
        <link rel="canonical" href="https://mysouqify.com/donate" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="MySouqify" />
        <meta property="og:title" content="Free Items in Cairo — Sadaqah & Donations | MySouqify" />
        <meta property="og:description" content="Give and receive free items in Cairo. Browse donation listings on MySouqify Sadaqah Market." />
        <meta property="og:url" content="https://mysouqify.com/donate" />
        <meta property="og:image" content="https://mysouqify.com/og-image.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>

      {/* ── Hero Section ── */}
      <section className="relative bg-gradient-to-br from-primary-700 via-primary-600 to-primary-500 overflow-hidden">
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/10 rounded-full" />
        <div className="absolute -bottom-16 -left-16 w-60 h-60 bg-white/10 rounded-full" />

        <div className="relative container-app py-14 lg:py-20 text-center text-white">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-medium mb-5">
            <FiGift size={15} />
            {t('donate.hero_badge')}
          </div>
          <h1 className="text-3xl lg:text-5xl font-extrabold mb-4 leading-tight">
            {t('donate.hero_title')}
          </h1>
          <p className="text-primary-100 text-base lg:text-lg max-w-xl mx-auto mb-8">
            {t('donate.hero_subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/post?donate=true"
              className="inline-flex items-center justify-center gap-2 bg-white text-primary-700 font-bold px-7 py-3.5 rounded-xl hover:bg-primary-50 transition-colors shadow-lg"
            >
              <FiGift size={18} />
              {t('donate.post_donation')}
            </Link>
            <a
              href="#browse"
              className="inline-flex items-center justify-center gap-2 bg-white/20 backdrop-blur-sm text-white font-semibold px-7 py-3.5 rounded-xl hover:bg-white/30 transition-colors border border-white/30"
            >
              <FiSearch size={18} />
              {t('donate.browse_donations')}
            </a>
          </div>
        </div>
      </section>



      {/* ── How it works ── */}
      <section className="bg-primary-50 py-10">
        <div className="container-app">
          <h2 className="text-xl font-bold text-gray-900 text-center mb-8">{t('donate.how_it_works')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {[
              { icon: FiGift, step: '1', title: t('donate.step1_title'), desc: t('donate.step1_desc') },
              { icon: FiUsers, step: '2', title: t('donate.step2_title'), desc: t('donate.step2_desc') },
              { icon: FiHeart, step: '3', title: t('donate.step3_title'), desc: t('donate.step3_desc') },
            ].map(({ step, title, desc }) => (
              <div key={step} className="text-center bg-white rounded-2xl p-6 shadow-sm">
                <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-3">
                  {step}
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
                <p className="text-sm text-gray-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Browse Donations ── */}
      <section id="browse" className="container-app py-10 lg:py-14">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl lg:text-2xl font-bold text-gray-900">{t('donate.available_items')}</h2>
            {!isLoading && (
              <p className="text-sm text-gray-500 mt-0.5">
                {filtered.length} {t('donate.items_available')}
              </p>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-5">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('donate.search_placeholder')}
            className="w-full h-12 pl-11 pr-10 rounded-xl border border-gray-200 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 text-sm bg-white"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <FiX size={16} />
            </button>
          )}
        </div>

        {/* Category pills from API */}
        {categories.length > 0 && (
          <div className="flex gap-2 flex-wrap mb-8">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                activeCategory === 'all'
                  ? 'bg-primary-600 text-white shadow'
                  : 'bg-gray-100 text-gray-600 hover:bg-primary-50 hover:text-primary-700'
              }`}
            >
              {t('categories.all')}
            </button>
            {categories.map((cat) => (
              <button
                key={cat.name}
                onClick={() => setActiveCategory(cat.name)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  activeCategory === cat.name
                    ? 'bg-primary-600 text-white shadow'
                    : 'bg-gray-100 text-gray-600 hover:bg-primary-50 hover:text-primary-700'
                }`}
              >
                {getCatLabel(cat.name)}
              </button>
            ))}
          </div>
        )}

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="skeleton" style={{ aspectRatio: '4/3' }} />
                <div className="p-3 space-y-2">
                  <div className="h-4 skeleton w-3/4" />
                  <div className="h-3 skeleton w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : visibleItems.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {visibleItems.map((listing) => (
                <DonateCard key={listing._id} listing={listing} />
              ))}
            </div>
            {canLoadMore && (
              <div className="text-center mt-8">
                <button
                  onClick={() => setPage(p => p + 1)}
                  className="px-8 py-3 border-2 border-primary-500 text-primary-600 font-semibold rounded-xl hover:bg-primary-50 transition-colors"
                >
                  {t('donate.load_more')}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiGift size={36} className="text-primary-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">{t('donate.no_items_title')}</h3>
            <p className="text-gray-400 text-sm mb-6">{t('donate.no_items_desc')}</p>
            <Link href="/post?donate=true" className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-700 transition-colors">
              <FiGift size={16} />
              {t('donate.be_first')}
            </Link>
          </div>
        )}
      </section>

      {/* ── Call to Action ── */}
      <section className="bg-gradient-to-r from-primary-700 to-primary-600 py-12">
        <div className="container-app text-center text-white">
          <FiHeart size={36} className="mx-auto mb-4 opacity-90" />
          <h2 className="text-2xl lg:text-3xl font-bold mb-3">{t('donate.cta_title')}</h2>
          <p className="text-primary-100 max-w-lg mx-auto mb-7 text-sm lg:text-base">{t('donate.cta_desc')}</p>
          <Link
            href="/post?donate=true"
            className="inline-flex items-center gap-2 bg-white text-primary-700 font-bold px-8 py-3.5 rounded-xl hover:bg-primary-50 transition-colors shadow-lg"
          >
            <FiGift size={18} />
            {t('donate.cta_button')} <FiArrowRight size={16} />
          </Link>
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
