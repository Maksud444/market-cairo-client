import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { FiFilter, FiX, FiChevronDown, FiGrid, FiList, FiMapPin } from 'react-icons/fi';
import { useTranslation } from 'next-i18next';
import { getI18nProps } from '../lib/i18n';
import Layout from '../components/Layout';
import ListingCard from '../components/ListingCard';
import { listingsAPI, categoriesAPI } from '../lib/api';
import { useFiltersStore } from '../lib/store';

const conditions = ['New', 'Like New', 'Good', 'Fair'];

const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },
  { value: 'popular', label: 'Most Popular' },
];

export default function SearchPage() {
  const { t } = useTranslation('common');
  const router = useRouter();
  const {
    category, setCategory,
    condition, setCondition,
    location, setLocation,
    priceMin, setPriceMin,
    priceMax, setPriceMax,
    search, setSearch,
    sort, setSort,
    resetFilters
  } = useFiltersStore();

  const [listings, setListings] = useState([]);
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [subcategory, setSubcategory] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('list');
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    pages: 1,
  });

  // Sync URL params with filters store (for sidebar UI state)
  useEffect(() => {
    if (!router.isReady) return;
    setCategory(router.query.category || '');
    setSubcategory(router.query.subcategory || '');
    setCondition(router.query.condition || '');
    setLocation(router.query.location || '');
    setSearch(router.query.q || '');
    setPriceMin(router.query.minPrice || '');
    setPriceMax(router.query.maxPrice || '');
    if (router.query.sort) setSort(router.query.sort);
  }, [router.isReady, router.asPath]);

  // Fetch categories and locations
  useEffect(() => {
    const fetchFiltersData = async () => {
      try {
        const [catRes, locRes] = await Promise.all([
          categoriesAPI.getAll(),
          categoriesAPI.getLocations(),
        ]);
        if (catRes.data.success) setCategories(catRes.data.categories);
        if (locRes.data.success) setLocations(locRes.data.locations);
      } catch (error) {
        console.error('Failed to fetch filter data:', error);
      }
    };
    fetchFiltersData();
  }, []);

  // Fetch listings - reads directly from router.query to avoid store timing issues
  const fetchListings = useCallback(async (page = 1) => {
    if (!router.isReady) return;
    setIsLoading(true);
    try {
      const q = router.query;
      const params = {
        page,
        limit: 12,
        ...(q.category && { category: q.category }),
        ...(q.subcategory && { subcategory: q.subcategory }),
        ...(q.condition && { condition: q.condition }),
        ...(q.location && { location: q.location }),
        ...(q.q && { search: q.q }),
        sort: q.sort || sort || 'newest',
        ...(q.minPrice && { minPrice: q.minPrice }),
        ...(q.maxPrice && { maxPrice: q.maxPrice }),
      };

      const res = await listingsAPI.getAll(params);
      if (res.data.success) {
        setListings(res.data.listings);
        setPagination(res.data.pagination);
      }
    } catch (error) {
      console.error('Failed to fetch listings:', error);
    } finally {
      setIsLoading(false);
    }
  }, [router.isReady, router.query, sort]);

  useEffect(() => {
    fetchListings(1);
  }, [fetchListings]);

  const handlePageChange = (newPage) => {
    fetchListings(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearAllFilters = () => {
    setSubcategory('');
    resetFilters();
    router.push('/search', undefined, { shallow: true });
  };

  const activeFiltersCount = [category, subcategory, condition, location, priceMin, priceMax].filter(Boolean).length;
  const selectedCategoryData = categories.find(c => c.name === category);
  const currentCategory = router.query.category || '';
  const currentSearch = router.query.q || '';

  return (
    <Layout>
      <Head>
        <title>{currentSearch ? `Search: ${currentSearch}` : currentCategory || 'Browse All'} - MySouqify</title>
      </Head>

      <div className="container-app py-4 lg:py-8">
        {/* Page Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-gray-900">
              {currentSearch ? `Results for "${currentSearch}"` : currentCategory || 'All Listings'}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {pagination.total} {pagination.total === 1 ? 'item' : 'items'} found
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Mobile Filter Button */}
            <button
              onClick={() => setShowFilters(true)}
              className="lg:hidden btn btn-outline flex items-center gap-2"
            >
              <FiFilter size={16} />
              {t('filters.filter')}
              {activeFiltersCount > 0 && (
                <span className="w-5 h-5 bg-primary-600 text-white text-xs rounded-full flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="input pr-8 text-sm appearance-none cursor-pointer"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <FiChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
            </div>

            {/* View Mode Toggle */}
            <div className="hidden lg:flex items-center border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-primary-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                <FiGrid size={18} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-primary-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                <FiList size={18} />
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Desktop Filters Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white rounded-xl border border-gray-100 p-4 sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900">{t('filters.filter')}</h2>
                {activeFiltersCount > 0 && (
                  <button
                    onClick={clearAllFilters}
                    className="text-xs text-primary-600 hover:underline"
                  >
                    {t('filters.clear_filters')}
                  </button>
                )}
              </div>

              {/* Category Filter - OLX Style */}
              <div className="mb-6">
                <h3 className="text-base font-bold text-gray-900 mb-3">{t('filters.category')}</h3>
                <div className="space-y-0.5">
                  <button
                    onClick={() => { setCategory(''); setSubcategory(''); }}
                    className={`w-full text-left px-2 py-1.5 text-sm rounded transition-colors font-semibold ${
                      !category ? 'text-primary-600 font-bold' : 'text-gray-700 hover:text-primary-600'
                    }`}
                  >
                    {t('categories.all')}
                  </button>
                  {categories.map((cat) => (
                    <div key={cat.name}>
                      <button
                        onClick={() => { setCategory(cat.name); setSubcategory(''); }}
                        className={`w-full text-left px-2 py-1.5 text-sm rounded transition-colors flex items-center justify-between ${
                          category === cat.name
                            ? 'text-primary-600 font-bold bg-primary-50'
                            : 'text-gray-700 font-semibold hover:text-primary-600 hover:bg-gray-50'
                        }`}
                      >
                        <span>{cat.name}</span>
                        {cat.count > 0 && (
                          <span className="text-xs text-gray-400 font-normal">({cat.count})</span>
                        )}
                      </button>

                      {/* Subcategories - show indented when this category is selected */}
                      {category === cat.name && cat.subcategories?.length > 0 && (
                        <div className="ml-3 mt-0.5 space-y-0.5 border-l-2 border-primary-100 pl-3">
                          <button
                            onClick={() => setSubcategory('')}
                            className={`w-full text-left py-1 text-xs rounded transition-colors ${
                              !subcategory ? 'text-primary-600 font-medium' : 'text-gray-500 hover:text-primary-600'
                            }`}
                          >
                            All {cat.name}
                          </button>
                          {cat.subcategories.map((sub) => {
                            const subName = typeof sub === 'string' ? sub : sub.name;
                            return (
                              <button
                                key={subName}
                                onClick={() => setSubcategory(subName)}
                                className={`w-full text-left py-1 text-xs rounded transition-colors ${
                                  subcategory === subName
                                    ? 'text-primary-600 font-medium'
                                    : 'text-gray-500 hover:text-primary-600'
                                }`}
                              >
                                {subName}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Location Filter */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">{t('filters.location')}</h3>
                <select value={location} onChange={(e) => setLocation(e.target.value)}
                  className="input text-sm w-full">
                  <option value="">{t('filters.all_locations')}</option>
                  {locations.map((loc) => (
                    <option key={typeof loc === 'object' ? loc.en : loc} value={typeof loc === 'object' ? loc.en : loc}>{typeof loc === 'object' ? `${loc.en} - ${loc.ar}` : loc}</option>
                  ))}
                </select>
              </div>

              {/* Price Range Filter */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">{t('filters.price_range')} ({t('common.egp')})</h3>
                <div className="flex gap-2">
                  <input type="number" placeholder={t('filters.min_price')} value={priceMin}
                    onChange={(e) => setPriceMin(e.target.value)} className="input text-sm w-full" />
                  <span className="text-gray-400 self-center">-</span>
                  <input type="number" placeholder={t('filters.max_price')} value={priceMax}
                    onChange={(e) => setPriceMax(e.target.value)} className="input text-sm w-full" />
                </div>
              </div>

              {/* Condition Filter */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">{t('filters.condition')}</h3>
                <div className="space-y-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="condition" checked={!condition}
                      onChange={() => setCondition('')}
                      className="text-primary-600 focus:ring-primary-500" />
                    <span className="text-sm text-gray-600">{t('condition.all')}</span>
                  </label>
                  {conditions.map((cond) => (
                    <label key={cond} className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="condition" checked={condition === cond}
                        onChange={() => setCondition(cond)}
                        className="text-primary-600 focus:ring-primary-500" />
                      <span className="text-sm text-gray-600">{cond}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Listings Grid */}
          <main className="flex-1 min-w-0">
            {/* Active Filters Tags */}
            {activeFiltersCount > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {category && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary-50 text-primary-700 text-sm rounded-full">
                    {category}
                    <button onClick={() => setCategory('')} className="hover:text-primary-900">
                      <FiX size={14} />
                    </button>
                  </span>
                )}
                {condition && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary-50 text-primary-700 text-sm rounded-full">
                    {condition}
                    <button onClick={() => setCondition('')} className="hover:text-primary-900">
                      <FiX size={14} />
                    </button>
                  </span>
                )}
                {location && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary-50 text-primary-700 text-sm rounded-full">
                    <FiMapPin size={12} />
                    {location}
                    <button onClick={() => setLocation('')} className="hover:text-primary-900">
                      <FiX size={14} />
                    </button>
                  </span>
                )}
                {(priceMin || priceMax) && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary-50 text-primary-700 text-sm rounded-full">
                    {priceMin || '0'} - {priceMax || '∞'} {t('common.egp')}
                    <button onClick={() => { setPriceMin(''); setPriceMax(''); }} className="hover:text-primary-900">
                      <FiX size={14} />
                    </button>
                  </span>
                )}
              </div>
            )}

            {isLoading ? (
              <div className={`grid gap-3 lg:gap-4 ${viewMode === 'grid' ? 'grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                {[...Array(12)].map((_, i) => (
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
            ) : listings.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiFilter className="text-gray-400" size={32} />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">{t('common.no_results')}</h3>
                <p className="text-gray-500 mb-4">{t('common.try_different')}</p>
                <button onClick={clearAllFilters} className="btn btn-primary">
                  {t('filters.clear_filters')}
                </button>
              </div>
            ) : (
              <>
                <div className={`grid gap-3 lg:gap-4 ${viewMode === 'grid' ? 'grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                  {listings.map((listing) => (
                    <ListingCard key={listing._id} listing={listing} viewMode={viewMode} />
                  ))}
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className="btn btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <div className="flex items-center gap-1">
                      {[...Array(pagination.pages)].map((_, i) => (
                        <button
                          key={i}
                          onClick={() => handlePageChange(i + 1)}
                          className={`w-10 h-10 rounded-lg font-medium ${
                            pagination.page === i + 1
                              ? 'bg-primary-600 text-white'
                              : 'text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.pages}
                      className="btn btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      {showFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowFilters(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-white animate-slide-left overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">{t('filters.filter')}</h2>
              <button onClick={() => setShowFilters(false)} className="p-2 -mr-2">
                <FiX size={20} />
              </button>
            </div>

            <div className="p-4 space-y-6">
              {/* Category Filter - OLX Style Mobile */}
              <div>
                <h3 className="text-sm font-semibold text-gray-800 mb-2">{t('filters.category')}</h3>
                <div className="space-y-0.5">
                  <button
                    onClick={() => { setCategory(''); setSubcategory(''); }}
                    className={`w-full text-left px-2 py-1.5 text-sm rounded ${!category ? 'text-primary-600 font-semibold' : 'text-gray-600'}`}
                  >
                    {t('categories.all')}
                  </button>
                  {categories.map((cat) => (
                    <div key={cat.name}>
                      <button
                        onClick={() => { setCategory(cat.name); setSubcategory(''); }}
                        className={`w-full text-left px-2 py-1.5 text-sm rounded flex items-center justify-between ${
                          category === cat.name ? 'text-primary-600 font-semibold bg-primary-50' : 'text-gray-600'
                        }`}
                      >
                        <span>{cat.name}</span>
                        {cat.count > 0 && <span className="text-xs text-gray-400">({cat.count})</span>}
                      </button>
                      {category === cat.name && cat.subcategories?.length > 0 && (
                        <div className="ml-3 mt-1 space-y-1 border-l-2 border-primary-100 pl-3">
                          <button onClick={() => setSubcategory('')}
                            className={`w-full text-left py-1 text-xs ${!subcategory ? 'text-primary-600 font-medium' : 'text-gray-500'}`}>
                            All {cat.name}
                          </button>
                          {cat.subcategories.map((sub) => {
                            const subName = typeof sub === 'string' ? sub : sub.name;
                            return (
                              <button key={subName} onClick={() => setSubcategory(subName)}
                                className={`w-full text-left py-1 text-xs ${subcategory === subName ? 'text-primary-600 font-medium' : 'text-gray-500'}`}>
                                {subName}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Location Filter */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">{t('filters.location')}</h3>
                <select value={location} onChange={(e) => setLocation(e.target.value)}
                  className="input text-sm w-full">
                  <option value="">{t('filters.all_locations')}</option>
                  {locations.map((loc) => (
                    <option key={typeof loc === 'object' ? loc.en : loc} value={typeof loc === 'object' ? loc.en : loc}>{typeof loc === 'object' ? `${loc.en} - ${loc.ar}` : loc}</option>
                  ))}
                </select>
              </div>

              {/* Price Range Filter */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">{t('filters.price_range')} ({t('common.egp')})</h3>
                <div className="flex gap-2">
                  <input type="number" placeholder={t('filters.min_price')} value={priceMin}
                    onChange={(e) => setPriceMin(e.target.value)} className="input text-sm w-full" />
                  <span className="text-gray-400 self-center">-</span>
                  <input type="number" placeholder={t('filters.max_price')} value={priceMax}
                    onChange={(e) => setPriceMax(e.target.value)} className="input text-sm w-full" />
                </div>
              </div>

              {/* Condition Filter */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">{t('filters.condition')}</h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="mobile-condition" checked={!condition}
                      onChange={() => setCondition('')}
                      className="text-primary-600 focus:ring-primary-500" />
                    <span className="text-sm text-gray-600">{t('condition.all')}</span>
                  </label>
                  {conditions.map((cond) => (
                    <label key={cond} className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="mobile-condition" checked={condition === cond}
                        onChange={() => setCondition(cond)}
                        className="text-primary-600 focus:ring-primary-500" />
                      <span className="text-sm text-gray-600">{cond}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t border-gray-100 p-4 flex gap-3">
              <button
                onClick={clearAllFilters}
                className="btn btn-outline flex-1"
              >
                {t('buttons.clear')}
              </button>
              <button
                onClick={() => setShowFilters(false)}
                className="btn btn-primary flex-1"
              >
                {t('filters.apply_filters')}
              </button>
            </div>
          </div>
        </div>
      )}
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
