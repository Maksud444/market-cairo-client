import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiHeart, FiEye, FiMapPin, FiPhone, FiMessageCircle } from 'react-icons/fi';
import { format, formatDistanceToNow } from 'date-fns';
import { useTranslation } from 'next-i18next';
import { useAuthStore, useUIStore } from '../lib/store';
import { listingsAPI } from '../lib/api';
import { getImageUrl, PLACEHOLDER_IMG } from '../lib/utils';
import toast from 'react-hot-toast';

const conditionColors = {
  'New': 'badge-new',
  'Like New': 'badge-like-new',
  'Good': 'badge-good',
  'Fair': 'badge-fair',
};

// WhatsApp icon SVG
const WhatsAppIcon = ({ size = 16 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

export default function ListingCard({ listing, onFavoriteToggle, viewMode = 'grid' }) {
  const { t } = useTranslation('common');
  const { isAuthenticated, user } = useAuthStore();
  const { openLoginModal } = useUIStore();
  const [isFavorited, setIsFavorited] = useState(
    user?.favorites?.includes(listing._id) || false
  );
  const [isLoading, setIsLoading] = useState(false);
  const [imgSrc, setImgSrc] = useState(getImageUrl(listing.images?.[0]));

  const handleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      openLoginModal();
      return;
    }

    setIsLoading(true);
    try {
      const { data } = await listingsAPI.toggleFavorite(listing._id);
      if (data.success) {
        setIsFavorited(data.isFavorited);
        toast.success(data.isFavorited ? 'Added to favorites' : 'Removed from favorites');
        if (onFavoriteToggle) {
          onFavoriteToggle(listing._id, data.isFavorited);
        }
      }
    } catch (error) {
      toast.error('Failed to update favorites');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diffDays = Math.floor((now - d) / (1000 * 60 * 60 * 24));
    if (diffDays < 7) {
      return formatDistanceToNow(d, { addSuffix: false }).replace('about ', '');
    }
    return format(d, 'd MMM');
  };

  const formatWhatsApp = (phone) => {
    if (!phone) return null;
    return phone.replace(/[\s\-\(\)]/g, '').replace(/^\+/, '');
  };

  const imageUrl = imgSrc;
  const sellerPhone = listing.seller?.phone;
  const whatsappNumber = formatWhatsApp(sellerPhone);
  const locationText = listing.location?.area
    ? `${listing.location.area}${listing.location?.city ? `, ${listing.location.city}` : ''}`
    : 'Cairo';

  // ── List (horizontal) layout — Dubizzle mobile style ──────────────────────
  if (viewMode === 'list') {
    const sellerJoinYear = listing.seller?.createdAt
      ? new Date(listing.seller.createdAt).toLocaleString('en', { month: 'long', year: 'numeric' })
      : null;

    return (
      <div className="group bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-row">

        {/* Left — Image (compact on mobile, wider on desktop) */}
        <Link
          href={`/listing/${listing._id}`}
          className="relative flex-shrink-0 w-28 md:w-52 bg-gray-100 overflow-hidden"
        >
          <Image
            src={imageUrl}
            alt={listing.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 767px) 112px, 208px"
            onError={() => setImgSrc(PLACEHOLDER_IMG)}
          />
          {listing.featured && !listing.isDeleted && (
            <span className="absolute top-2 left-0 bg-yellow-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-r-full shadow">
              ★ Featured
            </span>
          )}
          {listing.isDeleted && (
            <span className="absolute top-2 left-0 bg-gray-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-r-full shadow">
              Sold
            </span>
          )}
        </Link>

        {/* Middle — Details */}
        <div className="flex-1 flex flex-col justify-between p-3 min-w-0">
          <div>
            <Link href={`/listing/${listing._id}`}>
              <h3 className="font-bold text-gray-900 text-sm md:text-base leading-snug hover:text-primary-600 transition-colors line-clamp-2">
                {listing.title}
              </h3>
            </Link>
            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              <span className="text-primary-600 font-bold text-base md:text-lg">
                {t('common.egp')} {listing.price?.toLocaleString()}
              </span>
              {listing.condition && (
                <span className={`text-[10px] md:text-xs px-1.5 py-0.5 rounded-full font-medium ${conditionColors[listing.condition] || 'badge-fair'}`}>
                  {listing.condition}
                </span>
              )}
            </div>
            {/* Description — hidden on very small screens */}
            {listing.description && (
              <p className="hidden sm:block text-gray-400 text-xs mt-1 line-clamp-1">
                {listing.description}
              </p>
            )}
          </div>

          <div className="mt-2">
            <div className="flex items-center gap-1.5 text-[11px] text-gray-400 mb-2">
              <FiMapPin size={10} />
              <span className="truncate">{locationText}</span>
              <span>•</span>
              <span>{formatDate(listing.createdAt)} ago</span>
              {listing.views > 0 && (
                <>
                  <span className="hidden sm:inline">•</span>
                  <span className="hidden sm:flex items-center gap-0.5"><FiEye size={10} />{listing.views}</span>
                </>
              )}
            </div>

            {!listing.isDeleted && (
              <div className="flex items-center gap-1.5 flex-wrap">
                {sellerPhone && (
                  <a
                    href={`tel:${sellerPhone}`}
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1 px-2.5 py-1 border border-red-300 text-red-600 rounded-lg text-[11px] md:text-sm font-medium hover:bg-red-50 transition-colors"
                  >
                    <FiPhone size={11} /> Call
                  </a>
                )}
                <Link
                  href={`/listing/${listing._id}#contact`}
                  className="flex items-center gap-1 px-2.5 py-1 border border-primary-300 text-primary-600 rounded-lg text-[11px] md:text-sm font-medium hover:bg-primary-50 transition-colors"
                >
                  <FiMessageCircle size={11} /> Chat
                </Link>
                {whatsappNumber && (
                  <a
                    href={`https://wa.me/${whatsappNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="hidden sm:flex items-center gap-1 px-2.5 py-1 border border-green-300 text-green-600 rounded-lg text-[11px] md:text-sm font-medium hover:bg-green-50 transition-colors"
                  >
                    <WhatsAppIcon size={11} /> WhatsApp
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right — Favorite + Seller info (desktop only) */}
        <div className="hidden md:flex flex-col items-center justify-between w-36 border-l border-gray-100 p-3 flex-shrink-0">
          <div className="flex flex-col items-center text-center gap-2 w-full">
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden flex-shrink-0">
              {listing.seller?.avatar ? (
                <Image src={listing.seller.avatar} alt={listing.seller?.name || ''} width={40} height={40} className="object-cover rounded-full" />
              ) : (
                <span className="text-primary-600 font-bold text-sm">
                  {(listing.seller?.name || 'U')[0].toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <p className="font-semibold text-gray-800 text-xs line-clamp-1">{listing.seller?.name || 'Seller'}</p>
              {sellerJoinYear && (
                <p className="text-[10px] text-gray-400 mt-0.5">Since {sellerJoinYear}</p>
              )}
            </div>
            {listing.seller?.verification?.status === 'approved' && (
              <span className="flex items-center gap-1 text-[10px] text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded-full border border-blue-200">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>
                Verified
              </span>
            )}
          </div>

          <button
            onClick={handleFavorite}
            disabled={isLoading}
            className={`mt-2 w-full flex items-center justify-center gap-1 py-1.5 rounded-lg border text-xs transition-all ${
              isFavorited ? 'bg-primary-600 text-white border-primary-600' : 'text-gray-400 border-gray-200 hover:text-primary-600 hover:border-primary-300'
            }`}
          >
            <FiHeart size={12} className={isFavorited ? 'fill-current' : ''} />
            {isFavorited ? 'Saved' : 'Save'}
          </button>
        </div>
      </div>
    );
  }

  // ── Grid layout — Dubizzle style ────────────────────────────────────────────
  return (
    <div className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
      {/* Image with overlaid badges + heart */}
      <Link href={`/listing/${listing._id}`} className="block">
        <div className="relative overflow-hidden bg-gray-100" style={{ aspectRatio: '4/3' }}>
          <Image
            src={imageUrl}
            alt={listing.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            onError={() => setImgSrc(PLACEHOLDER_IMG)}
          />

          {/* Top-left badge */}
          <div className="absolute top-2 left-2">
            {listing.isDeleted ? (
              <span className="badge bg-gray-500 text-white text-[10px]">{t('common.sold')}</span>
            ) : listing.featured && (
              <span className="badge badge-featured text-[10px]">★ {t('common.featured')}</span>
            )}
          </div>

          {/* Heart button — top-right overlay on mobile */}
          <button
            onClick={handleFavorite}
            disabled={isLoading}
            className={`absolute top-2 right-2 lg:hidden w-7 h-7 rounded-full flex items-center justify-center shadow-md transition-all ${
              isFavorited
                ? 'bg-primary-600 text-white'
                : 'bg-white/90 text-gray-400 hover:text-primary-600'
            }`}
          >
            <FiHeart size={13} className={isFavorited ? 'fill-current' : ''} />
          </button>
        </div>
      </Link>

      {/* Card body */}
      <Link href={`/listing/${listing._id}`} className="block p-2.5 lg:p-3">
        {/* Price row */}
        <div className="flex items-start justify-between gap-1">
          <p className="text-sm lg:text-base font-bold text-gray-900">
            {t('common.egp')} {listing.price?.toLocaleString()}
          </p>
          {/* Desktop heart */}
          <button
            onClick={handleFavorite}
            disabled={isLoading}
            className={`hidden lg:flex w-7 h-7 rounded-full items-center justify-center border transition-all flex-shrink-0 ${
              isFavorited
                ? 'bg-primary-600 text-white border-primary-600'
                : 'text-gray-400 border-gray-200 hover:text-primary-600 hover:border-primary-300'
            }`}
          >
            <FiHeart size={13} className={isFavorited ? 'fill-current' : ''} />
          </button>
        </div>

        {/* Condition badge */}
        {!listing.isDeleted && listing.condition && (
          <span className={`inline-block text-[10px] lg:text-xs px-1.5 py-0.5 rounded-full font-medium mt-1 ${conditionColors[listing.condition] || 'badge-fair'}`}>
            {listing.condition}
          </span>
        )}

        {/* Title */}
        <h3 className="text-xs lg:text-sm font-medium text-gray-700 line-clamp-2 mt-1 group-hover:text-primary-600 transition-colors leading-snug">
          {listing.title}
        </h3>

        {/* Location + time */}
        <div className="flex items-center justify-between mt-1.5 text-[10px] lg:text-xs text-gray-400">
          <span className="flex items-center gap-0.5 truncate">
            <FiMapPin size={10} />
            <span className="truncate max-w-[90px]">{listing.location?.area || 'Cairo'}</span>
          </span>
          <span className="flex-shrink-0">{formatDate(listing.createdAt)}</span>
        </div>
      </Link>

      {/* Desktop-only action buttons */}
      <div className="hidden lg:flex px-3 pb-3 items-center gap-1.5">
        {!listing.isDeleted && (
          <>
            {sellerPhone && (
              <a
                href={`tel:${sellerPhone}`}
                className="flex items-center justify-center w-9 h-9 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                title="Call"
              >
                <FiPhone size={17} />
              </a>
            )}
            <Link
              href={`/listing/${listing._id}#contact`}
              className="flex items-center justify-center w-9 h-9 bg-primary-50 text-primary-600 border border-primary-200 rounded-lg hover:bg-primary-100 transition-colors"
              title="Chat"
            >
              <FiMessageCircle size={17} />
            </Link>
            {whatsappNumber && (
              <a
                href={`https://wa.me/${whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-9 h-9 bg-green-50 text-green-600 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
                title="WhatsApp"
              >
                <WhatsAppIcon size={17} />
              </a>
            )}
          </>
        )}
      </div>
    </div>
  );
}
