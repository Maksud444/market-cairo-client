import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FiSearch, FiHeart, FiMessageSquare, FiUser, FiPlus, FiMenu, FiMapPin, FiX, FiShield, FiBell, FiChevronDown, FiNavigation, FiMonitor, FiPackage, FiBook, FiTool, FiShoppingBag, FiMoreHorizontal } from 'react-icons/fi';
import { useTranslation } from 'next-i18next';
import { useAuthStore, useMessagesStore, useUIStore } from '../lib/store';
import { authAPI, categoriesAPI } from '../lib/api';
import LanguageSwitcher from './LanguageSwitcher';
import { cairoAreas, cairoCompounds } from '../lib/cairoLocations';

const categoryIcons = {
  'Mobile & Tablets': FiShoppingBag,
  'Electronics': FiMonitor,
  'Fashion & Beauty': FiShoppingBag,
  'Furniture': FiPackage,
  'Kitchen': FiTool,
  'Books': FiBook,
  'Other': FiMoreHorizontal,
};

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
  const [notifUnread, setNotifUnread] = useState(0);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [apiCategories, setApiCategories] = useState([]);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const locationRef = useRef(null);

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
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
      authAPI.getNotifications().then(res => {
        if (res.data.success) setNotifUnread(res.data.unreadCount);
      }).catch(() => {});
    }
  }, [isAuthenticated, fetchUnreadCount]);

  useEffect(() => {
    categoriesAPI.getAll().then(res => {
      if (res.data.success) setApiCategories(res.data.categories);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  const handleCategoryClick = (category) => {
    router.push(`/search?category=${encodeURIComponent(category)}`);
  };

  const cats = apiCategories.length > 0 ? apiCategories : fallbackCategories.map(c => ({ name: c, subcategories: [] }));
  const locationLabel = selectedLocation ? (isArabic ? selectedLocation.ar : selectedLocation.en) : 'Cairo';

  const LocationDropdownContent = () => (
    <>
      <button onClick={handleCurrentLocation} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-primary-600 hover:bg-primary-50 border-b border-gray-100 font-medium">
        <FiNavigation size={15} className={isLocating ? 'animate-spin' : ''} />
        {isLocating ? 'Detecting...' : 'Use my current location'}
      </button>
      <div className="p-3 border-b border-gray-100"><p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Areas</p></div>
      <div className="py-1">
        {cairoAreas.map((area) => (
          <button key={area.en} onClick={() => { setSelectedLocation(area.en === 'All Cairo' ? null : area); setShowLocationDropdown(false); router.push(`/search?location=${encodeURIComponent(area.en === 'All Cairo' ? '' : area.en)}`); }}
            className={`w-full text-left px-4 py-2 text-sm transition-colors ${selectedLocation?.en === area.en ? 'bg-primary-50 text-primary-600 font-medium' : 'text-gray-700 hover:bg-primary-50 hover:text-primary-600'}`}>
            {isArabic ? area.ar : area.en}
          </button>
        ))}
      </div>
      <div className="p-3 border-t border-b border-gray-100"><p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Compounds</p></div>
      <div className="py-1">
        {cairoCompounds.map((compound) => (
          <button key={compound.en} onClick={() => { setSelectedLocation(compound); setShowLocationDropdown(false); router.push(`/search?location=${encodeURIComponent(compound.en)}`); }}
            className={`w-full text-left px-4 py-2 text-sm transition-colors ${selectedLocation?.en === compound.en ? 'bg-primary-50 text-primary-600 font-medium' : 'text-gray-700 hover:bg-primary-50 hover:text-primary-600'}`}>
            {isArabic ? compound.ar : compound.en}
          </button>
        ))}
      </div>
    </>
  );

  return (
    <header className={`sticky top-0 z-50 bg-white transition-shadow duration-200 ${isScrolled ? 'shadow-md' : 'shadow-sm'}`}>

      {/* ───── DESKTOP HEADER ───── */}
      <div className="hidden lg:block">
        <div className="container-app">
          <div className="flex items-center h-16 gap-4">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 flex-shrink-0">
              <div className="w-9 h-9 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">M</span>
              </div>
              <span className="text-xl font-bold text-gray-900">MySouqify</span>
            </Link>

            {/* Location + Search (Dubizzle style combined box) */}
            <div className="flex flex-1 max-w-2xl mx-4 rounded-lg border-2 border-gray-200 overflow-hidden focus-within:border-primary-500 transition-colors" ref={locationRef}>
              <div className="relative flex-shrink-0">
                <button onClick={() => setShowLocationDropdown(!showLocationDropdown)}
                  className="flex items-center gap-1.5 px-3 h-11 text-gray-700 hover:bg-gray-50 transition-colors border-r border-gray-200 text-sm font-medium whitespace-nowrap">
                  <FiMapPin size={15} className="text-primary-600" />
                  <span>{locationLabel}</span>
                  <FiChevronDown size={12} className={`transition-transform ${showLocationDropdown ? 'rotate-180' : ''}`} />
                </button>
                {showLocationDropdown && (
                  <div className="absolute top-full left-0 mt-1 w-72 bg-white rounded-xl shadow-xl border border-gray-100 z-50 max-h-96 overflow-y-auto">
                    <LocationDropdownContent />
                  </div>
                )}
              </div>
              <form onSubmit={handleSearch} className="flex flex-1">
                <div className="relative flex-1">
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
                  <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('common.search_placeholder')}
                    className="w-full h-11 pl-9 pr-3 text-sm focus:outline-none bg-transparent" />
                </div>
                <button type="submit" className="px-5 bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 transition-colors flex items-center gap-2">
                  <FiSearch size={16} /> Search
                </button>
              </form>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-1 flex-shrink-0">
              <LanguageSwitcher />
              {isAuthenticated ? (
                <>
                  <Link href="/messages" className="relative flex items-center px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors">
                    <FiMessageSquare size={20} />
                    {unreadCount > 0 && <span className="absolute top-1.5 right-1 w-4 h-4 bg-primary-600 text-white text-xs rounded-full flex items-center justify-center">{unreadCount > 9 ? '9+' : unreadCount}</span>}
                  </Link>
                  <Link href="/notifications" className="relative flex items-center px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors">
                    <FiBell size={20} />
                    {notifUnread > 0 && <span className="absolute top-1.5 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">{notifUnread > 9 ? '9+' : notifUnread}</span>}
                  </Link>
                  <Link href="/dashboard" className="flex items-center gap-2 px-2 py-2 text-gray-700 hover:text-gray-900 transition-colors">
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-bold text-sm">
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <FiChevronDown size={12} className="text-gray-400" />
                  </Link>
                  {user?.isAdmin && (
                    <Link href="/cp-x4m9k2" className="flex items-center px-2 py-2 text-primary-600 hover:text-primary-700 transition-colors">
                      <FiShield size={18} />
                    </Link>
                  )}
                  <Link href="/post" className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white text-sm font-bold rounded-lg hover:bg-primary-700 transition-colors ml-1">
                    <FiPlus size={16} /> Post Your Ad
                  </Link>
                </>
              ) : (
                <>
                  <button onClick={openLoginModal} className="px-4 py-2 text-gray-700 text-sm font-medium hover:text-gray-900 transition-colors">
                    {t('nav.login')}
                  </button>
                  <Link href="/post" className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white text-sm font-bold rounded-lg hover:bg-primary-700 transition-colors">
                    <FiPlus size={16} /> Post Your Ad
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Desktop Category Nav */}
        <div className="border-t border-gray-100">
          <div className="container-app">
            <div className="flex items-center gap-6 py-2.5">
              {cats.map((cat) => (
                <div key={cat.name} className="relative" onMouseEnter={() => setHoveredCategory(cat.name)} onMouseLeave={() => setHoveredCategory(null)}>
                  <button onClick={() => handleCategoryClick(cat.name)}
                    className="flex items-center gap-0.5 text-sm text-gray-600 hover:text-primary-600 transition-colors whitespace-nowrap py-1">
                    {cat.name}
                    {cat.subcategories?.length > 0 && (
                      <FiChevronDown size={12} className={`transition-transform mt-0.5 ${hoveredCategory === cat.name ? 'rotate-180' : ''}`} />
                    )}
                  </button>
                  {hoveredCategory === cat.name && cat.subcategories?.length > 0 && (
                    <div className="absolute top-full left-0 w-52 bg-white rounded-xl shadow-xl border border-gray-100 z-50 py-1">
                      {cat.subcategories.map((sub) => {
                        const subName = typeof sub === 'string' ? sub : sub.name;
                        return (
                          <button key={subName} onClick={() => router.push(`/search?category=${encodeURIComponent(cat.name)}&subcategory=${encodeURIComponent(subName)}`)}
                            className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-primary-50 hover:text-primary-600 transition-colors">
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
        </div>
      </div>

      {/* ───── MOBILE HEADER ───── */}
      <div className="lg:hidden">
        <div className="container-app">
          {/* Top row: hamburger + logo + icons */}
          <div className="flex items-center h-14 gap-2">
            <button onClick={toggleMobileMenu} className="p-2 -ml-2 text-gray-600">
              {isMobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
            <Link href="/" className="flex items-center gap-1.5">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-base">M</span>
              </div>
              <span className="text-lg font-bold text-gray-900">MySouqify</span>
            </Link>
            <div className="flex-1" />
            {isAuthenticated ? (
              <div className="flex items-center">
                <Link href="/messages" className="relative p-2 text-gray-600">
                  <FiMessageSquare size={22} />
                  {unreadCount > 0 && <span className="absolute top-1 right-1 w-4 h-4 bg-primary-600 text-white text-xs rounded-full flex items-center justify-center">{unreadCount > 9 ? '9+' : unreadCount}</span>}
                </Link>
                <Link href="/notifications" className="relative p-2 text-gray-600">
                  <FiBell size={22} />
                  {notifUnread > 0 && <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">{notifUnread > 9 ? '9+' : notifUnread}</span>}
                </Link>
              </div>
            ) : (
              <button onClick={openLoginModal} className="px-3 py-1.5 text-sm font-semibold text-primary-600 border border-primary-200 rounded-lg">
                Login
              </button>
            )}
          </div>

          {/* Mobile Search */}
          <div className="pb-2">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('common.search_placeholder')}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary-500 transition-all" />
              </div>
            </form>
          </div>

          {/* Mobile Location */}
          <div className="pb-2">
            <button onClick={() => setShowLocationDropdown(!showLocationDropdown)} className="flex items-center gap-1 text-gray-600 text-sm">
              <FiMapPin size={15} className="text-primary-600" />
              <span className="font-medium">{locationLabel}</span>
              <FiChevronDown size={12} />
            </button>
          </div>

          {/* Mobile Category Icons (Dubizzle style - horizontal scroll) */}
          <div className="pb-3 -mx-4 px-4 overflow-x-auto no-scrollbar">
            <div className="flex gap-4 min-w-max">
              {cats.map((cat) => {
                const Icon = categoryIcons[cat.name] || FiShoppingBag;
                return (
                  <button key={cat.name} onClick={() => handleCategoryClick(cat.name)} className="flex flex-col items-center gap-1.5 min-w-[58px]">
                    <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center border border-primary-100">
                      <Icon className="text-primary-600" size={20} />
                    </div>
                    <span className="text-[10px] text-gray-600 text-center leading-tight font-medium">{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Location Dropdown Overlay */}
      {showLocationDropdown && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setShowLocationDropdown(false)}>
          <div className="absolute top-28 left-4 right-4 bg-white rounded-xl shadow-xl border border-gray-100 max-h-[70vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <LocationDropdownContent />
          </div>
        </div>
      )}

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMobileMenuOpen(false)} />
          <div className="fixed top-0 left-0 w-72 h-full bg-white z-50 lg:hidden overflow-y-auto">
            <div className="p-4 border-b border-gray-100 flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">M</span>
              </div>
              <span className="text-xl font-semibold">MySouqify</span>
            </div>
            <nav className="p-4 space-y-1">
              {isAuthenticated ? (
                <>
                  <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 text-gray-700 hover:bg-gray-50 rounded-lg" onClick={() => setMobileMenuOpen(false)}>
                    <FiUser size={20} /><span>{t('nav.dashboard')}</span>
                  </Link>
                  <Link href="/favorites" className="flex items-center gap-3 px-3 py-2.5 text-gray-700 hover:bg-gray-50 rounded-lg" onClick={() => setMobileMenuOpen(false)}>
                    <FiHeart size={20} /><span>{t('nav.favorites')}</span>
                  </Link>
                  <Link href="/messages" className="flex items-center gap-3 px-3 py-2.5 text-gray-700 hover:bg-gray-50 rounded-lg" onClick={() => setMobileMenuOpen(false)}>
                    <FiMessageSquare size={20} /><span>{t('nav.messages')}</span>
                    {unreadCount > 0 && <span className="ml-auto px-2 py-0.5 bg-primary-600 text-white text-xs rounded-full">{unreadCount}</span>}
                  </Link>
                  <Link href="/notifications" className="flex items-center gap-3 px-3 py-2.5 text-gray-700 hover:bg-gray-50 rounded-lg" onClick={() => setMobileMenuOpen(false)}>
                    <FiBell size={20} /><span>Notifications</span>
                    {notifUnread > 0 && <span className="ml-auto px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">{notifUnread}</span>}
                  </Link>
                </>
              ) : (
                <button onClick={() => { setMobileMenuOpen(false); openLoginModal(); }} className="flex items-center gap-3 px-3 py-2.5 text-gray-700 hover:bg-gray-50 rounded-lg w-full">
                  <FiUser size={20} /><span>{t('nav.login')}</span>
                </button>
              )}
              <hr className="my-3" />
              <p className="px-3 py-2 text-xs font-medium text-gray-400 uppercase">Categories</p>
              {cats.map((cat) => (
                <Link key={cat.name} href={`/search?category=${encodeURIComponent(cat.name)}`} className="block px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg" onClick={() => setMobileMenuOpen(false)}>
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
