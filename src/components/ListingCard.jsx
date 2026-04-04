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

  // ── List (horizontal) layout — dubizzle style ───────────────────────────────
  if (viewMode === 'list') {
    const sellerJoinYear = listing.seller?.createdAt
      ? new Date(listing.seller.createdAt).toLocaleString('en', { month: 'long', year: 'numeric' })
      : null;

    return (
      <div className="group bg-white rounded-xl border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all overflow-hidden flex flex-row">

        {/* Left — Image */}
        <Link href={`/listing/${listing._id}`} className="relative flex-shrink-0 w-56 md:w-64 bg-gray-100 overflow-hidden">
          <Image
            src={imageUrl}
            alt={listing.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="256px"
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

        {/* Middle — Details */}
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
              <span className="flex items-center gap-1">
                <FiMapPin size={11} />
                {listing.location?.area ? `${listing.location.area}, ${listing.location?.city || 'Cairo'}` : 'Cairo'}
              </span>
              <span>•</span>
              <span>{formatDate(listing.createdAt)} ago</span>
              {listing.views > 0 && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1"><FiEye size={11} />{listing.views}</span>
                </>
              )}
            </div>

            {!listing.isDeleted && (
              <div className="flex items-center gap-2 flex-wrap">
                {sellerPhone && (
                  <a
                    href={`tel:${sellerPhone}`}
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1.5 px-4 py-1.5 border border-red-300 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors"
                  >
                    <FiPhone size={14} /> Call
                  </a>
                )}
                <Link
                  href={`/listing/${listing._id}#contact`}
                  className="flex items-center gap-1.5 px-4 py-1.5 border border-primary-300 text-primary-600 rounded-lg text-sm font-medium hover:bg-primary-50 transition-colors"
                >
                  <FiMessageCircle size={14} /> Chat
                </Link>
                {whatsappNumber && (
                  <a
                    href={`https://wa.me/${whatsappNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1.5 px-4 py-1.5 border border-green-300 text-green-600 rounded-lg text-sm font-medium hover:bg-green-50 transition-colors"
                  >
                    <WhatsAppIcon size={14} /> WhatsApp
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right — Seller info */}
        <div className="hidden md:flex flex-col items-center justify-between w-44 border-l border-gray-100 p-4 flex-shrink-0">
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
              {sellerJoinYear && (
                <p className="text-xs text-gray-400 mt-0.5">Member since {sellerJoinYear}</p>
              )}
            </div>
            {listing.seller?.verification?.status === 'approved' && (
              <span className="flex items-center gap-1 text-xs text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded-full border border-blue-200">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>
                Verified
              </span>
            )}
          </div>

          <button
            onClick={handleFavorite}
            disabled={isLoading}
            className={`mt-3 w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg border text-sm transition-all ${
              isFavorited ? 'bg-primary-600 text-white border-primary-600' : 'text-gray-400 border-gray-200 hover:text-primary-600 hover:border-primary-300'
            }`}
          >
            <FiHeart size={14} className={isFavorited ? 'fill-current' : ''} />
            {isFavorited ? 'Saved' : 'Save'}
          </button>
        </div>
      </div>
    );
  }

  // ── Grid layout (default) ───────────────────────────────────────────────────
  return (
    <div className="card group">
      <Link href={`/listing/${listing._id}`} className="block">
        <div className="relative aspect-card overflow-hidden bg-gray-100">
          <Image
            src={imageUrl}
            alt={listing.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            onError={() => setImgSrc(PLACEHOLDER_IMG)}
          />
          <div className="absolute top-2 left-2 flex flex-wrap gap-1.5">
            {listing.isDeleted ? (
              <span className="badge bg-gray-500 text-white">{t('common.sold')}</span>
            ) : listing.featured && (
              <span className="badge badge-featured">{t('common.featured')}</span>
            )}
          </div>
          <div className="absolute top-2 right-2">
            {!listing.isDeleted && (
              <span className={`badge ${conditionColors[listing.condition] || 'badge-fair'}`}>
                {listing.condition}
              </span>
            )}
          </div>
        </div>

        <div className="p-3">
          <h3 className="font-medium text-gray-900 line-clamp-2 group-hover:text-primary-600 transition-colors">
            {listing.title}
          </h3>
          <p className="text-lg font-bold text-primary-600 mt-1">
            {t('common.egp')} {listing.price?.toLocaleString()}
          </p>
          <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <FiMapPin size={12} />
              <span className="truncate max-w-[100px]">{listing.location?.area || 'Cairo'}</span>
            </div>
            <div className="flex items-center gap-3">
              {listing.views > 0 && (
                <span className="flex items-center gap-1">
                  <FiEye size={12} />
                  {listing.views}
                </span>
              )}
              <span>{formatDate(listing.createdAt)}</span>
            </div>
          </div>
        </div>
      </Link>

      {/* Action buttons + favorite for grid */}
      <div className="px-3 pb-3 flex items-center gap-1.5">
        <button
          onClick={handleFavorite}
          disabled={isLoading}
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all flex-shrink-0 border ${
            isFavorited
              ? 'bg-primary-600 text-white border-primary-600'
              : 'text-gray-400 border-gray-200 hover:text-primary-600 hover:border-primary-300'
          }`}
        >
          <FiHeart size={14} className={isFavorited ? 'fill-current' : ''} />
        </button>
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
