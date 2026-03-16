import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  FiHeart, FiShare2, FiMapPin, FiEye, FiClock, FiChevronLeft,
  FiChevronRight, FiMessageCircle, FiPhone, FiStar, FiFlag,
  FiShield, FiCheck, FiX, FiAlertCircle, FiTrash2
} from 'react-icons/fi';
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
  const [showContactModal, setShowContactModal] = useState(false);
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');

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

    if (!message.trim()) {
      toast.error(t('listing_detail.failed_to_send'));
      return;
    }

    setIsSending(true);
    try {
      await messagesAPI.createConversation({
        listingId: id,
        sellerId: listing.seller._id,
        message: message.trim(),
      });
      toast.success(t('listing_detail.message_sent'));
      setShowContactModal(false);
      setMessage('');
      router.push('/messages');
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
            <div className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden">
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
                        onClick={prevImage}
                        className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
                      >
                        <FiChevronLeft size={20} />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
                      >
                        <FiChevronRight size={20} />
                      </button>
                      
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                        {listing.images.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`w-2 h-2 rounded-full transition-colors ${
                              index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                            }`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-gray-400">{t('listing_detail.no_image')}</span>
                </div>
              )}

              {/* Badges */}
              {listing.featured && (
                <span className="absolute top-3 left-3 badge badge-featured">{t('listing_detail.featured')}</span>
              )}
              <span className={`absolute top-3 right-3 badge ${conditionColors[listing.condition]}`}>
                {listing.condition}
              </span>
            </div>

            {/* Thumbnail Strip */}
            {listing.images && listing.images.length > 1 && (
              <div className="flex gap-2 mt-3 overflow-x-auto no-scrollbar">
                {listing.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
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

              <p className="text-2xl lg:text-3xl font-bold text-primary-600 mb-4">
                {listing.price.toLocaleString()} {t('common.egp')}
              </p>

              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <FiMapPin size={14} />
                  {listing.location?.area}, {listing.location?.city}
                </span>
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

            {/* Description - Mobile */}
            <div className="lg:hidden bg-white rounded-xl border border-gray-100 p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">{t('listing_detail.description')}</h2>
              <p className="text-gray-600 whitespace-pre-wrap">{listing.description}</p>
            </div>

            {/* Seller Card */}
            <div className="bg-white rounded-xl border border-gray-100 p-4 lg:p-5">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">{t('listing_detail.seller')}</h2>
              
              <Link href={`/user/${listing.seller._id}`} className="flex items-center gap-3 mb-4 group">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold text-lg">
                  {listing.seller.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                    {listing.seller.name}
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
                    onClick={() => setShowContactModal(true)}
                    className="btn btn-primary w-full flex items-center justify-center gap-2"
                  >
                    <FiMessageCircle size={18} />
                    {t('listing_detail.send_message')}
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

      {/* Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowContactModal(false)} />
          <div className="relative bg-white rounded-xl w-full max-w-md p-5 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{t('listing_detail.contact_seller')}</h3>
              <button onClick={() => setShowContactModal(false)} className="p-1 text-gray-400 hover:text-gray-600">
                <FiX size={20} />
              </button>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg mb-4">
              <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden relative flex-shrink-0">
                {listing.images?.[0] && (
                  <img src={getImageUrl(listing.images[0])} alt="" className="w-full h-full object-cover" />
                )}
              </div>
              <div className="min-w-0">
                <p className="font-medium text-gray-900 truncate">{listing.title}</p>
                <p className="text-primary-600 font-semibold">{listing.price.toLocaleString()} {t('common.egp')}</p>
              </div>
            </div>

            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t('listing_detail.contact_placeholder', { title: listing.title })}
              rows={4}
              className="input w-full resize-none mb-4"
            />

            <button
              onClick={handleSendMessage}
              disabled={isSending}
              className="btn btn-primary w-full disabled:opacity-50"
            >
              {isSending ? t('listing_detail.sending') : t('listing_detail.send_message')}
            </button>
          </div>
        </div>
      )}

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
