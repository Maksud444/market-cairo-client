import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FiSearch, FiHeart, FiMessageSquare, FiUser, FiPlus, FiMenu, FiMapPin, FiX, FiShield, FiBell, FiCheck, FiChevronDown, FiNavigation } from 'react-icons/fi';
import { useTranslation } from 'next-i18next';
import { useAuthStore, useMessagesStore, useUIStore } from '../lib/store';
import { authAPI, categoriesAPI } from '../lib/api';
import LanguageSwitcher from './LanguageSwitcher';
import { cairoAreas, cairoCompounds } from '../lib/cairoLocations';

const fallbackCategories = [
  'Mobile & Tablets', 'Electronics', 'Fashion & Beauty', 'Furniture', 'Kitchen', 'Books', 'Other'
];

export default function Header() {
  const { t } = useTranslation('common');
  const router = useRouter();
  const isArabic = router.locale === 'ar';
  const { user, isAuthenticated } = useAuthStore();
  const { unreadCount, fetchUnreadCount } = useMessagesStore();
  const { toggleMobileMenu, isMobileMenuOpen, setMobileMenuOpen, openLoginModal } = useUIStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notifUnread, setNotifUnread] = useState(0);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [apiCategories, setApiCategories] = useState([]);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const notifRef = useRef(null);
  const locationRef = useRef(null);

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const data = await res.json();
          const suburb = data.address?.suburb || data.address?.neighbourhood || data.address?.city_district || null;
          if (suburb) {
            setSelectedLocation({ en: suburb, ar: suburb });
            router.push(`/search?location=${encodeURIComponent(suburb)}`);
          } else {
            setSelectedLocation({ en: 'Current Location', ar: 'موقعي الحالي' });
          }
        } catch {
          setSelectedLocation({ en: 'Current Location', ar: 'موقعي الحالي' });
        } finally {
          setIsLocating(false);
          setShowLocationDropdown(false);
        }
      },
      () => setIsLocating(false)
    );
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (locationRef.current && !locationRef.current.contains(e.target)) {
        setShowLocationDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchUnreadCount();
      fetchNotifications();
    }
  }, [isAuthenticated, fetchUnreadCount]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await authAPI.getNotifications();
      if (res.data.success) {
        setNotifications(res.data.notifications);
        setNotifUnread(res.data.unreadCount);
      }
    } catch (err) {
      // silently fail
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await authAPI.markAllNotificationsRead();
      setNotifUnread(0);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      // silently fail
    }
  };

  const getTimeAgo = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'now';
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h`;
    const days = Math.floor(hrs / 24);
    return `${days}d`;
  };

  useEffect(() => {
    categoriesAPI.getAll().then(res => {
      if (res.data.success) setApiCategories(res.data.categories);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleCategoryClick = (category) => {
    router.push(`/search?category=${encodeURIComponent(category)}`);
  };

  return (
    <header className={`sticky top-0 z-50 bg-white transition-shadow duration-200 ${isScrolled ? 'shadow-md' : 'shadow-sm'}`}>
      {/* Main Header */}
      <div className="container-app">
        <div className="flex items-center justify-between h-16 lg:h-18">
          {/* Mobile Menu Button */}
          <button 
            onClick={toggleMobileMenu}
            className="p-2 -ml-2 lg:hidden text-gray-600 hover:text-gray-900"
          >
            {isMobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">M</span>
            </div>
            <span className="hidden sm:block text-xl font-semibold text-gray-900">MySouqify</span>
          </Link>

          {/* Location Selector - Desktop */}
          <div className="hidden lg:block ml-4 relative" ref={locationRef}>
            <button
              onClick={() => setShowLocationDropdown(!showLocationDropdown)}
              className="flex items-center gap-1.5 text-gray-600 hover:text-primary-600 text-sm transition-colors"
            >
              <FiMapPin size={16} className="text-primary-600" />
              <span className="font-medium">
                {selectedLocation ? (isArabic ? selectedLocation.ar : selectedLocation.en) : (isArabic ? 'القاهرة' : 'Cairo')}
              </span>
              <FiChevronDown size={14} className={`transition-transform ${showLocationDropdown ? 'rotate-180' : ''}`} />
            </button>

            {showLocationDropdown && (
              <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-100 z-50 max-h-96 overflow-y-auto">
                {/* Current Location */}
                <button
                  onClick={handleCurrentLocation}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-primary-600 hover:bg-primary-50 transition-colors border-b border-gray-100 font-medium"
                >
                  <FiNavigation size={15} className={isLocating ? 'animate-spin' : ''} />
                  {isLocating
                    ? (isArabic ? 'جاري التحديد...' : 'Detecting...')
                    : (isArabic ? 'استخدم موقعي الحالي' : 'Use my current location')}
                </button>

                <div className="p-3 border-b border-gray-100">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                    {isArabic ? 'المناطق' : 'Areas'}
                  </p>
                </div>
                <div className="py-1">
                  {cairoAreas.map((area) => (
                    <button
                      key={area.en}
                      onClick={() => {
                        setSelectedLocation(area.en === 'All Cairo' ? null : area);
                        setShowLocationDropdown(false);
                        router.push(`/search?location=${encodeURIComponent(area.en === 'All Cairo' ? '' : area.en)}`);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-primary-50 hover:text-primary-600 transition-colors ${
                        selectedLocation?.en === area.en ? 'bg-primary-50 text-primary-600 font-medium' : 'text-gray-700'
                      }`}
                    >
                      {isArabic ? area.ar : area.en}
                    </button>
                  ))}
                </div>
                <div className="p-3 border-t border-b border-gray-100">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                    {isArabic ? 'الكمبوندات' : 'Compounds'}
                  </p>
                </div>
                <div className="py-1">
                  {cairoCompounds.map((compound) => (
                    <button
                      key={compound.en}
                      onClick={() => {
                        setSelectedLocation(compound);
                        setShowLocationDropdown(false);
                        router.push(`/search?location=${encodeURIComponent(compound.en)}`);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-primary-50 hover:text-primary-600 transition-colors ${
                        selectedLocation?.en === compound.en ? 'bg-primary-50 text-primary-600 font-medium' : 'text-gray-700'
                      }`}
                    >
                      {isArabic ? compound.ar : compound.en}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Search Bar - Desktop */}
          <form onSubmit={handleSearch} className="hidden lg:flex flex-1 max-w-xl mx-8">
            <div className="relative w-full">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('common.search_placeholder')}
                className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary-500 focus:bg-white transition-all"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700 transition-colors"
              >
                {t('buttons.search')}
              </button>
            </div>
          </form>

          {/* Location - Mobile */}
          <button
            onClick={() => setShowLocationDropdown(!showLocationDropdown)}
            className="lg:hidden flex items-center gap-1 text-gray-600 text-sm"
          >
            <FiMapPin size={16} className="text-primary-600" />
            <span>{selectedLocation ? (isArabic ? selectedLocation.ar : selectedLocation.en) : (isArabic ? 'القاهرة' : 'Cairo')}</span>
            <FiChevronDown size={12} />
          </button>

          {/* Mobile Location Dropdown Overlay */}
          {showLocationDropdown && (
            <div
              className="lg:hidden fixed inset-0 z-50 bg-black/50"
              onClick={() => setShowLocationDropdown(false)}
            >
              <div
                className="absolute top-28 left-4 right-4 bg-white rounded-xl shadow-xl border border-gray-100 max-h-[70vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={handleCurrentLocation}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-primary-600 hover:bg-primary-50 border-b border-gray-100 font-medium"
                >
                  <FiNavigation size={15} className={isLocating ? 'animate-spin' : ''} />
                  {isLocating ? 'Detecting...' : 'Use my current location'}
                </button>
                <div className="p-3 border-b border-gray-100">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Areas</p>
                </div>
                <div className="py-1">
                  {cairoAreas.map((area) => (
                    <button
                      key={area.en}
                      onClick={() => {
                        setSelectedLocation(area.en === 'All Cairo' ? null : area);
                        setShowLocationDropdown(false);
                        router.push(`/search?location=${encodeURIComponent(area.en === 'All Cairo' ? '' : area.en)}`);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                        selectedLocation?.en === area.en ? 'bg-primary-50 text-primary-600 font-medium' : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {isArabic ? area.ar : area.en}
                    </button>
                  ))}
                </div>
                <div className="p-3 border-t border-b border-gray-100">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Compounds</p>
                </div>
                <div className="py-1">
                  {cairoCompounds.map((compound) => (
                    <button
                      key={compound.en}
                      onClick={() => {
                        setSelectedLocation(compound);
                        setShowLocationDropdown(false);
                        router.push(`/search?location=${encodeURIComponent(compound.en)}`);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                        selectedLocation?.en === compound.en ? 'bg-primary-50 text-primary-600 font-medium' : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {isArabic ? compound.ar : compound.en}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Right Actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            {isAuthenticated ? (
              <>
                <Link
                  href="/favorites"
                  className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <FiHeart size={20} />
                  <span className="hidden lg:inline text-sm">{t('nav.favorites')}</span>
                </Link>

                <Link
                  href="/messages"
                  className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors relative"
                >
                  <FiMessageSquare size={20} />
                  <span className="hidden lg:inline text-sm">{t('nav.messages')}</span>
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 left-5 sm:left-auto sm:right-0 lg:-right-1 w-4 h-4 bg-primary-600 text-white text-xs rounded-full flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>

                {/* Notification Bell */}
                <div className="relative" ref={notifRef}>
                  <button
                    onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                    className="flex items-center gap-1.5 px-2 sm:px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors relative"
                  >
                    <FiBell size={20} />
                    {notifUnread > 0 && (
                      <span className="absolute top-0 left-6 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                        {notifUnread > 9 ? '9+' : notifUnread}
                      </span>
                    )}
                  </button>

                  {showNotifDropdown && (
                    <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50 overflow-hidden">
                      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                        <h3 className="font-semibold text-gray-900 text-sm">Notifications</h3>
                        {notifUnread > 0 && (
                          <button
                            onClick={handleMarkAllRead}
                            className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700"
                          >
                            <FiCheck size={14} />
                            Mark all read
                          </button>
                        )}
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="px-4 py-8 text-center text-gray-400 text-sm">
                            No notifications yet
                          </div>
                        ) : (
                          notifications.map((notif) => (
                            <div
                              key={notif._id}
                              className={`px-4 py-3 border-b border-gray-50 hover:bg-gray-50 cursor-pointer ${!notif.read ? 'bg-primary-50/50' : ''}`}
                              onClick={async () => {
                                if (!notif.read) {
                                  try {
                                    await authAPI.markNotificationRead(notif._id);
                                    setNotifications(prev => prev.map(n => n._id === notif._id ? { ...n, read: true } : n));
                                    setNotifUnread(prev => Math.max(0, prev - 1));
                                  } catch (err) {}
                                }
                                if (notif.relatedId) {
                                  const path = notif.type === 'listing' ? `/listing/${notif.relatedId}` : '/dashboard';
                                  router.push(path);
                                  setShowNotifDropdown(false);
                                }
                              }}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <p className={`text-sm ${!notif.read ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
                                    {notif.title}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notif.content}</p>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0">
                                  {!notif.read && <span className="w-2 h-2 bg-primary-500 rounded-full" />}
                                  <span className="text-xs text-gray-400">{getTimeAgo(notif.createdAt)}</span>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <LanguageSwitcher />

                <Link
                  href="/dashboard"
                  className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <FiUser size={20} />
                  <span className="hidden lg:inline text-sm">{t('nav.dashboard')}</span>
                </Link>

                {user?.isAdmin && (
                  <Link
                    href="/cp-x4m9k2"
                    className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-primary-600 hover:text-primary-700 transition-colors"
                  >
                    <FiShield size={20} />
                    <span className="hidden lg:inline text-sm font-medium">{t('nav.admin')}</span>
                  </Link>
                )}

                <Link
                  href="/post"
                  className="flex items-center gap-1.5 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <FiPlus size={18} />
                  <span className="hidden sm:inline">{t('nav.post')}</span>
                </Link>
              </>
            ) : (
              <>
                <LanguageSwitcher />

                <button
                  onClick={openLoginModal}
                  className="px-4 py-2 text-gray-600 text-sm font-medium hover:text-gray-900 transition-colors"
                >
                  {t('nav.login')}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Search Bar - Mobile */}
        <div className="lg:hidden pb-3">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('common.search_placeholder')}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary-500 focus:bg-white transition-all"
              />
            </div>
          </form>
        </div>

        {/* Category Navigation - Desktop */}
        <nav className="hidden lg:block border-t border-gray-100">
          <div className="flex items-center gap-6 py-2.5">
            {(apiCategories.length > 0 ? apiCategories : fallbackCategories.map(c => ({ name: c, subcategories: [] }))).map((cat) => (
              <div
                key={cat.name}
                className="relative"
                onMouseEnter={() => setHoveredCategory(cat.name)}
                onMouseLeave={() => setHoveredCategory(null)}
              >
                <button
                  onClick={() => handleCategoryClick(cat.name)}
                  className="flex items-center gap-0.5 text-sm text-gray-600 hover:text-primary-600 transition-colors whitespace-nowrap py-2.5"
                >
                  {cat.name}
                  {cat.subcategories?.length > 0 && (
                    <FiChevronDown size={12} className={`transition-transform mt-0.5 ${hoveredCategory === cat.name ? 'rotate-180' : ''}`} />
                  )}
                </button>
                {hoveredCategory === cat.name && cat.subcategories?.length > 0 && (
                  <div className="absolute top-full left-0 mt-0 w-52 bg-white rounded-xl shadow-xl border border-gray-100 z-50 py-1">
                    {cat.subcategories.map((sub) => {
                      const subName = typeof sub === 'string' ? sub : sub.name;
                      return (
                        <button
                          key={subName}
                          onClick={() => router.push(`/search?category=${encodeURIComponent(cat.name)}&subcategory=${encodeURIComponent(subName)}`)}
                          className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-primary-50 hover:text-primary-600 transition-colors"
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
        </nav>

        {/* Category Pills - Mobile */}
        <div className="lg:hidden pb-2 -mx-4 px-4 overflow-x-auto no-scrollbar">
          <div className="flex gap-2">
            {(apiCategories.length > 0 ? apiCategories : fallbackCategories.map(c => ({ name: c, subcategories: [] }))).map((cat) => (
              <button
                key={cat.name}
                onClick={() => handleCategoryClick(cat.name)}
                className="category-pill"
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed top-0 left-0 w-72 h-full bg-white z-50 lg:hidden animate-slide-up">
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">M</span>
                </div>
                <span className="text-xl font-semibold">MySouqify</span>
              </div>
            </div>
            <nav className="p-4 space-y-1">
              {isAuthenticated ? (
                <>
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-3 px-3 py-2.5 text-gray-700 hover:bg-gray-50 rounded-lg"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <FiUser size={20} />
                    <span>{t('nav.dashboard')}</span>
                  </Link>
                  <Link
                    href="/favorites"
                    className="flex items-center gap-3 px-3 py-2.5 text-gray-700 hover:bg-gray-50 rounded-lg"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <FiHeart size={20} />
                    <span>{t('nav.favorites')}</span>
                  </Link>
                  <Link
                    href="/messages"
                    className="flex items-center gap-3 px-3 py-2.5 text-gray-700 hover:bg-gray-50 rounded-lg"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <FiMessageSquare size={20} />
                    <span>{t('nav.messages')}</span>
                    {unreadCount > 0 && (
                      <span className="ml-auto px-2 py-0.5 bg-primary-600 text-white text-xs rounded-full">
                        {unreadCount}
                      </span>
                    )}
                  </Link>
                  <button
                    onClick={() => { setMobileMenuOpen(false); setShowNotifDropdown(!showNotifDropdown); }}
                    className="flex items-center gap-3 px-3 py-2.5 text-gray-700 hover:bg-gray-50 rounded-lg w-full"
                  >
                    <FiBell size={20} />
                    <span>{t('nav.notifications') || 'Notifications'}</span>
                    {notifUnread > 0 && (
                      <span className="ml-auto px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                        {notifUnread}
                      </span>
                    )}
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => { setMobileMenuOpen(false); openLoginModal(); }}
                    className="flex items-center gap-3 px-3 py-2.5 text-gray-700 hover:bg-gray-50 rounded-lg w-full"
                  >
                    <FiUser size={20} />
                    <span>{t('nav.login')}</span>
                  </button>
                </>
              )}
              <hr className="my-3" />
              <p className="px-3 py-2 text-xs font-medium text-gray-400 uppercase">Categories</p>
              {(apiCategories.length > 0 ? apiCategories : fallbackCategories.map(c => ({ name: c, subcategories: [] }))).map((cat) => (
                <Link
                  key={cat.name}
                  href={`/search?category=${encodeURIComponent(cat.name)}`}
                  className="block px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {cat.name}
                </Link>
              ))}
            </nav>
          </div>
        </>
      )}
    </header>
  );
}
