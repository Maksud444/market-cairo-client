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
    if (!isAuthenticated) { openLoginModal(); return; }
    setIsLoading(true);
    try {
      const { data } = await listingsAPI.toggleFavorite(listing._id);
      if (data.success) {
        setIsFavorited(data.isFavorited);
        toast.success(data.isFavorited ? 'Added to favorites' : 'Removed from favorites');
        if (onFavoriteToggle) onFavoriteToggle(listing._id, data.isFavorited);
      }
    } catch { toast.error('Failed to update favorites'); }
    finally { setIsLoading(false); }
  };

  const formatDate = (date) => {
    const d = new Date(date);
    const diffDays = Math.floor((new Date() - d) / (1000 * 60 * 60 * 24));
    if (diffDays < 7) return formatDistanceToNow(d, { addSuffix: false }).replace('about ', '');
    return format(d, 'd MMM yyyy');
  };

  const formatWhatsApp = (phone) =>
    phone ? phone.replace(/[\s\-\(\)]/g, '').replace(/^\+/, '') : null;

  const sellerPhone = listing.seller?.phone;
  const whatsappNumber = formatWhatsApp(sellerPhone);
  const locationText = listing.location?.area
    ? `${listing.location.area}${listing.location?.city ? `, ${listing.location.city}` : ''}`
    : 'Cairo';

  // ─────────────────────────────────────────────────────────────────────────────
  // GRID CARD — Dubizzle style: image top, price+heart row, title, location+time
  // Used in: home page slider, desktop search grid
  // NO action buttons — tap card to see details
  // ─────────────────────────────────────────────────────────────────────────────
  if (viewMode === 'grid') {
    return (
      <div className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow group w-full">
        {/* Image */}
        <Link href={`/listing/${listing._id}`} className="block">
          <div className="relative overflow-hidden bg-gray-100" style={{ aspectRatio: '4/3' }}>
            <Image
              src={imgSrc}
              alt={listing.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 50vw, 25vw"
              onError={() => setImgSrc(PLACEHOLDER_IMG)}
            />
            {listing.isDeleted ? (
              <span className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-600 text-white">
                {t('common.sold')}
              </span>
            ) : listing.featured && (
              <span className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-yellow-500 text-white">
                ★ {t('common.featured')}
              </span>
            )}
          </div>
        </Link>

        {/* Info */}
        <div className="p-2.5">
          {/* Price + Heart */}
          <div className="flex items-center justify-between gap-1">
            <p className="font-bold text-gray-900 text-sm leading-tight">
              {t('common.egp')} {listing.price?.toLocaleString()}
            </p>
            <button
              onClick={handleFavorite}
              disabled={isLoading}
              className={`w-7 h-7 flex-shrink-0 flex items-center justify-center rounded-full border transition-all ${
                isFavorited
                  ? 'bg-primary-600 text-white border-primary-600'
                  : 'border-gray-200 text-gray-400 hover:text-primary-600 hover:border-primary-300'
              }`}
            >
              <FiHeart size={13} className={isFavorited ? 'fill-current' : ''} />
            </button>
          </div>

          {/* Title */}
          <Link href={`/listing/${listing._id}`}>
            <h3 className="text-xs text-gray-700 line-clamp-2 mt-1 leading-snug group-hover:text-primary-600 transition-colors">
              {listing.title}
            </h3>
          </Link>

          {/* Condition badge */}
          {!listing.isDeleted && listing.condition && (
            <span className={`inline-block text-[10px] px-1.5 py-0.5 rounded-full font-medium mt-1 ${conditionColors[listing.condition] || 'badge-fair'}`}>
              {listing.condition}
            </span>
          )}

          {/* Location + time */}
          <div className="flex items-center justify-between mt-1.5 text-[10px] text-gray-400">
            <span className="flex items-center gap-0.5 truncate">
              <FiMapPin size={9} />
              <span className="truncate max-w-[80px]">{listing.location?.area || 'Cairo'}</span>
            </span>
            <span className="flex-shrink-0">{formatDate(listing.createdAt)}</span>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // LIST CARD — two sub-layouts controlled by CSS breakpoint:
  //   Mobile  (< lg): image full-width top → price/condition/title/location/date → WA+Call+Chat buttons
  //   Desktop (≥ lg): original horizontal card (image left, details right, seller right)
  // ─────────────────────────────────────────────────────────────────────────────

  const sellerJoinYear = listing.seller?.createdAt
    ? new Date(listing.seller.createdAt).toLocaleString('en', { month: 'long', year: 'numeric' })
    : null;

  return (
    <>
      {/* ── MOBILE vertical card ─────────────────────────────────────── */}
      <div className="lg:hidden bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm group">

        {/* Image — full width */}
        <Link href={`/listing/${listing._id}`} className="block">
          <div className="relative w-full overflow-hidden bg-gray-100" style={{ aspectRatio: '16/9' }}>
            <Image
              src={imgSrc}
              alt={listing.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="100vw"
              onError={() => setImgSrc(PLACEHOLDER_IMG)}
            />
            {listing.isDeleted ? (
              <span className="absolute top-2 left-0 bg-gray-600 text-white text-xs font-bold px-2 py-0.5 rounded-r-full">
                Sold
              </span>
            ) : listing.featured && (
              <span className="absolute top-2 left-0 bg-yellow-500 text-white text-xs font-bold px-2 py-0.5 rounded-r-full">
                ★ Featured
              </span>
            )}
            {/* Favorite button on image */}
            <button
              onClick={handleFavorite}
              disabled={isLoading}
              className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-all ${
                isFavorited ? 'bg-primary-600 text-white' : 'bg-white/90 text-gray-400 hover:text-primary-600'
              }`}
            >
              <FiHeart size={15} className={isFavorited ? 'fill-current' : ''} />
            </button>
          </div>
        </Link>

        {/* Details */}
        <Link href={`/listing/${listing._id}`} className="block p-3">
          {/* Price */}
          <p className="text-lg font-bold text-primary-600">
            {t('common.egp')} {listing.price?.toLocaleString()}
          </p>

          {/* Condition */}
          {!listing.isDeleted && listing.condition && (
            <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium mt-1 ${conditionColors[listing.condition] || 'badge-fair'}`}>
              {listing.condition}
            </span>
          )}

          {/* Title */}
          <h3 className="font-bold text-gray-900 text-sm mt-1.5 line-clamp-2 leading-snug group-hover:text-primary-600 transition-colors">
            {listing.title}
          </h3>

          {/* Location + date */}
          <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <FiMapPin size={11} />
              {locationText}
            </span>
            <span>•</span>
            <span>{formatDate(listing.createdAt)}</span>
            {listing.views > 0 && (
              <>
                <span>•</span>
                <span className="flex items-center gap-0.5"><FiEye size={10} />{listing.views}</span>
              </>
            )}
          </div>
        </Link>

        {/* Action buttons — full width row at bottom */}
        {!listing.isDeleted && (
          <div className="flex border-t border-gray-100">
            {whatsappNumber && (
              <a
                href={`https://wa.me/${whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex-1 flex items-center justify-center gap-1.5 py-3 text-green-600 font-semibold text-sm hover:bg-green-50 transition-colors border-r border-gray-100"
              >
                <WhatsAppIcon size={16} />
                <span>WhatsApp</span>
              </a>
            )}
            {sellerPhone && (
              <a
                href={`tel:${sellerPhone}`}
                onClick={(e) => e.stopPropagation()}
                className="flex-1 flex items-center justify-center gap-1.5 py-3 text-red-600 font-semibold text-sm hover:bg-red-50 transition-colors border-r border-gray-100"
              >
                <FiPhone size={16} />
                <span>Call</span>
              </a>
            )}
            <Link
              href={`/listing/${listing._id}#contact`}
              className="flex-1 flex items-center justify-center gap-1.5 py-3 text-primary-600 font-semibold text-sm hover:bg-primary-50 transition-colors"
            >
              <FiMessageCircle size={16} />
              <span>Chat</span>
            </Link>
          </div>
        )}
      </div>

      {/* ── DESKTOP horizontal card ──────────────────────────────────── */}
      <div className="hidden lg:flex bg-white rounded-xl border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all overflow-hidden group">

        {/* Image */}
        <Link href={`/listing/${listing._id}`} className="relative flex-shrink-0 w-52 bg-gray-100 overflow-hidden">
          <Image
            src={imgSrc}
            alt={listing.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="208px"
            onError={() => setImgSrc(PLACEHOLDER_IMG)}
          />
          {listing.featured && !listing.isDeleted && (
            <span className="absolute top-2 left-0 bg-yellow-500 text-white text-xs font-bold px-2 py-0.5 rounded-r-full shadow">
              ★ Featured
            </span>
          )}
          {listing.isDeleted && (
            <span className="absolute top-2 left-0 bg-gray-600 text-white text-xs font-bold px-2 py-0.5 rounded-r-full shadow">
              Sold
            </span>
          )}
        </Link>

        {/* Middle — details */}
        <div className="flex-1 flex flex-col justify-between p-4 min-w-0">
          <div>
            <Link href={`/listing/${listing._id}`}>
              <h3 className="font-bold text-gray-900 text-lg leading-snug hover:text-primary-600 transition-colors line-clamp-2">
                {listing.title}
              </h3>
            </Link>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="text-primary-600 font-bold text-xl">
                {t('common.egp')} {listing.price?.toLocaleString()}
              </span>
              {listing.condition && (
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${conditionColors[listing.condition] || 'badge-fair'}`}>
                  {listing.condition}
                </span>
              )}
            </div>
            {listing.description && (
              <p className="text-gray-500 text-sm mt-2 line-clamp-2 leading-relaxed">
                {listing.description}
              </p>
            )}
          </div>

          <div className="mt-3">
            <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
              <span className="flex items-center gap-1"><FiMapPin size={11} />{locationText}</span>
              <span>•</span>
              <span>{formatDate(listing.createdAt)}</span>
              {listing.views > 0 && (
                <><span>•</span><span className="flex items-center gap-1"><FiEye size={11} />{listing.views}</span></>
              )}
            </div>

            {!listing.isDeleted && (
              <div className="flex items-center gap-2 flex-wrap">
                {sellerPhone && (
                  <a href={`tel:${sellerPhone}`} onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1.5 px-4 py-1.5 border border-red-300 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors">
                    <FiPhone size={14} /> Call
                  </a>
                )}
                <Link href={`/listing/${listing._id}#contact`}
                  className="flex items-center gap-1.5 px-4 py-1.5 border border-primary-300 text-primary-600 rounded-lg text-sm font-medium hover:bg-primary-50 transition-colors">
                  <FiMessageCircle size={14} /> Chat
                </Link>
                {whatsappNumber && (
                  <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1.5 px-4 py-1.5 border border-green-300 text-green-600 rounded-lg text-sm font-medium hover:bg-green-50 transition-colors">
                    <WhatsAppIcon size={14} /> WhatsApp
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right — seller info */}
        <div className="hidden xl:flex flex-col items-center justify-between w-44 border-l border-gray-100 p-4 flex-shrink-0">
          <div className="flex flex-col items-center text-center gap-2 w-full">
            <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden flex-shrink-0">
              {listing.seller?.avatar ? (
                <Image src={listing.seller.avatar} alt={listing.seller?.name || ''} width={48} height={48} className="object-cover rounded-full" />
              ) : (
                <span className="text-primary-600 font-bold text-lg">
                  {(listing.seller?.name || 'U')[0].toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <p className="font-semibold text-gray-800 text-sm line-clamp-1">{listing.seller?.name || 'Seller'}</p>
              {sellerJoinYear && <p className="text-xs text-gray-400 mt-0.5">Member since {sellerJoinYear}</p>}
            </div>
            {listing.seller?.verification?.status === 'approved' && (
              <span className="flex items-center gap-1 text-xs text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded-full border border-blue-200">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>
                Verified
              </span>
            )}
          </div>
          <button onClick={handleFavorite} disabled={isLoading}
            className={`mt-3 w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg border text-sm transition-all ${
              isFavorited ? 'bg-primary-600 text-white border-primary-600' : 'text-gray-400 border-gray-200 hover:text-primary-600 hover:border-primary-300'
            }`}>
            <FiHeart size={14} className={isFavorited ? 'fill-current' : ''} />
            {isFavorited ? 'Saved' : 'Save'}
          </button>
        </div>
      </div>
    </>
  );
}
