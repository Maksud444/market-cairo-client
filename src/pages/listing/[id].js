import { useState, useEffect, useRef } from 'react';
import VerifiedBadge from '../../components/VerifiedBadge';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  FiHeart, FiShare2, FiMapPin, FiEye, FiClock, FiChevronLeft,
  FiChevronRight, FiMessageCircle, FiPhone, FiStar, FiFlag,
  FiShield, FiCheck, FiX, FiAlertCircle, FiTrash2, FiCamera
} from 'react-icons/fi';

const COLOR_HEX = {
  'Black': '#1a1a1a',
  'White': '#ffffff',
  'Gray': '#9ca3af',
  'Dark Green': '#166534',
  'Navy': '#1e3a5f',
  'Brown': '#7c4a1e',
  'Beige': '#d4b896',
  'Red': '#dc2626',
};

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" width={20} height={20} fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import { useTranslation } from 'next-i18next';
import { getI18nProps } from '../../lib/i18n';
import Layout from '../../components/Layout';
import ListingCard from '../../components/ListingCard';
import { listingsAPI, messagesAPI } from '../../lib/api';
import { useAuthStore } from '../../lib/store';
import { getImageUrl } from '../../lib/utils';

const conditionColors = {
  'New': 'badge-new',
  'Like New': 'badge-like-new',
  'Good': 'badge-good',
  'Fair': 'badge-fair',
};

export default function ListingDetailPage({ initialListing }) {
  const router = useRouter();
  const { t } = useTranslation('common');
  const { id } = router.query;
  const { user, isAuthenticated } = useAuthStore();

  const [listing, setListing] = useState(initialListing || null);
  const [similarListings, setSimilarListings] = useState([]);
  const [isLoading, setIsLoading] = useState(!initialListing);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');

  // Gallery / Lightbox state
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [dragStart, setDragStart] = useState(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const imgRef = useRef(null);

  const openGallery = (idx = 0) => {
    setLightboxIndex(idx);
    setGalleryOpen(true);
    document.body.style.overflow = 'hidden';
  };
  const openLightbox = (idx) => {
    setLightboxIndex(idx);
    setZoom(1);
    setOffset({ x: 0, y: 0 });
    setLightboxOpen(true);
  };
  const closeLightbox = () => { setLightboxOpen(false); setZoom(1); setOffset({ x: 0, y: 0 }); };
  const closeGallery = () => { setGalleryOpen(false); document.body.style.overflow = ''; };
  const closeAll = () => { setLightboxOpen(false); setGalleryOpen(false); setZoom(1); setOffset({ x: 0, y: 0 }); document.body.style.overflow = ''; };

  const lbPrev = () => { setZoom(1); setOffset({ x: 0, y: 0 }); setLightboxIndex(i => (i - 1 + (listing?.images?.length || 1)) % (listing?.images?.length || 1)); };
  const lbNext = () => { setZoom(1); setOffset({ x: 0, y: 0 }); setLightboxIndex(i => (i + 1) % (listing?.images?.length || 1)); };

  const handleWheel = (e) => {
    e.preventDefault();
    setZoom(z => Math.min(4, Math.max(1, z - e.deltaY * 0.002)));
  };

  // Touch pinch-to-zoom
  const lastTouchDist = useRef(null);
  const handleTouchStart = (e) => {
    if (e.touches.length === 2) {
      lastTouchDist.current = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
    } else if (e.touches.length === 1 && zoom > 1) {
      setDragStart({ x: e.touches[0].clientX - offset.x, y: e.touches[0].clientY - offset.y });
      setDragging(true);
    }
  };
  const handleTouchMove = (e) => {
    if (e.touches.length === 2 && lastTouchDist.current) {
      const dist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
      setZoom(z => Math.min(4, Math.max(1, z * (dist / lastTouchDist.current))));
      lastTouchDist.current = dist;
    } else if (e.touches.length === 1 && dragging && zoom > 1) {
      setOffset({ x: e.touches[0].clientX - dragStart.x, y: e.touches[0].clientY - dragStart.y });
    }
  };
  const handleTouchEnd = () => { lastTouchDist.current = null; setDragging(false); };

  const handleMouseDown = (e) => { if (zoom > 1) { setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y }); setDragging(true); } };
  const handleMouseMove = (e) => { if (dragging && zoom > 1) setOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y }); };
  const handleMouseUp = () => setDragging(false);

  const deleteReasons = [
    { value: 'Item Sold', label: t('delete_reasons.item_sold') },
    { value: 'No Longer Available', label: t('delete_reasons.no_longer_available') },
    { value: 'Posted by Mistake', label: t('delete_reasons.posted_by_mistake') },
    { value: 'Price Changed', label: t('delete_reasons.price_changed') },
    { value: 'Found Better Buyer', label: t('delete_reasons.found_better_buyer') },
    { value: 'Item Damaged', label: t('delete_reasons.item_damaged') },
    { value: 'Other', label: t('delete_reasons.other') }
  ];

  const handleDelete = async () => {
    if (!deleteReason) {
      toast.error(t('listing_detail.select_reason'));
      return;
    }

    try {
      await listingsAPI.delete(id, deleteReason);
      toast.success(t('listing_detail.will_be_removed_in'));
      setShowDeleteModal(false);
      router.push('/dashboard');
    } catch (error) {
      toast.error(t('listing_detail.failed_to_update'));
    }
  };

  useEffect(() => {
    if (!id) return;
    if (initialListing) {
      listingsAPI.getSimilar(id).then(res => {
        if (res.data.success) setSimilarListings(res.data.listings);
      }).catch(() => {});
      return;
    }

    const fetchListing = async () => {
      setIsLoading(true);
      try {
        const [listingRes, similarRes] = await Promise.all([
          listingsAPI.getById(id),
          listingsAPI.getSimilar(id),
        ]);

        if (listingRes.data.success) {
          setListing(listingRes.data.listing);
          setIsFavorite(listingRes.data.listing.isFavorite || false);
        }
        if (similarRes.data.success) {
          setSimilarListings(similarRes.data.listings);
        }
      } catch (error) {
        console.error('Failed to fetch listing:', error);
        toast.error(t('post.failed_to_load'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchListing();
  }, [id]);

  const handleFavorite = async () => {
    if (!isAuthenticated) {
      toast.error(t('listing_detail.login_to_favorite'));
      return;
    }

    try {
      await listingsAPI.toggleFavorite(id);
      setIsFavorite(!isFavorite);
      toast.success(isFavorite ? t('listing_detail.removed_from_favorites') : t('listing_detail.added_to_favorites'));
    } catch (error) {
      toast.error(t('listing_detail.failed_to_update_favorites'));
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: listing.title,
          text: `Check out this listing: ${listing.title}`,
          url: window.location.href,
        });
      } catch (error) {
        // User cancelled share
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success(t('listing_detail.link_copied'));
    }
  };

  const handleSendMessage = async () => {
    if (!isAuthenticated) {
      toast.error(t('listing_detail.login_to_message'));
      return;
    }
    setIsSending(true);
    try {
      const res = await messagesAPI.createConversation({
        listingId: id,
        sellerId: listing.seller._id,
      });
      const convId = res?.data?.conversation?._id;
      router.push(convId ? `/messages?conversationId=${convId}` : '/messages');
    } catch (error) {
      toast.error(t('listing_detail.failed_to_send'));
    } finally {
      setIsSending(false);
    }
  };

  const nextImage = () => {
    if (listing?.images?.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % listing.images.length);
    }
  };

  const prevImage = () => {
    if (listing?.images?.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + listing.images.length) % listing.images.length);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container-app py-4 lg:py-8">
          <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
            <div className="aspect-square skeleton rounded-xl" />
            <div className="space-y-4">
              <div className="h-8 skeleton w-3/4" />
              <div className="h-10 skeleton w-1/3" />
              <div className="h-24 skeleton w-full" />
              <div className="h-12 skeleton w-full" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!listing) {
    return (
      <Layout>
        <div className="container-app py-16 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{t('listing_detail.listing_not_found')}</h1>
          <p className="text-gray-500 mb-6">{t('listing_detail.listing_not_found_desc')}</p>
          <Link href="/search" className="btn btn-primary">
            {t('listing_detail.browse_listings')}
          </Link>
        </div>
      </Layout>
    );
  }

  const isOwner = user?._id === listing.seller._id;

  const pageTitle = `${listing.title} | EGP ${listing.price?.toLocaleString()} | ${listing.location || 'Cairo'} - MySouqify`;
  const pageDesc = listing.description?.slice(0, 160) || '';
  const pageUrl = `https://mysouqify.com/listing/${listing._id}`;
  const rawImage = listing.images?.[0] ? getImageUrl(listing.images[0]) : null;
  const pageImage = rawImage || 'https://mysouqify.com/og-default.jpg';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: listing.title,
    description: listing.description,
    image: pageImage,
    offers: {
      '@type': 'Offer',
      price: listing.price,
      priceCurrency: 'EGP',
      availability: listing.status === 'sold'
        ? 'https://schema.org/SoldOut'
        : 'https://schema.org/InStock',
      seller: {
        '@type': 'Person',
        name: listing.seller?.name || 'MySouqify Seller',
      },
    },
    itemCondition: {
      'New': 'https://schema.org/NewCondition',
      'Like New': 'https://schema.org/LikeNewCondition',
      'Good': 'https://schema.org/UsedCondition',
      'Fair': 'https://schema.org/UsedCondition',
    }[listing.condition] || 'https://schema.org/UsedCondition',
  };

  return (
    <Layout>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDesc} />
        <link rel="canonical" href={pageUrl} />

        {/* Open Graph */}
        <meta property="og:type" content="product" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDesc} />
        <meta property="og:image" content={pageImage} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:site_name" content="MySouqify" />
        <meta property="product:price:amount" content={listing.price} />
        <meta property="product:price:currency" content="EGP" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDesc} />
        <meta name="twitter:image" content={pageImage} />

        {/* Hreflang for this listing */}
        <link rel="alternate" hrefLang="en" href={pageUrl} />
        <link rel="alternate" hrefLang="ar-EG" href={`https://mysouqify.com/ar/listing/${listing._id}`} />
        <link rel="alternate" hrefLang="x-default" href={pageUrl} />

        {/* JSON-LD Product Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </Head>

      <div className="container-app py-4 lg:py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          <Link href="/" className="hover:text-primary-600">{t('listing_detail.home')}</Link>
          <span>/</span>
          <Link href="/search" className="hover:text-primary-600">{t('listing_detail.listings')}</Link>
          <span>/</span>
          <Link href={`/search?category=${listing.category}`} className="hover:text-primary-600">
            {listing.category}
          </Link>
          <span>/</span>
          <span className="text-gray-900 truncate">{listing.title}</span>
        </nav>

        <div className="grid lg:grid-cols-5 gap-6 lg:gap-8">
          {/* Image Gallery - Left Side */}
          <div className="lg:col-span-3">
            <div className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden cursor-pointer" onClick={() => openGallery(currentImageIndex)}>
              {listing.images && listing.images.length > 0 ? (
                <>
                  <img
                    src={getImageUrl(listing.images[currentImageIndex])}
                    alt={listing.title}
                    className="w-full h-full object-cover"
                  />
                  {listing.images.length > 1 && (
                    <>
                      <button
                        onClick={(e) => { e.stopPropagation(); prevImage(); }}
                        className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
                      >
                        <FiChevronLeft size={20} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); nextImage(); }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
                      >
                        <FiChevronRight size={20} />
                      </button>
                    </>
                  )}
                </>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-gray-400">{t('listing_detail.no_image')}</span>
                </div>
              )}

              {/* Photos badge — bottom left */}
              {listing.images && listing.images.length > 0 && (
                <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-black/60 text-white text-xs font-semibold px-2.5 py-1 rounded-lg backdrop-blur-sm">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                  Photos ({listing.images.length})
                </div>
              )}
              {/* For Rent badge */}
              {listing.isRent && (
                <div className="absolute top-3 left-3">
                  <span className="bg-blue-600 text-white text-xs font-bold px-2.5 py-1 rounded-lg">For Rent</span>
                </div>
              )}
              {listing.featured && !listing.isRent && (
                <span className="absolute top-3 left-3 badge badge-featured">{t('listing_detail.featured')}</span>
              )}
              {!listing.isRent && (
                <span className={`absolute top-3 right-3 badge ${conditionColors[listing.condition]}`}>
                  {listing.condition}
                </span>
              )}
            </div>

            {/* Thumbnail Strip */}
            {listing.images && listing.images.length > 1 && (
              <div className="flex gap-2 mt-3 overflow-x-auto no-scrollbar">
                {listing.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => { setCurrentImageIndex(index); openGallery(index); }}
                    className={`relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-colors ${
                      index === currentImageIndex ? 'border-primary-600' : 'border-transparent'
                    }`}
                  >
                    <img src={getImageUrl(image)} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Description - Desktop */}
            <div className="hidden lg:block mt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">{t('listing_detail.description')}</h2>
              <p className="text-gray-600 whitespace-pre-wrap">{listing.description}</p>
            </div>
          </div>

          {/* Details - Right Side */}
          <div className="lg:col-span-2 space-y-4">

            {/* Seller Profile — top of panel */}
            <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
              <Link href={`/user/${listing.seller._id}`} className="flex items-center gap-3 flex-1 min-w-0 group">
                <div className="w-11 h-11 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold text-lg flex-shrink-0">
                  {listing.seller.name?.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors truncate flex items-center gap-1">
                  {listing.seller.name}
                  {listing.seller.verification?.status === 'approved' && <VerifiedBadge size={15} />}
                </p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    {listing.seller.rating?.average > 0 && (
                      <span className="flex items-center gap-0.5">
                        <FiStar className="text-yellow-400 fill-current" size={11} />
                        {listing.seller.rating.average.toFixed(1)}
                      </span>
                    )}
                    <span>{listing.seller.salesCount || 0} {t('listing_detail.sales')}</span>
                  </div>
                </div>
              </Link>
              {!isOwner && (
                <button
                  onClick={handleSendMessage}
                  disabled={isSending}
                  className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 flex-shrink-0"
                >
                  <FiMessageCircle size={15} />
                  {isSending ? t('listing_detail.sending') : t('listing_detail.send_message')}
                </button>
              )}
            </div>

            {/* Soft-deleted status banner */}
            {listing.deleteInfo?.isDeleted && (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
                <div className="flex items-center">
                  <FiAlertCircle className="text-yellow-400 mr-3 flex-shrink-0" size={24} />
                  <div>
                    <h3 className="text-lg font-semibold text-yellow-800">
                      {t('listing_detail.item_sold_title')}
                    </h3>
                    <p className="text-yellow-700 mt-1">
                      {t('listing_detail.item_sold_reason')}: {listing.deleteInfo.reason}
                    </p>
                    <p className="text-sm text-yellow-600 mt-1">
                      {t('listing.will_be_removed')} {new Date(new Date(listing.deleteInfo.deletedAt).getTime() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Pending approval status banner */}
            {listing.moderationStatus === 'pending' && (
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-lg">
                <div className="flex items-center">
                  <FiClock className="text-blue-400 mr-3 flex-shrink-0" size={24} />
                  <div>
                    <h3 className="text-lg font-semibold text-blue-800">
                      {t('listing_detail.pending_approval_title')}
                    </h3>
                    <p className="text-blue-700 mt-1">
                      {t('listing_detail.pending_approval_desc')}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {listing.isRent ? (
              /* ──────── RENT DETAIL PANEL ──────── */
              <>
                {/* Title + thumbnail row */}
                <div className="bg-white rounded-xl border border-gray-100 p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      {listing.storeName && (
                        <p className="text-xs text-blue-600 font-semibold mb-0.5 truncate">{listing.storeName}</p>
                      )}
                      <h1 className="text-xl font-bold text-gray-900 leading-snug">{listing.title}</h1>
                      {/* Price */}
                      <p className="text-xl font-bold text-teal-600 mt-2">
                        {listing.pricePerDayMax && listing.pricePerDayMax > listing.pricePerDay
                          ? <><span className="text-teal-600">{listing.pricePerDay}–{listing.pricePerDayMax}</span> <span className="text-sm font-semibold text-gray-500">EGP/day</span></>
                          : <><span className="text-teal-600">{listing.pricePerDay}</span> <span className="text-sm font-semibold text-gray-500">EGP/day</span></>
                        }
                      </p>
                      {/* Location */}
                      <div className="flex items-center gap-1 mt-1.5 text-gray-500">
                        <FiMapPin size={13} className="text-teal-500" />
                        <span className="text-sm">{listing.location?.area}, {listing.location?.city}</span>
                      </div>
                    </div>
                    {/* Thumbnail */}
                    {listing.images?.[0] && (
                      <div className="w-20 h-20 rounded-xl overflow-hidden border border-gray-100 flex-shrink-0 shadow-sm">
                        <img src={getImageUrl(listing.images[0])} alt={listing.title} className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                  {/* Action icons */}
                  <div className="flex items-center gap-2 mt-3 border-t border-gray-50 pt-3">
                    <button onClick={handleFavorite} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${isFavorite ? 'bg-red-50 text-red-500' : 'bg-gray-50 text-gray-400 hover:text-red-400'}`}>
                      <FiHeart size={15} className={isFavorite ? 'fill-current' : ''} /> Save
                    </button>
                    <button onClick={handleShare} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm bg-gray-50 text-gray-400 hover:text-gray-600 transition-colors">
                      <FiShare2 size={15} /> Share
                    </button>
                    <span className="ml-auto flex items-center gap-1 text-xs text-gray-400">
                      <FiEye size={12} /> {listing.views}
                    </span>
                  </div>
                </div>

                {/* Size selector */}
                {listing.rentSizes && listing.rentSizes.length > 0 && (
                  <div className="bg-white rounded-xl border border-gray-100 p-4">
                    <h3 className="text-sm font-bold text-gray-900 mb-3">Select Size</h3>
                    <div className="flex flex-wrap gap-2">
                      {listing.rentSizes.map((size) => (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(selectedSize === size ? '' : size)}
                          className={`w-12 h-12 rounded-xl text-sm font-bold border-2 transition-all ${
                            selectedSize === size
                              ? 'bg-gray-900 text-white border-gray-900'
                              : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Color selector */}
                {listing.rentColors && listing.rentColors.length > 0 && (
                  <div className="bg-white rounded-xl border border-gray-100 p-4">
                    <h3 className="text-sm font-bold text-gray-900 mb-3">Select Color</h3>
                    <div className="flex flex-wrap gap-3">
                      {listing.rentColors.map((colorName) => {
                        const hex = COLOR_HEX[colorName] || '#9ca3af';
                        const isSelected = selectedColor === colorName;
                        return (
                          <button
                            key={colorName}
                            onClick={() => setSelectedColor(selectedColor === colorName ? '' : colorName)}
                            className="flex flex-col items-center gap-1"
                            title={colorName}
                          >
                            <div
                              className={`w-11 h-11 rounded-full flex items-center justify-center border-4 transition-all ${
                                isSelected ? 'border-gray-800 scale-110' : 'border-gray-200 hover:border-gray-400'
                              }`}
                              style={{
                                backgroundColor: hex,
                                boxShadow: hex === '#ffffff' ? 'inset 0 0 0 1px #e5e7eb' : undefined
                              }}
                            >
                              {isSelected && (
                                <FiCheck size={14} className={hex === '#ffffff' ? 'text-gray-900' : 'text-white'} />
                              )}
                            </div>
                            <span className="text-[10px] text-gray-500 font-medium">{colorName}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Rental Price summary */}
                <div className="bg-white rounded-xl border border-gray-100 p-4">
                  <p className="text-xs text-gray-500 font-medium mb-1">Rental Price (per day)</p>
                  <p className="text-2xl font-bold text-teal-600">
                    {listing.pricePerDayMax && listing.pricePerDayMax > listing.pricePerDay
                      ? `${listing.pricePerDay}–${listing.pricePerDayMax}`
                      : listing.pricePerDay
                    } <span className="text-sm text-gray-500 font-semibold">EGP/day</span>
                  </p>
                  {listing.condition && (
                    <p className="text-xs text-gray-400 mt-1">Condition: <span className="font-medium text-gray-600">{listing.condition}</span></p>
                  )}
                </div>

                {/* Description */}
                {listing.description && (
                  <div className="bg-white rounded-xl border border-gray-100 p-4">
                    <h3 className="text-sm font-bold text-gray-900 mb-2">{t('listing_detail.description')}</h3>
                    <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">{listing.description}</p>
                  </div>
                )}

                {/* Contact — WhatsApp prominently, then message */}
                {!isOwner ? (
                  <div className="space-y-2">
                    {/* WhatsApp — primary green button */}
                    {(listing.whatsappPhone || listing.seller?.phone) && (
                      <a
                        href={`https://wa.me/${(listing.whatsappPhone || listing.seller.phone).replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hi, I'm interested in renting "${listing.title}". Is it available?\nhttps://mysouqify.com/listing/${listing._id}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-center gap-2.5 py-3.5 bg-[#25D366] text-white rounded-xl font-bold text-base hover:bg-[#1ebe5d] transition-colors shadow-md"
                      >
                        <WhatsAppIcon /> Message on WhatsApp
                      </a>
                    )}
                    <button
                      onClick={handleSendMessage}
                      disabled={isSending}
                      className="btn btn-outline w-full flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <FiMessageCircle size={18} />
                      {isSending ? t('listing_detail.sending') : t('listing_detail.send_message')}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Link href={`/listing/${id}/edit`} className="btn btn-primary w-full">{t('listing_detail.edit_listing')}</Link>
                    <button onClick={() => setShowDeleteModal(true)} className="btn bg-red-600 hover:bg-red-700 text-white w-full flex items-center justify-center gap-2" disabled={listing.isDeleted}>
                      <FiTrash2 size={18} />
                      {listing.isDeleted ? t('listing_detail.deleting') : t('listing_detail.delete_listing')}
                    </button>
                  </div>
                )}
              </>
            ) : (
              /* ──────── REGULAR DETAIL PANEL ──────── */
              <>
                {/* Title & Price Card */}
                <div className="bg-white rounded-xl border border-gray-100 p-4 lg:p-5">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <h1 className="text-xl lg:text-2xl font-bold text-gray-900">{listing.title}</h1>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={handleFavorite}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                          isFavorite ? 'bg-primary-50 text-primary-600' : 'bg-gray-50 text-gray-400 hover:text-primary-600'
                        }`}
                      >
                        <FiHeart size={20} className={isFavorite ? 'fill-current' : ''} />
                      </button>
                      <button
                        onClick={handleShare}
                        className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <FiShare2 size={20} />
                      </button>
                    </div>
                  </div>

                  <p className="text-2xl lg:text-3xl font-bold mb-4">
                    {(listing.price === 0 || listing.isDonation)
                      ? <span className="text-green-600">{t('donate.free_badge') || 'FREE'}</span>
                      : <span className="text-primary-600">{listing.price.toLocaleString()} {t('common.egp')}</span>
                    }
                  </p>

                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <FiEye size={14} />
                      {listing.views} {t('common.views')}
                    </span>
                    <span className="flex items-center gap-1">
                      <FiClock size={14} />
                      {formatDistanceToNow(new Date(listing.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                </div>

                {/* Details — attributes table */}
                {listing.attributes && Object.keys(listing.attributes).length > 0 && (
                  <div className="bg-white rounded-xl border border-gray-100 p-4 lg:p-5">
                    <h2 className="text-base font-semibold text-gray-900 mb-3">{t('listing_detail.details') || 'Details'}</h2>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-0 divide-y divide-gray-100">
                      {Object.entries(listing.attributes).map(([key, val]) => (
                        val ? (
                          <div key={key} className="col-span-2 grid grid-cols-2 py-2.5">
                            <span className="text-sm text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                            <span className="text-sm font-medium text-gray-900 text-right">{String(val)}</span>
                          </div>
                        ) : null
                      ))}
                      <div className="col-span-2 grid grid-cols-2 py-2.5">
                        <span className="text-sm text-gray-500">Condition</span>
                        <span className="text-sm font-medium text-gray-900 text-right">{listing.condition}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Description */}
                <div className="bg-white rounded-xl border border-gray-100 p-4 lg:p-5">
                  <h2 className="text-base font-semibold text-gray-900 mb-3">{t('listing_detail.description')}</h2>
                  <p className="text-gray-600 whitespace-pre-wrap text-sm leading-relaxed">{listing.description}</p>
                </div>

                {/* Location */}
                <div className="bg-white rounded-xl border border-gray-100 p-4 lg:p-5">
                  <h2 className="text-base font-semibold text-gray-900 mb-3">{t('listing_detail.location') || 'Location'}</h2>
                  <div className="flex items-center gap-2 text-gray-700 mb-3">
                    <FiMapPin size={16} className="text-primary-600 flex-shrink-0" />
                    <div>
                      <p className="font-medium">{listing.location?.area}</p>
                      <p className="text-sm text-gray-500">{listing.location?.city}</p>
                    </div>
                  </div>
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(`${listing.location?.area}, ${listing.location?.city}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                  >
                    <FiMapPin size={16} />
                    See location
                  </a>
                </div>

                {/* Seller Card */}
                <div className="bg-white rounded-xl border border-gray-100 p-4 lg:p-5">
                  <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">{t('listing_detail.seller')}</h2>

                  <Link href={`/user/${listing.seller._id}`} className="flex items-center gap-3 mb-4 group">
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold text-lg">
                      {listing.seller.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors flex items-center gap-1">
                        {listing.seller.name}
                        {listing.seller.verification?.status === 'approved' && <VerifiedBadge size={15} />}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        {listing.seller.rating?.average > 0 && (
                          <span className="flex items-center gap-1">
                            <FiStar className="text-yellow-400 fill-current" size={14} />
                            {listing.seller.rating.average.toFixed(1)}
                            <span className="text-gray-400">({listing.seller.rating.count})</span>
                          </span>
                        )}
                        <span>{listing.seller.salesCount || 0} {t('listing_detail.sales')}</span>
                      </div>
                    </div>
                  </Link>

                  {!isOwner ? (
                    <div className="space-y-2">
                      <button
                        onClick={handleSendMessage}
                        disabled={isSending}
                        className="btn btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        <FiMessageCircle size={18} />
                        {isSending ? t('listing_detail.sending') : t('listing_detail.send_message')}
                      </button>
                      {listing.seller.phone && (
                        <a
                          href={`tel:${listing.seller.phone}`}
                          className="btn btn-outline w-full flex items-center justify-center gap-2"
                        >
                          <FiPhone size={18} />
                          {t('listing_detail.call_seller')}
                        </a>
                      )}
                      {(listing.whatsappPhone || listing.seller.phone) && (
                        <a
                          href={`https://wa.me/${(listing.whatsappPhone || listing.seller.phone).replace(/[^0-9]/g, '')}?text=${encodeURIComponent(t('listing_detail.whatsapp_message', { title: listing.title, url: `https://mysouqify.com/listing/${listing._id}` }))}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full flex items-center justify-center gap-2 py-2.5 border border-emerald-500 text-emerald-500 rounded-lg hover:bg-emerald-50 transition-colors font-semibold"
                        >
                          <FiMessageCircle size={18} className="text-emerald-500" />
                          {t('listing_detail.whatsapp_seller')}
                        </a>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Link href={`/listing/${id}/edit`} className="btn btn-primary w-full">
                        {t('listing_detail.edit_listing')}
                      </Link>
                      <button
                        onClick={async () => {
                          if (confirm(t('listing_detail.mark_as_sold_confirm'))) {
                            try {
                              await listingsAPI.markSold(id);
                              toast.success(t('listing_detail.marked_as_sold'));
                              setListing({ ...listing, status: 'sold' });
                            } catch {
                              toast.error(t('listing_detail.failed_to_update'));
                            }
                          }
                        }}
                        className="btn btn-outline w-full"
                        disabled={listing.status === 'sold'}
                      >
                        {listing.status === 'sold' ? t('listing_detail.sold') : t('listing_detail.mark_as_sold')}
                      </button>
                      <button
                        onClick={() => setShowDeleteModal(true)}
                        className="btn bg-red-600 hover:bg-red-700 text-white w-full flex items-center justify-center gap-2"
                        disabled={listing.isDeleted}
                      >
                        <FiTrash2 size={18} />
                        {listing.isDeleted ? t('listing_detail.deleting') : t('listing_detail.delete_listing')}
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Safety Tips Card */}
            <div className="bg-primary-50 rounded-xl p-4 lg:p-5">
              <div className="flex items-center gap-2 text-primary-700 font-medium mb-2">
                <FiShield size={18} />
                {t('listing_detail.safety_tips')}
              </div>
              <ul className="text-sm text-primary-600 space-y-1">
                <li className="flex items-start gap-2">
                  <FiCheck size={14} className="mt-0.5 flex-shrink-0" />
                  {t('listing_detail.safety_tip_1')}
                </li>
                <li className="flex items-start gap-2">
                  <FiCheck size={14} className="mt-0.5 flex-shrink-0" />
                  {t('listing_detail.safety_tip_2')}
                </li>
                <li className="flex items-start gap-2">
                  <FiCheck size={14} className="mt-0.5 flex-shrink-0" />
                  {t('listing_detail.safety_tip_3')}
                </li>
              </ul>
            </div>

            {/* Report Button */}
            {!isOwner && (
              <button
                onClick={() => setShowReportModal(true)}
                className="flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-gray-700 w-full py-2"
              >
                <FiFlag size={14} />
                {t('listing_detail.report_listing')}
              </button>
            )}
          </div>
        </div>

        {/* Similar Listings */}
        {similarListings.length > 0 && (
          <section className="mt-10 lg:mt-16">
            <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-6">{t('listing_detail.similar_listings')}</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
              {similarListings.slice(0, 4).map((item) => (
                <ListingCard key={item._id} listing={item} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowReportModal(false)} />
          <div className="relative bg-white rounded-xl w-full max-w-md p-5 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{t('listing_detail.report_title')}</h3>
              <button onClick={() => setShowReportModal(false)} className="p-1 text-gray-400 hover:text-gray-600">
                <FiX size={20} />
              </button>
            </div>

            <p className="text-gray-600 mb-4">{t('listing_detail.report_question')}</p>

            <div className="space-y-2 mb-4">
              {[
                t('listing_detail.report_spam'),
                t('listing_detail.report_prohibited'),
                t('listing_detail.report_wrong_category'),
                t('listing_detail.report_duplicate'),
                t('listing_detail.report_fraud'),
                t('listing_detail.report_other')
              ].map((reason) => (
                <label key={reason} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:border-primary-500 transition-colors">
                  <input type="radio" name="report-reason" className="text-primary-600 focus:ring-primary-500" />
                  <span className="text-sm text-gray-700">{reason}</span>
                </label>
              ))}
            </div>

            <button
              onClick={() => {
                toast.success(t('listing_detail.report_submitted'));
                setShowReportModal(false);
              }}
              className="btn btn-primary w-full"
            >
              {t('listing_detail.submit_report')}
            </button>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">{t('listing_detail.delete_modal_title')}</h3>
            <p className="text-gray-600 mb-4">
              {t('listing_detail.delete_modal_desc')}
            </p>

            <div className="space-y-2 mb-6">
              {deleteReasons.map(reason => (
                <label key={reason.value} className="flex items-center p-3 border rounded hover:bg-gray-50 cursor-pointer">
                  <input
                    type="radio"
                    name="deleteReason"
                    value={reason.value}
                    checked={deleteReason === reason.value}
                    onChange={(e) => setDeleteReason(e.target.value)}
                    className="mr-3"
                  />
                  <span>{reason.label}</span>
                </label>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                className="flex-1 bg-red-600 text-white py-2 rounded hover:bg-red-700 disabled:opacity-50"
                disabled={!deleteReason}
              >
                {t('listing_detail.confirm_delete')}
              </button>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteReason('');
                }}
                className="flex-1 bg-gray-200 py-2 rounded hover:bg-gray-300"
              >
                {t('buttons.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ── Gallery Modal ── */}
      {galleryOpen && listing?.images?.length > 0 && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9000, backgroundColor: 'rgba(0,0,0,0.92)', display: 'flex', flexDirection: 'column' }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)', flexShrink: 0 }}>
            <span style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>
              Photos ({listing.images.length})
            </span>
            <button onClick={closeGallery} style={{ color: '#fff', background: 'none', border: 'none', cursor: 'pointer', fontSize: 28, lineHeight: 1, padding: 4 }}>×</button>
          </div>

          {/* Main preview */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', position: 'relative', minHeight: 0 }}>
            <img
              src={getImageUrl(listing.images[lightboxIndex])}
              alt=""
              onClick={() => openLightbox(lightboxIndex)}
              style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain', borderRadius: 8, cursor: 'zoom-in' }}
            />
            {listing.images.length > 1 && (
              <>
                <button onClick={() => setLightboxIndex(i => (i - 1 + listing.images.length) % listing.images.length)}
                  style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>‹</button>
                <button onClick={() => setLightboxIndex(i => (i + 1) % listing.images.length)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>›</button>
              </>
            )}
            <div style={{ position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)', color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>
              {lightboxIndex + 1} / {listing.images.length} — click image to zoom
            </div>
          </div>

          {/* Thumbnail strip */}
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.1)', flexShrink: 0 }}>
            {listing.images.map((img, i) => (
              <button key={i} onClick={() => setLightboxIndex(i)}
                style={{ flexShrink: 0, width: 64, height: 64, borderRadius: 8, overflow: 'hidden', border: i === lightboxIndex ? '2px solid #ef4444' : '2px solid transparent', padding: 0, cursor: 'pointer', background: 'none' }}>
                <img src={getImageUrl(img)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Lightbox (zoom view) ── */}
      {lightboxOpen && listing?.images?.length > 0 && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 9100, backgroundColor: '#000', display: 'flex', flexDirection: 'column' }}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', flexShrink: 0, zIndex: 2 }}>
            <button onClick={closeLightbox}
              style={{ color: '#fff', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 600 }}>
              ← Back to gallery
            </button>
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginLeft: 'auto' }}>{lightboxIndex + 1} / {listing.images.length}</span>
          </div>

          {/* Image container */}
          <div
            style={{ flex: 1, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: zoom > 1 ? 'grab' : 'zoom-in', position: 'relative' }}
            onWheel={handleWheel}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onClick={() => { if (zoom === 1) setZoom(2.5); }}
          >
            <img
              ref={imgRef}
              src={getImageUrl(listing.images[lightboxIndex])}
              alt=""
              onMouseDown={handleMouseDown}
              draggable={false}
              style={{
                maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', userSelect: 'none',
                transform: `scale(${zoom}) translate(${offset.x / zoom}px, ${offset.y / zoom}px)`,
                transition: dragging ? 'none' : 'transform 0.2s ease',
                transformOrigin: 'center',
              }}
            />
          </div>

          {/* Zoom controls + nav */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '14px 16px', flexShrink: 0 }}>
            {listing.images.length > 1 && (
              <button onClick={lbPrev}
                style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.12)', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 22, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>‹</button>
            )}
            <button onClick={() => { setZoom(z => Math.max(1, z - 0.5)); if (zoom <= 1.5) setOffset({ x: 0, y: 0 }); }}
              style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(255,255,255,0.12)', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>−</button>
            <span style={{ color: '#fff', fontSize: 13, minWidth: 40, textAlign: 'center' }}>{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoom(z => Math.min(4, z + 0.5))}
              style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(255,255,255,0.12)', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>+</button>
            {listing.images.length > 1 && (
              <button onClick={lbNext}
                style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.12)', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 22, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>›</button>
            )}
          </div>
        </div>
      )}
    </Layout>
  );
}

export async function getServerSideProps({ locale, params }) {
  const i18nProps = await getI18nProps(locale);

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    const res = await fetch(`${apiUrl}/listings/${params.id}`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.listing) {
        return {
          props: {
            ...i18nProps,
            initialListing: data.listing,
          },
        };
      }
    }
  } catch {
    // fall through to client-side fetch
  }

  return {
    props: {
      ...i18nProps,
      initialListing: null,
    },
  };
}
